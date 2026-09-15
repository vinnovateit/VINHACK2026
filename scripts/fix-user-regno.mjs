import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.DATABASE_URL);

async function main() {
  await client.connect();
  const db = client.db();

  const vitUpdate = await db.collection("vit_students").updateOne(
    { email: "varun.b2023@vitstudent.ac.in" },
    { $set: { regNo: "23MID0026", name: "Varun B", updatedAt: new Date() } }
  );
  console.log("Updated vit_students:", vitUpdate);

  const userUpdate = await db.collection("users").updateOne(
    { email: "varun.b2023@vitstudent.ac.in" },
    { $set: { name: "Varun B", updatedAt: new Date() } }
  );
  console.log("Updated users:", userUpdate);

  const doc = await db.collection("vit_students").findOne({ email: "varun.b2023@vitstudent.ac.in" });
  console.log("Verified vit_student:", { name: doc.name, email: doc.email, regNo: doc.regNo });

  await client.close();
}

main().catch(console.error);
