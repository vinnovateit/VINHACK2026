"use client";

import { useEffect } from "react";
import Image from "next/image";
import { playLatchClick } from "@/components/motion/film";

// Must match the SMIL `dur` inside public/recap/builders.svg.
const COUNT_DURATION_MS = 1800;

interface BuildersCounterProps {
  inView?: boolean;
}

// The whole "300+ BUILDERS" lockup, count-up included, lives in builders.svg:
// the number is Rotonto text rolled 000 -> 300 by an SMIL timeline. An <img>
// starts that timeline fresh each time it mounts, so the key flips with
// inView to remount on every reveal. The latch click is timed to the freeze.
export default function BuildersCounter({ inView = true }: BuildersCounterProps) {
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(playLatchClick, COUNT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [inView]);

  return (
    <div className="relative w-[140px] h-[68px] select-none cursor-default">
      <Image
        key={inView ? "in" : "out"}
        className="w-full h-full object-contain pointer-events-none"
        src="/recap/builders.svg"
        width={170}
        height={82}
        alt="300+ BUILDERS"
        unoptimized
        priority
      />
    </div>
  );
}
