import { getMongoDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

type ParticipantType = "vit" | "external";

type Participant = {
  id: string;
  type: ParticipantType;
  userId: string | null;
};

export class TeamMembershipError extends Error {}

function toOid(id: string): any {
  try { return new ObjectId(id); } catch { return id; }
}

async function getRemainingLeaderId(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  teamId: string
): Promise<ObjectId | null> {
  const oid = toOid(teamId);
  const [vit, ext] = await Promise.all([
    db!.collection("vit_students").findOne(
      { teamId: oid, userId: { $ne: null } },
      { projection: { userId: 1, joinedAt: 1 }, sort: { joinedAt: 1 } }
    ),
    db!.collection("external_students").findOne(
      { teamId: oid, userId: { $ne: null } },
      { projection: { userId: 1, joinedAt: 1 }, sort: { joinedAt: 1 } }
    ),
  ]);

  const candidates = [vit, ext]
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const at = a?.joinedAt ? new Date(a.joinedAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bt = b?.joinedAt ? new Date(b.joinedAt).getTime() : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });

  const winner = candidates[0] as any;
  return winner?.userId ? toOid(String(winner.userId)) : null;
}

async function removeParticipantFromTeam(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  participant: Participant,
  teamId: string
) {
  const teamOid = toOid(teamId);
  const team = await db!.collection("teams").findOne(
    { _id: teamOid },
    { projection: { leaderId: 1 } }
  );
  if (!team) return;

  const col = participant.type === "vit" ? "vit_students" : "external_students";
  await db!.collection(col).updateOne(
    { _id: toOid(participant.id) },
    { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }
  );

  const [vitCount, extCount] = await Promise.all([
    db!.collection("vit_students").countDocuments({ teamId: teamOid }),
    db!.collection("external_students").countDocuments({ teamId: teamOid }),
  ]);

  if (vitCount + extCount === 0) {
    await db!.collection("submissions").deleteMany({ teamId: teamOid });
    await db!.collection("teams").deleteOne({ _id: teamOid });
    return;
  }

  // Transfer leadership if the leaver was the leader
  if (team.leaderId && participant.userId && String(team.leaderId) === participant.userId) {
    const newLeaderId = await getRemainingLeaderId(db, teamId);
    await db!.collection("teams").updateOne(
      { _id: teamOid },
      { $set: { leaderId: newLeaderId, updatedAt: new Date() } }
    );
  }
}

export async function leaveCurrentTeam(participant: Participant, teamId: string) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");
  await removeParticipantFromTeam(db, participant, teamId);
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
  if (!requesterUserId) throw new TeamMembershipError("Your participant record is not linked to a user yet.");

  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) throw new TeamMembershipError("Team not found.");
  if (String(team.leaderId) !== requesterUserId) {
    throw new TeamMembershipError("Only the current team leader can remove members.");
  }

  const col = targetType === "vit" ? "vit_students" : "external_students";
  const target = await db.collection(col).findOne(
    { _id: toOid(targetParticipantId) },
    { projection: { teamId: 1, userId: 1 } }
  );
  if (!target || String(target.teamId) !== teamId) {
    throw new TeamMembershipError("That participant is not in your team.");
  }
  if (target.userId && String(target.userId) === requesterUserId) {
    throw new TeamMembershipError("Use Leave Team to remove yourself and transfer leadership.");
  }

  await removeParticipantFromTeam(
    db,
    { id: targetParticipantId, type: targetType, userId: target.userId ? String(target.userId) : null },
    teamId
  );
}

export async function joinTeamByCode(
  participant: Participant & { currentTeamId: string | null },
  code: string
) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const targetTeam = await db.collection("teams").findOne(
    { code: new RegExp(`^${code}$`, "i") },
    { projection: { _id: 1, capacity: 1, teamType: 1 } }
  );
  if (!targetTeam) throw new TeamMembershipError("Team not found.");

  const targetTeamId = targetTeam._id.toString();

  if (participant.currentTeamId === targetTeamId) {
    return { status: "already-member" as const };
  }

  const selectedType = participant.type === "vit" ? "VIT" : "EXTERNAL";
  if (selectedType !== targetTeam.teamType) {
    throw new TeamMembershipError(
      `Type mismatch: ${selectedType} participants cannot join a ${targetTeam.teamType} team.`
    );
  }

  // Clear stale team reference if old team no longer exists
  let resolvedExistingTeamId = participant.currentTeamId;
  if (resolvedExistingTeamId) {
    const existingTeam = await db.collection("teams").findOne(
      { _id: toOid(resolvedExistingTeamId) },
      { projection: { _id: 1 } }
    );
    if (!existingTeam) {
      const col = participant.type === "vit" ? "vit_students" : "external_students";
      await db.collection(col).updateOne(
        { _id: toOid(participant.id) },
        { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }
      );
      resolvedExistingTeamId = null;
    }
  }

  const switchedTeams = Boolean(resolvedExistingTeamId);

  // Check team capacity
  const memberCol = targetTeam.teamType === "VIT" ? "vit_students" : "external_students";
  const memberCount = await db.collection(memberCol).countDocuments({ teamId: targetTeam._id });
  if (memberCount >= targetTeam.capacity) {
    throw new TeamMembershipError("Team is full.");
  }

  // Leave old team if present
  if (resolvedExistingTeamId) {
    await removeParticipantFromTeam(db, participant, resolvedExistingTeamId);
  }

  // Join new team
  const now = new Date();
  const col = participant.type === "vit" ? "vit_students" : "external_students";
  await db.collection(col).updateOne(
    { _id: toOid(participant.id) },
    { $set: { teamId: targetTeam._id, joinedAt: now, updatedAt: now } }
  );
  await db.collection("teams").updateOne(
    { _id: targetTeam._id },
    { $set: { updatedAt: now } }
  );

  return { status: switchedTeams ? ("switched" as const) : ("joined" as const) };
}

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
  if (!requesterUserId) throw new TeamMembershipError("Your participant record is not linked to a user yet.");

  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) throw new TeamMembershipError("Team not found.");
  if (String(team.leaderId) !== requesterUserId) {
    throw new TeamMembershipError("Only the current leader can transfer leadership.");
  }

  const col = newLeaderType === "vit" ? "vit_students" : "external_students";
  const newLeader = await db.collection(col).findOne(
    { _id: toOid(newLeaderParticipantId) },
    { projection: { teamId: 1, userId: 1 } }
  );
  if (!newLeader || String(newLeader.teamId) !== teamId) {
    throw new TeamMembershipError("The selected participant is not in your team.");
  }
  if (!newLeader.userId) {
    throw new TeamMembershipError("That participant doesn't have a user account linked yet.");
  }
  if (String(newLeader.userId) === requesterUserId) {
    throw new TeamMembershipError("You are already the leader.");
  }

  await db.collection("teams").updateOne(
    { _id: teamOid },
    { $set: { leaderId: toOid(String(newLeader.userId)), updatedAt: new Date() } }
  );
}

export async function deleteTeam({
  requesterUserId,
  teamId,
}: {
  requesterUserId: string | null;
  teamId: string;
}) {
  if (!requesterUserId) throw new TeamMembershipError("Your participant record is not linked to a user yet.");

  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) throw new TeamMembershipError("Team not found.");
  if (String(team.leaderId) !== requesterUserId) {
    throw new TeamMembershipError("Only the team leader can delete the team.");
  }

  const teamFilter = { teamId: teamOid };
  await Promise.all([
    db.collection("vit_students").updateMany(teamFilter, { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }),
    db.collection("external_students").updateMany(teamFilter, { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }),
    db.collection("submissions").deleteMany(teamFilter),
  ]);
  await db.collection("teams").deleteOne({ _id: teamOid });
}
