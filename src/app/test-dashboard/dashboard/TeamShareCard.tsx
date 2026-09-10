"use client";

import { useState } from "react";
import Image from "next/image";

interface TeamShareCardProps {
  teamCode: string;
  qrDataUrl: string;
}

export function TeamShareCard({ teamCode, qrDataUrl }: TeamShareCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getJoinLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/test-dashboard/join-team?code=${teamCode}`;
    }
    return `/test-dashboard/join-team?code=${teamCode}`;
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const copyLink = async () => {
    try {
      const link = getJoinLink();
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 flex-1">
          <div>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              Invite Teammates
            </span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">Team Code & Join Link</h3>
            <p className="text-sm text-slate-400 mt-1">
              Share your team code or scan the QR code to let teammates join directly.
            </p>
          </div>

          {/* Team Code Display */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2 font-mono text-2xl font-black tracking-widest text-cyan-300">
              {teamCode}
            </div>
            <button
              onClick={copyCode}
              type="button"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-cyan-500 hover:text-white transition"
            >
              {copiedCode ? "✓ Copied Code!" : "Copy Code"}
            </button>
          </div>

          {/* Shareable Link Display */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-slate-400">Shareable Invite Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? getJoinLink() : `/test-dashboard/join-team?code=${teamCode}`}
                className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-300 outline-none select-all"
              />
              <button
                onClick={copyLink}
                type="button"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition shrink-0"
              >
                {copiedLink ? "✓ Link Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 shrink-0">
            <div className="relative h-36 w-36 overflow-hidden rounded-lg bg-white p-2">
              <Image
                src={qrDataUrl}
                alt={`QR Code to join team with code ${teamCode}`}
                width={128}
                height={128}
                unoptimized
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-400">Scan to join team</p>
          </div>
        )}
      </div>
    </section>
  );
}
