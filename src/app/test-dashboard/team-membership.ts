import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ParticipantType = "vit" | "external";

type Participant = {
  id: string;
  type: ParticipantType;
  userId: string | null;
};

type TransactionClient = Prisma.TransactionClient;

export class TeamMembershipError extends Error {}

async function getRemainingLeaderUserId(tx: TransactionClient, teamId: string): Promise<string | null> {
  const [vitMember, externalMember] = await Promise.all([
    tx.vITStudent.findFirst({
      where: { teamId, userId: { not: null } },
      orderBy: { joinedAt: "asc" },
      select: { userId: true, joinedAt: true },
    }),
    tx.externalStudent.findFirst({
      where: { teamId, userId: { not: null } },
      orderBy: { joinedAt: "asc" },
      select: { userId: true, joinedAt: true },
    }),
  ]);

  const candidates = [vitMember, externalMember]
    .filter((member): member is { userId: string; joinedAt: Date | null } => Boolean(member?.userId))
    .sort((a, b) => {
      const aTime = a.joinedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.joinedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  return candidates[0]?.userId ?? null;
}

async function removeParticipantFromTeamInTransaction(tx: TransactionClient, participant: Participant, teamId: string) {
  const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true, leaderId: true } });
  if (!team) return;

  if (participant.type === "vit") {
    await tx.vITStudent.update({
      where: { id: participant.id },
      data: { teamId: null, joinedAt: null },
    });
  } else {
    await tx.externalStudent.update({
      where: { id: participant.id },
      data: { teamId: null, joinedAt: null },
    });
  }

  const [vitCount, externalCount] = await Promise.all([
    tx.vITStudent.count({ where: { teamId } }),
    tx.externalStudent.count({ where: { teamId } }),
  ]);

  if (vitCount + externalCount === 0) {
    await tx.submission.deleteMany({ where: { teamId } });
    await tx.team.delete({ where: { id: teamId } });
    return;
  }

  if (team.leaderId && participant.userId === team.leaderId) {
    await tx.team.update({
      where: { id: teamId },
      data: { leaderId: await getRemainingLeaderUserId(tx, teamId) },
    });
  }
}

export async function leaveCurrentTeam(participant: Participant, teamId: string) {
  await prisma.$transaction(async (tx) => {
    await removeParticipantFromTeamInTransaction(tx, participant, teamId);
  });
}

export async function removeTeamMember({
  requesterUserId,
  targetParticipantId,
  targetType,
  teamId,
}: {
  requesterUserId: string | null;
  targetParticipantId: string;
  targetType: ParticipantType;
  teamId: string;
}) {
  if (!requesterUserId) {
    throw new TeamMembershipError("Your participant record is not linked to a user yet.");
  }

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true, leaderId: true } });
    if (!team) throw new TeamMembershipError("Team not found.");
    if (team.leaderId !== requesterUserId) {
      throw new TeamMembershipError("Only the current team leader can remove members.");
    }

    const target =
      targetType === "vit"
        ? await tx.vITStudent.findUnique({ where: { id: targetParticipantId }, select: { id: true, teamId: true, userId: true } })
        : await tx.externalStudent.findUnique({ where: { id: targetParticipantId }, select: { id: true, teamId: true, userId: true } });

    if (!target || target.teamId !== teamId) {
      throw new TeamMembershipError("That participant is not in your team.");
    }

    if (target.userId === requesterUserId) {
      throw new TeamMembershipError("Use Leave Team to remove yourself and transfer leadership.");
    }

    await removeParticipantFromTeamInTransaction(tx, { id: target.id, type: targetType, userId: target.userId }, teamId);
  });
}

/**
 * Fully atomic join: leaves old team and joins new team in a single transaction.
 * No in-between state where participant is teamless.
 */
export async function joinTeamByCode(participant: Participant & { currentTeamId: string | null }, code: string) {
  let switchedTeams = false;
  const existingTeamId = participant.currentTeamId;

  // Peek target team id before entering the transaction (read-only, safe to do outside)
  const targetPreview = await prisma.team.findUnique({
    where: { code },
    select: { id: true },
  });
  if (!targetPreview) throw new TeamMembershipError("Team not found.");

  if (existingTeamId === targetPreview.id) {
    return { status: "already-member" as const };
  }

  if (existingTeamId) {
    switchedTeams = true;
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Re-fetch target inside tx for consistency
      const team = await tx.team.findUnique({
        where: { code },
        select: { id: true, capacity: true, teamType: true },
      });
      if (!team) throw new TeamMembershipError("Team not found.");

      const selectedType = participant.type === "vit" ? "VIT" : "EXTERNAL";
      if (selectedType !== team.teamType) {
        throw new TeamMembershipError(`Type mismatch: ${selectedType} participants cannot join a ${team.teamType} team.`);
      }

      const memberCount =
        team.teamType === "VIT"
          ? await tx.vITStudent.count({ where: { teamId: team.id } })
          : await tx.externalStudent.count({ where: { teamId: team.id } });

      if (memberCount >= team.capacity) {
        throw new TeamMembershipError("Team is full.");
      }

      // Leave old team atomically within same transaction
      if (existingTeamId) {
        await removeParticipantFromTeamInTransaction(tx, participant, existingTeamId);
      }

      // Join new team
      const now = new Date();
      await tx.team.update({ where: { id: team.id }, data: { updatedAt: now } });

      if (participant.type === "vit") {
        await tx.vITStudent.update({
          where: { id: participant.id },
          data: { teamId: team.id, joinedAt: now },
        });
      } else {
        await tx.externalStudent.update({
          where: { id: participant.id },
          data: { teamId: team.id, joinedAt: now },
        });
      }
    });
  } catch (error) {
    if (error instanceof TeamMembershipError) throw error;
    throw new TeamMembershipError("Failed to join team. Please try again.");
  }

  return { status: switchedTeams ? ("switched" as const) : ("joined" as const) };
}

/**
 * Transfer leadership to another member of the team.
 */
export async function transferLeadership({
  requesterUserId,
  newLeaderParticipantId,
  newLeaderType,
  teamId,
}: {
  requesterUserId: string | null;
  newLeaderParticipantId: string;
  newLeaderType: ParticipantType;
  teamId: string;
}) {
  if (!requesterUserId) {
    throw new TeamMembershipError("Your participant record is not linked to a user yet.");
  }

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true, leaderId: true } });
    if (!team) throw new TeamMembershipError("Team not found.");
    if (team.leaderId !== requesterUserId) {
      throw new TeamMembershipError("Only the current leader can transfer leadership.");
    }

    const newLeader =
      newLeaderType === "vit"
        ? await tx.vITStudent.findUnique({ where: { id: newLeaderParticipantId }, select: { id: true, teamId: true, userId: true } })
        : await tx.externalStudent.findUnique({ where: { id: newLeaderParticipantId }, select: { id: true, teamId: true, userId: true } });

    if (!newLeader || newLeader.teamId !== teamId) {
      throw new TeamMembershipError("The selected participant is not in your team.");
    }
    if (!newLeader.userId) {
      throw new TeamMembershipError("That participant doesn't have a user account linked yet.");
    }
    if (newLeader.userId === requesterUserId) {
      throw new TeamMembershipError("You are already the leader.");
    }

    await tx.team.update({
      where: { id: teamId },
      data: { leaderId: newLeader.userId },
    });
  });
}

/**
 * Delete the team entirely. Only the leader can do this.
 * Cascades: clears all member teamIds, deletes submission, deletes team.
 */
export async function deleteTeam({
  requesterUserId,
  teamId,
}: {
  requesterUserId: string | null;
  teamId: string;
}) {
  if (!requesterUserId) {
    throw new TeamMembershipError("Your participant record is not linked to a user yet.");
  }

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true, leaderId: true } });
    if (!team) throw new TeamMembershipError("Team not found.");
    if (team.leaderId !== requesterUserId) {
      throw new TeamMembershipError("Only the team leader can delete the team.");
    }

    // Clear all members' teamId
    await tx.vITStudent.updateMany({ where: { teamId }, data: { teamId: null, joinedAt: null } });
    await tx.externalStudent.updateMany({ where: { teamId }, data: { teamId: null, joinedAt: null } });

    // Delete submission if any
    await tx.submission.deleteMany({ where: { teamId } });

    // Delete team
    await tx.team.delete({ where: { id: teamId } });
  });
}
