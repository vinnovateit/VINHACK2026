import { redirect } from "next/navigation";
import { getOrCreateEligibleUser } from "./participant-eligibility";

type ParticipantType = "vit" | "external";

export type CurrentParticipant = {
  id: string;
  name: string;
  type: ParticipantType;
  teamId: string | null;
  userId: string | null;
  year?: number | null;
};

// Identity comes only from the signed NextAuth session; the old unsigned test_session cookie let
// anyone impersonate a participant by setting "vit:<id>".
export async function getCurrentParticipant(): Promise<CurrentParticipant | null> {
  // Also check NextAuth authenticated session
  try {
    const { resolveCurrentParticipant } = await import("@/app/onboarding/actions");
    const participant = await resolveCurrentParticipant();
    if (participant) {
      return {
        id: participant.id,
        name: participant.name,
        type: participant.type,
        teamId: participant.teamId || null,
        userId: participant.userId || null,
        year: participant.year || null,
      };
    }
  } catch (err) {
    console.warn("[getCurrentParticipant] Error querying NextAuth participant:", err);
  }

  return null;
}

export async function requireParticipant() {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");
  try {
    const userId = await getOrCreateEligibleUser(participant.type, participant.id);
    return { ...participant, userId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Participant eligibility could not be verified.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
}

export async function requireTeamlessParticipant() {
  const participant = await requireParticipant();
  if (participant.teamId) redirect("/test-dashboard/dashboard");
  return participant;
}

export async function requireTeamedParticipant() {
  const participant = await requireParticipant();
  if (!participant.teamId) redirect("/test-dashboard/create-team");
  return participant;
}

