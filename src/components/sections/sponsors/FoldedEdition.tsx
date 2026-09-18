"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import SponsorEdition from "./SponsorEdition";
import SealedCover from "./SealedCover";
import SponsorSideProps from "./SponsorSideProps";
import { DESKTOP, MOBILE } from "@/components/motion/recipes";
import { paperUnfold } from "@/components/motion/paper";
import { clamp, smooth, stage, smoothDamp } from "@/lib/math";

/**
 * The sponsor sheet as a broadsheet edition that opens naturally in physical 3D.
 *
 * When closed, the reader sees the front page cover (`SealedCover`).
 * Scrolling turns the articulated 6-fold paper leaf smoothly across to the left,
 * revealing the inner broadsheet (`SponsorEdition`).
 */

const DESKTOP_SHEET_W = 1184;
const DESKTOP_SHEET_H = 860;
const MOBILE_SHEET_W = 480;
const MOBILE_SHEET_H = 760;

export const EDITION_BLOCK_HEIGHT = DESKTOP_SHEET_H;

const VIEWPORT_FIT = 0.95;
const TRAVEL_PLATE = 500;

/* -------------------------------------------------------------- components */

/**
 * The 3D newspaper cover articulated across 6 folds for a smooth paper wave flip.
 * Completely shadow-free for a clean, flat aesthetic.
 */
function BookCover({
  variant = "canvas",
  sheetW = DESKTOP_SHEET_W,
  sheetH = DESKTOP_SHEET_H,
}: {
  variant?: "canvas" | "flow";
  sheetW?: number;
  sheetH?: number;
}) {
  const NUM_FOLDS = 6;
  const segW = sheetW / NUM_FOLDS;
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
      {/* Segment 0: Spine segment (x: 0 to 16.7%, permanently pinned to spine) */}
      <div
        data-segment-0
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{
          width: `${segW + overlap}px`,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Segment 0 Front Face */}
        <div
          className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <div className="absolute top-0 left-0" style={{ width: `${sheetW}px`, height: `${sheetH}px` }}>
            <SealedCover variant={variant} />
          </div>
        </div>

        {/* Segment 0 Back Face */}
        <div
          className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        />

        {/* Segment 1: Hinged to Segment 0 (x: 16.7% to 33.3%) */}
        <div
          data-segment-1
          className="absolute inset-y-0 will-change-transform"
          style={{
            left: `${segW}px`,
            width: `${segW + overlap}px`,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
          >
            <div className="absolute top-0" style={{ width: `${sheetW}px`, height: `${sheetH}px`, left: `-${segW}px` }}>
              <SealedCover variant={variant} />
            </div>
          </div>
          <div
            className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          />

          {/* Segment 2: Hinged to Segment 1 (x: 33.3% to 50%) */}
          <div
            data-segment-2
            className="absolute inset-y-0 will-change-transform"
            style={{
              left: `${segW}px`,
              width: `${segW + overlap}px`,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="absolute top-0" style={{ width: `${sheetW}px`, height: `${sheetH}px`, left: `-${segW * 2}px` }}>
                <SealedCover variant={variant} />
              </div>
            </div>
            <div
              className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            />

            {/* Segment 3: Hinged to Segment 2 (x: 50% to 66.7%) */}
            <div
              data-segment-3
              className="absolute inset-y-0 will-change-transform"
              style={{
                left: `${segW}px`,
                width: `${segW + overlap}px`,
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
              >
                <div className="absolute top-0" style={{ width: `${sheetW}px`, height: `${sheetH}px`, left: `-${segW * 3}px` }}>
                  <SealedCover variant={variant} />
                </div>
              </div>
              <div
                className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              />

              {/* Segment 4: Hinged to Segment 3 (x: 66.7% to 83.3%) */}
              <div
                data-segment-4
                className="absolute inset-y-0 will-change-transform"
                style={{
                  left: `${segW}px`,
                  width: `${segW + overlap}px`,
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                >
                  <div className="absolute top-0" style={{ width: `${sheetW}px`, height: `${sheetH}px`, left: `-${segW * 4}px` }}>
                    <SealedCover variant={variant} />
                  </div>
                </div>
                <div
                  className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                />

                {/* Segment 5: Hinged to Segment 4 (x: 83.3% to 100%, outer leaf) */}
                <div
                  data-segment-5
                  className="absolute inset-y-0 will-change-transform"
                  style={{
                    left: `${segW}px`,
                    width: `${sheetW - segW * 5 + overlap}px`,
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(0deg)",
                    }}
                  >
                    <div className="absolute top-0" style={{ width: `${sheetW}px`, height: `${sheetH}px`, left: `-${segW * 5}px` }}>
                      <SealedCover variant={variant} />
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 overflow-hidden bg-[#ebebe9]"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  />
                </div>
              </div>
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

  const sheetW = variant === "flow" ? MOBILE_SHEET_W : DESKTOP_SHEET_W;
  const sheetH = variant === "flow" ? MOBILE_SHEET_H : DESKTOP_SHEET_H;

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
    const seg1 = stageEl.querySelector<HTMLElement>("[data-segment-1]");
    const seg2 = stageEl.querySelector<HTMLElement>("[data-segment-2]");
    const seg3 = stageEl.querySelector<HTMLElement>("[data-segment-3]");
    const seg4 = stageEl.querySelector<HTMLElement>("[data-segment-4]");
    const seg5 = stageEl.querySelector<HTMLElement>("[data-segment-5]");
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
    let renderedHeight = sheetH;
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
      const centerX = sheetW / 2;
      const centerY = sheetH / 2;

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

      const availW = Math.max(280, window.innerWidth - (variant === "flow" ? 20 : 24));
      const targetW = variant === "flow" ? availW : Math.min(availW, sheetW);
      canvasScale = clamp(0.24, 1.0, targetW / sheetW);

      if (variant === "flow") {
        travelPx = 480;
        container.style.height = `${travelPx + Math.round(sheetH * canvasScale) + 120}px`;
      } else {
        travelPx = Math.round(TRAVEL_PLATE * Math.max(0.7, canvasScale));
        container.style.height = `${sheetH}px`;
      }

      const baseScreenHeight = sheetH * canvasScale;
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

      // Natural 3D book page flip wave physics across 6 folds:
      // Page opens smoothly from 0 to 180 degrees (resting flat on the left)
      const angle = easeT * 180;

      // 6-fold articulated wave flexion traveling across the leaf (zero shadows, pure flat geometry)
      const baseWave = -Math.sin(s * Math.PI);
      const ripple = Math.sin(s * Math.PI * 2);

      const curl1 = baseWave * 9 + ripple * 3;
      const curl2 = baseWave * 11 + ripple * 5;
      const curl3 = baseWave * 13 + ripple * 3;
      const curl4 = baseWave * 11 - ripple * 3;
      const curl5 = baseWave * 9 - ripple * 6;

      if (cover) {
        // Pure Y-axis rotation pinned permanently at spine (x=0, y=0, z=0) — NEVER detaches from 2nd page!
        cover.style.transform = `rotateY(${-angle.toFixed(2)}deg)`;
        cover.style.opacity = "1";
      }

      if (seg1) seg1.style.transform = `rotateY(${curl1.toFixed(2)}deg)`;
      if (seg2) seg2.style.transform = `rotateY(${curl2.toFixed(2)}deg)`;
      if (seg3) seg3.style.transform = `rotateY(${curl3.toFixed(2)}deg)`;
      if (seg4) seg4.style.transform = `rotateY(${curl4.toFixed(2)}deg)`;
      if (seg5) seg5.style.transform = `rotateY(${curl5.toFixed(2)}deg)`;

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
          width: variant === "flow" ? "100%" : sheetW,
          height: variant === "flow" ? 480 + Math.round(sheetH * 0.77) + 120 : sheetH,
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
                width: sheetW,
                transformOrigin: "top center",
                zIndex: 30,
                overflowAnchor: "none",
                display: "none",
              }}
            >
              <div
                ref={fitRef}
                style={{ width: sheetW, transformOrigin: "top center" }}
              >
                {/* 3D Stage */}
                <div
                  ref={stageRef}
                  className="relative select-none"
                  style={{
                    width: sheetW,
                    height: sheetH,
                    perspective: 2200,
                    perspectiveOrigin: "50% 50%",
                  }}
                >
                  {/* Inside Newspaper Spread */}
                  <div
                    data-sheet
                    className="absolute inset-0 z-10 pointer-events-auto overflow-hidden"
                  >
                    <SponsorEdition variant={variant} />
                  </div>

                  {/* Side props emerging from INSIDE the newspaper (desktop only) */}
                  <div
                    data-props-wrap
                    className={`pointer-events-none absolute inset-0 z-15 ${variant === "flow" ? "hidden" : ""}`}
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
                      className="pointer-events-none absolute inset-0 translate-x-0 translate-y-[-8px] rotate-[0.6deg] rounded-[2px] border border-black/10 bg-[#d0d0cb]"
                    />
                    <div
                      aria-hidden
                      data-cover-dressing
                      className="pointer-events-none absolute inset-0 translate-x-0 translate-y-[8px] rotate-[-0.6deg] rounded-[2px] border border-black/10 bg-[#dedede]"
                    />
                    <BookCover variant={variant} sheetW={sheetW} sheetH={sheetH} />
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
