import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireTeamlessParticipant } from "../access";

async function joinTeam(formData: FormData) {
  "use server";

  const teamCode = String(formData.get("teamCode") ?? "").trim();
  const participant = await requireTeamlessParticipant();

  if (!teamCode) {
    redirect("/test-dashboard/join-team?error=Please enter a team code");
  }

  const team = await prisma.team.findUnique({
    where: { code: teamCode },
    include: { vitStudents: true, externalStudents: true },
  });

  if (!team) {
    redirect("/test-dashboard/join-team?error=Team not found");
  }

  const memberCount = team.vitStudents.length + team.externalStudents.length;
  if (memberCount >= team.capacity) {
    redirect(`/test-dashboard/join-team?error=Team is at capacity (${team.capacity})`);
  }

  const selectedType = participant.type === "vit" ? "VIT" : "EXTERNAL";
  if (selectedType !== team.teamType) {
    redirect(`/test-dashboard/join-team?error=Type mismatch: ${selectedType} participants cannot join a ${team.teamType} team`);
  }

  if (participant.type === "vit") {
    await prisma.vITStudent.update({
      where: { id: participant.id },
      data: { teamId: team.id },
    });
  } else {
    await prisma.externalStudent.update({
      where: { id: participant.id },
      data: { teamId: team.id },
    });
  }

  redirect(`/test-dashboard/dashboard?success=Joined team ${team.name} successfully`);
}

export default async function JoinTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const participant = await requireTeamlessParticipant();
  const params = await searchParams;
  const teams = await prisma.team.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
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
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-200">{params.message}</div>
        )}

        <form action={joinTeam} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div>
            <p className="mb-2 text-sm text-slate-300">Joining as</p>
            <p className="rounded-xl border border-slate-700 bg-slate-950 p-3">{participant.name} ({participant.type === "vit" ? "VIT" : "External"})</p>
            <label className="mb-2 mt-4 block text-sm text-slate-300">Team code</label>
            <input name="teamCode" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
          </div>

          <button type="submit" className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Join team
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-xl font-semibold">Available teams</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {teams.map((team) => (
              <li key={team.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="font-semibold text-slate-100">{team.name}</span> — {team.teamType} — code: {team.code} — capacity: {team.capacity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
