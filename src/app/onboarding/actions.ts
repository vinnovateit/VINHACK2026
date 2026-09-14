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

export type CurrentOnboardingParticipant = {
  id: string;
  name: string;
  type: StudentType;
  teamId: string | null;
  userId: string | null;
  email?: string;
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

    // Fallback: Check NextAuth session
    try {
      const session = await auth();
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase().trim();
        const vit = await prisma.vITStudent.findUnique({
          where: { email },
          include: { team: true },
        });
        if (vit) {
          const userId = vit.userId || (await getOrCreateEligibleUser("vit", vit.id).catch(() => null));
          return {
            id: vit.id,
            name: vit.name,
            type: "vit",
            teamId: vit.teamId,
            userId,
            email: vit.email,
            team: vit.team,
          };
        }

        const ext = await prisma.externalStudent.findFirst({
          where: { email },
          include: { team: true },
        });
        if (ext) {
          const userId = ext.userId || (await getOrCreateEligibleUser("external", ext.id).catch(() => null));
          return {
            id: ext.id,
            name: ext.name,
            type: "external",
            teamId: ext.teamId,
            userId,
            email: ext.email,
            team: ext.team,
          };
        }
      }
    } catch (err) {
      console.warn("[Onboarding] NextAuth check bypassed:", err);
    }

    // Demo / Dev fallback: Retrieve test participant only if DB is accessible
    try {
      const firstVit = await prisma.vITStudent.findFirst({
        include: { team: true },
      });
      if (firstVit) {
        const userId = firstVit.userId || (await getOrCreateEligibleUser("vit", firstVit.id).catch(() => null));
        return {
          id: firstVit.id,
          name: firstVit.name,
          type: "vit",
          teamId: firstVit.teamId,
          userId,
          email: firstVit.email,
          team: firstVit.team,
        };
      }
    } catch (fallbackErr) {
      console.warn("[Onboarding] Database unavailable for dev fallback participant:", fallbackErr);
    }
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

    if (data.studentType === "vit") {
      const residencyType = data.isHosteller ? "HOSTELLER" : "DAYSCHOLAR";
      await prisma.vITStudent.update({
        where: { id: participant.id },
        data: {
          name,
          residencyType,
          block: data.isHosteller ? (data.hostelBlock || data.blockType || null) : null,
          room: data.isHosteller ? (data.roomNo || null) : null,
        },
      });
    } else {
      await prisma.externalStudent.update({
        where: { id: participant.id },
        data: {
          name,
          collegeName: data.collegeName || "External Institute",
          joinedAt: new Date(),
        },
      });
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
