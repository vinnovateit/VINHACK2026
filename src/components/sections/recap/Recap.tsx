"use client";

import { type FC, useEffect, useState } from "react";
import Image from "next/image";
import FilmCanister from "./FilmCanister";
import FilmLeader from "./FilmLeader";
import CollegesBadge from "./CollegesBadge";
import BuildersCounter from "./BuildersCounter";
import PixelSmiley from "./PixelSmiley";
import { playStampSlam } from "@/components/motion/film";

const EVENT_PHOTOS = [
  "/about_us/vinnovateit-team.webp",
  "/about_us/2.webp",
  "/about_us/94fc2ef86e7f542a782c6ecc5761e7547108bf56.webp",
  "/about_us/myuchdw8z4pxshqbyddz.webp",
  "/about_us/67637ab629928adcbde8469183aac1877a08026b.webp",
  "/about_us/9.webp",
  "/about_us/220a17ad3a3ad4382bb239416e67f3f8e44d6413.webp",
  "/about_us/ywcmb03aeozom8tmqtbs.webp",
  "/about_us/924203fb63dc0f4fd3cb3bfe64c9230caf80a54e.webp",
  "/about_us/1.webp",
];

const SPROCKET_COUNT = 116;

// The "core memory" snake, one set = the wordmark (as individual glyphs so
// the wave bends through the word, not just between words) followed by an
// accent icon, three times over. Each unit gets a bob phase from its index;
// the wave repeats every CORE_SNAKE_WAVELENGTH units, and a set's length is
// a multiple of that, so the two cloned sets loop seamlessly.
const CORE_SNAKE_ICONS = ["/figma/star2.svg", "/figma/vector51.svg", "/recap/flowers.svg"];
type CoreSnakeUnit = { kind: "char"; ch: string } | { kind: "icon"; src: string };
const CORE_SNAKE_UNITS: CoreSnakeUnit[] = CORE_SNAKE_ICONS.flatMap((src) => [
  ...[..."core memory"].map((ch): CoreSnakeUnit => ({ kind: "char", ch })),
  { kind: "icon", src },
]);
const CORE_SNAKE_WAVELENGTH = 12; // units per full S — exactly one "core memory ✦"
const CORE_SNAKE_PERIOD = 2.4; // seconds, = animation-duration of core-snake-bob
const CORE_SNAKE_STEP = CORE_SNAKE_PERIOD / CORE_SNAKE_WAVELENGTH;

interface RecapProps {
  inView?: boolean;
}

export const RECAP: FC<RecapProps> = ({ inView = true }) => {
  const [stampTrigger, setStampTrigger] = useState(false);
  const [hasRolledOut, setHasRolledOut] = useState(false);
  const [rolloutDuration, setRolloutDuration] = useState(12);

  useEffect(() => {
    const updateDuration = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
      const distance = Math.max(100, vw - 174 - 54);
      const speed = 3040 / 30; // 101.33 px/s
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
    }, 1100);
    return () => {
      clearTimeout(timer);
      setStampTrigger(false);
    };
  }, [inView]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-rotonto">
      {/* 1. 15+ Colleges Badge (Top-Left) with Animated Circle Draw */}
      <div
        className="absolute top-[122px] left-[200px] z-20 w-[130px] h-[95px] -rotate-6"
        style={{
          transform: inView ? "translateY(0)" : "translateY(-18px)",
          opacity: inView ? 1 : 0,
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 0.6s ease 0.15s",
        }}
      >
        <CollegesBadge inView={inView} />
      </div>

      {/* 2. 300+ BUILDERS (Top-Center) - "BUILDERS" stays steady, "300+" counts up and locks into original text */}
      <div
        className="absolute top-[120px] left-[570px] z-20 flex items-center"
        style={{
          transform: inView ? "translateY(0)" : "translateY(-18px)",
          opacity: inView ? 1 : 0,
          transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 0.6s ease 0.3s",
        }}
      >
        <BuildersCounter inView={inView} />
        <div data-cursor-follower="recap" className="inline-block ml-[6px] mt-[14px]">
          <Image
            className="w-[30px] h-[30px] object-contain pointer-events-none transition-transform duration-500 delay-500"
            style={{
              transform: inView ? "translate(0, 0)" : "translate(12px, 12px)",
            }}
            src="/recap/blue_mouse.svg"
            width={49}
            height={48}
            alt="Arrow"
            unoptimized
          />
        </div>
      </div>

      {/* 3. Green Rotating Badge with Corner Fly-In & Dynamic Pixel Smiley + 99+ Projects Ticket */}
      <div className="absolute top-[100px] right-[24px] z-20 flex items-center gap-[6px]">
        {/* Dynamic LED Pixel Smiley flying in from corner */}
        <div
          className="w-[74px] h-[74px]"
          style={{
            transform: inView
              ? "translate(0, 0) scale(1)"
              : "translate(80px, -60px) scale(0)",
            transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s",
          }}
        >
          <div className="w-full h-full animate-[spin_20s_linear_infinite]">
            <PixelSmiley />
          </div>
        </div>

        {/* 99+ Projects Built Ticket */}
        <div
          className="w-[135px] h-[88px] -rotate-6"
          style={{
            transform: inView
              ? "scale(1) rotate(-6deg)"
              : "scale(1.8) rotate(-16deg)",
            opacity: inView ? 1 : 0,
            transition:
              "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.2) 0.4s, opacity 0.35s ease 0.4s",
          }}
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

      {/* Filmstrip Assembly - Rolls out from canister on reveal led by 35mm leader tongue */}
      <div
        className={`film-strip-group absolute top-[198px] left-[174px] h-[238px] border-y-[2.5px] border-[#313131] bg-black overflow-hidden z-10 film-rollout-container ${
          hasRolledOut ? "film-deployed" : ""
        }`}
        style={{
          transition: hasRolledOut
            ? `width ${rolloutDuration.toFixed(2)}s linear`
            : undefined,
        }}
      >
        {/* Leading 35mm Film Leader Tongue - Physical leader pulling film out */}
        <div
          className={`absolute top-0 right-0 z-30 transition-opacity duration-700 pointer-events-none ${
            hasRolledOut ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transitionDelay: hasRolledOut ? `${Math.max(0, rolloutDuration - 0.4).toFixed(2)}s` : "0s",
          }}
        >
          <FilmLeader />
        </div>
        {/* Top Film Sprocket Holes (stretching all the way to right screen edge) */}
        <div className="absolute top-[8px] left-[12px] right-0 overflow-hidden pointer-events-none z-10">
          <div className="film-sprocket-track flex gap-[9px]">
            {/* Set A */}
            {Array.from({ length: SPROCKET_COUNT }).map((_, i) => (
              <div
                key={`top-sprocket-a-${i}`}
                className="w-[14px] h-[19px] bg-white rounded-[3px] shrink-0"
              />
            ))}
            {/* Set B */}
            {Array.from({ length: SPROCKET_COUNT }).map((_, i) => (
              <div
                key={`top-sprocket-b-${i}`}
                className="w-[14px] h-[19px] bg-white rounded-[3px] shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Infinite Photo Marquee - Seamless loop flowing from left to right */}
        <div className="absolute top-[36px] left-[14px] right-0 h-[165px] overflow-hidden">
          <div className="film-marquee-track flex gap-[26px]">
            {/* Set A */}
            {EVENT_PHOTOS.map((src, i) => (
              <div
                key={`photo-a-${i}`}
                className="w-[240px] h-[165px] rounded-[2px] overflow-hidden border border-[#222222] shrink-0"
              >
                <Image
                  className="w-full h-full object-cover"
                  src={src}
                  width={360}
                  height={255}
                  alt={`VinHack memory ${i + 1}`}
                />
              </div>
            ))}

            {/* Set B (Exact clone for seamless loop) */}
            {EVENT_PHOTOS.map((src, i) => (
              <div
                key={`photo-b-${i}`}
                className="w-[240px] h-[165px] rounded-[2px] overflow-hidden border border-[#222222] shrink-0"
              >
                <Image
                  className="w-full h-full object-cover"
                  src={src}
                  width={360}
                  height={255}
                  alt={`VinHack memory clone ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Film Sprocket Holes (stretching all the way to right screen edge) */}
        <div className="absolute bottom-[8px] left-[12px] right-0 overflow-hidden pointer-events-none z-10">
          <div className="film-sprocket-track flex gap-[9px]">
            {/* Set A */}
            {Array.from({ length: SPROCKET_COUNT }).map((_, i) => (
              <div
                key={`bottom-sprocket-a-${i}`}
                className="w-[14px] h-[19px] bg-white rounded-[3px] shrink-0"
              />
            ))}
            {/* Set B */}
            {Array.from({ length: SPROCKET_COUNT }).map((_, i) => (
              <div
                key={`bottom-sprocket-b-${i}`}
                className="w-[14px] h-[19px] bg-white rounded-[3px] shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 35mm Film Roll Canister Assembly */}
      <div className="relative z-20">
        <FilmCanister />
      </div>

      {/* Bottom Details & Badges */}
      {/* 4. Quote text - Rotonto, pure white, exact 5-line break matching design */}
      <div
        className="absolute top-[452px] left-[190px] text-left select-none pointer-events-none"
        style={{
          transform: inView ? "translateY(0)" : "translateY(14px)",
          opacity: inView ? 1 : 0,
          transition:
            "transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, opacity 0.8s ease 0.5s",
        }}
      >
        <p className="font-rotonto text-[16px] text-white leading-[1.3] tracking-normal font-normal whitespace-nowrap">
          it was loud, chaotic,<br />
          exhausting, and somehow<br />
          one of those weekends<br />
          you wish you could do all<br />
          over again.
        </p>
      </div>

      {/* 5. 30 HOURS Red Grunge Stamp - Authentic Rubber Stamp Slam Animation */}
      <div
        className={`absolute top-[442px] left-[550px] z-20 flex items-center select-none ${stampTrigger ? "stamp-active" : "opacity-0 scale-[2.8]"
          }`}
      >
        <Image
          className="w-[136px] h-[70px] object-contain"
          src="/recap/hours_n.svg"
          width={193}
          height={98}
          alt="30 HOURS"
          unoptimized
        />
        <Image
          className="w-[30px] h-[30px] object-contain -ml-[14px] -mt-[6px] pointer-events-none"
          src="/recap/flowers.svg"
          width={47}
          height={47}
          alt="Flower accent"
          unoptimized
        />
      </div>

      {/* 6. "core memory" — wordmark and accent icons slithering left-to-right
          along a horizontal S-curve. Each item bobs on a sine with a phase
          offset by index, so together they form a travelling snake. Hover
          pauses in place. */}
      <div
        className="core-snake-group absolute top-[452px] right-[20px] w-[270px] h-[96px] overflow-hidden z-20"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          transform: inView ? "translateX(0)" : "translateX(24px)",
          opacity: inView ? 1 : 0,
          transition:
            "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.6s, opacity 0.7s ease 0.6s",
        }}
      >
        <div className="core-snake-track h-full font-rotonto text-[15px] leading-none text-[#FDBBFF]">
          {[0, 1].map((set) =>
            CORE_SNAKE_UNITS.map((unit, i) => {
              const phase = (set * CORE_SNAKE_UNITS.length + i) % CORE_SNAKE_WAVELENGTH;
              return (
                <span
                  key={`core-snake-${set}-${i}`}
                  className="core-snake-item shrink-0"
                  style={{ animationDelay: `${-phase * CORE_SNAKE_STEP}s` }}
                >
                  {unit.kind === "char" ? (
                    unit.ch
                  ) : (
                    <Image
                      className="w-[12px] h-[12px] object-contain mx-[8px]"
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
  );
};

export default RECAP;
