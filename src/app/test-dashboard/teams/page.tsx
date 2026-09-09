import { prisma } from "@/lib/prisma";
import { TRACK_OPTIONS } from "@/app/test-dashboard/constants";
import { redirect } from "next/navigation";
import { requireTeamlessParticipant } from "../access";

async function createTeam(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const teamType = String(formData.get("teamType") ?? "VIT");
  const capacity = Number(formData.get("capacity") ?? 4);

  if (!name || !code || !track) {
    redirect("/test-dashboard/teams?error=Please fill in the required team fields");
  }

  await prisma.team.create({
    data: {
      name,
      code,
      description: description || null,
      track,
      teamType: teamType === "EXTERNAL" ? "EXTERNAL" : "VIT",
      capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 4,
    },
  });

  redirect("/test-dashboard/teams?success=Team created successfully");
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  await requireTeamlessParticipant();
  const params = await searchParams;
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vitStudents: true,
      externalStudents: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Teams</h1>
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
          </div>
        )}

        <form action={createTeam} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Team name</label>
              <input name="name" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Code</label>
              <input name="code" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">Description</label>
              <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Track</label>
              <select name="track" defaultValue={TRACK_OPTIONS[0]} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500">
                {TRACK_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Team type</label>
              <select name="teamType" defaultValue="VIT" className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500">
                <option value="VIT">VIT</option>
                <option value="EXTERNAL">External</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Capacity</label>
              <input name="capacity" type="number" min={1} max={10} defaultValue={4} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
          </div>

          <button type="submit" className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Create team
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-xl font-semibold">Existing teams</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Members</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => {
                  const memberCount = team.vitStudents.length + team.externalStudents.length;
                  return (
                    <tr key={team.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">{team.name}</td>
                      <td className="px-4 py-3">{team.code}</td>
                      <td className="px-4 py-3">{team.track ?? "—"}</td>
                      <td className="px-4 py-3">{team.teamType}</td>
                      <td className="px-4 py-3">{team.capacity}</td>
                      <td className="px-4 py-3">{memberCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
