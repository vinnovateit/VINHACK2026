import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE_URL;
if (!uri) {
  console.error("DATABASE_URL is missing from environment variables.");
  process.exit(1);
}

const emailArg = process.argv[2];
const nameArg = process.argv[3] || "Participant";
const typeArg = (process.argv[4] || "vit").toLowerCase();

if (!emailArg) {
  console.log("Usage: node scripts/add-participant.mjs <email> [name] [vit|external]");
  process.exit(0);
}

const email = emailArg.toLowerCase().trim();
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db();

  const isVit = typeArg === "vit" || email.endsWith("@vitstudent.ac.in");
  const collectionName = isVit ? "vit_students" : "external_students";

  const existing = await db.collection(collectionName).findOne({ email: new RegExp(`^${email}$`, "i") });
  if (existing) {
    console.log(`Email ${email} is ALREADY registered in ${collectionName}:`, existing);
    return;
  }

  const now = new Date();
  if (isVit) {
    const regNo = "23BCE" + Math.floor(1000 + Math.random() * 9000);
    const doc = {
      name: nameArg,
      email,
      regNo,
      year: 2,
      phone: "9999999999",
      gender: "OTHER",
      residencyType: "DAYSCHOLAR",
      block: null,
      room: null,
      address: null,
      createdAt: now,
      updatedAt: now,
      joinedAt: null,
      teamId: null,
      userId: null,
    };
    await db.collection("vit_students").insertOne(doc);
    console.log(`Successfully added VIT participant ${email} (${nameArg}, regNo: ${regNo}) to vit_students.`);
  } else {
    const doc = {
      name: nameArg,
      email,
      collegeName: "External Institute",
      regNo: null,
      address: null,
      phone: "",
      year: 2,
      createdAt: now,
      updatedAt: now,
      joinedAt: null,
      teamId: null,
      userId: null,
    };
    await db.collection("external_students").insertOne(doc);
    console.log(`Successfully added external participant ${email} (${nameArg}) to external_students.`);
  }
}

main()
  .catch(console.error)
  .finally(() => client.close());
