import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TRACK_OPTIONS } from "@/app/test-dashboard/constants";
import { requireTeamedParticipant } from "../access";
import { isValidTrack, isWithinMaxLength, validateOptionalHttpUrl } from "../validation";

async function saveSubmission(formData: FormData) {
  "use server";

  const participant = await requireTeamedParticipant();
  const teamId = participant.teamId;
  if (!teamId) redirect("/test-dashboard/create-team");
  const track = String(formData.get("track") ?? "").trim();
  const projectTitle = String(formData.get("projectTitle") ?? "").trim();
  const projectDescription = String(formData.get("projectDescription") ?? "").trim();
  const progressNote = String(formData.get("progressNote") ?? "").trim();
  const githubLink = String(formData.get("githubLink") ?? "").trim();
  const figmaLink = String(formData.get("figmaLink") ?? "").trim();
  const deckLink = String(formData.get("deckLink") ?? "").trim();
  const otherLinks = String(formData.get("otherLinks") ?? "").trim();

  const links = [githubLink, figmaLink, deckLink, otherLinks];
  if (
    !track ||
    !projectTitle ||
    !isValidTrack(track) ||
    !isWithinMaxLength(projectTitle, 200) ||
    !isWithinMaxLength(progressNote, 5000) ||
    !isWithinMaxLength(projectDescription, 10000)
  ) {
    redirect("/test-dashboard/submissions?error=Please provide a valid track and project title");
  }
  if (links.some((link) => link.length > 2048 || !validateOptionalHttpUrl(link))) {
    redirect("/test-dashboard/submissions?error=All project links must be valid HTTP or HTTPS URLs");
  }

  await prisma.team.update({
    where: { id: teamId },
    data: {
      track,
      projectTitle,
      projectDescription: projectDescription || null,
      progressNote: progressNote || null,
      githubLink: githubLink || null,
      figmaLink: figmaLink || null,
      deckLink: deckLink || null,
      otherLinks: otherLinks || null,
      lastSubmittedAt: new Date(),
    },
  });

  redirect("/test-dashboard/submissions?success=Submission updated successfully");
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const participant = await requireTeamedParticipant();
  const params = await searchParams;
  const team = await prisma.team.findUnique({ where: { id: participant.teamId! } });
  if (!team) redirect("/test-dashboard/create-team");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Submissions</h1>
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

        <form action={saveSubmission} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Team</label>
                <p className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100">
                  {team.name} ({team.teamType})
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Track</label>
                <select name="track" defaultValue={team.track ?? TRACK_OPTIONS[0]} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500">
                  {TRACK_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Project title</label>
                <input name="projectTitle" defaultValue={team.projectTitle ?? ""} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Progress update</label>
                <textarea name="progressNote" defaultValue={team.progressNote ?? ""} rows={5} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Description</label>
                <textarea name="projectDescription" defaultValue={team.projectDescription ?? ""} rows={6} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Project links</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">🔗</span>
                    <input name="githubLink" defaultValue={team.githubLink ?? ""} placeholder="GitHub" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">✦</span>
                    <input name="figmaLink" defaultValue={team.figmaLink ?? ""} placeholder="Figma" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">▣</span>
                    <input name="deckLink" defaultValue={team.deckLink ?? ""} placeholder="Deck" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">＋</span>
                    <input name="otherLinks" defaultValue={team.otherLinks ?? ""} placeholder="Other" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Submit project
          </button>
        </form>
      </div>
    </main>
  );
}
