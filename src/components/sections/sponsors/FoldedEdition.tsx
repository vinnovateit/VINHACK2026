"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import NewspaperBackCover from "./NewspaperBackCover";
import SponsorEdition from "./SponsorEdition";
import SealedCover from "./SealedCover";
import SponsorSideProps from "./SponsorSideProps";
import { SPONSOR_HEADING } from "./copy";
import { DESKTOP, MOBILE } from "@/components/motion/recipes";
import { paperUnfold } from "@/components/motion/paper";
import { clamp, smooth, stage, smoothDamp } from "@/lib/math";

/**
 * The sponsor sheet as a broadsheet edition that opens naturally in physical 3D.
 *
 * When closed, the reader sees the front page cover (`SealedCover`).
 * Scrolling smoothly lifts, arches, and turns the paper leaf across to the left,
 * revealing the authentic reverse editorial page (`NewspaperBackCover`) in full 3D,
 * casting a moving soft shadow across the inner broadsheet (`SponsorEdition`).
 */

const SHEET_W = 1184;
const SHEET_H = 860;

const HEAD_H = 72;
const HEAD_GAP = 24;
const HEAD_INSET = 29.11;

export const EDITION_BLOCK_HEIGHT = HEAD_H + HEAD_GAP + SHEET_H;

const VIEWPORT_FIT = 0.95;
const TRAVEL_PLATE = 500;

/* -------------------------------------------------------------- components */

/**
 * The 3D double-sided newspaper cover.
 * Front: SealedCover (VinHack logo + OUR SPONSORS).
 * Back: NewspaperBackCover (Page 2 editorial).
 */
function BookCover() {
  const segW = SHEET_W / 3; // ~394.67px
  const overlap = 0.5;

  return (
    <div
      data-cover
      className="absolute inset-0 select-none will-change-transform"
      style={{
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Segment 0: Spine Leaf (x: 0 to 33.3%, permanently pinned to spine) */}
      <div
        data-segment-spine
        className="absolute inset-y-0 left-0"
        style={{
          width: `${segW + overlap}px`,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Spine Front Face */}
        <div
          className="absolute inset-0 overflow-hidden bg-[#ebebe9] shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <div className="absolute top-0 left-0" style={{ width: `${SHEET_W}px`, height: `${SHEET_H}px` }}>
            <SealedCover />
          </div>

          {/* Spine Crease */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[36px] bg-[linear-gradient(90deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0)_100%)]"
          />

          {/* Dynamic Light Sheen on Front Convex Curve */}
          <div
            data-front-sheen
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(0,0,0,0.25) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Spine Back Face (Plain clean newsprint paper) */}
        <div
          className="absolute inset-0 overflow-hidden bg-[#ebebe9] shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute top-0" style={{ width: `${SHEET_W}px`, height: `${SHEET_H}px`, right: 0 }}>
            <NewspaperBackCover />
          </div>

          {/* Dynamic Light Sheen on Back Convex Curve */}
          <div
            data-back-sheen
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                "linear-gradient(255deg, transparent 20%, rgba(255,255,255,0.3) 45%, rgba(0,0,0,0.3) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Segment 1: Mid Leaf (x: 33.3% to 66.7%, hinged to Segment 0) */}
        <div
          data-segment-mid
          className="absolute inset-y-0 will-change-transform"
          style={{
            left: `${segW - overlap}px`,
            width: `${segW + overlap}px`,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Mid Front Face */}
          <div
            className="absolute inset-0 overflow-hidden bg-[#ebebe9] shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
          >
            <div className="absolute top-0" style={{ width: `${SHEET_W}px`, height: `${SHEET_H}px`, left: `-${segW}px` }}>
              <SealedCover />
            </div>

            {/* Dynamic Wave Shadow on Mid Leaf */}
            <div
              data-wave-shadow-1
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)",
              }}
            />
          </div>

          {/* Mid Back Face */}
          <div
            className="absolute inset-0 overflow-hidden bg-[#ebebe9] shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="absolute top-0" style={{ width: `${SHEET_W}px`, height: `${SHEET_H}px`, right: `-${segW}px` }}>
              <NewspaperBackCover />
            </div>

            {/* Dynamic Wave Back Shadow on Mid Leaf */}
            <div
              data-wave-back-shadow-1
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  "linear-gradient(270deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)",
              }}
            />
          </div>

          {/* Segment 2: Outer Leaf (x: 66.7% to 100%, hinged to Segment 1) */}
          <div
            data-segment-outer
            className="absolute inset-y-0 will-change-transform"
            style={{
              left: `${segW - overlap}px`,
              width: `${SHEET_W - segW * 2 + overlap}px`,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Outer Front Face */}
            <div
              className="absolute inset-0 overflow-hidden bg-[#ebebe9] shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="absolute top-0" style={{ width: `${SHEET_W}px`, height: `${SHEET_H}px`, left: `-${segW * 2}px` }}>
                <SealedCover />
              </div>

              {/* Dynamic Wave Shadow on Outer Leaf */}
              <div
                data-wave-shadow-2
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
                }}
              />
            </div>

            {/* Outer Back Face */}
            <div
              className="absolute inset-0 overflow-hidden bg-[#ebebe9] shadow-[0_20px_48px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="absolute top-0" style={{ width: `${SHEET_W}px`, height: `${SHEET_H}px`, right: `-${segW * 2}px` }}>
                <NewspaperBackCover />
              </div>

              {/* Dynamic Wave Back Shadow on Outer Leaf */}
              <div
                data-wave-back-shadow-2
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0"
                style={{
                  background:
                    "linear-gradient(270deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptySubscribe = () => () => {};

export default function FoldedEdition({
  variant = "canvas",
}: {
  variant?: "canvas" | "flow";
} = {}) {
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
    const midLeaf = stageEl.querySelector<HTMLElement>("[data-segment-mid]");
    const outerLeaf = stageEl.querySelector<HTMLElement>("[data-segment-outer]");
    const waveShadow1 = stageEl.querySelector<HTMLElement>("[data-wave-shadow-1]");
    const waveShadow2 = stageEl.querySelector<HTMLElement>("[data-wave-shadow-2]");
    const waveBackShadow1 = stageEl.querySelector<HTMLElement>("[data-wave-back-shadow-1]");
    const waveBackShadow2 = stageEl.querySelector<HTMLElement>("[data-wave-back-shadow-2]");
    const frontSheen = stageEl.querySelector<HTMLElement>("[data-front-sheen]");
    const backSheen = stageEl.querySelector<HTMLElement>("[data-back-sheen]");
    const castShadow = stageEl.querySelector<HTMLElement>("[data-cast-shadow]");
    const dressing = Array.from(
      stageEl.querySelectorAll<HTMLElement>("[data-cover-dressing]")
    );
    const propsWrap = stageEl.querySelector<HTMLElement>("[data-props-wrap]");
    const leftProps = Array.from(
      stageEl.querySelectorAll<HTMLElement>("[data-prop-left]")
    );
    const rightProps = Array.from(
      stageEl.querySelectorAll<HTMLElement>("[data-prop-right]")
    );

    const inRange = window.matchMedia(variant === "flow" ? MOBILE : DESKTOP);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let canvasScale = 1;
    let targetTop = 0;
    let parkStart = 0;
    let travelPx = TRAVEL_PLATE;
    let renderedHeight = EDITION_BLOCK_HEIGHT;
    let armed = false;
    let drawn = Number.NaN;
    type PropItem = {
      el: HTMLElement;
      isLeft: boolean;
      deltaX: number;
      deltaY: number;
      baseRot: number;
      spin: number;
      stagger: number;
      jumpHeight: number;
    };

    const LEFT_PROP_DEFAULTS = [
      { deltaX: 705, deltaY: 160 },
      { deltaX: 689, deltaY: 13 },
      { deltaX: 702, deltaY: -135 },
      { deltaX: 701, deltaY: -305 },
    ];

    const RIGHT_PROP_DEFAULTS = [
      { deltaX: -692, deltaY: 224 },
      { deltaX: -705, deltaY: 98 },
      { deltaX: -717, deltaY: -95 },
      { deltaX: -683, deltaY: -320 },
    ];

    let propItems: PropItem[] = [];

    const measureProps = () => {
      const centerX = SHEET_W / 2; // 592
      const centerY = SHEET_H / 2; // 379.2

      const allProps = [
        ...leftProps.map((el, i) => ({ el, isLeft: true, idx: i })),
        ...rightProps.map((el, i) => ({ el, isLeft: false, idx: i })),
      ];

      propItems = allProps.map(({ el, isLeft, idx }) => {
        const defaults = isLeft
          ? LEFT_PROP_DEFAULTS[idx] || { deltaX: 700, deltaY: 0 }
          : RIGHT_PROP_DEFAULTS[idx] || { deltaX: -700, deltaY: 0 };
        const w = el.offsetWidth;
        const h = el.offsetHeight;

        let deltaX = defaults.deltaX;
        let deltaY = defaults.deltaY;

        if (w > 0 && h > 0) {
          const targetCenterX = el.offsetLeft + w / 2;
          const targetCenterY = el.offsetTop + h / 2;
          deltaX = centerX - targetCenterX;
          deltaY = centerY - targetCenterY;
        }

        const baseRot = parseFloat(el.dataset.rotate || "0");
        const spin = isLeft ? -16 - idx * 3 : 16 + idx * 3;
        const stagger = idx * 0.035;
        const jumpHeight = 52 + idx * 9;

        return {
          el,
          isLeft,
          deltaX,
          deltaY,
          baseRot,
          spin,
          stagger,
          jumpHeight,
        };
      });
    };

    const measure = () => {
      if (!inRange.matches) {
        armed = false;
        portalEl.style.display = "none";
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 && variant !== "flow") {
        armed = false;
        return;
      }
      armed = true;

      const availW = Math.max(300, window.innerWidth - (variant === "flow" ? 16 : 24));
      // For the mobile flow variant, scale against a narrower reference (55% of full sheet)
      // so the newspaper fills the phone screen at a legible size (~0.57x on 390px phones).
      // The portal is fixed+centered, so viewport naturally clips outer edges; the centred
      // masthead and title partner remain fully visible.
      const flowRef = variant === "flow" ? SHEET_W * 0.55 : SHEET_W;
      const targetW = variant === "flow" ? availW : Math.min(availW, SHEET_W);
      canvasScale = clamp(0.26, 1.0, targetW / flowRef);

      if (variant === "flow") {
        travelPx = 520;
        container.style.height = `${travelPx + Math.round(EDITION_BLOCK_HEIGHT * canvasScale) + 80}px`;
      } else {
        travelPx = Math.round(TRAVEL_PLATE * Math.max(0.7, canvasScale));
        container.style.height = `${EDITION_BLOCK_HEIGHT}px`;
      }

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

      measureProps();
    };

    const render = (p: number) => {
      const s = stage(p, 0.0, 0.96);
      const easeT = smooth(s);

      // Natural 3D book page flip wave physics:
      // Page opens smoothly from 0 to 180 degrees (resting flat on the left)
      const angle = easeT * 180;

      // S-curve wave traveling across the flipping page:
      // Base wave arches the page forward into the flip
      const baseWave = -Math.sin(s * Math.PI);
      // Secondary harmonic ripple creates dynamic S-curve flexion
      const ripple = Math.sin(s * Math.PI * 2);

      const curl1 = baseWave * 32 + ripple * 12;
      const curl2 = baseWave * 28 - ripple * 18;

      if (cover) {
        // Pure Y-axis rotation pinned permanently at spine (x=0, y=0, z=0) — NEVER detaches from 2nd page!
        cover.style.transform = `rotateY(${-angle.toFixed(2)}deg)`;
        cover.style.opacity = "1";
      }

      if (midLeaf) {
        midLeaf.style.transform = `rotateY(${curl1.toFixed(2)}deg)`;
      }

      if (outerLeaf) {
        outerLeaf.style.transform = `rotateY(${curl2.toFixed(2)}deg)`;
      }

      const waveIntensity = Math.sin(s * Math.PI);
      if (waveShadow1) waveShadow1.style.opacity = (waveIntensity * 0.35).toFixed(3);
      if (waveShadow2) waveShadow2.style.opacity = (waveIntensity * 0.45).toFixed(3);
      if (waveBackShadow1) waveBackShadow1.style.opacity = (waveIntensity * 0.35).toFixed(3);
      if (waveBackShadow2) waveBackShadow2.style.opacity = (waveIntensity * 0.45).toFixed(3);

      if (frontSheen) {
        frontSheen.style.opacity = (Math.sin(Math.min(1, s * 2) * Math.PI) * 0.4).toFixed(3);
      }
      if (backSheen) {
        backSheen.style.opacity = (s > 0.4 ? Math.sin(((s - 0.4) / 0.6) * Math.PI) * 0.4 : 0).toFixed(3);
      }

      if (castShadow) {
        const shadowOp = s < 0.85 ? Math.sin(Math.min(1, s * 1.4) * Math.PI) * 0.45 : 0;
        const shadowX = ((1 - Math.min(1, s * 1.25)) * 60).toFixed(1);
        castShadow.style.opacity = shadowOp.toFixed(3);
        castShadow.style.transform = `translateX(${shadowX}%)`;
      }

      for (const bit of dressing) {
        bit.style.opacity = (
          1 - smooth(Math.max(0, (s - 0.12) / 0.38))
        ).toFixed(3);
      }

      // Dynamic emergence: Props float out from INSIDE the newspaper as the page opens
      if (propsWrap) {
        propsWrap.style.zIndex = s < 0.35 ? "15" : "25";
      }

      if (propItems.length === 0 && (leftProps.length > 0 || rightProps.length > 0)) {
        measureProps();
      }

      for (const item of propItems) {
        const baseStart = item.isLeft ? 0.40 : 0.22;
        const baseEnd = item.isLeft ? 0.82 : 0.64;
        const startSwing = baseStart + item.stagger;
        const endSwing = baseEnd + item.stagger;
        const rawT = stage(s, startSwing, endSwing);

        if (rawT <= 0) {
          item.el.style.transform = `translate3d(${item.deltaX.toFixed(1)}px, ${item.deltaY.toFixed(1)}px, 0) scale(0.08) rotate(${item.baseRot}deg)`;
          item.el.style.opacity = "0";
          item.el.style.visibility = "hidden";
          continue;
        }

        item.el.style.visibility = "visible";

        // Overshoot spring-settle (back ease-out)
        const t1 = rawT - 1;
        const c = 1.25;
        const moveProgress = 1 + (c + 1) * t1 * t1 * t1 + c * t1 * t1;

        // Parabolic vertical jump arc
        const arc = Math.sin(rawT * Math.PI);
        const currentJumpLift = arc * item.jumpHeight;

        // Scale: pops from 0.08 up to 1.12 at mid-air, then settles to 1.0
        const scale = (0.08 + 0.92 * Math.sqrt(rawT) + 0.12 * arc).toFixed(3);

        // Opacity: rapid burst fade-in
        const opacity = smooth(Math.min(1, rawT * 2.8)).toFixed(3);

        const curX = ((1 - moveProgress) * item.deltaX).toFixed(1);
        const curY = ((1 - moveProgress) * item.deltaY - currentJumpLift).toFixed(1);
        const curRot = (item.baseRot + (1 - rawT) * item.spin).toFixed(2);

        item.el.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${scale}) rotate(${curRot}deg)`;
        item.el.style.opacity = opacity;
      }

      // One rustle, on the way in, as the cover gives
      if (p > 0.08 && !soundedRef.current) {
        soundedRef.current = true;
        paperUnfold();
      } else if (p < 0.04) {
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
        // Fast, natural input filtering without lag
        smoothScrollY = smoothDamp(
          smoothScrollY,
          currentScrollY,
          scrollVel,
          0.04,
          Infinity,
          dt
        );
      }

      // Fixed Stage Y Translation:
      let stageY = targetTop;
      if (smoothScrollY < parkStart) {
        stageY = targetTop + (parkStart - smoothScrollY);
      } else if (smoothScrollY > parkStart + travelPx) {
        stageY = targetTop + (parkStart + travelPx - smoothScrollY);
      } else {
        stageY = targetTop;
      }

      // Cover unfolding progress:
      const stuck = clamp(0, travelPx, smoothScrollY - parkStart);
      const targetP = stuck / travelPx;
      currentP = targetP;

      // No fade in / fade out: Section remains completely solid throughout scrolling
      // Only culled when completely off the screen bounds
      const culled =
        stageY > window.innerHeight * 1.08 ||
        stageY < -renderedHeight * 1.08;

      if (culled) {
        if (portalEl.style.display !== "none") portalEl.style.display = "none";
      } else {
        if (portalEl.style.display !== "block") portalEl.style.display = "block";
        const transformStr = `translate3d(-50%, ${stageY.toFixed(1)}px, 0) scale(${canvasScale.toFixed(4)})`;
        if (portalEl.style.transform !== transformStr) {
          portalEl.style.transform = transformStr;
        }
        if (portalEl.style.opacity !== "1") {
          portalEl.style.opacity = "1";
        }
      }

      // Enable pointer events on newspaper links once mostly open
      const canInteract =
        currentP > 0.82 && stageY > -100 && stageY < window.innerHeight;
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
    inRange.addEventListener("change", onLayout);
    calm.addEventListener("change", onLayout);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
      inRange.removeEventListener("change", onLayout);
      calm.removeEventListener("change", onLayout);
      if (portalEl) portalEl.style.display = "none";
    };
  }, [mounted, variant]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative pointer-events-none"
        style={{
          width: variant === "flow" ? "100%" : SHEET_W,
          height: variant === "flow" ? 520 + 600 : EDITION_BLOCK_HEIGHT,
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
                  <p className="flex items-end gap-[14px] text-[25px] font-medium leading-[1.16] tracking-wide">
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
                  <p className="text-right text-[40px] font-bold leading-[0.88] tracking-tight">
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
                    perspective: 2200,
                    perspectiveOrigin: "50% 50%",
                  }}
                >
                  {/* Inside Newspaper Spread with dynamic cast shadow */}
                  <div
                    data-sheet
                    className="absolute inset-0 z-10 pointer-events-auto overflow-hidden"
                  >
                    <SponsorEdition />
                    <div
                      data-cast-shadow
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-transform"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0) 100%)",
                      }}
                    />
                  </div>

                  {/* Side props emerging from INSIDE the newspaper */}
                  <div
                    data-props-wrap
                    className="pointer-events-none absolute inset-0 z-15"
                  >
                    <SponsorSideProps />
                  </div>

                  <div
                    data-book
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      aria-hidden
                      data-cover-dressing
                      className="pointer-events-none absolute inset-0 translate-x-0 translate-y-[-8px] rotate-[0.6deg] rounded-[2px] border border-black/10 bg-[#d0d0cb] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
                    />
                    <div
                      aria-hidden
                      data-cover-dressing
                      className="pointer-events-none absolute inset-0 translate-x-0 translate-y-[8px] rotate-[-0.6deg] rounded-[2px] border border-black/10 bg-[#dedede] shadow-[0_14px_34px_rgba(0,0,0,0.26)]"
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
