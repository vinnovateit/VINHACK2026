import "server-only";

import type { Db, ObjectId } from "mongodb";
import {
  generateUniqueTeamCodeFromDb,
  getMongoDb,
  isCurrentTeamCode,
  isTeamLeader,
  teamByIdFilter,
  TEAM_MAX_SIZE,
  TEAM_MIN_SIZE,
} from "@/lib/mongo";

// Not a server action: this module must never be imported from a "use server" file or a client
// component, because fetchFullTeam returns every member's contact details for any team id it is given.

/**
 * Gives a team a fresh join code. Only replaces `previousCode`, so two concurrent rotations can't
 * overwrite each other. Returns the team's code afterwards.
 */
export async function assignNewTeamCode(db: Db, teamOid: ObjectId, previousCode: unknown): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = await generateUniqueTeamCodeFromDb();
    try {
      const res = await db
        .collection("teams")
        .updateOne({ _id: teamOid, code: previousCode }, { $set: { code, updatedAt: new Date() } });
      if (res.matchedCount === 1) return code;
      // Someone else already rotated it; return whatever the team has now.
      const current = await db.collection("teams").findOne({ _id: teamOid }, { projection: { code: 1 } });
      return current?.code ?? null;
    } catch (err: any) {
      if (err?.code !== 11000) throw err;
    }
  }
  return null;
}

export async function fetchFullTeam(teamId: string) {
  try {
    if (typeof teamId !== "string") return null;

    const db = await getMongoDb();
    if (!db) return null;

    const teamDoc = await db.collection("teams").findOne(teamByIdFilter(teamId));
    if (!teamDoc) return null;

    // Members and submissions reference the team by ObjectId, or by string id in older documents.
    const teamRef = { teamId: { $in: [teamDoc._id, teamId] } };
    const [vitList, extList, subDoc] = await Promise.all([
      db.collection("vit_students").find(teamRef).toArray(),
      db.collection("external_students").find(teamRef).toArray(),
      db.collection("submissions").findOne(teamRef),
    ]);

    const members = [
      ...vitList.map((m: any) => ({
        id: m._id.toString(),
        name: m.name || "VIT Member",
        email: m.email || "",
        regNo: m.regNo || "",
        type: "vit" as const,
        userId: m.userId ? String(m.userId) : null,
        isLeader: isTeamLeader(teamDoc.leaderId, { id: m._id.toString(), userId: m.userId ? String(m.userId) : null }),
      })),
      ...extList.map((m: any) => ({
        id: m._id.toString(),
        name: m.name || "External Member",
        email: m.email || "",
        regNo: m.regNo || "",
        type: "external" as const,
        userId: m.userId ? String(m.userId) : null,
        isLeader: isTeamLeader(teamDoc.leaderId, { id: m._id.toString(), userId: m.userId ? String(m.userId) : null }),
      })),
    ];

    let leaderId = teamDoc.leaderId ? String(teamDoc.leaderId) : null;
    if (members.length > 0 && !members.some((m) => m.isLeader)) {
      // Legacy teams can point at a users._id no member is linked to (or at nobody); promote the earliest joiner.
      const earliest = [...vitList, ...extList].sort(
        (a: any, b: any) =>
          (a.joinedAt ? new Date(a.joinedAt).getTime() : Number.MAX_SAFE_INTEGER) -
          (b.joinedAt ? new Date(b.joinedAt).getTime() : Number.MAX_SAFE_INTEGER)
      )[0];
      await db.collection("teams").updateOne(
        { _id: teamDoc._id, leaderId: teamDoc.leaderId ?? null },
        { $set: { leaderId: earliest._id, updatedAt: new Date() } }
      );
      leaderId = earliest._id.toString();
      for (const m of members) m.isLeader = m.id === leaderId;
    }

    // Teams created with the old 4-character codes get a strong code the next time they're viewed.
    // Old codes are already rejected when joining, so this only makes the team joinable again.
    let code: string | null = teamDoc.code ?? null;
    if (!isCurrentTeamCode(code)) {
      code = await assignNewTeamCode(db, teamDoc._id, teamDoc.code);
    }

    return {
      id: teamDoc._id.toString(),
      name: teamDoc.name || "My Team",
      code: code || "",
      capacity: Math.min(teamDoc.capacity || TEAM_MAX_SIZE, TEAM_MAX_SIZE),
      minSize: TEAM_MIN_SIZE,
      teamType: teamDoc.teamType || "VIT",
      track: teamDoc.track || null,
      leaderId,
      leaderName: members.find((m) => m.isLeader)?.name || null,
      members,
      submission: subDoc
        ? {
            title: subDoc.title || "",
            description: subDoc.description || "",
            projectType: subDoc.projectType || "",
            githubLink: subDoc.githubLink || "",
            figmaLink: subDoc.figmaLink || "",
            deckLink: subDoc.deckLink || "",
            otherLinks: subDoc.otherLinks || "",
            progressStatus: subDoc.progressStatus || "",
            teamConfidence: subDoc.teamConfidence || "",
            progressNote: subDoc.progressNote || "",
            submittedAt: subDoc.submittedAt ? new Date(subDoc.submittedAt).toISOString() : null,
            detailsUpdatedAt: subDoc.detailsUpdatedAt ? new Date(subDoc.detailsUpdatedAt).toISOString() : null,
            linksUpdatedAt: subDoc.linksUpdatedAt ? new Date(subDoc.linksUpdatedAt).toISOString() : null,
            progressUpdatedAt: subDoc.progressUpdatedAt ? new Date(subDoc.progressUpdatedAt).toISOString() : null,
          }
        : null,
    };
  } catch (error) {
    console.error("[fetchFullTeam] Error fetching team:", error);
    return null;
  }
}
