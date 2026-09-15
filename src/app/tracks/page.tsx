import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import ParticipantPage from "@/components/dashboard/ParticipantPage";

export const metadata = { title: "Tracks | VinHack 2026", description: "Choose a VinHack 2026 challenge track." };

export const dynamic = "force-dynamic";

export default async function TracksPage() {
  const participant = await resolveCurrentParticipant();
  if (!participant) {
    redirect("/login");
  }

  return <ParticipantPage kind="tracks" />;
}
