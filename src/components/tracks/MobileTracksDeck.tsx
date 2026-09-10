"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { TrackCard, TRACK_COLORS, trackInk } from "./TrackCard";
import { MOBILE } from "@/components/motion/recipes";
import { TRACKS } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The phone's answer to `TracksCardDeck`.
 *
 * The collage's deck holds the page still and deals cards across the whole
 * screen, which is a mouse gesture — intercepting a touch scroll to do the same
 * thing fights the one input the reader has. So this keeps the page scrolling
 * normally and lets a sticky stage do the holding: the deck stays put while its
 * (much taller) wrapper travels past, and that travel is what deals the cards.
 * Same idea, native scrolling, no hijack.
 *
 * What replaced the old mini-stack is the whole point of it: that was six blank
 * cards whose only motion was a `hover:` translate, and a phone has no hover.
 */

/** The stack's own colours, in the cycle the collage's deck uses. */
const CARD_COLORS = [
  TRACK_COLORS.grey,
  TRACK_COLORS.pink,
  TRACK_COLORS.red,
  TRACK_COLORS.darkBlue,
] as const;

const CARD_WIDTH = 286;
const CARD_HEIGHT = 202;
const COUNT = TRACKS.items.length;

/** Scroll travel per card. The wrapper is this tall once over, plus the stage. */
const TRAVEL_PER_CARD = 340;
/**
 * Half the stretch, either side of face-on, that a card holds square to the
 * reader before it starts folding away — as a fraction of one card's pass.
 * Without it a card is only ever face-on for the single instant it crosses
 * `d === 0`, which is a flicker rather than a card you are given time to read.
 */
const DWELL = 0.34;
const STAGE_HEIGHT = 250;
/** Where the stage sticks, as a fraction of viewport height. */
const STICK_AT = 0.26;

/** Waiting its turn: back in the pile, up and to the right. */
const PILE = { x: 46, y: -30, rotate: 15, skew: 15, scale: 0.9 };
/** Done: gone down and to the left, the way the collage's deck clears a card. */
const EXIT = { x: -168, y: 96, rotate: 15, skew: 15, scale: 0.88 };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Zero velocity at both ends, so one card's arrival joins the last one's exit. */
function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export default function MobileTracksDeck() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const tickRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const mm = gsap.matchMedia();

      /**
       * `p` runs 0 to COUNT; card `i` is face-on at exactly `p === i`.
       * Everything is derived from `d = p - i`, so a card only ever knows how
       * far past it the deck has got — coming forward below zero, leaving above.
       */
      const render = (p: number) => {
        for (let i = 0; i < COUNT; i++) {
          const el = cardRefs.current.get(i);
          const content = contentRefs.current.get(i);
          if (!el) continue;

          const raw = p - i;
          const d = gsap.utils.clamp(-1, 1, raw);
          // Cards further back than the next one step away again, so the pile
          // reads as four cards deep and slides forward as the deck advances.
          const behind = Math.min(3, Math.max(0, -raw - 1));

          // How far outside the dwell the card has got: 0 for the whole stretch
          // it holds face-on, ramping to 1 at either end of its pass. `t` is
          // its mirror — 1 face-on, 0 fully in the pile or fully gone — so one
          // set of mixes covers arriving and leaving alike.
          const away = Math.max(0, (Math.abs(d) - DWELL) / (1 - DWELL));
          const t = smooth(1 - away);
          const from = d <= 0 ? PILE : EXIT;

          gsap.set(el, {
            x: mix(from.x, 0, t) + behind * 15,
            y: mix(from.y, 0, t) - behind * 9,
            rotate: mix(from.rotate, 0, t),
            skewX: mix(from.skew, 0, t),
            scale: mix(from.scale, 1, t),
            // Only the outgoing card fades; the next one is simply behind it.
            // It clears faster than the arriving card comes forward, so the two
            // are not superimposed half-way through the swap.
            opacity: d <= 0 ? 1 : smooth(1 - Math.min(1, away * 1.8)),
          });
          // The face only prints while the card is square to the reader; at an
          // angle it would be unreadable anyway.
          if (content) {
            gsap.set(content, {
              opacity: smooth(1 - Math.min(1, away * 1.9)),
            });
          }
        }

        const active = Math.min(COUNT - 1, Math.max(0, Math.round(p)));
        for (let i = 0; i < COUNT; i++) {
          const tick = tickRefs.current.get(i);
          if (tick) gsap.set(tick, { opacity: i === active ? 1 : 0.25 });
        }
      };

      mm.add(`${MOBILE} and (prefers-reduced-motion: no-preference)`, () => {
        const st = ScrollTrigger.create({
          trigger: wrap,
          start: () => `top top+=${window.innerHeight * STICK_AT}`,
          // Exactly the distance the stage can stay stuck for, so the last card
          // lands just as the deck lets go — independent of viewport height,
          // which a `bottom`-relative end is not.
          end: `+=${COUNT * TRAVEL_PER_CARD}`,
          scrub: 0.4,
          onUpdate: (self) => render(self.progress * (COUNT - 1)),
          onRefresh: (self) => render(self.progress * (COUNT - 1)),
        });
        render(0);
        return () => st.kill();
      });

      // Reduced motion gets the same four cards as a plain column: no pile, no
      // travel, no sticky stage — every face square and readable at once.
      mm.add(`${MOBILE} and (prefers-reduced-motion: reduce)`, () => {
        const stage = wrap.querySelector<HTMLElement>("[data-deck-stage]");
        const rail = wrap.querySelector<HTMLElement>("[data-deck-rail]");
        const ticks = wrap.querySelector<HTMLElement>("[data-deck-ticks]");
        const touched: HTMLElement[] = [];

        const lay = (el: HTMLElement | null, css: Partial<CSSStyleDeclaration>) => {
          if (!el) return;
          Object.assign(el.style, css);
          touched.push(el);
        };

        lay(wrap, { height: "auto" });
        lay(stage, { position: "static", height: "auto", display: "block" });
        lay(rail, { width: "auto", height: "auto" });
        lay(ticks, { display: "none" });

        for (let i = 0; i < COUNT; i++) {
          const el = cardRefs.current.get(i);
          const content = contentRefs.current.get(i);
          lay(el ?? null, { position: "relative", marginBottom: "18px" });
          if (el) {
            gsap.set(el, { x: 0, y: 0, rotate: 0, skewX: 0, scale: 1, opacity: 1 });
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
    <div
      ref={wrapRef}
      className="relative my-8 overflow-hidden"
      style={{ height: COUNT * TRAVEL_PER_CARD + STAGE_HEIGHT }}
    >
      {/* Only one card is square to the reader at a time, and only part-way
          through a scroll, so the tracks are given plainly here and the deck
          itself is hidden from assistive tech. */}
      <ul className="sr-only">
        {TRACKS.items.map((item) => (
          <li key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.blurb}</p>
          </li>
        ))}
      </ul>

      <div
        className="sticky flex items-center justify-center"
        style={{ top: `${STICK_AT * 100}vh`, height: STAGE_HEIGHT }}
        data-deck-stage
      >
        <div
          className="relative"
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          data-deck-rail
        >
          {TRACKS.items.map((item, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            const { ink, rule } = trackInk(color);

            return (
              <div
                key={item.title}
                ref={(node) => {
                  if (node) cardRefs.current.set(i, node);
                  else cardRefs.current.delete(i);
                }}
                className="absolute left-0 top-0 will-change-transform"
                style={{ zIndex: COUNT - i, transformOrigin: "center center" }}
                aria-hidden
              >
                <TrackCard
                  color={color}
                  isFront={i === 0}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                >
                  <div
                    ref={(node) => {
                      if (node) contentRefs.current.set(i, node);
                      else contentRefs.current.delete(i);
                    }}
                    className="absolute inset-0 flex flex-col justify-between p-4"
                    style={{ color: ink }}
                  >
                    <span className="font-rotonto text-[8px] uppercase tracking-[0.3em]">
                      Track {pad(i + 1)} / {pad(COUNT)}
                    </span>
                    <div>
                      <div
                        className="mb-2 h-px w-full"
                        style={{ background: rule }}
                      />
                      <h3 className="font-rotonto text-[21px] leading-[0.96] tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 font-rotonto text-[9.5px] leading-[1.45] tracking-tight opacity-80">
                        {item.blurb}
                      </p>
                    </div>
                  </div>
                </TrackCard>
              </div>
            );
          })}
        </div>

        {/* Which of the four is face-on. */}
        <div
          className="absolute -bottom-1 left-0 flex w-full justify-center gap-2"
          data-deck-ticks
        >
          {TRACKS.items.map((item, i) => (
            <span
              key={item.title}
              ref={(node) => {
                if (node) tickRefs.current.set(i, node);
                else tickRefs.current.delete(i);
              }}
              className="h-px w-6 bg-[#fa1a1d]"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
