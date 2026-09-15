import { MongoClient, ObjectId, type Db } from "mongodb";

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

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("[MongoDB] DATABASE_URL is not configured in environment variables!");
    return null;
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        socketTimeoutMS: 30000,
        maxIdleTimeMS: 60000,
        waitQueueTimeoutMS: 10000,
      });
    }
    return cachedClient;
  } catch (err) {
    console.error("[MongoDB] Error creating MongoClient:", err);
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  await client.connect();
  return client.db();
}

function toObjectId(id: string): any {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
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
            team = await db.collection("teams").findOne({
              $or: [{ _id: toObjectId(String(vit.teamId)) }, { id: String(vit.teamId) }],
            });
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
            console.warn("[MongoDB] Auto-syncing regNo from Google name failed:", updateErr);
          }
        }

        const block = vit.block || "";
        const blockType: "MH" | "LH" = block.toUpperCase().startsWith("L") ? "LH" : "MH";

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
            team = await db.collection("teams").findOne({
              $or: [{ _id: toObjectId(String(ext.teamId)) }, { id: String(ext.teamId) }],
            });
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
    console.error("[MongoDB] getParticipantByEmail error:", err);
    return null;
  }
}

export async function getParticipantById(
  type: "vit" | "external",
  id: string
): Promise<MongoParticipant | null> {
  try {
    const db = await getMongoDb();
    if (!db) return null;

    const collectionName = type === "vit" ? "vit_students" : "external_students";
    const student = await db.collection(collectionName).findOne({ _id: toObjectId(id) });
    if (!student) return null;

    let team = null;
    if (student.teamId) {
      try {
        team = await db.collection("teams").findOne({ _id: toObjectId(String(student.teamId)) });
      } catch {
        team = null;
      }
    }

    if (type === "vit") {
      const block = student.block || "";
      const blockType: "MH" | "LH" = block.toUpperCase().startsWith("L") ? "LH" : "MH";
      return {
        id: student._id.toString(),
        name: student.name || "",
        type: "vit",
        email: student.email || "",
        regNo: student.regNo || "",
        phone: student.phone || "",
        year: typeof student.year === "number" ? student.year : undefined,
        isHosteller: student.residencyType !== "DAYSCHOLAR",
        blockType,
        hostelBlock: block,
        roomNo: student.room || "",
        address: student.address || "",
        collegeName: "Vellore Institute of Technology",
        takingAccommodation: true,
        teamId: student.teamId ? String(student.teamId) : null,
        userId: student.userId ? String(student.userId) : null,
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
    } else {
      return {
        id: student._id.toString(),
        name: student.name || "",
        type: "external",
        email: student.email || "",
        regNo: student.regNo || "",
        phone: student.phone || "",
        year: typeof student.year === "number" ? student.year : undefined,
        isHosteller: true,
        blockType: "MH",
        hostelBlock: "",
        roomNo: "",
        address: student.address || "",
        collegeName: student.collegeName || "External Institute",
        takingAccommodation: true,
        teamId: student.teamId ? String(student.teamId) : null,
        userId: student.userId ? String(student.userId) : null,
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
  } catch (err) {
    console.error("[MongoDB] getParticipantById error:", err);
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

      if (participant.id && !participant.id.startsWith("vit-")) {
        await db
          .collection("vit_students")
          .updateOne({ _id: toObjectId(participant.id) }, { $set: updateFields });
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

      if (participant.id && !participant.id.startsWith("ext-")) {
        await db
          .collection("external_students")
          .updateOne({ _id: toObjectId(participant.id) }, { $set: updateFields });
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

    if (participant.userId) {
      await db
        .collection("users")
        .updateOne({ _id: toObjectId(participant.userId) }, { $set: { name, updatedAt: now } });
    }

    return true;
  } catch (err) {
    console.error("[MongoDB] saveParticipantCheckInInDb error:", err);
    return false;
  }
}

const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export async function generateUniqueTeamCodeFromDb(): Promise<string> {
  try {
    const db = await getMongoDb();
    if (db) {
      for (let attempt = 0; attempt < 30; attempt++) {
        let randomPart = "";
        for (let i = 0; i < 4; i++) {
          randomPart += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
        }
        const candidate = `VH26-${randomPart}`;

        const existing = await db.collection("teams").findOne(
          { code: new RegExp(`^${candidate}$`, "i") },
          { projection: { _id: 1 } }
        );

        if (!existing) {
          return candidate;
        }
      }
    }
  } catch (err) {
    console.warn("[MongoDB] generateUniqueTeamCodeFromDb error, using random fallback:", err);
  }

  const ts = Date.now().toString(36).slice(-3).toUpperCase();
  const r1 = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  const r2 = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `VH26-${r1}${r2}${ts}`;
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function validateTeamNameInDb(
  candidateName: string,
  excludeTeamId?: string
): Promise<{ valid: boolean; error?: string; conflictName?: string }> {
  const trimmed = candidateName.trim();
  if (!trimmed || trimmed.length < 2) {
    return { valid: false, error: "Team name must be at least 2 characters long." };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "Team name cannot exceed 50 characters." };
  }

  const candidateNorm = normalizeTeamName(trimmed);
  if (!candidateNorm || candidateNorm.length < 2) {
    return { valid: false, error: "Team name must contain at least 2 letters or numbers." };
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      return { valid: true };
    }

    // 1. Fast exact case-insensitive check via index
    const exactQuery: any = { name: new RegExp(`^${escapeRegex(trimmed)}$`, "i") };
    if (excludeTeamId) exactQuery._id = { $ne: toObjectId(excludeTeamId) };

    const exactMatch = await db.collection("teams").findOne(exactQuery, { projection: { name: 1 } });
    if (exactMatch) {
      return {
        valid: false,
        conflictName: exactMatch.name,
        error: "This team name is already taken or too similar to an existing team.",
      };
    }

    // 2. Normalized equality check via MongoDB aggregation (no JS memory scan)
    const pipeline: any[] = [
      ...(excludeTeamId ? [{ $match: { _id: { $ne: toObjectId(excludeTeamId) } } }] : []),
      {
        $addFields: {
          normalizedName: {
            $replaceAll: {
              input: { $replaceAll: { input: { $toLower: "$name" }, find: " ", replacement: "" } },
              find: "-", replacement: ""
            }
          }
        }
      },
      { $match: { normalizedName: candidateNorm } },
      { $limit: 1 },
      { $project: { name: 1 } },
    ];

    const normResults = await db.collection("teams").aggregate(pipeline).toArray();
    if (normResults.length > 0) {
      return {
        valid: false,
        conflictName: normResults[0].name,
        error: "This team name is already taken or too similar to an existing team.",
      };
    }

    return { valid: true };
  } catch (err) {
    console.warn("[validateTeamNameInDb] Validation error:", err);
    return { valid: true };
  }
}

export async function createTeamInDb(data: {
  name: string;
  code: string;
  participant: MongoParticipant;
}): Promise<{ success: boolean; teamId?: string; error?: string }> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return { success: false, error: "Database connection unavailable." };
    }

    const { name, code, participant } = data;
    const trimmedName = name.trim().slice(0, 100);
    const normalizedCode = code.trim().toUpperCase();

    // Verify team name uniqueness and similarity in MongoDB
    const nameValidation = await validateTeamNameInDb(trimmedName);
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error || "This team name is not available." };
    }

    // Verify code uniqueness in MongoDB
    const existing = await db.collection("teams").findOne({
      code: new RegExp(`^${normalizedCode}$`, "i"),
    });
    if (existing) {
      return { success: false, error: "This team code is already in use. Please try another." };
    }

    const now = new Date();
    const teamType = participant.type === "vit" ? "VIT" : "EXTERNAL";

    let leaderUserId: any = null;
    if (participant.userId) {
      leaderUserId = toObjectId(participant.userId);
    } else if (participant.id && !participant.id.startsWith("vit-") && !participant.id.startsWith("ext-")) {
      leaderUserId = toObjectId(participant.id);
    }

    const newTeamDoc = {
      name: trimmedName,
      code: normalizedCode,
      capacity: 5,
      teamType,
      track: null,
      leaderId: leaderUserId,
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await db.collection("teams").insertOne(newTeamDoc);
    const teamId = insertRes.insertedId.toString();

    // Associate participant with team
    const collectionName = participant.type === "vit" ? "vit_students" : "external_students";
    if (participant.id && !participant.id.startsWith("vit-") && !participant.id.startsWith("ext-")) {
      await db.collection(collectionName).updateOne(
        { _id: toObjectId(participant.id) },
        { $set: { teamId: insertRes.insertedId, joinedAt: now, updatedAt: now } }
      );
    } else if (participant.email) {
      await db.collection(collectionName).updateOne(
        { email: new RegExp(`^${escapeRegex(participant.email)}$`, "i") },
        { $set: { teamId: insertRes.insertedId, joinedAt: now, updatedAt: now } }
      );
    }

    return { success: true, teamId };
  } catch (err) {
    console.error("[MongoDB] createTeamInDb error:", err);
    return { success: false, error: "Failed to create team in database." };
  }
}

