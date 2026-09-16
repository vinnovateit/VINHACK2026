import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import { fetchFullTeam } from "@/lib/teams";
import DashboardShell from "@/components/dashboard/DashboardShell";

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

  const isLeader = team.members.some((m) => m.isLeader && m.id === participant.id);

  // Send the browser only what the dashboard shows: teammates' emails are needed for the leader's
  // "Kick member" list; nobody needs other members' registration numbers.
  const clientTeam = {
    ...team,
    members: team.members.map((m) => ({
      id: m.id,
      name: m.name,
      email: isLeader ? m.email : "",
      type: m.type,
      isLeader: m.isLeader,
    })),
  };

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
      team={clientTeam}
      initialTrack={params?.track}
    />
  );
}