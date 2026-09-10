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
 * Where it deliberately parts company with the collage is the *shape* of the
 * deal. The collage deals on the diagonal, corner to corner, because a 1280px
 * plate has width to spend and the isometric lean is the drawing's own pose. A
 * phone has no width to spend: the same diagonal on a 390px screen puts the
 * stacks half off the edge and skews the type on the card face at exactly the
 * size it is hardest to read. So the phone deals straight down a single column
 * instead — a stack at the top, one card square in the middle to be read, a
 * stack at the bottom — with no rotation and no skew anywhere in it. The only
 * things that move are `y` and `scale`, which is also the cheapest pair of
 * properties a phone can be asked to animate.
 *
 * Both stacks are real and both are stocked from the first frame, the same way
 * the collage does it: see `SLOTS`.
 */

/** The stack's own colours, in the cycle the collage's deck uses. */
const CARD_COLORS = [
  TRACK_COLORS.grey,
  TRACK_COLORS.pink,
  TRACK_COLORS.red,
  TRACK_COLORS.darkBlue,
] as const;

/* -------------------------------------------------------------- the column */

const CARD_WIDTH = 258;
const CARD_HEIGHT = 182;
const COUNT = TRACKS.items.length;

/**
 * The three zones, in pixels from the middle of the stage.
 *
 * `PILE_OFFSET` is where a stack's front card sits. It is a little tighter than
 * the two half-heights added together, so the card being read overlaps the top
 * of each stack by a few pixels rather than floating in a gap between them —
 * that overlap is what makes the column read as one deck seen edge-on instead
 * of three separate objects.
 */
const PILE_SCALE = 0.58;
const PILE_OFFSET = 126;
/** One card further back in a stack: straight on up (or down) and a shade
 *  smaller. No sideways step and no lean — that is the whole point of this
 *  layout, and a stack of sheets seen square on is what is left. */
const STEP_Y = 7;
const STEP_SHRINK = 0.04;

/** How far back either stack is drawn, and how many blanks stock each one — the
 *  far stack seeded before the deck starts, the near one padding out under the
 *  last track. Shallower than the collage's: a phone stack is ~105px tall and
 *  six visible steps of it would run off the end of the stage. */
const PILE_DEPTH = 3;
const SEED = 4;
const BACKING = 4;

/**
 * Every card in the deck, named by the deck position it is face-on at — the
 * same slot model `TracksCardDeck` uses, and for the same reason. Negative
 * slots are already dealt at `p === -1`, so they stock the bottom stack with no
 * special case anywhere in `render`; -1 itself is skipped because a card
 * sitting exactly on `p` is the one square to the reader, and that must be a
 * track rather than a blank.
 */
const SLOTS: readonly number[] = [
  ...Array.from({ length: SEED }, (_, s) => -2 - s),
  ...Array.from({ length: COUNT + BACKING }, (_, i) => i),
];

/**
 * The stage is sized to hold all three zones and nothing more, then centred in
 * whatever height the phone has.
 *
 * The three zones reach 193px either side of the middle at their deepest —
 * `PILE_OFFSET`, plus `PILE_DEPTH` steps of `STEP_Y`, plus the half-height of a
 * card that far back. Half of this is 210, so there is about 16px of clear
 * stage past the end of each stack, which is what the tick strip sits in.
 */
const STAGE_HEIGHT = 420;
const STAGE_MIN_TOP = 12;

/* -------------------------------------------------------------- the timing */

/** Scroll travel per card. The wrapper is this tall once over, plus the stage. */
const TRAVEL_PER_CARD = 400;
/**
 * The pause, as a fraction of one card's travel — the same staircase the
 * collage's deck runs on. During a hold the deck position sits on an exact
 * integer and not a single card moves, so the card in the middle is genuinely
 * stopped for the stretch you are reading it rather than merely slow.
 */
const HOLD = 1.4;
const UNIT = 1 + HOLD;
/** A last touch of settle at either end of a card's travel, so it is square to
 *  the reader for a moment before the hold proper. */
const DWELL = 0.08;

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

/** Where the stage parks: centred in the window, never tighter than the margin
 *  on a short phone. Read by both the sticky offset and the ScrollTrigger start,
 *  so the two cannot drift apart. */
function stickTop(): number {
  return Math.max(STAGE_MIN_TOP, (window.innerHeight - STAGE_HEIGHT) / 2);
}

export default function MobileTracksDeck() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const tickRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const stage = stageRef.current;
      if (!wrap || !stage) return;

      const mm = gsap.matchMedia();

      /**
       * `p` runs from -1 to COUNT-1; card `slot` is square to the reader at
       * exactly `p === slot`. Everything is derived from `raw = p - slot`, so a
       * card only ever knows how far past it the deck has got — still waiting
       * in the top stack below zero, already dealt into the bottom one above —
       * and freezing `p` freezes the whole column.
       */
      const render = (p: number) => {
        for (const slot of SLOTS) {
          const el = cardRefs.current.get(slot);
          if (!el) continue;
          const content = contentRefs.current.get(slot);

          const raw = p - slot;
          const d = gsap.utils.clamp(-1, 1, raw);
          const waiting = raw <= 0;
          // How deep in its stack the card is sitting. The same distance either
          // side of the card in the middle, so the stack it is leaving and the
          // one it is joining are drawn by one rule.
          const depth = Math.min(PILE_DEPTH, Math.max(0, Math.abs(raw) - 1));

          // How far outside the dwell the card has got: 0 for the whole stretch
          // it holds square, ramping to 1 at either end of its travel. `t` is
          // its mirror — 1 square to the reader, 0 fully back in a stack — so
          // one set of mixes covers arriving and leaving alike.
          const away = Math.max(0, (Math.abs(d) - DWELL) / (1 - DWELL));
          const t = smooth(1 - away);

          // The waiting stack is above and recedes upward; the dealt stack is
          // below and recedes downward. One sign carries both.
          const side = waiting ? -1 : 1;
          const restY = side * (PILE_OFFSET + depth * STEP_Y);
          const restScale = PILE_SCALE * (1 - depth * STEP_SHRINK);

          gsap.set(el, {
            x: 0,
            y: mix(restY, 0, t),
            scale: mix(restScale, 1, t),
          });

          // The card in the middle is in front of both stacks; within a stack
          // the one nearest its turn — just dealt, or about to be — is on top.
          const layer = String(Math.round(1000 - Math.abs(raw) * 10));
          if (el.style.zIndex !== layer) el.style.zIndex = layer;

          // The face only prints while the card is square to the reader and at
          // full size; in a stack it is 58% scale and unreadable anyway.
          if (content) {
            gsap.set(content, {
              opacity: smooth(1 - Math.min(1, away * 1.9)),
            });
          }
        }

        const active = gsap.utils.clamp(0, COUNT - 1, Math.round(p));
        for (let i = 0; i < COUNT; i++) {
          const tick = tickRefs.current.get(i);
          if (tick) gsap.set(tick, { opacity: i === active ? 1 : 0.25 });
        }
      };

      /**
       * Scroll position to deck position: the staircase described at `HOLD`.
       * The value this returns is flat — exactly `k` — for the whole of card
       * `k`'s hold, which is what stops the column dead while it is being read.
       */
      const deckPosition = (q: number) => {
        const u = gsap.utils.clamp(0, 1, q) * COUNT * UNIT;
        const k = Math.min(COUNT - 1, Math.floor(u / UNIT));
        const flight = Math.min(1, u - k * UNIT);
        // The first card travels in from the stack, so the run starts one back.
        return k - 1 + smooth(flight);
      };

      mm.add(`${MOBILE} and (prefers-reduced-motion: no-preference)`, () => {
        // The sticky offset and the trigger's start are the same number by
        // construction, so a phone that rotates cannot leave them disagreeing.
        const place = () => {
          stage.style.top = `${stickTop()}px`;
        };
        place();
        ScrollTrigger.addEventListener("refreshInit", place);

        const st = ScrollTrigger.create({
          trigger: wrap,
          start: () => `top top+=${stickTop()}`,
          // Exactly the distance the stage can stay stuck for, so the last card
          // lands just as the deck lets go — independent of viewport height,
          // which a `bottom`-relative end is not.
          end: `+=${COUNT * TRAVEL_PER_CARD}`,
          scrub: 0.4,
          onUpdate: (self) => render(deckPosition(self.progress)),
          onRefresh: (self) => render(deckPosition(self.progress)),
        });
        render(deckPosition(0));

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", place);
          st.kill();
        };
      });

      // Reduced motion gets the same four tracks as a plain column: no stacks,
      // no travel, no sticky stage — every face square and readable at once.
      // The blanks stocking the two stacks have nothing to say, so they go.
      mm.add(`${MOBILE} and (prefers-reduced-motion: reduce)`, () => {
        const rail = wrap.querySelector<HTMLElement>("[data-deck-rail]");
        const ticks = wrap.querySelector<HTMLElement>("[data-deck-ticks]");
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
        lay(ticks, { display: "none" });

        for (const slot of SLOTS) {
          const el = cardRefs.current.get(slot);
          const content = contentRefs.current.get(slot);
          const blank = slot < 0 || slot >= COUNT;
          lay(el ?? null, {
            position: "relative",
            marginBottom: "18px",
            display: blank ? "none" : "block",
          });
          if (el) gsap.set(el, { x: 0, y: 0, scale: 1, opacity: 1 });
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
      className="relative my-8"
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
        ref={stageRef}
        className="sticky flex items-center justify-center"
        style={{ top: STAGE_MIN_TOP, height: STAGE_HEIGHT }}
        data-deck-stage
      >
        {/* Origin at the middle of the column: the card being read sits here at
            `y: 0`, and both stacks are written as offsets from it. */}
        <div
          className="relative"
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          data-deck-rail
        >
          {SLOTS.map((slot) => {
            // Slots run negative, so the cycle is taken the long way round —
            // `-2 % 4` is `-2` in JS, which is not an index.
            const color =
              CARD_COLORS[
                ((slot % CARD_COLORS.length) + CARD_COLORS.length) %
                  CARD_COLORS.length
              ];
            const { ink, rule } = trackInk(color);
            const item = slot >= 0 && slot < COUNT ? TRACKS.items[slot] : null;

            return (
              <div
                key={slot}
                ref={(node) => {
                  if (node) cardRefs.current.set(slot, node);
                  else cardRefs.current.delete(slot);
                }}
                className="absolute left-0 top-0 will-change-transform"
                style={{ transformOrigin: "center center" }}
                aria-hidden
              >
                <TrackCard
                  color={color}
                  // Only the cards that say something take the deeper shadow;
                  // the blanks stocking either stack sit flatter behind them.
                  isFront={item !== null}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                >
                  {item ? (
                    <div
                      ref={(node) => {
                        if (node) contentRefs.current.set(slot, node);
                        else contentRefs.current.delete(slot);
                      }}
                      className="absolute inset-0 flex flex-col justify-between p-4 opacity-0"
                      style={{ color: ink }}
                    >
                      <span className="font-rotonto text-[8px] uppercase tracking-[0.3em]">
                        Track {pad(slot + 1)} / {pad(COUNT)}
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
                  ) : null}
                </TrackCard>
              </div>
            );
          })}
        </div>

        {/* Which of the four is square to the reader. */}
        <div
          className="absolute bottom-1 left-0 flex w-full justify-center gap-2"
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
