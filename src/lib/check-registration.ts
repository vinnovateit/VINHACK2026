import { MongoClient } from "mongodb";
import { prisma } from "./prisma";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("[AUTH_REGISTRATION] DATABASE_URL is not configured in environment variables!");
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
    console.error("[AUTH_REGISTRATION] Error initializing MongoClient:", err);
    return null;
  }
}

export interface VerificationResult {
  isRegistered: boolean;
  participantType?: "vit" | "external" | "user";
  method: "mongodb-native" | "prisma" | "none";
  details?: string;
}

export async function verifyParticipantRegistered(
  rawEmail: string
): Promise<VerificationResult> {
  if (!rawEmail) {
    return { isRegistered: false, method: "none", details: "Empty email" };
  }

  const email = rawEmail.toLowerCase().trim();
  const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");

  // Strategy 1: Direct native MongoDB driver (runs on Cloudflare Workers edge runtime & Node.js)
  try {
    const client = await getMongoClient();
    if (client) {
      await client.connect();
      const db = client.db();

      const [vit, ext, user] = await Promise.all([
        db.collection("vit_students").findOne({ email: emailRegex }),
        db.collection("external_students").findOne({ email: emailRegex }),
        db.collection("users").findOne({ email: emailRegex }),
      ]);

      if (vit) {
        console.log(`[AUTH_APPROVED] Verified VIT participant in vit_students: ${email}`);
        return { isRegistered: true, participantType: "vit", method: "mongodb-native" };
      }
      if (ext) {
        console.log(`[AUTH_APPROVED] Verified external participant in external_students: ${email}`);
        return { isRegistered: true, participantType: "external", method: "mongodb-native" };
      }
      if (user) {
        console.log(`[AUTH_APPROVED] Verified participant in users: ${email}`);
        return { isRegistered: true, participantType: "user", method: "mongodb-native" };
      }

      console.warn(`[AUTH_REJECTED] Email ${email} not found in database via MongoClient.`);
      return { isRegistered: false, method: "mongodb-native", details: "Email not found" };
    }
  } catch (mongoErr) {
    console.warn("[AUTH_REGISTRATION] MongoClient check threw an error, falling back to Prisma:", mongoErr);
  }

  // Strategy 2: Prisma client fallback (for local Node.js environment)
  try {
    const [vitStudent, externalStudent, dbUser] = await Promise.all([
      prisma.vITStudent.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      }),
      prisma.externalStudent.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      }),
      prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      }),
    ]);

    if (vitStudent) {
      console.log(`[AUTH_APPROVED] Verified VIT participant via Prisma: ${email}`);
      return { isRegistered: true, participantType: "vit", method: "prisma" };
    }
    if (externalStudent) {
      console.log(`[AUTH_APPROVED] Verified external participant via Prisma: ${email}`);
      return { isRegistered: true, participantType: "external", method: "prisma" };
    }
    if (dbUser) {
      console.log(`[AUTH_APPROVED] Verified participant in users via Prisma: ${email}`);
      return { isRegistered: true, participantType: "user", method: "prisma" };
    }

    console.warn(`[AUTH_REJECTED] Email ${email} not found in database via Prisma.`);
    return { isRegistered: false, method: "prisma", details: "Email not found" };
  } catch (prismaErr) {
    console.error("[AUTH_REGISTRATION] Both native MongoClient and Prisma failed:", prismaErr);
    return { isRegistered: false, method: "none", details: String(prismaErr) };
  }
}
