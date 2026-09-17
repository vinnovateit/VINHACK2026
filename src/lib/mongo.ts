import { randomInt } from "node:crypto";
import { MongoClient, ObjectId, type Db } from "mongodb";
import { after } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { attachDatabasePool } from "@vercel/functions";
import { toObjectId } from "@/lib/ids";
import { hostelTypeOf } from "@/content/hostels";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatNameFromEmail(email: string): string {
  if (!email) return "";
  const local = email.split("@")[0] || "";
  const cleaned = local.replace(/\d+$/, "");
  const parts = cleaned.split(/[._]+/).filter(Boolean);
  if (parts.length === 0) return local;
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

const CLIENT_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
};

const isWorkerd =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

// Node (Vercel, next dev): one client per process, reused across requests. Kept on globalThis so
// dev hot reloads don't open a new pool each time.
const globalForMongo = globalThis as typeof globalThis & { __mongoClient?: MongoClient };

// Workers: sockets opened while handling one request cannot be used by another
// ("Cannot perform I/O on behalf of a different request"), so a module-level
// client breaks on the second request an isolate serves. Scope the client to
// the request's ExecutionContext instead and close it once the response is done.
const requestClients = new WeakMap<object, MongoClient>();

function formatError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack ?? ""}`;
  return String(err);
}

export const TEAM_MIN_SIZE = 3;
export const TEAM_MAX_SIZE = 5;

// Team codes are "VH26-" plus 4 characters from a 31-character alphabet (31^4 = 923,521
// combinations), kept short so they're easy to read out and type. Codes are drawn with a
// cryptographically secure RNG, looking one up requires a signed-in participant, and a leader can
// rotate their code. Ambiguous characters (0/O, 1/I/L) are excluded.
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const TEAM_CODE_RANDOM_LENGTH = 4;
const TEAM_CODE_PATTERN = /^VH26-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;

/** Returns the canonical team code, or null for anything that isn't a current-format code. */
export function normalizeTeamCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return TEAM_CODE_PATTERN.test(code) ? code : null;
}

/** Filter for a team by id. A few very old team documents carry a string `id` instead of an ObjectId. */
export function teamByIdFilter(teamId: string) {
  const oid = toObjectId(teamId);
  return oid ? { $or: [{ _id: oid }, { id: teamId }] } : { id: teamId };
}

export function isCurrentTeamCode(code: unknown): boolean {
  return typeof code === "string" && TEAM_CODE_PATTERN.test(code);
}

function randomTeamCode(): string {
  let randomPart = "";
  for (let i = 0; i < TEAM_CODE_RANDOM_LENGTH; i++) {
    randomPart += CODE_CHARS[randomInt(CODE_CHARS.length)];
  }
  return "VH26-" + randomPart;
}

// Most participants have no linked `users` record, so leaders are stored as the participant _id.
// Older teams may still hold a users._id, so accept either.
export function isTeamLeader(
  leaderId: unknown,
  participant: { id: string; userId?: string | null }
): boolean {
  if (!leaderId) return false;
  const leader = String(leaderId);
  return leader === participant.id || (!!participant.userId && leader === participant.userId);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("[MongoDB] DATABASE_URL is not configured in environment variables!");
    return null;
  }

  try {
    if (!isWorkerd) {
      if (!globalForMongo.__mongoClient) {
        globalForMongo.__mongoClient = new MongoClient(uri, CLIENT_OPTIONS);
        // Fluid compute: release idle pool connections before the function instance suspends.
        if (process.env.VERCEL) attachDatabasePool(globalForMongo.__mongoClient);
      }
      return globalForMongo.__mongoClient;
    }

    const { ctx } = getCloudflareContext();
    let client = requestClients.get(ctx);
    if (!client) {
      const created = new MongoClient(uri, CLIENT_OPTIONS);
      client = created;
      requestClients.set(ctx, created);
      try {
        after(() => created.close().catch(() => {}));
      } catch {
        // Outside a Next request scope; the isolate reclaims the sockets when the request ends.
      }
    }
    return client;
  } catch (err) {
    console.error("[MongoDB] Error creating MongoClient:", formatError(err));
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  await client.connect();
  return client.db();
}

export interface MongoParticipant {
  id: string;
  name: string;
  type: "vit" | "external";
  email: string;
  regNo: string;
  phone?: string;
  year?: number;
  isHosteller: boolean;
  blockType: "MH" | "LH";
  hostelBlock: string;
  roomNo: string;
  address: string;
  collegeName: string;
  takingAccommodation: boolean;
  teamId: string | null;
  userId: string | null;
  team: {
    id: string;
    name: string;
    code: string;
    capacity: number;
    teamType: string;
    leaderId: string | null;
  } | null;
}

export async function getParticipantByEmail(
  rawEmail: string,
  fallbackName?: string | null
): Promise<MongoParticipant | null> {
  if (!rawEmail) return null;

  const email = rawEmail.toLowerCase().trim();
  const isVitEmail = email.endsWith("@vitstudent.ac.in");
  const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");

  try {
    const db = await getMongoDb();
    if (!db) return null;

    if (isVitEmail) {
      // 1. Search in vit_students collection
      const vit = await db.collection("vit_students").findOne({ email: emailRegex });
      if (vit) {
        let team = null;
        if (vit.teamId) {
          try {
            team = await db.collection("teams").findOne(teamByIdFilter(String(vit.teamId)));
            if (!team) {
              await db.collection("vit_students").updateOne(
                { _id: vit._id },
                { $set: { teamId: null, joinedAt: null } }
              );
            }
          } catch {
            team = null;
          }
        }


        // Check if fallbackName (from Google OAuth profile) has a registration number e.g. "Varun B 23MID0026"
        const regMatch = (fallbackName || vit.name || "").match(/\b(\d{2}[A-Za-z]{3}\d{4})\b/);
        const detectedRegNo = regMatch ? regMatch[1].toUpperCase() : null;

        let resolvedName = (vit.name || fallbackName || formatNameFromEmail(email)).trim();
        if (regMatch) {
          resolvedName = resolvedName.replace(new RegExp(regMatch[0], "i"), "").trim();
        }

        const finalRegNo = (detectedRegNo || vit.regNo || "").toUpperCase();

        if (detectedRegNo && (!vit.regNo || vit.regNo.toUpperCase() !== detectedRegNo)) {
          try {
            await db.collection("vit_students").updateOne(
              { _id: vit._id },
              { $set: { regNo: detectedRegNo, name: resolvedName, updatedAt: new Date() } }
            );
          } catch (updateErr) {
            console.warn("[MongoDB] Auto-syncing regNo from Google name failed:", formatError(updateErr));
          }
        }

        const block = vit.block || "";
        const blockType = hostelTypeOf(block);

        return {
          id: vit._id.toString(),
          name: resolvedName,
          type: "vit",
          email: vit.email || email,
          regNo: finalRegNo,
          phone: vit.phone || "",
          year: typeof vit.year === "number" ? vit.year : undefined,
          isHosteller: vit.residencyType !== "DAYSCHOLAR",
          blockType,
          hostelBlock: block,
          roomNo: vit.room || "",
          address: vit.address || "",
          collegeName: "Vellore Institute of Technology",
          takingAccommodation: true,
          teamId: team ? String(vit.teamId) : null,
          userId: vit.userId ? String(vit.userId) : null,
          team: team
            ? {
              id: team._id.toString(),
              name: team.name,
              code: team.code,
              capacity: team.capacity || 5,
              teamType: team.teamType || "VIT",
              leaderId: team.leaderId ? String(team.leaderId) : null,
            }
            : null,
        };
      }

      // 2. Fallback: User in users collection
      const user = await db.collection("users").findOne({ email: emailRegex });
      const regMatchUser = (fallbackName || user?.name || "").match(/\b(\d{2}[A-Za-z]{3}\d{4})\b/);
      const userRegNo = regMatchUser ? regMatchUser[1].toUpperCase() : "";
      let cleanUserName = (user?.name || fallbackName || formatNameFromEmail(email)).trim();
      if (regMatchUser) {
        cleanUserName = cleanUserName.replace(new RegExp(regMatchUser[0], "i"), "").trim();
      }

      return {
        id: user ? user._id.toString() : "vit-" + Date.now(),
        name: cleanUserName,
        type: "vit",
        email,
        regNo: userRegNo,
        phone: user?.phone || "",
        isHosteller: true,
        blockType: "MH",
        hostelBlock: "",
        roomNo: "",
        address: "",
        collegeName: "Vellore Institute of Technology",
        takingAccommodation: true,
        teamId: null,
        userId: user ? user._id.toString() : null,
        team: null,
      };
    } else {
      // External participant
      const ext = await db.collection("external_students").findOne({ email: emailRegex });
      if (ext) {
        let team = null;
        if (ext.teamId) {
          try {
            team = await db.collection("teams").findOne(teamByIdFilter(String(ext.teamId)));
            if (!team) {
              await db.collection("external_students").updateOne(
                { _id: ext._id },
                { $set: { teamId: null, joinedAt: null } }
              );
            }
          } catch {
            team = null;
          }
        }

        const resolvedName = (ext.name || fallbackName || formatNameFromEmail(email)).trim();

        return {
          id: ext._id.toString(),
          name: resolvedName,
          type: "external",
          email: ext.email || email,
          regNo: ext.regNo || "",
          phone: ext.phone || "",
          year: typeof ext.year === "number" ? ext.year : undefined,
          isHosteller: true,
          blockType: "MH",
          hostelBlock: "",
          roomNo: "",
          address: ext.address || "",
          collegeName: ext.collegeName || "",
          takingAccommodation: true,
          teamId: team ? String(ext.teamId) : null,
          userId: ext.userId ? String(ext.userId) : null,
          team: team

            ? {
              id: team._id.toString(),
              name: team.name,
              code: team.code,
              capacity: team.capacity || 5,
              teamType: team.teamType || "EXTERNAL",
              leaderId: team.leaderId ? String(team.leaderId) : null,
            }
            : null,
        };
      }

      // Fallback: User in users collection
      const user = await db.collection("users").findOne({ email: emailRegex });
      return {
        id: user ? user._id.toString() : "ext-" + Date.now(),
        name: user?.name || fallbackName || formatNameFromEmail(email),
        type: "external",
        email,
        regNo: "",
        phone: user?.phone || "",
        year: typeof user?.year === "number" ? user.year : undefined,
        isHosteller: true,
        blockType: "MH",
        hostelBlock: "",
        roomNo: "",
        address: "",
        collegeName: "",
        takingAccommodation: true,
        teamId: null,
        userId: user ? user._id.toString() : null,
        team: null,
      };
    }
  } catch (err) {
    console.error("[MongoDB] getParticipantByEmail error:", formatError(err));
    return null;
  }
}

export async function saveParticipantCheckInInDb(
  participant: MongoParticipant,
  data: {
    name: string;
    regNo: string;
    phone?: string;
    year?: number;
    isHosteller: boolean;
    blockType?: "MH" | "LH";
    hostelBlock?: string;
    roomNo?: string;
    address?: string;
    collegeName?: string;
  }
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const now = new Date();
    const name = data.name.trim();
    const regNo = (data.regNo || "").trim();
    const address = (data.address || "").trim();

    if (participant.type === "vit") {
      const residencyType = data.isHosteller ? "HOSTELLER" : "DAYSCHOLAR";
      const updateFields: Record<string, any> = {
        name,
        residencyType,
        block: data.isHosteller ? (data.hostelBlock || data.blockType || null) : null,
        room: data.isHosteller ? (data.roomNo || null) : null,
        address: !data.isHosteller ? (address || null) : null,
        updatedAt: now,
      };
      if (regNo) updateFields.regNo = regNo;
      if (data.phone) updateFields.phone = data.phone.trim();
      if (data.year !== undefined && data.year !== null) updateFields.year = Number(data.year);

      const participantOid = toObjectId(participant.id);
      if (participantOid) {
        await db
          .collection("vit_students")
          .updateOne({ _id: participantOid }, { $set: updateFields });
      } else if (participant.email) {
        await db
          .collection("vit_students")
          .updateOne({ email: new RegExp(`^${escapeRegex(participant.email)}$`, "i") }, { $set: updateFields });
      }
    } else {
      const updateFields: Record<string, any> = {
        name,
        collegeName: data.collegeName || "External Institute",
        address: address || null,
        updatedAt: now,
        joinedAt: now,
      };
      if (regNo) updateFields.regNo = regNo;
      if (data.phone) updateFields.phone = data.phone.trim();
      if (data.year !== undefined && data.year !== null) updateFields.year = Number(data.year);

      const participantOid = toObjectId(participant.id);
      if (participantOid) {
        await db
          .collection("external_students")
          .updateOne({ _id: participantOid }, { $set: updateFields });
      } else if (participant.email) {
        await db.collection("external_students").updateOne(
          { email: new RegExp(`^${escapeRegex(participant.email)}$`, "i") },
          {
            $set: updateFields,
            $setOnInsert: { email: participant.email, phone: "", createdAt: now, year: data.year ? Number(data.year) : 1 },
          },
          { upsert: true }
        );
      }
    }

    const userOid = toObjectId(participant.userId);
    if (userOid) {
      await db.collection("users").updateOne({ _id: userOid }, { $set: { name, updatedAt: now } });
    }

    return true;
  } catch (err) {
    console.error("[MongoDB] saveParticipantCheckInInDb error:", formatError(err));
    return false;
  }
}

export async function generateUniqueTeamCodeFromDb(): Promise<string> {
  try {
    const db = await getMongoDb();
    if (db) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = randomTeamCode();
        const existing = await db.collection("teams").findOne({ code: candidate }, { projection: { _id: 1 } });
        if (!existing) return candidate;
      }
    }
  } catch (err) {
    console.warn("[MongoDB] generateUniqueTeamCodeFromDb error, using unchecked code:", formatError(err));
  }
  // Collisions are astronomically unlikely, and the unique index on teams.code still rejects one.
  return randomTeamCode();
}

export function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function findConflictingTeam(db: Db, candidateName: string, excludeTeamId?: string) {
  const trimmed = candidateName.trim();
  const normalized = normalizeTeamName(trimmed);
  if (!normalized) return null;

  const query: any = {
    $or: [
      { normalizedName: normalized },
      { name: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" } },
    ],
  };

  const excludeOid = toObjectId(excludeTeamId);
  if (excludeOid) {
    query._id = { $ne: excludeOid };
  }

  return await db.collection("teams").findOne(query, { projection: { _id: 1, name: 1 } });
}

function validateTeamNameShape(trimmed: string): { valid: false; error: string } | null {
  if (!trimmed || trimmed.length < 2) {
    return { valid: false, error: "Team name must be at least 2 characters long." };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "Team name cannot exceed 50 characters." };
  }
  const normalized = normalizeTeamName(trimmed);
  if (!normalized || normalized.length < 2) {
    return { valid: false, error: "Team name must contain at least 2 letters or numbers." };
  }
  return null;
}

const TEAM_NAME_TAKEN = "This team name is already taken or too similar to an existing team.";

export async function validateTeamNameInDb(
  candidateName: string,
  excludeTeamId?: string
): Promise<{ valid: boolean; error?: string; conflictName?: string }> {
  const trimmed = candidateName.trim();
  const shapeError = validateTeamNameShape(trimmed);
  if (shapeError) return shapeError;

  try {
    const db = await getMongoDb();
    if (!db) {
      return { valid: true };
    }

    const conflict = await findConflictingTeam(db, trimmed, excludeTeamId);
    if (conflict) {
      return { valid: false, conflictName: conflict.name, error: TEAM_NAME_TAKEN };
    }

    return { valid: true };
  } catch (err) {
    console.warn("[validateTeamNameInDb] Validation error:", formatError(err));
    return { valid: true };
  }
}

// Two requests can both pass the name check before either writes. The older team (lower
// ObjectId) keeps the name; the newer one detects the clash after writing and backs out.
async function lostTeamNameRace(db: Db, teamOid: ObjectId, normalized: string): Promise<boolean> {
  const olderMatch = await db.collection("teams").findOne(
    {
      normalizedName: normalized,
      _id: { $lt: teamOid },
    },
    { projection: { _id: 1 } }
  );
  return Boolean(olderMatch);
}

export async function createTeamInDb(data: {
  name: string;
  code: string;
  participant: MongoParticipant;
}): Promise<{ success: boolean; teamId?: string; code?: string; error?: string }> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    const { participant } = data;
    const trimmedName = data.name.trim();
    const shapeError = validateTeamNameShape(trimmedName);
    if (shapeError) return { success: false, error: shapeError.error };

    const normalizedCode = normalizeTeamCode(data.code);
    if (!normalizedCode) {
      return { success: false, error: "Invalid team code. Please refresh and try again." };
    }

    const collectionName = participant.type === "vit" ? "vit_students" : "external_students";
    const members = db.collection(collectionName);
    if (!ObjectId.isValid(participant.id)) {
      return { success: false, error: "Your participant record was not found. Please contact the organisers." };
    }
    const participantOid = new ObjectId(participant.id);

    const student = await members.findOne({ _id: participantOid }, { projection: { teamId: 1 } });
    if (!student) {
      return { success: false, error: "Your participant record was not found. Please contact the organisers." };
    }
    if (student.teamId) {
      const currentTeam = await db
        .collection("teams")
        .findOne(teamByIdFilter(String(student.teamId)), { projection: { _id: 1 } });
      if (currentTeam) {
        return { success: false, error: "You are already in a team. Leave it before creating a new one." };
      }
    }

    const nameValidation = await validateTeamNameInDb(trimmedName);
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error || "This team name is not available." };
    }

    const now = new Date();
    const normalizedName = normalizeTeamName(trimmedName);
    let teamOid: ObjectId | null = null;
    let code = normalizedCode;
    for (let attempt = 0; attempt < 3 && !teamOid; attempt++) {
      try {
        const insertRes = await db.collection("teams").insertOne({
          name: trimmedName,
          normalizedName,
          code,
          capacity: TEAM_MAX_SIZE,
          teamType: participant.type === "vit" ? "VIT" : "EXTERNAL",
          track: null,
          leaderId: participantOid,
          createdAt: now,
          updatedAt: now,
        });
        teamOid = insertRes.insertedId;
      } catch (insertErr: any) {
        // Another team claimed this code first; take a fresh one rather than losing the name.
        if (insertErr?.code !== 11000) throw insertErr;
        code = await generateUniqueTeamCodeFromDb();
      }
    }
    if (!teamOid) {
      return { success: false, error: "Could not allocate a team code. Please try again." };
    }

    // Claim the participant only if they are still teamless (guards double-submits and parallel tabs).
    const claimed = await members.updateOne(
      { _id: participantOid, teamId: student.teamId ?? null },
      { $set: { teamId: teamOid, joinedAt: now, updatedAt: now } }
    );
    if (claimed.matchedCount === 0) {
      await db.collection("teams").deleteOne({ _id: teamOid });
      return { success: false, error: "You are already in a team. Leave it before creating a new one." };
    }

    if (await lostTeamNameRace(db, teamOid, normalizedName)) {
      await members.updateOne(
        { _id: participantOid, teamId: teamOid },
        { $set: { teamId: null, joinedAt: null, updatedAt: new Date() } }
      );
      await db.collection("teams").deleteOne({ _id: teamOid });
      return { success: false, error: TEAM_NAME_TAKEN };
    }

    return { success: true, teamId: teamOid.toString(), code };
  } catch (err) {
    console.error("[MongoDB] createTeamInDb error:", formatError(err));
    return { success: false, error: "Failed to create team in database." };
  }
}

export async function renameTeamInDb(
  teamId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = newName.trim();
  const shapeError = validateTeamNameShape(trimmed);
  if (shapeError) return { success: false, error: shapeError.error };

  const db = await getMongoDb();
  if (!db) return { success: false, error: "Database unavailable." };

  const validation = await validateTeamNameInDb(trimmed, teamId);
  if (!validation.valid) return { success: false, error: validation.error };

  const teamOid = toObjectId(teamId);
  if (!teamOid) return { success: false, error: "Team not found." };
  const team = await db.collection("teams").findOne({ _id: teamOid }, { projection: { name: 1 } });
  if (!team) return { success: false, error: "Team not found." };

  const normalized = normalizeTeamName(trimmed);
  await db.collection("teams").updateOne(
    { _id: teamOid },
    { $set: { name: trimmed, normalizedName: normalized, updatedAt: new Date() } }
  );

  return { success: true };
}
