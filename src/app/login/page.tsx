import { Suspense } from "react";
import { redirect } from "next/navigation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import LoginPage from "@/components/login/LoginPage";

export const metadata = {
  title: "Login - VinHack 2026",
  description: "Good ideas start with the right people. Sign in to access your hackathon registration and dashboard.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const participant = await resolveCurrentParticipant();
  if (participant) {
    redirect(participant.teamId ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-black">
      <Suspense fallback={<div className="h-full w-full bg-black" />}>
        <LoginPage />
      </Suspense>
    </main>
  );
}
