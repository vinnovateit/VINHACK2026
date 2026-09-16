"use server";



import { auth } from "@/lib/auth";
import { joinTeamByCode, TeamMembershipError } from "@/lib/team-membership";

import type { CheckInData, StudentType } from "@/components/onboarding/CheckInChecklist";
import {
  getMongoDb,
  getParticipantByEmail,
  saveParticipantCheckInInDb,
  generateUniqueTeamCodeFromDb,
  createTeamInDb,
  validateTeamNameInDb,
  normalizeTeamCode,
  TEAM_MAX_SIZE,
} from "@/lib/mongo";
import { cleanOptionalNumber, cleanText, FIELD_LIMITS } from "@/lib/validation";
import { toObjectId } from "@/lib/ids";
import { signTeamCode, verifyTeamCodeToken } from "@/lib/team-code-token";

export type CurrentOnboardingParticipant = {
  id: string;
  name: string;
  type: StudentType;
  teamId: string | null;
  userId: string | null;
  email?: string;
  regNo?: string;
  phone?: string;
  year?: number;
  isHosteller?: boolean;
  blockType?: "MH" | "LH";
  hostelBlock?: string;
  roomNo?: string;
  address?: string;
  collegeName?: string;
  takingAccommodation?: boolean;
  team?: {
    id: string;
    name: string;
    code: string;
    capacity: number;
    teamType: string;
    leaderId: string | null;
  } | null;
};

// Only the signed NextAuth session identifies a participant. Never trust unsigned cookies here.
export async function resolveCurrentParticipant(): Promise<CurrentOnboardingParticipant | null> {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    const email = session.user.email.toLowerCase().trim();
    return await getParticipantByEmail(email, session.user.name);
  } catch (err) {
    console.error("[Onboarding] Failed to resolve participant from session:", err);
    return null;
  }
}

export async function saveCheckInAction(data: CheckInData) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant) {
      return { success: false, error: "Your session expired. Please sign in again." };
    }
    if (participant.id.startsWith("vit-") || participant.id.startsWith("ext-")) {
      return { success: false, error: "Your participant record was not found. Please contact the organisers." };
    }

    const name = cleanText(data.name, FIELD_LIMITS.name);
    const regNo = cleanText(data.regNo, FIELD_LIMITS.regNo);
    const phone = cleanText(data.phone, FIELD_LIMITS.phone);
    if (!name) return { success: false, error: "Please enter your name." };
    if (!phone) return { success: false, error: "Please enter your phone number." };

    const saved = await saveParticipantCheckInInDb(participant as any, {
      name,
      regNo: regNo || "",
      phone,
      year: cleanOptionalNumber(data.year, 1, 5),
      isHosteller: Boolean(data.isHosteller),
      blockType: data.blockType === "LH" ? "LH" : "MH",
      hostelBlock: cleanText(data.hostelBlock, FIELD_LIMITS.hostelBlock) || "",
      roomNo: cleanText(data.roomNo, FIELD_LIMITS.roomNo) || "",
      address: cleanText(data.address, FIELD_LIMITS.address) || "",
      collegeName: cleanText(data.collegeName, FIELD_LIMITS.collegeName) || "",
    });
    if (!saved) {
      return { success: false, error: "Could not save your details. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("[saveCheckInAction] Failed to persist check-in:", err);
    return { success: false, error: "Could not save your details. Please try again." };
  }
}

export async function prepareTeamCodeAction() {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant || !toObjectId(participant.id)) {
      return { success: false, teamCode: "", codeToken: "" };
    }

    const code = await generateUniqueTeamCodeFromDb();
    return { success: true, teamCode: code, codeToken: signTeamCode(participant.id, code) ?? "" };
  } catch (err) {
    console.error("[prepareTeamCodeAction] Error:", err);
    return { success: false, teamCode: "", codeToken: "" };
  }
}

export async function validateTeamNameAction(teamName: string) {
  try {
    return await validateTeamNameInDb(teamName);
  } catch (err) {
    console.error("[validateTeamNameAction] Error:", err);
    return { valid: true };
  }
}

export async function createTeamAction(teamName: string, previewCode?: string, codeToken?: string) {
  try {
    const trimmedName = typeof teamName === "string" ? teamName.trim() : "";
    if (!trimmedName) {
      return { success: false, error: "Please enter a team name before continuing." };
    }

    const participant = await resolveCurrentParticipant();
    if (!participant) {
      return { success: false, error: "Participant session not found. Please log in again." };
    }
    if (participant.teamId) {
      return { success: false, error: "You are already in a team. Leave it before creating a new one." };
    }

    // Keep the code the participant was shown only if the server issued it to them; otherwise
    // generate a new one here. The browser can never choose its own team code.
    const shownCode = normalizeTeamCode(previewCode);
    const code =
      shownCode && verifyTeamCodeToken(participant.id, shownCode, codeToken)
        ? shownCode
        : await generateUniqueTeamCodeFromDb();

    const res = await createTeamInDb({
      name: trimmedName,
      code,
      participant: participant as any,
    });

    if (res.success && res.teamId) {
      return {
        success: true,
        teamId: res.teamId,
        teamCode: res.code || code,
        teamName: trimmedName,
      };
    }

    return { success: false, error: res.error || "Failed to create team." };
  } catch (err) {
    console.error("[createTeamAction] Unhandled error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving your team.",
    };
  }
}

export async function validateTeamCodeAction(code: string) {
  if (typeof code !== "string" || !code.trim()) {
    return { success: false, error: "Please enter a team code." };
  }

  try {
    // Only signed-in, registered participants may look up a team code.
    const participant = await resolveCurrentParticipant();
    const participantOid = toObjectId(participant?.id);
    if (!participant || !participantOid) {
      return { success: false, error: "Your session expired. Please sign in again." };
    }

    const normalized = normalizeTeamCode(code);
    if (!normalized) {
      return { success: false, error: "Team not found. Verify the code." };
    }

    const db = await getMongoDb();
    if (!db) {
      return { success: false, error: "Could not connect to database to verify team code." };
    }

    const team = await db.collection("teams").findOne(
      { code: normalized },
      { projection: { name: 1, teamType: 1, capacity: 1 } }
    );
    if (!team) {
      return { success: false, error: "Team not found. Verify the code." };
    }

    const capacity = Math.min(team.capacity || TEAM_MAX_SIZE, TEAM_MAX_SIZE);
    const memberCol = team.teamType === "VIT" ? "vit_students" : "external_students";

    const [memberCount, alreadyMember] = await Promise.all([
      db.collection(memberCol).countDocuments({ teamId: team._id }),
      db.collection(memberCol).findOne({ teamId: team._id, _id: participantOid }, { projection: { _id: 1 } }),
    ]);

    const expectedType = participant.type === "vit" ? "VIT" : "EXTERNAL";
    if (team.teamType !== expectedType) {
      return {
        success: false,
        error: `Type mismatch: ${expectedType} participants cannot join a ${team.teamType} team.`,
      };
    }
    if (!alreadyMember && memberCount >= capacity) {
      return { success: false, error: `This team is already full (${capacity}/${capacity} members).` };
    }

    return { success: true, teamName: team.name, memberCount, capacity };
  } catch (err) {
    console.error("[validateTeamCodeAction] Error:", err);
    return { success: false, error: "Could not connect to database to verify team code." };
  }
}

export async function joinTeamAction(code: string) {
  try {
    const participant = await resolveCurrentParticipant();
    if (!participant) {
      return { success: false, error: "Session not found. Please log in again." };
    }

    const res = await joinTeamByCode(
      {
        id: participant.id,
        type: participant.type,
        userId: participant.userId,
        currentTeamId: participant.teamId,
      },
      code
    );

    return { success: true, status: res.status };
  } catch (error) {
    const message = error instanceof TeamMembershipError ? error.message : "Failed to join team.";
    console.error("[joinTeamAction] Error:", error);
    return { success: false, error: message };
  }
}

