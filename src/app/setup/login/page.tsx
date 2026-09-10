import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/components/setup/GoogleLoginButton";

export default async function SetupLoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/setup/team");
  }

  return (
    <main className="space-y-6">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#74d4f0]">VinHack 2026</p>
        <h1 className="font-rotonto text-4xl text-white md:text-5xl">Register</h1>
        <p className="text-sm text-white/70">
          Sign in with your Google account to continue to the team setup flow.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
        <GoogleLoginButton />
      </div>

      <div className="space-y-2 rounded-2xl border border-[#74d4f0]/20 bg-[#74d4f0]/5 p-4 text-sm text-white/70">
        <p>Only Google sign-in is supported for participant registration.</p>
        <p>After login, you’ll choose to create a team or join one with a team code.</p>
      </div>
    </main>
  );
}
