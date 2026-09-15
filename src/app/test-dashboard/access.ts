import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateEligibleUser } from "./participant-eligibility";

export const TEST_SESSION_COOKIE = "test_session";

type ParticipantType = "vit" | "external";

export type CurrentParticipant = {
  id: string;
  name: string;
  type: ParticipantType;
  teamId: string | null;
  userId: string | null;
};

export async function getCurrentParticipant(): Promise<CurrentParticipant | null> {
  const session = (await cookies()).get(TEST_SESSION_COOKIE)?.value;
  if (session) {
    const [type, id] = session.split(":");
    if ((type === "vit" || type === "external") && id) {
      try {
        if (type === "vit") {
          const student = await prisma.vITStudent.findUnique({ where: { id }, select: { id: true, name: true, teamId: true, userId: true } });
          if (student) return { ...student, type };
        } else {
          const student = await prisma.externalStudent.findUnique({ where: { id }, select: { id: true, name: true, teamId: true, userId: true } });
          if (student) return { ...student, type };
        }
      } catch (err) {
        console.warn("[getCurrentParticipant] Error querying DB:", err);
      }
    }
  }

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

