import { prisma } from "@/lib/prisma";

type ParticipantType = "vit" | "external";

export type EligibleParticipant = {
  id: string;
  type: ParticipantType;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findEligibleParticipantByEmail(email: string): Promise<EligibleParticipant | null> {
  const normalizedEmail = normalizeEmail(email);
  const [vitStudent, externalStudent] = await Promise.all([
    prisma.vITStudent.findFirst({ where: { email: { equals: normalizedEmail, mode: "insensitive" } }, select: { id: true } }),
    prisma.externalStudent.findFirst({ where: { email: { equals: normalizedEmail, mode: "insensitive" } }, select: { id: true } }),
  ]);

  if (vitStudent && externalStudent) {
    throw new Error("This email is present in both participant lists. Contact organizers.");
  }

  if (vitStudent) return { id: vitStudent.id, type: "vit" };
  if (externalStudent) return { id: externalStudent.id, type: "external" };
  return null;
}

export async function getOrCreateEligibleUser(type: ParticipantType, participantId: string): Promise<string> {
  const participant =
    type === "vit"
      ? await prisma.vITStudent.findUnique({
          where: { id: participantId },
          select: { id: true, name: true, email: true, userId: true },
        })
      : await prisma.externalStudent.findUnique({
          where: { id: participantId },
          select: { id: true, name: true, email: true, userId: true },
        });

  if (!participant) {
    throw new Error("Participant not found");
  }

  if (participant.userId) {
    const linkedToOther =
      type === "vit"
        ? await prisma.externalStudent.findUnique({ where: { userId: participant.userId }, select: { id: true } })
        : await prisma.vITStudent.findUnique({ where: { userId: participant.userId }, select: { id: true } });

    if (linkedToOther) {
      throw new Error("This user is already linked to another participant type.");
    }

    return participant.userId;
  }

  const email = normalizeEmail(participant.email);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: participant.name,
    },
    create: {
      email,
      name: participant.name,
    },
    select: { id: true },
  });

  const linkedToOther =
    type === "vit"
      ? await prisma.externalStudent.findUnique({ where: { userId: user.id }, select: { id: true } })
      : await prisma.vITStudent.findUnique({ where: { userId: user.id }, select: { id: true } });

  if (linkedToOther) {
    throw new Error("This Google account is already linked to another participant type.");
  }

  if (type === "vit") {
    await prisma.vITStudent.update({ where: { id: participant.id }, data: { userId: user.id } });
  } else {
    await prisma.externalStudent.update({ where: { id: participant.id }, data: { userId: user.id } });
  }

  return user.id;
}
