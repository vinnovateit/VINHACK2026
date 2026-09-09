import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeamlessParticipant } from "../access";
import { TRACK_OPTIONS } from "../constants";

async function createTeam(formData: FormData) {
  "use server";

  const participant = await requireTeamlessParticipant();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 4);

  if (!name || !code || !track) redirect("/test-dashboard/create-team?error=Please fill in the required team fields");

  const team = await prisma.team.create({
    data: {
      name,
      code,
      track,
      description: description || null,
      capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 4,
      teamType: participant.type === "vit" ? "VIT" : "EXTERNAL",
      ...(participant.type === "vit"
        ? { vitStudents: { connect: { id: participant.id } } }
        : { externalStudents: { connect: { id: participant.id } } }),
    },
  });

  redirect(`/test-dashboard/dashboard?created=${team.id}`);
}

export default async function CreateTeamPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  await requireTeamlessParticipant();
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Create Team</h1>
        </div>
        {params?.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{params.error}</p>}
        <form action={createTeam} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" required placeholder="Team name" className="rounded-xl border border-slate-700 bg-slate-950 p-3" />
            <input name="code" required placeholder="Team code" className="rounded-xl border border-slate-700 bg-slate-950 p-3" />
            <select name="track" defaultValue={TRACK_OPTIONS[0]} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              {TRACK_OPTIONS.map((track) => <option key={track}>{track}</option>)}
            </select>
            <input name="capacity" type="number" min={1} max={10} defaultValue={4} placeholder="Capacity" className="rounded-xl border border-slate-700 bg-slate-950 p-3" />
            <textarea name="description" rows={4} placeholder="Description" className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950 p-3" />
          </div>
          <button type="submit" className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Create team</button>
          <a href="/test-dashboard/join-team" className="ml-4 text-sm text-cyan-300 hover:text-cyan-200">Join an existing team</a>
        </form>
      </div>
    </main>
  );
}
