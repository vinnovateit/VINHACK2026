"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, X } from "lucide-react";
import ClientQrCode from "@/components/onboarding/ClientQrCode";

const noSubscribe = () => () => {};

/**
 * The team's QR on the dashboard. It encodes the join link, so scanning it opens the join screen
 * with the code filled in. Pressing it opens a larger, black-on-white copy that phones scan more
 * reliably, with a button that copies the part of the code people type in (the join screen already
 * shows the "VH26-" prefix).
 */
export default function TeamQrCode({ code, teamName }: { code: string; teamName: string }) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  // The link needs the page's own origin, which only exists in the browser; on the server it's
  // empty, so the server render and the first client render match.
  const origin = useSyncExternalStore(noSubscribe, () => window.location.origin, () => "");
  const joinUrl = origin ? `${origin}/onboarding?step=join-team&code=${encodeURIComponent(code)}` : "";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const shortCode = code.replace(/^VH26-/i, "");

  const copyShortCode = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(shortCode);
      ok = true;
    } catch {
      // The async Clipboard API is blocked in some in-app browsers and embedded views; fall back to
      // the older selection-based copy, which still works in most of them.
      const input = document.createElement("textarea");
      input.value = shortCode;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      ok = document.execCommand("copy");
      input.remove();
    }
    setCopyState(ok ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-[63px] h-[63px] flex items-center justify-center cursor-pointer hover:scale-105 transition shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74d4f0]"
        aria-label="Show the team QR code"
        title="Show QR code"
      >
        <ClientQrCode value={joinUrl} size={63} darkColor="#ffffff" lightColor="#000000" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`QR code for ${teamName}`}
        >
          <div
            className="relative w-full max-w-[340px] bg-[#0e0e0e] border border-[#666060] p-6 font-light text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <p className="text-[#fa1a1d] text-sm tracking-wider uppercase">{"// Join "}{teamName}</p>
            <p className="mt-1 text-xs text-[#9a9898]">Scan to open the join screen with the code filled in.</p>

            <div className="mt-5 flex justify-center">
              <div className="bg-white p-3">
                <ClientQrCode value={joinUrl} size={220} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9a9898]">Team code</p>
                <p className="text-2xl tracking-wider">
                  <span className="text-[#9a9898]">VH26-</span>
                  <span className="text-[#fa1a1d]">{shortCode}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={copyShortCode}
                className="h-[40px] px-4 rounded-full bg-[#74d4f0] hover:bg-[#60caf0] text-black text-sm flex items-center gap-2 transition cursor-pointer shrink-0"
              >
                {copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}
                {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
