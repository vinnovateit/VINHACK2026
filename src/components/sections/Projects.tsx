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
    tilt: "rotate-[1deg]",
  },
  {
    name: "LATCH",
    id: "297:304",
    label: "297:305",
    left: 585,
    top: 350,
    width: 335,
    height: 280,
    tilt: "rotate-0",
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
                <div className="absolute inset-1  opacity-90" />

                {/* Viewfinder corner brackets */}
                <span className="absolute top-0 left-0 size-3 " />
                <span className="absolute top-0 right-0 size-3 " />
                <span className="absolute bottom-0 left-0 size-3 " />
                <span className="absolute bottom-0 right-0 size-3" />

                {/* Viewfinder corner label */}
                <div className="absolute top-2 right-2.5 flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase opacity-85">
                  
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

              {/* The receipt the card prints when you touch it: a slip of the
                  same stock, pulled out from behind the card's bottom edge and
                  still tucked under it, so the two read as one object rather
                  than a tooltip floating nearby. */}
              <div className="pointer-events-none absolute top-full right-1.5 left-1.5 z-0 -mt-px origin-top scale-y-[0.35] opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:scale-y-100 group-hover:opacity-100">
                <div className="relative border border-t-0 border-black bg-[#fcfcfc] px-3 pt-2.5 pb-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)]">
                  {/* Perforation along the edge it was torn from */}
                  <span className="pointer-events-none absolute inset-x-2 top-0 border-t border-dashed border-black/25" />

                  {/* Header: name + destination cue */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-rotonto text-[15px] leading-none tracking-tight text-black">
                      {info.displayName}
                    </span>
                    <span className="font-rotonto text-[10px] leading-none tracking-[0.12em] text-[#fa1a1d]">
                      OPEN&nbsp;↗
                    </span>
                  </div>

                  {/* Tagline, in the section's red */}
                  <p className="mt-1.5 font-rotonto text-[12.5px] leading-snug text-[#fa1a1d]">
                    “{info.tagline}”
                  </p>

                  {/* Body */}
                  <p className="mt-1 font-rotonto text-[11px] leading-relaxed text-black/70">
                    {info.body}
                  </p>

                  {/* Torn bottom edge */}
                  <span
                    className="pointer-events-none absolute inset-x-0 -bottom-[7px] h-2 bg-[#fcfcfc]"
                    style={{
                      maskImage:
                        "repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 8px)",
                      WebkitMaskImage:
                        "repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 8px)",
                    }}
                  />
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