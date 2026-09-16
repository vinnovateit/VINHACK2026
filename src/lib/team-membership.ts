import { getMongoDb, isTeamLeader, normalizeTeamCode, TEAM_MAX_SIZE } from "@/lib/mongo";
import { ObjectId, type Db } from "mongodb";
import { idMatchValues, toObjectId } from "@/lib/ids";

type ParticipantType = "vit" | "external";

type Participant = {
  id: string;
  type: ParticipantType;
  userId: string | null;
};

export class TeamMembershipError extends Error {}

// Ids reach this module from server actions, so reject anything that isn't a real ObjectId instead
// of letting it through into a query.
function toOid(id: string, message = "Team not found."): ObjectId {
  const oid = toObjectId(id);
  if (!oid) throw new TeamMembershipError(message);
  return oid;
}

const PARTICIPANT_NOT_FOUND = "Your participant record was not found. Please contact the organisers.";

function memberCollection(type: ParticipantType) {
  return type === "vit" ? "vit_students" : "external_students";
}

async function countMembers(db: Db, teamOid: any): Promise<number> {
  const [vitCount, extCount] = await Promise.all([
    db.collection("vit_students").countDocuments({ teamId: teamOid }),
    db.collection("external_students").countDocuments({ teamId: teamOid }),
  ]);
  return vitCount + extCount;
}

// Leaders are stored as the member's participant _id; the earliest joiner inherits leadership.
async function getRemainingLeaderId(db: Db, teamOid: any): Promise<ObjectId | null> {
  const [vit, ext] = await Promise.all([
    db.collection("vit_students").findOne(
      { teamId: teamOid },
      { projection: { joinedAt: 1 }, sort: { joinedAt: 1 } }
    ),
    db.collection("external_students").findOne(
      { teamId: teamOid },
      { projection: { joinedAt: 1 }, sort: { joinedAt: 1 } }
    ),
  ]);

  const winner = [vit, ext]
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const at = a?.joinedAt ? new Date(a.joinedAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bt = b?.joinedAt ? new Date(b.joinedAt).getTime() : Number.MAX_SAFE_INTEGER;
      return at - bt;
    })[0] as any;
  return winner?._id ?? null;
}

// Clean up a team after `participant` has left it: delete it if empty, hand off leadership otherwise.
async function settleTeamAfterDeparture(db: Db, participant: Participant, teamId: string) {
  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) return;

  if ((await countMembers(db, teamOid)) === 0) {
    await db.collection("submissions").deleteMany({ teamId: teamOid });
    await db.collection("teams").deleteOne({ _id: teamOid });
    return;
  }

  if (isTeamLeader(team.leaderId, participant)) {
    const newLeaderId = await getRemainingLeaderId(db, teamOid);
    await db.collection("teams").updateOne(
      { _id: teamOid },
      { $set: { leaderId: newLeaderId, updatedAt: new Date() } }
    );
  }
}

async function removeParticipantFromTeam(db: Db, participant: Participant, teamId: string) {
  await db.collection(memberCollection(participant.type)).updateOne(
    { _id: toOid(participant.id, PARTICIPANT_NOT_FOUND), teamId: { $in: idMatchValues(teamId) } },
    { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }
  );
  await settleTeamAfterDeparture(db, participant, teamId);
}

export async function leaveCurrentTeam(participant: Participant, teamId: string) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");
  await removeParticipantFromTeam(db, participant, teamId);
}

export async function removeTeamMember({
  requester,
  targetParticipantId,
  targetType,
  teamId,
}: {
  requester: Participant;
  targetParticipantId: string;
  targetType: ParticipantType;
  teamId: string;
}) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) throw new TeamMembershipError("Team not found.");
  if (!isTeamLeader(team.leaderId, requester)) {
    throw new TeamMembershipError("Only the current team leader can remove members.");
  }

  const target = await db.collection(memberCollection(targetType)).findOne(
    { _id: toOid(targetParticipantId, "That participant is not in your team.") },
    { projection: { teamId: 1, userId: 1 } }
  );
  if (!target || String(target.teamId) !== teamId) {
    throw new TeamMembershipError("That participant is not in your team.");
  }
  if (targetParticipantId === requester.id) {
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
  code: unknown
) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const normalizedCode = normalizeTeamCode(code);
  if (!normalizedCode) throw new TeamMembershipError("Team not found.");

  const targetTeam = await db.collection("teams").findOne(
    { code: normalizedCode },
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

  const capacity = Math.min(targetTeam.capacity || TEAM_MAX_SIZE, TEAM_MAX_SIZE);
  if ((await countMembers(db, targetTeam._id)) >= capacity) {
    throw new TeamMembershipError("Team is full.");
  }

  // Move the participant only if their team hasn't changed since we resolved them.
  const col = db.collection(memberCollection(participant.type));
  const participantOid = toOid(participant.id, PARTICIPANT_NOT_FOUND);
  const previousTeamFilter = participant.currentTeamId
    ? { teamId: { $in: idMatchValues(participant.currentTeamId) } }
    : { $or: [{ teamId: null }, { teamId: { $exists: false } }] };
  const now = new Date();
  const moved = await col.updateOne(
    { _id: participantOid, ...previousTeamFilter },
    { $set: { teamId: targetTeam._id, joinedAt: now, updatedAt: now } }
  );
  if (moved.matchedCount === 0) {
    throw new TeamMembershipError("Your team changed in the meantime. Refresh and try again.");
  }

  // Concurrent joins can both pass the capacity check; recount and back out if we overfilled.
  if ((await countMembers(db, targetTeam._id)) > capacity) {
    await col.updateOne(
      { _id: participantOid, teamId: targetTeam._id },
      {
        $set: {
          teamId: participant.currentTeamId ? toOid(participant.currentTeamId) : null,
          joinedAt: participant.currentTeamId ? now : null,
          updatedAt: new Date(),
        },
      }
    );
    throw new TeamMembershipError("Team is full.");
  }

  await db.collection("teams").updateOne({ _id: targetTeam._id }, { $set: { updatedAt: now } });

  if (participant.currentTeamId) {
    await settleTeamAfterDeparture(db, participant, participant.currentTeamId);
    return { status: "switched" as const };
  }
  return { status: "joined" as const };
}

export async function transferLeadership({
  requester,
  newLeaderParticipantId,
  newLeaderType,
  teamId,
}: {
  requester: Participant;
  newLeaderParticipantId: string;
  newLeaderType: ParticipantType;
  teamId: string;
}) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) throw new TeamMembershipError("Team not found.");
  if (!isTeamLeader(team.leaderId, requester)) {
    throw new TeamMembershipError("Only the current leader can transfer leadership.");
  }

  const newLeader = await db.collection(memberCollection(newLeaderType)).findOne(
    { _id: toOid(newLeaderParticipantId, "The selected participant is not in your team.") },
    { projection: { teamId: 1 } }
  );
  if (!newLeader || String(newLeader.teamId) !== teamId) {
    throw new TeamMembershipError("The selected participant is not in your team.");
  }
  if (newLeaderParticipantId === requester.id) {
    throw new TeamMembershipError("You are already the leader.");
  }

  await db.collection("teams").updateOne(
    { _id: teamOid },
    { $set: { leaderId: newLeader._id, updatedAt: new Date() } }
  );
}

export async function deleteTeam({ requester, teamId }: { requester: Participant; teamId: string }) {
  const db = await getMongoDb();
  if (!db) throw new TeamMembershipError("Database unavailable.");

  const teamOid = toOid(teamId);
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { leaderId: 1 } });
  if (!team) throw new TeamMembershipError("Team not found.");
  if (!isTeamLeader(team.leaderId, requester)) {
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
