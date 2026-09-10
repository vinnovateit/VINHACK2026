"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOOGLE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
);

export function GoogleLoginButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isReady = GOOGLE_ENABLED && !disabled;

  const handleLogin = async () => {
    if (!isReady) return;

    setIsLoading(true);

    const response = await fetch("/api/setup/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "member@gmail.com",
        name: "Google Member",
      }),
    });

    if (response.ok) {
      router.push("/setup/team");
      return;
    }

    setIsLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleLogin}
        disabled={!isReady || isLoading}
        className="inline-flex w-full items-center justify-center rounded-full border border-[#74d4f0] bg-[#74d4f0] px-5 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#9fe7ff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Connecting to Google..." : isReady ? "Continue with Google" : "Google OAuth credentials pending"}
      </button>

      {!isReady ? (
        <p className="mt-3 text-center text-xs text-white/60">
          Add your Google OAuth client credentials to enable sign-in.
        </p>
      ) : null}
    </>
  );
}
