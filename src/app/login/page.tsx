import { Suspense } from "react";
import LoginPage from "@/components/login/LoginPage";

export const metadata = {
  title: "Login - VinHack 2026",
  description: "Good ideas start with the right people. Sign in to access your hackathon registration and dashboard.",
};

export default function Page() {
  const hasGoogleCredentials = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );

  return (
    <main className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-black">
      <Suspense fallback={<div className="h-full w-full bg-black" />}>
        <LoginPage hasGoogleCredentials={hasGoogleCredentials} />
      </Suspense>
    </main>
  );
}

