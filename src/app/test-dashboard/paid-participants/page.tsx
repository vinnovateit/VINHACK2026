import { redirectForParticipantState } from "../access";

export default async function PaymentScopeRemovedPage() {
  await redirectForParticipantState();
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">This section is out of scope</p>
        <h1 className="mt-3 text-3xl font-bold">Payment verification has been removed from this test dashboard</h1>
        <p className="mt-4 text-slate-300">
          This area is intentionally left blank to keep the schema and test dashboard focused on the event registration and team workflow only.
        </p>
        <a href="/test-dashboard" className="mt-6 inline-block rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
          Back to dashboard
        </a>
      </div>
    </main>
  );
}
