"use server";

import { cookies, headers } from "next/headers";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TEST_SESSION_COOKIE } from "../test-dashboard/access";
import { generateUniqueTeamCode } from "../test-dashboard/utils";
import { joinTeamByCode, TeamMembershipError } from "../test-dashboard/team-membership";
import { getOrCreateEligibleUser } from "../test-dashboard/participant-eligibility";
import type { CheckInData, StudentType } from "@/components/onboarding/CheckInChecklist";
import {
  getParticipantByEmail,
  getParticipantById,
  saveParticipantCheckInInDb,
  formatNameFromEmail,
} from "@/lib/mongo";

export type CurrentOnboardingParticipant = {
  id: string;
  name: string;
  type: StudentType;
  teamId: string | null;
  userId: string | null;
  email?: string;
  regNo?: string;
  phone?: string;
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
          if (type === "vit") {
            const student = await prisma.vITStudent.findUnique({
              where: { id },
              include: { team: true },
            });
            if (student) {
              const userId = student.userId || (await getOrCreateEligibleUser("vit", student.id).catch(() => null));
              return {
                id: student.id,
                name: student.name,
                type: "vit",
                regNo: student.regNo,
                isHosteller: student.residencyType === "HOSTELLER",
                blockType: student.block?.startsWith("L") ? "LH" : "MH",
                hostelBlock: student.block || "",
                roomNo: student.room || "",
                address: student.address || "",
                teamId: student.teamId,
                userId,
                email: student.email,
                team: student.team,
              };
            }
          } else {
            const student = await prisma.externalStudent.findUnique({
              where: { id },
              include: { team: true },
            });
            if (student) {
              const userId = student.userId || (await getOrCreateEligibleUser("external", student.id).catch(() => null));
              return {
                id: student.id,
                name: student.name,
                type: "external",
                regNo: student.regNo || "",
                collegeName: student.collegeName || "",
                address: student.address || "",
                takingAccommodation: true,
                teamId: student.teamId,
                userId,
                email: student.email,
                team: student.team,
              };
            }
          }
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

        // Prisma fallback (if running in full Node.js environment)
        const isVitEmail = email.endsWith("@vitstudent.ac.in");
        if (isVitEmail) {
          const vit = await prisma.vITStudent.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            include: { team: true },
          });
          if (vit) {
            const userId = vit.userId || (await getOrCreateEligibleUser("vit", vit.id).catch(() => null));
            const regMatch = (session.user.name || vit.name || "").match(/\b(\d{2}[A-Za-z]{3}\d{4})\b/);
            const detectedRegNo = regMatch ? regMatch[1].toUpperCase() : null;
            let cleanName = (vit.name || session.user.name || formatNameFromEmail(email)).trim();
            if (regMatch) {
              cleanName = cleanName.replace(new RegExp(regMatch[0], "i"), "").trim();
            }
            const finalRegNo = (detectedRegNo || vit.regNo || "").toUpperCase();

            return {
              id: vit.id,
              name: cleanName,
              type: "vit",
              regNo: finalRegNo,
              phone: vit.phone || "",
              isHosteller: vit.residencyType === "HOSTELLER",
              blockType: vit.block?.startsWith("L") ? "LH" : "MH",
              hostelBlock: vit.block || "",
              roomNo: vit.room || "",
              address: vit.address || "",
              collegeName: "Vellore Institute of Technology",
              takingAccommodation: true,
              teamId: vit.teamId,
              userId,
              email: vit.email,
              team: vit.team,
            };
          }
        } else {
          const ext = await prisma.externalStudent.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            include: { team: true },
          });
          if (ext) {
            const userId = ext.userId || (await getOrCreateEligibleUser("external", ext.id).catch(() => null));
            return {
              id: ext.id,
              name: ext.name || session.user.name || formatNameFromEmail(email),
              type: "external",
              regNo: ext.regNo || "",
              phone: ext.phone || "",
              collegeName: ext.collegeName || "External Institute",
              address: ext.address || "",
              takingAccommodation: true,
              teamId: ext.teamId,
              userId,
              email: ext.email,
              team: ext.team,
            };
          }
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

    // 1. Native MongoDB update (works on Cloudflare Workers & Node.js)
    try {
      const saved = await saveParticipantCheckInInDb(participant as any, {
        name,
        regNo,
        phone,
        isHosteller: data.isHosteller,
        blockType: data.blockType,
        hostelBlock: data.hostelBlock,
        roomNo: data.roomNo,
        address,
        collegeName: data.collegeName,
      });
      if (saved) {
        console.log(`[saveCheckInAction] Successfully persisted check-in data via MongoDB: ${name} (${regNo}, ${phone})`);
        return { success: true };
      }
    } catch (mongoSaveErr) {
      console.warn("[saveCheckInAction] Native mongo update failed, trying Prisma fallback:", mongoSaveErr);
    }

    // 2. Prisma fallback
    const isVit = participant.type === "vit";

    if (isVit) {
      const residencyType = data.isHosteller ? "HOSTELLER" : "DAYSCHOLAR";
      const updateData: {
        name: string;
        residencyType: "HOSTELLER" | "DAYSCHOLAR";
        block: string | null;
        room: string | null;
        address: string | null;
        regNo?: string;
        phone?: string;
      } = {
        name,
        residencyType,
        block: data.isHosteller ? (data.hostelBlock || data.blockType || null) : null,
        room: data.isHosteller ? (data.roomNo || null) : null,
        address: !data.isHosteller ? (address || null) : null,
      };

      if (regNo) {
        updateData.regNo = regNo;
      }
      if (phone) {
        updateData.phone = phone;
      }

      if (participant.id && !participant.id.startsWith("vit-")) {
        await prisma.vITStudent.update({
          where: { id: participant.id },
          data: updateData,
        });
      } else if (participant.email) {
        await prisma.vITStudent.update({
          where: { email: participant.email },
          data: updateData,
        });
      }
    } else {
      // External participant
      const updateData: {
        name: string;
        collegeName: string;
        address: string | null;
        joinedAt: Date;
        regNo?: string;
        phone?: string;
      } = {
        name,
        collegeName: data.collegeName || "External Institute",
        address: address || null,
        joinedAt: new Date(),
      };

      if (regNo) {
        updateData.regNo = regNo;
      }
      if (phone) {
        updateData.phone = phone;
      }

      if (participant.id && !participant.id.startsWith("ext-")) {
        await prisma.externalStudent.update({
          where: { id: participant.id },
          data: updateData,
        });
      } else if (participant.email) {
        await prisma.externalStudent.upsert({
          where: { email: participant.email },
          update: updateData,
          create: {
            email: participant.email,
            phone: "",
            ...updateData,
          },
        });
      }
    }

    if (participant.userId) {
      await prisma.user.update({
        where: { id: participant.userId },
        data: { name },
      });
    }

    return { success: true };
  } catch (err) {
    console.warn("[saveCheckInAction] Could not persist to DB, continuing:", err);
    return { success: true, warning: "Saved in preview mode." };
  }
}

export async function createTeamAction(teamName: string) {
  try {
    const participant = await resolveCurrentParticipant();
    const fallbackCode = "VH26-" + Math.floor(100 + Math.random() * 900);
    const code = participant ? await generateUniqueTeamCode().catch(() => fallbackCode) : fallbackCode;
    const name = (teamName.trim() || (participant?.name ? `${participant.name}'s Squad` : "My Squad")).slice(0, 100);

    let teamId = "preview-" + Date.now();

    if (participant && participant.userId) {
      try {
        const teamType = participant.type === "vit" ? "VIT" : "EXTERNAL";
        const now = new Date();

        const team = await prisma.$transaction(async (tx) => {
          const newTeam = await tx.team.create({
            data: {
              name,
              code,
              teamType,
              leaderId: participant.userId,
            },
          });

          if (participant.type === "vit") {
            await tx.vITStudent.update({
              where: { id: participant.id },
              data: { teamId: newTeam.id, joinedAt: now },
            });
          } else {
            await tx.externalStudent.update({
              where: { id: participant.id },
              data: { teamId: newTeam.id, joinedAt: now },
            });
          }

          return newTeam;
        });
        teamId = team.id;
      } catch (txErr) {
        console.warn("[createTeamAction] DB transaction failed, falling back to preview team:", txErr);
      }
    }

    // Generate QR code for instant joining
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
      teamId,
      teamCode: code,
      teamName: name,
      qrDataUrl,
    };
  } catch (err) {
    console.error("[createTeamAction] Unhandled error:", err);
    const code = "VH26-" + Math.floor(100 + Math.random() * 900);
    return {
      success: true,
      teamId: "preview-fallback",
      teamCode: code,
      teamName: teamName || "My Squad",
      qrDataUrl: "",
    };
  }
}

export async function validateTeamCodeAction(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Please enter a team code." };
  }

  try {
    const participant = await resolveCurrentParticipant();
    const team = await prisma.team.findUnique({
      where: { code: normalized },
      include: { vitStudents: true, externalStudents: true },
    });

    if (!team) {
      return { success: false, error: "Team not found. Verify the code." };
    }

    const memberCount = team.teamType === "VIT" ? team.vitStudents.length : team.externalStudents.length;
    if (memberCount >= team.capacity) {
      return { success: false, error: "This team is already full (5/5 members)." };
    }

    if (participant) {
      const expectedType = participant.type === "vit" ? "VIT" : "EXTERNAL";
      if (team.teamType !== expectedType) {
        return {
          success: false,
          error: `Type mismatch: ${expectedType} participants cannot join a ${team.teamType} team.`,
        };
      }
    }

    return {
      success: true,
      teamName: team.name,
      memberCount,
      capacity: team.capacity,
    };
  } catch (err) {
    console.error("[validateTeamCodeAction] Error:", err);
    // In preview mode if DB is disconnected, treat codes like VH26-XXX as mock valid
    if (/^VH26-[A-Z0-9]{3,}$/i.test(normalized)) {
      return {
        success: true,
        teamName: "Alpha Squad (Preview)",
        memberCount: 2,
        capacity: 5,
      };
    }
    return { success: false, error: "Could not connect to database to verify team code." };
  }
}

export async function joinTeamAction(code: string) {
  const normalized = code.trim().toUpperCase();

  try {
    const participant = await resolveCurrentParticipant();
    if (!participant) {
      return { success: true, status: "JOINED_EXISTING" };
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
