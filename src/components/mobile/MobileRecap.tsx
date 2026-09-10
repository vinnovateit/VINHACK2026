"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CollegesBadge from "@/components/sections/recap/CollegesBadge";
import BuildersCounter from "@/components/sections/recap/BuildersCounter";
import PixelSmiley from "@/components/sections/recap/PixelSmiley";
import {
  playStampSlam,
  playPhotoClick,
  playSmileyChirp,
} from "@/components/motion/film";
import { useInView } from "@/components/useInView";

const EVENT_PHOTOS = [
  "/about_us/220a17ad3a3ad4382bb239416e67f3f8e44d6413.webp",
  "/about_us/67637ab629928adcbde8469183aac1877a08026b.webp",
  "/about_us/924203fb63dc0f4fd3cb3bfe64c9230caf80a54e.webp",
  "/about_us/94fc2ef86e7f542a782c6ecc5761e7547108bf56.webp",
];

export default function MobileRecap() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const [stampTrigger, setStampTrigger] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      setStampTrigger(true);
      playStampSlam();
    }, 800);
    return () => {
      clearTimeout(timer);
      setStampTrigger(false);
    };
  }, [inView]);

  const handleRestamp = () => {
    setStampTrigger(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStampTrigger(true);
        playStampSlam();
      });
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Recap"
      className="w-full bg-black py-10 overflow-hidden select-none font-rotonto"
    >
      {/* 1. Stats Row: 15+ Colleges | 300+ Builders | Smiley + 99+ Projects */}
      <div className="px-4 flex items-center justify-between gap-1 max-w-[440px] mx-auto mb-4">
        {/* 15+ Colleges Badge */}
        <div className="w-[90px] h-[65px] shrink-0 -rotate-6">
          <CollegesBadge inView={inView} />
        </div>

        {/* 300+ Builders Counter */}
        <div className="flex items-center shrink-0">
          <div className="scale-85 origin-center">
            <BuildersCounter inView={inView} />
          </div>
          <Image
            className="w-[20px] h-[20px] object-contain -ml-1 mt-2 pointer-events-none"
            src="/recap/blue_mouse.svg"
            width={49}
            height={48}
            alt="Arrow"
            unoptimized
          />
        </div>

        {/* Smiley & 99+ Projects Built */}
        <div className="flex items-center gap-1 shrink-0">
          <div
            className="w-[42px] h-[42px] cursor-pointer"
            onClick={playSmileyChirp}
            title="Click smiley!"
          >
            <div className="w-full h-full animate-[spin_20s_linear_infinite]">
              <PixelSmiley />
            </div>
          </div>
          <div
            className="w-[74px] h-[48px] -rotate-6 cursor-pointer hover:scale-105 transition-transform"
            onClick={playPhotoClick}
            title="99+ Projects Built"
          >
            <Image
              className="w-full h-full object-contain"
              src="/recap/project.svg"
              width={195}
              height={128}
              alt="99+ Projects Built"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* 2. 35mm Filmstrip Assembly with Canister & Photo Marquee */}
      <div className="relative w-full h-[175px] overflow-hidden my-4 bg-black flex items-center">
        {/* 35mm Canister on the left */}
        <div className="absolute left-0 z-20 w-[78px] h-[175px] shrink-0 pointer-events-none select-none">
          <Image
            className="w-full h-full object-contain"
            src="/recap/film_canister.svg"
            width={231}
            height={504}
            alt="35mm Film Canister"
            unoptimized
          />
          <div className="absolute left-[44%] top-[48.6%] -translate-x-1/2 -translate-y-1/2 -rotate-90 flex flex-col items-center gap-[1px] pointer-events-none whitespace-nowrap font-rotonto">
            <span className="text-[10px] font-normal tracking-wider text-black leading-tight">
              ROLLING
            </span>
            <span className="text-[10px] font-normal tracking-wider text-black leading-tight">
              BACK TO &apos;25
            </span>
          </div>
        </div>

        {/* Filmstrip rolling out from canister to right edge */}
        <div className="absolute left-[64px] right-0 top-[10px] bottom-[10px] border-y-[2px] border-[#313131] bg-black overflow-hidden z-10">
          {/* Top Film Sprocket Holes */}
          <div className="absolute top-[4px] left-[6px] right-0 flex gap-[6px] overflow-hidden pointer-events-none z-10">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={`mob-top-sprocket-${i}`}
                className="w-[10px] h-[13px] bg-white rounded-[2px] shrink-0"
              />
            ))}
          </div>

          {/* Photo Marquee */}
          <div className="absolute top-[22px] bottom-[22px] left-[6px] right-0 overflow-hidden flex items-center">
            <div className="film-marquee-track flex gap-3">
              {EVENT_PHOTOS.concat(EVENT_PHOTOS).map((src, i) => (
                <div
                  key={`mob-photo-${i}`}
                  className="w-[155px] h-[105px] rounded-[2px] overflow-hidden border border-[#222222] shrink-0 cursor-pointer group"
                  onClick={playPhotoClick}
                  title="Click to snap shutter!"
                >
                  <Image
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={src}
                    width={360}
                    height={255}
                    alt="VinHack memory"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Film Sprocket Holes */}
          <div className="absolute bottom-[4px] left-[6px] right-0 flex gap-[6px] overflow-hidden pointer-events-none z-10">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={`mob-bottom-sprocket-${i}`}
                className="w-[10px] h-[13px] bg-white rounded-[2px] shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Quote + 36 Hours Stamp + Core Memory */}
      <div className="px-5 max-w-[440px] mx-auto flex flex-col gap-4 mt-2">
        {/* Quote */}
        <div className="text-center">
          <p className="font-rotonto text-[14px] text-white leading-[1.35] tracking-normal font-normal">
            it was loud, chaotic,<br />
            exhausting, and somehow<br />
            one of those weekends<br />
            you wish you could do all<br />
            over again.
          </p>
        </div>

        {/* Stamp & Core Memory */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* 36 Hours Stamp */}
          <div
            className={`flex items-center cursor-pointer select-none ${
              stampTrigger ? "stamp-active" : "opacity-0 scale-[2]"
            }`}
            onClick={handleRestamp}
            title="Click to stamp again!"
          >
            <Image
              className="w-[105px] h-[54px] object-contain transition-transform duration-200 active:scale-95"
              src="/recap/hours.svg"
              width={193}
              height={98}
              alt="36 HOURS"
              unoptimized
            />
            <Image
              className="w-[22px] h-[22px] object-contain -ml-[10px] -mt-[4px] pointer-events-none"
              src="/recap/flowers.svg"
              width={47}
              height={47}
              alt="Flower accent"
              unoptimized
            />
          </div>

          {/* Core Memory Marquee */}
          <div
            className="w-[160px] h-[52px] overflow-hidden pointer-events-none relative"
            style={{
              maskImage: "linear-gradient(to right, black 60%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to right, black 60%, transparent 95%)",
            }}
          >
            <div className="core-marquee-track flex gap-4 items-center">
              <div className="w-[140px] h-[45px] shrink-0">
                <Image
                  className="w-full h-full object-contain"
                  src="/recap/core.svg"
                  width={372}
                  height={100}
                  alt="core memory"
                  unoptimized
                />
              </div>
              <div className="w-[140px] h-[45px] shrink-0">
                <Image
                  className="w-full h-full object-contain"
                  src="/recap/core.svg"
                  width={372}
                  height={100}
                  alt="core memory"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
