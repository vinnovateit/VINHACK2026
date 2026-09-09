import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeamedParticipant } from "../access";
import { TRACK_OPTIONS } from "../constants";

async function leaveTeam() {
  "use server";
  const participant = await requireTeamedParticipant();
  const teamId = participant.teamId;
  if (!teamId) redirect("/test-dashboard/create-team");

  if (participant.type === "vit") {
    await prisma.vITStudent.update({ where: { id: participant.id }, data: { teamId: null } });
  } else {
    await prisma.externalStudent.update({ where: { id: participant.id }, data: { teamId: null } });
  }

  const [vitCount, externalCount] = await Promise.all([
    prisma.vITStudent.count({ where: { teamId } }),
    prisma.externalStudent.count({ where: { teamId } }),
  ]);
  if (vitCount + externalCount === 0) await prisma.team.delete({ where: { id: teamId } });
  redirect("/test-dashboard/join-team?message=You left the team. Enter a new code to switch teams.");
}

async function saveSubmission(formData: FormData) {
  "use server";
  const participant = await requireTeamedParticipant();
  const settings = await prisma.eventSettings.findFirst();
  const now = new Date();
  if (!settings || now < settings.submissionOpensAt || now > settings.submissionClosesAt) {
    redirect("/test-dashboard/dashboard?error=Submissions are outside the open window");
  }

  const teamId = participant.teamId;
  if (!teamId) redirect("/test-dashboard/create-team");
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const track = value("track");
  const projectTitle = value("projectTitle");
  if (!track || !projectTitle) redirect("/test-dashboard/dashboard?error=Track and project title are required");

  await prisma.team.update({
    where: { id: teamId },
    data: {
      track,
      projectTitle,
      progressNote: value("progressNote") || null,
      projectDescription: value("projectDescription") || null,
      githubLink: value("githubLink") || null,
      figmaLink: value("figmaLink") || null,
      deckLink: value("deckLink") || null,
      otherLinks: value("otherLinks") || null,
      lastSubmittedAt: now,
    },
  });
  redirect("/test-dashboard/dashboard?success=Submission saved");
}

const fieldClass = "w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60";

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string; message?: string }> }) {
  const participant = await requireTeamedParticipant();
  const params = await searchParams;
  const [team, settings] = await Promise.all([
    prisma.team.findUnique({ where: { id: participant.teamId! }, include: { vitStudents: true, externalStudents: true } }),
    prisma.eventSettings.findFirst(),
  ]);
  if (!team) redirect("/test-dashboard/create-team");

  const now = new Date();
  const isOpen = Boolean(settings && now >= settings.submissionOpensAt && now <= settings.submissionClosesAt);
  const date = (value: Date) => value.toLocaleString();
  const members = [
    ...team.vitStudents.map((member) => `${member.name} (VIT)`),
    ...team.externalStudents.map((member) => `${member.name} (External)`),
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p><h1 className="mt-2 text-3xl font-bold">Team Dashboard</h1></div>
          <form action={leaveTeam}><button type="submit" className="rounded-xl border border-rose-500/60 px-4 py-2 text-sm text-rose-200">Switch / Leave Team</button></form>
        </div>
        {params?.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{params.error}</p>}
        {params?.success && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">{params.success}</p>}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">{team.name}</h2>
          <p className="mt-2 text-slate-400">Code: {team.code} · Track: {team.track ?? "—"} · Type: {team.teamType}</p>
          <h3 className="mt-5 font-semibold">Members</h3>
          <ul className="mt-2 space-y-1 text-slate-300">{members.map((member) => <li key={member}>{member}</li>)}</ul>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Submission</h2>
          <p className="mt-2 text-sm text-slate-400">
            {!settings ? "Submission settings have not been seeded yet." : now < settings.submissionOpensAt ? `Submissions open at ${date(settings.submissionOpensAt)}` : now > settings.submissionClosesAt ? `Submissions closed at ${date(settings.submissionClosesAt)}` : `Submissions are open until ${date(settings.submissionClosesAt)}`}
          </p>
          <form action={saveSubmission} className="mt-5 grid gap-4 md:grid-cols-2">
            <select name="track" defaultValue={team.track ?? TRACK_OPTIONS[0]} disabled={!isOpen} className={fieldClass}>{TRACK_OPTIONS.map((track) => <option key={track}>{track}</option>)}</select>
            <input name="projectTitle" defaultValue={team.projectTitle ?? ""} placeholder="Project title" readOnly={!isOpen} className={fieldClass} />
            <textarea name="progressNote" defaultValue={team.progressNote ?? ""} placeholder="Progress update" rows={4} readOnly={!isOpen} className={fieldClass} />
            <textarea name="projectDescription" defaultValue={team.projectDescription ?? ""} placeholder="Description" rows={4} readOnly={!isOpen} className={fieldClass} />
            <input name="githubLink" defaultValue={team.githubLink ?? ""} placeholder="GitHub link" readOnly={!isOpen} className={fieldClass} />
            <input name="figmaLink" defaultValue={team.figmaLink ?? ""} placeholder="Figma link" readOnly={!isOpen} className={fieldClass} />
            <input name="deckLink" defaultValue={team.deckLink ?? ""} placeholder="Deck link" readOnly={!isOpen} className={fieldClass} />
            <input name="otherLinks" defaultValue={team.otherLinks ?? ""} placeholder="Other links" readOnly={!isOpen} className={fieldClass} />
            <button type="submit" disabled={!isOpen} className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2">Save submission</button>
          </form>
        </section>
      </div>
    </main>
  );
}
