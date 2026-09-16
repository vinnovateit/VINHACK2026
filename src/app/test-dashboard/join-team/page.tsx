import { redirect } from "next/navigation";

export default async function JoinTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params?.code ? `&code=${encodeURIComponent(params.code)}` : "";
  redirect(`/onboarding?step=join-team${code}`);
}
