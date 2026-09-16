import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import { fetchFullTeam } from "@/lib/teams";
import ProfileClient from "@/components/dashboard/ProfileClient";

export const metadata = {
  title: "Profile | VinHack 2026",
  description: "Manage your VinHack 2026 participant profile and workspace preferences.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const participant = await resolveCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  let teamName = "No Team Assigned";
  if (participant.teamId) {
    const team = await fetchFullTeam(participant.teamId);
    if (team?.name) {
      teamName = team.name;
    }
  }

  return (
    <ProfileClient
      participant={{
        id: participant.id,
        name: participant.name,
        email: participant.email || "",
        type: participant.type,
        regNo: participant.regNo,
        year: participant.year,
        collegeName: participant.collegeName,
        isHosteller: participant.isHosteller,
        hostelBlock: participant.hostelBlock,
        roomNo: participant.roomNo,
      }}
      teamName={teamName}
    />
  );
}
