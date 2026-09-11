import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const TEST_SESSION_COOKIE = "test_session";

type ParticipantType = "vit" | "external";

export type CurrentParticipant = {
  id: string;
  name: string;
  type: ParticipantType;
  teamId: string | null;
};

export async function getCurrentParticipant(): Promise<CurrentParticipant | null> {
  const session = (await cookies()).get(TEST_SESSION_COOKIE)?.value;
  if (!session) return null;

  const [type, id] = session.split(":");
  if ((type !== "vit" && type !== "external") || !id) return null;

  if (type === "vit") {
    const student = await prisma.vITStudent.findUnique({ where: { id }, select: { id: true, name: true, teamId: true } });
    return student ? { ...student, type } : null;
  }

  const student = await prisma.externalStudent.findUnique({ where: { id }, select: { id: true, name: true, teamId: true } });
  return student ? { ...student, type } : null;
}

export async function requireParticipant() {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/test-dashboard/login-as");
  return participant;
}

export async function requireTeamlessParticipant() {
  const participant = await requireParticipant();
  if (participant.teamId) redirect("/test-dashboard/dashboard");
  return participant;
}

export async function requireTeamedParticipant() {
  const participant = await requireParticipant();
  if (!participant.teamId) redirect("/test-dashboard/create-team");
  return participant;
}

