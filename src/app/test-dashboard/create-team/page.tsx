import { redirect } from "next/navigation";

export default async function CreateTeamPage() {
  redirect("/onboarding?step=create-team");
}
