import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import { fetchFullTeam } from "./actions";
import DashboardShell from "@/components/dashboard/DashboardShell";
import "./dashboard.css";

export const metadata = {
  title: "Dashboard | VinHack 2026",
  description: "Participant workspace and event operations dashboard.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ track?: string }>;
}) {
  const params = await searchParams;

  // 1. Resolve participant from session (Google OAuth or verified test session)
  const participant = await resolveCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  // 2. Ensure participant has formed or joined a team
  if (!participant.teamId) {
    redirect("/onboarding?step=team-type");
  }

  // 3. Fetch live team data with members, leader, and submission
  const team = await fetchFullTeam(participant.teamId);

  if (!team) {
    redirect("/onboarding?step=team-type");
  }

  const isLeader = Boolean(
    (team.leaderId && participant.userId && team.leaderId === participant.userId) ||
      (team.members.length > 0 && team.members[0].id === participant.id)
  );

  return (
    <DashboardShell
      participant={{
        id: participant.id,
        name: participant.name,
        email: participant.email || "",
        type: participant.type,
        regNo: participant.regNo,
        isLeader,
      }}
      team={team}
      initialTrack={params?.track}
    />
  );
}