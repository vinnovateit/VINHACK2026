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
const TR_SHIFT_X = 280;
const TR_SHIFT_Y = -200;
const BL_SHIFT_X = -580;
const BL_SHIFT_Y = 290;
const TR_STACK_X = 280;
const TR_STACK_Y = -200;
const BL_STACK_X = -580;
const BL_STACK_Y = 290;
const STACK_STEP_X = 18;
const STACK_STEP_Y = -10;
const VISIBLE_STACK_LAYERS = 6;

const TOTAL_CARDS = 48;
const MID = 24; // Center split point (card-24 is the Grey front card of top-right stack)
const SEQUENCE_LENGTH = 4;
const FOCUS_WIDTH_RATIO = 0.68;
const FOCUS_HEIGHT_RATIO = 0.719;
const FOCUS_OFFSET_X = 0;
const FOCUS_OFFSET_Y = 0;
const MOVE_PHASE_END = 0.25;
const ZOOM_IN_PHASE_END = 0.5;
const ZOOM_OUT_PHASE_END = 0.75;
const SCROLL_STEP = 0.25;
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

  // Interactive locked animation state (one unit of progress per active card).
  const animState = useRef({ progress: 0 });
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
            end: "center 45%",
            scrub: 0.8,
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
    const focusScaleX = (window.innerWidth * FOCUS_WIDTH_RATIO) / 365.44;
    const focusScaleY = (window.innerHeight * FOCUS_HEIGHT_RATIO) / 257.6;

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
      const currentX = Number(gsap.getProperty(el, "x")) || 0;
      const currentY = Number(gsap.getProperty(el, "y")) || 0;
      const renderedRect = el.getBoundingClientRect();
      const screenCenterX = card.splitX + currentX
        + window.innerWidth / 2
        - (renderedRect.left + renderedRect.width / 2)
        + FOCUS_OFFSET_X;
      const screenCenterY = card.splitY + currentY
        + window.innerHeight / 2
        - (renderedRect.top + renderedRect.height / 2)
        + FOCUS_OFFSET_Y;

      if (index < completedCount) {
        positionX = bottomLeftX;
        positionY = bottomLeftY;
      } else if (index === activeIndex && p < SEQUENCE_LENGTH) {
        const cardP = p - index;

        if (cardP < MOVE_PHASE_END) {
          const moveP = cardP / MOVE_PHASE_END;
          positionX = card.splitX * (1 - moveP) + splitOriginX * moveP;
          positionY = card.splitY * (1 - moveP) + splitOriginY * moveP;
          // Keep the travel pose identical to the surrounding stack.
          rotation = 15;
          skewX = 15;
          scaleY = 0.97;
        } else if (cardP < ZOOM_IN_PHASE_END) {
          const focusP = (cardP - MOVE_PHASE_END) / (ZOOM_IN_PHASE_END - MOVE_PHASE_END);
          positionX = splitOriginX * (1 - focusP) + screenCenterX * focusP;
          positionY = splitOriginY * (1 - focusP) + screenCenterY * focusP;
          rotation = 0;
          skewX = 0;
          scaleX = 1 + (focusScaleX - 1) * focusP;
          scaleY = 1 + (focusScaleY - 1) * focusP;
          opacity = focusP;
          contentY = 12 * (1 - focusP);
        } else if (cardP < ZOOM_OUT_PHASE_END) {
          const zoomOutP = (cardP - ZOOM_IN_PHASE_END) / (ZOOM_OUT_PHASE_END - ZOOM_IN_PHASE_END);
          positionX = screenCenterX * (1 - zoomOutP) + splitOriginX * zoomOutP;
          positionY = screenCenterY * (1 - zoomOutP) + splitOriginY * zoomOutP;
          rotation = 0;
          skewX = 0;
          scaleX = focusScaleX - (focusScaleX - 1) * zoomOutP;
          scaleY = focusScaleY - (focusScaleY - 1) * zoomOutP;
          opacity = 1;
          contentY = 0;
        } else {
          const exitP = (cardP - ZOOM_OUT_PHASE_END) / (1 - ZOOM_OUT_PHASE_END);
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
      el.style.zIndex = isActive ? String(Math.max(10000, layerZIndex)) : String(card.zIndex);
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

  // Scroll lock interceptor
  useEffect(() => {
    let targetP = 0;
    let tween: gsap.core.Tween | null = null;
    let wheelLocked = false;
    let unlockTimer: ReturnType<typeof setTimeout> | null = null;
    let sequenceLocked = false;

    const handleWheel = (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      const delta = e.deltaY;
      if (delta === 0) return;
      if (!isSplitDone.current) return;

      if (!sequenceLocked) {
        const canEnterFromDirection = delta > 0
          ? rect.top < window.innerHeight * 0.85 && targetP < SEQUENCE_LENGTH
          : rect.top < window.innerHeight * -0.18
            && rect.bottom > window.innerHeight * 0.45
            && targetP > 0;
        if (!canEnterFromDirection) return;
        sequenceLocked = true;
      }

      const atBoundary = delta > 0
        ? targetP >= SEQUENCE_LENGTH
        : targetP <= 0;
      if (atBoundary) {
        sequenceLocked = false;
        return;
      }

      // Keep the browser locked during trackpad momentum, even between accepted steps.
      e.preventDefault();
      if (wheelLocked) return;

      const nextProgress = delta > 0
        ? Math.min(SEQUENCE_LENGTH, targetP + SCROLL_STEP)
        : Math.max(0, targetP - SCROLL_STEP);

      if (nextProgress === targetP) return;

      wheelLocked = true;
      if (unlockTimer) clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => {
        wheelLocked = false;
      }, 900);
      targetP = nextProgress;

      // When scrolling down and animation is not finished: LOCK scroll and advance animation
      if (tween) tween.kill();
      tween = gsap.to(animState.current, {
        progress: targetP,
        duration: 0.85,
        ease: "power2.out",
        onUpdate: () => applyCardProgress(animState.current.progress),
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (tween) tween.kill();
      if (unlockTimer) clearTimeout(unlockTimer);
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
                width={365.44}
                height={257.6}
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
                    <h3 className="relative z-10 font-rotonto text-[#2849cb] text-[18px] font-bold tracking-tight mb-1 leading-tight">
                      {SEQUENCE_CONTENT[SEQUENCE_CARDS.indexOf(card)]}
                    </h3>
                    <p className="relative z-10 font-rotonto text-[#2849cb]/90 text-[7.5px] leading-[1.38] tracking-tight">
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
