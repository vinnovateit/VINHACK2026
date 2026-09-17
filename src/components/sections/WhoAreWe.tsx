"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { WHO_ARE_WE } from "@/content/site";
import { DESKTOP, MOBILE } from "@/components/motion/recipes";

/**
 * The "WHO ARE WE" interactive collage section.
 *
 * Full-Screen Viewport-Wide Presentation (100vw × 100vh):
 * - Mounts via createPortal(..., document.body) as a true full-viewport stage.
 * - Stage is 100% stationary during park [parkStart, parkStart + travelPx] (stageY = 0).
 * - Cards scatter and stop at the approved framing position.
 * - Smooth, cinematic crossfade between "WHO ARE WE ?" and "WE ARE VINNOVATEIT".
 */

// -------------------- TIMING & SCROLL FACTORS --------------------
// 1. Total scroll travel in pixels (Increase to make the whole section scroll slower)
const SCROLL_TRAVEL = 1800;

/**
 * The room the canvas gives this section: Projects' shifted top (2496 + the
 * 1296 `.recap-extended-sections` carries) less this section's own top of 1392.
 * Keep it in step with that translate.
 */
const CANVAS_RESERVED = 2400;

// 2. Text transition factors (values between 0.0 and 1.0 of scroll progress)
const TEXT_TRANSITION = {
  // Phase 1: "WHO ARE WE ?"
  text1FadeInStart: 0.08,    // Scroll progress when "WHO ARE WE ?" starts appearing
  text1FadeInEnd: 0.28,      // Scroll progress when "WHO ARE WE ?" reaches full opacity
  text1FadeOutStart: 0.44,   // Scroll progress when "WHO ARE WE ?" starts fading out (increase to make it stay longer)
  text1FadeOutEnd: 0.70,     // Scroll progress when "WHO ARE WE ?" is completely gone (increase to fade out slower)

  // Phase 2: "WE ARE VINNOVATEIT"
  text2FadeInStart: 0.20,    // Scroll progress when "WE ARE VINNOVATEIT" starts appearing
  text2FadeInEnd: 0.90,      // Scroll progress when "WE ARE VINNOVATEIT" reaches full opacity (increase to fade in slower)
};

interface CardConfig {
  x0: number; // initial cluster x from center
  y0: number; // initial cluster y from center
  r0: number; // initial cluster rotation deg
  calcX1: (hw: number) => number; // stopped scatter x from center
  calcY1: (hh: number) => number; // stopped scatter y from center
  r1: number; // scattered rotation deg
  z: number;  // z-index in pile
}

// Calibrated stopping coordinates matching user reference screenshot
const CARD_CONFIGS: Record<string, CardConfig> = {
  // 1. Top-Left Polaroid (Classroom)
  "photo-1": {
    x0: -180,
    y0: -80,
    r0: -3,
    calcX1: (hw) => -hw * 0.66,
    calcY1: (hh) => -hh * 0.58,
    r1: -4,
    z: 14,
  },
  // 2. Top-Center Hero Polaroid (Group smiling)
  "photo-2": {
    x0: -10,
    y0: 10,
    r0: 2,
    calcX1: (hw) => -hw * 0.20,
    calcY1: (hh) => -hh * 0.55,
    r1: -12,
    z: 30,
  },
  // 3. Top-Center-Right Green Note Card ("BUILDING PROJECTS FOR A CAUSE")
  "quote-green": {
    x0: -40,
    y0: -90,
    r0: 12,
    calcX1: (hw) => hw * 0.19,
    calcY1: (hh) => -hh * 0.66,
    r1: 4,
    z: 10,
  },
  // 4. Top-Right Polaroid (Dining Table)
  "photo-3": {
    x0: 180,
    y0: -70,
    r0: 14,
    calcX1: (hw) => hw * 0.65,
    calcY1: (hh) => -hh * 0.65,
    r1: 8,
    z: 12,
  },
  // 5. Middle-Left Video 1 (Grey 01 Polaroid)
  "video-1": {
    x0: -150,
    y0: -15,
    r0: -11,
    calcX1: (hw) => -hw * 0.68,
    calcY1: (hh) => -hh * 0.08,
    r1: -8,
    z: 24,
  },
  // 6. Middle-Right Pink Note Card ("WE ASK WHY NOT?")
  "quote-pink": {
    x0: 120,
    y0: -60,
    r0: 14,
    calcX1: (hw) => hw * 0.67,
    calcY1: (hh) => -hh * 0.21,
    r1: 8,
    z: 22,
  },
  // 7. Bottom-Left Polaroid (Grass Banner)
  "photo-4": {
    x0: -170,
    y0: 90,
    r0: 36,
    calcX1: (hw) => -hw * 0.69,
    calcY1: (hh) => hh * 0.50,
    r1: 34,
    z: 16,
  },
  // 8. Bottom-Center-Left Blue Note Card ("CURIOUS BY NATURE...")
  "quote-blue": {
    x0: -80,
    y0: 90,
    r0: -16,
    calcX1: (hw) => -hw * 0.30,
    calcY1: (hh) => hh * 0.66,
    r1: -14,
    z: 26,
  },
  // 9. Bottom-Center-Right Red Note Card ("DIFFERENT MINDS...")
  "quote-red": {
    x0: 80,
    y0: 110,
    r0: 20,
    calcX1: (hw) => hw * 0.29,
    calcY1: (hh) => hh * 0.67,
    r1: 4,
    z: 18,
  },
  // 10. Bottom-Right Video 2 (Grey VIDEO Polaroid)
  "video-2": {
    x0: 160,
    y0: 35,
    r0: -20,
    calcX1: (hw) => hw * 0.66,
    calcY1: (hh) => hh * 0.32,
    r1: -22,
    z: 20,
  },
};

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Critically damped spring simulation (smoothDamp).
 * Eliminates mouse-wheel notch jumps and trackpad momentum stutter.
 */
function smoothDamp(
  current: number,
  target: number,
  velocityRef: { value: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;

  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = clamp(-maxChange, maxChange, change);
  target = current - change;

  const temp = (velocityRef.value + omega * change) * deltaTime;
  velocityRef.value = (velocityRef.value - omega * temp) * exp;
  let output = target + (change + temp) * exp;

  if ((originalTo - current > 0) === (output > originalTo)) {
    output = originalTo;
    velocityRef.value = (output - originalTo) / deltaTime;
  }

  return output;
}

const emptySubscribe = () => () => {};

/**
 * `canvas` is the collage's own placeholder — absolutely positioned at its
 * Figma offset inside the 1280 frame. `flow` is the same section as an ordinary
 * block in the phone's single column.
 *
 * The stage itself is identical either way: it is a fixed, viewport-sized
 * portal on `document.body`, so it was never inside the scaled canvas to begin
 * with and it needs nothing from the layout around it but a run of scroll to
 * park against. That is the whole reason the phone can have the desktop
 * collage rather than a list standing in for it — only the reserved scroll
 * space differs, and only the card scale is read off the screen.
 *
 * Both layouts are in the document at once (see `app/page.tsx`), so each
 * instance is gated on the breakpoint it belongs to. Exactly one is ever armed;
 * the other holds its portal at `display: none` and runs no measurement.
 */
export default function WhoAreWeSection({
  variant = "canvas",
}: {
  variant?: "canvas" | "flow";
} = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // SSR-safe client mount without cascading renders
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const portalEl = portalRef.current;
    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    if (!container || !portalEl || !text1 || !text2) return;

    const inRange = window.matchMedia(variant === "flow" ? MOBILE : DESKTOP);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let parkStart = 0;
    let travelPx = SCROLL_TRAVEL;
    let armed = false;
    let drawnP = Number.NaN;
    let hw = 640;
    let hh = 400;
    let cardScale = 1;

    const measure = () => {
      if (!inRange.matches) {
        armed = false;
        portalEl.style.display = "none";
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width === 0) {
        armed = false;
        return;
      }
      armed = true;

      hw = window.innerWidth / 2;
      hh = window.innerHeight / 2;
      // Proportional card scale. The phone is not a smaller monitor: a card
      // kept at the desktop's scale would be two thirds of the screen wide and
      // the ten of them would sit on top of one another instead of scattering,
      // so the narrow layout is scaled off the width alone and much further
      // down. The scatter targets are fractions of the half-screen, so the
      // arrangement itself comes through unchanged at either size.
      cardScale =
        variant === "flow"
          ? clamp(0.34, 0.6, window.innerWidth / 900)
          : clamp(0.85, 1.15, Math.min(window.innerWidth / 1440, window.innerHeight / 900));

      const containerTopDoc = window.scrollY + rect.top;
      parkStart = containerTopDoc;
      /* The park has to end while the stage is still the only thing on the
         screen. It is a fixed, viewport-tall panel, so it is not clear of the
         page until a further `innerHeight` of scrolling has gone by — and
         whatever the layout draws next is underneath it for every pixel of
         that. The section reserves a fixed run (the canvas cannot do otherwise:
         everything below it sits at a hard Figma offset), so it is the *park*
         that gives way, not the reservation. Without this the collage is still
         sliding off while Projects is already on screen behind it, which is
         exactly as wrong as it sounds — and it only shows on a tall window,
         because that is when the exit is longer than the surplus. */
      const exit = window.innerHeight;

      if (variant === "flow") {
        travelPx = Math.max(900, Math.round(SCROLL_TRAVEL * 0.7));
        // In flow the reservation can simply be told how much room to keep.
        container.style.height = `${travelPx + exit}px`;
      } else {
        /* What the collage actually has on the canvas, and it is not this
           section's own `height`: everything from Projects down is shifted by
           `.recap-extended-sections` (+1296px in globals.css), which puts
           Projects at 3792 against this section's 1392 — 2400px of room, not
           the 2632 the placeholder is drawn at. Reserve against the real
           number or the last screenful of the park has Projects under it. */
        const reserved = CANVAS_RESERVED;
        travelPx = clamp(
          900,
          Math.max(900, reserved - exit),
          Math.max(1500, Math.round(SCROLL_TRAVEL * (rect.width / 1280 || 1))),
        );
      }
    };

    const render = (progress: number) => {
      // Phase 1 (0.0 -> 0.45): Scatter outward to the exact stop positions
      const scatterP = clamp(0, 1, progress / 0.45);
      const easeScatter = easeOutQuad(scatterP);

      // Phase 2 (0.45 -> 1.0): Gentle subtle breath (stay comfortably in place)
      let driftP = 0;
      if (progress > 0.45) {
        driftP = easeOutQuad(clamp(0, 1, (progress - 0.45) / 0.55));
      }

      for (const [id, config] of Object.entries(CARD_CONFIGS)) {
        const el = cardElementsRef.current.get(id);
        if (!el) continue;

        const targetX = config.calcX1(hw);
        const targetY = config.calcY1(hh);

        const baseX = mix(config.x0, targetX, easeScatter);
        const baseY = mix(config.y0, targetY, easeScatter);
        const r = mix(config.r0, config.r1, easeScatter);

        // Keep cards stopped right here with barely perceptible 1.5% organic drift
        const x = baseX + targetX * 0.015 * driftP;
        const y = baseY + targetY * 0.015 * driftP;

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(1)}deg) scale(${cardScale.toFixed(3)})`;
      }

      // Center Text 1: "WHO ARE WE ?"
      let op1 = 0;
      let scale1 = 0.94;
      const {
        text1FadeInStart,
        text1FadeInEnd,
        text1FadeOutStart,
        text1FadeOutEnd,
        text2FadeInStart,
        text2FadeInEnd,
      } = TEXT_TRANSITION;

      if (progress >= text1FadeInStart && progress <= text1FadeOutEnd) {
        if (progress < text1FadeInEnd) {
          const t = (progress - text1FadeInStart) / (text1FadeInEnd - text1FadeInStart);
          op1 = easeOutQuad(t);
          scale1 = 0.94 + op1 * 0.06;
        } else if (progress <= text1FadeOutStart) {
          op1 = 1;
          scale1 = 1;
        } else {
          const t = (progress - text1FadeOutStart) / (text1FadeOutEnd - text1FadeOutStart);
          op1 = 1 - easeOutQuad(t);
          scale1 = 1 + t * 0.03;
        }
      }
      text1.style.opacity = op1.toFixed(3);
      text1.style.transform = `scale(${scale1.toFixed(3)})`;

      // Center Text 2: "WE ARE VINNOVATEIT" + Tagline
      let op2 = 0;
      let scale2 = 0.95;
      if (progress > text2FadeInStart) {
        const t = clamp(0, 1, (progress - text2FadeInStart) / (text2FadeInEnd - text2FadeInStart));
        op2 = easeOutQuad(t);
        scale2 = 0.95 + op2 * 0.05;
      }
      text2.style.opacity = op2.toFixed(3);
      text2.style.transform = `scale(${scale2.toFixed(3)})`;
    };

    let latestScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const onScroll = () => {
      latestScrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    };

    let currentP = 0;
    let smoothScrollY = latestScrollY;
    const scrollVel = { value: 0 };
    const pVel = { value: 0 };
    let lastTime = typeof performance !== "undefined" ? performance.now() : 0;
    let initialized = false;

    const update = (dt: number) => {
      if (!armed) {
        if (inRange.matches) {
          measure();
        }
        if (!armed) {
          portalEl.style.display = "none";
          return;
        }
      }

      const currentScrollY = latestScrollY;
      const isReduced = calm.matches;

      if (!initialized) {
        smoothScrollY = currentScrollY;
        scrollVel.value = 0;
        pVel.value = 0;
      } else if (isReduced || Math.abs(currentScrollY - smoothScrollY) > 2000) {
        smoothScrollY = currentScrollY;
        scrollVel.value = 0;
      } else {
        // Smooth input filtering (smoothDamp)
        smoothScrollY = smoothDamp(
          smoothScrollY,
          currentScrollY,
          scrollVel,
          0.08,
          Infinity,
          dt
        );
      }

      // Full-Screen Pinned Stage Translation:
      let stageY = 0;
      if (smoothScrollY < parkStart) {
        stageY = parkStart - smoothScrollY;
      } else if (smoothScrollY > parkStart + travelPx) {
        stageY = (parkStart + travelPx) - smoothScrollY;
      } else {
        stageY = 0; // ZERO MOVEMENT - 100% COMPOSITOR PINNED!
      }

      // Culled when completely outside viewport
      if (
        stageY > window.innerHeight * 1.2 ||
        stageY < -window.innerHeight * 1.2
      ) {
        if (portalEl.style.display !== "none") portalEl.style.display = "none";
      } else {
        if (portalEl.style.display !== "block") portalEl.style.display = "block";
        const transformStr = `translate3d(0, ${stageY.toFixed(1)}px, 0)`;
        if (portalEl.style.transform !== transformStr) {
          portalEl.style.transform = transformStr;
        }
      }

      // Progress computation:
      const stuck = clamp(0, travelPx, smoothScrollY - parkStart);
      const targetP = stuck / travelPx;

      if (!initialized) {
        currentP = targetP;
        initialized = true;
      } else if (isReduced) {
        currentP = targetP;
        pVel.value = 0;
      } else {
        currentP = smoothDamp(currentP, targetP, pVel, 0.12, Infinity, dt);
        if (Math.abs(currentP - targetP) < 0.0001 && Math.abs(pVel.value) < 0.0001) {
          currentP = targetP;
          pVel.value = 0;
        }
      }

      if (Number.isNaN(drawnP) || Math.abs(currentP - drawnP) > 0.0004) {
        drawnP = currentP;
        render(currentP);
      }
    };

    let rafId = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.064, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      update(dt);
      rafId = requestAnimationFrame(tick);
    };

    const onLayout = () => {
      measure();
      drawnP = Number.NaN;
      initialized = false;
      lastTime = performance.now();
      update(0.016);
    };

    onLayout();
    rafId = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onLayout, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
      if (portalEl) portalEl.style.display = "none";
    };
  }, [mounted, variant]);

  const registerCard = (id: string, el: HTMLDivElement | null) => {
    if (el) cardElementsRef.current.set(id, el);
    else cardElementsRef.current.delete(id);
  };

  const greenQuote = WHO_ARE_WE.quotes[0];
  const pinkQuote = WHO_ARE_WE.quotes[1];
  const blueQuote = WHO_ARE_WE.quotes[2];
  const redQuote = WHO_ARE_WE.quotes[3];

  return (
    <>
      {/* Placeholder — reserves the scroll the stage parks against. */}
      <section
        ref={containerRef}
        aria-label="Who Are We"
        className={
          variant === "flow"
            ? "relative w-full bg-black"
            : "-translate-x-1/2 absolute bg-black left-1/2 overflow-visible top-[1392px] w-[1280px]"
        }
        style={{
          height:
            variant === "flow"
              ? `${Math.round(SCROLL_TRAVEL * 0.7) + 520}px`
              : `${CANVAS_RESERVED}px`,
          overflowAnchor: "none",
        }}
        data-name="WHO ARE WE"
      />

      {/* Full-Screen Portal Stage */}
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={portalRef}
              className="will-change-transform bg-black pointer-events-none"
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 25,
                overflowAnchor: "none",
                overflow: "hidden",
                display: "none",
              }}
            >
              {/* Subtle grid accent background */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#bfea88_1px,transparent_1px)] [background-size:24px_24px]"
              />

              {/* ----------------- CENTER TYPOGRAPHY LAYER ----------------- */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
                {/* State 1: WHO ARE WE ? */}
                <div
                  ref={text1Ref}
                  className="absolute transition-transform duration-75 text-center px-4 will-change-transform opacity-0"
                >
                  <h2 className="font-rotonto text-[#bfea88] text-[clamp(34px,10.5vw,104px)] tracking-[0.06em] leading-none whitespace-nowrap drop-shadow-[0_0_45px_rgba(191,234,136,0.45)]">
                    {WHO_ARE_WE.title}
                  </h2>
                </div>

                {/* State 2: WE ARE VINNOVATEIT */}
                <div
                  ref={text2Ref}
                  className="absolute flex flex-col items-center justify-center text-center px-6 will-change-transform opacity-0"
                >
                  <span className="font-rotonto text-[#bfea88] text-[clamp(12px,3vw,22px)] tracking-[0.25em] mb-2 uppercase opacity-90">
                    {WHO_ARE_WE.reveal.eyebrow}
                  </span>
                  <h2 className="font-rotonto text-[#bfea88] text-[clamp(28px,8.6vw,104px)] tracking-[0.04em] leading-none uppercase drop-shadow-[0_0_50px_rgba(191,234,136,0.5)] whitespace-nowrap">
                    {WHO_ARE_WE.reveal.brand}
                  </h2>
                  <p className="font-rotonto text-[#fcfcfc] text-[clamp(10px,2.6vw,18px)] tracking-[0.24em] mt-4 uppercase opacity-95">
                    {WHO_ARE_WE.reveal.tagline}
                  </p>
                </div>
              </div>

              {/* ----------------- FLOATING CARDS COLLAGE ----------------- */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* 1. TOP-LEFT POLAROID (Classroom) */}
                <div
                  ref={(el) => registerCard("photo-1", el)}
                  style={{ zIndex: CARD_CONFIGS["photo-1"].z }}
                  className="absolute w-[220px] md:w-[245px] bg-[#ffffff] p-[12px] pb-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.85)] will-change-transform"
                >
                  <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                    <Image
                      src={WHO_ARE_WE.polaroids[0].src}
                      alt={WHO_ARE_WE.polaroids[0].alt}
                      fill
                      sizes="245px"
                      className="object-cover grayscale contrast-120"
                    />
                  </div>
                </div>

                {/* 2. TOP-CENTER HERO POLAROID (Looking up) */}
                <div
                  ref={(el) => registerCard("photo-2", el)}
                  style={{ zIndex: CARD_CONFIGS["photo-2"].z }}
                  className="absolute w-[250px] md:w-[275px] bg-[#ffffff] p-[14px] pb-[42px] shadow-[0_24px_48px_rgba(0,0,0,0.9)] will-change-transform"
                >
                  <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                    <Image
                      src={WHO_ARE_WE.polaroids[1].src}
                      alt={WHO_ARE_WE.polaroids[1].alt}
                      fill
                      sizes="275px"
                      className="object-cover grayscale contrast-115"
                    />
                  </div>
                </div>

                {/* 3. TOP-CENTER GREEN NOTE CARD ("BUILDING PROJECTS FOR A CAUSE") */}
                <div
                  ref={(el) => registerCard("quote-green", el)}
                  style={{
                    zIndex: CARD_CONFIGS["quote-green"].z,
                    backgroundColor: greenQuote.color,
                  }}
                  className="absolute w-[250px] md:w-[275px] h-[230px] md:h-[255px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.75)] flex flex-col justify-between will-change-transform"
                >
                  <p className="font-rotonto text-black text-[25px] md:text-[27px] leading-[1.08] font-bold uppercase whitespace-pre-line">
                    {greenQuote.headline}
                  </p>
                  <p className="font-sans text-black/80 text-[10px] md:text-[11px] font-bold tracking-[0.16em] uppercase">
                    {greenQuote.subline}
                  </p>
                </div>

                {/* 4. TOP-RIGHT POLAROID (Dining Table) */}
                <div
                  ref={(el) => registerCard("photo-3", el)}
                  style={{ zIndex: CARD_CONFIGS["photo-3"].z }}
                  className="absolute w-[220px] md:w-[245px] bg-[#ffffff] p-[12px] pb-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.85)] will-change-transform"
                >
                  <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                    <Image
                      src={WHO_ARE_WE.polaroids[2].src}
                      alt={WHO_ARE_WE.polaroids[2].alt}
                      fill
                      sizes="245px"
                      className="object-cover grayscale contrast-120"
                    />
                  </div>
                </div>

                {/* 5. MIDDLE-LEFT POLAROID (Team photo, in the "01" slot) */}
                <div
                  ref={(el) => registerCard("video-1", el)}
                  style={{ zIndex: CARD_CONFIGS["video-1"].z }}
                  className="absolute w-[240px] md:w-[265px] bg-[#ffffff] p-[12px] pb-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.85)] will-change-transform"
                >
                  <div className="relative w-full aspect-[16/10] bg-black overflow-hidden">
                    <Image
                      src={WHO_ARE_WE.teamPhoto.src}
                      alt={WHO_ARE_WE.teamPhoto.alt}
                      fill
                      sizes="265px"
                      className="object-cover grayscale contrast-115"
                    />
                  </div>
                </div>

                {/* 6. MIDDLE-RIGHT PINK NOTE CARD ("WE ASK "WHY NOT?"") */}
                <div
                  ref={(el) => registerCard("quote-pink", el)}
                  style={{
                    zIndex: CARD_CONFIGS["quote-pink"].z,
                    backgroundColor: pinkQuote.color,
                  }}
                  className="absolute w-[240px] md:w-[265px] h-[225px] md:h-[245px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.75)] flex flex-col justify-between will-change-transform"
                >
                  <p className="font-rotonto text-black text-[26px] md:text-[28px] leading-[1.1] font-bold uppercase whitespace-pre-line">
                    {pinkQuote.headline}
                  </p>
                  <p className="font-sans text-black/70 text-[9px] md:text-[10px] font-bold tracking-[0.16em] uppercase text-right">
                    PROBABLY...
                  </p>
                </div>

                {/* 7. BOTTOM-LEFT POLAROID (Banner) */}
                <div
                  ref={(el) => registerCard("photo-4", el)}
                  style={{ zIndex: CARD_CONFIGS["photo-4"].z }}
                  className="absolute w-[220px] md:w-[245px] bg-[#ffffff] p-[12px] pb-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.85)] will-change-transform"
                >
                  <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                    <Image
                      src={WHO_ARE_WE.polaroids[3].src}
                      alt={WHO_ARE_WE.polaroids[3].alt}
                      fill
                      sizes="245px"
                      className="object-cover grayscale contrast-120"
                    />
                  </div>
                </div>

                {/* 8. BOTTOM-CENTER-LEFT BLUE NOTE CARD */}
                <div
                  ref={(el) => registerCard("quote-blue", el)}
                  style={{
                    zIndex: CARD_CONFIGS["quote-blue"].z,
                    backgroundColor: blueQuote.color,
                  }}
                  className="absolute w-[255px] md:w-[280px] h-[240px] md:h-[260px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.75)] flex flex-col justify-between will-change-transform"
                >
                  <p className="font-rotonto text-black text-[23px] md:text-[25px] leading-[1.08] font-bold uppercase whitespace-pre-line">
                    {blueQuote.headline}
                  </p>
                  <p className="font-mono text-black/80 text-[10px] md:text-[11px] tracking-wider uppercase font-semibold">
                    {blueQuote.subline}
                  </p>
                </div>

                {/* 9. BOTTOM-CENTER-RIGHT RED NOTE CARD */}
                <div
                  ref={(el) => registerCard("quote-red", el)}
                  style={{
                    zIndex: CARD_CONFIGS["quote-red"].z,
                    backgroundColor: redQuote.color,
                  }}
                  className="absolute w-[240px] md:w-[265px] h-[230px] md:h-[250px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.75)] flex flex-col justify-between will-change-transform"
                >
                  <p className="font-rotonto text-black text-[24px] md:text-[26px] leading-[1.08] font-bold uppercase whitespace-pre-line">
                    {redQuote.headline}
                  </p>
                  <p className="font-mono text-black/80 text-[10px] md:text-[11px] tracking-wider uppercase font-semibold">
                    {redQuote.subline}
                  </p>
                </div>

                {/* 10. BOTTOM-RIGHT VIDEO 2 (Grey VIDEO Polaroid) */}
                <div
                  ref={(el) => registerCard("video-2", el)}
                  style={{ zIndex: CARD_CONFIGS["video-2"].z }}
                  className="absolute w-[240px] md:w-[265px] bg-[#ffffff] p-[12px] pb-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.85)] will-change-transform"
                >
                  <div className="relative w-full aspect-[16/10] bg-[#b0b0b0] flex items-center justify-center">
                    <span className="font-rotonto text-black text-[21px] md:text-[23px] font-bold tracking-widest uppercase">
                      VIDEO
                    </span>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
