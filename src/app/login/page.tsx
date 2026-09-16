import { Suspense } from "react";
import LoginPage from "@/components/login/LoginPage";

export const dynamic = "force-static";

export const metadata = {
  title: "Login - VinHack 2026",
  description: "Good ideas start with the right people. Sign in to access your hackathon registration and dashboard.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
        <LoginPage />
      </Suspense>
    </main>
  );
}

