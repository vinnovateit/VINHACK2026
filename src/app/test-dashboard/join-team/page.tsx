import { redirect } from "next/navigation";
import { requireParticipant } from "../access";
import { joinTeamByCode, TeamMembershipError } from "../team-membership";
import { isValidTeamCode } from "../validation";

async function joinTeam(formData: FormData) {
  "use server";

  const teamCode = String(formData.get("teamCode") ?? "").trim().toUpperCase();
  const participant = await requireParticipant();

  if (!isValidTeamCode(teamCode)) {
    redirect("/test-dashboard/join-team?error=Please enter a team code in the format VH26-XXXX");
  }

  let result: Awaited<ReturnType<typeof joinTeamByCode>>;
  try {
    result = await joinTeamByCode({ ...participant, currentTeamId: participant.teamId }, teamCode);
  } catch (error) {
    const message = error instanceof TeamMembershipError ? error.message : "Unable to join team.";
    redirect(`/test-dashboard/join-team?error=${encodeURIComponent(message)}&code=${encodeURIComponent(teamCode)}`);
  }

  if (result.status === "already-member") {
    redirect("/test-dashboard/dashboard?message=You are already in this team.");
  }
  if (result.status === "switched") {
    redirect("/test-dashboard/dashboard?success=You switched teams successfully.");
  }

  redirect("/test-dashboard/dashboard");
}

export default async function JoinTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; code?: string }>;
}) {
  const participant = await requireParticipant();
  const params = await searchParams;
  const initialCode = params?.code ?? "";

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Join Team</h1>
          </div>
          <a href="/test-dashboard" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-cyan-500">
            Back to dashboard
          </a>
        </div>

        {params?.success && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {params.success}
          </div>
        )}
        {params?.error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {params.error}
          </div>
        )}
        {params?.message && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-200">
            {params.message}
          </div>
        )}

        <form action={joinTeam} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div>
            <p className="mb-2 text-sm text-slate-300">Joining as</p>
            <p className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              {participant.name} ({participant.type === "vit" ? "VIT" : "External"})
            </p>
            <label className="mb-2 mt-4 block text-sm text-slate-300">Team code</label>
            <input
              name="teamCode"
              defaultValue={initialCode}
              required
              placeholder="e.g. VH26-2522"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 uppercase tracking-widest outline-none focus:border-cyan-500"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Join team
            </button>
            <a href="/test-dashboard/create-team" className="text-sm text-cyan-300 hover:text-cyan-200">
              Create a new team →
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
