"use server";

import { revalidatePath } from "next/cache";
import { getMongoDb, isTeamLeader, renameTeamInDb, TEAM_MAX_SIZE, TEAM_MIN_SIZE } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import {
  cleanText,
  FIELD_LIMITS,
  isValidHttpUrl,
  isValidProgressStatus,
  isValidProjectType,
  isValidTeamConfidence,
  isValidTrack,
} from "@/lib/validation";
import { resolveCurrentParticipant } from "@/app/onboarding/actions";
import {
  deleteTeam,
  leaveCurrentTeam,
  removeTeamMember,
  transferLeadership,
  TeamMembershipError,
} from "@/lib/team-membership";

export interface SubmissionPayload {
  teamId: string;
  track?: string;
  projectType?: string;
  projectTitle?: string;
  projectDescription?: string;
  githubLink?: string;
  figmaLink?: string;
  deckLink?: string;
  otherLinks?: string;
  progressStatus?: string;
  teamConfidence?: string;
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

    const { teamId, track } = payload;

    if (track !== undefined && track !== "" && !isValidTrack(track)) {
      return { success: false, message: "Please choose one of the listed tracks." };
    }

    if (!isValidProjectType(payload.projectType)) {
      return { success: false, message: "Please choose whether your project is Software or Hardware." };
    }

    if (!isValidProgressStatus(payload.progressStatus) || !isValidTeamConfidence(payload.teamConfidence)) {
      return { success: false, message: "Please choose your current status and team confidence." };
    }

    const links = {
      githubLink: cleanText(payload.githubLink, FIELD_LIMITS.link),
      figmaLink: cleanText(payload.figmaLink, FIELD_LIMITS.link),
      deckLink: cleanText(payload.deckLink, FIELD_LIMITS.link),
    };
    for (const [field, value] of Object.entries(links)) {
      if (value && !isValidHttpUrl(value)) {
        return { success: false, message: `${field.replace("Link", "")} link must be a valid http(s) URL.` };
      }
    }

    const now = new Date();
    const db = await getMongoDb();
    if (!db) return { success: false, message: "Database unavailable." };

    const teamOid = toObjectId(teamId);

    const teamDoc = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
    if (!teamDoc) return { success: false, message: "Team not found." };

    if (!isTeamLeader(teamDoc.leaderId, participant)) {
      return { success: false, message: "Only the Team Leader can submit or update project reviews." };
    }

    const [vitCount, extCount] = await Promise.all([
      db.collection("vit_students").countDocuments({ teamId: teamOid }),
      db.collection("external_students").countDocuments({ teamId: teamOid }),
    ]);
    if (vitCount + extCount < TEAM_MIN_SIZE) {
      return {
        success: false,
        message: `Teams need at least ${TEAM_MIN_SIZE} members before submitting. Share your team code to invite teammates.`,
      };
    }

    await db.collection("submissions").updateOne(
      { teamId: teamOid },
      {
        $set: {
          title: cleanText(payload.projectTitle, FIELD_LIMITS.projectTitle),
          description: cleanText(payload.projectDescription, FIELD_LIMITS.projectDescription),
          projectType: payload.projectType,
          ...links,
          otherLinks: cleanText(payload.otherLinks, FIELD_LIMITS.otherLinks),
          progressStatus: payload.progressStatus,
          teamConfidence: payload.teamConfidence,
          progressNote: cleanText(payload.progressNote, FIELD_LIMITS.progressNote),
          updatedAt: now,
        },
        $setOnInsert: { teamId: teamOid, submittedAt: now },
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

    const [vitList, extList, subDoc] = await Promise.all([
      db.collection("vit_students").find({
        $or: [{ teamId: teamOid }, { teamId: teamId }, { teamId: teamDoc._id }],
      }).toArray(),
      db.collection("external_students").find({
        $or: [{ teamId: teamOid }, { teamId: teamId }, { teamId: teamDoc._id }],
      }).toArray(),
      db.collection("submissions").findOne({
        $or: [{ teamId: teamOid }, { teamId: teamId }, { teamId: teamDoc._id }],
      }),
    ]);

    const members = [
      ...vitList.map((m: any) => ({
        id: m._id.toString(),
        name: m.name || "VIT Member",
        email: m.email || "",
        regNo: m.regNo || "",
        type: "vit" as const,
        userId: m.userId ? String(m.userId) : null,
        isLeader: isTeamLeader(teamDoc.leaderId, { id: m._id.toString(), userId: m.userId ? String(m.userId) : null }),
      })),
      ...extList.map((m: any) => ({
        id: m._id.toString(),
        name: m.name || "External Member",
        email: m.email || "",
        regNo: m.regNo || "",
        type: "external" as const,
        userId: m.userId ? String(m.userId) : null,
        isLeader: isTeamLeader(teamDoc.leaderId, { id: m._id.toString(), userId: m.userId ? String(m.userId) : null }),
      })),
    ];

    let leaderId = teamDoc.leaderId ? String(teamDoc.leaderId) : null;
    if (members.length > 0 && !members.some((m) => m.isLeader)) {
      // Legacy teams can point at a users._id no member is linked to (or at nobody); promote the earliest joiner.
      const earliest = [...vitList, ...extList].sort(
        (a: any, b: any) =>
          (a.joinedAt ? new Date(a.joinedAt).getTime() : Number.MAX_SAFE_INTEGER) -
          (b.joinedAt ? new Date(b.joinedAt).getTime() : Number.MAX_SAFE_INTEGER)
      )[0];
      await db.collection("teams").updateOne(
        { _id: teamDoc._id, leaderId: teamDoc.leaderId ?? null },
        { $set: { leaderId: earliest._id, updatedAt: new Date() } }
      );
      leaderId = earliest._id.toString();
      for (const m of members) m.isLeader = m.id === leaderId;
    }

    return {
      id: teamDoc._id.toString(),
      name: teamDoc.name || "My Team",
      code: teamDoc.code || "VH26-000",
      capacity: Math.min(teamDoc.capacity || TEAM_MAX_SIZE, TEAM_MAX_SIZE),
      minSize: TEAM_MIN_SIZE,
      teamType: teamDoc.teamType || "VIT",
      track: teamDoc.track || null,
      leaderId,
      leaderName: members.find((m) => m.isLeader)?.name || null,
      members,
      submission: subDoc
        ? {
            title: subDoc.title || "",
            description: subDoc.description || "",
            projectType: subDoc.projectType || "",
            githubLink: subDoc.githubLink || "",
            figmaLink: subDoc.figmaLink || "",
            deckLink: subDoc.deckLink || "",
            otherLinks: subDoc.otherLinks || "",
            progressStatus: subDoc.progressStatus || "",
            teamConfidence: subDoc.teamConfidence || "",
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

function toRequester(participant: { id: string; type: "vit" | "external"; userId: string | null }) {
  return { id: participant.id, type: participant.type, userId: participant.userId };
}

function membershipErrorMessage(err: unknown, fallback: string) {
  return err instanceof TeamMembershipError ? err.message : fallback;
}

export async function deleteTeamAction() {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    await deleteTeam({ requester: toRequester(participant), teamId: participant.teamId });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (err) {
    console.error("[deleteTeamAction] Error:", err);
    return { success: false, error: membershipErrorMessage(err, "An unexpected error occurred.") };
  }
}

export async function leaveTeamAction() {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, error: "No active team session found." };
    }

    await leaveCurrentTeam(toRequester(participant), participant.teamId);

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (err) {
    console.error("[leaveTeamAction] Error:", err);
    return { success: false, error: membershipErrorMessage(err, "Failed to leave team.") };
  }
}

export async function removeTeamMemberAction(
  targetParticipantId: string,
  targetType: "vit" | "external"
) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    await removeTeamMember({
      requester: toRequester(participant),
      targetParticipantId,
      targetType,
      teamId: participant.teamId,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[removeTeamMemberAction] Error:", err);
    return { success: false, error: membershipErrorMessage(err, "Failed to remove member.") };
  }
}

export async function transferLeadershipAction(newLeaderParticipantId: string, newLeaderType: "vit" | "external") {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    await transferLeadership({
      requester: toRequester(participant),
      newLeaderParticipantId,
      newLeaderType,
      teamId: participant.teamId,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[transferLeadershipAction] Error:", err);
    return { success: false, error: membershipErrorMessage(err, "An unexpected error occurred.") };
  }
}

export async function renameTeamAction(teamId: string, teamName: string) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || participant.teamId !== teamId) {
      return { success: false, error: "Unauthorized." };
    }

    const db = await getMongoDb();
    if (!db) return { success: false, error: "Database unavailable." };

    const team = await db.collection("teams").findOne({ _id: toObjectId(teamId) }, { projection: { leaderId: 1 } });
    if (!team) return { success: false, error: "Team not found." };
    if (!isTeamLeader(team.leaderId, participant)) {
      return { success: false, error: "Only the leader can rename the team." };
    }

    const res = await renameTeamInDb(teamId, teamName);
    if (!res.success) return res;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[renameTeamAction] Error:", err);
    return { success: false, error: "Failed to rename team." };
  }
}
