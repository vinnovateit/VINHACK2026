import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMongoDb } from "@/lib/mongo";

export async function GET() {
  // 1. Check if user is authenticated
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const email = session.user.email.toLowerCase().trim();
  const db = await getMongoDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  // 2. Query user, vitStudent, and externalStudent concurrently
  const [user, vitStudent, externalStudent] = await Promise.all([
    db.collection("users").findOne({ email }),
    db.collection("vit_students").findOne({ email }),
    db.collection("external_students").findOne({ email }),
  ]);

  // 3. Determine if participant is registered / paid
  const isRegistered = Boolean(
    user?.hasLoggedIn ||
    vitStudent ||
    externalStudent
  );

  const studentType =
    vitStudent ? "vit" : externalStudent ? "external" : null;

  return NextResponse.json({
    email: session.user.email,
    paid: isRegistered,
    type: studentType,
    user: user
      ? {
          id: user._id?.toString() ?? user.id,
          name: user.name,
          image: user.image,
          hasLoggedIn: user.hasLoggedIn,
        }
      : null,
  });
}
