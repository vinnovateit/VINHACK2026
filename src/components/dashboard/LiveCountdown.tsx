"use client";

import { useEffect, useState } from "react";

// Hackathon kickoff: Sept 19, 2026, 8:00 PM IST.
const TARGET_TIME = new Date("2026-09-19T20:00:00+05:30").getTime();

function remaining() {
  const totalSeconds = Math.floor(Math.max(0, TARGET_TIME - Date.now()) / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Ticks once a second. It keeps its own state so only these digits re-render, not the whole
 * dashboard (and its form fields) every second.
 */
export default function LiveCountdown() {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTimeLeft(remaining());
    const interval = setInterval(() => setTimeLeft(remaining()), 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: "HOURS", value: timeLeft?.hours },
    { label: "MINS", value: timeLeft?.minutes },
    { label: "SECS", value: timeLeft?.seconds },
  ];

  return (
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
  );
}
