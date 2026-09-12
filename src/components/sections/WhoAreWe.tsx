"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { WHO_ARE_WE } from "@/content/site";
import { DESKTOP } from "@/components/motion/recipes";

/**
 * The "WHO ARE WE" interactive collage section.
 *
 * Matching Figma node 1098:2843:
 * - Proportional card dimensions so all 10 cards fit within standard viewports.
 * - Initial state: Clustered center pile covering "WHO ARE WE ?".
 * - Phase 1 (0.0 -> 0.5): Cards scatter outward to frame the perimeter of the screen,
 *   revealing "WHO ARE WE ?" in the center.
 * - Phase 2 (0.5 -> 1.0): "WHO ARE WE ?" crossfades into "WE ARE VINNOVATEIT".
 * - Silky smooth, jitter-free counter-translation reading window.scrollY directly
 *   on every V-Sync requestAnimationFrame tick.
 */

const PLATE_WIDTH = 1280;
const STAGE_HEIGHT = 832;
const SCROLL_TRAVEL = 1568;

interface CardPose {
  x0: number; // initial cluster x from center
  y0: number; // initial cluster y from center
  r0: number; // initial cluster rotation deg
  x1: number; // scattered x from center
  y1: number; // scattered y from center
  r1: number; // scattered rotation deg
  z: number;  // z-index in pile
}

// Calibrated so all 10 cards stay visible within standard laptop/desktop viewports
const CARD_POSES: Record<string, CardPose> = {
  // 1. Top-Left Polaroid (Classroom)
  "photo-1": {
    x0: -260,
    y0: -115,
    r0: -3,
    x1: -450,
    y1: -230,
    r1: -6,
    z: 10,
  },
  // 2. Green Note Card ("BUILDING PROJECTS FOR A CAUSE")
  "quote-green": {
    x0: -40,
    y0: -135,
    r0: 12,
    x1: 70,
    y1: -240,
    r1: -6,
    z: 8,
  },
  // 3. Top-Right Polaroid (Group selfie)
  "photo-3": {
    x0: 270,
    y0: -100,
    r0: 13,
    x1: 370,
    y1: -250,
    r1: 8,
    z: 9,
  },
  // 4. Pink Note Card ("WE ASK \"WHY NOT?\"")
  "quote-pink": {
    x0: 130,
    y0: -95,
    r0: 14,
    x1: 440,
    y1: -80,
    r1: 12,
    z: 14,
  },
  // 5. Video 1 (Grey rectangle)
  "video-1": {
    x0: -170,
    y0: -20,
    r0: -13,
    x1: -440,
    y1: -50,
    r1: -8,
    z: 20,
  },
  // 6. Bottom-Left Polaroid (Banner)
  "photo-4": {
    x0: -250,
    y0: 110,
    r0: 38,
    x1: -430,
    y1: 210,
    r1: 30,
    z: 12,
  },
  // 7. Blue Note Card ("CURIOUS BY NATURE. CREATIVE BY CHOICE.")
  "quote-blue": {
    x0: -110,
    y0: 105,
    r0: -19,
    x1: -190,
    y1: 240,
    r1: -18,
    z: 22,
  },
  // 8. Video 2 (Grey rectangle)
  "video-2": {
    x0: 230,
    y0: 40,
    r0: -23,
    x1: 430,
    y1: 190,
    r1: -20,
    z: 16,
  },
  // 9. Red Note Card ("DIFFERENT MINDS. SAME CHAOS.")
  "quote-red": {
    x0: 100,
    y0: 160,
    r0: 11,
    x1: 160,
    y1: 240,
    r1: 10,
    z: 25,
  },
  // 10. Center Hero Polaroid (Outdoor selfie with team)
  "photo-2": {
    x0: 5,
    y0: -5,
    r0: -13,
    x1: -150,
    y1: -250,
    r1: 14,
    z: 35,
  },
};

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export default function WhoAreWeSection() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    if (!container || !stage || !text1 || !text2) return;

    const desktop = window.matchMedia(DESKTOP);
    let armed = false;
    let canvasScale = 1;
    let parkStart = 0;
    let travelPx = SCROLL_TRAVEL;

    const park = (plateY: number) => {
      stage.style.transform = `translate3d(0, ${plateY.toFixed(2)}px, 0)`;
    };

    const measure = () => {
      park(0);
      const rect = container.getBoundingClientRect();
      if (!desktop.matches || rect.width === 0) {
        armed = false;
        return;
      }
      armed = true;
      canvasScale = rect.width / PLATE_WIDTH || 1;

      // Vertically center the stage in the viewport when parked
      const vh = window.innerHeight;
      const stageScreenHeight = STAGE_HEIGHT * canvasScale;
      const centerOffset = Math.max(0, (vh - stageScreenHeight) / 2);

      parkStart = window.scrollY + rect.top - centerOffset;
      travelPx = Math.max(800, SCROLL_TRAVEL * canvasScale);
    };

    const render = (progress: number) => {
      // Phase 1: Cards Scatter (progress 0.0 -> 0.5)
      const scatterT = clamp(0, 1, progress / 0.5);
      const scatterE = easeOutCubic(scatterT);

      // Phase 2: Gentle parallax outward drift (progress 0.5 -> 1.0)
      const driftT = progress > 0.5 ? (progress - 0.5) / 0.5 : 0;
      const driftFactor = driftT * 0.05;

      for (const [id, el] of cardElementsRef.current.entries()) {
        const pose = CARD_POSES[id];
        if (!pose) continue;

        const curX =
          pose.x0 +
          (pose.x1 - pose.x0) * scatterE +
          pose.x1 * driftFactor;
        const curY =
          pose.y0 +
          (pose.y1 - pose.y0) * scatterE +
          pose.y1 * driftFactor;
        const curR = pose.r0 + (pose.r1 - pose.r0) * scatterE;

        el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(
          2
        )}px, 0) rotate(${curR.toFixed(2)}deg)`;
      }

      // Center Text 1: "WHO ARE WE ?"
      // Starts at 0.85 opacity under the initial pile, reaches 1.0 as cards fly out
      // Fades out between 0.50 -> 0.72
      let op1 = 0.85;
      let scale1 = 1;
      if (progress <= 0.4) {
        op1 = 0.85 + (progress / 0.4) * 0.15;
      } else if (progress <= 0.5) {
        op1 = 1.0;
      } else if (progress <= 0.72) {
        const fadeOut = (progress - 0.5) / 0.22;
        op1 = 1.0 - fadeOut;
        scale1 = 1.0 + fadeOut * 0.05;
      } else {
        op1 = 0;
      }
      text1.style.opacity = op1.toFixed(3);
      text1.style.transform = `scale(${scale1.toFixed(3)})`;
      text1.style.pointerEvents = op1 > 0.5 ? "auto" : "none";

      // Center Text 2: "WE ARE VINNOVATEIT" + Tagline
      // Fades in between progress 0.58 -> 0.88 with smooth settle
      let op2 = 0;
      let scale2 = 0.95;
      if (progress > 0.58) {
        const fadeIn = clamp(0, 1, (progress - 0.58) / 0.3);
        const ease2 = easeOutQuad(fadeIn);
        op2 = ease2;
        scale2 = 0.95 + ease2 * 0.05;
      }
      text2.style.opacity = op2.toFixed(3);
      text2.style.transform = `scale(${scale2.toFixed(3)})`;
      text2.style.pointerEvents = op2 > 0.5 ? "auto" : "none";
    };

    let animId: number;
    let drawnProgress = -1;
    let drawnStuck = -1;

    // The rAF tick reads window.scrollY DIRECTLY on every frame.
    // This avoids the browser's throttled 'scroll' event lag that causes vibration.
    const tick = () => {
      if (armed) {
        const currentY = window.scrollY;
        const stuck = clamp(0, travelPx, currentY - parkStart);

        const plateY = stuck / canvasScale;
        if (Math.abs(plateY - drawnStuck) > 0.05) {
          drawnStuck = plateY;
          park(plateY);
        }

        const progress = stuck / travelPx;
        if (Math.abs(progress - drawnProgress) > 0.0008) {
          drawnProgress = progress;
          render(progress);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    measure();
    render(0);
    window.addEventListener("resize", measure);
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const registerCard = (id: string, el: HTMLDivElement | null) => {
    if (el) cardElementsRef.current.set(id, el);
    else cardElementsRef.current.delete(id);
  };

  const greenQuote = WHO_ARE_WE.quotes[0];
  const pinkQuote = WHO_ARE_WE.quotes[1];
  const blueQuote = WHO_ARE_WE.quotes[2];
  const redQuote = WHO_ARE_WE.quotes[3];

  return (
    <section
      ref={containerRef}
      aria-label="Who Are We"
      className="-translate-x-1/2 absolute bg-black left-1/2 overflow-visible top-[1392px] w-[1280px]"
      style={{ height: `${STAGE_HEIGHT + SCROLL_TRAVEL}px` }}
      data-name="WHO ARE WE"
    >
      {/* Pinned Stage Container */}
      <div
        ref={stageRef}
        className="absolute left-0 top-0 w-[1280px] h-[832px] overflow-hidden select-none"
        style={{ willChange: "transform" }}
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
            className="absolute transition-transform duration-75 text-center px-4 will-change-transform"
          >
            <h2 className="font-rotonto text-[#bfea88] text-[80px] lg:text-[88px] tracking-[0.06em] leading-none whitespace-nowrap drop-shadow-[0_0_35px_rgba(191,234,136,0.35)]">
              {WHO_ARE_WE.title}
            </h2>
          </div>

          {/* State 2: WE ARE VINNOVATEIT */}
          <div
            ref={text2Ref}
            className="absolute flex flex-col items-center justify-center text-center px-6 will-change-transform opacity-0"
          >
            <span className="font-rotonto text-[#bfea88] text-[20px] tracking-[0.25em] mb-2 uppercase opacity-90">
              {WHO_ARE_WE.reveal.eyebrow}
            </span>
            <h2 className="font-rotonto text-[#bfea88] text-[80px] lg:text-[88px] tracking-[0.03em] leading-none uppercase drop-shadow-[0_0_40px_rgba(191,234,136,0.4)]">
              {WHO_ARE_WE.reveal.brand}
            </h2>
            <p className="font-sans font-semibold text-[#fcfcfc] text-[17px] tracking-[0.22em] mt-4 uppercase opacity-95">
              {WHO_ARE_WE.reveal.tagline}
            </p>
          </div>
        </div>

        {/* ----------------- FLOATING CARDS COLLAGE ----------------- */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* 1. TOP-LEFT POLAROID (Classroom) */}
          <div
            ref={(el) => registerCard("photo-1", el)}
            style={{ zIndex: CARD_POSES["photo-1"].z }}
            className="absolute w-[180px] bg-[#ffffff] p-[10px] pb-[30px] shadow-[0_16px_32px_rgba(0,0,0,0.7)]"
          >
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
              <Image
                src={WHO_ARE_WE.polaroids[0].src}
                alt={WHO_ARE_WE.polaroids[0].alt}
                fill
                sizes="180px"
                className="object-cover grayscale contrast-120"
              />
            </div>
          </div>

          {/* 2. GREEN QUOTE CARD ("BUILDING PROJECTS FOR A CAUSE") */}
          <div
            ref={(el) => registerCard("quote-green", el)}
            style={{
              zIndex: CARD_POSES["quote-green"].z,
              backgroundColor: greenQuote.color,
            }}
            className="absolute w-[215px] h-[195px] p-5 shadow-[0_16px_32px_rgba(0,0,0,0.65)] flex flex-col justify-between"
          >
            <p className="font-rotonto text-black text-[22px] leading-[1.08] font-bold uppercase whitespace-pre-line">
              {greenQuote.headline}
            </p>
            <p className="font-sans text-black/75 text-[8.5px] font-bold tracking-[0.14em] uppercase">
              {greenQuote.subline}
            </p>
          </div>

          {/* 3. TOP-RIGHT POLAROID (Group Selfie) */}
          <div
            ref={(el) => registerCard("photo-3", el)}
            style={{ zIndex: CARD_POSES["photo-3"].z }}
            className="absolute w-[170px] bg-[#ffffff] p-[10px] pb-[30px] shadow-[0_16px_32px_rgba(0,0,0,0.7)]"
          >
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
              <Image
                src={WHO_ARE_WE.polaroids[2].src}
                alt={WHO_ARE_WE.polaroids[2].alt}
                fill
                sizes="170px"
                className="object-cover grayscale contrast-120"
              />
            </div>
          </div>

          {/* 4. PINK QUOTE CARD ("WE ASK \"WHY NOT?\"") */}
          <div
            ref={(el) => registerCard("quote-pink", el)}
            style={{
              zIndex: CARD_POSES["quote-pink"].z,
              backgroundColor: pinkQuote.color,
            }}
            className="absolute w-[190px] h-[175px] p-5 shadow-[0_16px_32px_rgba(0,0,0,0.65)] flex flex-col justify-start"
          >
            <p className="font-rotonto text-black text-[23px] leading-[1.1] font-bold uppercase whitespace-pre-line">
              {pinkQuote.headline}
            </p>
          </div>

          {/* 5. VIDEO 1 (Grey Rectangle) */}
          <div
            ref={(el) => registerCard("video-1", el)}
            style={{ zIndex: CARD_POSES["video-1"].z }}
            className="absolute w-[220px] h-[145px] bg-[#b0b0b0] shadow-[0_18px_36px_rgba(0,0,0,0.75)] flex items-center justify-center"
          >
            <span className="font-rotonto text-black text-[19px] font-bold tracking-widest uppercase">
              {WHO_ARE_WE.videos[0].label}
            </span>
          </div>

          {/* 6. BOTTOM-LEFT POLAROID (Banner) */}
          <div
            ref={(el) => registerCard("photo-4", el)}
            style={{ zIndex: CARD_POSES["photo-4"].z }}
            className="absolute w-[170px] bg-[#ffffff] p-[10px] pb-[30px] shadow-[0_16px_32px_rgba(0,0,0,0.7)]"
          >
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
              <Image
                src={WHO_ARE_WE.polaroids[3].src}
                alt={WHO_ARE_WE.polaroids[3].alt}
                fill
                sizes="170px"
                className="object-cover grayscale contrast-120"
              />
            </div>
          </div>

          {/* 7. BLUE QUOTE CARD ("CURIOUS BY NATURE. CREATIVE BY CHOICE.") */}
          <div
            ref={(el) => registerCard("quote-blue", el)}
            style={{
              zIndex: CARD_POSES["quote-blue"].z,
              backgroundColor: blueQuote.color,
            }}
            className="absolute w-[220px] h-[215px] p-5 shadow-[0_16px_32px_rgba(0,0,0,0.65)] flex flex-col justify-between"
          >
            <p className="font-rotonto text-black text-[20px] leading-[1.08] font-bold uppercase whitespace-pre-line">
              {blueQuote.headline}
            </p>
            <p className="font-mono text-black/75 text-[8px] tracking-wider uppercase font-semibold">
              {blueQuote.subline}
            </p>
          </div>

          {/* 8. VIDEO 2 (Grey Rectangle) */}
          <div
            ref={(el) => registerCard("video-2", el)}
            style={{ zIndex: CARD_POSES["video-2"].z }}
            className="absolute w-[220px] h-[145px] bg-[#b0b0b0] shadow-[0_18px_36px_rgba(0,0,0,0.75)] flex items-center justify-center"
          >
            <span className="font-rotonto text-black text-[19px] font-bold tracking-widest uppercase">
              {WHO_ARE_WE.videos[1].label}
            </span>
          </div>

          {/* 9. RED QUOTE CARD ("DIFFERENT MINDS. SAME CHAOS.") */}
          <div
            ref={(el) => registerCard("quote-red", el)}
            style={{
              zIndex: CARD_POSES["quote-red"].z,
              backgroundColor: redQuote.color,
            }}
            className="absolute w-[205px] h-[200px] p-5 shadow-[0_16px_32px_rgba(0,0,0,0.65)] flex flex-col justify-between"
          >
            <p className="font-rotonto text-black text-[21px] leading-[1.08] font-bold uppercase whitespace-pre-line">
              {redQuote.headline}
            </p>
            <p className="font-mono text-black/75 text-[8px] tracking-wider uppercase font-semibold">
              {redQuote.subline}
            </p>
          </div>

          {/* 10. CENTER HERO POLAROID (Outdoor selfie with team) */}
          <div
            ref={(el) => registerCard("photo-2", el)}
            style={{ zIndex: CARD_POSES["photo-2"].z }}
            className="absolute w-[215px] bg-[#ffffff] p-[11px] pb-[38px] shadow-[0_24px_48px_rgba(0,0,0,0.85)]"
          >
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
              <Image
                src={WHO_ARE_WE.polaroids[1].src}
                alt={WHO_ARE_WE.polaroids[1].alt}
                fill
                sizes="215px"
                className="object-cover grayscale contrast-115"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
