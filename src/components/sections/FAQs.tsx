"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { FAQS, type FaqCategory } from "@/content/site";

export default function FAQsSection() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [flickState, setFlickState] = useState<{ outgoingIndex: number; direction: 1 | -1; phase: "out" | "return" } | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const folderRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => setMounted(true), []);

  const handleOpen = useCallback((category: FaqCategory) => {
    if (isOpen) return;
    const el = folderRefs.current.get(category.id);
    if (el) {
      const r = el.getBoundingClientRect();
      setOrigin({
        x: (r.left + r.width / 2) - window.innerWidth / 2,
        y: (r.top + r.height / 2) - window.innerHeight / 2,
      });
    } else {
      setOrigin(null);
    }
    setCardIndex(0);
    setFlickState(null);
    setActiveCategory(category);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
  }, [isOpen]);

  const distance = origin ? Math.hypot(origin.x, origin.y) : 250;
  // Distance-scaled travel duration: 150ms minimum up to ~420ms for cards travelling from far edges
  const travelDuration = Math.round(Math.min(420, Math.max(150, 150 + distance * 0.35)));
  const opacityDuration = Math.round(travelDuration * 0.75);

  const handleClose = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    setTimeout(() => {
      setActiveCategory(null);
      setFlickState(null);
      setOrigin(null);
    }, travelDuration + 20);
  }, [isOpen, travelDuration]);

  const handleNext = useCallback(() => {
    if (!activeCategory || flickState) return;
    const currentIdx = cardIndex;
    const nextIdx = (currentIdx + 1) % activeCategory.questions.length;
    setFlickState({ outgoingIndex: currentIdx, direction: 1, phase: "out" });
    setTimeout(() => {
      setCardIndex(nextIdx);
      setFlickState({ outgoingIndex: currentIdx, direction: 1, phase: "return" });
      setTimeout(() => setFlickState(null), 150);
    }, 150);
  }, [activeCategory, cardIndex, flickState]);

  const handlePrev = useCallback(() => {
    if (!activeCategory || flickState) return;
    const currentIdx = cardIndex;
    const prevIdx = (currentIdx - 1 + activeCategory.questions.length) % activeCategory.questions.length;
    setFlickState({ outgoingIndex: currentIdx, direction: -1, phase: "out" });
    setTimeout(() => {
      setCardIndex(prevIdx);
      setFlickState({ outgoingIndex: currentIdx, direction: -1, phase: "return" });
      setTimeout(() => setFlickState(null), 150);
    }, 150);
  }, [activeCategory, cardIndex, flickState]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeCategory) return;
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); handleNext(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCategory, handleClose, handleNext, handlePrev]);

  // Complete scroll lock when open
  useEffect(() => {
    if (!isOpen) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest(".overflow-y-auto")) {
        e.preventDefault();
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest(".overflow-y-auto")) {
        if (e.cancelable) e.preventDefault();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.body.style.touchAction = prevTouchAction;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [isOpen]);

  const closedTransform = origin
    ? `translate3d(${origin.x.toFixed(1)}px, ${origin.y.toFixed(1)}px, 0px) scale(0.32) rotate(-3deg)`
    : `translate3d(0px, 200px, 0px) scale(0.32) rotate(-3deg)`;

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
              ref={(node) => {
                if (node) folderRefs.current.set(category.id, node);
                else folderRefs.current.delete(category.id);
              }}
              onClick={() => handleOpen(category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpen(category); }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${category.subtitle} FAQs`}
              className="group relative h-[420px] w-[244px] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fa1a1d]"
            >
              {/* Pocket Back Frame Plate */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[350px] rounded-[22px] border-[0.8px] border-black transition-all duration-300 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)]"
                style={{ backgroundColor: category.color }}
              />

              {/* Fanned Paper Sheets */}
              <div className="absolute bottom-[25px] left-0 right-0 h-[375px] pointer-events-none">
                <div aria-hidden className="absolute bottom-8 left-[23px] w-[198px] h-[300px] bg-[#f5f6f3] border border-neutral-300/80 shadow-sm rounded-[20px] rotate-[2.5deg] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-6 group-hover:rotate-[4deg]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)" }} />
                <div aria-hidden className="absolute bottom-4 left-[23px] w-[198px] h-[302px] bg-[#f8f9f6] border border-neutral-300/90 shadow-sm rounded-[20px] rotate-[1deg] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-8 group-hover:rotate-[2deg]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)" }} />
                <div aria-hidden className="absolute bottom-3 left-[23px] w-[198px] h-[300px] bg-[#f8f9f6] border border-neutral-300/80 shadow-sm rounded-[20px] rotate-[-1deg] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-7 group-hover:rotate-[-2deg]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)" }} />
                {/* Sheet 4 (Front Main Paper Sheet) */}
                <div className="absolute bottom-1 left-[22px] w-[200px] h-[305px] bg-[#fdfdfb] border border-neutral-300/95 shadow-md rounded-[20px] rotate-[-2.5deg] origin-bottom overflow-hidden flex flex-col justify-start transition-transform duration-300 ease-out group-hover:-translate-y-9 group-hover:rotate-[-4deg] group-hover:shadow-xl">
                  <div className="pt-2.5 px-3">
                    <div className="text-center font-rotonto text-[10px] tracking-wide text-neutral-700 uppercase">{category.subtitle}</div>
                  </div>
                  <div className="mt-1.5 border-t border-[#8cd6ee]" />
                  <div className="px-3 py-1.5 font-rotonto font-semibold text-[13px] leading-[1.2] text-black">1. {frontPaper.q}</div>
                  <div className="border-t border-[#8cd6ee]" />
                  <div className="flex-1 flex border-b border-[#8cd6ee]">
                    <div className="w-[44px] shrink-0 border-r border-[#8cd6ee] pt-2 px-1.5 flex flex-col items-center">
                      <span className="font-rotonto text-[9px] tracking-wider text-neutral-600 uppercase">FAQS</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="p-2 border-b border-[#8cd6ee] flex items-start gap-2 min-h-[44px]">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-black shrink-0 mt-0.5" />
                        <span className="font-rotonto text-[10px] leading-[1.3] text-black line-clamp-2">{frontPaper.a}</span>
                      </div>
                      {secondPaper && (
                        <div className="p-2 border-b border-[#8cd6ee] flex items-start gap-2 min-h-[44px]">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-black shrink-0 mt-0.5" />
                          <span className="font-rotonto text-[10px] leading-[1.3] text-black line-clamp-2">{secondPaper.a}</span>
                        </div>
                      )}
                      <div className="flex-1" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.35) 15px, rgba(140, 214, 238, 0.35) 16px)" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pocket Front Flap */}
              <div className="absolute bottom-0 left-0 right-0 h-[268px] pointer-events-none">
                <svg viewBox="0 0 244 268" fill="none" className="w-full h-full block">
                  <path d="M 0 152 L 170 20 H 244 V 246 A 22 22 0 0 1 222 268 H 22 A 22 22 0 0 1 0 246 Z" fill={category.color} />
                  <path d="M 0 152 L 170 20 H 244 V 246 A 22 22 0 0 1 222 268 H 22 A 22 22 0 0 1 0 246 Z" stroke="#000000" strokeWidth="0.8" />
                  <line x1="14" y1="238" x2="230" y2="238" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
                </svg>
                <div className={`absolute bottom-[44px] right-[16px] font-rotonto font-light text-[34px] leading-[0.86] text-right uppercase tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5 ${titleColorClass}`}>
                  {category.title[0]}<br />{category.title[1]}<br />{category.title[2]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal — portalled to body, full-screen, origin-accurate */}
      {mounted && activeCategory && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCategory.subtitle} Frequently Asked Questions`}
          style={{ transitionDuration: `${travelDuration}ms` }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 cursor-default touch-none ${
            isOpen
              ? "bg-black/90 transition-[background-color] ease-out"
              : "bg-black/0 transition-[background-color] ease-in pointer-events-none"
          }`}
          onClick={handleClose}
        >
          <div className="relative flex items-center justify-center gap-6 sm:gap-10 w-full max-w-[800px]">
            {/* Left Key Button */}
            <div
              className={`transition-all duration-150 shrink-0 z-40 ${isOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 -translate-x-8 pointer-events-none"}`}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <KeyButton color="blue" size="compact" className="w-[52px] sm:w-[58px]" onClick={handlePrev} aria-label="Previous question" title="Previous question (←)">
                <ChevronLeft size={22} className="stroke-[2.5]" />
              </KeyButton>
            </div>

            {/* Card stack — animated from measured origin */}
            <div
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              style={{
                transform: isOpen
                  ? "translate3d(0px, 0px, 0px) scale(1) rotate(0deg)"
                  : closedTransform,
                opacity: isOpen ? 1 : 0,
                transition: isOpen
                  ? `transform ${travelDuration}ms cubic-bezier(0.32, 0.72, 0, 1), opacity ${opacityDuration}ms ease-out`
                  : `transform ${travelDuration}ms cubic-bezier(0.55, 0, 1, 0.45), opacity ${opacityDuration}ms ease-in`,
              }}
              className="relative w-[340px] sm:w-[480px] h-[460px] sm:h-[480px] cursor-pointer"
            >
              {/* Close button */}
              <div
                className={`absolute -top-14 sm:-top-16 right-0 z-50 transition-all duration-200 ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 -translate-y-3 pointer-events-none"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClose();
                }}
              >
                <KeyButton color="red" size="compact" className="w-[112px] sm:w-[124px]" icon={<X size={16} className="stroke-[2.5]" />} onClick={handleClose} aria-label="Close">
                  CLOSE
                </KeyButton>
              </div>

              {/* Cards */}
              {activeCategory.questions.map((faq, idx) => {
                const total = activeCategory.questions.length;
                const diff = (idx - cardIndex + total) % total;
                const isOutgoing = flickState?.outgoingIndex === idx;
                const dir = flickState?.direction ?? 1;

                let transform = "translate(0px, 0px) rotate(0deg) scale(1)";
                let zIndex = 10;
                let opacity = 1;
                let transition = "all 150ms cubic-bezier(0.32, 0.72, 0, 1)";

                if (!isOpen) {
                  transform = "translate(0px, 0px) rotate(0deg) scale(0.96)";
                  opacity = diff === 0 ? 1 : 0.85;
                } else if (isOutgoing) {
                  if (flickState!.phase === "out") {
                    // Fly out in the direction of travel
                    transform = `translate(${dir > 0 ? 380 : -380}px, -45px) rotate(${dir > 0 ? 22 : -22}deg) scale(0.96)`;
                    zIndex = 50;
                    opacity = 1;
                    transition = "transform 150ms cubic-bezier(0.55, 0, 1, 0.45)";
                  } else {
                    // Return to back of stack
                    transform = "translate(8px, -38px) rotate(5.5deg) scale(0.91)";
                    zIndex = 1;
                    transition = "transform 150ms cubic-bezier(0.32, 0.72, 0, 1)";
                  }
                } else if (flickState?.phase === "out") {
                  if (dir < 0 && diff === 0) {
                    // Prev: incoming top card from left
                    zIndex = 35;
                    transform = "translate(-80px, 0px) rotate(-4deg) scale(0.96)";
                    transition = "transform 150ms cubic-bezier(0.32, 0.72, 0, 1)";
                  } else if (diff === 1) { zIndex = 30; transform = "translate(0px, 0px) rotate(0deg) scale(1)"; }
                  else if (diff === 2) { zIndex = 20; transform = "translate(14px, -14px) rotate(3.2deg) scale(0.97)"; }
                  else if (diff === 3) { zIndex = 10; transform = "translate(-14px, -26px) rotate(-3.5deg) scale(0.94)"; }
                  else { zIndex = 0; opacity = 0; transform = "translate(8px, -38px) rotate(5.5deg) scale(0.91)"; }
                } else {
                  if (diff === 0) { zIndex = 30; transform = "translate(0px, 0px) rotate(0deg) scale(1)"; }
                  else if (diff === 1) { zIndex = 20; transform = "translate(14px, -14px) rotate(3.2deg) scale(0.97)"; }
                  else if (diff === 2) { zIndex = 10; transform = "translate(-14px, -26px) rotate(-3.5deg) scale(0.94)"; }
                  else if (diff === 3) { zIndex = 5; transform = "translate(8px, -38px) rotate(5.5deg) scale(0.91)"; }
                  else { zIndex = 0; opacity = 0; transform = "translate(8px, -38px) rotate(5.5deg) scale(0.91)"; }
                }

                if (diff > 3 && !isOutgoing) return null;
                const isTop = diff === 0 && !flickState;

                return (
                  <div
                    key={faq.q}
                    style={{ transform, zIndex, opacity, transition }}
                    className={`absolute inset-0 bg-[#fdfdfb] border border-neutral-400 rounded-[20px] shadow-2xl overflow-hidden flex flex-col justify-start select-none ${isTop ? "cursor-pointer hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]" : "pointer-events-none"}`}
                  >
                    <div className="pt-3 px-4 sm:px-6 flex items-center justify-between border-b border-[#8cd6ee]">
                      <span className="font-rotonto text-[11px] tracking-wider text-neutral-600 uppercase">FAQ</span>
                      <span className="font-rotonto text-[11px] font-bold text-neutral-800 uppercase tracking-wide">{activeCategory.subtitle}</span>
                    </div>
                    <div className="px-4 sm:px-6 py-4 border-b border-[#8cd6ee] bg-white">
                      <h3 className="font-rotonto font-bold text-[18px] sm:text-[22px] leading-snug text-black">{idx + 1}. {faq.q}</h3>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                      <div className="w-[58px] sm:w-[70px] shrink-0 border-r border-[#8cd6ee] pt-4 px-2 flex flex-col items-center bg-neutral-50/50">
                        <span className="font-rotonto text-[11px] font-bold tracking-widest text-neutral-700 uppercase -rotate-90 sm:rotate-0 my-auto sm:my-0">FAQS</span>
                      </div>
                      <div
                        className="flex-1 p-4 sm:p-6 flex flex-col justify-start overflow-y-auto"
                        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(140, 214, 238, 0.32) 18px, rgba(140, 214, 238, 0.32) 19px)" }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-block w-3 h-3 rounded-full bg-black shrink-0 mt-1" />
                          <p className="font-rotonto text-[14px] sm:text-[16px] leading-relaxed text-black font-medium">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Key Button */}
            <div
              className={`transition-all duration-150 shrink-0 z-40 ${isOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 translate-x-8 pointer-events-none"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <KeyButton color="blue" size="compact" className="w-[52px] sm:w-[58px]" onClick={handleNext} aria-label="Next question" title="Next question (→)">
                <ChevronRight size={22} className="stroke-[2.5]" />
              </KeyButton>
            </div>
          </div>

          {/* Pagination dots */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mt-6 flex flex-col items-center gap-2 transition-all duration-150 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            <div className="flex items-center gap-2">
              {activeCategory.questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCardIndex(i); }}
                  aria-label={`Go to question ${i + 1}`}
                  className={`h-2 transition-all duration-300 cursor-pointer rounded-full ${i === cardIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
