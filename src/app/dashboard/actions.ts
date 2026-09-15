"use server";

import { revalidatePath } from "next/cache";
import { getMongoDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import { leaveCurrentTeam, removeTeamMember, TeamMembershipError } from "@/app/test-dashboard/team-membership";

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
    const db = await getMongoDb();
    if (!db) return { success: false, message: "Database unavailable." };

    const teamOid = toObjectId(teamId);

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
        $setOnInsert: { teamId: teamOid },
      },
      { upsert: true }
    );

    if (track) {
      await db.collection("teams").updateOne(
        { _id: teamOid },
        { $set: { track, updatedAt: now } }
      );
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Project submission saved successfully!" };
  } catch (error) {
    console.error("[saveSubmissionAction] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred while saving." };
  }
}


export async function fetchFullTeam(teamId: string) {
  try {
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

export async function deleteTeamAction() {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.userId || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    const teamId = participant.teamId;
    const db = await getMongoDb();
    if (!db) return { success: false, error: "Database unavailable." };

    const teamOid = toObjectId(teamId);
    const team = await db.collection("teams").findOne({ _id: teamOid });
    if (!team) return { success: false, error: "Team not found." };
    if (String(team.leaderId) !== String(participant.userId)) {
      return { success: false, error: "Only the team leader can delete the team." };
    }

    const teamFilter = { $or: [{ teamId: teamOid }, { teamId: team._id }] };
    await Promise.all([
      db.collection("vit_students").updateMany(teamFilter, { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }),
      db.collection("external_students").updateMany(teamFilter, { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }),
      db.collection("submissions").deleteMany(teamFilter),
      db.collection("teams").deleteOne({ _id: team._id }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (err) {
    console.error("[deleteTeamAction] Uncaught error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function leaveTeamAction() {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, error: "No active team session found." };
    }

    await leaveCurrentTeam(
      { id: participant.id, type: participant.type, userId: participant.userId },
      participant.teamId
    );

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (err) {
    const message = err instanceof TeamMembershipError ? err.message : "Failed to leave team.";
    console.error("[leaveTeamAction] Error:", err);
    return { success: false, error: message };
  }
}

export async function removeTeamMemberAction(
  targetParticipantId: string,
  targetType: "vit" | "external"
) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.userId || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    await removeTeamMember({
      requesterUserId: participant.userId,
      targetParticipantId,
      targetType,
      teamId: participant.teamId,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const message = err instanceof TeamMembershipError ? err.message : "Failed to remove member.";
    console.error("[removeTeamMemberAction] Error:", err);
    return { success: false, error: message };
  }
}

export async function transferLeadershipAction(newLeaderParticipantId: string, newLeaderType: "vit" | "external") {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.userId || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    const teamId = participant.teamId;
    const db = await getMongoDb();
    if (!db) return { success: false, error: "Database unavailable." };

    const teamOid = toObjectId(teamId);
    const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
    if (!team) return { success: false, error: "Team not found." };
    if (String(team.leaderId) !== String(participant.userId)) {
      return { success: false, error: "Only the team leader can transfer leadership." };
    }

    const targetCol = newLeaderType === "vit" ? "vit_students" : "external_students";
    const newLeaderDoc = await db.collection(targetCol).findOne(
      { _id: toObjectId(newLeaderParticipantId) },
      { projection: { userId: 1 } }
    );
    if (!newLeaderDoc) return { success: false, error: "Selected member not found." };
    if (!newLeaderDoc.userId) return { success: false, error: "Selected member has no linked user account yet." };

    await db.collection("teams").updateOne(
      { _id: teamOid },
      { $set: { leaderId: toObjectId(String(newLeaderDoc.userId)), updatedAt: new Date() } }
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[transferLeadershipAction] Uncaught error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function renameTeamAction(teamId: string, teamName: string) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.userId) {
      return { success: false, error: "Unauthorized." };
    }

    const trimmed = teamName.trim().slice(0, 100);
    if (!trimmed) return { success: false, error: "Team name cannot be empty." };

    const db = await getMongoDb();
    if (!db) return { success: false, error: "Database unavailable." };

    const teamOid = toObjectId(teamId);
    const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
    if (!team) return { success: false, error: "Team not found." };
    if (String(team.leaderId) !== String(participant.userId)) {
      return { success: false, error: "Only the leader can rename the team." };
    }

    await db.collection("teams").updateOne(
      { _id: teamOid },
      { $set: { name: trimmed, updatedAt: new Date() } }
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[renameTeamAction] Error:", err);
    return { success: false, error: "Failed to rename team." };
  }
}
