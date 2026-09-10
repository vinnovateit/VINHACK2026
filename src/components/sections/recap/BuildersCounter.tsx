"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BuildersCounterProps {
  inView?: boolean;
}

export default function BuildersCounter({ inView = true }: BuildersCounterProps) {
  const [count, setCount] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!inView) return;

    const start = 0;
    const target = 300;
    const duration = 1800; // ms
    const startTime = performance.now();

    const updateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Quartic ease-out for energetic count deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (target - start) * easeOut);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCompleted(true);
      }
    };

    const animFrame = requestAnimationFrame(updateCounter);
    return () => {
      cancelAnimationFrame(animFrame);
      setCount(0);
      setCompleted(false);
    };
  }, [inView]);

  return (
    <div className="relative w-[140px] h-[68px] select-none cursor-default group">
      {/* 1. Word "BUILDERS" - Stays completely rock-solid in place */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          className="w-full h-full object-contain pointer-events-none"
          src="/recap/builders_word.svg"
          width={170}
          height={82}
          alt="BUILDERS"
          unoptimized
          priority
        />
      </div>

      {/* 2. Top "300+" Counter Up - Counts up from 0 to 300 and locks into authentic artwork */}
      <div className="absolute top-0 left-0 right-0 h-[34px] flex items-center justify-center pointer-events-none">
        {/* Dynamic counter text during count-up */}
        <div
          className={`flex items-center justify-center font-rotonto font-bold text-[31px] leading-none text-[#74D4F0] tracking-wider transition-opacity duration-300 ${
            completed ? "opacity-0" : "opacity-100"
          }`}
        >
          {count}
          <span className="text-[24px] ml-[1px]">+</span>
        </div>

        {/* Authentic handwritten 300+ vector artwork locked in when reaching 300 */}
        <div
          className={`absolute inset-0 w-full h-[68px] transition-all duration-300 ${
            completed ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Image
            className="w-full h-full object-contain"
            src="/recap/builders_300.svg"
            width={170}
            height={82}
            alt="300+"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
