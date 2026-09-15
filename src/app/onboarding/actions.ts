"use server";

import { headers } from "next/headers";
import QRCode from "qrcode";

import { auth } from "@/lib/auth";
import { joinTeamByCode, TeamMembershipError } from "../test-dashboard/team-membership";

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
import { ObjectId } from "mongodb";

function toObjectId(id: string): any {
  try { return new ObjectId(id); } catch { return id; }
}

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
      return { success: true, warning: "Session not found, continuing in preview mode." };
    }

    const name = data.name.trim();
    const regNo = (data.regNo || "").trim();
    const phone = (data.phone || "").trim();
    const address = (data.address || "").trim();

    if (participant.id && !participant.id.startsWith("vit-") && !participant.id.startsWith("ext-")) {
      const saved = await saveParticipantCheckInInDb(participant as any, {
        name,
        regNo,
        phone,
        year: data.year,
        isHosteller: data.isHosteller,
        blockType: data.blockType,
        hostelBlock: data.hostelBlock,
        roomNo: data.roomNo,
        address,
        collegeName: data.collegeName,
      });
      if (saved) {
        console.log(`[saveCheckInAction] Persisted check-in via MongoDB: ${name}`);
      }
    }

    return { success: true };
  } catch (err) {
    console.warn("[saveCheckInAction] Could not persist to DB, continuing:", err);
    return { success: true, warning: "Saved in preview mode." };
  }
}


export async function prepareTeamCodeAction() {
  try {
    const code = await generateUniqueTeamCodeFromDb();

    // Generate QR code for this candidate code without saving to database yet
    let qrDataUrl = "";
    try {
      const reqHeaders = await headers();
      const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
      const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || "localhost:3000";
      const protocol = reqHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      const origin = configuredOrigin || `${protocol}://${host}`;
      const joinUrl = `${origin}/onboarding?step=join-team&code=${code}`;

      qrDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    } catch {
      qrDataUrl = "";
    }

    return {
      success: true,
      teamCode: code,
      qrDataUrl,
    };
  } catch (err) {
    console.error("[prepareTeamCodeAction] Error:", err);
    const fallback = `VH26-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    return {
      success: true,
      teamCode: fallback,
      qrDataUrl: "",
    };
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

export async function createTeamAction(teamName: string, customCode?: string) {
  try {
    const trimmedName = teamName.trim();
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

    // Use the code shown to the user if it's well-formed, otherwise generate a fresh one
    const code = normalizeTeamCode(customCode || "") || (await generateUniqueTeamCodeFromDb());

    const res = await createTeamInDb({
      name: trimmedName,
      code,
      participant: participant as any,
    });

    if (res.success && res.teamId) {
      console.log(`[createTeamAction] Team successfully saved to MongoDB: ${trimmedName} (${code})`);
      return {
        success: true,
        teamId: res.teamId,
        teamCode: code,
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
  if (!code.trim()) {
    return { success: false, error: "Please enter a team code." };
  }
  const normalized = normalizeTeamCode(code);
  if (!normalized) {
    return { success: false, error: "Team not found. Verify the code." };
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      return { success: false, error: "Could not connect to database to verify team code." };
    }

    const [participant, team] = await Promise.all([
      resolveCurrentParticipant(),
      db.collection("teams").findOne(
        { code: normalized },
        { projection: { name: 1, teamType: 1, capacity: 1 } }
      ),
    ]);

    if (!team) {
      return { success: false, error: "Team not found. Verify the code." };
    }

    const capacity = Math.min(team.capacity || TEAM_MAX_SIZE, TEAM_MAX_SIZE);
    const memberCol = team.teamType === "VIT" ? "vit_students" : "external_students";
    const teamOid = team._id;

    const [memberCount, alreadyMember] = await Promise.all([
      db.collection(memberCol).countDocuments({ teamId: teamOid }),
      participant
        ? db.collection(memberCol).findOne({ teamId: teamOid, _id: toObjectId(participant.id) }, { projection: { _id: 1 } })
        : Promise.resolve(null),
    ]);

    if (participant) {
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
    } else {
      if (memberCount >= capacity) {
        return { success: false, error: `This team is already full (${capacity}/${capacity} members).` };
      }
    }

    return { success: true, teamName: team.name, memberCount, capacity };
  } catch (err) {
    console.error("[validateTeamCodeAction] Error:", err);
    return { success: false, error: "Could not connect to database to verify team code." };
  }
}


export async function joinTeamAction(code: string) {
  const normalized = code.trim().toUpperCase();

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
      normalized
    );

    return { success: true, status: res.status };
  } catch (error) {
    const message = error instanceof TeamMembershipError ? error.message : "Failed to join team.";
    console.error("[joinTeamAction] Error:", error);
    return { success: false, error: message };
  }
}

