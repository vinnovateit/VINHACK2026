import ParticipantPage from "@/components/dashboard/ParticipantPage";

export const metadata = { title: "Timeline | VinHack 2026", description: "The VinHack 2026 event timeline." };

export default function TimelinePage() {
  return <ParticipantPage kind="timeline" />;
}
