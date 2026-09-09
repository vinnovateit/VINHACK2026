"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TrackCard, TRACK_COLORS } from "./TrackCard";
import { DESKTOP } from "@/components/motion/recipes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface CardItem {
  id: string;
  color: string;
  // Frame 1 (Continuous diagonal stream across the entire screen)
  startX: number;
  startY: number;
  // Frame 2 (Split corner stack)
  targetX: number;
  targetY: number;
  splitX: number;
  splitY: number;
  zIndex: number;
  isHero?: boolean;
}

// 6 specified colors in cyclic order: Grey -> Pink -> Red -> Dark Blue -> Light Blue -> White
const COLOR_CYCLE = [
  TRACK_COLORS.grey,      // 0: #D9D9D9
  TRACK_COLORS.pink,      // 1: #E2B5F0
  TRACK_COLORS.red,       // 2: #FA1A1D
  TRACK_COLORS.darkBlue,  // 3: #2849CB
  TRACK_COLORS.lightBlue, // 4: #74D4F0
  TRACK_COLORS.white,     // 5: #FFFFFF
] as const;

function getColor(index: number): string {
  const mod = ((index % 6) + 6) % 6;
  return COLOR_CYCLE[mod];
}

// Original Figma diagonal step size (unsquished, natural card spacing)
const STEP_X = 23.4;
const STEP_Y = -13.04;

// Corner stack anchors and the small offsets that make one consistent stack.
const TR_SHIFT_X = 440;
const TR_SHIFT_Y = -215;
const BL_SHIFT_X = -740;
const BL_SHIFT_Y = 305;
const TR_STACK_X = 440;
const TR_STACK_Y = -215;
const BL_STACK_X = -740;
const BL_STACK_Y = 305;
const STACK_STEP_X = 18;
const STACK_STEP_Y = -10;
const VISIBLE_STACK_LAYERS = 6;

const TOTAL_CARDS = 48;
const MID = 24; // Center split point (card-24 is the Grey front card of top-right stack)
const SEQUENCE_LENGTH = 4;
const CARD_WIDTH = 365.44;
const CARD_HEIGHT = 257.6;
// Fraction of the viewport the focused card fills on its tighter axis. The fit is
// uniform so the card keeps its aspect ratio instead of stretching.
const FOCUS_FILL = 0.86;
const FOCUS_OFFSET_X = 0;
const FOCUS_OFFSET_Y = 0;
const MOVE_PHASE_END = 0.15;
const ZOOM_IN_PHASE_END = 0.35;
// The card sits still and fully readable between zoom-in and zoom-out.
const HOLD_PHASE_END = 0.75;
const ZOOM_OUT_PHASE_END = 0.9;
// Continuous wheel-driven progress: pixels of wheel travel per unit of progress.
const SCROLL_SENSITIVITY = 1 / 300;
// Per-event clamp so a violent flick cannot teleport past a card.
const MAX_WHEEL_DELTA = 120;
// Exponential approach factor per 60fps frame; lower is smoother/laggier.
const SMOOTHING = 0.14;

// Smoothstep: zero velocity at both ends, so phases join without a visible kink.
function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}
const SEQUENCE_CONTENT = [
  "INNOVATE FOR IMPACT",
  "DESIGN FOR PEOPLE",
  "BUILD WHAT LASTS",
  "MAKE IT MATTER",
] as const;

function buildNeverEndingDeck(): CardItem[] {
  const items: CardItem[] = [];

  for (let i = 0; i < TOTAL_CARDS; i++) {
    const isBottomLeft = i < MID;

    // Frame 1 position: continuous diagonal ribbon with original step size
    const streamIndex = i - MID;
    const startX = (streamIndex + 0.5) * STEP_X;
    const startY = (streamIndex + 0.5) * STEP_Y;

    // The split destination stays wide so the opening fan can leave the viewport.
    const shiftX = isBottomLeft ? BL_SHIFT_X : TR_SHIFT_X;
    const shiftY = isBottomLeft ? BL_SHIFT_Y : TR_SHIFT_Y;
    const splitX = startX + shiftX;
    const splitY = startY + shiftY;

    // The eventual corner stack uses a compact, shared visual offset.
    const stackIndex = Math.min(
      isBottomLeft ? i : i - MID,
      VISIBLE_STACK_LAYERS - 1,
    );
    const stackX = isBottomLeft ? BL_STACK_X : TR_STACK_X;
    const stackY = isBottomLeft ? BL_STACK_Y : TR_STACK_Y;
    const targetX = stackX + stackIndex * STACK_STEP_X;
    const targetY = stackY + stackIndex * STACK_STEP_Y;

    // Color: index 24 is Grey (#D9D9D9), index 25 is Pink, etc.
    const color = getColor(i - MID);

    // Uniform stacking order: card i is in front of card i+1
    const zIndex = TOTAL_CARDS - i;

    items.push({
      id: `card-${i}`,
      color,
      startX,
      startY,
      targetX,
      targetY,
      splitX,
      splitY,
      zIndex,
      isHero: i === MID,
    });
  }

  return items;
}

const ALL_CARDS = buildNeverEndingDeck();
const SEQUENCE_CARDS = ALL_CARDS.slice(MID, MID + SEQUENCE_LENGTH);

export function TracksCardDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const innerCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Screen-centre target per sequence card, measured on entry instead of every
  // frame. Reading getBoundingClientRect inside the update loop forced a layout
  // flush per card per frame, which was the main source of jank.
  const centerCache = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isSplitDone = useRef(false);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const mm = gsap.matchMedia();

      mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
        // Step 1: Diagonal split scrubbed as section enters view
        const splitTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            end: "center 60%",
            scrub: 0.6,
            onUpdate: (self) => {
              isSplitDone.current = self.progress > 0.85;
            },
          },
        });

        ALL_CARDS.forEach((card) => {
          const el = cardRefs.current.get(card.id);
          if (!el) return;

          const deltaX = card.startX - card.splitX;
          const deltaY = card.startY - card.splitY;

          splitTl.fromTo(
            el,
            { x: deltaX, y: deltaY },
            { x: 0, y: 0, duration: 1, ease: "power2.inOut" },
            0,
          );
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  // Update the active cards while the page remains locked in the tracks section.
  const applyCardProgress = (p: number) => {
    const sequenceCards = SEQUENCE_CARDS;
    const completedCount = Math.min(SEQUENCE_LENGTH, Math.floor(p));
    const activeIndex = Math.min(SEQUENCE_LENGTH - 1, Math.floor(p));
    // Largest uniform scale that still fits inside the viewport margin.
    const focusScale = Math.min(
      (window.innerWidth * FOCUS_FILL) / CARD_WIDTH,
      (window.innerHeight * FOCUS_FILL) / CARD_HEIGHT,
    );
    const focusScaleX = focusScale;
    const focusScaleY = focusScale;

    sequenceCards.forEach((card, index) => {
      const el = cardRefs.current.get(card.id);
      const inner = innerCardRefs.current.get(card.id);
      const content = contentRefs.current.get(card.id);
      if (!el || !inner) return;

      const bottomLeftX = card.startX + BL_SHIFT_X;
      const bottomLeftY = card.startY + BL_SHIFT_Y;
      const splitOriginX = card.startX;
      const splitOriginY = card.startY;
      let positionX = card.splitX;
      let positionY = card.splitY;
      let rotation = 15;
      let skewX = 15;
      let scaleX = 1;
      let scaleY = 0.97;
      let opacity = 0;
      let contentY = 12;
      let layerZIndex = card.zIndex;
      const center = centerCache.current.get(card.id);
      const screenCenterX = center ? center.x : card.splitX;
      const screenCenterY = center ? center.y : card.splitY;

      if (index < completedCount) {
        positionX = bottomLeftX;
        positionY = bottomLeftY;
      } else if (index === activeIndex && p < SEQUENCE_LENGTH) {
        const cardP = p - index;

        if (cardP < MOVE_PHASE_END) {
          const moveP = smooth(cardP / MOVE_PHASE_END);
          positionX = card.splitX * (1 - moveP) + splitOriginX * moveP;
          positionY = card.splitY * (1 - moveP) + splitOriginY * moveP;
          // Keep the travel pose identical to the surrounding stack.
          rotation = 15;
          skewX = 15;
          scaleY = 0.97;
        } else if (cardP < ZOOM_IN_PHASE_END) {
          const focusP = smooth((cardP - MOVE_PHASE_END) / (ZOOM_IN_PHASE_END - MOVE_PHASE_END));
          positionX = splitOriginX * (1 - focusP) + screenCenterX * focusP;
          positionY = splitOriginY * (1 - focusP) + screenCenterY * focusP;
          rotation = 0;
          skewX = 0;
          scaleX = 1 + (focusScaleX - 1) * focusP;
          scaleY = 1 + (focusScaleY - 1) * focusP;
          opacity = focusP;
          contentY = 12 * (1 - focusP);
        } else if (cardP < HOLD_PHASE_END) {
          // Hold at full focus so the track is actually readable.
          positionX = screenCenterX;
          positionY = screenCenterY;
          rotation = 0;
          skewX = 0;
          scaleX = focusScaleX;
          scaleY = focusScaleY;
          opacity = 1;
          contentY = 0;
        } else if (cardP < ZOOM_OUT_PHASE_END) {
          const zoomOutP = smooth((cardP - HOLD_PHASE_END) / (ZOOM_OUT_PHASE_END - HOLD_PHASE_END));
          positionX = screenCenterX * (1 - zoomOutP) + splitOriginX * zoomOutP;
          positionY = screenCenterY * (1 - zoomOutP) + splitOriginY * zoomOutP;
          rotation = 0;
          skewX = 0;
          scaleX = focusScaleX - (focusScaleX - 1) * zoomOutP;
          scaleY = focusScaleY - (focusScaleY - 1) * zoomOutP;
          opacity = 1;
          contentY = 0;
        } else {
          const exitP = smooth((cardP - ZOOM_OUT_PHASE_END) / (1 - ZOOM_OUT_PHASE_END));
          positionX = splitOriginX * (1 - exitP) + bottomLeftX * exitP;
          positionY = splitOriginY * (1 - exitP) + bottomLeftY * exitP;
          rotation = 15;
          skewX = 15;
          scaleY = 0.97;
          // The zoom-out phase has already returned the card to its original size.
          scaleX = 1;
          opacity = 1;
          contentY = 12 * exitP;
          layerZIndex = Math.round(1000 + (card.zIndex - 1000) * exitP);
        }
      }

      const isActive = index === activeIndex && p < SEQUENCE_LENGTH;
      const nextZ = isActive ? String(Math.max(10000, layerZIndex)) : String(card.zIndex);
      if (el.style.zIndex !== nextZ) el.style.zIndex = nextZ;
      gsap.set(el, {
        x: positionX - card.splitX,
        y: positionY - card.splitY,
      });
      gsap.set(inner, {
        rotation,
        skewX,
        scaleY,
        scaleX,
      });
      if (content) gsap.set(content, { opacity, y: contentY });
    });
  };

  // Re-measure the focus targets whenever the sequence is (re-)entered. The page
  // cannot scroll while locked, so one measurement per entry stays valid.
  const measureCenters = () => {
    SEQUENCE_CARDS.forEach((card) => {
      const el = cardRefs.current.get(card.id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const currentX = Number(gsap.getProperty(el, "x")) || 0;
      const currentY = Number(gsap.getProperty(el, "y")) || 0;
      // Subtract the live transform so the cached value is the layout centre.
      const layoutCenterX = rect.left + rect.width / 2 - currentX;
      const layoutCenterY = rect.top + rect.height / 2 - currentY;
      centerCache.current.set(card.id, {
        x: card.splitX + window.innerWidth / 2 - layoutCenterX + FOCUS_OFFSET_X,
        y: card.splitY + window.innerHeight / 2 - layoutCenterY + FOCUS_OFFSET_Y,
      });
    });
  };

  // Scroll lock interceptor
  useEffect(() => {
    let targetP = 0;
    let currentP = 0;
    let running = false;
    let sequenceLocked = false;

    const tick = () => {
      const diff = targetP - currentP;
      if (Math.abs(diff) < 0.0004) {
        if (currentP !== targetP) {
          currentP = targetP;
          applyCardProgress(currentP);
        }
        gsap.ticker.remove(tick);
        running = false;
        return;
      }
      // Frame-rate independent exponential approach, so 60Hz and 120Hz displays
      // travel at the same speed instead of the animation running twice as fast.
      const frames = Math.min(gsap.ticker.deltaRatio(60), 4);
      currentP += diff * (1 - (1 - SMOOTHING) ** frames);
      applyCardProgress(currentP);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      gsap.ticker.add(tick);
    };

    const normalizeDelta = (e: WheelEvent) => {
      const unit = e.deltaMode === 1
        ? 16
        : e.deltaMode === 2
          ? window.innerHeight
          : 1;
      return gsap.utils.clamp(-MAX_WHEEL_DELTA, MAX_WHEEL_DELTA, e.deltaY * unit);
    };

    const handleWheel = (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const delta = normalizeDelta(e);
      if (delta === 0) return;
      if (!isSplitDone.current) return;

      const rect = container.getBoundingClientRect();

      if (!sequenceLocked) {
        const canEnterFromDirection = delta > 0
          ? rect.top < window.innerHeight * 0.85 && targetP < SEQUENCE_LENGTH
          : rect.top < window.innerHeight * -0.18
            && rect.bottom > window.innerHeight * 0.45
            && targetP > 0;
        if (!canEnterFromDirection) return;
        sequenceLocked = true;
        measureCenters();
      }

      const atBoundary = delta > 0
        ? targetP >= SEQUENCE_LENGTH
        : targetP <= 0;
      if (atBoundary) {
        sequenceLocked = false;
        return;
      }

      // Hold the page still for the whole gesture, momentum included.
      e.preventDefault();

      targetP = gsap.utils.clamp(
        0,
        SEQUENCE_LENGTH,
        targetP + delta * SCROLL_SENSITIVITY,
      );
      startLoop();
    };

    const handleResize = () => {
      if (sequenceLocked) measureCenters();
      applyCardProgress(currentP);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      if (running) gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[805px] left-1/2 top-[calc(50%+235.5px)] w-[1142px] overflow-visible pointer-events-none"
      data-node-id="596:376"
      data-name="TRACK_CARDS_DECK"
    >
      {ALL_CARDS.map((card) => {
        const leftVal = `calc(50% + ${card.splitX}px)`;
        const topVal = `calc(50% + ${card.splitY}px)`;

        return (
          <div
            key={card.id}
            ref={(node) => {
              if (node) cardRefs.current.set(card.id, node);
              else cardRefs.current.delete(card.id);
            }}
            className="-translate-x-1/2 -translate-y-1/2 absolute flex h-[352.183px] items-center justify-center w-[352.988px] will-change-transform pointer-events-auto"
            style={{
              left: leftVal,
              top: topVal,
              zIndex: card.zIndex,
            }}
          >
            {/* Card inner box: stays isometric in step 2, rotates flat and zooms in step 3 */}
            <div
              ref={(node) => {
                if (node) innerCardRefs.current.set(card.id, node);
                else innerCardRefs.current.delete(card.id);
              }}
              className="flex-none rotate-15 scale-y-97 skew-x-15 will-change-transform"
              style={{ transformOrigin: "center center" }}
            >
              <TrackCard
                color={card.color}
                isFront={card.isHero}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              >
                {SEQUENCE_CARDS.includes(card) ? (
                  <div
                    ref={(node) => {
                      if (node) contentRefs.current.set(card.id, node);
                      else contentRefs.current.delete(card.id);
                    }}
                    className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 will-change-transform pointer-events-none"
                  >
                    <img
                      src="/placeholder.jpg"
                      alt=""
                      className="absolute inset-0 size-full object-cover opacity-20 pointer-events-none"
                    />
                    <h3 className="relative z-10 font-rotonto text-[#2849cb] text-[15px] font-bold tracking-tight mb-1 leading-tight">
                      {SEQUENCE_CONTENT[SEQUENCE_CARDS.indexOf(card)]}
                    </h3>
                    <p className="relative z-10 font-rotonto text-[#2849cb]/90 text-[6.5px] leading-[1.38] tracking-tight">
                      Step into the world where ideas ignite revolutions. Dream big, solve pressing problems, and create solutions that spark meaningful change.
                    </p>
                  </div>
                ) : null}
              </TrackCard>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TracksCardDeck;
