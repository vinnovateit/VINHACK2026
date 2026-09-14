import { redirect } from "next/navigation";
import { FemaleHostel, MaleHostel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FEMALE_HOSTEL_OPTIONS, MALE_HOSTEL_OPTIONS } from "../constants";
import { requireParticipant } from "../access";

function formatHostel(hostel: string) {
  return hostel.replace("_ANNEXE", " Annexe");
}

async function saveHostel(formData: FormData) {
  "use server";
  const participant = await requireParticipant();
  if (participant.type !== "vit") redirect("/test-dashboard/profile?error=Hostel details are only collected for VIT students");

  const student = await prisma.vITStudent.findUnique({ where: { id: participant.id }, select: { gender: true } });
  if (!student) redirect("/test-dashboard/login-as?error=Participant not found");

  const hostel = String(formData.get("hostel") ?? "");
  const validHostels = student.gender === "MALE" ? MALE_HOSTEL_OPTIONS : student.gender === "FEMALE" ? FEMALE_HOSTEL_OPTIONS : [];
  if (!validHostels.includes(hostel as never)) redirect("/test-dashboard/profile?error=Choose a valid hostel for your gender");

  if (student.gender === "MALE") {
    await prisma.vITStudent.update({
      where: { id: participant.id },
      data: { maleHostel: hostel as MaleHostel, femaleHostel: null },
    });
  } else {
    await prisma.vITStudent.update({
      where: { id: participant.id },
      data: { maleHostel: null, femaleHostel: hostel as FemaleHostel },
    });
  }
  redirect("/test-dashboard/profile?saved=1");
}

export default async function ProfilePage({ searchParams }: { searchParams?: Promise<{ error?: string; saved?: string }> }) {
  const [participant, params] = await Promise.all([requireParticipant(), searchParams]);
  if (participant.type !== "vit") {
    return <main className="min-h-screen bg-slate-950 p-6 text-slate-100"><div className="mx-auto max-w-xl space-y-6"><h1 className="text-3xl font-bold">Profile</h1><p className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-300">Hostel details are collected only for VIT students.</p><a href="/test-dashboard" className="text-cyan-300 hover:text-cyan-200">Back to dashboard</a></div></main>;
  }

  const student = await prisma.vITStudent.findUnique({ where: { id: participant.id }, select: { name: true, gender: true, maleHostel: true, femaleHostel: true } });
  if (!student) redirect("/test-dashboard/login-as?error=Participant not found");

  const hostels = student.gender === "MALE" ? MALE_HOSTEL_OPTIONS : student.gender === "FEMALE" ? FEMALE_HOSTEL_OPTIONS : [];
  const selectedHostel = student.gender === "MALE" ? student.maleHostel : student.femaleHostel;
  const genderLabel = student.gender === "MALE" ? "Male" : student.gender === "FEMALE" ? "Female" : "Other";

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100"><div className="mx-auto max-w-xl space-y-6">
      <div><p className="text-sm uppercase tracking-[0.2em] text-cyan-400">VinHack test dashboard</p><h1 className="mt-2 text-3xl font-bold">Hostel details</h1><p className="mt-2 text-slate-400">{student.name} · {genderLabel}</p></div>
      {params?.error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{params.error}</p>}
      {params?.saved && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">Hostel saved.</p>}
      {hostels.length > 0 ? <form action={saveHostel} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><label className="mb-2 block text-sm text-slate-300" htmlFor="hostel">Hostel</label><select id="hostel" name="hostel" defaultValue={selectedHostel ?? ""} required className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-cyan-500"><option value="" disabled>Select a hostel</option>{hostels.map((hostel) => <option key={hostel} value={hostel}>{formatHostel(hostel)}</option>)}</select><button type="submit" className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Save hostel</button></form> : <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">Hostel selection is available only when gender is Male or Female.</p>}
      <a href="/test-dashboard" className="inline-block text-cyan-300 hover:text-cyan-200">Back to dashboard</a>
    </div></main>
  );
}
