import { redirect } from "next/navigation";
import { requireParticipant } from "./access";

export default async function TestDashboardHome() {
  const participant = await requireParticipant();
  redirect(participant.teamId ? "/test-dashboard/dashboard" : "/test-dashboard/create-team");
}
