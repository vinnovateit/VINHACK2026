import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import ParticipantPage from "@/components/dashboard/ParticipantPage";

export const metadata = { title: "Help | VinHack 2026", description: "Participant support for VinHack 2026." };

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const participant = await resolveCurrentParticipant();
  if (!participant) {
    redirect("/login");
  }

  return <ParticipantPage kind="help" />;
}
