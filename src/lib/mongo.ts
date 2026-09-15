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
        maxPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
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
            team = await db.collection("teams").findOne({ _id: toObjectId(String(vit.teamId)) });
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
          isHosteller: vit.residencyType !== "DAYSCHOLAR",
          blockType,
          hostelBlock: block,
          roomNo: vit.room || "",
          address: vit.address || "",
          collegeName: "Vellore Institute of Technology",
          takingAccommodation: true,
          teamId: vit.teamId ? String(vit.teamId) : null,
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
            team = await db.collection("teams").findOne({ _id: toObjectId(String(ext.teamId)) });
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
          isHosteller: true,
          blockType: "MH",
          hostelBlock: "",
          roomNo: "",
          address: ext.address || "",
          collegeName: ext.collegeName || "External Institute",
          takingAccommodation: true,
          teamId: ext.teamId ? String(ext.teamId) : null,
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
        isHosteller: true,
        blockType: "MH",
        hostelBlock: "",
        roomNo: "",
        address: "",
        collegeName: "External Institute",
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

      if (participant.id && !participant.id.startsWith("ext-")) {
        await db
          .collection("external_students")
          .updateOne({ _id: toObjectId(participant.id) }, { $set: updateFields });
      } else if (participant.email) {
        await db.collection("external_students").updateOne(
          { email: new RegExp(`^${escapeRegex(participant.email)}$`, "i") },
          {
            $set: updateFields,
            $setOnInsert: { email: participant.email, phone: "", createdAt: now },
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
