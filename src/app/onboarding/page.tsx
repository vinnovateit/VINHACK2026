import { Suspense } from "react";
import { resolveCurrentParticipant } from "./actions";
import OnboardingWizard from "./OnboardingWizard";

export const metadata = {
  title: "VinHack 2026 - Onboarding & Registration",
  description: "Complete your check-in, assemble your team, and access the hackathon dashboard.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; code?: string; type?: string }>;
}) {
  const params = await searchParams;
  const participant = await resolveCurrentParticipant();

  return (
    <main className="min-h-screen bg-black text-white">
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-neutral-500 font-mono">LOADING ONBOARDING...</div>}>
        <OnboardingWizard
          initialParticipant={participant}
          initialStep={params.step}
          initialCode={params.code}
        />
      </Suspense>
    </main>
  );
}
