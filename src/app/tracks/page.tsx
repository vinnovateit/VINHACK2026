import ParticipantPage from "@/components/dashboard/ParticipantPage";

export const metadata = { title: "Tracks | VinHack 2026", description: "Choose a VinHack 2026 challenge track." };

export default function TracksPage() {
  return <ParticipantPage kind="tracks" />;
}
