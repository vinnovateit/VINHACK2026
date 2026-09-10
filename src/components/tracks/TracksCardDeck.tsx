"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

import { TrackCard, TRACK_COLORS, trackInk } from "./TrackCard";
import { DESKTOP } from "@/components/motion/recipes";
import { TRACKS } from "@/content/site";

/**
 * Two corner stacks and one card in the air between them, dealt by the page's
 * own scroll.
 *
 * The deck used to be 48 cards advanced by swallowing wheel events and holding
 * `window.scrollY` still. That fought every input the reader has — a trackpad
 * flick, a scrollbar drag, Page Down, a phone's momentum — and only four of the
 * 48 cards ever said anything. This keeps the shape of that drawing and throws
 * away the hijack: cards wait in the stack top right, one at a time flies into
 * the middle of the screen and stops dead there to be read, then carries on
 * into the stack in the opposite bottom corner. Both stacks are real — the one
 * on the right empties as the one on the left fills, so where you are in the
 * tracks is legible without a counter.
 *
 * Nothing here intercepts scrolling. The section is simply drawn far taller
 * than the artwork on it, and the stage holding the heading and the deck
 * counter-translates against the page exactly as fast as the page moves, so it
 * appears parked for that whole stretch — a `position: sticky` the collage
 * cannot use directly, because the whole page is one `transform: scale()` plate
 * and a sticky offset inside it would be scaled along with everything else. The
 * next track is therefore reachable only by scrolling further down, and going
 * back up rewinds the deck, both at the reader's own pace.
 *
 * The heading parks with the deck rather than scrolling away above it, and that
 * is what decides how big the card can be: it is fitted to the band left under
 * the heading rather than to the window, so the section still says what it is
 * while it is being read. See `measure`.
 */

/* ---------------------------------------------------------------- geometry */

/** The card's drawn size, in the plate's units. Everything on the face is
 *  expressed against these, so the whole card scales as one piece. */
const CARD_WIDTH = 365.44;
const CARD_HEIGHT = 257.6;

/** The plate's drawn width. Whatever the section measures against this is the
 *  factor CSS is scaling the entire collage by, and every screen-pixel figure
 *  below has to be divided back through it. */
const PLATE_WIDTH = 1280;

/** The heading block's own drawn box, in plate units — where `sections/Tracks`
 *  puts it, and how tall it is. Taken as a constant rather than measured
 *  because `PageMotion` runs a one-shot scale on that same element as the
 *  section arrives, and a rect read mid-settle is the wrong number. */
const HEADER_TOP = 99;
const HEADER_HEIGHT = 298;

const COUNT = TRACKS.items.length;
/** Blank cards under the last track, so the waiting stack has some depth to it
 *  rather than thinning to a single card by the end. */
const BACKING = 4;
const TOTAL = COUNT + BACKING;

/* --------------------------------------------------------------- the frame */

/** Where the heading parks, in screen pixels from the top of the window. */
const HEADER_MARGIN = 18;

/**
 * The most of the window's height the heading is allowed, and how far it may be
 * fitted down to get there.
 *
 * The collage is scaled by *width*, so on a wide screen the heading arrives
 * 800px tall and there is nothing left underneath for a card. Since the heading
 * has to stay on screen for every track — it is the only thing naming the
 * section once the deck has taken over — the way to give the card room is to
 * fit the heading rather than to scroll it away. It is only ever scaled down,
 * so at 1280px and on anything tall the section is drawn exactly as designed.
 */
const HEADER_MAX_FILL = 0.3;
const MIN_HEADER_SCALE = 0.5;
/** Air under the heading, and at the bottom of the window. What is left
 *  between them is the band the deck plays in. */
const BAND_GAP = 14;
const BAND_PAD = 18;
/** How much of that band, and of the window's width, the focused card fills.
 *  The fit is uniform, so whichever binds first sizes the card and it keeps its
 *  aspect ratio either way. */
const BAND_FILL = 0.94;
/** Kept clear of half the window so the focused card overlaps the two stacks by
 *  a corner at most, rather than sitting across them. */
const WIDTH_FILL = 0.56;
/** A floor, so a very short window shrinks the card rather than inverting it. */
const MIN_FOCUS_SCALE = 0.4;

/** How big a card in a corner stack is next to the one being read. Expressed
 *  against the focused size rather than fixed, so the two keep their relation
 *  at every window — a stack drawn at its natural size would end up larger than
 *  the focused card on a wide, short screen. */
const CORNER_RATIO = 0.42;

/** How far out the two stacks sit: a fraction of the window's width for the
 *  side, and of the band's height for the end, each measured from the edge the
 *  stack is tucked into. */
const STACK_EDGE_X = 0.88;
const STACK_EDGE_Y = 0.22;

/** One card further back in a stack, in the card's own units. Both stacks
 *  recede up and to the right, the way the deck's isometric pose leans. */
const STEP_X = 0.055 * CARD_WIDTH;
const STEP_Y = -0.04 * CARD_HEIGHT;

/** The pose a card holds in either stack: the deck's isometric lean. */
const LEAN_ROTATE = 15;
const LEAN_SKEW = 15;
const LEAN_SQUASH = 0.97;

/* -------------------------------------------------------------- the timing */

/**
 * The pause, as a fraction of one card's flight.
 *
 * The deck's whole position is one number, `p`, so the way to stop it is to
 * stop moving that number: scrolling is spent alternately flying a card across
 * the screen (one unit) and holding it dead still in the middle (`HOLD` of a
 * unit), and during a hold `p` sits on an exact integer and not a single card
 * moves. Bleeding the hold into the flight instead — letting the focused card
 * sit while the next one creeps forward behind it — reads as a slow deck rather
 * than a stopped one, which is the thing this is here to avoid.
 */
const HOLD = 0.7;
/** One card's share of the scrolling: its flight, then its hold. */
const UNIT = 1 + HOLD;

/** A last touch of settle at either end of a card's flight, so it is square to
 *  the reader for a moment before the hold proper. A fraction of the flight. */
const DWELL = 0.08;

/** A floor under the parked stretch, for a window so tall that the section's
 *  own height barely clears it. */
const MIN_TRAVEL = 400;

/* ------------------------------------------------------------------ colour */

/** Grey -> Pink -> Red -> Dark Blue -> Light Blue -> White, as the deck deals. */
const COLOR_CYCLE = [
  TRACK_COLORS.grey,
  TRACK_COLORS.pink,
  TRACK_COLORS.red,
  TRACK_COLORS.darkBlue,
  TRACK_COLORS.lightBlue,
  TRACK_COLORS.white,
] as const;

/* ------------------------------------------------------------------- maths */

/** Zero velocity at both ends, so one card's arrival joins the last one's exit. */
function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Two-digit card number, the way the reference deck counts its frames. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The section heading's asterisk (`/figma/star2.svg`), inlined so it can take
 * the card's own ink instead of the heading's fixed red.
 */
function TrackAsterisk({ size }: { size: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40.2117 44.5"
      width={size}
      height={size * (44.5 / 40.2117)}
      fill="none"
      className="block shrink-0"
    >
      <path
        d="M20.325 19V0M23.825 21L38.825 11M23.825 24.5L38.825 33.5M20.325 26.5V44.5M17.325 24.5L1.325 33.5M17.325 21L1.325 11"
        stroke="currentColor"
        strokeWidth={5}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- deck */

/**
 * @param children The section's heading block. It is passed in rather than left
 *   as a sibling because it parks with the deck — one stage carries both, so
 *   the heading is on screen for every card.
 */
export function TracksCardDeck({ children }: { children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerBoxRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const headerBox = headerBoxRef.current;
    const rail = railRef.current;
    if (!container || !stage || !headerBox || !rail) return;

    const desktop = window.matchMedia(DESKTOP);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Measured on entry and on resize rather than per frame: reading a rect
    // inside the scroll handler forces a layout flush on every scroll tick.
    let canvasScale = 1;
    let parkStart = 0;
    let travelPx = MIN_TRAVEL;
    let focusScale = 1;
    let cornerScale = 1;
    // Both stacks' anchors, in plate units measured from the focused card's
    // centre — which is where the rail's own origin sits.
    let pileX = 0;
    let pileY = 0;
    let doneX = 0;
    let doneY = 0;
    let armed = false;

    /**
     * `p` runs from -1 to `COUNT - 1`; card `i` is face-on in the middle of the
     * screen at exactly `p === i`. Everything is derived from `raw = p - i`, so
     * a card only ever knows how far past it the deck has got — still waiting
     * below zero, already read above — and freezing `p` freezes the whole deck.
     */
    const render = (p: number) => {
      const reduced = calm.matches;

      for (let i = 0; i < TOTAL; i++) {
        const el = cardRefs.current.get(i);
        if (!el) continue;
        const content = contentRefs.current.get(i);

        const raw = p - i;
        const d = gsap.utils.clamp(-1, 1, raw);
        const waiting = raw <= 0;
        // How deep in its stack the card is sitting. The same distance either
        // side of the card in the air, so the stack it is leaving and the one
        // it is joining are drawn by one rule.
        const depth = Math.min(BACKING, Math.max(0, Math.abs(raw) - 1));

        // How far outside the dwell the card has got: 0 for the whole stretch
        // it holds face-on, ramping to 1 at either end of its flight. `t` is
        // its mirror — 1 face-on, 0 fully back in a stack — so one set of mixes
        // covers arriving and leaving alike.
        const away = Math.max(0, (Math.abs(d) - DWELL) / (1 - DWELL));
        // Reduced motion gets the same deck and the same order with none of the
        // flight: a card is either in its stack or in the middle, and it swaps
        // between the two on the frame it crosses over.
        const t = reduced ? (Math.abs(d) < 0.5 ? 1 : 0) : smooth(1 - away);

        const anchorX = waiting ? pileX : doneX;
        const anchorY = waiting ? pileY : doneY;
        const restX = anchorX + depth * STEP_X * cornerScale;
        const restY = anchorY + depth * STEP_Y * cornerScale;
        const scale = mix(cornerScale, focusScale, t);

        gsap.set(el, {
          x: mix(restX, 0, t),
          y: mix(restY, 0, t),
          rotation: mix(LEAN_ROTATE, 0, t),
          skewX: mix(LEAN_SKEW, 0, t),
          scaleX: scale,
          scaleY: scale * mix(LEAN_SQUASH, 1, t),
        });

        // The card in the air is in front of both stacks; within a stack the
        // one nearest its turn — just dealt, or about to be — is on top.
        const layer = String(Math.round(1000 - Math.abs(raw) * 10));
        if (el.style.zIndex !== layer) el.style.zIndex = layer;

        // The face only prints while the card is square to the reader; at an
        // angle, and at a corner stack's size, it would be unreadable anyway.
        if (content) {
          gsap.set(content, {
            opacity: reduced ? t : smooth(1 - Math.min(1, away * 1.9)),
          });
        }
      }
    };

    /**
     * Where the stage parks, how big the card gets there, and where the two
     * stacks sit relative to it.
     *
     * All of it has to be measured rather than derived from the window, because
     * the collage is a 1280px-wide plate that CSS scales to fit (see
     * `.canvas-plate` in globals.css). Everything inside it — the card's own
     * width, and any `x`/`y` GSAP writes — is multiplied by that scale before it
     * reaches the screen, so a size or an offset taken straight off
     * `window.innerWidth` is only right at exactly 1280px wide.
     */
    const measure = () => {
      // The stage may already be parked, and every figure below is a resting
      // position, so put it back before reading one.
      gsap.set(stage, { y: 0 });

      const rect = container.getBoundingClientRect();
      // Below `md` the whole collage is `display: none` and measures 0x0, and
      // `MobileTracksDeck` is the deck on screen instead.
      if (!desktop.matches || rect.width === 0) {
        armed = false;
        return;
      }
      armed = true;
      canvasScale = rect.width / PLATE_WIDTH || 1;

      // Fit the heading, then place everything else against what it leaves.
      const headerScale = gsap.utils.clamp(
        MIN_HEADER_SCALE,
        1,
        (window.innerHeight * HEADER_MAX_FILL) / (HEADER_HEIGHT * canvasScale),
      );
      gsap.set(headerBox, { scale: headerScale });

      const headerOffset = HEADER_TOP * headerScale * canvasScale;
      const headerHeight = HEADER_HEIGHT * headerScale * canvasScale;
      parkStart = window.scrollY + rect.top + headerOffset - HEADER_MARGIN;
      // Exactly what the section has left once the heading is parked and the
      // window is taken off it — so the deck finishes as the section does, at
      // every width, without the two carrying the same number separately.
      travelPx = Math.max(
        MIN_TRAVEL,
        rect.height - headerOffset - (window.innerHeight - HEADER_MARGIN),
      );

      // The band the deck plays in: whatever the heading leaves.
      const bandTop = HEADER_MARGIN + headerHeight + BAND_GAP;
      const bandBottom = window.innerHeight - BAND_PAD;
      const bandHeight = Math.max(160, bandBottom - bandTop);
      const bandCenter = (bandTop + bandBottom) / 2;

      focusScale = Math.max(
        MIN_FOCUS_SCALE,
        Math.min(
          (bandHeight * BAND_FILL) / (CARD_HEIGHT * canvasScale),
          (window.innerWidth * WIDTH_FILL) / (CARD_WIDTH * canvasScale),
        ),
      );
      cornerScale = focusScale * CORNER_RATIO;

      // A leaning card reaches past its own box, so the stacks are held at
      // least their own half-height inside the band's ends — otherwise the top
      // one crosses the rule under the heading on a short window.
      const reach = (CARD_HEIGHT * cornerScale * canvasScale * 1.3) / 2;
      const inset = Math.max(reach, bandHeight * STACK_EDGE_Y);
      const plateX = (x: number) => (x - window.innerWidth / 2) / canvasScale;
      const plateY = (y: number) => (y - bandCenter) / canvasScale;

      pileX = plateX(window.innerWidth * STACK_EDGE_X);
      pileY = plateY(bandTop + inset);
      doneX = plateX(window.innerWidth * (1 - STACK_EDGE_X));
      doneY = plateY(bandBottom - inset);

      // The rail's origin is the focused card's centre, and the whole deck is
      // written against it. In plate units from the section's own top: where
      // the heading is parked, plus the band's centre below it.
      rail.style.top = `${(headerOffset + bandCenter - HEADER_MARGIN) / canvasScale}px`;
    };

    /**
     * Scroll position to deck position: the staircase described at `HOLD`.
     *
     * `q` is how far through the parked stretch the page is, 0 to 1. Card `k`
     * flies in over the first unit of its share and then holds for the rest, so
     * the value this returns is flat — exactly `k` — for the whole hold.
     */
    const deckPosition = (q: number) => {
      const u = q * COUNT * UNIT;
      const k = Math.min(COUNT - 1, Math.floor(u / UNIT));
      const flight = Math.min(1, u - k * UNIT);
      // The first card flies in from the stack, so the run starts one back.
      return k - 1 + smooth(flight);
    };

    const update = () => {
      if (!armed) return;
      const stuck = gsap.utils.clamp(0, travelPx, window.scrollY - parkStart);
      // Exactly the page's own travel, back in plate units. Any smoothing here
      // and the parked heading would visibly drift against the scroll.
      gsap.set(stage, { y: stuck / canvasScale });
      render(deckPosition(stuck / travelPx));
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    const onLayout = () => {
      measure();
      update();
    };

    onLayout();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onLayout);
    desktop.addEventListener("change", onLayout);
    calm.addEventListener("change", onLayout);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
      desktop.removeEventListener("change", onLayout);
      calm.removeEventListener("change", onLayout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      data-node-id="596:376"
      data-name="TRACK_CARDS_DECK"
    >
      {/* The deck only ever shows one track at a time, and only part-way
          through a scroll, so the real content is given plainly here and the
          moving parts below are hidden from assistive tech. */}
      <ul className="sr-only">
        {TRACKS.items.map((item) => (
          <li key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.blurb}</p>
          </li>
        ))}
      </ul>

      {/* The stage is what parks — one transform carrying the heading and the
          whole deck, driven by the page's own scroll. */}
      <div ref={stageRef} className="absolute inset-0 will-change-transform">
        {/* Fitted to the window's height — see `HEADER_MAX_FILL`. Its own box
            rather than the heading itself, which `PageMotion` already has a
            transform on. */}
        <div
          ref={headerBoxRef}
          className="absolute inset-x-0 top-0 origin-top will-change-transform"
        >
          {children}
        </div>

        {/* Origin at the focused card's centre; `top` is set once measured. */}
        <div ref={railRef} className="absolute left-1/2 top-0">
          {Array.from({ length: TOTAL }, (_, i) => {
            const color = COLOR_CYCLE[i % COLOR_CYCLE.length];
            const { ink, rule } = trackInk(color);
            const item = i < COUNT ? TRACKS.items[i] : null;

            return (
              <div
                key={i}
                ref={(node) => {
                  if (node) cardRefs.current.set(i, node);
                  else cardRefs.current.delete(i);
                }}
                className="absolute will-change-transform"
                style={{
                  left: 0,
                  top: 0,
                  marginLeft: -CARD_WIDTH / 2,
                  marginTop: -CARD_HEIGHT / 2,
                  transformOrigin: "center center",
                }}
                aria-hidden
              >
                <TrackCard
                  color={color}
                  isFront={i === 0}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                >
                  {item ? (
                    // Everything the track has to say is printed on the card
                    // itself. Sizes are in the card's own 365x258 units, so the
                    // whole face scales as one piece with the zoom instead of
                    // type drifting out of proportion with the box holding it.
                    <div
                      ref={(node) => {
                        if (node) contentRefs.current.set(i, node);
                        else contentRefs.current.delete(i);
                      }}
                      className="absolute inset-0 flex flex-col justify-between p-5.5 opacity-0 will-change-transform pointer-events-none"
                      style={{ color: ink }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-rotonto text-[8.5px] uppercase tracking-[0.34em]">
                          Track {pad(i + 1)} / {pad(COUNT)}
                        </span>
                        <TrackAsterisk size={13} />
                      </div>
                      <div>
                        <div
                          className="mb-2.5 h-px w-full"
                          style={{ background: rule }}
                        />
                        <h3 className="font-rotonto text-[26px] leading-[0.94] tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-[84%] font-rotonto text-[9.5px] leading-[1.5] tracking-tight opacity-80">
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
      </div>
    </div>
  );
}

export default TracksCardDeck;
