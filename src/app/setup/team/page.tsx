import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SetupTeamPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/setup/login");
  }

  return (
    <main className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#bfea88]">Welcome</p>
        <h1 className="font-rotonto text-4xl text-white">Choose your team path</h1>
        <p className="text-sm text-white/70">
          Signed in as <span className="font-medium text-[#74d4f0]">{session.user.email}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/setup/create"
          className="group rounded-[28px] border border-[#74d4f0]/40 bg-[#74d4f0]/10 p-5 text-left transition hover:-translate-y-1 hover:border-[#74d4f0]"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#74d4f0]">Create</p>
          <h2 className="mt-3 font-rotonto text-3xl text-white">Create a team</h2>
          <p className="mt-3 text-sm text-white/70">
            Start a new VinHack team and generate your team code for others to join.
          </p>
        </Link>

        <Link
          href="/setup/join"
          className="group rounded-[28px] border border-[#bfea88]/40 bg-[#bfea88]/10 p-5 text-left transition hover:-translate-y-1 hover:border-[#bfea88]"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#bfea88]">Join</p>
          <h2 className="mt-3 font-rotonto text-3xl text-white">Join a team</h2>
          <p className="mt-3 text-sm text-white/70">
            Enter a team code and join an existing team already registered for VinHack.
          </p>
        </Link>
      </div>
    </main>
  );
}
