"use server";

import { revalidatePath } from "next/cache";
import { getMongoDb, isTeamLeader, renameTeamInDb, TEAM_MIN_SIZE } from "@/lib/mongo";
import { toObjectId } from "@/lib/ids";
import { assignNewTeamCode } from "@/lib/teams";
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

export type SubmissionSection = "details" | "links" | "progress";

export type SubmissionSectionPayload =
  | {
      section: "details";
      track?: string;
      projectType?: string;
      projectTitle?: string;
      projectDescription?: string;
    }
  | {
      section: "links";
      githubLink?: string;
      figmaLink?: string;
      deckLink?: string;
      otherLinks?: string;
    }
  | {
      section: "progress";
      progressStatus?: string;
      teamConfidence?: string;
      progressNote?: string;
    };

const SECTION_SAVED_MESSAGES: Record<SubmissionSection, string> = {
  details: "Project details saved.",
  links: "Links & assets saved.",
  progress: "Progress update submitted.",
};

// Validates one section and returns only the submission fields that section owns, so saving one
// section never overwrites another.
function buildSectionFields(
  payload: SubmissionSectionPayload
): { fields: Record<string, unknown>; track?: string } | { error: string } {
  switch (payload?.section) {
    case "details": {
      if (!isValidTrack(payload.track)) {
        return { error: "Please choose one of the listed tracks." };
      }
      if (!isValidProjectType(payload.projectType)) {
        return { error: "Please choose whether your project is Software or Hardware." };
      }
      return {
        track: payload.track,
        fields: {
          title: cleanText(payload.projectTitle, FIELD_LIMITS.projectTitle),
          description: cleanText(payload.projectDescription, FIELD_LIMITS.projectDescription),
          projectType: payload.projectType,
        },
      };
    }
    case "links": {
      const links = {
        githubLink: cleanText(payload.githubLink, FIELD_LIMITS.link),
        figmaLink: cleanText(payload.figmaLink, FIELD_LIMITS.link),
        deckLink: cleanText(payload.deckLink, FIELD_LIMITS.link),
      };
      for (const [field, value] of Object.entries(links)) {
        if (value && !isValidHttpUrl(value)) {
          return { error: `${field.replace("Link", "")} link must be a valid http(s) URL.` };
        }
      }
      return { fields: { ...links, otherLinks: cleanText(payload.otherLinks, FIELD_LIMITS.otherLinks) } };
    }
    case "progress": {
      if (!isValidProgressStatus(payload.progressStatus) || !isValidTeamConfidence(payload.teamConfidence)) {
        return { error: "Please choose your current status and team confidence." };
      }
      return {
        fields: {
          progressStatus: payload.progressStatus,
          teamConfidence: payload.teamConfidence,
          progressNote: cleanText(payload.progressNote, FIELD_LIMITS.progressNote),
        },
      };
    }
    default:
      return { error: "Unknown submission section." };
  }
}

export async function saveSubmissionSectionAction(teamId: string, payload: SubmissionSectionPayload) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, message: "Unauthorized. Please sign in to submit." };
    }

    if (participant.teamId !== teamId) {
      return { success: false, message: "Unauthorized team action." };
    }

    const built = buildSectionFields(payload);
    if ("error" in built) {
      return { success: false, message: built.error };
    }

    const db = await getMongoDb();
    if (!db) return { success: false, message: "Database unavailable." };

    const teamOid = toObjectId(teamId);
    if (!teamOid) return { success: false, message: "Team not found." };

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

    const now = new Date();
    await db.collection("submissions").updateOne(
      { teamId: teamOid },
      {
        $set: { ...built.fields, [`${payload.section}UpdatedAt`]: now, updatedAt: now },
        $setOnInsert: { teamId: teamOid, submittedAt: now },
      },
      { upsert: true }
    );

    if (built.track) {
      await db.collection("teams").updateOne({ _id: teamOid }, { $set: { track: built.track, updatedAt: now } });
    }

    revalidatePath("/dashboard");
    return { success: true, message: SECTION_SAVED_MESSAGES[payload.section], savedAt: now.toISOString() };
  } catch (error) {
    console.error("[saveSubmissionSectionAction] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred while saving." };
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

    const teamOid = toObjectId(teamId);
    if (!teamOid) return { success: false, error: "Team not found." };
    const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
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

/** Leader-only: replace the team's join code. The old code and QR stop working immediately. */
export async function regenerateTeamCodeAction() {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !participant.teamId) {
      return { success: false, error: "Unauthorized." };
    }

    const db = await getMongoDb();
    if (!db) return { success: false, error: "Database unavailable." };

    const teamOid = toObjectId(participant.teamId);
    if (!teamOid) return { success: false, error: "Team not found." };
    const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1, code: 1 } });
    if (!team) return { success: false, error: "Team not found." };
    if (!isTeamLeader(team.leaderId, participant)) {
      return { success: false, error: "Only the team leader can change the team code." };
    }

    const code = await assignNewTeamCode(db, teamOid, team.code);
    if (!code) return { success: false, error: "Could not generate a new code. Please try again." };

    revalidatePath("/dashboard");
    return { success: true, code };
  } catch (err) {
    console.error("[regenerateTeamCodeAction] Error:", err);
    return { success: false, error: "Failed to change the team code." };
  }
}
