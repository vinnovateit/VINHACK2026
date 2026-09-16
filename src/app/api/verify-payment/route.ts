import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // 2. Query user, vitStudent, and externalStudent concurrently
  const [user, vitStudent, externalStudent] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      include: { vitStudent: true, externalStudent: true },
    }),
    prisma.vITStudent.findUnique({
      where: { email },
    }),
    prisma.externalStudent.findFirst({
      where: { email },
    }),
  ]);

  // 3. Determine if participant is registered / paid
  const isRegistered = Boolean(
    user?.hasLoggedIn ||
    user?.vitStudent ||
    user?.externalStudent ||
    vitStudent ||
    externalStudent
  );

  const studentType =
    user?.vitStudent || vitStudent
      ? "vit"
      : user?.externalStudent || externalStudent
      ? "external"
      : null;

  return NextResponse.json({
    email: session.user.email,
    paid: isRegistered,
    type: studentType,
    user: user
      ? {
          id: user.id,
          name: user.name,
          image: user.image,
          hasLoggedIn: user.hasLoggedIn,
        }
      : null,
  });
}
