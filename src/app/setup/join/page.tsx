import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { joinTeamByCode, getUserByEmail } from "@/lib/setup-store";

async function joinTeamAction(formData: FormData) {
  "use server";

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/setup/login");
  }

  const code = String(formData.get("teamCode") ?? "").trim();

  if (!code) {
    throw new Error("Team code is required.");
  }

  try {
    const team = joinTeamByCode({ email, code });
    redirect(`/setup/join?success=${encodeURIComponent(team.name)}&code=${encodeURIComponent(team.code)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to join team.";
    redirect(`/setup/join?error=${encodeURIComponent(message)}`);
  }
}

export default async function SetupJoinPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; code?: string; error?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/setup/login");
  }

  const user = getUserByEmail(session.user.email);
  const successMessage = resolvedParams.success;
  const successCode = resolvedParams.code;
  const errorMessage = resolvedParams.error;

  return (
    <main className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#bfea88]">Join team</p>
        <h1 className="font-rotonto text-4xl text-white">Enter your team code</h1>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
          {decodeURIComponent(errorMessage)}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-[#bfea88]/40 bg-[#bfea88]/10 p-4 text-sm text-[#dfffc7]">
          You joined <span className="font-bold">{decodeURIComponent(successMessage)}</span>
          {successCode ? <> with code <span className="font-bold">{decodeURIComponent(successCode)}</span></> : null}.
        </div>
      ) : null}

      <form action={joinTeamAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="teamCode" className="block text-sm text-white/75">
            Team code
          </label>
          <input
            id="teamCode"
            name="teamCode"
            placeholder="e.g. ABC123"
            className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none ring-0 transition placeholder:text-white/35 focus:border-[#bfea88] uppercase"
            required
            maxLength={8}
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#74d4f0] px-5 py-3 text-sm font-semibold text-[#071018] transition hover:bg-[#98e0ff]"
        >
          Join team
        </button>
      </form>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/60">
        <span>{user?.email ?? session.user.email}</span>
        <a href="/setup/team" className="text-[#bfea88] hover:underline">
          Back to team choice
        </a>
      </div>
    </main>
  );
}
