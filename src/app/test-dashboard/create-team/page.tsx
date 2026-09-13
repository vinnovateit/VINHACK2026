import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeamlessParticipant } from "../access";
import { generateUniqueTeamCode } from "../utils";

async function createTeam(formData: FormData) {
  "use server";

  const participant = await requireTeamlessParticipant();
  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 100) {
    redirect("/test-dashboard/create-team?error=Team name is required and must be 100 characters or fewer");
  }

  const teamType = participant.type === "vit" ? "VIT" : "EXTERNAL";

  const code = await generateUniqueTeamCode();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name,
        code,
        teamType,
        leaderId: participant.userId,
      },
      select: { id: true },
    });

    if (participant.type === "vit") {
      await tx.vITStudent.update({
        where: { id: participant.id },
        data: { teamId: team.id, joinedAt: now },
      });
    } else {
      await tx.externalStudent.update({
        where: { id: participant.id },
        data: { teamId: team.id, joinedAt: now },
      });
    }
  });

  redirect("/test-dashboard/dashboard");
}

export default async function CreateTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireTeamlessParticipant();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Create Team</h1>
        </div>
        {params?.error && (
          <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">
            {params.error}
          </p>
        )}
        <form action={createTeam} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Team Name</label>
              <input
                name="name"
                required
                placeholder="Team name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Create team
            </button>
            <a href="/test-dashboard/join-team" className="text-sm text-cyan-300 hover:text-cyan-200">
              Join an existing team →
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
