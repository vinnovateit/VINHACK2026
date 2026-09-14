import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import LoginDesktopPlate from "@/components/login/LoginDesktopPlate";
import LoginMobile from "@/components/login/LoginMobile";

export const metadata: Metadata = {
  title: "Login — VinHack 2026",
  description: "Sign in with Google to access your VinHack 2026 participant portal.",
};

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Access denied: No registered or paid participant record found for this Google account. Please use your registered email.",
  OAuthSignin: "Failed to initiate sign-in with Google. Please try again.",
  OAuthCallback: "Sign-in verification failed. Please try again.",
  Default: "An error occurred during sign-in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();

  // If already authenticated, redirect to the dashboard
  if (session?.user) {
    redirect("/test-dashboard");
  }

  const params = await searchParams;
  const rawError = params?.error;
  const errorMessage = rawError
    ? ERROR_MESSAGES[rawError] || ERROR_MESSAGES.Default
    : null;

  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/test-dashboard" });
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Desktop Canvas Layout (>= md) */}
      <div className="hidden md:flex min-h-screen w-full items-center justify-center overflow-x-clip bg-black">
        <div className="canvas-frame hero-frame">
          <div className="canvas-plate bg-black">
            <LoginDesktopPlate
              signInAction={handleGoogleSignIn}
              errorMessage={errorMessage}
            />
          </div>
        </div>
      </div>

      {/* Mobile Reflow Layout (< md) */}
      <div className="block md:hidden">
        <LoginMobile
          signInAction={handleGoogleSignIn}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
