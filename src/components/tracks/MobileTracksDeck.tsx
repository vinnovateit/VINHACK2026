"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { TRACK_COLORS, TrackAsterisk, trackInk } from "./TrackCard";
import { TrackVisual } from "./TrackIcons";
import { TRACKS } from "@/content/site";
import KeyButton from "@/components/ui/KeyButton";

const CARD_COLORS = [
  TRACK_COLORS.grey,
  TRACK_COLORS.pink,
  TRACK_COLORS.red,
  TRACK_COLORS.darkBlue,
  TRACK_COLORS.lightBlue,
  TRACK_COLORS.white,
] as const;

const COUNT = TRACKS.items.length;

export default function MobileTracksDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToTrack = useCallback(
    (index: number) => {
      const next = (index + COUNT) % COUNT;
      setDirection(next > activeIndex ? 1 : -1);
      setActiveIndex(next);
    },
    [activeIndex]
  );

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + COUNT) % COUNT);
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % COUNT);
  }, []);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentTrack = TRACKS.items[activeIndex];
  const currentColor = CARD_COLORS[activeIndex % CARD_COLORS.length];
  const { ink, rule } = trackInk(currentColor);
  const nextColor = CARD_COLORS[(activeIndex + 1) % CARD_COLORS.length];
  const prevColor = CARD_COLORS[(activeIndex - 1 + CARD_COLORS.length) % CARD_COLORS.length];

  return (
    <div className="relative w-full my-6 flex flex-col items-center select-none">
      {/* Card Stage */}
      <div
        className="relative w-full max-w-[420px] h-[300px] sm:h-[320px] cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Decorative stack cards */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[22px] border border-black/15 shadow-md pointer-events-none transform translate-x-[6px] translate-y-[-6px] rotate-[2deg] opacity-75"
          style={{ backgroundColor: nextColor }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-[22px] border border-black/15 shadow-md pointer-events-none transform translate-x-[-6px] translate-y-[6px] rotate-[-2deg] opacity-60"
          style={{ backgroundColor: prevColor }}
        />

        {/* Main animated card */}
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60, scale: 0.96, rotate: direction > 0 ? 2 : -2 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60, scale: 0.96, rotate: direction > 0 ? -2 : 2 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-[22px] overflow-hidden shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7),0_8px_18px_rgba(0,0,0,0.3),inset_0_1.5px_0_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_0_0_1.2px_rgba(0,0,0,0.12)] border border-black/15 flex flex-col justify-between px-5 py-4 sm:px-6 sm:py-5"
            style={{ backgroundColor: currentColor, color: ink }}
          >
            {/* Skeumorphic light sheen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-white/5 to-black/10" aria-hidden />

            {/* Specular top edge */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

            {/* Top: track number + asterisk */}
            <div className="flex items-start justify-between">
              <span className="font-rotonto text-[13px] tracking-[0.2em] tabular-nums">
                #{activeIndex + 1}
              </span>
              <TrackAsterisk size={18} />
            </div>

            {/* Middle: title + blurb + visual */}
            <div className="flex items-start gap-3 flex-1 py-2">
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-rotonto font-bold uppercase leading-[1.12] tracking-tight ${
                    currentTrack.title.length > 30
                      ? "text-[15px]"
                      : currentTrack.title.length > 20
                        ? "text-[17px]"
                        : "text-[20px]"
                  }`}
                >
                  {currentTrack.title}
                </h3>
                <p className="mt-2 font-rotonto text-[11px] sm:text-[12px] leading-relaxed opacity-90 line-clamp-4 text-justify">
                  {currentTrack.blurb}
                </p>
              </div>
              <TrackVisual
                slot={activeIndex}
                ink={ink}
                rule={rule}
                size={44}
                className="shrink-0 size-[44px] mt-0.5"
              />
            </div>

            {/* Bottom: label badge only (if present) */}
            <div className="flex items-end justify-end min-h-[28px]">
              {"label" in currentTrack ? (
                <span
                  className="rounded-full px-3 py-1 font-rotonto text-[10px] font-bold uppercase tracking-wide shadow-[0_3px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] border border-white/20"
                  style={{ background: ink, color: currentColor }}
                >
                  {currentTrack.label}
                </span>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls: prev dots next */}
      <div className="mt-5 flex items-center justify-between w-full max-w-[420px] px-1">
        <KeyButton
          color="blue"
          size="compact"
          className="w-[52px] sm:w-[58px]"
          onClick={handlePrev}
          aria-label="Previous track"
        >
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </KeyButton>

        <div className="flex items-center gap-1.5">
          {TRACKS.items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToTrack(i)}
              aria-label={`Go to track ${i + 1}`}
              className={`h-1.5 transition-all duration-300 cursor-pointer rounded-full ${
                i === activeIndex ? "w-7 bg-[#fa1a1d]" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <KeyButton
          color="blue"
          size="compact"
          className="w-[52px] sm:w-[58px]"
          onClick={handleNext}
          aria-label="Next track"
        >
          <ChevronRight size={20} className="stroke-[2.5]" />
        </KeyButton>
      </div>
    </div>
  );
}
