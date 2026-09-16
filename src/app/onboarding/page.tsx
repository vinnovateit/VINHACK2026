import { Suspense } from "react";
import { redirect } from "next/navigation";
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

  let participant = await resolveCurrentParticipant();

  if (!participant && process.env.NODE_ENV === "development") {
    participant = {
      id: "dev-preview-user",
      name: "VinHack Builder",
      type: "vit",
      regNo: "22BCE1001",
      teamId: null,
      userId: "dev-preview-user",
      email: "builder@vinhack.com",
    };
  } else if (!participant) {
    redirect("/login");
  }

  // If the participant already has a team, send them straight to the dashboard
  // unless they're explicitly navigating to a specific onboarding step (e.g. via
  // a shared join-team link with ?step=join-team&code=VH26-XXXX).
  const explicitStep = params.step;
  const isOnboardingStep = explicitStep === "join-team" || explicitStep === "create-team";
  if (participant.teamId && !isOnboardingStep) {
    redirect("/dashboard");
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
