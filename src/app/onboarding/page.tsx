import { Suspense } from "react";
import { resolveCurrentParticipant } from "./actions";
import OnboardingWizard from "./OnboardingWizard";

export const metadata = {
  title: "VinHack 2026 - Onboarding & Registration",
  description: "Complete your check-in, assemble your team, and access the hackathon dashboard.",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; code?: string; type?: string }>;
}) {
  let params: { step?: string; code?: string; type?: string } = {};
  try {
    params = (await searchParams) || {};
  } catch (paramErr) {
    console.warn("[OnboardingPage] Could not read searchParams:", paramErr);
  }

  let participant = null;
  try {
    participant = await resolveCurrentParticipant();
  } catch (err) {
    console.warn("[OnboardingPage] resolveCurrentParticipant caught error:", err);
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] bg-black text-white overflow-hidden">
      <Suspense fallback={<div className="h-[100dvh] bg-black flex items-center justify-center text-neutral-500 font-mono">LOADING ONBOARDING...</div>}>
        <OnboardingWizard
          initialParticipant={participant}
          initialStep={params.step}
          initialCode={params.code}
        />
      </Suspense>
    </main>
  );
}
