import type { ReactNode } from "react";

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#0d0d0d]/90 p-6 shadow-[0_0_0_1px_rgba(116,212,240,0.18),0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-sm md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
