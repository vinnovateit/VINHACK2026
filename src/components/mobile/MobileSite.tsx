"use client";

import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";

import CameraFeed from "@/components/CameraFeed";
import GitArt from "@/components/hero/GitArt";
import KeyArt from "@/components/hero/KeyArt";
import NoteArt from "@/components/hero/NoteArt";
import QrArt, { QR_STICKER } from "@/components/hero/QrArt";
import ScrollCue, { SCROLL_CUE } from "@/components/hero/ScrollCue";
import SpeakerArt from "@/components/hero/SpeakerArt";
import WordmarkArt from "@/components/hero/WordmarkArt";
import MobileRecap from "@/components/mobile/MobileRecap";
import WhoAreWeSection from "@/components/sections/WhoAreWe";
import MobileSponsorSheet from "@/components/sections/MobileSponsorSheet";
import TimelineSection from "@/components/sections/Timeline";
import Piece from "@/components/mobile/Piece";
import PassCard from "@/components/pass/PassCard";
import ShutterButton from "@/components/pass/ShutterButton";
import PassTumble from "@/components/pass/PassTumble";
import { PASS_START } from "@/components/pass/variants";
import SiteFooter from "@/components/sections/SiteFooter";
import { FEATURES } from "@/content/features";
import {
  FAQS,
  type FaqCategory,
  GUIDELINES,
  HERO,
  PASS,
  PROJECTS,
  RULES,
  SNEAK_PEEK,
  TIMELINE,
  TRACKS,
} from "@/content/site";
import { useInView } from "@/components/useInView";
import MobileTracksDeck from "@/components/tracks/MobileTracksDeck";

/**
 * The page below `md`.
 *
 * The design is a fixed 1280 x 8834 collage: sections overlap, every element
 * sits at an exact pixel offset, and there is no reflow to fall back on. Scaled
 * whole — which is what `DesignCanvas` does, and all that used to happen here —
 * a 375px phone renders it at 0.29, and the 21px body copy arrives at 6px. It
 * fits, and it cannot be read.
 *
 * So the phone gets its own arrangement rather than a smaller copy of the
 * collage: one column, in the order the sections already run, at type sizes
 * that were chosen for a phone. What it keeps is everything that makes the
 * design itself — the palette, Rotonto, the stickers and their angles, the
 * receipt, the attendee pass, the marquees. The drawings come through whole via
 * `Piece`, scaled to the column; only the arrangement is new.
 *
 * The words are not restated here. Both layouts read `content/site.ts`, so a
 * date corrected on the collage is corrected on the phone.
 */

/** The gutter every section shares. */
const PAD = "px-5";

/**
 * The reading column. This layout runs from the narrowest phone up to 767px,
 * and a single column left to run the full width of a large phone held
 * sideways gives lines far too long to read. Capped and centred, the measure
 * stays roughly constant across the range and only the margins grow.
 *
 * Full-bleed pieces — the two marquees, the footer's coloured bands — are
 * deliberately outside it: they are meant to run edge to edge.
 */
const COL = "mx-auto max-w-[560px] w-full";

export default function MobileSite() {
  return (
    <div className="md:hidden bg-black text-[#fcfcfc] w-full overflow-x-clip">
      <MobileHero />
      <MobileRecap />
      {/* The same collage the desktop gets, not a phone-shaped stand-in for it:
          the stage is a viewport-sized portal either way, so only the reserved
          scroll and the card scale change. See the note on `WhoAreWeSection`. */}
      {FEATURES.whoAreWe && <WhoAreWeSection variant="flow" />}
      {FEATURES.projects && <MobileProjects />}
      <MobileTracks />
      <MobileSponsorSheet />
      <TimelineSection variant="flow" />
      <MobileRules />
      <MobileGuidelines />
      <MobileFAQs />
      <MobileAbout />
      <SiteFooter />
    </div>
  );
}

/* --------------------------------------------------------------- hero */

/**
 * The stage the phone's hero is arranged on.
 *
 * The rest of this file reflows: one column, type at phone sizes, drawings
 * dropped in whole and scaled. The hero cannot do that and still be the hero —
 * it is a wordmark with six stickers thrown round it, and a wordmark with six
 * stickers *under* it in a list is a contents page. So the hero alone keeps the
 * collage treatment the desktop page uses for everything, at a frame drawn for
 * a phone rather than for a 1280px monitor: 393 x 682, which is a common phone
 * in portrait with room under it for the scroll cue.
 *
 * `Piece` scales the frame to the screen, so every offset below is in these 393
 * pixels and lands in the same relationship at any width. It is capped at 1.7
 * rather than 1: past about 670px the stage would otherwise stop growing and
 * sit as an island in the middle of a large phone held sideways.
 */
const STAGE = { width: 393, height: 540 };

/**
 * A drawing from the design file, placed on the stage at a size of this
 * layout's choosing.
 *
 * `Piece` scales artwork to *fill* a column, which is what the sections below
 * want. The hero wants the opposite: each sticker at a particular size in a
 * particular place, because the arrangement is the design. So the artwork's own
 * box is scaled by a number given here, and the result is positioned in stage
 * pixels.
 */
function Placed({
  x,
  y,
  w,
  h,
  scale,
  className,
  children,
  style,
  ...rest
}: {
  /** Top-left on the stage, in stage px. */
  x: number;
  y: number;
  /** The artwork's own size, from the design file. */
  w: number;
  h: number;
  scale: number;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`absolute ${className ?? ""}`}
      style={{ left: x, top: y, width: w * scale, height: h * scale, ...style }}
      {...rest}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: w, height: h, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/** The four-point stars the collage scatters between the stickers. Drawn here
 *  rather than exported: it is two mirrored curves, and a request for it would
 *  be a request for four bytes of path. */
function Spark({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <svg
      aria-hidden
      className="deal-in pointer-events-none absolute z-40 [--deal-delay:1.5s]"
      style={{ left: x, top: y, width: size, height: size }}
      viewBox="0 0 24 24"
      fill="#fcfcfc"
    >
      <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12Z" />
    </svg>
  );
}

function MobileHero() {
  return (
    <>
      {/* The hero holds the screen and nothing else does: it is sized to the
          viewport rather than to its contents, so the wordmark and its stickers
          are the whole of the first screen and the lede is genuinely below it —
          something you scroll to, which is what the cue under the disc is
          promising. `svh` rather than `vh` because a phone's URL bar makes `vh`
          taller than the screen actually is, and the bottom of the collage
          would start under it. */}
      <section
        aria-label="VinHack"
        className="flex min-h-[92svh] w-full flex-col items-center justify-center overflow-clip px-2 pt-10 pb-6"
      >
        <Piece
          width={STAGE.width}
          height={STAGE.height}
          max={1}
          className="mobile-stage w-full max-w-[393px] mx-auto"
        >
          {/* The orbit the wordmark sits in the middle of, and the two sparks
              caught on it. A ring rather than an exported shape — it is a
              hairline ellipse, and drawing it costs one box. */}
          {/* Two boxes rather than one: `deal-in` ends at `transform: none`
              and holds there, so anything wearing it cannot also carry a
              transform of its own — the tilt would be wiped the moment the
              entrance landed. The outer box is dealt, the inner one is tilted. */}
          <div
            aria-hidden
            className="deal-in pointer-events-none absolute [--deal-delay:1.05s] [--deal-s:0.86]"
            style={{ left: 18, top: 116, width: 344, height: 200 }}
          >
            <div className="size-full pointer-events-none rotate-[-8deg] rounded-[50%] border border-white/30" />
          </div>
          <Spark x={240} y={106} size={20} />
          <Spark x={211} y={305} size={16} />

          {/* The wordmark, as two layers — the solid lettering and the offset
              outline drawn behind it — which stack back to exactly the Figma
              export.
 
              They are also the phone's half of the hero entrance. The collage
              drives its version from GSAP in `HeroMotion`, which does not run
              at this width at all (see `DESKTOP` in motion/recipes.ts); here
              the same gesture is three CSS animations, which need no JavaScript
              and start on their own the moment the element is painted. The
              outline strikes like a cold neon tube, the lettering floods in
              behind it and the sign blooms once and fades. See `.neon-*` in
              globals.css. */}
          <h1
            aria-label="VinHack"
            className="neon-sign absolute z-10"
            style={{ left: 32, top: 152, width: 330, height: 115.14, touchAction: "manipulation" }}
            data-hero="wordmark"
          >
            <WordmarkArt fillClassName="neon-fill" outlineClassName="neon-tube" fullHitArea />
          </h1>

          {/* The stickers, dealt in behind the sign a beat apart — each thrown
              from the side it already sits on, which is the same deal
              `HeroMotion` runs on the collage. The offsets go on the placed
              box, outside the scale that carries the artwork, so the two
              transforms never meet. */}

          {/* The git commit bubble. */}
          <Placed
            x={8}
            y={48}
            w={411.659}
            h={207.988}
            scale={0.5}
            className="deal-in z-20 pointer-events-none [--deal-delay:1.15s] [--deal-r:-6deg] [--deal-x:-44px]"
            data-hero="git"
          >
            <GitArt />
          </Placed>

          {/* The speaker sticker — the page's sound switch, and a real one
              here: `motion/speaker.ts` wires whichever copy is on screen, so
              muting from the phone is the same switch as muting from the
              collage. */}
          <Placed
            x={298}
            y={76}
            w={128.981}
            h={109.634}
            scale={0.62}
            className="deal-in z-30 cursor-pointer [--deal-delay:1.25s] [--deal-r:10deg] [--deal-x:38px]"
            data-hero="speaker"
            role="switch"
            aria-checked="true"
            aria-label={HERO.sound.label}
            tabIndex={0}
          >
            <SpeakerArt />
          </Placed>

          {/* The QR sticker. */}
          <Placed
            x={270}
            y={284}
            w={QR_STICKER.width}
            h={QR_STICKER.height}
            scale={0.37}
            className="deal-in z-20 pointer-events-none [--deal-delay:1.35s] [--deal-x:40px] [--deal-y:26px]"
          >
            <div className="relative size-full overflow-clip">
              <div
                className="absolute h-[832px] w-[1280px]"
                style={{ left: -QR_STICKER.left, top: -QR_STICKER.top }}
              >
                <QrArt />
              </div>
            </div>
          </Placed>

          {/* The keycap. */}
          <Placed
            x={14}
            y={312}
            w={102.721}
            h={105.868}
            scale={0.6}
            className="deal-in z-20 cursor-pointer [--deal-delay:1.45s] [--deal-r:-16deg] [--deal-x:-36px]"
            data-hero="key"
            role="button"
            tabIndex={0}
            aria-label="Keycap"
            style={{ touchAction: "manipulation" }}
          >
            <div data-hero="key-press" className="size-full">
              <KeyArt />
            </div>
          </Placed>

          {/* The "Register Now" / "Login" note. */}
          <Placed
            x={96}
            y={278}
            w={275.16}
            h={287.765}
            scale={0.46}
            className="deal-in z-30 cursor-pointer pointer-events-auto [--deal-delay:1.55s] [--deal-r:-8deg] [--deal-x:-40px]"
            data-hero="note"
            style={{ touchAction: "manipulation" }}
          >
            <Link href="/login" className="block size-full" aria-label="Login">
              <NoteArt />
            </Link>
          </Placed>

          {/* The scroll cue. */}
          <Placed
            x={122}
            y={424}
            w={SCROLL_CUE.width}
            h={SCROLL_CUE.height}
            scale={0.68}
            className="deal-in z-20 [--deal-delay:1.65s] [--deal-y:44px]"
          >
            <ScrollCue />
          </Placed>
        </Piece>
      </section>

      {/* The lede, deliberately off the hero screen. It reads as what you find
          when you take the cue up rather than as a caption under the wordmark,
          and it is the reason there is something to scroll to at all. */}
      <section aria-label="VinHack, in brief" className={`${COL} ${PAD} pt-4 pb-12`}>
        <p className="text-center text-[16px] leading-[1.6] text-[#a8a2a2]">
          {HERO.lede}
        </p>
      </section>
    </>
  );
}

/* -------------------------------------------------------------- about */

function MobileAbout() {
  return (
    <section
      aria-label="About VinHack"
      className="relative w-full overflow-clip flex flex-col items-center justify-center pt-12 pb-6"
    >
      {/* The background layer: the same two lines, tiled and scrolling — the
          CSS `.marquee` class the footer's own row uses below, which loops by
          translating the row exactly half its width. Six columns, so each half
          of that loop is already wider than the widest phone: fewer and the row
          would run out mid-loop and the seam would show as blank ground. */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden font-rotonto font-light text-[40px] leading-[52px] text-[#0a3a48] whitespace-nowrap z-0"
      >
        <div
          className="marquee flex h-full items-stretch"
          style={{ "--marquee-duration": "20s" } as CSSProperties}
        >
          {Array.from({ length: 6 }, (_, col) => (
            <div key={col} className="flex flex-col shrink-0 px-4">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i}>{SNEAK_PEEK.lines[i % SNEAK_PEEK.lines.length]}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* The pass tumbles in the way the collage's pair do — same wrapper,
          no resting tilt, because the phone carries one pass square on. */}
      <PassTumble tilt={0} className="relative z-10 flex w-full justify-center px-4">
        <AttendeePass />
      </PassTumble>
    </section>
  );
}

/**
 * The attendee pass, kept at the size it is drawn and scaled to the column, so
 * the ticket, the feed panel and the barcode keep their proportions. The
 * collage carries two of these, tilted against each other; the phone has room
 * for one, and it is the one with the live camera in it.
 */
function AttendeePass() {
  return (
    <Piece
      width={374.669}
      height={546.48}
      max={0.71}
      className="w-full max-w-[265px]"
    >
      <PassCard
        start={PASS_START.front}
        className="absolute inset-0 overflow-clip rounded-[34.32px]"
      >
        <p className="-translate-x-full absolute top-[131.1px] left-[267.14px] font-rotonto text-[112.64px] whitespace-nowrap text-right text-[#313855] opacity-5">
          {PASS.watermark}
        </p>
        <p className="-translate-x-full absolute top-[279.82px] left-[432.58px] font-rotonto text-[112.64px] whitespace-nowrap text-right text-[#313855] opacity-5">
          {PASS.watermark}
        </p>

        <div className="absolute top-[58.77px] left-[209.91px] font-rotonto text-[31.68px] leading-[0] whitespace-nowrap text-(--pass-ink)">
          <p className="mb-0 leading-[normal]">{PASS.title[0]}</p>
          <p className="leading-[normal]">{PASS.title[1]}</p>
        </div>

        {/* The torn ticket stub. */}
        <div className="absolute top-[10.47px] left-[2.41px] flex h-[168.768px] w-[194.508px] items-center justify-center">
          <div className="-rotate-17 flex-none">
            <div className="relative h-[126.08px] w-[164.849px]">
              <div className="absolute inset-[-0.76%_-0.93%_-0.81%_-0.92%]">
                <img
                  alt=""
                  className="block size-full max-w-none"
                  src="/figma/vector24.svg"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="-translate-x-1/2 absolute top-[66px] left-[102.39px] flex h-[33.509px] w-[164.641px] items-center justify-center">
          <div className="flex-none rotate-[5.46deg]">
            <div className="relative h-[18.023px] font-rotonto text-[21.12px] leading-[0] whitespace-pre-wrap text-center text-(--pass-stub)">
              <p className="mb-0 leading-[normal]">{PASS.ticket[0]}</p>
              <p className="leading-[normal]">{PASS.ticket[1]}</p>
            </div>
          </div>
        </div>

        <div className="-translate-x-1/2 absolute top-[169.22px] left-[calc(50%-1.3px)] h-[145.618px] w-[316.8px] overflow-clip bg-[#fcfcfc] filter-(--pass-feed) transition-[filter] duration-300">
          <CameraFeed />
        </div>

        {PASS.fields.map((field, i) => (
          <div key={field.label}>
            <p
              className="-translate-x-1/2 absolute font-rotonto text-[21.12px] whitespace-nowrap text-center text-(--pass-ink)"
              style={
                i === 0
                  ? { left: 48.96, top: 332.98 }
                  : { left: 304.32, top: 327.25 }
              }
            >
              {field.label}
            </p>
            <p
              className={`absolute font-rotonto text-[17.6px] whitespace-nowrap text-[#105266] ${i === 0 ? "-translate-x-1/2 text-center" : "-translate-x-full text-right"
                }`}
              style={
                i === 0 ? { left: 67.84, top: 357.17 } : { left: 345.86, top: 357.17 }
              }
            >
              {field.value}
            </p>
          </div>
        ))}

        {/* The barcode. On the collage this is forty separate bar drawings; the
            bars are all one of five widths off a repeating pattern, so here it
            is the pattern itself. */}
        <div
          aria-hidden
          className="absolute top-[406.5px] left-[44.2px] h-[96px] w-[280.7px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--pass-ink) 0 2px, transparent 2px 5px, var(--pass-ink) 5px 8px, transparent 8px 11px, var(--pass-ink) 11px 15px, transparent 15px 19px)",
          }}
        />
        <p className="-translate-x-1/2 absolute top-[511px] left-1/2 font-rotonto text-[11.616px] whitespace-nowrap text-center text-(--pass-ink)">
          {PASS.barcode}
        </p>
        <ShutterButton />
      </PassCard>
    </Piece>
  );
}



/* ----------------------------------------------------------- projects */

/**
 * The desktop cards (`sections/Projects.tsx`) show their copy on `:hover`, and
 * a phone has no hover to give. Printing that copy permanently under the face
 * was the first answer and it was the wrong one: the slip grows with its text,
 * and whatever it pushed the logo and the shape graphic into was no longer the
 * arrangement the card was drawn as.
 *
 * So the copy is a second side of the same card instead of a third thing
 * stacked under it. The face keeps its full square — shape graphic, logo,
 * wordmark, untouched — and the tag in its corner turns the card over in place.
 * Nothing on the page moves when it does: the back is `absolute inset-0` over
 * the front, so the row keeps its height whichever side is up.
 */
function MobileProjects() {
  return (
    <section aria-label="Projects" className={`${COL} ${PAD} py-16 overflow-x-clip`}>
      <h2 className="text-[20px] text-[#fa1a1d]">{PROJECTS.heading}</h2>
      <div className="mt-3 h-px w-full bg-[#fa1a1d]" />

      <div className="mt-8 flex flex-col gap-5">
        {PROJECTS.cards.map((card, idx) => (
          <MobileProjectCard key={card.name} card={card} idx={idx} />
        ))}
      </div>
    </section>
  );
}

function MobileProjectCard({
  card,
  idx,
}: {
  card: (typeof PROJECTS.cards)[number];
  idx: number;
}) {
  const [flipped, setFlipped] = useState(false);

  // BunkBuddies' hover fill is red, and white text on it reads too hot on a
  // phone at rest with no dark card underneath it — black matches the
  // resting-card colour it already uses on desktop.
  const textColor = card.name === "BUNKBUDDIES" ? "#000000" : card.hoverTextColor;
  const isDark = textColor === "#ffffff";
  const fromLeft = idx % 2 === 0;

  return (
    <motion.div
      className="relative aspect-[4/3] w-full overflow-clip"
      style={{ background: card.hoverBg }}
      initial={{ opacity: 0, x: fromLeft ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ---- front: the card as drawn ---- */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-5 transition-opacity duration-300 ${
          flipped ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {/* Shape graphic, sat behind the face. */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center p-3.5 opacity-90">
          <img
            src={card.shapeSvg}
            alt=""
            className="size-full max-h-[92%] max-w-[92%] object-contain drop-shadow-sm"
          />
        </div>

        {/* The whole face opens the app; the tag below turns the card over. */}
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`Open ${card.displayName}`}
        />

        <div className="relative z-20 flex justify-end">
          <span
            className="pointer-events-none rounded-full px-2 py-0.5 font-rotonto text-[11px] tracking-wider"
            style={{
              background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
              color: textColor,
            }}
          >
            VISIT ↗
          </span>
        </div>

        <div className="relative z-20 flex flex-col items-center">
          <img
            src={card.icon}
            alt={`${card.displayName} logo`}
            className="size-16 object-contain"
            style={card.name === "LATCH" ? { color: textColor } : undefined}
          />
          <h3
            className="mt-3 font-rotonto text-[24px] tracking-tight"
            style={{ color: textColor }}
          >
            {card.name}
          </h3>
        </div>

        {/* The turn-over tag, in the corner the design leaves empty. */}
        <div className="relative z-20 flex justify-start">
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="bg-[#fcfcfc] px-2.5 py-1 font-rotonto text-[11px] tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)]"
            aria-expanded={flipped}
          >
            WHAT IS IT? ↻
          </button>
        </div>
      </div>

      {/* ---- back: the same paper slip, now the whole card ---- */}
      <div
        className={`absolute inset-0 z-30 flex flex-col bg-[#fcfcfc] p-5 text-black transition-opacity duration-300 ${
          flipped ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-rotonto text-[16px] leading-none tracking-tight text-black">
            {card.displayName}
          </span>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            className="font-rotonto text-[11px] leading-none tracking-[0.12em] text-black/50"
            aria-label="Turn the card back over"
          >
            BACK ↺
          </button>
        </div>

        <p className="mt-3 font-rotonto text-[14px] leading-snug text-[#fa1a1d]">
          “{card.tagline}”
        </p>

        <p className="mt-2 font-rotonto text-[12.5px] leading-relaxed text-black/70">
          {card.body}
        </p>

        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto self-start px-3 py-1.5 font-rotonto text-[12px] tracking-wider"
          style={{ background: card.hoverBg, color: textColor }}
        >
          OPEN APP ↗
        </a>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------- tracks */

function MobileTracks() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const iosEase = "cubic-bezier(0.32, 0.72, 0, 1)";

  return (
    <section ref={sectionRef} aria-label="Tracks" className={`${COL} ${PAD} py-16 overflow-x-clip`}>
      <div className="border-t border-[#fa1a1d]">
        {TRACKS.lines.map((line, i) => {
          const Tag = i === 1 ? "h2" : "p";
          const isRight = i === 1;
          const delay = `${i * 0.1}s`;
          return (
            <div
              key={line}
              className="flex items-center gap-3 border-b border-[#fa1a1d] py-4 will-change-transform"
              style={{
                transform: inView
                  ? "translateX(0)"
                  : isRight
                    ? "translateX(100px)"
                    : "translateX(-100px)",
                opacity: inView ? 1 : 0,
                transition: `transform 0.5s ${iosEase} ${delay}, opacity 0.5s ${iosEase} ${delay}`,
              }}
            >
              <Tag className="text-[30px] leading-[1.1] text-[#fa1a1d]">
                {line}
              </Tag>
              <img
                alt=""
                aria-hidden
                className="block size-[26px] max-w-none shrink-0"
                src={
                  i === 0
                    ? "/figma/vector32.svg"
                    : i === 1
                      ? "/figma/group48095496.svg"
                      : "/figma/star2.svg"
                }
              />
            </div>
          );
        })}
      </div>

      {/* The deck deals its four tracks as the page scrolls past — see
          `MobileTracksDeck`, which is the phone's answer to the collage's
          scroll-locked deck. */}
      <MobileTracksDeck />
    </section>
  );
}

/* ----------------------------------------------------------- timeline */

/* -------------------------------------------------------------- rules */

/**
 * Rules and Guidelines are drawn as the same object twice over: a sheet of
 * paper with a pin through the top of it. On the collage the two are one
 * horizontal scroll — `slideOut` pans the rules off to the right and `slideIn`
 * brings the guidelines in from the left behind them, both keyed to the gap
 * between the two sections (see `motion/pinboard.ts`).
 *
 * The phone gets the same scroll, driven by `MobileMotion` off these two data
 * attributes. What it needs that the collage does not is room: the two sheets
 * are stacked in a column here rather than overlaid on a fixed canvas, so
 * without a real gap between them the rules are still panning out while the
 * guidelines are already in, and the two read as one long shuffle instead of a
 * board being scrolled. Hence the wide `pb` here and `pt` there.
 *
 * Both sections clip, so a sheet on its way out is gone at the edge of its own
 * section rather than travelling across the page.
 */
function MobileRules() {
  return (
    <section aria-label="Rules" className={`${COL} ${PAD} overflow-clip pt-16 pb-28`}>
      {/* The board the rules are pinned to, with its pin. The pan is on this
          wrapper and the stamp on the pin inside it — two elements, so the
          scrubbed pan cannot rewrite the transform the stamp is still using. */}
      <div className="relative" data-m-slide-out>
        <img
          alt=""
          aria-hidden
          className="-top-[26px] -translate-x-1/2 absolute left-1/2 z-1 block h-[62px] w-[48px] max-w-none"
          src="/figma/pin.svg"
          data-m-stamp="0.8"
        />
        <div className="rounded-[4px] bg-[#bfea88] px-5 pt-12 pb-10">
          <h2 className="text-[38px] text-[#1c563c]">{RULES.heading}</h2>
          <ul className="mt-6 space-y-4 text-[15px] leading-[1.5] text-[#1c563c]">
            {RULES.items.map((item) => (
              <li key={item} className="ms-5 list-disc whitespace-pre-wrap">
                {item}
              </li>
            ))}
          </ul>

          {/* The badge belongs on the paper, not under it. The collage stamps
              it over the sheet's bottom-right corner (343:719) with a little of
              it hanging off the bottom edge, and it pans away with the paper it
              is stuck to rather than staying behind — which is why it lives
              inside the sheet here, where `data-m-slide-out` carries it.

              In flow rather than absolutely placed: the paper then grows to
              hold it, instead of the badge coming down on top of the last
              bullet on whichever phone the list happens to reflow longest on.
              The negative bottom margin is the overhang — it takes back more
              than the sheet's own bottom padding, so the paper closes 16px
              above the badge and the badge hangs over the edge. */}
          <div className="-mb-14 mt-8 flex justify-end">
            <div className="w-full max-w-[220px]" data-m-stamp="0.95">
              <Piece width={226.452} height={195.34} max={0.95}>
                <div className="absolute top-0 left-0 flex h-[195.34px] w-[226.452px] items-center justify-center">
                  <div className="-scale-y-100 flex-none rotate-180">
                    {/* Two files, for the reason given in sections/Rules.tsx:
                        the asterisk beside the globe breathes on its own and
                        cannot be reached inside a flat `<img>`. */}
                    <div className="relative h-[195.34px] w-[226.452px]">
                      <img
                        alt=""
                        className="absolute inset-0 block size-full max-w-none"
                        src="/figma/group48095564-globe.svg"
                      />
                      <img
                        alt=""
                        aria-hidden
                        className="asterisk absolute inset-0 block size-full max-w-none"
                        src="/figma/group48095566-asterisk.svg"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute top-[68.47px] left-[22.78px] flex h-[67.648px] w-[182.2px] items-center justify-center">
                  <div className="flex-none rotate-15">
                    <p className="relative font-rotonto text-[21.829px] leading-[20.837px] whitespace-nowrap text-white">
                      {RULES.sticker}
                    </p>
                  </div>
                </div>
              </Piece>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- guidelines */

function MobileGuidelines() {
  // A wider `pb` than the section used to want: the badge is inside the sheet
  // now, so the paper reaches 60px past the bottom of it, and the black between
  // this sheet and Register is what is left after that.
  return (
    <section aria-label="Guidelines" className={`${COL} ${PAD} overflow-clip pt-24 pb-28`}>
      {/* The sheet: the drawing, the heading printed on it and the text, all
          coming in together. A heading that stayed put while the page it is on
          arrived would be the one thing giving the trick away. */}
      <div className="relative" data-m-slide-in>
        {/* The sheet's own artwork, which the phone was simply missing — the
            collage draws it at 343:753 and this column had nothing behind the
            words at all.

            Same construction as the collage's: an outer box that is the rotated
            drawing's bounding box, with the drawing itself turned inside it at
            72.646% x 70.272% of that box. Keeping those two proportions is what
            makes it the same shape rather than a differently-squashed one — the
            file is `preserveAspectRatio="none"` and will stretch to whatever it
            is given.

            Measured off the text's height rather than the column's width, which
            is what was wrong with a sheet that only reached the third
            paragraph. The drawing is a slab lying on its side, and the design's
            -143.32deg leaves its purple covering 45.8% of the outer box's
            height against 66.6% of its width — so a box counted out in column
            widths runs out of paper long before a phone's worth of copy runs
            out of lines. 218.2% of the text block plus 210px is the box whose
            purple lands exactly on the text plus 48px above and below it,
            whatever length the words reflow to.

            The width then follows from the ratio, and it is much wider than the
            column: a slab that tall is that wide, and there is no turning it.
            So the sheet full-bleeds and the section clips it — its long edges
            still cross the screen on the slight slant the collage shows, and it
            is the short ends that go. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[48%] left-1/2 w-auto -translate-x-1/2 -translate-y-1/2"
          style={{
            height: "calc(220% + 260px)",
            aspectRatio: "1599.46 / 1590.388",
          }}
        >
          <div className="flex size-full items-center justify-center">
            <div
              className="-scale-y-100 flex-none rotate-[-143.32deg]"
              style={{ width: "72.646%", height: "70.272%" }}
            >
              <img
                alt=""
                className="block size-full max-w-none"
                src="/figma/group48095560.svg"
              />
            </div>
          </div>
        </div>

        <div className="relative pt-3">
          <img
            alt=""
            aria-hidden
            className="top-[2px] absolute right-4 z-1 block h-[76px] w-[42px] max-w-none"
            src="/figma/pin1.svg"
          />
          <h2 className="font-rotonto font-light text-[38px] text-[#2849cb]">{GUIDELINES.heading}</h2>
        </div>

        <div className="relative mt-7 space-y-5 text-[15px] leading-[1.6] text-white">
          {GUIDELINES.paragraphs.map((para) => (
            <p key={para}>{para}</p>
          ))}
          <p className="pt-2">{GUIDELINES.tldr}</p>
        </div>

        {/* Stamped once the sheet has actually landed — `top 45%` rather than
            the recipe's own `top 70%`, which on the phone is still inside the
            pan.

            Kept inside the sheet and pulled to its left edge, which is where
            the collage puts it: 343:761 sits over the purple's bottom-left
            corner with a corner of itself hanging off. Being part of the block
            the artwork above measures itself against is what makes it land on
            paper — the sheet now reaches down behind the badge instead of
            stopping short of it, which is what left it floating on black in its
            own row underneath. */}
        <div className="-ml-4 mt-10 flex" data-m-stamp="0.25" data-m-stamp-at="top 45%">
          <Piece
            width={286.925}
            height={273.695}
            max={0.9}
            className="w-full max-w-[260px]"
          >
            <div className="absolute top-0 left-0 flex h-[273.695px] w-[286.925px] items-center justify-center">
              <div className="flex-none rotate-[-28.31deg]">
                <div className="relative h-[190.642px] w-[223.214px]">
                  <div className="absolute inset-[-2.24%_-1.65%_-1.92%_-2.07%]">
                    <img
                      alt=""
                      className="block size-full max-w-none"
                      src="/figma/vector49.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-[98.14px] left-[71.85px] flex h-[79.064px] w-[155.588px] items-center justify-center">
              <div className="flex-none rotate-[-13.31deg]">
                <div className="relative font-rotonto text-[21.076px] leading-[0] whitespace-nowrap text-[#74d4f0]">
                  <p className="mb-0 leading-[22.992px] whitespace-pre">
                    {GUIDELINES.sticker[0]}
                  </p>
                  <p className="leading-[22.992px] whitespace-pre">
                    {GUIDELINES.sticker[1]}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-[86.63px] left-[126.07px] flex h-[21.996px] w-[20.829px] items-center justify-center">
              <div className="flex-none rotate-[-28.31deg]">
                <div className="relative h-[17.244px] w-[14.37px]">
                  <div className="absolute inset-[-13.89%_-16.67%]">
                    <img
                      alt=""
                      className="block size-full max-w-none"
                      src="/figma/vector51.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-[167.75px] left-[145.33px] flex h-[25.835px] w-[19.892px] items-center justify-center">
              <div className="flex-none rotate-[-13.31deg]">
                <p className="relative font-rotonto text-[21.076px] leading-[22.992px] tracking-[4.2152px] whitespace-nowrap text-white">
                  !!
                </p>
              </div>
            </div>
          </Piece>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- faqs */

function MobileFAQs() {
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

    setFlickState({ outgoingIndex: currentIdx, phase: "out" });

    setTimeout(() => {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCategory) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCategory, flickState, isOpen]);

  return (
    <section
      aria-label="Frequently Asked Questions"
      className={`${COL} ${PAD} overflow-x-clip pt-14 pb-20 select-none`}
    >
      {/* Header */}
      <div className="border-t-[1.2px] border-[#fa1a1d] pt-4 mb-6">
        <h2 className="text-[24px] font-rotonto font-light text-[#fa1a1d] tracking-[0.05em] uppercase">
          {FAQS.heading}
        </h2>
      </div>

      {/* 2x2 Grid of Folder Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 max-w-[440px] mx-auto w-full">
        {FAQS.categories.map((category) => {
          const frontPaper = category.questions[0];

          return (
            <div
              key={category.id}
              onClick={() => handleOpen(category)}
              role="button"
              tabIndex={0}
              aria-label={`${category.subtitle} FAQs`}
              className={`group relative h-[345px] w-full cursor-pointer transition-all duration-300 ease-out active:scale-[0.96] ${
                openingCardId === category.id ? "scale-[1.03] -translate-y-2 z-20 shadow-xl" : ""
              }`}
            >
              {/* Back Plate */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[290px] rounded-[18px] border-[0.8px] border-black transition-all duration-300 shadow-md"
                style={{ backgroundColor: category.color }}
              />

              {/* Fanned Paper Sheets Inside Pocket */}
              <div
                className={`absolute bottom-[20px] left-0 right-0 h-[315px] pointer-events-none transition-transform duration-300 ease-out ${
                  openingCardId === category.id ? "-translate-y-12" : ""
                }`}
              >
                {/* Sheet 1 */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-5 left-[6%] w-[88%] h-[250px] bg-[#f5f6f3] border border-neutral-300/80 shadow-sm rounded-[18px] rotate-[2.5deg] origin-bottom"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(140, 214, 238, 0.35) 13px, rgba(140, 214, 238, 0.35) 14px)",
                  }}
                />

                {/* Sheet 2 */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-3 left-[6%] w-[88%] h-[252px] bg-[#f8f9f6] border border-neutral-300/90 shadow-sm rounded-[18px] rotate-[1deg] origin-bottom"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(140, 214, 238, 0.35) 13px, rgba(140, 214, 238, 0.35) 14px)",
                  }}
                />

                {/* Sheet 3 */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-2.5 left-[6%] w-[88%] h-[250px] bg-[#f8f9f6] border border-neutral-300/80 shadow-sm rounded-[18px] rotate-[-1deg] origin-bottom"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(140, 214, 238, 0.35) 13px, rgba(140, 214, 238, 0.35) 14px)",
                  }}
                />

                {/* Sheet 4 (Front Main Paper) */}
                <div className="absolute bottom-0 left-[4%] w-[92%] h-[255px] bg-[#fdfdfb] border border-neutral-300/95 shadow-md rounded-[18px] rotate-[-2.5deg] origin-bottom overflow-hidden flex flex-col justify-start">
                  <div className="pt-2 px-2.5">
                    <div className="font-rotonto text-[8.5px] text-neutral-700 uppercase truncate">
                      {category.subtitle}
                    </div>
                  </div>
                  <div className="mt-1 border-t border-[#8cd6ee]" />
                  <div className="px-2.5 py-1.5 font-rotonto font-semibold text-[10.5px] leading-[1.25] text-black line-clamp-3">
                    1. {frontPaper.q}
                  </div>
                  <div className="border-t border-[#8cd6ee]" />
                  <div
                    className="flex-1 p-2"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(140, 214, 238, 0.35) 12px, rgba(140, 214, 238, 0.35) 13px)",
                    }}
                  >
                    <div className="flex items-start gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-0.5" />
                      <span className="font-rotonto text-[8px] leading-tight text-neutral-800 line-clamp-4">
                        {frontPaper.a}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pocket Front Flap */}
              <div className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-none">
                <svg
                  viewBox="0 0 160 220"
                  fill="none"
                  className="w-full h-full block"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 126 L 112 16 H 160 V 202 A 18 18 0 0 1 142 220 H 18 A 18 18 0 0 1 0 202 Z"
                    fill={category.color}
                  />
                  <path
                    d="M 0 126 L 112 16 H 160 V 202 A 18 18 0 0 1 142 220 H 18 A 18 18 0 0 1 0 202 Z"
                    stroke="#000000"
                    strokeWidth="0.8"
                  />
                  <line
                    x1="10"
                    y1="202"
                    x2="150"
                    y2="202"
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth="0.8"
                  />
                </svg>

                {/* Title (Right-aligned 3-line) */}
                <div className="absolute bottom-[46px] right-[10px] font-rotonto font-light text-[24px] leading-[0.86] text-right uppercase tracking-tight text-black">
                  {category.title[0]}
                  <br />
                  {category.title[1]}
                  <br />
                  {category.title[2]}
                </div>

                {/* Subtitle */}
                <div className="absolute bottom-[28px] right-[10px] font-rotonto font-light text-[9.5px] text-right tracking-wide lowercase text-black max-w-[90%] truncate">
                  {category.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Paper Stack Modal Dialog */}
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
          {/* Deck Container */}
          <div className="relative flex flex-col items-center justify-center w-full max-w-[320px] sm:max-w-[340px]">
            {/* === The Stack of Pages (Tap to advance) === */}
            {(() => {
              const catIdx = activeCategory ? FAQS.categories.findIndex((c) => c.id === activeCategory.id) : 0;
              const col = catIdx % 2;
              const row = Math.floor(catIdx / 2);
              const mobileX = col === 0 ? -85 : 85;
              const mobileY = row === 0 ? 220 : 380;

              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  style={{
                    transform: isOpen
                      ? "translate3d(0px, 0px, 0px) scale(1) rotate(0deg)"
                      : `translate3d(${mobileX}px, ${mobileY}px, 0px) scale(0.32) rotate(-3deg)`,
                    opacity: isOpen ? 1 : 0,
                    transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 380ms ease-in-out",
                  }}
                  className="relative w-full h-[400px] cursor-pointer"
                >
                  {/* Close Key Button Attached Above Paper */}
                  <div
                    className={`absolute -top-14 right-0 z-50 transition-all duration-200 ${
                      isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <KeyButton
                      color="red"
                      size="compact"
                      className="w-[102px] sm:w-[114px]"
                      icon={<X size={15} className="stroke-[2.5]" />}
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
                        transformStyle = "translate(260px, -35px) rotate(18deg) scale(0.95)";
                        zIndex = 50;
                        opacity = 1;
                        transitionStyle = "transform 220ms ease-out";
                      } else {
                        transformStyle = "translate(6px, -30px) rotate(4deg) scale(0.91)";
                        zIndex = 1;
                        opacity = 1;
                        transitionStyle = "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)";
                      }
                    } else if (flickState?.phase === "out") {
                      if (diff === 1) {
                        zIndex = 30;
                        transformStyle = "translate(0px, 0px) rotate(0deg) scale(1)";
                      } else if (diff === 2) {
                        zIndex = 20;
                        transformStyle = "translate(10px, -10px) rotate(3deg) scale(0.97)";
                      } else if (diff === 3) {
                        zIndex = 10;
                        transformStyle = "translate(-10px, -20px) rotate(-3deg) scale(0.94)";
                      } else {
                        zIndex = 0;
                        opacity = 0;
                        transformStyle = "translate(6px, -30px) rotate(4deg) scale(0.91)";
                      }
                    } else {
                      if (diff === 0) {
                        zIndex = 30;
                        transformStyle = "translate(0px, 0px) rotate(0deg) scale(1)";
                      } else if (diff === 1) {
                        zIndex = 20;
                        transformStyle = "translate(10px, -10px) rotate(3deg) scale(0.97)";
                      } else if (diff === 2) {
                        zIndex = 10;
                        transformStyle = "translate(-10px, -20px) rotate(-3deg) scale(0.94)";
                      } else if (diff === 3) {
                        zIndex = 5;
                        transformStyle = "translate(6px, -30px) rotate(4deg) scale(0.91)";
                      } else {
                        zIndex = 0;
                        opacity = 0;
                        transformStyle = "translate(6px, -30px) rotate(4deg) scale(0.91)";
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
                        className={`absolute inset-0 bg-[#fdfdfb] border border-neutral-400 rounded-[18px] shadow-2xl overflow-hidden flex flex-col justify-start select-none ${
                          isTop ? "cursor-pointer" : "pointer-events-none"
                        }`}
                      >
                        {/* Header */}
                        <div className="pt-2.5 px-3 flex items-center justify-between border-b border-[#8cd6ee]">
                          <span className="font-rotonto text-[9.5px] tracking-wider text-neutral-600 uppercase">
                            FAQ
                          </span>
                          <span className="font-rotonto text-[10px] font-bold text-neutral-800 uppercase tracking-wide truncate">
                            {activeCategory.subtitle}
                          </span>
                        </div>

                        {/* Main Question */}
                        <div className="px-3 py-3 border-b border-[#8cd6ee] bg-white">
                          <h3 className="font-rotonto font-bold text-[15px] leading-snug text-black">
                            {idx + 1}. {faq.q}
                          </h3>
                        </div>

                        {/* Answer Content */}
                        <div
                          className="flex-1 p-3 flex flex-col justify-start overflow-y-auto"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(140, 214, 238, 0.32) 15px, rgba(140, 214, 238, 0.32) 16px)",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-1" />
                            <p className="font-rotonto text-[12.5px] leading-relaxed text-black font-medium">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Bottom Controls Bar (Prev Button, Pagination Dots, Next Button) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`mt-5 flex items-center justify-between w-full px-1 transition-all duration-300 ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              {/* Left Key Button */}
              <KeyButton
                color="blue"
                size="compact"
                className="w-[50px] sm:w-[56px]"
                onClick={() => handlePrev()}
                aria-label="Previous question"
                title="Previous question"
              >
                <ChevronLeft size={20} className="stroke-[2.5]" />
              </KeyButton>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {activeCategory.questions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardIndex(i);
                    }}
                    aria-label={`Go to question ${i + 1}`}
                    className={`h-1.5 transition-all duration-300 cursor-pointer ${
                      i === cardIndex ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              {/* Right Key Button */}
              <KeyButton
                color="blue"
                size="compact"
                className="w-[50px] sm:w-[56px]"
                onClick={() => handleNext()}
                aria-label="Next question"
                title="Next question"
              >
                <ChevronRight size={20} className="stroke-[2.5]" />
              </KeyButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}