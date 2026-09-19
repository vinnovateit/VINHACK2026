"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CollegesBadge from "@/components/sections/recap/CollegesBadge";
import BuildersCounter from "@/components/sections/recap/BuildersCounter";
import PixelSmiley from "@/components/sections/recap/PixelSmiley";
import FilmLeader from "@/components/sections/recap/FilmLeader";
import { playStampSlam } from "@/components/motion/film";
import { useInView } from "@/components/useInView";

const EVENT_PHOTOS = [
  "/about_us/vinnovateit-team.webp",
  "/about_us/220a17ad3a3ad4382bb239416e67f3f8e44d6413.webp",
  "/about_us/67637ab629928adcbde8469183aac1877a08026b.webp",
  "/about_us/924203fb63dc0f4fd3cb3bfe64c9230caf80a54e.webp",
  "/about_us/94fc2ef86e7f542a782c6ecc5761e7547108bf56.webp",
];

// The "core memory" snake — the same glyph-by-glyph sine-wave slither
// `Recap.tsx` draws for desktop (see `core-snake-bob`/`core-snake-track` in
// globals.css), at phone scale. It used to be a plain image marquee here,
// which read as a different, flatter animation from the desktop section it
// is standing in for; this reuses the exact keyframes so the two match.
const CORE_SNAKE_ICONS = ["/figma/star2.svg", "/figma/vector51.svg", "/recap/flowers.svg"];
type CoreSnakeUnit = { kind: "char"; ch: string } | { kind: "icon"; src: string };
const CORE_SNAKE_UNITS: CoreSnakeUnit[] = CORE_SNAKE_ICONS.flatMap((src) => [
  ...[..."core memory"].map((ch): CoreSnakeUnit => ({ kind: "char", ch })),
  { kind: "icon", src },
]);
const CORE_SNAKE_WAVELENGTH = 12; // units per full S — exactly one "core memory ✦"
const CORE_SNAKE_PERIOD = 2.4; // seconds, = animation-duration of core-snake-bob
const CORE_SNAKE_STEP = CORE_SNAKE_PERIOD / CORE_SNAKE_WAVELENGTH;

export default function MobileRecap() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const [stampTrigger, setStampTrigger] = useState(false);
  const [hasRolledOut, setHasRolledOut] = useState(false);
  const [rolloutDuration, setRolloutDuration] = useState(10);

  useEffect(() => {
    const updateDuration = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 390;
      const distance = Math.max(80, vw - 64 - 34);
      const speed = 835 / 30; // 27.83 px/s
      setRolloutDuration(distance / speed);
    };
    updateDuration();
    window.addEventListener("resize", updateDuration);
    return () => window.removeEventListener("resize", updateDuration);
  }, []);

  useEffect(() => {
    if (inView && !hasRolledOut) {
      setHasRolledOut(true);
    }
  }, [inView, hasRolledOut]);

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
          <div data-cursor-follower="recap" className="inline-block -ml-1 mt-2">
            <Image
              className="w-[20px] h-[20px] object-contain pointer-events-none"
              src="/recap/blue_mouse.svg"
              width={49}
              height={48}
              alt="Arrow"
              unoptimized
            />
          </div>
        </div>

        {/* Smiley & 99+ Projects Built */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-[42px] h-[42px]">
            <div className="w-full h-full animate-[spin_20s_linear_infinite]">
              <PixelSmiley />
            </div>
          </div>
          <div className="w-[74px] h-[48px] -rotate-6">
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
           
          </div>
        </div>

        {/* Filmstrip rolling out from canister to right edge */}
        <div
          className={`film-strip-group absolute left-[64px] top-[10px] bottom-[10px] border-y-[2px] border-[#313131] bg-black overflow-hidden z-10 film-rollout-container ${
            hasRolledOut ? "film-deployed" : ""
          }`}
          style={{
            transition: hasRolledOut
              ? `width ${rolloutDuration.toFixed(2)}s linear`
              : undefined,
          }}
        >
          {/* Leading 35mm Film Leader Tongue */}
          <div
            className={`absolute top-0 right-0 z-30 transition-opacity duration-500 pointer-events-none ${
              hasRolledOut ? "opacity-0" : "opacity-100"
            }`}
            style={{
              transitionDelay: hasRolledOut ? `${Math.max(0, rolloutDuration - 0.3).toFixed(2)}s` : "0s",
            }}
          >
            <FilmLeader isMobile />
          </div>
          {/* Top Film Sprocket Holes */}
          <div className="absolute top-[4px] left-[6px] right-0 overflow-hidden pointer-events-none z-10">
            <div className="film-sprocket-track flex gap-[6px]">
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={`mob-top-sprocket-a-${i}`}
                  className="w-[10px] h-[13px] bg-white rounded-[2px] shrink-0"
                />
              ))}
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={`mob-top-sprocket-b-${i}`}
                  className="w-[10px] h-[13px] bg-white rounded-[2px] shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Photo Marquee */}
          <div className="absolute top-[22px] bottom-[22px] left-[6px] right-0 overflow-hidden flex items-center">
            <div className="film-marquee-track flex gap-3">
              {EVENT_PHOTOS.concat(EVENT_PHOTOS).map((src, i) => (
                <div
                  key={`mob-photo-${i}`}
                  className="w-[155px] h-[105px] rounded-[2px] overflow-hidden border border-[#222222] shrink-0"
                >
                  <Image
                    className="w-full h-full object-cover"
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
          <div className="absolute bottom-[4px] left-[6px] right-0 overflow-hidden pointer-events-none z-10">
            <div className="film-sprocket-track flex gap-[6px]">
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={`mob-bottom-sprocket-a-${i}`}
                  className="w-[10px] h-[13px] bg-white rounded-[2px] shrink-0"
                />
              ))}
              {Array.from({ length: 52 }).map((_, i) => (
                <div
                  key={`mob-bottom-sprocket-b-${i}`}
                  className="w-[10px] h-[13px] bg-white rounded-[2px] shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Quote + 30 Hours Stamp + Core Memory */}
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
          {/* 30 Hours Stamp */}
          <div
            className={`flex items-center select-none ${stampTrigger ? "stamp-active" : "opacity-0 scale-[2]"
              }`}
          >
            <Image
              className="w-[105px] h-[54px] object-contain"
              src="/recap/hours_n.svg"
              width={193}
              height={98}
              alt="30 HOURS"
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

          {/* Core Memory Marquee — the same glyph snake as desktop, not a
              scrolling image. */}
          <div
            className="core-snake-group w-[160px] h-[52px] overflow-hidden pointer-events-none relative"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 10%, black 88%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 10%, black 88%, transparent 100%)",
            }}
          >
            <div className="core-snake-track h-full font-rotonto text-[10px] leading-none text-[#FDBBFF]">
              {[0, 1].map((set) =>
                CORE_SNAKE_UNITS.map((unit, i) => {
                  const phase =
                    (set * CORE_SNAKE_UNITS.length + i) % CORE_SNAKE_WAVELENGTH;
                  return (
                    <span
                      key={`mob-core-snake-${set}-${i}`}
                      className="core-snake-item shrink-0"
                      style={{ animationDelay: `${-phase * CORE_SNAKE_STEP}s` }}
                    >
                      {unit.kind === "char" ? (
                        unit.ch
                      ) : (
                        <Image
                          className="w-[8px] h-[8px] object-contain mx-[5px]"
                          src={unit.src}
                          width={24}
                          height={24}
                          alt=""
                          unoptimized
                        />
                      )}
                    </span>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
