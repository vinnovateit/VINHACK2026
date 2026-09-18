"use client";

import { useEffect, useRef, useState } from "react";
import {
  TrackCard,
  TRACK_COLORS,
  TrackAsterisk,
  TrackCardLogo,
  trackInk,
} from "./TrackCard";
import { TrackVisual } from "./TrackIcons";
import { TRACKS } from "@/content/site";
import { clamp, mix, easeOutQuad as easeOut, arc } from "@/lib/math";

// Exact Desktop Card Dimensions & Retina Resolution
const CARD_BASE_WIDTH = 365.44;
const CARD_BASE_HEIGHT = 257.6;
const CARD_RES = 2;
const CARD_WIDTH = CARD_BASE_WIDTH * CARD_RES; // 730.88
const CARD_HEIGHT = CARD_BASE_HEIGHT * CARD_RES; // 515.2

const COLOR_CYCLE = [
  TRACK_COLORS.grey,
  TRACK_COLORS.pink,
  TRACK_COLORS.red,
  TRACK_COLORS.darkBlue,
  TRACK_COLORS.lightBlue,
  TRACK_COLORS.white,
] as const;

const COUNT = TRACKS.items.length;
const SEED = 5;
const BACKING = 5;
const PILE_DEPTH = 5;

const SLOTS: readonly number[] = [
  ...Array.from({ length: SEED }, (_, s) => -2 - s),
  ...Array.from({ length: COUNT + BACKING }, (_, i) => i),
];

// Sequential Flight Timing: Card sweeps away 0.0 -> 0.48, next arrives 0.52 -> 1.0
const SWEEP_DURATION = 0.48;
const THROW_START = 0.52;

export default function MobileTracksDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;

    const tick = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const progress = clamp(0, 1, -rect.top / totalScrollable);
      const p = mix(-1, COUNT - 1, progress);

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Exact desktop card scaled to fit mobile screen edge-to-edge
      const cardScreenWidth = Math.min(screenW * 0.94, 460);
      const focusScale = cardScreenWidth / CARD_WIDTH;
      const cornerScale = focusScale * 0.58;

      // Corner pile anchors near viewport corners
      const pileX = Math.min(screenW * 0.44, 210);
      const pileY = -Math.min(screenH * 0.32, 250);
      const doneX = -Math.min(screenW * 0.44, 210);
      const doneY = Math.min(screenH * 0.32, 250);
      const cornerRotate = 18;

      for (const slot of SLOTS) {
        const el = cardRefs.current.get(slot);
        if (!el) continue;

        const raw = p - slot;
        const absRaw = Math.abs(raw);
        const inbound = raw <= 0;

        let e = 0;
        let air = 0;

        if (inbound) {
          const stretch = clamp(0, 1, raw + 1);
          if (stretch < THROW_START) {
            e = 0;
            air = 0;
          } else {
            const own = (stretch - THROW_START) / (1 - THROW_START);
            e = easeOut(own);
            air = arc(own);
          }
        } else {
          const stretch = clamp(0, 1, raw);
          if (stretch <= SWEEP_DURATION) {
            const own = stretch / SWEEP_DURATION;
            e = 1 - own * own;
            air = arc(own);
          } else {
            e = 0;
            air = 0;
          }
        }

        const depth = Math.min(PILE_DEPTH, Math.max(0, absRaw - 1));
        const anchorX = inbound ? pileX : doneX;
        const anchorY = inbound ? pileY : doneY;

        const restX = anchorX + (inbound ? depth * 4 : -depth * 4);
        const restY = anchorY + (inbound ? -depth * 4 : depth * 4);

        let x = mix(restX, 0, e);
        let y = mix(restY, 0, e);

        if (air > 0) {
          if (inbound) {
            x -= 24 * air * (1 - e);
            y = Math.min(0, y - 12 * air * (1 - e));
          } else {
            x -= 24 * air * e;
            y = Math.max(0, y + 12 * air * e);
          }
        }

        const scale = mix(cornerScale, focusScale, e);
        const rotate = mix(cornerRotate, 0, e);

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(4)})`;

        const layer =
          absRaw < 0.5
            ? "70"
            : inbound
            ? String(45 - slot)
            : String(20 + slot);
        if (el.style.zIndex !== layer) el.style.zIndex = layer;

        const blurAmount = Math.min(3.5, Math.max(0, (1 - e) * 3.5));
        const filterStr = blurAmount > 0.4 ? `blur(${blurAmount.toFixed(1)}px)` : "none";
        if (el.style.filter !== filterStr) {
          el.style.filter = filterStr;
        }
      }

      const active = clamp(0, COUNT - 1, Math.round(p));
      setActiveTrack((prev) => (prev !== active ? active : prev));

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const scrollToTrack = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    const targetProgress = (index + 1) / COUNT;
    const targetY = window.scrollY + rect.top + targetProgress * totalScrollable;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${(COUNT + 1) * 90}vh`, minHeight: "3600px" }}
    >
      {/* Sticky Deck Stage pinned across runway */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center select-none pointer-events-none">
        {/* The Card Stage: Cards scaled from exact 730.88 x 515.2 desktop dimensions */}
        <div className="relative flex items-center justify-center size-0">
          {SLOTS.map((slot) => {
            const color =
              COLOR_CYCLE[
                ((slot % COLOR_CYCLE.length) + COLOR_CYCLE.length) %
                  COLOR_CYCLE.length
              ];
            const { ink, rule } = trackInk(color);
            const item =
              slot >= 0 && slot < COUNT ? TRACKS.items[slot] : null;

            return (
              <div
                key={slot}
                ref={(node) => {
                  if (node) cardRefs.current.set(slot, node);
                  else cardRefs.current.delete(slot);
                }}
                className="absolute will-change-transform"
                style={{
                  left: 0,
                  top: 0,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  marginLeft: -CARD_WIDTH / 2,
                  marginTop: -CARD_HEIGHT / 2,
                  transformOrigin: "center center",
                }}
                aria-hidden
              >
                {/* Exact Desktop TrackCard */}
                <TrackCard
                  color={color}
                  isFront={item !== null}
                  is2x
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  className="absolute inset-0"
                >
                  {item ? (
                    <div
                      className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[48px] py-[40px] opacity-100"
                      style={{ color: ink }}
                    >
                      {/* Exact Desktop Top Row */}
                      <div className="flex items-start justify-between">
                        <span className="font-rotonto text-[26px] tracking-[0.2em] tabular-nums">
                          #{slot + 1}
                        </span>
                        <TrackAsterisk size={30} />
                      </div>

                      {/* Exact Desktop Middle Row */}
                      <div className="-mt-[12px] flex items-start gap-[36px]">
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-rotonto font-bold ${
                              item.title.length > 30
                                ? "text-[36px] leading-[1.12] tracking-[0.03em]"
                                : item.title.length > 20
                                  ? "text-[44px] leading-[1.06] tracking-[0.02em]"
                                  : "text-[58px] leading-[1.02] tracking-[0.02em]"
                            }`}
                          >
                            {item.title}
                          </h3>
                          <p
                            className={`mt-[22px] font-rotonto text-justify leading-[1.5] tracking-tight opacity-90 ${
                              item.blurb.length > 250 ? "text-[20px]" : "text-[23px]"
                            }`}
                          >
                            {item.blurb}
                          </p>
                        </div>
                        <TrackVisual
                          slot={slot}
                          ink={ink}
                          rule={rule}
                          size={135}
                          is2x
                          className="h-[230px] w-[210px]"
                        />
                      </div>

                      {/* Exact Desktop Bottom Row */}
                      <div className="flex min-h-[38px] items-end justify-end font-rotonto">
                        {"label" in item && item.label ? (
                          <span
                            className="rounded-full px-[20px] py-[6px] text-[18px] font-bold uppercase tracking-normal"
                            style={{ background: ink, color }}
                          >
                            {item.label}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center p-[48px]"
                      style={{ color: ink }}
                    >
                      <TrackCardLogo className="w-[52%] max-w-[380px] h-auto" />
                    </div>
                  )}
                </TrackCard>
              </div>
            );
          })}
        </div>

        {/* Track Navigation Counter at bottom */}
        <div
          role="tablist"
          aria-label="Track navigation"
          className="pointer-events-auto absolute bottom-6 sm:bottom-8 inset-x-0 mx-auto flex items-center justify-between w-full max-w-[420px] px-6 font-rotonto text-[#fa1a1d] select-none z-80"
        >
          <span className="text-[11px] sm:text-[12px] uppercase tracking-[0.38em] font-bold">
            Tracks
          </span>

          <div className="flex items-center gap-[5px] py-1">
            {TRACKS.items.map((item, i) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={i === activeTrack}
                aria-label={`Scroll to Track ${i + 1}: ${item.title}`}
                onClick={() => scrollToTrack(i)}
                className="group relative flex h-[24px] w-[18px] items-center justify-center cursor-pointer focus-visible:outline-none"
              >
                <span
                  className="block h-[3px] rounded-full bg-current transition-all duration-300"
                  style={{
                    width: i === activeTrack ? "20px" : "10px",
                    opacity: i === activeTrack ? 1 : 0.28,
                  }}
                />
              </button>
            ))}
          </div>

          <span className="text-[12px] sm:text-[13px] tracking-[0.2em] tabular-nums font-bold">
            #{activeTrack + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
