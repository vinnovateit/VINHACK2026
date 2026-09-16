"use client";

import { useEffect, useState } from "react";

// From TIMELINE in content/site.ts: "Hackathon Begins" 18 Sept 2:00 PM, "VinHack 6.0 Concludes" 19 Sept 8:00 PM (IST).
const START_TIME = new Date("2026-09-18T14:00:00+05:30").getTime();
const END_TIME = new Date("2026-09-19T20:00:00+05:30").getTime();

type Phase = "before" | "live" | "over";

function snapshot(now: number) {
  const phase: Phase = now < START_TIME ? "before" : now < END_TIME ? "live" : "over";
  const target = phase === "before" ? START_TIME : END_TIME;
  const totalSeconds = Math.floor(Math.max(0, target - now) / 1000);
  return {
    phase,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const CAPTIONS: Record<Phase, string> = {
  before: "until hacking begins",
  live: "until hacking ends",
  over: "VinHack has concluded",
};

/**
 * Counts down to the start of the hackathon, then to its end. It keeps its own state so only these
 * digits re-render every second, not the whole dashboard.
 */
export default function LiveCountdown() {
  const [state, setState] = useState<ReturnType<typeof snapshot> | null>(null);

  useEffect(() => {
    setState(snapshot(Date.now()));
    const interval = setInterval(() => setState(snapshot(Date.now())), 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: "HOURS", value: state?.hours },
    { label: "MINS", value: state?.minutes },
    { label: "SECS", value: state?.seconds },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-around w-full">
        {units.map((unit, i) => (
          <div key={unit.label} className="contents">
            {i > 0 && <span className="text-3xl sm:text-5xl text-white font-light mb-4">:</span>}
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl lg:text-[55px] font-light text-white tabular-nums leading-none">
                {unit.value === undefined ? "--" : String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-xs sm:text-base lg:text-[24px] text-[#9a9898] uppercase tracking-widest mt-2 font-light">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs sm:text-sm font-light text-[#9a9898] min-h-[1.25em]">
        {state ? CAPTIONS[state.phase] : ""}
      </p>
    </div>
  );
}
