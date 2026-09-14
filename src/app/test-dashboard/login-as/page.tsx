import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TEST_SESSION_COOKIE } from "../access";

async function loginAs(formData: FormData) {
  "use server";

  const value = String(formData.get("participant") ?? "");
  const [type, id] = value.split(":");
  if ((type !== "vit" && type !== "external") || !id) {
    redirect("/test-dashboard/login-as?error=Choose a participant");
  }

  const exists = type === "vit"
    ? await prisma.vITStudent.findUnique({ where: { id }, select: { id: true } })
    : await prisma.externalStudent.findUnique({ where: { id }, select: { id: true } });
  if (!exists) redirect("/test-dashboard/login-as?error=Participant not found");

  (await cookies()).set(TEST_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/test-dashboard");
}

async function logout() {
  "use server";
  (await cookies()).delete(TEST_SESSION_COOKIE);
  redirect("/test-dashboard/login-as");
}

export default async function LoginAsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  let vitStudents: Array<{ id: string; name: string; regNo: string }> = [];
  let externalStudents: Array<{ id: string; name: string; collegeName: string }> = [];
  let dbError = false;

  try {
    const results = await Promise.all([
      prisma.vITStudent.findMany({ orderBy: { name: "asc" } }),
      prisma.externalStudent.findMany({ orderBy: { name: "asc" } }),
    ]);
    vitStudents = results[0];
    externalStudents = results[1];
  } catch (err) {
    console.warn("[LoginAsPage] Database query failed:", err);
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Test-only participant switcher</p>
          <h1 className="mt-2 text-3xl font-bold">Log in as</h1>
          <p className="mt-2 text-slate-400">This cookie-based selector is separate from real authentication.</p>
          <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            Testing only: this page is not a real login and is for testing only.
          </p>
        </div>
        {dbError && (
          <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            Database connection unreachable. Please ensure <code>DATABASE_URL</code> is configured in your Cloudflare Workers environment secrets and MongoDB Atlas allows network connections.
          </p>
        )}
        {params?.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{params.error}</p>}
        <form action={loginAs} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <label className="mb-2 block text-sm text-slate-300" htmlFor="participant">Participant</label>
          <select id="participant" name="participant" defaultValue="" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100">
            <option value="">Select a participant</option>
            <optgroup label="VIT students">
              {vitStudents.map((student) => <option key={student.id} value={`vit:${student.id}`}>{student.name} — VIT ({student.regNo})</option>)}
            </optgroup>
            <optgroup label="External students">
              {externalStudents.map((student) => <option key={student.id} value={`external:${student.id}`}>{student.name} — External ({student.collegeName})</option>)}
            </optgroup>
            {vitStudents.length === 0 && externalStudents.length === 0 && (
              <option value="" disabled>No participants found. Add one in Prisma Studio.</option>
            )}
          </select>
          {vitStudents.length === 0 && externalStudents.length === 0 && (
            <p className="mt-3 text-sm text-amber-200">The dropdown is working, but there are no participant records yet. Create a VITStudent or ExternalStudent in Prisma Studio, then refresh this page.</p>
          )}
          <button type="submit" className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Use participant</button>
        </form>
        <form action={logout}>
          <button type="submit" className="rounded-xl border border-slate-700 px-5 py-3 text-slate-200 hover:border-cyan-500">Log out</button>
        </form>
      </div>
    </main>
  );
}
