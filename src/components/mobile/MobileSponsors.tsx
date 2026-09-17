"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import {
  SPONSOR_HEADING,
  SUPPORTERS,
  TITLE_SPONSOR,
} from "@/components/sections/sponsors/copy";
import { MOBILE } from "@/components/motion/recipes";
import { paperTurn } from "@/components/motion/paper";
import { useInView } from "@/components/useInView";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The phone's answer to the collage's folded newspaper.
 *
 * The collage opens a broadsheet, which works because there is a metre of
 * screen to open it across. On a phone the same sheet scales to type you cannot
 * read, so the paper is dealt out instead: five cards cut from the same edition,
 * one at a time, turned by the scroll the reader is already making.
 *
 * The deck is `MobileTracksDeck`'s, deliberately — a sticky stage holds the
 * card still while a much taller wrapper travels past it, and that travel is
 * what turns the cards. Native scrolling, no hijack, and the two decks on the
 * phone behave the same way as each other.
 *
 * The full 1184px sheet is no longer rendered here at all. It was being scaled
 * to a third of its size, which put 14px newsprint at 4px — present in the
 * document, legible to nobody.
 */

const TEAM_IMG = "/about_us/220a17ad3a3ad4382bb239416e67f3f8e44d6413.webp";
const SPONSOR_LOGO = "/figma/sponsor-butterfly.svg";

const NEWSPRINT = "#ebebe9";
const INK_RED = "#fa1a1d";

const CARD_WIDTH = 316;
/**
 * Tall enough for card four, which is the long one: two partners, two marks and
 * two paragraphs. The content is clipped rather than allowed to spill, so the
 * card has to be sized for its worst case rather than its typical one.
 */
const CARD_HEIGHT = 500;

/** Scroll travel per card. The wrapper is this tall once over, plus the stage. */
const TRAVEL_PER_CARD = 220;
/**
 * Half the stretch, either side of face-on, that a card holds square to the
 * reader before it starts folding away — as a fraction of one card's pass.
 */
const DWELL = 0.28;
/**
 * The stage is a full window tall and sticks to the top of it, so the card it
 * centres is centred on the screen.
 *
 * It used to be a 542px box stuck a tenth of the way down, which put the card
 * high and left a long empty run of page under it — the deck was somewhere near
 * the top of the phone rather than the thing you were looking at. Sticking a
 * window-tall box at 0 and centring inside it needs no fraction at all, and it
 * stays centred at every height without one.
 *
 * The floor is the card plus a little air, for a phone turned on its side with
 * less than the card's own height to give: below that the stage stops shrinking
 * and the card is simply as far up the window as it fits.
 */
const STAGE_MIN = CARD_HEIGHT + 32;
const STAGE_HEIGHT = `max(${STAGE_MIN}px, 100svh)`;

/** Waiting its turn: back in the pile, up and to the right. */
const PILE = { x: 44, y: -28, rotate: 13, skew: 12, scale: 0.9 };
/** Done: gone down and to the left, the way a read page is set aside. */
const EXIT = { x: -172, y: 92, rotate: 14, skew: 13, scale: 0.88 };

/** Zero velocity at both ends, so one card's arrival joins the last one's exit. */
function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** The red `// Something Partner` kicker the sheet sets above every logo. */
function Kicker({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[12.5px] font-light leading-none"
      style={{ color: INK_RED }}
    >
      {children}
    </div>
  );
}

/** A partner's mark and name, at the two sizes the sheet uses them at. */
function Mark({ name, big = false }: { name: string; big?: boolean }) {
  const size = big ? 58 : 38;
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src={SPONSOR_LOGO}
        alt=""
        width={size}
        height={size}
        className="shrink-0 opacity-[0.88] object-contain"
        style={{ width: size, height: size }}
        unoptimized
      />
      <div
        className={
          (big ? "text-[19px]" : "text-[14px]") +
          " font-light leading-[1.08] text-[#3b3b3b]"
        }
      >
        {name}
      </div>
    </div>
  );
}

function Body({ children, size = 12 }: { children: ReactNode; size?: number }) {
  return (
    <p
      className="font-light text-black"
      style={{ fontSize: size, lineHeight: 1.45 }}
    >
      {children}
    </p>
  );
}

/** A rule, the weight the sheet draws them at. */
function Rule({ heavy = false }: { heavy?: boolean }) {
  return (
    <div
      aria-hidden
      className="w-full"
      style={{ borderTop: (heavy ? 2 : 1) + "px solid #000" }}
    />
  );
}

/**
 * The five cards, in the order they are dealt.
 *
 * `label` is what the card is called in the plain list below the deck, which is
 * the version anything not watching an animation gets.
 */
const CARDS: { label: string; body: ReactNode }[] = [
  {
    label: SPONSOR_HEADING.title,
    body: (
      <div className="flex h-full flex-col justify-center gap-5">
        <Rule heavy />
        <div
          className="text-[46px] font-normal leading-[0.9] tracking-tight"
          style={{ color: INK_RED }}
        >
          OUR
          <br />
          SPONSORS
        </div>
        <div
          className="text-[19px] font-light leading-[1.18] tracking-wide"
          style={{ color: INK_RED }}
        >
          {SPONSOR_HEADING.tagline}
        </div>
        <Rule heavy />
        <div className="text-[11px] font-light tracking-[0.04em]">
          VOL. 26 // SPECIAL EDITION
        </div>
      </div>
    ),
  },
  {
    label: "Title sponsor",
    body: (
      <div className="flex h-full flex-col justify-center items-center gap-6 text-center">
        <Rule heavy />
        <Kicker>{TITLE_SPONSOR.header}</Kicker>
        <a
          href={TITLE_SPONSOR.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 active:opacity-75 transition-opacity cursor-pointer"
        >
          <Image
            src="/sponsors/fateh.webp"
            alt="Fateh Education"
            width={240}
            height={80}
            className="h-[64px] w-auto object-contain"
          />
          <div className="mt-1 text-[12px] font-light text-[#666] tracking-[0.02em] max-w-[240px]">
            Backing the builders behind the next big idea.
          </div>
        </a>
        <Rule heavy />
      </div>
    ),
  },
  {
    label: "Partner sponsors",
    body: (
      <div className="flex h-full flex-col justify-center gap-3">
        <div className="text-center">
          <Kicker>{"// THE VINHACK PARTNERS"}</Kicker>
        </div>
        <Rule heavy />
        <div className="grid grid-cols-2 gap-3 py-1">
          {SUPPORTERS.slice(0, 4).map((partner, i) => (
            <a
              key={i}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-between gap-1.5 text-center p-1 active:opacity-75 transition-opacity cursor-pointer"
            >
              <span className="text-[10px] font-normal text-[#fa1a1d] uppercase leading-tight max-w-[130px]">
                {partner.header.includes("MUSIC STREAMING") ? (
                  <>
                    {"// OFFICIAL MUSIC"}
                    <br />
                    STREAMING PARTNER
                  </>
                ) : (
                  partner.header
                )}
              </span>
              <div className="flex items-center justify-center h-[42px] my-auto">
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={110}
                    height={38}
                    className="max-h-[36px] w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#00b4d8] flex items-center justify-center text-white shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                    <span className="text-[15px] font-bold text-[#0f172a]">JioSaavn</span>
                  </div>
                )}
              </div>
              <div className="text-[9.5px] font-light text-[#666] leading-tight">
                {partner.tagline}
              </div>
            </a>
          ))}
        </div>
        <Rule heavy />
      </div>
    ),
  },
];

const COUNT = CARDS.length;

export default function MobileSponsors() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  /** The card that was face-on last frame, so a turn is a sound exactly once
   *  rather than on every one of the hundred updates a scrub makes. */
  const activeRef = useRef(-1);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const mm = gsap.matchMedia();

      /**
       * `p` runs 0 to COUNT-1; card `i` is face-on at exactly `p === i`.
       * Everything is derived from `d = p - i`, so a card only ever knows how
       * far past it the deck has got — coming forward below zero, leaving above.
       */
      const render = (p: number, sound: boolean) => {
        for (let i = 0; i < COUNT; i++) {
          const el = cardRefs.current.get(i);
          const content = contentRefs.current.get(i);
          if (!el) continue;

          const raw = p - i;
          const d = gsap.utils.clamp(-1, 1, raw);
          // Cards further back than the next one step away again, so the pile
          // reads as several cards deep and slides forward as the deck advances.
          const behind = Math.min(3, Math.max(0, -raw - 1));

          const away = Math.max(0, (Math.abs(d) - DWELL) / (1 - DWELL));
          const t = smooth(1 - away);
          const from = d <= 0 ? PILE : EXIT;

          gsap.set(el, {
            x: mix(from.x, 0, t) + behind * 14,
            y: mix(from.y, 0, t) - behind * 8,
            rotate: mix(from.rotate, 0, t),
            skewX: mix(from.skew, 0, t),
            scale: mix(from.scale, 1, t),
            // Only the outgoing card fades; the next one is simply behind it.
            opacity: d <= 0 ? 1 : smooth(1 - Math.min(1, away * 1.8)),
          });
          // The face only prints while the card is square to the reader; at an
          // angle it would be unreadable anyway.
          if (content) {
            gsap.set(content, { opacity: smooth(1 - Math.min(1, away * 1.9)) });
          }
        }

        const active = Math.min(COUNT - 1, Math.max(0, Math.round(p)));

        if (sound && active !== activeRef.current) {
          // Not on the first paint: arriving at the section is not a page turn,
          // and a noise nobody asked for is the one thing worse than no noise.
          if (activeRef.current !== -1) paperTurn();
          activeRef.current = active;
        }
      };

      mm.add(MOBILE + " and (prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: wrap,
          // The stage sticks the moment the wrapper's top reaches the window's,
          // which is where its own travel begins.
          start: "top top",
          // Exactly the distance the stage can stay stuck for, so the last card
          // lands just as the deck lets go — independent of viewport height,
          // which a `bottom`-relative end is not.
          end: "+=" + COUNT * TRAVEL_PER_CARD,
          scrub: 0.2,
          onUpdate: (self) => render(self.progress * (COUNT - 1), true),
          // A refresh is a re-measure, not a turn: it must not make a noise.
          onRefresh: (self) => render(self.progress * (COUNT - 1), false),
        });
        render(0, false);
        return () => st.kill();
      });

      // Reduced motion gets the same five cards as a plain column: no pile, no
      // travel, no sticky stage, no sound — every face square and readable.
      mm.add(MOBILE + " and (prefers-reduced-motion: reduce)", () => {
        const stage = wrap.querySelector<HTMLElement>("[data-deck-stage]");
        const rail = wrap.querySelector<HTMLElement>("[data-deck-rail]");
        const touched: HTMLElement[] = [];

        const lay = (
          el: HTMLElement | null,
          css: Partial<CSSStyleDeclaration>,
        ) => {
          if (!el) return;
          Object.assign(el.style, css);
          touched.push(el);
        };

        lay(wrap, { height: "auto" });
        lay(stage, { position: "static", height: "auto", display: "block" });
        lay(rail, { width: "auto", height: "auto" });

        for (let i = 0; i < COUNT; i++) {
          const el = cardRefs.current.get(i);
          const content = contentRefs.current.get(i);
          lay(el ?? null, { position: "relative", marginBottom: "18px" });
          if (el) {
            gsap.set(el, {
              x: 0,
              y: 0,
              rotate: 0,
              skewX: 0,
              scale: 1,
              opacity: 1,
            });
          }
          if (content) gsap.set(content, { opacity: 1 });
        }

        return () => touched.forEach((el) => el.removeAttribute("style"));
      });

      return () => mm.revert();
    },
    { scope: wrapRef },
  );

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="relative mx-auto w-full max-w-[560px] px-4 py-10"
    >
      <h2 className="sr-only">
        {SPONSOR_HEADING.title} — {SPONSOR_HEADING.tagline}
      </h2>

      <div
        ref={wrapRef}
        className="relative"
        style={{
          height: `calc(${COUNT * TRAVEL_PER_CARD}px + ${STAGE_HEIGHT})`,
        }}
      >
        {/* Only one card is square to the reader at a time, and only part-way
            through a scroll, so the edition is given plainly here and the deck
            itself is hidden from assistive tech. */}
        <ul className="sr-only">
          {CARDS.map((card) => (
            <li key={card.label}>{card.label}</li>
          ))}
        </ul>

        <div
          data-deck-stage
          className="sticky top-0 flex items-center justify-center"
          style={{ height: STAGE_HEIGHT }}
          aria-hidden
        >
          <div
            data-deck-rail
            className="relative"
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            {CARDS.map((card, i) => (
              <div
                key={card.label}
                ref={(el) => {
                  if (el) cardRefs.current.set(i, el);
                  else cardRefs.current.delete(i);
                }}
                className="absolute inset-0 origin-center will-change-transform"
                style={
                  {
                    // Later cards sit under earlier ones, so the pile is dealt
                    // from the top the way a deck actually is.
                    zIndex: COUNT - i,
                    backgroundColor: NEWSPRINT,
                    boxShadow:
                      "0 18px 40px rgba(0,0,0,0.42), 0 3px 10px rgba(0,0,0,0.24)",
                    border: "1px solid rgba(0,0,0,0.14)",
                  } as CSSProperties
                }
              >
                <div
                  ref={(el) => {
                    if (el) contentRefs.current.set(i, el);
                    else contentRefs.current.delete(i);
                  }}
                  className="h-full w-full overflow-hidden px-4 py-4 text-left text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif]"
                >
                  {card.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
