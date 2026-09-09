"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { SPONSORS } from "@/content/site";
import { useInView } from "@/components/useInView";
import { Sticker } from "@/components/Sticker";

type Tier = (typeof SPONSORS.tiers)[number];

/** One sponsor's tile in the mobile grid — a coloured block sized and typeset
 *  to whichever tier it belongs to, the same tiers `Sponsors` draws on the
 *  collage: title and gold each get their own full-width row, flip on tap to
 *  show the write-up, and the rest share the two-up grid below with just a
 *  header, logo and name. */
function TileFace({
  tier,
  logoSize,
  nameSize,
  showDesc,
  className = "",
}: {
  tier: Tier;
  logoSize: string;
  nameSize: string;
  showDesc?: boolean;
  className?: string;
}) {
  const desc = showDesc && "desc" in tier ? tier.desc : undefined;
  return (
    <div
      className={`flex size-full flex-col items-center justify-center rounded-[12px] px-4 text-center text-black ${className}`}
      style={{ background: tier.bg }}
    >
      <p className="font-rotonto text-[10px] tracking-[0.15em] opacity-70">{tier.header}</p>
      <img alt={tier.name} className={`mt-1 object-contain opacity-90 ${logoSize}`} src="/placeholder.jpg" />
      <p className={`mt-1 font-rotonto ${nameSize}`}>{tier.name}</p>
      {desc && <p className="mt-1 font-rotonto text-[12px] leading-[1.4] opacity-80">{desc}</p>}
    </div>
  );
}

function SponsorTile({
  tier,
  className,
  logoSize,
  nameSize,
  showDesc,
  flippable,
  delay,
  ring,
}: {
  tier: Tier;
  className: string;
  logoSize: string;
  nameSize: string;
  showDesc?: boolean;
  flippable?: boolean;
  delay: number;
  ring?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const style = { "--pop-delay": `${delay}ms` } as CSSProperties;

  if (!flippable) {
    return (
      <div className={`group sponsor-pop relative ${className}`} style={style}>
        <TileFace tier={tier} logoSize={logoSize} nameSize={nameSize} showDesc={showDesc} />
        {ring && (
          <span
            aria-hidden
            className="sponsor-ring pointer-events-none absolute -inset-2 rounded-[18px] ring-2 ring-white"
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
      className={`sponsor-pop cursor-pointer text-left [perspective:1200px] ${className}`}
      style={style}
    >
      <div
        className="relative size-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <TileFace tier={tier} logoSize={logoSize} nameSize={nameSize} showDesc={showDesc} />
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[12px] px-5 text-center text-black [backface-visibility:hidden]"
          style={{ background: tier.bg, transform: "rotateY(180deg)" }}
        >
          <p className="font-rotonto text-[10px] tracking-[0.15em] opacity-70">{tier.name}</p>
          <p className="font-rotonto text-[12px] leading-[1.5] opacity-90">{SPONSORS.blurb}</p>
          <p className="font-rotonto text-[10px] tracking-[0.1em] opacity-60">{SPONSORS.flipHint}</p>
        </div>
      </div>
    </button>
  );
}

export default function MobileSponsors() {
  const [title, gold, ...rest] = SPONSORS.tiers;
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="relative mx-auto max-w-[560px] px-5 py-16"
    >
      <Sticker size={22} color="#bfea88" rotateFrom={-28} rotateTo={-10} delay={480} className="absolute right-3 top-2" />
      <Sticker size={16} color="#fa1a1d" rotateFrom={22} rotateTo={8} delay={620} className="absolute left-2 top-[210px]" />
      <Sticker size={18} color="#74d4f0" rotateFrom={-18} rotateTo={-6} delay={900} className="absolute right-2 bottom-4" />

      <p className="text-[16px] text-[#fa1a1d]">{SPONSORS.label}</p>
      <h2 className="mt-1 text-[32px] text-[#fa1a1d]">{SPONSORS.heading}</h2>
      <div className="mt-4 h-px w-full bg-[#fa1a1d]" />

      <div className="mt-8 grid grid-cols-2 gap-3">
        <SponsorTile
          tier={title}
          className="col-span-2 h-[200px]"
          logoSize="h-[90px] w-[180px]"
          nameSize="text-[14px]"
          showDesc
          flippable
          delay={0}
        />
        <SponsorTile
          tier={gold}
          className="col-span-2 h-[160px]"
          logoSize="h-[64px] w-[128px]"
          nameSize="text-[13px]"
          showDesc
          flippable
          delay={80}
        />
        {rest.map((tier, i) => (
          <SponsorTile
            key={i}
            tier={tier}
            className="h-[120px]"
            logoSize="h-[44px] w-[88px]"
            nameSize="text-[11px]"
            delay={160 + i * 70}
            ring
          />
        ))}
      </div>
    </section>
  );
}
