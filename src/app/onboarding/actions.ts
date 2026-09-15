"use server";

import { cookies, headers } from "next/headers";
import QRCode from "qrcode";

import { auth } from "@/lib/auth";
import { TEST_SESSION_COOKIE } from "../test-dashboard/access";
import { generateUniqueTeamCode } from "../test-dashboard/utils";
import { joinTeamByCode, TeamMembershipError } from "../test-dashboard/team-membership";

import type { CheckInData, StudentType } from "@/components/onboarding/CheckInChecklist";
import {
  getMongoDb,
  getParticipantByEmail,
  getParticipantById,
  saveParticipantCheckInInDb,
  formatNameFromEmail,
  generateUniqueTeamCodeFromDb,
  createTeamInDb,
  validateTeamNameInDb,
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

export async function resolveCurrentParticipant(): Promise<CurrentOnboardingParticipant | null> {
  try {
    const cookieStore = await cookies();
    const testSession = cookieStore.get(TEST_SESSION_COOKIE)?.value;

    if (testSession) {
      const [type, id] = testSession.split(":");
      if ((type === "vit" || type === "external") && id) {
        try {
          const mongoParticipant = await getParticipantById(type as "vit" | "external", id);
          if (mongoParticipant) return mongoParticipant;
        } catch (sessionDbErr) {
          console.warn("[Onboarding] Error querying test session student:", sessionDbErr);
        }
      }
    }

    // 1. Primary: Check NextAuth session (Production Google OAuth authenticated users)
    try {
      const session = await auth();
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase().trim();
        console.log(`[Onboarding] Resolving participant for authenticated session: ${email}`);

        // Fast native Mongo lookup (works on Cloudflare Workers & Node.js)
        const mongoParticipant = await getParticipantByEmail(email, session.user.name);
        if (mongoParticipant) {
          console.log(
            `[Onboarding] Successfully resolved participant via MongoDB: ${mongoParticipant.name}, RegNo: ${mongoParticipant.regNo}`
          );
          return mongoParticipant;
        }
      }
    } catch (authErr) {
      console.warn("[Onboarding] Session lookup threw error, checking fallbacks:", authErr);
    }


    // 2. Secondary: Check preview / test session cookie
    if (testSession) {
      const [type, id] = testSession.split(":");
      if ((type === "vit" || type === "external") && id) {
        try {
          const mongoParticipant = await getParticipantById(type, id);
          if (mongoParticipant) return mongoParticipant;
        } catch {
          // Ignore
        }
      }
    }

    // No authenticated session found
    return null;
  } catch (topLevelErr) {
    console.error("[Onboarding] Top-level error in resolveCurrentParticipant:", topLevelErr);
  }

  return null;
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

    // Upfront check for unique and distinct team name
    const validation = await validateTeamNameInDb(trimmedName);
    if (!validation.valid) {
      return { success: false, error: validation.error || "This team name is already taken or too similar to an existing team." };
    }

    const participant = await resolveCurrentParticipant();
    if (!participant) {
      return { success: false, error: "Participant session not found. Please log in again." };
    }

    // Use passed code or generate a fresh unique code from MongoDB
    const code = (customCode?.trim() || (await generateUniqueTeamCodeFromDb())).toUpperCase();

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
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Please enter a team code." };
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      if (/^VH26-[A-Z0-9]{3,}$/i.test(normalized)) {
        return { success: true, teamName: "Alpha Squad (Preview)", memberCount: 2, capacity: 5 };
      }
      return { success: false, error: "Could not connect to database to verify team code." };
    }

    const [participant, team] = await Promise.all([
      resolveCurrentParticipant(),
      db.collection("teams").findOne(
        { code: new RegExp(`^${normalized}$`, "i") },
        { projection: { name: 1, teamType: 1, capacity: 1 } }
      ),
    ]);

    if (!team) {
      return { success: false, error: "Team not found. Verify the code." };
    }

    const capacity = team.capacity || 5;
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
        return { success: false, error: "This team is already full (5/5 members)." };
      }
    } else {
      if (memberCount >= capacity) {
        return { success: false, error: "This team is already full (5/5 members)." };
      }
    }

    return { success: true, teamName: team.name, memberCount, capacity };
  } catch (err) {
    console.error("[validateTeamCodeAction] Error:", err);
    if (/^VH26-[A-Z0-9]{3,}$/i.test(normalized)) {
      return { success: true, teamName: "Alpha Squad (Preview)", memberCount: 2, capacity: 5 };
    }
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

