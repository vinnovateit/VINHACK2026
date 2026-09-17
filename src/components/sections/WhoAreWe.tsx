"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { WHO_ARE_WE } from "@/content/site";
import { DESKTOP, MOBILE } from "@/components/motion/recipes";
import { clamp, mix, easeOutQuad, smoothDamp } from "@/lib/math";

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
const SCROLL_TRAVEL = 1100;

/**
 * The room the canvas gives this section: Projects' shifted top (2496 + the
 * -4px `.recap-extended-sections` carries) less this section's own top of 1392.
 * Keep it in step with that translate.
 */
const CANVAS_RESERVED = 1100;

// 2. The headline crossfade. It is a clock, not a scroll position: the two
// lines run themselves once the stage is parked and fills the screen, so the
// reveal plays at the same pace whether the visitor is scrolling slowly, fast,
// or has stopped. Only the cards' scatter is still scrubbed by scroll.
//
// TEXT_DURATION is the whole run in seconds; the numbers below are fractions
// of it, in the order they happen.
const TEXT_DURATION = 3.0;

/**
 * How much of that run the page is actually held still for, as a fraction.
 *
 * Not all of it. The hold only has to last until the handover has happened and
 * "WE ARE VINNOVATEIT" is legible — by 0.55 the first line is gone and the
 * second is most of the way in, and the last of the fade can finish perfectly
 * well while the visitor is scrolling on. Holding for the whole three seconds
 * is a second longer than the thing it is protecting actually needs, and a
 * second is a long time to lean on a wheel that is not moving.
 */
const HOLD_FRACTION = 0.55;

const TEXT_TRANSITION = {
  // Phase 1: "WHO ARE WE ?"
  text1FadeInStart: 0.0,     // when "WHO ARE WE ?" starts appearing
  text1FadeInEnd: 0.14,      // when it reaches full opacity
  text1FadeOutStart: 0.36,   // when it starts fading out (raise to hold it longer)
  text1FadeOutEnd: 0.58,     // when it is completely gone (raise to fade slower)

  // Phase 2: "WE ARE VINNOVATEIT"
  text2FadeInStart: 0.42,    // when "WE ARE VINNOVATEIT" starts appearing
  text2FadeInEnd: 0.80,      // when it reaches full opacity
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

// Where each card stops, as a fraction of the half-screen it is measured
// against — so the arrangement holds its shape at any size.
//
// They are deliberately well out: the middle of the stage is the headline's,
// and a card parked anywhere near it printed over the words. `keepOffTheWords`
// below is the backstop that catches whatever a particular screen still brings
// too close; these numbers are what keep it from having to do much.
const CARD_CONFIGS: Record<string, CardConfig> = {
  // 1. Top-Left Polaroid (Classroom)
  "photo-1": {
    x0: -180,
    y0: -80,
    r0: -3,
    calcX1: (hw) => -hw * 0.70,
    calcY1: (hh) => -hh * 0.66,
    r1: -4,
    z: 14,
  },
  // 2. Top-Center Hero Polaroid (Group smiling)
  "photo-2": {
    x0: -10,
    y0: 10,
    r0: 2,
    calcX1: (hw) => -hw * 0.36,
    calcY1: (hh) => -hh * 0.72,
    r1: -12,
    z: 30,
  },
  // 3. Top-Center-Right Green Note Card ("BUILDING PROJECTS FOR A CAUSE")
  "quote-green": {
    x0: -40,
    y0: -90,
    r0: 12,
    calcX1: (hw) => hw * 0.34,
    calcY1: (hh) => -hh * 0.74,
    r1: 4,
    z: 10,
  },
  // 4. Top-Right Polaroid (Dining Table)
  "photo-3": {
    x0: 180,
    y0: -70,
    r0: 14,
    calcX1: (hw) => hw * 0.70,
    calcY1: (hh) => -hh * 0.72,
    r1: 8,
    z: 12,
  },
  // 5. Middle-Left Video 1 (Grey 01 Polaroid)
  "video-1": {
    x0: -150,
    y0: -15,
    r0: -11,
    calcX1: (hw) => -hw * 0.78,
    calcY1: (hh) => -hh * 0.10,
    r1: -8,
    z: 24,
  },
  // 6. Middle-Right Pink Note Card ("WE ASK WHY NOT?")
  "quote-pink": {
    x0: 120,
    y0: -60,
    r0: 14,
    calcX1: (hw) => hw * 0.78,
    calcY1: (hh) => -hh * 0.24,
    r1: 8,
    z: 22,
  },
  // 7. Bottom-Left Polaroid (Grass Banner)
  "photo-4": {
    x0: -170,
    y0: 90,
    r0: 36,
    calcX1: (hw) => -hw * 0.76,
    calcY1: (hh) => hh * 0.62,
    r1: 34,
    z: 16,
  },
  // 8. Bottom-Center-Left Blue Note Card ("CURIOUS BY NATURE...")
  "quote-blue": {
    x0: -80,
    y0: 90,
    r0: -16,
    calcX1: (hw) => -hw * 0.40,
    calcY1: (hh) => hh * 0.76,
    r1: -14,
    z: 26,
  },
  // 9. Bottom-Center-Right Red Note Card ("DIFFERENT MINDS...")
  "quote-red": {
    x0: 80,
    y0: 110,
    r0: 20,
    calcX1: (hw) => hw * 0.40,
    calcY1: (hh) => hh * 0.76,
    r1: 4,
    z: 18,
  },
  // 10. Bottom-Right Video 2 (Grey VIDEO Polaroid)
  "video-2": {
    x0: 160,
    y0: 35,
    r0: -20,
    calcX1: (hw) => hw * 0.76,
    calcY1: (hh) => hh * 0.42,
    r1: -22,
    z: 20,
  },
};

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
    /* Where each card actually stops, once it has been held off the headline.
       Keyed by the same ids as CARD_CONFIGS; see `keepOffTheWords`. */
    const stops = new Map<string, { x: number; y: number }>();

    /**
     * Push any card whose stop would land on the headline out until it clears
     * it.
     *
     * The scatter targets are fractions of the half-screen, so they hold their
     * arrangement at any size — but the *words* do not scale with the screen
     * the same way, and on a narrow one the same fractions put a polaroid
     * straight over "WE ARE VINNOVATEIT". The type is what the section is, so
     * the cards give way: each is moved out along whichever axis needs the
     * least to clear the words' box, and if the screen is too tight for that
     * axis it tries the other. Nothing is layered over anything — the middle is
     * simply left empty.
     *
     * Measured from the live DOM rather than assumed: the headline is set in
     * `clamp()` and its width is the webfont's, so the only reliable number is
     * the one the browser has.
     */
    const keepOffTheWords = () => {
      stops.clear();

      const words = [text1, text2];
      let halfW = 0;
      let halfH = 0;
      for (const el of words) {
        halfW = Math.max(halfW, el.offsetWidth / 2);
        halfH = Math.max(halfH, el.offsetHeight / 2);
      }
      // The air the words keep around them, over and above their own box.
      const gutterX = 44;
      const gutterY = 34;

      for (const [id, config] of Object.entries(CARD_CONFIGS)) {
        let x = config.calcX1(hw);
        let y = config.calcY1(hh);

        const el = cardElementsRef.current.get(id);
        if (el) {
          const cw = (el.offsetWidth * cardScale) / 2;
          const ch = (el.offsetHeight * cardScale) / 2;

          const needX = halfW + gutterX + cw;
          const needY = halfH + gutterY + ch;

          if (Math.abs(x) < needX && Math.abs(y) < needY) {
            // How far each axis is from clear, and what the screen allows.
            const pushX = needX - Math.abs(x);
            const pushY = needY - Math.abs(y);
            const roomX = Math.max(0, hw - 6 - cw - Math.abs(x));
            const roomY = Math.max(0, hh - 6 - ch - Math.abs(y));

            const signX = x < 0 ? -1 : 1;
            const signY = y < 0 ? -1 : 1;

            if (pushX <= pushY && pushX <= roomX) {
              x += signX * pushX;
            } else if (pushY <= roomY) {
              y += signY * pushY;
            } else if (pushX <= roomX) {
              x += signX * pushX;
            } else {
              // Neither axis has the room on its own. Take what each has,
              // which at least gets the card off the middle of the words.
              x += signX * Math.min(pushX, roomX);
              y += signY * Math.min(pushY, roomY);
            }
          }
        }

        stops.set(id, { x, y });
      }
    };

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

      keepOffTheWords();

      if (variant === "flow") {
        travelPx = 480;
        // In flow the reservation needs travel plus exit fadeout distance
        container.style.height = `${travelPx + Math.round(window.innerHeight * 0.45)}px`;
      } else {
        const reserved = CANVAS_RESERVED;
        travelPx = clamp(
          600,
          Math.max(600, reserved - Math.round(exit * 0.4)),
          750,
        );
      }
    };

    const render = (progress: number, textT: number) => {
      // Phase 1 (0.0 -> 0.45): Scatter outward to the exact stop positions
      const outward = clamp(0, 1, progress / 0.45);
      const easeScatter = easeOutQuad(outward);

      // Phase 2 (0.45 -> 1.0): Gentle subtle breath (stay comfortably in place)
      let driftP = 0;
      if (progress > 0.45) {
        driftP = easeOutQuad(clamp(0, 1, (progress - 0.45) / 0.55));
      }

      for (const [id, config] of Object.entries(CARD_CONFIGS)) {
        const el = cardElementsRef.current.get(id);
        if (!el) continue;

        const stop = stops.get(id);
        const targetX = stop ? stop.x : config.calcX1(hw);
        const targetY = stop ? stop.y : config.calcY1(hh);

        const baseX = mix(config.x0, targetX, easeScatter);
        const baseY = mix(config.y0, targetY, easeScatter);
        const r = mix(config.r0, config.r1, easeScatter);

        // Keep cards stopped right here with barely perceptible 1.5% organic drift
        const x = baseX + targetX * 0.015 * driftP;
        const y = baseY + targetY * 0.015 * driftP;

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(1)}deg) scale(${cardScale.toFixed(3)})`;
      }

      // Center Text 1: "WHO ARE WE ?" — driven by `textT`, the clock, not by
      // `progress`. See TEXT_DURATION.
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

      if (textT >= text1FadeInStart && textT <= text1FadeOutEnd) {
        if (textT < text1FadeInEnd) {
          const t = (textT - text1FadeInStart) / (text1FadeInEnd - text1FadeInStart);
          op1 = easeOutQuad(t);
          scale1 = 0.94 + op1 * 0.06;
        } else if (textT <= text1FadeOutStart) {
          op1 = 1;
          scale1 = 1;
        } else {
          const t = (textT - text1FadeOutStart) / (text1FadeOutEnd - text1FadeOutStart);
          op1 = 1 - easeOutQuad(t);
          scale1 = 1 + t * 0.03;
        }
      }
      text1.style.opacity = op1.toFixed(3);
      text1.style.transform = `scale(${scale1.toFixed(3)})`;

      // Center Text 2: "WE ARE VINNOVATEIT" + Tagline
      let op2 = 0;
      let scale2 = 0.95;
      if (textT > text2FadeInStart) {
        const t = clamp(0, 1, (textT - text2FadeInStart) / (text2FadeInEnd - text2FadeInStart));
        op2 = easeOutQuad(t);
        scale2 = 0.95 + op2 * 0.05;
      }
      text2.style.opacity = op2.toFixed(3);
      text2.style.transform = `scale(${scale2.toFixed(3)})`;
    };

    let latestScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const onScroll = () => {
      latestScrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      update(0.016);
    };

    let currentP = 0;
    /* The headline clock, in seconds. It runs while the stage is parked — the
       one moment the section is the whole screen — and is wound back when the
       stage leaves, so returning to the section plays the reveal again rather
       than finding it already over. */
    let textSeconds = 0;
    let drawnT = Number.NaN;
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

      const currentScrollY =
        typeof window !== "undefined"
          ? (window.scrollY ?? document.documentElement.scrollTop ?? latestScrollY)
          : latestScrollY;
      const isReduced = calm.matches;

      // Full-Screen Pinned Stage Translation (Synchronous 1:1 scroll tracking with zero delay):
      let stageY = 0;
      if (currentScrollY < parkStart) {
        stageY = parkStart - currentScrollY;
      } else if (currentScrollY > parkStart + travelPx) {
        stageY = (parkStart + travelPx) - currentScrollY;
      } else {
        stageY = 0; // ZERO MOVEMENT - 100% COMPOSITOR PINNED!
      }

      // Exit & entry fade:
      // Fade out cleanly as the section scrolls out of view so it never obscures following sections (like Projects)
      const exitDist = Math.min(320, window.innerHeight * 0.4);
      let stageOpacity = 1;
      if (stageY < 0) {
        stageOpacity = clamp(0, 1, 1 - Math.abs(stageY) / exitDist);
      } else if (stageY > 0) {
        stageOpacity = clamp(0, 1, 1 - stageY / exitDist);
      }

      // Culled when completely outside viewport or faded out
      const culled =
        stageOpacity <= 0.01 ||
        stageY > window.innerHeight * 1.2 ||
        stageY < -window.innerHeight * 1.2;

      /* Wind the clock. Parked is the trigger — `stageY === 0` is exactly the
         span where the stage is pinned over the whole viewport — and leaving
         the section altogether resets it. Reduced motion gets the end state
         with no run at all. */
      if (culled) {
        textSeconds = 0;
      } else if (isReduced) {
        textSeconds = TEXT_DURATION;
      } else if (stageY === 0) {
        textSeconds = Math.min(TEXT_DURATION, textSeconds + dt);
      }
      const textT = TEXT_DURATION > 0 ? textSeconds / TEXT_DURATION : 1;

      if (culled) {
        if (portalEl.style.display !== "none") portalEl.style.display = "none";
      } else {
        if (portalEl.style.display !== "block") portalEl.style.display = "block";
        const transformStr = `translate3d(0, ${stageY.toFixed(1)}px, 0)`;
        if (portalEl.style.transform !== transformStr) {
          portalEl.style.transform = transformStr;
        }
        const opStr = stageOpacity.toFixed(3);
        if (portalEl.style.opacity !== opStr) {
          portalEl.style.opacity = opStr;
        }
      }

      // Progress computation (immediate 1:1 sync with scroll):
      const stuck = clamp(0, travelPx, currentScrollY - parkStart);
      const targetP = stuck / travelPx;
      currentP = targetP;
      initialized = true;

      /* The scatter has a floor, and the floor is the clock.
         `render` reads the first 45% of progress as the outward scatter, and
         progress is scroll — which is zero for the whole of the hold, and zero
         again the moment it is released, since the page is sitting exactly on
         `parkStart`. Left at that the cards would stay in their pile through
         the entire reveal and then collapse back into it, while the words
         changed over behind them.

         So the clock carries them out itself: by the time the headline has
         handed over, the scatter has reached the 45% that is its stopping
         position, and scroll only takes over once it has scrolled past that.
         Nothing is driven twice — whichever is further along wins. */
      const scatterFloor = 0.45 * clamp(0, 1, textT / 0.5);
      const scatterP = Math.max(currentP, scatterFloor);

      if (
        Number.isNaN(drawnP) ||
        Math.abs(scatterP - drawnP) > 0.0004 ||
        Number.isNaN(drawnT) ||
        Math.abs(textT - drawnT) > 0.0004
      ) {
        drawnP = scatterP;
        drawnT = textT;
        render(scatterP, textT);
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
      drawnT = Number.NaN;
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
              ? "520px"
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
                  <h2 className="font-rotonto text-[#bfea88] text-[clamp(30.6px,9.45vw,93.6px)] tracking-[0.06em] leading-none whitespace-nowrap drop-shadow-[0_0_45px_rgba(191,234,136,0.45)]">
                    {WHO_ARE_WE.title}
                  </h2>
                </div>

                {/* State 2: WE ARE VINNOVATEIT */}
                <div
                  ref={text2Ref}
                  className="absolute flex flex-col items-center justify-center text-center px-6 will-change-transform opacity-0"
                >
                  <span className="font-rotonto text-[#bfea88] text-[clamp(10.8px,2.7vw,19.8px)] tracking-[0.25em] mb-2 uppercase opacity-90">
                    {WHO_ARE_WE.reveal.eyebrow}
                  </span>
                  <h2 className="font-rotonto text-[#bfea88] text-[clamp(25.2px,7.74vw,93.6px)] tracking-[0.04em] leading-none uppercase drop-shadow-[0_0_50px_rgba(191,234,136,0.5)] whitespace-nowrap">
                    {WHO_ARE_WE.reveal.brand}
                  </h2>
                  <p className="font-rotonto text-[#fcfcfc] text-[clamp(9px,2.34vw,16.2px)] tracking-[0.24em] mt-4 uppercase opacity-95">
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
                  <p className="font-rotonto text-black/80 text-[10px] md:text-[11px] tracking-wider uppercase font-semibold">
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
                  <p className="font-rotonto text-black/80 text-[10px] md:text-[11px] tracking-wider uppercase font-semibold">
                    {redQuote.subline}
                  </p>
                </div>

                {/* 10. BOTTOM-RIGHT VIDEO 2 (Grey VIDEO Polaroid) */}
                <div
                  ref={(el) => registerCard("video-2", el)}
                  style={{ zIndex: CARD_CONFIGS["video-2"].z }}
                  className="absolute w-[240px] md:w-[265px] bg-[#ffffff] p-[12px] pb-[36px] shadow-[0_20px_40px_rgba(0,0,0,0.85)] will-change-transform"
                >
                  {/* The one moving thing in the collage, and it is still a
                      polaroid: same white border, same aspect, and the same
                      `grayscale contrast-115` the photographs carry, so it
                      reads as one of them rather than as an embed. Muted and
                      looping, so it plays on its own — a browser will not
                      autoplay anything with sound — and `playsInline` so a
                      phone runs it in the card instead of taking over the
                      screen. The grey plate stays underneath as the poster:
                      it is what shows while the file is still arriving, and
                      what is left if it cannot be played at all. */}
                  <div className="relative w-full aspect-[16/10] bg-[#b0b0b0] flex items-center justify-center overflow-hidden">
                    <span className="font-rotonto text-black text-[21px] md:text-[23px] font-bold tracking-widest uppercase">
                      VIDEO
                    </span>
                    <video
                      className="absolute inset-0 size-full object-cover grayscale contrast-115"
                      src={WHO_ARE_WE.video.src}
                      aria-label={WHO_ARE_WE.video.alt}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
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
