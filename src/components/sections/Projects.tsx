"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { PROJECTS } from "@/content/site";

type ProjectName = (typeof PROJECTS.cards)[number]["name"];

type CardConfig = {
  name: ProjectName;
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  tilt: string;
  popupClass: string;
};

/** Base stacking order, lowest to highest paint — kept as real classes
 *  (not an inline `zIndex`) so `hover:z-100` in the card's className can
 *  actually win: an inline style always beats a class, hover state or not. */
const Z_CLASSES = ["z-10", "z-20", "z-30", "z-40"];

/**
 * Where each card sits on the collage, in paint order — the largest goes down
 * first and BUNKKBUDDIES lands on top, which is the overlap the design draws.
 *
 * Sizing & Positions tuned so STUDYHUB is compact enough to allow LATCH to be
 * fully visible with ample breathing room, matching the Figma reference.
 */
const CARDS: CardConfig[] = [
  {
    name: "MESSIT",
    id: "297:302",
    label: "297:303",
    left: 920,
    top: 307,
    width: 318,
    height: 364,
    tilt: "rotate-[1.5deg]",
    popupClass: "right-2 bottom-3 w-[295px]",
  },
  {
    name: "LATCH",
    id: "297:304",
    label: "297:305",
    left: 585,
    top: 350,
    width: 335,
    height: 280,
    tilt: "rotate-[-2deg]",
    popupClass: "left-[-10px] bottom-3 w-[270px]",
  },
  {
    name: "STUDYHUB",
    id: "297:306",
    label: "297:307",
    left: 260,
    top: 245,
    width: 350,
    height: 430,
    tilt: "rotate-[1deg]",
    popupClass: "left-4 right-4 bottom-4",
  },
  {
    name: "BUNKBUDDIES",
    id: "297:308",
    label: "297:309",
    left: 14,
    top: 286,
    width: 275,
    height: 314,
    tilt: "rotate-[-1.5deg]",
    popupClass: "left-2 right-2 bottom-3",
  },
];

export default function ProjectsSection() {
  const projectMap = new Map<string, (typeof PROJECTS.cards)[number]>(
    PROJECTS.cards.map((card) => [card.name, card]),
  );
  return (
    <section
      aria-label="Projects"
      className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-clip top-[2496px] w-[1280px]"
      data-node-id="297:300"
      data-name="PROJECTS"
    >
      <div className="absolute contents left-[14px] top-[237px]" data-node-id="297:301">
        {CARDS.map((card, idx) => {
          const info = projectMap.get(card.name);
          if (!info) return null;

          const isDarkCard = info.textColor === "#ffffff";
          const frameColor = isDarkCard ? "#ffffff" : "#000000";
          // Alternating drop direction: even cards fall in from above, odd
          // ones rise from below — the same "dealt from alternating sides"
          // read the old `.project-pop-up`/`.project-pop-down` CSS gave.
          const fromAbove = idx % 2 === 0;

          return (
            <motion.a
              key={card.name}
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group ${Z_CLASSES[idx]} absolute block select-none overflow-visible hover:z-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#bfea88]`}
              style={{
                left: card.left,
                top: card.top,
                width: card.width,
                height: card.height,
              }}
              initial={{ opacity: 0, y: fromAbove ? -70 : 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: idx * 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              data-card
              data-node-id={card.id}
              data-name={card.name}
            >
              {/* Default solid background */}
              <div
                className="absolute inset-0 transition-opacity duration-400 ease-out group-hover:opacity-0"
                style={{ background: info.bg }}
              />

              {/* Besharm-style Hover alternate background */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
                style={{ background: info.hoverBg }}
              />

              {/* Besharm-style Animated Graphic Shape (Flower, Star, Notched, Blob) */}
              <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center p-3.5 opacity-0 scale-75 transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:opacity-100 group-hover:scale-100">
                <img
                  src={info.shapeSvg}
                  alt=""
                  className="size-full max-h-[88%] max-w-[88%] object-contain drop-shadow-sm"
                />
              </div>

              {/* Besharm-style Viewfinder / Interactive Frame on hover */}
              <div
                className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-all duration-200 ease-out group-hover:opacity-100"
                style={{ color: frameColor }}
              >
                {/* Outer bounding frame */}
                <div className="absolute inset-1 border-2 border-current opacity-90" />

                {/* Viewfinder corner brackets */}
                <span className="absolute top-0 left-0 size-3 border-t-[3px] border-l-[3px] border-current" />
                <span className="absolute top-0 right-0 size-3 border-t-[3px] border-r-[3px] border-current" />
                <span className="absolute bottom-0 left-0 size-3 border-b-[3px] border-l-[3px] border-current" />
                <span className="absolute bottom-0 right-0 size-3 border-b-[3px] border-r-[3px] border-current" />

                {/* Viewfinder corner label */}
                <div className="absolute top-2 right-2.5 flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase opacity-85">
                  <span>{`[ 0${idx + 1} // VISIT ]`}</span>
                </div>
              </div>

              {/* Card Face: Logo & Project Name */}
              <div className="relative z-10 flex size-full flex-col items-center justify-center p-4 transition-transform duration-300 ease-out group-hover:scale-105">
                <img
                  src={info.icon}
                  alt={`${info.displayName} logo`}
                  className={`object-contain transition-transform duration-300 ${
                    card.name === "STUDYHUB"
                      ? "size-20 mb-2.5"
                      : card.name === "MESSIT"
                        ? "size-18 rounded-2xl mb-2 shadow-md"
                        : card.name === "LATCH"
                          ? "w-16 h-11 mb-2"
                          : "size-16 mb-2"
                  }`}
                  style={card.name === "LATCH" ? { color: info.textColor } : undefined}
                />
                <p
                  className="font-rotonto not-italic text-center tracking-tight whitespace-nowrap text-[color:var(--text-color)] transition-colors duration-300 group-hover:text-[color:var(--hover-text-color)]"
                  style={{
                    "--text-color": info.textColor,
                    "--hover-text-color": info.hoverTextColor,
                    fontSize:
                      card.name === "STUDYHUB"
                        ? "34px"
                        : card.name === "MESSIT"
                          ? "32px"
                          : "28px",
                  } as CSSProperties}
                  data-node-id={card.label}
                >
                  {card.name}
                </p>
              </div>

              {/* Besharm-style Animated Pop-up with Brief App Info */}
              <div
                className={`pointer-events-none absolute z-30 opacity-0 translate-y-3 scale-95 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto ${card.popupClass}`}
              >
                <div
                  className={`rounded-xl border-2 border-[#bfea88] bg-[#0c0c0c]/95 p-3.5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] backdrop-blur-md transition-transform duration-300 ${card.tilt}`}
                >
                  {/* Pop-up Header */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#bfea88] opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-[#bfea88]" />
                      </span>
                      <span className="font-rotonto text-[15px] tracking-wide text-white">
                        {info.displayName}
                      </span>
                    </div>
                    <span className="rounded bg-[#bfea88]/15 px-2 py-0.5 font-rotonto text-[11px] text-[#bfea88]">
                      EXPLORE ↗
                    </span>
                  </div>

                  {/* Pop-up Tagline */}
                  <p className="mt-2 font-rotonto text-[13px] leading-snug text-[#bfea88]">
                    “{info.tagline}”
                  </p>

                  {/* Pop-up Body Description */}
                  <p className="mt-1 text-[11.5px] leading-relaxed font-sans text-neutral-300">
                    {info.body}
                  </p>

                  {/* Pop-up Footer */}
                  <div className="mt-2.5 flex items-center justify-between font-mono text-[9.5px] text-neutral-400">
                    <span className="flex items-center gap-1 font-semibold text-[#bfea88]">
                      OPEN APP &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      <div className="absolute h-0 left-[209.99px] right-[13.99px] top-[171.5px]" data-node-id="297:310">
        <div className="absolute inset-[-1px_0_0_0]">
          <img alt="" className="block max-w-none size-full" src="/figma/line4.svg" />
        </div>
      </div>
      <h2 className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[210px] not-italic text-[#fa1a1d] text-[20px] top-[140px] whitespace-nowrap" data-node-id="297:311">
        {PROJECTS.heading}
      </h2>
    </section>
  );
}
