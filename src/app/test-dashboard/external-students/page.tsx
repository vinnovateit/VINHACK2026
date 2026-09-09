import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireTeamlessParticipant } from "../access";

async function createExternalStudent(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const year = Number(formData.get("year") ?? 0);
  const collegeName = String(formData.get("collegeName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !phone || !collegeName || !email) {
    redirect("/test-dashboard/external-students?error=Please fill in all required external student fields");
  }

  await prisma.externalStudent.create({
    data: {
      name,
      phone,
      year: year || null,
      collegeName,
      email,
    },
  });

  redirect("/test-dashboard/external-students?success=External student created successfully");
}

export default async function ExternalStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  await requireTeamlessParticipant();
  const externalStudents = await prisma.externalStudent.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">External Students</h1>
          </div>
          <a href="/test-dashboard" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-cyan-500">
            Back to dashboard
          </a>
        </div>

        {params?.success && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {params.success}
          </div>
        )}
        {params?.error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {params.error}
          </div>
        )}

        <form action={createExternalStudent} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Name</label>
              <input name="name" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Phone</label>
              <input name="phone" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Year</label>
              <input name="year" type="number" min={1} max={6} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input name="email" type="email" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">College Name</label>
              <input name="collegeName" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
          </div>

          <button type="submit" className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Create External Student
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-xl font-semibold">Existing records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {externalStudents.map((student) => (
                  <tr key={student.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.phone}</td>
                    <td className="px-4 py-3">{student.year ?? "—"}</td>
                    <td className="px-4 py-3">{student.collegeName}</td>
                    <td className="px-4 py-3">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
