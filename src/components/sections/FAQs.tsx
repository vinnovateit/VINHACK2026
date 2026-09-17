"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { FAQS, type FaqCategory } from "@/content/site";

export default function FAQsSection() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory | null>(null);
  const [openingCardId, setOpeningCardId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [flickState, setFlickState] = useState<{ outgoingIndex: number; phase: "out" | "return" } | null>(null);

  const handleOpen = (category: FaqCategory) => {
    if (openingCardId) return;
    setOpeningCardId(category.id);
    setCardIndex(0);
    setFlickState(null);
    setIsOpen(false);
    setActiveCategory(category);

    // Guaranteed paint cycle so the browser animates from initial to open state
    setTimeout(() => {
      setIsOpen(true);
    }, 40);
  };

  const handleClose = () => {
    if (!isOpen) return;
    setIsOpen(false);
    setTimeout(() => {
      setActiveCategory(null);
      setOpeningCardId(null);
      setFlickState(null);
    }, 380);
  };

  const handleNext = () => {
    if (!activeCategory || flickState) return;
    const currentIdx = cardIndex;
    const nextIdx = (currentIdx + 1) % activeCategory.questions.length;

    // Phase 1: Slide out to the right in front (zIndex: 50)
    setFlickState({ outgoingIndex: currentIdx, phase: "out" });

    setTimeout(() => {
      // Phase 2: Switch active index and slide back behind the stack (zIndex: 1)
      setCardIndex(nextIdx);
      setFlickState({ outgoingIndex: currentIdx, phase: "return" });

      setTimeout(() => {
        setFlickState(null);
      }, 260);
    }, 220);
  };

  const handlePrev = () => {
    if (!activeCategory || flickState) return;
    setCardIndex((prev) => (prev - 1 + activeCategory.questions.length) % activeCategory.questions.length);
  };

  // Keyboard navigation for card deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCategory) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCategory, flickState, isOpen]);

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="-translate-x-1/2 absolute bg-black h-[680px] left-1/2 overflow-clip top-[8512px] w-[1280px] font-rotonto select-none"
      data-name="FAQS"
    >
      {/* Section Header & Red Underline */}
      <div className="absolute top-[44px] left-[110px] right-[110px] h-[34px] text-left pointer-events-auto">
        <h2 className="absolute top-0 left-0 font-rotonto font-light text-[22px] text-[#fa1a1d] tracking-[0.05em] uppercase">
          {FAQS.heading}
        </h2>
        <div className="absolute top-[32px] left-0 right-0 border-t-[1.2px] border-[#fa1a1d] h-[1.2px]" />
      </div>

      {/* 4 Cards Row */}
      <div className="absolute top-[90px] left-1/2 -translate-x-1/2 flex items-end justify-center gap-[28px]">
        {FAQS.categories.map((category) => {
          const titleColorClass = "text-black";
          const frontPaper = category.questions[0];
          const secondPaper = category.questions[1];

          return (
            <div
              key={category.id}
              onClick={() => handleOpen(category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpen(category);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${category.subtitle} FAQs`}
              className={`group relative h-[420px] w-[244px] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fa1a1d] ${
                openingCardId === category.id ? "scale-[1.04] -translate-y-4 shadow-2xl z-20" : ""
              }`}
            >
              {/* === Pocket Back Frame Plate (Curved Corners) === */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[350px] rounded-[22px] border-[0.8px] border-black transition-all duration-300 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)]"
                style={{ backgroundColor: category.color }}
              />

              {/* === Exactly 4 Fanned Paper Sheets Inside Pocket (Dynamic Group Hover Fanning) === */}
              <div className={`absolute bottom-[25px] left-0 right-0 h-[375px] pointer-events-none transition-transform duration-300 ease-out ${
                openingCardId === category.id ? "-translate-y-20" : ""
              }`}>
                {/* Sheet 1 */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-8 left-[23px] w-[198px] h-[300px] bg-[#f5f6f3] border border-neutral-300/80 shadow-sm rounded-[20px] rotate-[2.5deg] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-6 group-hover:rotate-[4deg]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)",
                  }}
                />

                {/* Sheet 2 */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-4 left-[23px] w-[198px] h-[302px] bg-[#f8f9f6] border border-neutral-300/90 shadow-sm rounded-[20px] rotate-[1deg] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-8 group-hover:rotate-[2deg]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)",
                  }}
                />

                {/* Sheet 3 */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-3 left-[23px] w-[198px] h-[300px] bg-[#f8f9f6] border border-neutral-300/80 shadow-sm rounded-[20px] rotate-[-1deg] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-7 group-hover:rotate-[-2deg]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)",
                  }}
                />

                {/* Sheet 4 (Front Main Paper Sheet) */}
                <div className="absolute bottom-1 left-[22px] w-[200px] h-[305px] bg-[#fdfdfb] border border-neutral-300/95 shadow-md rounded-[20px] rotate-[-2.5deg] origin-bottom overflow-hidden flex flex-col justify-start transition-transform duration-300 ease-out group-hover:-translate-y-9 group-hover:rotate-[-4deg] group-hover:shadow-xl">
                  {/* Header Row */}
                  <div className="pt-2.5 px-3">
                    <div className="text-center font-rotonto text-[10px] tracking-wide text-neutral-700 uppercase">
                      {category.subtitle}
                    </div>
                  </div>

                  {/* Cyan Divider */}
                  <div className="mt-1.5 border-t border-[#8cd6ee]" />

                  {/* Main Question */}
                  <div className="px-3 py-1.5 font-rotonto font-semibold text-[13px] leading-[1.2] text-black">
                    1. {frontPaper.q}
                  </div>

                  {/* Cyan Divider */}
                  <div className="border-t border-[#8cd6ee]" />

                  {/* Table area with left FAQS column and content column */}
                  <div className="flex-1 flex border-b border-[#8cd6ee]">
                    {/* Left "FAQS" column */}
                    <div className="w-[44px] shrink-0 border-r border-[#8cd6ee] pt-2 px-1.5 flex flex-col items-center">
                      <span className="font-rotonto text-[9px] tracking-wider text-neutral-600 uppercase">
                        FAQS
                      </span>
                    </div>

                    {/* Right column: Bullet rows */}
                    <div className="flex-1 flex flex-col">
                      {/* Row 1 */}
                      <div className="p-2 border-b border-[#8cd6ee] flex items-start gap-2 min-h-[44px]">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-black shrink-0 mt-0.5" />
                        <span className="font-rotonto text-[10px] leading-[1.3] text-black line-clamp-2">
                          {frontPaper.a}
                        </span>
                      </div>

                      {/* Row 2 */}
                      {secondPaper && (
                        <div className="p-2 border-b border-[#8cd6ee] flex items-start gap-2 min-h-[44px]">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-black shrink-0 mt-0.5" />
                          <span className="font-rotonto text-[10px] leading-[1.3] text-black line-clamp-2">
                            {secondPaper.a}
                          </span>
                        </div>
                      )}

                      {/* Cyan Ruled Lines extending to bottom */}
                      <div
                        className="flex-1"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === Pocket Front (Curved Bottom, Clean Diagonal Cut & Bottom Separator Line) === */}
              <div className="absolute bottom-0 left-0 right-0 h-[268px] pointer-events-none">
                <svg
                  viewBox="0 0 244 268"
                  fill="none"
                  className="w-full h-full block"
                >
                  {/* Pocket Flap: diagonal cut from mid-left to top-right ledge, smooth curved bottom */}
                  <path
                    d="M 0 152 L 170 20 H 244 V 246 A 22 22 0 0 1 222 268 H 22 A 22 22 0 0 1 0 246 Z"
                    fill={category.color}
                  />
                  <path
                    d="M 0 152 L 170 20 H 244 V 246 A 22 22 0 0 1 222 268 H 22 A 22 22 0 0 1 0 246 Z"
                    stroke="#000000"
                    strokeWidth="0.8"
                  />
                  {/* Thin Bottom Line across above curve */}
                  <line
                    x1="14"
                    y1="238"
                    x2="230"
                    y2="238"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth="0.8"
                  />
                </svg>

                {/* Pocket Front Title (Large, Right-aligned) */}
                <div
                  className={`absolute bottom-[62px] right-[16px] font-rotonto font-light text-[34px] leading-[0.86] text-right uppercase tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5 ${titleColorClass}`}
                >
                  {category.title[0]}
                  <br />
                  {category.title[1]}
                  <br />
                  {category.title[2]}
                </div>

                {/* Subtitle above bottom line (Right-aligned) */}
                <div
                  className={`absolute bottom-[38px] right-[16px] font-rotonto font-light text-[12.5px] text-right tracking-wide lowercase ${titleColorClass}`}
                >
                  {category.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE STACK OF PAGES (SLIDES OUT OF FOLDER WITH QUESTIONS & ARROWS) */}
      {/* ========================================================================= */}
      {activeCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCategory.subtitle} Frequently Asked Questions`}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 cursor-default ${
            isOpen
              ? "bg-black/90 opacity-100 transition-opacity duration-300 ease-out"
              : "bg-black/0 opacity-0 transition-opacity duration-300 ease-in pointer-events-none"
          }`}
          onClick={handleClose}
        >
          {/* Interactive Stack Deck Container with Side Navigation Arrows */}
          <div className="relative flex items-center justify-center gap-6 sm:gap-10 w-full max-w-[800px]">
            {/* Left Key Button */}
            <div
              className={`transition-all duration-350 shrink-0 z-40 ${
                isOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 -translate-x-8 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <KeyButton
                color="blue"
                size="compact"
                className="w-[52px] sm:w-[58px]"
                onClick={() => handlePrev()}
                aria-label="Previous question"
                title="Previous question (←)"
              >
                <ChevronLeft size={22} className="stroke-[2.5]" />
              </KeyButton>
            </div>

            {/* === The Stack of Pages (Clicking paper advances to next) === */}
            {(() => {
              const catIdx = activeCategory ? FAQS.categories.findIndex((c) => c.id === activeCategory.id) : 0;
              const FOLDER_X_OFFSETS = [-408, -136, 136, 408];
              const folderX = catIdx >= 0 && catIdx < 4 ? FOLDER_X_OFFSETS[catIdx] : 0;

              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  style={{
                    transform: isOpen
                      ? "translate3d(0px, 0px, 0px) scale(1) rotate(0deg)"
                      : `translate3d(${folderX}px, 380px, 0px) scale(0.35) rotate(-3deg)`,
                    opacity: isOpen ? 1 : 0,
                    transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 380ms ease-in-out",
                  }}
                  className="relative w-[340px] sm:w-[480px] h-[460px] sm:h-[480px] cursor-pointer"
                >
                  {/* Close Key Button Attached Right Above Paper */}
                  <div
                    className={`absolute -top-14 sm:-top-16 right-0 z-50 transition-all duration-200 ${
                      isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 -translate-y-3 pointer-events-none"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <KeyButton
                      color="red"
                      size="compact"
                      className="w-[112px] sm:w-[124px]"
                      icon={<X size={16} className="stroke-[2.5]" />}
                      onClick={handleClose}
                      aria-label="Close"
                    >
                      CLOSE
                    </KeyButton>
                  </div>
              {activeCategory.questions.map((faq, idx) => {
                const total = activeCategory.questions.length;
                const diff = (idx - cardIndex + total) % total;
                const isOutgoing = flickState?.outgoingIndex === idx;

                let transformStyle = "translate(0px, 0px) rotate(0deg) scale(1)";
                let zIndex = 10;
                let opacity = 1;
                let transitionStyle = "all 260ms cubic-bezier(0.2,0.9,0.3,1.15)";

                if (!isOpen) {
                  transformStyle = "translate(0px, 0px) rotate(0deg) scale(0.96)";
                  opacity = diff === 0 ? 1 : 0.85;
                  zIndex = 10;
                } else if (isOutgoing) {
                  if (flickState.phase === "out") {
                    transformStyle = "translate(380px, -45px) rotate(22deg) scale(0.96)";
                    zIndex = 50; // In front while sliding out
                    opacity = 1;
                    transitionStyle = "transform 220ms ease-out";
                  } else {
                    // phase === "return" -> switch z-index to 1 (behind deck) and slide into bottom slot
                    transformStyle = "translate(8px, -38px) rotate(5.5deg) scale(0.91)";
                    zIndex = 1; // Behind entire stack!
                    opacity = 1;
                    transitionStyle = "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)";
                  }
                } else if (flickState?.phase === "out") {
                  if (diff === 1) {
                    zIndex = 30;
                    transformStyle = "translate(0px, 0px) rotate(0deg) scale(1)";
                  } else if (diff === 2) {
                    zIndex = 20;
                    transformStyle = "translate(14px, -14px) rotate(3.2deg) scale(0.97)";
                  } else if (diff === 3) {
                    zIndex = 10;
                    transformStyle = "translate(-14px, -26px) rotate(-3.5deg) scale(0.94)";
                  } else {
                    zIndex = 0;
                    opacity = 0;
                    transformStyle = "translate(8px, -38px) rotate(5.5deg) scale(0.91)";
                  }
                } else {
                  // Normal resting stack
                  if (diff === 0) {
                    zIndex = 30;
                    transformStyle = "translate(0px, 0px) rotate(0deg) scale(1)";
                  } else if (diff === 1) {
                    zIndex = 20;
                    transformStyle = "translate(14px, -14px) rotate(3.2deg) scale(0.97)";
                  } else if (diff === 2) {
                    zIndex = 10;
                    transformStyle = "translate(-14px, -26px) rotate(-3.5deg) scale(0.94)";
                  } else if (diff === 3) {
                    zIndex = 5;
                    transformStyle = "translate(8px, -38px) rotate(5.5deg) scale(0.91)";
                  } else {
                    zIndex = 0;
                    opacity = 0;
                    transformStyle = "translate(8px, -38px) rotate(5.5deg) scale(0.91)";
                  }
                }

                if (diff > 3 && !isOutgoing) return null;

                const isTop = diff === 0 && !flickState;

                return (
                  <div
                    key={faq.q}
                    style={{
                      transform: transformStyle,
                      zIndex,
                      opacity,
                      transition: transitionStyle,
                    }}
                    className={`absolute inset-0 bg-[#fdfdfb] border border-neutral-400 rounded-[20px] shadow-2xl overflow-hidden flex flex-col justify-start select-none ${
                      isTop ? "cursor-pointer hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]" : "pointer-events-none"
                    }`}
                  >
                    {/* Page Header */}
                    <div className="pt-3 px-4 sm:px-6 flex items-center justify-between border-b border-[#8cd6ee]">
                      <span className="font-rotonto text-[11px] tracking-wider text-neutral-600 uppercase">
                        FAQ
                      </span>
                      <span className="font-rotonto text-[11px] font-bold text-neutral-800 uppercase tracking-wide">
                        {activeCategory.subtitle}
                      </span>
                    </div>

                    {/* Main Question Display */}
                    <div className="px-4 sm:px-6 py-4 border-b border-[#8cd6ee] bg-white">
                      <h3 className="font-rotonto font-bold text-[18px] sm:text-[22px] leading-snug text-black">
                        {idx + 1}. {faq.q}
                      </h3>
                    </div>

                    {/* Table Answer Area with Blueprint Grid */}
                    <div className="flex-1 flex overflow-hidden">
                      {/* Left "FAQS" Column */}
                      <div className="w-[58px] sm:w-[70px] shrink-0 border-r border-[#8cd6ee] pt-4 px-2 flex flex-col items-center bg-neutral-50/50">
                        <span className="font-rotonto text-[11px] font-bold tracking-widest text-neutral-700 uppercase -rotate-90 sm:rotate-0 my-auto sm:my-0">
                          FAQS
                        </span>
                      </div>

                      {/* Right Column: Detailed Answer Content */}
                      <div
                        className="flex-1 p-4 sm:p-6 flex flex-col justify-start overflow-y-auto"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(140, 214, 238, 0.32) 18px, rgba(140, 214, 238, 0.32) 19px)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-block w-3 h-3 rounded-full bg-black shrink-0 mt-1" />
                          <p className="font-rotonto text-[14px] sm:text-[16px] leading-relaxed text-black font-medium">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            );
            })()}

            {/* Right Key Button */}
            <div
              className={`transition-all duration-350 shrink-0 z-40 ${
                isOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 translate-x-8 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <KeyButton
                color="blue"
                size="compact"
                className="w-[52px] sm:w-[58px]"
                onClick={() => handleNext()}
                aria-label="Next question"
                title="Next question (→)"
              >
                <ChevronRight size={22} className="stroke-[2.5]" />
              </KeyButton>
            </div>
          </div>

          {/* Bottom Pagination Dots */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mt-6 flex flex-col items-center gap-2 transition-all duration-300 ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2">
              {activeCategory.questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCardIndex(i);
                  }}
                  aria-label={`Go to question ${i + 1}`}
                  className={`h-2 transition-all duration-300 cursor-pointer ${
                    i === cardIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
