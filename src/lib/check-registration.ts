import { getMongoDb } from "./mongo";

export interface VerificationResult {
  isRegistered: boolean;
  participantType?: "vit" | "external" | "user";
  method: "mongodb-native" | "none";
  details?: string;
}

export async function verifyParticipantRegistered(
  rawEmail: string
): Promise<VerificationResult> {
  if (!rawEmail) {
    return { isRegistered: false, method: "none", details: "Empty email" };
  }

  const email = rawEmail.toLowerCase().trim();

  try {
    // Use the shared MongoClient from mongo.ts — no separate client, no .connect() call
    const db = await getMongoDb();
    if (!db) {
      console.error("[AUTH_REGISTRATION] getMongoDb() returned null — DATABASE_URL missing?");
      return { isRegistered: false, method: "none", details: "DB unavailable" };
    }

    // Use exact indexed equality — fast O(log n) index scan, not a regex full scan
    const emailLower = email.toLowerCase();

    const [vit, ext, user] = await Promise.all([
      db.collection("vit_students").findOne(
        { email: emailLower },
        { projection: { _id: 1 } }
      ),
      db.collection("external_students").findOne(
        { email: emailLower },
        { projection: { _id: 1 } }
      ),
      db.collection("users").findOne(
        { email: emailLower },
        { projection: { _id: 1 } }
      ),
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

    console.warn(`[AUTH_REJECTED] Email ${email} not found in database.`);
    return { isRegistered: false, method: "mongodb-native", details: "Email not found" };
  } catch (err) {
    console.error("[AUTH_REGISTRATION] MongoDB check failed:", err);
    return { isRegistered: false, method: "none", details: String(err) };
  }
}
