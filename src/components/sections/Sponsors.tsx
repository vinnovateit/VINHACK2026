"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { SPONSORS } from "@/content/site";
import { useInView } from "@/components/useInView";
import { Sticker } from "@/components/Sticker";

type Tier = (typeof SPONSORS.tiers)[number];

/** The three sizes a tile is drawn at, biggest to smallest, in step with how
 *  far down `SPONSORS.tiers` it sits. */
const SIZES = {
  lg: { box: "h-[240px] w-[620px]", logo: "h-[110px] w-[220px]", header: "text-[12px]", name: "mt-1 text-[16px]", desc: "text-[13px] mt-1 max-w-[420px]" },
  md: { box: "h-[190px] w-[440px]", logo: "h-[80px] w-[160px]", header: "text-[11px]", name: "mt-1 text-[14px]", desc: "text-[12px] mt-1 max-w-[340px]" },
  sm: { box: "h-[150px] w-[190px]", logo: "h-[56px] w-[112px]", header: "text-[10px]", name: "mt-1 text-[12px]", desc: "" },
} as const;

/** The face every tile shows to start with — the logo is the point of it, the
 *  name underneath is there only for whoever can't place the mark yet. */
function TileFace({ tier, size, className = "" }: { tier: Tier; size: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  const desc = "desc" in tier ? tier.desc : undefined;
  return (
    <div
      className={`flex size-full shrink-0 flex-col items-center justify-center rounded-[16px] px-6 text-center text-black ${className}`}
      style={{ background: tier.bg }}
      data-tier={size}
    >
      <p className={`font-rotonto tracking-[0.15em] opacity-70 ${s.header}`}>{tier.header}</p>
      <img alt={tier.name} className={`mt-2 object-contain opacity-90 ${s.logo}`} src="/placeholder.jpg" />
      <p className={`font-rotonto ${s.name}`}>{tier.name}</p>
      {desc && <p className={`font-rotonto leading-[1.4] opacity-80 ${s.desc}`}>{desc}</p>}
    </div>
  );
}

/** The title and gold tiles turn on click to show the write-up on the back;
 *  the rest are plain, but still get the same pop-in and the smaller ones
 *  get a hover ring on top of it. */
function Tile({ tier, size, delay, flippable }: { tier: Tier; size: keyof typeof SIZES; delay: number; flippable?: boolean }) {
  const s = SIZES[size];
  const [flipped, setFlipped] = useState(false);
  const style = { "--pop-delay": `${delay}ms` } as CSSProperties;

  if (!flippable) {
    return (
      <div className={`group sponsor-pop relative shrink-0 ${s.box}`} style={style}>
        <TileFace tier={tier} size={size} />
        {size === "sm" && (
          <span
            aria-hidden
            className="sponsor-ring pointer-events-none absolute -inset-2 rounded-[22px] ring-2 ring-white"
          />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={`${tier.name} — ${flipped ? SPONSORS.flipHint : "show sponsor details"}`}
      className={`sponsor-pop shrink-0 cursor-pointer text-left [perspective:1400px] ${s.box}`}
      style={style}
    >
      <div
        className="relative size-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <TileFace tier={tier} size={size} />
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[16px] px-7 text-center text-black [backface-visibility:hidden]"
          style={{ background: tier.bg, transform: "rotateY(180deg)" }}
        >
          <p className={`font-rotonto tracking-[0.15em] opacity-70 ${s.header}`}>{tier.name}</p>
          <p className={`font-rotonto leading-[1.5] opacity-90 ${size === "lg" ? "text-[13px] max-w-[480px]" : "text-[11px] max-w-[360px]"}`}>
            {SPONSORS.blurb}
          </p>
          <p className="font-rotonto text-[10px] tracking-[0.1em] opacity-60">{SPONSORS.flipHint}</p>
        </div>
      </div>
    </button>
  );
}

export default function SponsorsSection() {
  const [title, gold, ...rest] = SPONSORS.tiers;
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="-translate-x-1/2 absolute bg-black h-[920px] left-1/2 top-[4680px] w-[1280px]"
      data-name="SPONSORS"
    >
      {/* Thrown around the tiles once the section is in view — the same
          `Spark` shape the hero deals in, at rest points that keep clear of
          both the copy and the widest row of tiles. */}
      <Sticker size={30} color="#bfea88" rotateFrom={-30} rotateTo={-12} delay={520} className="absolute right-[52px] top-[24px]" />
      <Sticker size={20} color="#fa1a1d" rotateFrom={26} rotateTo={10} delay={640} className="absolute left-[36px] top-[236px]" />
      <Sticker size={24} color="#74d4f0" rotateFrom={-20} rotateTo={-6} delay={760} className="absolute right-[30px] top-[470px]" />
      <Sticker size={18} color="#e2b5f0" rotateFrom={22} rotateTo={8} delay={880} className="absolute left-[54px] top-[690px]" />
      <Sticker size={22} color="#fcfcfc" rotateFrom={-18} rotateTo={-4} delay={1000} className="absolute right-[70px] bottom-[36px]" />

      <div className="absolute left-[90px] right-[90px] top-[54px]">
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic text-[#fa1a1d] text-[20px] whitespace-nowrap">
          {SPONSORS.label}
        </p>
        <h2 className="[word-break:break-word] mt-2 font-rotonto leading-[normal] not-italic text-[#fa1a1d] text-[42px] whitespace-nowrap">
          {SPONSORS.heading}
        </h2>
        <div className="mt-4 h-px w-full bg-[#fa1a1d]" />
      </div>

      <div className="absolute left-0 right-0 top-[210px] flex flex-col items-center gap-[36px]">
        <Tile tier={title} size="lg" delay={0} flippable />
        <Tile tier={gold} size="md" delay={80} flippable />
        <div className="flex flex-wrap items-stretch justify-center gap-[20px]">
          {rest.map((tier, i) => (
            <Tile key={i} tier={tier} size="sm" delay={160 + i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}
