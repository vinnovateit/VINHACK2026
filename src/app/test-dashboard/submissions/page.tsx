import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TRACK_OPTIONS } from "@/app/test-dashboard/constants";
import { requireTeamedParticipant } from "../access";
import { isValidTrack, isWithinMaxLength, validateOptionalHttpUrl } from "../validation";

async function saveSubmission(formData: FormData) {
  "use server";

  const participant = await requireTeamedParticipant();
  const settings = await prisma.eventSettings.findFirst();
  const now = new Date();
  if (!settings || now < settings.submissionOpensAt || now > settings.submissionClosesAt) {
    redirect("/test-dashboard/submissions?error=Submissions are outside the open window");
  }

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

  await prisma.$transaction([
    prisma.team.update({
      where: { id: teamId },
      data: { track },
    }),
    prisma.submission.upsert({
      where: { teamId },
      update: {
        title: projectTitle,
        description: projectDescription || null,
        progressNote: progressNote || null,
        githubLink: githubLink || null,
        figmaLink: figmaLink || null,
        deckLink: deckLink || null,
        otherLinks: otherLinks || null,
        submittedAt: now,
      },
      create: {
        teamId,
        title: projectTitle,
        description: projectDescription || null,
        progressNote: progressNote || null,
        githubLink: githubLink || null,
        figmaLink: figmaLink || null,
        deckLink: deckLink || null,
        otherLinks: otherLinks || null,
        submittedAt: now,
      },
    }),
  ]);

  redirect("/test-dashboard/submissions?success=Submission updated successfully");
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const participant = await requireTeamedParticipant();
  const params = await searchParams;
  const [team, settings] = await Promise.all([
    prisma.team.findUnique({ where: { id: participant.teamId! }, include: { submission: true } }),
    prisma.eventSettings.findFirst(),
  ]);
  if (!team) redirect("/test-dashboard/create-team");
  const now = new Date();
  const isOpen = Boolean(settings && now >= settings.submissionOpensAt && now <= settings.submissionClosesAt);

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
                <select name="track" defaultValue={team.track ?? TRACK_OPTIONS[0]} disabled={!isOpen} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60">
                  {TRACK_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Project title</label>
                <input name="projectTitle" defaultValue={team.submission?.title ?? ""} disabled={!isOpen} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60" />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Progress update</label>
                <textarea name="progressNote" defaultValue={team.submission?.progressNote ?? ""} rows={5} disabled={!isOpen} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Description</label>
                <textarea name="projectDescription" defaultValue={team.submission?.description ?? ""} rows={6} disabled={!isOpen} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60" />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Project links</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">🔗</span>
                    <input name="githubLink" defaultValue={team.submission?.githubLink ?? ""} placeholder="GitHub" disabled={!isOpen} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">✦</span>
                    <input name="figmaLink" defaultValue={team.submission?.figmaLink ?? ""} placeholder="Figma" disabled={!isOpen} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">▣</span>
                    <input name="deckLink" defaultValue={team.submission?.deckLink ?? ""} placeholder="Deck" disabled={!isOpen} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <span className="text-lg">＋</span>
                    <input name="otherLinks" defaultValue={team.submission?.otherLinks ?? ""} placeholder="Other" disabled={!isOpen} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={!isOpen} className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">
            Submit project
          </button>
        </form>
      </div>
    </main>
  );
}
