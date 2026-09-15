"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMongoDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";

export interface SubmissionPayload {
  teamId: string;
  track?: string;
  projectTitle?: string;
  projectDescription?: string;
  githubLink?: string;
  figmaLink?: string;
  deckLink?: string;
  otherLinks?: string;
  progressNote?: string;
}

function toObjectId(id: string): any {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export async function saveSubmissionAction(payload: SubmissionPayload) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, message: "Unauthorized. Please sign in to submit." };
    }

    if (participant.teamId !== payload.teamId) {
      return { success: false, message: "Unauthorized team action." };
    }

    const {
      teamId,
      track,
      projectTitle,
      projectDescription,
      githubLink,
      figmaLink,
      deckLink,
      otherLinks,
      progressNote,
    } = payload;

    const now = new Date();

    // 1. Native MongoDB write (works seamlessly on Cloudflare Workers edge & Node.js)
    try {
      const db = await getMongoDb();
      if (db) {
        const teamOid = toObjectId(teamId);

        // Upsert submission
        await db.collection("submissions").updateOne(
          { teamId: teamOid },
          {
            $set: {
              title: projectTitle?.trim() || null,
              description: projectDescription?.trim() || null,
              githubLink: githubLink?.trim() || null,
              figmaLink: figmaLink?.trim() || null,
              deckLink: deckLink?.trim() || null,
              otherLinks: otherLinks?.trim() || null,
              progressNote: progressNote?.trim() || null,
              submittedAt: now,
              updatedAt: now,
            },
            $setOnInsert: {
              teamId: teamOid,
            },
          },
          { upsert: true }
        );

        // Update track on team if provided
        if (track) {
          await db.collection("teams").updateOne(
            { _id: teamOid },
            { $set: { track, updatedAt: now } }
          );
        }

        revalidatePath("/dashboard");
        return { success: true, message: "Project submission saved successfully!" };
      }
    } catch (mongoErr) {
      console.warn("[saveSubmissionAction] MongoDB native save failed, trying Prisma fallback:", mongoErr);
    }

    // 2. Prisma fallback
    try {
      await prisma.submission.upsert({
        where: { teamId },
        create: {
          teamId,
          title: projectTitle?.trim() || null,
          description: projectDescription?.trim() || null,
          githubLink: githubLink?.trim() || null,
          figmaLink: figmaLink?.trim() || null,
          deckLink: deckLink?.trim() || null,
          otherLinks: otherLinks?.trim() || null,
          progressNote: progressNote?.trim() || null,
          submittedAt: now,
        },
        update: {
          title: projectTitle?.trim() || null,
          description: projectDescription?.trim() || null,
          githubLink: githubLink?.trim() || null,
          figmaLink: figmaLink?.trim() || null,
          deckLink: deckLink?.trim() || null,
          otherLinks: otherLinks?.trim() || null,
          progressNote: progressNote?.trim() || null,
          submittedAt: now,
        },
      });

      if (track) {
        await prisma.team.update({
          where: { id: teamId },
          data: { track },
        });
      }

      revalidatePath("/dashboard");
      return { success: true, message: "Project submission saved successfully!" };
    } catch (prismaErr) {
      console.error("[saveSubmissionAction] Prisma fallback failed:", prismaErr);
      return { success: false, message: "Failed to save submission. Please try again." };
    }
  } catch (error) {
    console.error("[saveSubmissionAction] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred while saving." };
  }
}

export async function fetchFullTeam(teamId: string) {
  try {
    // 1. Try Prisma query first
    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          vitStudents: true,
          externalStudents: true,
          submission: true,
          leader: true,
        },
      });

      if (team) {
        const members = [
          ...team.vitStudents.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            regNo: m.regNo,
            type: "vit" as const,
            userId: m.userId,
            isLeader: Boolean(team.leaderId && m.userId === team.leaderId),
          })),
          ...team.externalStudents.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            regNo: m.regNo || "",
            type: "external" as const,
            userId: m.userId,
            isLeader: Boolean(team.leaderId && m.userId === team.leaderId),
          })),
        ];

        return {
          id: team.id,
          name: team.name,
          code: team.code,
          capacity: team.capacity || 5,
          teamType: team.teamType,
          track: team.track,
          leaderId: team.leaderId,
          leaderName: team.leader?.name || null,
          members,
          submission: team.submission
            ? {
                title: team.submission.title || "",
                description: team.submission.description || "",
                githubLink: team.submission.githubLink || "",
                figmaLink: team.submission.figmaLink || "",
                deckLink: team.submission.deckLink || "",
                otherLinks: team.submission.otherLinks || "",
                progressNote: team.submission.progressNote || "",
                submittedAt: team.submission.submittedAt?.toISOString() || null,
              }
            : null,
        };
      }
    } catch (prismaErr) {
      console.warn("[fetchFullTeam] Prisma lookup failed, trying native MongoDB:", prismaErr);
    }

    // 2. Native Mongo fallback
    const db = await getMongoDb();
    if (!db) return null;

    const teamOid = toObjectId(teamId);
    const teamDoc = await db.collection("teams").findOne({
      $or: [{ _id: teamOid }, { id: teamId }],
    });

    if (!teamDoc) return null;

    const [vitList, extList, subDoc, leaderDoc] = await Promise.all([
      db.collection("vit_students").find({
        $or: [{ teamId: teamOid }, { teamId: teamId }, { teamId: teamDoc._id }],
      }).toArray(),
      db.collection("external_students").find({
        $or: [{ teamId: teamOid }, { teamId: teamId }, { teamId: teamDoc._id }],
      }).toArray(),
      db.collection("submissions").findOne({
        $or: [{ teamId: teamOid }, { teamId: teamId }, { teamId: teamDoc._id }],
      }),
      teamDoc.leaderId
        ? db.collection("users").findOne({ _id: toObjectId(String(teamDoc.leaderId)) })
        : null,
    ]);

    const members = [
      ...vitList.map((m: any) => ({
        id: m._id.toString(),
        name: m.name || "VIT Member",
        email: m.email || "",
        regNo: m.regNo || "",
        type: "vit" as const,
        userId: m.userId ? String(m.userId) : null,
        isLeader: Boolean(teamDoc.leaderId && String(m.userId) === String(teamDoc.leaderId)),
      })),
      ...extList.map((m: any) => ({
        id: m._id.toString(),
        name: m.name || "External Member",
        email: m.email || "",
        regNo: m.regNo || "",
        type: "external" as const,
        userId: m.userId ? String(m.userId) : null,
        isLeader: Boolean(teamDoc.leaderId && String(m.userId) === String(teamDoc.leaderId)),
      })),
    ];

    return {
      id: teamDoc._id.toString(),
      name: teamDoc.name || "My Team",
      code: teamDoc.code || "VH26-000",
      capacity: teamDoc.capacity || 5,
      teamType: teamDoc.teamType || "VIT",
      track: teamDoc.track || null,
      leaderId: teamDoc.leaderId ? String(teamDoc.leaderId) : null,
      leaderName: leaderDoc?.name || null,
      members,
      submission: subDoc
        ? {
            title: subDoc.title || "",
            description: subDoc.description || "",
            githubLink: subDoc.githubLink || "",
            figmaLink: subDoc.figmaLink || "",
            deckLink: subDoc.deckLink || "",
            otherLinks: subDoc.otherLinks || "",
            progressNote: subDoc.progressNote || "",
            submittedAt: subDoc.submittedAt ? new Date(subDoc.submittedAt).toISOString() : null,
          }
        : null,
    };
  } catch (error) {
    console.error("[fetchFullTeam] Error fetching team:", error);
    return null;
  }
}
