import type { CSSProperties, ReactNode } from "react";

import CameraFeed from "@/components/CameraFeed";
import QrArt, { QR_STICKER } from "@/components/hero/QrArt";
import ScrollCue, { SCROLL_CUE } from "@/components/hero/ScrollCue";
import SpeakerArt from "@/components/hero/SpeakerArt";
import MobileTimeline from "@/components/mobile/MobileTimeline";
import Piece from "@/components/mobile/Piece";
import RegisterSvg from "@/components/RegisterSvg";
import NowSvg from "@/components/NowSvg";
import PassCard from "@/components/pass/PassCard";
import ShutterButton from "@/components/pass/ShutterButton";
import { PASS_START } from "@/components/pass/variants";
import { FEATURES } from "@/content/features";
import {
  ABOUT,
  FOOTER,
  GUIDELINES,
  HERO,
  PASS,
  PROJECTS,
  REGISTER,
  RULES,
  TIMELINE,
  TRACKS,
  WHO_ARE_WE,
} from "@/content/site";

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
const COL = "mx-auto max-w-[560px]";

export default function MobileSite() {
  return (
    <div className="md:hidden bg-black text-[#fcfcfc]">
      <MobileHero />
      <MobileAbout />
      <MobileWhoAreWe />
      {FEATURES.projects && <MobileProjects />}
      <MobileTracks />
      <MobileTimelineSection />
      <MobileRules />
      <MobileGuidelines />
      <MobileRegister />
      <MobileFooter />
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
const STAGE = { width: 393, height: 682 };

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
      style={{ left: x, top: y, width: w * scale, height: h * scale }}
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
      className="deal-in absolute [--deal-delay:1.5s]"
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
        className="flex min-h-[100svh] flex-col justify-center overflow-clip px-2 py-8"
      >
        <Piece
          width={STAGE.width}
          height={STAGE.height}
          max={1.7}
          className="mobile-stage w-full"
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
            className="deal-in absolute [--deal-delay:1.05s] [--deal-s:0.86]"
            style={{ left: 18, top: 236, width: 344, height: 200 }}
          >
            <div className="size-full rotate-[-8deg] rounded-[50%] border border-white/30" />
          </div>
          <Spark x={240} y={244} size={20} />
          <Spark x={116} y={424} size={16} />

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
            className="neon-sign absolute z-10"
            style={{ left: 32, top: 272, width: 330, height: 115.14 }}
          >
            <img
              alt="VinHack"
              className="neon-fill absolute inset-0 block size-full max-w-none"
              src="/figma/vinhack-fill.svg"
            />
            <img
              alt=""
              aria-hidden
              className="neon-tube absolute inset-0 block size-full max-w-none"
              src="/figma/vinhack-outline.svg"
            />
          </h1>

          {/* The stickers, dealt in behind the sign a beat apart — each thrown
              from the side it already sits on, which is the same deal
              `HeroMotion` runs on the collage. The offsets go on the placed
              box, outside the scale that carries the artwork, so the two
              transforms never meet. */}

          {/* The git commit bubble. */}
          <Placed
            x={8}
            y={168}
            w={411.659}
            h={207.988}
            scale={0.5}
            className="deal-in z-20 [--deal-delay:1.15s] [--deal-r:-6deg] [--deal-x:-44px]"
          >
            <div className="absolute top-0 left-0 flex h-[207.988px] w-[411.659px] items-center justify-center">
              <div className="flex-none rotate-[-7.85deg]">
                <div className="relative h-[155.601px] w-[394.094px]">
                  <img
                    alt=""
                    className="absolute inset-0 size-full max-w-none object-cover"
                    src="/figma/image205.png"
                  />
                </div>
              </div>
            </div>
            <div className="absolute top-[21.19px] left-[25.46px] flex h-[162.336px] w-[359.724px] items-center justify-center">
              <div className="flex-none rotate-[-7.85deg]">
                <div className="relative h-[115.993px] w-[347.131px]">
                  <img
                    alt=""
                    className="absolute inset-0 block size-full max-w-none"
                    src="/figma/ellipse50.svg"
                  />
                </div>
              </div>
            </div>
            <div className="absolute top-[68.06px] left-[60.48px] flex h-[67.097px] w-[290.935px] items-center justify-center">
              <div className="-rotate-8 flex-none">
                <p className="relative font-rotonto text-[21.35px] whitespace-nowrap text-[#bfea88]">
                  {HERO.commits[0]}
                </p>
              </div>
            </div>
          </Placed>

          {/* The speaker sticker — the page's sound switch, and a real one
              here: `motion/speaker.ts` wires whichever copy is on screen, so
              muting from the phone is the same switch as muting from the
              collage. */}
          <Placed
            x={298}
            y={196}
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

          {/* The QR sticker. Every piece of it is positioned in the 1280 x 832
              plate the collage draws it on — several in percentages of that
              plate and eight in container query units — so it cannot be
              re-based onto a box its own size. The plate comes with it instead,
              and a hole the size of the sticker is cut over the part of it that
              is the sticker. See `QR_STICKER` in hero/QrArt. */}
          <Placed
            x={270}
            y={404}
            w={QR_STICKER.width}
            h={QR_STICKER.height}
            scale={0.37}
            className="deal-in z-20 [--deal-delay:1.35s] [--deal-x:40px] [--deal-y:26px]"
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

          {/* The keycap. Drawn as a key already — a wide plate at 75% opacity
              with a smaller, brighter cap up and to the left of it, which is
              the parallax of a cap standing above its well — so it presses
              under a finger too. `MobileMotion` drives the cap. */}
          <Placed
            x={14}
            y={398}
            w={102.721}
            h={105.868}
            scale={0.6}
            className="deal-in z-20 cursor-pointer [--deal-delay:1.45s] [--deal-r:-16deg] [--deal-x:-36px]"
            data-hero="key"
          >
            <div className="absolute top-[5.07px] left-[1.47px] flex h-[100.797px] w-[101.247px] items-center justify-center">
              <div className="flex-none rotate-[-16.21deg]">
                <div className="relative h-[81.18px] w-[81.84px] rounded-[15.84px] border-[1.32px] border-[#74d4f0] border-solid bg-[#2b24fc] opacity-75" />
              </div>
            </div>
            <div className="absolute top-[2.48px] left-[6.52px] flex h-[85.705px] w-[85.256px] items-center justify-center">
              <div className="flex-none rotate-[-16.21deg]">
                <div className="relative h-[69.3px] w-[68.64px] rounded-[15.84px] border-[1.32px] border-[#74d4f0] border-solid bg-[#2b24fc] opacity-95" />
              </div>
            </div>
            <div className="absolute top-[86.26px] left-[27.44px] flex h-[9.713px] w-[2.675px] items-center justify-center">
              <div className="flex-none rotate-[105.4deg]">
                <div className="relative h-0 w-[10.074px]">
                  <div className="absolute inset-[-1.32px_0_0_0]">
                    <img alt="" className="block size-full max-w-none" src="/figma/line20.svg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-[68.86px] left-[87.61px] flex h-[6.765px] w-[7.465px] items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-[42.18deg]">
                <div className="relative h-0 w-[10.074px]">
                  <div className="absolute inset-[-1.32px_0_0_0]">
                    <img alt="" className="block size-full max-w-none" src="/figma/line21.svg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute contents">
              <div className="-translate-y-1/2 absolute top-[26.5px] left-[37.39px] flex h-[32.403px] w-[14.694px] items-center justify-center">
                <div className="flex-none rotate-[-16.21deg]">
                  <div className="relative flex flex-col justify-center font-rotonto text-[26.4px] leading-[0] whitespace-nowrap text-[#74d4f0]">
                    <p className="leading-[normal]">:</p>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute top-[49.95px] left-[44.21px] flex h-[32.403px] w-[14.694px] items-center justify-center">
                <div className="flex-none rotate-[-16.21deg]">
                  <div className="relative flex flex-col justify-center font-rotonto text-[26.4px] leading-[0] whitespace-nowrap text-[#74d4f0]">
                    <p className="leading-[normal]">;</p>
                  </div>
                </div>
              </div>
            </div>
          </Placed>

          {/* The "Register Now" note. Held tight to the left edge and no wider
              than 127: the cue's curved line starts at x 147, and a note any
              further across sits on top of the first four letters of "scroll
              down for more" — which is the one piece of type on this screen
              that has a job to do. */}
          <Placed
            x={8}
            y={486}
            w={275.16}
            h={287.765}
            scale={0.46}
            className="deal-in z-30 [--deal-delay:1.55s] [--deal-r:-8deg] [--deal-x:-40px]"
          >
            <div className="absolute top-[153.84px] left-[35.59px] flex h-[75.214px] w-[61.123px] items-center justify-center">
              <div className="flex-none rotate-[-19.9deg]">
                <div className="relative h-[64.969px] w-[41.491px]">
                  <img
                    alt=""
                    className="absolute inset-0 block size-full max-w-none"
                    src="/figma/vector30.svg"
                  />
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-[0.15px] flex h-[287.712px] w-[275.017px] items-center justify-center">
              <div className="flex-none rotate-[-20.16deg]">
                <div className="relative h-[229.918px] w-[208.546px]">
                  <img
                    alt=""
                    className="absolute inset-0 block size-full max-w-none"
                    src="/figma/vector31.svg"
                  />
                </div>
              </div>
            </div>
            <div className="absolute top-[89.89px] left-[68.55px] flex h-[94.214px] w-[125.248px] items-center justify-center">
              <div className="flex-none rotate-[13.5deg]">
                <div className="relative font-rotonto text-[28.8px] leading-[0] whitespace-nowrap text-black">
                  <p className="mb-0 leading-[normal]">{HERO.note[0]}</p>
                  <p className="leading-[normal]">{HERO.note[1]}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-[146.14px] left-[142.82px] flex size-[34.438px] items-center justify-center">
              <div className="flex-none rotate-[-4.55deg]">
                <div className="relative size-[32px] rounded-[27.2px] bg-[#ff4337]" />
              </div>
            </div>
            <div className="absolute top-[148.7px] left-[149.9px] flex h-[26.333px] w-[21.899px] items-center justify-center">
              <div className="flex-none rotate-[13.5deg]">
                <p className="relative font-rotonto text-[19.2px] whitespace-nowrap text-black">
                  →
                </p>
              </div>
            </div>
          </Placed>

          {/* The scroll cue, exactly the collage's — the LED disc with the
              arrow falling through it and "scroll down for more" curving
              underneath. Same drawing (`hero/ScrollCue`), same roles, so
              `MobileMotion` finds and wires it the way `HeroMotion` does. */}
          <Placed
            x={130}
            y={450}
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
    <section aria-label="About VinHack" className={`${COL} ${PAD} py-16`}>
      <h2 className="text-[40px] leading-[1.05] text-[#fc2425]">
        {ABOUT.heading}
      </h2>

      <div className="mt-7 space-y-5 text-[15px] leading-[1.65] tracking-[0.02em] text-[#fc2425]">
        {ABOUT.paragraphs.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <AttendeePass />
      </div>
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
      max={0.92}
      className="w-full max-w-[360px]"
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
              className={`absolute font-rotonto text-[17.6px] whitespace-nowrap text-[#105266] ${
                i === 0 ? "-translate-x-1/2 text-center" : "-translate-x-full text-right"
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

/* -------------------------------------------------------- who are we */

function MobileWhoAreWe() {
  return (
    <section aria-label="Who are we" className="py-16">
      <div className="overflow-clip">
        {/* Twice over, so translating the row by exactly half its width loops
            seamlessly. The spacing between copies is each copy's own trailing
            padding rather than a flex `gap` — a gap sits *between* the two and
            not after the second, so half the row would no longer be one whole
            copy and the seam would drift. */}
        <div
          className="marquee"
          style={{ "--marquee-duration": "18s" } as CSSProperties}
        >
          <h2 className="shrink-0 pr-[40px] text-[56px] whitespace-nowrap text-[#bfea88]">
            {WHO_ARE_WE.heading}
          </h2>
          <p aria-hidden className="shrink-0 pr-[40px] text-[56px] whitespace-nowrap text-[#bfea88]">
            {WHO_ARE_WE.heading}
          </p>
        </div>
      </div>

      <ul className={`${COL} ${PAD} mt-10 space-y-4 text-center text-[16px] tracking-[0.06em] text-[#bfea88]`}>
        {WHO_ARE_WE.taglines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="mt-10 text-center text-[26px] text-[#bfea88]">
        {WHO_ARE_WE.connect}
      </p>
    </section>
  );
}

/* ----------------------------------------------------------- projects */

function MobileProjects() {
  return (
    <section aria-label="Projects" className={`${COL} ${PAD} py-16`}>
      <h2 className="text-[20px] text-[#fa1a1d]">{PROJECTS.heading}</h2>
      <div className="mt-3 h-px w-full bg-[#fa1a1d]" />

      {/* The collage overlaps these four at four different sizes; on one column
          they are a grid, which keeps the four-colour block the section reads
          as. */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {PROJECTS.cards.map((card, i) => (
          <div
            key={card.name}
            className={`flex items-center justify-center overflow-clip px-2 ${
              i % 3 === 0 ? "h-[150px]" : "h-[190px]"
            }`}
            style={{ background: card.bg }}
          >
            <p className="text-[24px] text-black">{card.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- tracks */

function MobileTracks() {
  return (
    <section aria-label="Tracks" className={`${COL} ${PAD} py-16`}>
      <div className="border-t border-[#fa1a1d]">
        {TRACKS.lines.map((line, i) => {
          const Tag = i === 1 ? "h2" : "p";
          return (
            <div
              key={line}
              className="flex items-center gap-3 border-b border-[#fa1a1d] py-4"
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

      <div className="coming-soon-wrap mt-10 flex justify-center">
        <p className="coming-soon relative text-center text-[24px] text-[#bfea88]">
          {TRACKS.comingSoon}
        </p>
      </div>

      {FEATURES.tracks && <div className="mt-10 flex justify-center">
        <Piece
          width={270.424}
          height={211.237}
          max={0.85}
          className="w-full max-w-[280px]"
        >
          <div className="absolute top-0 left-0 h-[211.237px] w-[270.424px]">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src="/figma/union6.svg"
            />
          </div>
          <div className="-translate-x-1/2 absolute top-[57.96px] left-[135.54px] flex h-[94.349px] w-[248.313px] items-center justify-center">
            <div className="flex-none rotate-[-8.3deg]">
              <p className="relative w-[242.187px] font-rotonto text-[24.84px] text-center text-[#2849cb]">
                {TRACKS.sticker}
              </p>
            </div>
          </div>
        </Piece>
      </div>}
    </section>
  );
}

/* ----------------------------------------------------------- timeline */

/**
 * One of the timeline's loose stickers.
 *
 * The collage scatters six of these round the receipt printer, stamps them down
 * as the section arrives and then lets the visitor pick them up and move them —
 * or throw them off the page. The phone gets the same thing, in the one shape a
 * column has room for: a row above the schedule and a row below it.
 *
 * The wrapper is what carries the motion, not the `Piece` inside it: `stampIn`
 * and `draggable` both write a transform, and `Piece`'s plate already has one
 * of its own for the scale. Two transforms, two boxes, and neither overwrites
 * the other.
 */
function Loose({
  width,
  height,
  max,
  size,
  stamp,
  className,
  children,
}: {
  width: number;
  height: number;
  max: number;
  /** How wide the sticker sits in the row, in px. */
  size: number;
  /** Seconds after the row is reached that this one lands. */
  stamp: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`shrink-0 ${className ?? ""}`}
      style={{ width: size }}
      data-m-drag
      data-m-stamp={stamp}
    >
      <Piece width={width} height={height} max={max}>
        {children}
      </Piece>
    </div>
  );
}

function MobileTimelineSection() {
  return (
    <section aria-label="Timeline" className={`${COL} ${PAD} py-16`}>
      {/* The two that ride above the schedule. */}
      <div className="mb-10 flex items-end justify-center gap-4">
        <Loose width={204.814} height={147} max={0.8} size={140} stamp={0}>
          <div className="absolute inset-0 overflow-hidden">
            <img
              alt=""
              className="absolute top-[-12.2%] left-0 h-[131.71%] w-full max-w-none"
              src="/figma/image235.png"
            />
          </div>
        </Loose>

        <Loose width={136.85} height={134.841} max={0.9} size={108} stamp={0.12}>
          <div className="absolute top-0 left-0 flex h-[134.841px] w-[136.85px] items-center justify-center">
            <div className="flex-none rotate-[-13.5deg]">
              <div className="relative h-[111.295px] w-[114.013px]">
                <img
                  alt=""
                  className="absolute inset-0 size-full max-w-none object-cover"
                  src="/figma/image234.png"
                />
              </div>
            </div>
          </div>
        </Loose>
      </div>

      <h2 className="mb-10 text-[44px] text-[#fa1a1d]">{TIMELINE.heading}</h2>
      <MobileTimeline />

      {/* And the three below it. */}
      <div className="mt-12 flex flex-wrap items-start justify-center gap-4">
        <Loose width={185.111} height={166.791} max={0.95} size={150} stamp={0.24}>
          <div className="absolute top-0 left-0 flex h-[166.791px] w-[185.111px] items-center justify-center">
            <div className="flex-none rotate-[-14.05deg] skew-x-[-1.48deg]">
              <div className="relative h-[130.714px] w-[161.483px]">
                <div className="absolute inset-[-2.2%_-1.64%_-1.9%_-2.08%]">
                  <img
                    alt=""
                    className="block size-full max-w-none"
                    src="/figma/sticker.svg"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-[48.11px] left-[37.89px] flex h-[83.826px] w-[123.225px] items-center justify-center">
            <div className="flex-none rotate-15">
              <div className="relative h-[56.669px] w-[112.388px] font-rotonto text-[14.753px] leading-[0] tracking-[2.9506px] whitespace-pre-wrap text-[#db9eef]">
                <p className="mb-0 leading-[16.094px]">{TIMELINE.sticker[0]}</p>
                <p className="leading-[16.094px]">{TIMELINE.sticker[1]}</p>
              </div>
            </div>
          </div>
        </Loose>

        {/* The collage sizes this one in container query units off its own box,
            so the box has to be exactly the size the design gives it — 160.514
            x 164.786 — for the `cqw` and `cqh` inside to resolve to what Figma
            drew. `Piece` then scales the whole thing. */}
        <Loose width={160.514} height={164.786} max={0.9} size={116} stamp={0.36}>
          <div
            className="absolute top-0 left-0 flex h-[164.786px] w-[160.514px] items-center justify-center"
            style={{ containerType: "size" }}
          >
            <div className="flex-none h-[hypot(34.0099cqw,69.1918cqh)] w-[hypot(65.9901cqw,-30.8082cqh)] rotate-[-25.61deg] skew-x-[-0.02deg]">
              <div className="relative size-full">
                <img
                  alt=""
                  className="absolute inset-0 size-full max-w-none object-cover"
                  src="/figma/image236.png"
                />
              </div>
            </div>
          </div>
        </Loose>

        <Loose width={150.24} height={144.718} max={0.9} size={110} stamp={0.48}>
          <div className="absolute top-0 left-0 flex h-[144.718px] w-[150.24px] items-center justify-center">
            <div className="flex-none rotate-[-7.91deg]">
              <div className="relative h-[127.496px] w-[133.971px]">
                <img
                  alt=""
                  className="absolute inset-0 block size-full max-w-none"
                  src="/figma/image227-vectorized.svg"
                />
              </div>
            </div>
          </div>
        </Loose>
      </div>
    </section>
  );
}

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
          <ul className="mt-6 space-y-4 text-[15px] leading-[1.5] text-[#1c563c]" data-m-reveal>
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
          className="pointer-events-none absolute top-1/2 left-1/2 w-auto -translate-x-1/2 -translate-y-1/2"
          style={{
            height: "calc(218.2% + 210px)",
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

        <div className="relative">
          <img
            alt=""
            aria-hidden
            className="-top-[34px] absolute right-2 z-1 block h-[76px] w-[42px] max-w-none"
            src="/figma/pin1.svg"
          />
          <h2 className="text-[38px] text-[#2849cb]">{GUIDELINES.heading}</h2>
        </div>

        <div className="relative mt-7 space-y-5 text-[15px] leading-[1.6] text-white" data-m-reveal>
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

/* ----------------------------------------------------------- register */

function MobileRegister() {
  return (
    <section aria-label="Register now" className={`${COL} ${PAD} py-16`}>
      {/* Cursive artwork rather than type — the collage draws it on with a
          clip-path; here it is simply present. */}
      <Piece width={779.141} height={342.48}>
        <h2 className="absolute top-0 left-0 h-[327.438px] w-[779.141px]">
          <RegisterSvg className="absolute inset-0 block size-full max-w-none" />
        </h2>
        <div className="absolute top-[208.44px] left-[281.96px] h-[134.04px] w-[388.209px]">
          <NowSvg className="absolute inset-0 block size-full max-w-none" />
        </div>
      </Piece>

      <p className="mt-10 text-center text-[17px] leading-[1.5] text-[#bfea88]">
        {REGISTER.tagline[0]}
        <br aria-hidden />
        {REGISTER.tagline[1]}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------- footer */

function MobileFooter() {
  return (
    <footer className="pt-16">
      {/* The five folder tabs. The collage files them into a drawer, each band
          overlapping the last with only its lip showing; stacked, the lip is
          the whole tab. */}
      <div>
        {FOOTER.tabs.map((tab) => {
          const isExternal = tab.href.startsWith("http");
          return (
            <a
              key={tab.name}
              href={tab.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group -mb-[10px] flex items-center justify-between rounded-t-[18px] px-6 pt-7 pb-6 text-[24px] last:mb-0 no-underline cursor-pointer transition-transform duration-200 active:scale-[0.99]"
              style={{ background: tab.band, color: tab.color }}
            >
              <span className="relative font-rotonto inline-flex items-center">
                <span>{tab.name}</span>
                <span
                  aria-hidden="true"
                  className="absolute left-0 -bottom-1 h-[2px] w-0 bg-current transition-all duration-200 group-hover:w-full group-focus-visible:w-full"
                />
              </span>
              <svg
                aria-hidden="true"
                className="size-6 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          );
        })}
      </div>

      <div className="pt-8 pb-10" style={{ background: FOOTER.base }}>
        <div className="overflow-clip">
          <div
            className="marquee"
            style={{ "--marquee-duration": "30s" } as CSSProperties}
          >
            <p dir="auto" className="scripts shrink-0 text-[44px] whitespace-nowrap text-black">
              {FOOTER.marquee}
            </p>
            <p aria-hidden dir="auto" className="scripts shrink-0 text-[44px] whitespace-nowrap text-black">
              {FOOTER.marquee}
            </p>
          </div>
        </div>

        <div className={`${COL} ${PAD} mt-10 flex items-center justify-center gap-[8px] text-[20px] text-black`}>
          <span>{FOOTER.madeWith[0]}</span>
          <span>{FOOTER.madeWith[1]}</span>
          <img
            alt="love"
            className="block h-[22px] w-[25px] max-w-none"
            src="/figma/vector.svg"
          />
          <span>{FOOTER.madeWith[2]}</span>
          <span>{FOOTER.madeWith[3]}</span>
        </div>

        <div className={`${COL} ${PAD} mt-8 flex items-center gap-[6px] text-[13px] text-black`}>
          <img
            alt=""
            aria-hidden
            className="block size-[12px] max-w-none shrink-0"
            src="/figma/vector1.svg"
          />
          <p>{FOOTER.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
