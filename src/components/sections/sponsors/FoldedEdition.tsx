"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import SponsorEdition from "./SponsorEdition";
import SealedCover from "./SealedCover";
import { SPONSOR_HEADING } from "./copy";
import { DESKTOP } from "@/components/motion/recipes";
import { paperUnfold } from "@/components/motion/paper";

/**
 * The sponsor sheet as a cover that opens, the way a book does.
 *
 * The reader arrives at a closed edition — a sealed one, see `SealedCover`.
 * Scroll on and the cover lifts on a spine down its left edge and swings away
 * from the page, and the sheet under it is uncovered by the cover's own edge
 * travelling across it, leaving THE HACKSTREET JOURNAL where it has always
 * been printed.
 *
 * It is pinned with 100% compositor stability via createPortal to document.body:
 * while inside the park, stageY is constant and the GPU compositor locks it
 * securely with zero compositor delay, zero vertical bobbing, and zero jitter.
 */

/** The sheet, at the size it was drawn. The cover is the same box: a book's
 *  cover is its page, not a band across the top of one. */
const SHEET_W = 1184;
const SHEET_H = 758.4;

/** The heading band above the paper: how tall it is, and the air between it
 *  and the sheet's top edge. Both in the sheet's own units, because the two are
 *  scaled to the window as one block — the heading has to shrink with the paper
 *  or it would end up larger than the masthead it is standing next to. */
const HEAD_H = 72;
const HEAD_GAP = 26;
/**
 * How far the two heading blocks are held in from the sheet's edges.
 */
const HEAD_INSET = 29.11;

/** The whole block — the heading, the gap, and the sheet. `Sponsors` reserves
 *  exactly this so the section's layout matches what is drawn in it. */
export const EDITION_BLOCK_HEIGHT = HEAD_H + HEAD_GAP + SHEET_H;

/** How much of the window's height the block is allowed at most. */
const VIEWPORT_FIT = 0.95;

/**
 * How far the cover swings, in degrees.
 * Deliberately short of 90 to keep backface visibility clean and avoid
 * sudden clipping.
 */
const SWING = 88;

const TRAVEL_PLATE = 700;

/* ------------------------------------------------------------------- maths */

function clamp(min: number, max: number, v: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Zero velocity at both ends, so no stage of the movement starts with a jolt. */
function smooth(t: number): number {
  const c = clamp(0, 1, t);
  return c * c * (3 - 2 * c);
}

/** `p` remapped onto [from, to] and eased. */
function stage(p: number, from: number, to: number): number {
  return smooth((p - from) / (to - from));
}

/**
 * Critically damped spring (SmoothDamp).
 * Provides continuous velocity and acceleration without overshoot or oscillation.
 * Frame-rate independent via deltaTime.
 */
function smoothDamp(
  current: number,
  target: number,
  velocityRef: { value: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number,
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

/* -------------------------------------------------------------- components */

/**
 * The cover, hinged on its left edge.
 */
function BookCover() {
  return (
    <div
      data-cover
      className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
      style={{
        transformOrigin: "left center",
        backfaceVisibility: "hidden",
      }}
    >
      <SealedCover />

      {/* The spine */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[34px] bg-[linear-gradient(90deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0)_100%)]"
      />

      {/* Shading */}
      <div
        data-cover-shade
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 100%)",
        }}
      />
    </div>
  );
}

const emptySubscribe = () => () => {};

export default function FoldedEdition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  /** Latches the rustle to one per opening, and re-arms if you scroll back up */
  const soundedRef = useRef(false);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const portalEl = portalRef.current;
    const fit = fitRef.current;
    const stageEl = stageRef.current;
    if (!container || !portalEl || !fit || !stageEl) return;

    const cover = stageEl.querySelector<HTMLElement>("[data-cover]");
    const shade = stageEl.querySelector<HTMLElement>("[data-cover-shade]");
    const dressing = Array.from(
      stageEl.querySelectorAll<HTMLElement>("[data-cover-dressing]")
    );
    const sheet = stageEl.querySelector<HTMLElement>("[data-sheet]");

    const desktop = window.matchMedia(DESKTOP);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let canvasScale = 1;
    let targetTop = 0;
    let parkStart = 0;
    let travelPx = TRAVEL_PLATE;
    let renderedHeight = EDITION_BLOCK_HEIGHT;
    let armed = false;
    let drawn = Number.NaN;

    const measure = () => {
      if (!desktop.matches) {
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

      canvasScale = rect.width / SHEET_W || 1;
      const baseScreenHeight = EDITION_BLOCK_HEIGHT * canvasScale;
      const fitScale =
        baseScreenHeight > 0
          ? Math.min(1, (window.innerHeight * VIEWPORT_FIT) / baseScreenHeight)
          : 1;

      fit.style.transform = fitScale < 1 ? `scale(${fitScale.toFixed(4)})` : "";
      fit.style.transformOrigin = "top center";

      renderedHeight = baseScreenHeight * fitScale;
      targetTop = Math.max(0, (window.innerHeight - renderedHeight) / 2);

      const containerTopDoc = window.scrollY + rect.top;
      parkStart = containerTopDoc - targetTop;
      travelPx = TRAVEL_PLATE * canvasScale;
    };

    const render = (p: number) => {
      const swing = stage(p, 0.05, 0.92);
      const angle = SWING * swing;

      if (cover) {
        cover.style.transform = `rotateY(${-angle.toFixed(2)}deg)`;
        cover.style.opacity = (
          1 - smooth(Math.max(0, (swing - 0.58) / 0.36))
        ).toFixed(3);
      }
      if (shade) {
        shade.style.opacity = swing.toFixed(3);
      }

      for (const bit of dressing) {
        bit.style.opacity = (
          1 - smooth(Math.max(0, (swing - 0.1) / 0.35))
        ).toFixed(3);
      }

      if (sheet) {
        const covered = Math.cos((90 * swing * Math.PI) / 180) * 100;
        sheet.style.clipPath = `inset(0% 0% 0% ${covered.toFixed(3)}%)`;
      }

      // One rustle, on the way in, as the cover actually gives.
      if (p > 0.18 && !soundedRef.current) {
        soundedRef.current = true;
        paperUnfold();
      } else if (p < 0.05) {
        soundedRef.current = false;
      }
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
        if (desktop.matches) {
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
        // Smooth input filtering (dt-independent critically damped spring):
        // Eliminates discrete mouse-wheel step jumps while maintaining instant responsiveness.
        smoothScrollY = smoothDamp(
          smoothScrollY,
          currentScrollY,
          scrollVel,
          0.08,
          Infinity,
          dt
        );
      }

      // Fixed Stage Y Translation:
      // While locked in park (parkStart <= smoothScrollY <= parkStart + travelPx):
      // stageY is EXACTLY targetTop. The stage is 100% stationary in the viewport, pinned
      // natively on the GPU compositor thread with ZERO bobbing and ZERO jitter!
      let stageY = targetTop;
      if (smoothScrollY < parkStart) {
        stageY = targetTop + (parkStart - smoothScrollY);
      } else if (smoothScrollY > parkStart + travelPx) {
        stageY = targetTop + (parkStart + travelPx - smoothScrollY);
      } else {
        stageY = targetTop; // ZERO MOVEMENT - 100% COMPOSITOR PINNED!
      }

      // Culled when completely outside viewport
      if (
        stageY > window.innerHeight * 1.5 ||
        stageY < -renderedHeight * 1.5
      ) {
        if (portalEl.style.display !== "none") portalEl.style.display = "none";
      } else {
        if (portalEl.style.display !== "block") portalEl.style.display = "block";
        const transformStr = `translate3d(-50%, ${stageY.toFixed(1)}px, 0) scale(${canvasScale.toFixed(4)})`;
        if (portalEl.style.transform !== transformStr) {
          portalEl.style.transform = transformStr;
        }
      }

      // Cover unfolding progress:
      const stuck = clamp(0, travelPx, smoothScrollY - parkStart);
      const targetP = stuck / travelPx;

      if (!initialized) {
        currentP = targetP;
        initialized = true;
      } else if (isReduced) {
        currentP = targetP;
        pVel.value = 0;
      } else {
        // Critically damped spring (SmoothDamp):
        // Eliminates discontinuous velocity jumps from notched mouse wheels.
        currentP = smoothDamp(currentP, targetP, pVel, 0.12, Infinity, dt);
        if (Math.abs(currentP - targetP) < 0.0001 && Math.abs(pVel.value) < 0.0001) {
          currentP = targetP;
          pVel.value = 0;
        }
      }

      // Enable pointer events on newspaper links once mostly open
      const canInteract =
        currentP > 0.85 && stageY > -100 && stageY < window.innerHeight;
      portalEl.style.pointerEvents = canInteract ? "auto" : "none";

      if (Number.isNaN(drawn) || Math.abs(currentP - drawn) > 0.0004) {
        drawn = currentP;
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
      drawn = Number.NaN;
      initialized = false;
      lastTime = performance.now();
      update(0.016);
    };

    onLayout();
    rafId = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onLayout);
    desktop.addEventListener("change", onLayout);
    calm.addEventListener("change", onLayout);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
      desktop.removeEventListener("change", onLayout);
      calm.removeEventListener("change", onLayout);
    };
  }, [mounted]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative pointer-events-none"
        style={{
          width: SHEET_W,
          height: EDITION_BLOCK_HEIGHT,
          overflowAnchor: "none",
        }}
        aria-hidden
      />

      {mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={portalRef}
              className="will-change-transform pointer-events-none"
              style={{
                position: "fixed",
                left: "50%",
                top: 0,
                width: SHEET_W,
                transformOrigin: "top center",
                zIndex: 30,
                overflowAnchor: "none",
                display: "none",
              }}
            >
              <div
                ref={fitRef}
                style={{ width: SHEET_W, transformOrigin: "top center" }}
              >
                {/* Heading band */}
                <div
                  className="flex items-start justify-between font-rotonto text-[#fa1a1d]"
                  style={{
                    height: HEAD_H,
                    marginBottom: HEAD_GAP,
                    paddingLeft: HEAD_INSET,
                    paddingRight: HEAD_INSET,
                  }}
                >
                  <p className="flex items-end gap-[14px] text-[25px] font-light leading-[1.16] tracking-wide">
                    <span>
                      {SPONSOR_HEADING.taglineLines[0]}
                      <br />
                      {SPONSOR_HEADING.taglineLines[1]}
                    </span>
                    <img
                      alt=""
                      aria-hidden
                      src="/figma/star2.svg"
                      className="mb-[6px] block h-[22px] w-[20px] shrink-0"
                    />
                  </p>
                  <p className="text-right text-[40px] font-normal leading-[0.88] tracking-tight">
                    {SPONSOR_HEADING.titleLines[0]}
                    <br />
                    {SPONSOR_HEADING.titleLines[1]}
                  </p>
                </div>

                {/* 3D Stage */}
                <div
                  ref={stageRef}
                  className="relative select-none"
                  style={{
                    width: SHEET_W,
                    height: SHEET_H,
                    perspective: 1900,
                    perspectiveOrigin: "22% 50%",
                  }}
                >
                  <div
                    data-sheet
                    className="absolute inset-0"
                    style={{ clipPath: "inset(0% 0% 0% 100%)" }}
                  >
                    <SponsorEdition />
                  </div>

                  <div
                    data-book
                    className="absolute inset-0"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      aria-hidden
                      data-cover-dressing
                      className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[-9px] rotate-[0.7deg] rounded-[2px] border border-black/10 bg-[#d0d0cb] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
                    />
                    <div
                      aria-hidden
                      data-cover-dressing
                      className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[9px] rotate-[-0.7deg] rounded-[2px] border border-black/10 bg-[#dedede] shadow-[0_14px_34px_rgba(0,0,0,0.26)]"
                    />
                    <div
                      aria-hidden
                      data-cover-dressing
                      className="pointer-events-none absolute inset-0 shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
                    />
                    <BookCover />
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
