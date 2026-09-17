"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { TRACK_COLORS, trackInk } from "./TrackCard";
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll the active pill tab into view
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeTab = tabsContainerRef.current.querySelector<HTMLElement>(
      `[data-tab-index="${activeIndex}"]`
    );
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  // Touch Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
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
      {/* 1. Horizontal Scrollable Track Category Selector Pills */}
      <div
        ref={tabsContainerRef}
        className="w-full flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar px-1"
      >
        {TRACKS.items.map((item, i) => {
          const isActive = i === activeIndex;
          const shortTitle = item.title.split(" ")[0];

          return (
            <button
              key={item.title}
              type="button"
              data-tab-index={i}
              onClick={() => goToTrack(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-rotonto text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#fa1a1d] text-white shadow-md scale-[1.02]"
                  : "bg-neutral-900/90 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              <span className={isActive ? "text-white/80" : "text-[#fa1a1d]"}>
                0{i + 1}
              </span>
              <span className="truncate max-w-[130px] uppercase">
                {item.title.length > 18 ? `${shortTitle}...` : item.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Tactile Track Card Stage */}
      <div
        className="relative w-full max-w-[390px] h-[390px] sm:h-[400px] mt-2 cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Decorative Stack Cards Behind for Tactile Physical Look */}
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

        {/* Main Animated Track Card */}
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{
              opacity: 0,
              x: direction > 0 ? 60 : -60,
              scale: 0.96,
              rotate: direction > 0 ? 2 : -2,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              rotate: 0,
            }}
            exit={{
              opacity: 0,
              x: direction > 0 ? -60 : 60,
              scale: 0.96,
              rotate: direction > 0 ? -2 : 2,
            }}
            transition={{
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 rounded-[22px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-black/15"
            style={{
              backgroundColor: currentColor,
              color: ink,
            }}
          >
            {/* Subtle top edge specular highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/30 pointer-events-none" />

            {/* Top Row: Track Index, Badge & Geometric Visual */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-start gap-1">
                <span className="font-rotonto text-[11px] tracking-widest font-bold opacity-75">
                  #0{activeIndex + 1}
                </span>
                {"label" in currentTrack ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-rotonto text-[9.5px] font-bold uppercase tracking-wide shadow-xs"
                    style={{ background: ink, color: currentColor }}
                  >
                    {currentTrack.label}
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2 py-0.5 font-rotonto text-[9px] font-bold uppercase tracking-wide border opacity-75"
                    style={{ borderColor: rule }}
                  >
                    TRACK 0{activeIndex + 1}
                  </span>
                )}
              </div>

              {/* Signature Track Visual Icon */}
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: rule }}
              >
                <TrackVisual
                  slot={activeIndex}
                  ink={ink}
                  rule={rule}
                  size={36}
                  className="size-[36px]"
                />
              </div>
            </div>

            {/* Middle Section: Title & Blurb */}
            <div className="my-auto pt-1">
              <h3 className="font-rotonto font-bold text-[19px] sm:text-[21px] leading-[1.14] tracking-tight uppercase">
                {currentTrack.title}
              </h3>

              <div
                className="my-2.5 w-full h-[1px]"
                style={{ backgroundColor: rule }}
              />

              <p className="font-rotonto text-[12px] sm:text-[13px] leading-relaxed text-justify opacity-90 line-clamp-5">
                {currentTrack.blurb}
              </p>
            </div>

            {/* Bottom Row: Tags & Counter */}
            <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: rule }}>
              {/* Tags Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {"tags" in currentTrack &&
                  currentTrack.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md font-rotonto text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: rule,
                        color: ink,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <span className="font-rotonto text-[10px] font-bold opacity-60 shrink-0">
                0{activeIndex + 1} / 0{COUNT}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Bottom Controls Bar (Prev Button, 6 Indicator Dots, Next Button) */}
      <div className="mt-5 flex items-center justify-between w-full max-w-[390px] px-1">
        {/* Left Prev Key Button */}
        <KeyButton
          color="blue"
          size="compact"
          className="w-[52px] sm:w-[58px]"
          onClick={handlePrev}
          aria-label="Previous track"
          title="Previous track"
        >
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </KeyButton>

        {/* 6 Track Indicator Bars */}
        <div className="flex items-center gap-1.5">
          {TRACKS.items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToTrack(i)}
              aria-label={`Go to track ${i + 1}`}
              className={`h-1.5 transition-all duration-300 cursor-pointer rounded-full ${
                i === activeIndex
                  ? "w-7 bg-[#fa1a1d]"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Right Next Key Button */}
        <KeyButton
          color="blue"
          size="compact"
          className="w-[52px] sm:w-[58px]"
          onClick={handleNext}
          aria-label="Next track"
          title="Next track"
        >
          <ChevronRight size={20} className="stroke-[2.5]" />
        </KeyButton>
      </div>
    </div>
  );
}
