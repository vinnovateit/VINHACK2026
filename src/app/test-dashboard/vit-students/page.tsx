import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireTeamlessParticipant } from "../access";

async function createVitStudent(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const regNo = String(formData.get("regNo") ?? "").trim();
  const year = Number(formData.get("year") ?? 0);
  const phone = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "MALE");
  const residencyType = String(formData.get("residencyType") ?? "DAYSCHOLAR");
  const block = String(formData.get("block") ?? "").trim() || null;
  const room = String(formData.get("room") ?? "").trim() || null;

  if (!name || !regNo || !phone || !year) {
    redirect("/test-dashboard/vit-students?error=Please fill in all required VIT student fields");
  }

  await prisma.vITStudent.create({
    data: {
      name,
      regNo,
      year,
      phone,
      gender: gender as "MALE" | "FEMALE" | "OTHER",
      residencyType: residencyType as "DAYSCHOLAR" | "HOSTELLER",
      block,
      room,
    },
  });

  redirect("/test-dashboard/vit-students?success=VIT student created successfully");
}

export default async function VitStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  await requireTeamlessParticipant();
  const params = await searchParams;
  const vitStudents = await prisma.vITStudent.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">VIT Students</h1>
          </div>
          <a href="/test-dashboard" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-cyan-500">
            Back to dashboard
          </a>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              function toggleResidencyFields() {
                const value = document.getElementById('residencyType')?.value;
                const hostellerFields = document.getElementById('hostellerFields');
                if (hostellerFields) {
                  const show = value === 'HOSTELLER';
                  hostellerFields.hidden = !show;
                  const inputs = hostellerFields.querySelectorAll('input');
                  inputs.forEach((input) => { input.disabled = !show; });
                }
              }
              window.addEventListener('DOMContentLoaded', toggleResidencyFields);
            `,
          }}
        />

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

        <form action={createVitStudent} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Name</label>
              <input name="name" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none ring-0 focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Registration Number</label>
              <input name="regNo" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Year</label>
              <input name="year" type="number" min={1} max={5} required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Phone</label>
              <input name="phone" required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Gender</label>
              <select name="gender" defaultValue="MALE" className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Residency Type</label>
              <select id="residencyType" name="residencyType" defaultValue="DAYSCHOLAR" className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500">
                <option value="DAYSCHOLAR">Dayscholar</option>
                <option value="HOSTELLER">Hosteller</option>
              </select>
            </div>
          </div>

          <div id="hostellerFields" hidden className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Block</label>
              <input name="block" disabled className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Room</label>
              <input name="room" disabled className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>

          <button type="submit" className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Create VIT Student
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
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Residency</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Room</th>
                </tr>
              </thead>
              <tbody>
                {vitStudents.map((student) => (
                  <tr key={student.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.regNo}</td>
                    <td className="px-4 py-3">{student.year}</td>
                    <td className="px-4 py-3">{student.phone}</td>
                    <td className="px-4 py-3">{student.gender}</td>
                    <td className="px-4 py-3">{student.residencyType}</td>
                    <td className="px-4 py-3">{student.block ?? "—"}</td>
                    <td className="px-4 py-3">{student.room ?? "—"}</td>
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
