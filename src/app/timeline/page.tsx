import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import ParticipantPage from "@/components/dashboard/ParticipantPage";

export const metadata = { title: "Timeline | VinHack 2026", description: "The VinHack 2026 event timeline." };

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const participant = await resolveCurrentParticipant();
  if (!participant) {
    redirect("/login");
  }

  return <ParticipantPage kind="timeline" />;
}
