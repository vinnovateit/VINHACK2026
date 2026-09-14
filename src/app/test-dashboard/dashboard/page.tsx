import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireTeamedParticipant } from "../access";
import { TRACK_OPTIONS } from "../constants";
import { leaveCurrentTeam, removeTeamMember, TeamMembershipError } from "../team-membership";
import { isValidTrack, isWithinMaxLength, validateOptionalHttpUrl } from "../validation";
import { TeamShareCard } from "./TeamShareCard";

async function leaveTeam() {
  "use server";
  const participant = await requireTeamedParticipant();
  const teamId = participant.teamId;
  if (!teamId) redirect("/test-dashboard/create-team");

  await leaveCurrentTeam(participant, teamId);
  redirect("/test-dashboard/join-team?message=You left the team. Enter a team code to join another team.");
}

async function removeMember(formData: FormData) {
  "use server";
  const participant = await requireTeamedParticipant();
  const teamId = participant.teamId;
  if (!teamId) redirect("/test-dashboard/create-team");

  const targetType = String(formData.get("type"));
  const targetParticipantId = String(formData.get("participantId"));
  if ((targetType !== "vit" && targetType !== "external") || !targetParticipantId) {
    redirect("/test-dashboard/dashboard?error=Choose a valid team member to remove");
  }

  try {
    await removeTeamMember({
      requesterUserId: participant.userId,
      targetParticipantId,
      targetType,
      teamId,
    });
  } catch (error) {
    const message = error instanceof TeamMembershipError ? error.message : "Unable to remove member.";
    redirect(`/test-dashboard/dashboard?error=${encodeURIComponent(message)}`);
  }

  redirect("/test-dashboard/dashboard?success=Team member removed.");
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

  await prisma.$transaction([
    prisma.team.update({
      where: { id: teamId },
      data: { track },
    }),
    prisma.submission.upsert({
      where: { teamId },
      update: {
        title: projectTitle,
        progressNote: progressNote || null,
        description: projectDescription || null,
        githubLink: value("githubLink") || null,
        figmaLink: value("figmaLink") || null,
        deckLink: value("deckLink") || null,
        otherLinks: value("otherLinks") || null,
        submittedAt: now,
      },
      create: {
        teamId,
        title: projectTitle,
        progressNote: progressNote || null,
        description: projectDescription || null,
        githubLink: value("githubLink") || null,
        figmaLink: value("figmaLink") || null,
        deckLink: value("deckLink") || null,
        otherLinks: value("otherLinks") || null,
        submittedAt: now,
      },
    }),
  ]);

  redirect("/test-dashboard/dashboard?success=Submission saved.");
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
      include: { vitStudents: true, externalStudents: true, submission: true, leader: true },
    }),
    prisma.eventSettings.findFirst(),
  ]);
  if (!team) redirect("/test-dashboard/create-team");

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
    qrDataUrl = "";
  }

  const now = new Date();
  const isOpen = Boolean(settings && now >= settings.submissionOpensAt && now <= settings.submissionClosesAt);
  const date = (value: Date) => value.toLocaleString();
  const members = [
    ...team.vitStudents.map((member) => ({ id: member.id, type: "vit" as const, userId: member.userId, label: `${member.name} (VIT)` })),
    ...team.externalStudents.map((member) => ({ id: member.id, type: "external" as const, userId: member.userId, label: `${member.name} (External)` })),
  ];
  const isLeader = Boolean(participant.userId && participant.userId === team.leaderId);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Team Dashboard</h1>
            <a href="/test-dashboard/profile" className="mt-2 inline-block text-sm text-cyan-300 hover:text-cyan-200">Update hostel details</a>
          </div>
          <form action={leaveTeam}>
            <button type="submit" className="rounded-xl border border-rose-500/60 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10">
              Leave Team
            </button>
          </form>
        </div>

        {params?.created && <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-200">Team created successfully. Share your team code below to invite members.</p>}
        {params?.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{params.error}</p>}
        {params?.success && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">{params.success}</p>}
        {params?.message && <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-200">{params.message}</p>}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                Track: <span className="font-medium text-slate-200">{team.track ?? "Not selected"}</span> | Type: <span className="font-medium text-slate-200">{team.teamType}</span> | Capacity: <span className="font-medium text-slate-200">{members.length} / {team.capacity}</span>
              </p>
              {team.leader && <p className="mt-1 text-sm text-slate-400">Leader: <span className="font-medium text-slate-200">{team.leader.name ?? team.leader.email}</span></p>}
            </div>
          </div>

          <h3 className="mt-6 font-semibold text-slate-200">Team Members ({members.length}/{team.capacity})</h3>
          <ul className="mt-2 grid gap-2 text-slate-300 sm:grid-cols-2 md:grid-cols-3">
            {members.map((member) => (
              <li key={`${member.type}:${member.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                <span>{member.label}{member.userId === team.leaderId ? " - Leader" : ""}</span>
                {isLeader && member.userId !== team.leaderId && (
                  <form action={removeMember}>
                    <input type="hidden" name="type" value={member.type} />
                    <input type="hidden" name="participantId" value={member.id} />
                    <button type="submit" className="rounded-lg border border-rose-500/50 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/10">
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>

        <TeamShareCard teamCode={team.code} qrDataUrl={qrDataUrl} joinUrl={joinUrl} />

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
            <input name="projectTitle" defaultValue={team.submission?.title ?? ""} placeholder="Project title" readOnly={!isOpen} className={fieldClass} />
            <textarea name="progressNote" defaultValue={team.submission?.progressNote ?? ""} placeholder="Progress update" rows={4} readOnly={!isOpen} className={fieldClass} />
            <textarea name="projectDescription" defaultValue={team.submission?.description ?? ""} placeholder="Description" rows={4} readOnly={!isOpen} className={fieldClass} />
            <input name="githubLink" defaultValue={team.submission?.githubLink ?? ""} placeholder="GitHub link" readOnly={!isOpen} className={fieldClass} />
            <input name="figmaLink" defaultValue={team.submission?.figmaLink ?? ""} placeholder="Figma link" readOnly={!isOpen} className={fieldClass} />
            <input name="deckLink" defaultValue={team.submission?.deckLink ?? ""} placeholder="Deck link" readOnly={!isOpen} className={fieldClass} />
            <input name="otherLinks" defaultValue={team.submission?.otherLinks ?? ""} placeholder="Other links" readOnly={!isOpen} className={fieldClass} />
            <button
              type="submit"
              disabled={!isOpen}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
            >
              Save submission
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
