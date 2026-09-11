import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  // 1. Check if user is authenticated
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // 2. Look up email in the registrants collection (case-insensitive)
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "vinhack");
  const email = session.user.email.trim();
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const registrant = await db
    .collection("registrants")
    .findOne({ email: { $regex: `^${escapedEmail}$`, $options: "i" } });

  // 3. Return result (checks explicit paid flag if present, otherwise presence in registrants collection)
  const isPaid = registrant
    ? registrant.paid !== undefined
      ? Boolean(registrant.paid)
      : true
    : false;

  return NextResponse.json({
    email: session.user.email,
    paid: isPaid,
  });
}
