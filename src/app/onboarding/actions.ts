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
  const cookieStore = await cookies();
  const testSession = cookieStore.get(TEST_SESSION_COOKIE)?.value;

  if (testSession) {
    const [type, id] = testSession.split(":");
    if ((type === "vit" || type === "external") && id) {
      if (type === "vit") {
        const student = await prisma.vITStudent.findUnique({
          where: { id },
          include: { team: true },
        });
        if (student) {
          const userId = student.userId || (await getOrCreateEligibleUser("vit", student.id));
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
          const userId = student.userId || (await getOrCreateEligibleUser("external", student.id));
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
        const userId = vit.userId || (await getOrCreateEligibleUser("vit", vit.id));
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
        const userId = ext.userId || (await getOrCreateEligibleUser("external", ext.id));
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
    console.error("Error reading NextAuth in onboarding:", err);
  }

  // Demo / Dev fallback: Retrieve or create a test participant so onboarding is always testable
  const firstVit = await prisma.vITStudent.findFirst({
    include: { team: true },
  });
  if (firstVit) {
    const userId = firstVit.userId || (await getOrCreateEligibleUser("vit", firstVit.id));
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

  return null;
}

export async function saveCheckInAction(data: CheckInData) {
  const participant = await resolveCurrentParticipant();
  if (!participant) {
    throw new Error("No participant session found.");
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
}

export async function createTeamAction(teamName: string) {
  const participant = await resolveCurrentParticipant();
  if (!participant) {
    throw new Error("Participant session required to create team.");
  }

  if (!participant.userId) {
    throw new Error("Participant must have an associated user account.");
  }

  const name = (teamName.trim() || `${participant.name}'s Squad`).slice(0, 100);
  const code = await generateUniqueTeamCode();
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

  // Generate QR code for instant joining
  const reqHeaders = await headers();
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || "localhost:3000";
  const protocol = reqHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = configuredOrigin || `${protocol}://${host}`;
  const joinUrl = `${origin}/onboarding?step=join-team&code=${code}`;

  let qrDataUrl = "";
  try {
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
    teamId: team.id,
    teamCode: team.code,
    teamName: team.name,
    qrDataUrl,
  };
}

export async function validateTeamCodeAction(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Please enter a team code." };
  }

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
}

export async function joinTeamAction(code: string) {
  const participant = await resolveCurrentParticipant();
  if (!participant) {
    throw new Error("You must be signed in to join a team.");
  }

  const normalized = code.trim().toUpperCase();

  try {
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
    return { success: false, error: message };
  }
}
