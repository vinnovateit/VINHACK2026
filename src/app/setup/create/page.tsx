import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createTeamForUser, getUserByEmail } from "@/lib/setup-store";

async function createTeamAction(formData: FormData) {
  "use server";

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/setup/login");
  }

  const teamName = String(formData.get("teamName") ?? "").trim();

  if (!teamName) {
    throw new Error("Team name is required.");
  }

  try {
    const team = createTeamForUser({ email, teamName });
    redirect(`/setup/create?success=${encodeURIComponent(team.code)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create team.";
    redirect(`/setup/create?error=${encodeURIComponent(message)}`);
  }
}

export default async function SetupCreatePage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/setup/login");
  }

  const user = getUserByEmail(session.user.email);
  const successCode = resolvedParams.success;
  const errorMessage = resolvedParams.error;

  return (
    <main className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#74d4f0]">Create team</p>
        <h1 className="font-rotonto text-4xl text-white">Start your VinHack squad</h1>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
          {decodeURIComponent(errorMessage)}
        </div>
      ) : null}

      {successCode ? (
        <div className="rounded-xl border border-[#bfea88]/40 bg-[#bfea88]/10 p-4 text-sm text-[#dfffc7]">
          Team created successfully. Your join code is <span className="font-bold">{successCode}</span>.
        </div>
      ) : null}

      <form action={createTeamAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="teamName" className="block text-sm text-white/75">
            Team name
          </label>
          <input
            id="teamName"
            name="teamName"
            placeholder="e.g. Byte Benders"
            className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none ring-0 transition placeholder:text-white/35 focus:border-[#74d4f0]"
            required
            minLength={3}
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#bfea88] px-5 py-3 text-sm font-semibold text-[#0d0d0d] transition hover:bg-[#d3ff9f]"
        >
          Create team
        </button>
      </form>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/60">
        <span>{user?.email ?? session.user.email}</span>
        <a href="/setup/team" className="text-[#74d4f0] hover:underline">
          Back to team choice
        </a>
      </div>
    </main>
  );
}
