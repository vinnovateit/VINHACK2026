import { redirect } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireTeamedParticipant } from "../access";
import { TRACK_OPTIONS } from "../constants";
import { isValidTrack, isWithinMaxLength, validateOptionalHttpUrl } from "../validation";
import { TeamShareCard } from "./TeamShareCard";

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
  redirect("/test-dashboard/join-team?message=You left the team. Enter a team code to join another team.");
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
  const progressNote = value("progressNote");
  const projectDescription = value("projectDescription");
  const links = ["githubLink", "figmaLink", "deckLink", "otherLinks"].map(value);
  if (
    !track ||
    !projectTitle ||
    !isValidTrack(track) ||
    !isWithinMaxLength(projectTitle, 200) ||
    !isWithinMaxLength(progressNote, 5000) ||
    !isWithinMaxLength(projectDescription, 10000)
  ) {
    redirect("/test-dashboard/dashboard?error=Please provide a valid track and project title");
  }
  if (links.some((link) => link.length > 2048 || !validateOptionalHttpUrl(link))) {
    redirect("/test-dashboard/dashboard?error=All project links must be valid HTTP or HTTPS URLs");
  }

  await prisma.team.update({
    where: { id: teamId },
    data: {
      track,
      projectTitle,
      progressNote: progressNote || null,
      projectDescription: projectDescription || null,
      githubLink: value("githubLink") || null,
      figmaLink: value("figmaLink") || null,
      deckLink: value("deckLink") || null,
      otherLinks: value("otherLinks") || null,
      lastSubmittedAt: now,
    },
  });
  redirect("/test-dashboard/dashboard");
}

const fieldClass = "w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; message?: string; created?: string }>;
}) {
  const participant = await requireTeamedParticipant();
  const params = await searchParams;
  const [team, settings] = await Promise.all([
    prisma.team.findUnique({
      where: { id: participant.teamId! },
      include: { vitStudents: true, externalStudents: true },
    }),
    prisma.eventSettings.findFirst(),
  ]);
  if (!team) redirect("/test-dashboard/create-team");

  // Determine origin for QR code generation
  const reqHeaders = await headers();
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || "localhost:3000";
  const protocol = reqHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = configuredOrigin || `${protocol}://${host}`;
  const joinUrl = `${origin}/test-dashboard/join-team?code=${team.code}`;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(joinUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: "#020617",
        light: "#ffffff",
      },
    });
  } catch {
    // If QR code generation fails, gracefully continue
  }

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
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Team Dashboard</h1>
          </div>
          <form action={leaveTeam}>
            <button type="submit" className="rounded-xl border border-rose-500/60 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/10 transition">
              Leave Team
            </button>
          </form>
        </div>

        {params?.created && (
          <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-200">
            Team created successfully! Share your team code below to invite members.
          </p>
        )}
        {params?.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{params.error}</p>}
        {params?.success && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">{params.success}</p>}

        {/* Team Overview Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                Track: <span className="text-slate-200 font-medium">{team.track ?? "—"}</span> · Type: <span className="text-slate-200 font-medium">{team.teamType}</span> · Capacity: <span className="text-slate-200 font-medium">{members.length} / {team.capacity}</span>
              </p>
            </div>
          </div>

          <h3 className="mt-6 font-semibold text-slate-200">Team Members ({members.length}/{team.capacity})</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-slate-300">
            {members.map((member) => (
              <li key={member} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                👤 {member}
              </li>
            ))}
          </ul>
        </section>

        {/* Share Section: Code, QR Code, Shareable Link */}
        <TeamShareCard teamCode={team.code} qrDataUrl={qrDataUrl} joinUrl={joinUrl} />

        {/* Submission Section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Project Submission</h2>
          <p className="mt-2 text-sm text-slate-400">
            {!settings
              ? "Submission settings have not been seeded yet."
              : now < settings.submissionOpensAt
              ? `Submissions open at ${date(settings.submissionOpensAt)}`
              : now > settings.submissionClosesAt
              ? `Submissions closed at ${date(settings.submissionClosesAt)}`
              : `Submissions are open until ${date(settings.submissionClosesAt)}`}
          </p>
          <form action={saveSubmission} className="mt-5 grid gap-4 md:grid-cols-2">
            <select name="track" defaultValue={team.track ?? TRACK_OPTIONS[0]} disabled={!isOpen} className={fieldClass}>
              {TRACK_OPTIONS.map((track) => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
            <input name="projectTitle" defaultValue={team.projectTitle ?? ""} placeholder="Project title" readOnly={!isOpen} className={fieldClass} />
            <textarea name="progressNote" defaultValue={team.progressNote ?? ""} placeholder="Progress update" rows={4} readOnly={!isOpen} className={fieldClass} />
            <textarea name="projectDescription" defaultValue={team.projectDescription ?? ""} placeholder="Description" rows={4} readOnly={!isOpen} className={fieldClass} />
            <input name="githubLink" defaultValue={team.githubLink ?? ""} placeholder="GitHub link" readOnly={!isOpen} className={fieldClass} />
            <input name="figmaLink" defaultValue={team.figmaLink ?? ""} placeholder="Figma link" readOnly={!isOpen} className={fieldClass} />
            <input name="deckLink" defaultValue={team.deckLink ?? ""} placeholder="Deck link" readOnly={!isOpen} className={fieldClass} />
            <input name="otherLinks" defaultValue={team.otherLinks ?? ""} placeholder="Other links" readOnly={!isOpen} className={fieldClass} />
            <button
              type="submit"
              disabled={!isOpen}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2 hover:bg-cyan-400 transition"
            >
              Save submission
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
