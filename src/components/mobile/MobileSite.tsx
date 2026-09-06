import type { CSSProperties } from "react";

import CameraFeed from "@/components/CameraFeed";
import MobileTimeline from "@/components/mobile/MobileTimeline";
import Piece from "@/components/mobile/Piece";
import PassCard from "@/components/pass/PassCard";
import ShutterButton from "@/components/pass/ShutterButton";
import { PASS_START } from "@/components/pass/variants";
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
      <MobileProjects />
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

function MobileHero() {
  return (
    <section aria-label="VinHack" className={`${COL} ${PAD} pt-6 pb-12`}>
      <div className="flex items-baseline justify-between text-[15px] tracking-[0.08em]">
        <span className="text-[#7a7a7a]">{HERO.nav.lead}</span>
        <span className="text-[#2849cb]">{HERO.nav.follow}</span>
      </div>

      {/* The wordmark ships as two layers — the solid lettering and the offset
          outline drawn behind it — which stack back to exactly the Figma
          export. */}
      <h1
        className="relative mt-8 w-full"
        style={{ aspectRatio: "1020.951 / 356.181" }}
      >
        <img
          alt="VinHack"
          className="absolute inset-0 block size-full max-w-none"
          src="/figma/vinhack-fill.svg"
        />
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 block size-full max-w-none"
          src="/figma/vinhack-outline.svg"
        />
      </h1>

      <p className="mt-7 text-[15px] leading-[1.6] text-[#a8a2a2]">
        {HERO.lede}
      </p>

      {/* The three stickers, as a cluster rather than a list.

          Stacked in flow with a gutter each, they came out as three lonely
          objects down a black column — 650px of hero, a third of it gap, and
          105px of dead space beside every one of them. The collage does not do
          that: it tucks them against each other and runs them off the edge of
          the frame. So each one here is pulled back over the last with a
          negative margin and set against alternating margins, which is what
          closes the gaps and gets them overlapping; and the top one bleeds out
          to the screen edge, past the gutter the text keeps.

          The cluster carries its own width cap. These overlaps are horizontal
          as much as vertical, and they come from the pieces being wide relative
          to what holds them — let the reading column widen to its full 560px
          under them and the three spring apart to its edges, leaving a hole in
          the middle exactly where the collage should be. */}
      <div className="relative mx-auto mt-8 max-w-[360px]">
        {/* The git commit bubble. */}
        <Piece
          width={411.659}
          height={207.988}
          max={0.9}
          className="relative z-1 mr-[-20px] ml-auto max-w-[300px]"
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
            <p className="relative font-rotonto text-[22.68px] whitespace-nowrap text-[#bfea88]">
              {HERO.commit}
            </p>
          </div>
        </div>
      </Piece>

        {/* The "Register Now" note, riding up over the bubble's bottom-left.
            Kept at a size where its own type still reads — side by side with
            the folder these scaled to 0.62, and the folder's 12px caption
            arrived at 7px. */}
        <Piece
          width={275.16}
          height={287.765}
          max={0.95}
          className="relative z-3 mt-[-38px] mr-auto ml-0 max-w-[205px]"
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
        </Piece>

        {/* The folder, tucked in under the note's right shoulder. */}
        <Piece
          width={259.685}
          height={212.159}
          max={0.95}
          className="relative z-2 mt-[-72px] mr-0 ml-auto max-w-[218px]"
        >
          <div className="absolute top-[12.86px] left-[11.69px] flex h-[183.439px] w-[196.793px] items-center justify-center">
            <div className="flex-none rotate-[-8.67deg]">
              <div className="relative h-[158.9px] w-[174.839px]">
                <img
                  alt=""
                  className="absolute inset-0 block size-full max-w-none"
                  src="/figma/group48095562.svg"
                />
              </div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute top-[93.63px] left-[114.36px] flex h-[51.079px] w-[132.35px] items-center justify-center">
            <div className="flex-none rotate-[-8.67deg]">
              <p className="relative font-rotonto text-[23.1px] leading-[31.185px] whitespace-nowrap text-center text-[#003b11]">
                {HERO.folder.title}
              </p>
            </div>
          </div>
          <div className="absolute top-[126.13px] left-[179.7px] flex h-[72.702px] w-[71.463px] items-center justify-center">
            <div className="flex-none rotate-[4.33deg]">
              <div className="relative h-[67.872px] w-[66.528px]">
                <div className="absolute inset-[-0.5%_-0.28%_-0.3%_-0.56%]">
                  <img
                    alt=""
                    className="block size-full max-w-none"
                    src="/figma/group48095565.svg"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute top-[119.5px] left-[117.22px] flex h-[47.763px] w-[110.601px] items-center justify-center">
            <div className="flex-none rotate-[-8.67deg]">
              <p className="relative font-rotonto text-[12.1px] leading-[31.185px] whitespace-nowrap text-center text-[#003b11]">
                {HERO.folder.caption}
              </p>
            </div>
          </div>
        </Piece>
      </div>

      <p className="mt-8 text-center text-[13px] tracking-[0.14em] text-white/70">
        {HERO.scroll}
      </p>
    </section>
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

      <div className="mt-10 flex justify-center">
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
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- timeline */

function MobileTimelineSection() {
  return (
    <section aria-label="Timeline" className={`${COL} ${PAD} py-16`}>
      <h2 className="mb-10 text-[44px] text-[#fa1a1d]">{TIMELINE.heading}</h2>
      <MobileTimeline />

      <div className="mt-12 flex justify-center">
        <Piece
          width={185.111}
          height={166.791}
          max={0.95}
          className="max-w-[200px]"
        >
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
        </Piece>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- rules */

function MobileRules() {
  return (
    <section aria-label="Rules" className={`${COL} ${PAD} py-16`}>
      {/* The board the rules are pinned to, with its pin. */}
      <div className="relative">
        <img
          alt=""
          aria-hidden
          className="-top-[26px] -translate-x-1/2 absolute left-1/2 z-1 block h-[62px] w-[48px] max-w-none"
          src="/figma/pin.svg"
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
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Piece
          width={226.452}
          height={195.34}
          max={0.95}
          className="w-full max-w-[240px]"
        >
          <div className="absolute top-0 left-0 flex h-[195.34px] w-[226.452px] items-center justify-center">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="relative h-[195.34px] w-[226.452px]">
                <img
                  alt=""
                  className="absolute inset-0 block size-full max-w-none"
                  src="/figma/group48095564.svg"
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
    </section>
  );
}

/* --------------------------------------------------------- guidelines */

function MobileGuidelines() {
  return (
    <section aria-label="Guidelines" className={`${COL} ${PAD} py-16`}>
      <div className="relative">
        <img
          alt=""
          aria-hidden
          className="-top-[34px] absolute right-2 z-1 block h-[76px] w-[42px] max-w-none"
          src="/figma/pin1.svg"
        />
        <h2 className="text-[38px] text-[#2849cb]">{GUIDELINES.heading}</h2>
      </div>

      <div className="mt-7 space-y-5 text-[15px] leading-[1.6] text-white">
        {GUIDELINES.paragraphs.map((para) => (
          <p key={para}>{para}</p>
        ))}
        <p className="pt-2">{GUIDELINES.tldr}</p>
      </div>

      <div className="mt-10 flex justify-center">
        <Piece
          width={286.925}
          height={273.695}
          max={0.9}
          className="w-full max-w-[300px]"
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
          <img
            alt={REGISTER.heading}
            className="absolute inset-0 block size-full max-w-none"
            src="/figma/register.svg"
          />
        </h2>
        <div className="absolute top-[208.44px] left-[281.96px] h-[134.04px] w-[388.209px]">
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 block size-full max-w-none"
            src="/figma/now.svg"
          />
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
        {FOOTER.tabs.map((tab) => (
          <div
            key={tab.name}
            className="-mb-[10px] rounded-t-[18px] px-6 pt-4 pb-6 text-[24px] last:mb-0"
            style={{ background: tab.band, color: tab.color }}
          >
            {tab.name}
          </div>
        ))}
      </div>

      <div className="pt-8 pb-10" style={{ background: FOOTER.base }}>
        <div className="overflow-clip">
          <div
            className="marquee"
            style={{ "--marquee-duration": "30s" } as CSSProperties}
          >
            <p dir="auto" className="shrink-0 text-[44px] whitespace-nowrap text-black">
              {FOOTER.marquee}
            </p>
            <p aria-hidden dir="auto" className="shrink-0 text-[44px] whitespace-nowrap text-black">
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
