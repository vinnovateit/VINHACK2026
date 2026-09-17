"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

import { TrackAsterisk, TrackCard, TRACK_COLORS, trackInk } from "./TrackCard";
import { TrackVisual } from "./TrackIcons";
import { DESKTOP } from "@/components/motion/recipes";
import { TRACKS } from "@/content/site";

/**
 * Two corner piles and one card in the air between them, thrown by the page's
 * own scroll.
 *
 * The drawing is the reference deck's: a pile of cards waiting top right, a
 * pile of dealt ones bottom left, and a single card crossing the black between
 * them, stopping square in the middle long enough to be read. What has been
 * rewritten is the *flight*.
 *
 * The previous version moved a card along the straight line between the two
 * piles, lerped its lean out and back, and eased both ends of the trip with the
 * same smoothstep. Symmetrical travel on a straight line is a slide, and a
 * sliding card reads as a slideshow with a diagonal. A thrown card does four
 * things a slide does not, and all four are here:
 *
 *   arc         it leaves the pile across the frame rather than along the line
 *               to the middle of it, so the path bows (see `BOW`)
 *   asymmetry   it is *flicked* out and *settles* in — fast off the pile,
 *               decelerating hard into the centre — and then hangs a moment and
 *               is gone, accelerating away. `easeOut` on the way in, `easeIn`
 *               on the way out, so the card leaving and the card arriving are
 *               never moving at the same rate past each other
 *   the turn    and they do not share the whole stretch of scrolling either.
 *               The sweep gets the front of it and the throw the back, so the
 *               table is cleared before the next card lands rather than two
 *               cards being large in the middle of the screen at once (see
 *               `SWEEP_END`)
 *   the kick    it turns past level and comes back rather than easing on to it
 *               (see `KICK`)
 *   separation  it smears. Two plates, red and cyan, ride under the card and
 *               pull apart at the fastest point of the flight, closing to
 *               nothing as it lands — the misregistration a card gets when it
 *               is moving faster than the press can print it (see `SEPARATION`)
 *
 * The section heading is no longer part of this. It used to be passed in and
 * parked with the deck, which cost 30% of the window for the whole run and left
 * the cards fighting for what was underneath. It is a sibling in
 * `sections/Tracks` again and scrolls away normally; the deck rises into its
 * place as it leaves — see `LEAD_IN`, which is measured off the heading's own
 * bottom edge so the hand-over lands rather than overlaps. What names the
 * section once the heading has gone is the counter in the top-left corner.
 *
 * Nothing here intercepts scrolling. The section is simply drawn far taller
 * than the artwork on it, and the stage holding the deck counter-translates
 * against the page exactly as fast as the page moves, so it appears parked for
 * that whole stretch. The next track is therefore reachable only by scrolling
 * further down, and going back up rewinds the deck, both at the reader's pace.
 *
 * It is a counter-translate rather than a `position: sticky` because the whole
 * page is one `transform: scale()` plate, and sticky does not survive that.
 * That has been tried, so it is worth writing down as a result rather than
 * leaving as an assertion: with the stage stuck at `top: 0` inside the plate,
 * the offset the engine works out against the viewport is applied in the
 * plate's own scaled coordinates, so the stage travels by the scale factor too
 * much and runs away down the section — by the time it is on screen the deck
 * has been dealt and the last track is all you ever see. Dividing the offset
 * back through the scale is no answer either, because `top: 0` is already zero
 * at every scale; there is nothing there to divide.
 *
 * A counter-translate is only as steady as its timing, and it is worth being
 * plain about why: this one is written from a `requestAnimationFrame` loop
 * rather than the `scroll` event, because the event is throttled under
 * momentum scrolling and a frame of lag between the page and the stage is
 * exactly the bob the park exists to avoid. See `tick`.
 */

/* ---------------------------------------------------------------- geometry */

/** The card's drawn size, in the plate's units. Everything on the face is
 *  expressed against these, so the whole card scales as one piece.
 *  Rendered at 2x Retina layout resolution so fonts and borders are drawn
 *  natively crisp and never blur under transforms. */
const CARD_BASE_WIDTH = 365.44;
const CARD_BASE_HEIGHT = 257.6;
const CARD_RES = 2;
const CARD_WIDTH = CARD_BASE_WIDTH * CARD_RES;
const CARD_HEIGHT = CARD_BASE_HEIGHT * CARD_RES;

/** The plate's drawn width. Whatever the section measures against this is the
 *  factor CSS is scaling the entire collage by, and every screen-pixel figure
 *  below has to be divided back through it. */
const PLATE_WIDTH = 1280;

/** The bottom edge of the heading block in `sections/Tracks`, in plate units:
 *  it is placed at top 99 and drawn 298 tall. Taken as a constant rather than
 *  measured because `PageMotion` runs a one-shot scale on that element as the
 *  section arrives, and a rect read mid-settle is the wrong number. */
const HEADER_BOTTOM = 397;
/** Air between the heading leaving the top of the window and the deck locking
 *  into place, in plate units. */
const HEADER_CLEAR = 70;

const COUNT = TRACKS.items.length;

/** Blank cards under the last track, so the waiting pile keeps its depth
 *  instead of thinning to a single card by the end. */
const BACKING = 6;
/** Blank cards dealt into the far pile before the deck starts, so the corner
 *  the tracks are flying *into* is a pile from the first frame rather than an
 *  empty patch of screen that fills up later. */
const SEED = 6;
/** How far back either pile is drawn. Past this a card stops receding and
 *  simply hides behind the one in front, so a deep pile stays a pile rather
 *  than a fan running off across the screen. */
const PILE_DEPTH = 6;

/**
 * Every card in the deck, named by the deck position it is face-on at.
 *
 * Real tracks are 0 to COUNT-1 and the waiting pile's padding carries on above
 * them. The seeded cards run *below* zero, which is what puts them in the far
 * pile from the start: `render` decides which corner a card is in purely from
 * the sign of `p - slot`, so a card at a negative slot has already been dealt
 * before the deck has moved at all, with no special case for it.
 *
 * -1 is deliberately skipped. The deck opens at `p === -1` and a card sitting
 * exactly on `p` is the one face-on in the middle of the screen, so a card
 * there would greet the reader as a blank.
 */
const SLOTS: readonly number[] = [
  ...Array.from({ length: SEED }, (_, s) => -2 - s),
  ...Array.from({ length: COUNT + BACKING }, (_, i) => i),
];

/* --------------------------------------------------------------- the frame */

/** Air at the top and bottom of the window. What is left between them is the
 *  band the deck plays in — the whole window now that the heading has gone. */
const BAND_PAD = 28;
/** How close to the window's edges a pile's *outermost drawn pixel* may come.
 *  The piles are placed from their measured extent rather than at a fraction
 *  of the window (which is what used to leave the waiting pile hanging off the
 *  right-hand side at 1440px and wider) — see `measure`. */
const EDGE_MARGIN = 24;

/** How much of the band, and of the window's width, the focused card fills.
 *  The fit is uniform, so whichever binds first sizes the card and it keeps
 *  its aspect ratio either way. In practice width binds at every 16:9 window,
 *  which is what keeps the card the same size from 1280 to 1920. */
const BAND_FILL = 0.86;
const WIDTH_FILL = 0.5;
/** A floor, so a very short window shrinks the card rather than inverting it. */
const MIN_FOCUS_SCALE = 0.4 / CARD_RES;

/** How big a card in a corner pile is next to the one being read. Expressed
 *  against the focused size rather than fixed, so the two keep their relation
 *  at every window. */
const CORNER_RATIO = 0.4;

/** One card further back in a pile, in the card's own units. Both piles recede
 *  up and to the right, the way the deck's isometric pose leans. Tight, so a
 *  pile reads as a stack of thin coloured edges rather than a fan. */
const STEP_X = 0.038 * CARD_WIDTH;
const STEP_Y = -0.026 * CARD_HEIGHT;

/**
 * The pose a card holds in either pile.
 *
 * `rotate(15) skewX(15)` is not an arbitrary pair: the skew shears the card's
 * vertical edges back by very nearly the angle the rotation turned them
 * through, so they end up vertical again and what is left is a parallelogram
 * with a sloping top edge. That is the reference deck's isometric lean, and it
 * is why the piles read as cards seen from the side rather than as tilted
 * rectangles.
 */
const LEAN_ROTATE = 15;
const LEAN_SKEW = 15;
const LEAN_SQUASH = 0.97;

/* -------------------------------------------------------------- the timing */

/**
 * The pause, as a fraction of one card's flight.
 *
 * The deck's whole position is one number, `p`, so the way to stop it is to
 * stop moving that number: scrolling is spent alternately throwing a card
 * across the screen (one unit) and holding it dead still in the middle (`HOLD`
 * of a unit), and during a hold `p` sits on an exact integer and not a single
 * card moves. Bleeding the hold into the flight instead — letting the focused
 * card sit while the next one creeps forward behind it — reads as a slow deck
 * rather than a stopped one, which is the thing this is here to avoid.
 */
const HOLD = 1.25;
/** One card's share of the scrolling: its flight, then its hold. */
const UNIT = 1 + HOLD;

/** A floor under the parked stretch, for a window so tall that the section's
 *  own height barely clears it. */
const MIN_TRAVEL = 400;

/* -------------------------------------------------------------- the flight */

/**
 * How far the card bows off the straight line between the two piles, as a
 * fraction of that line's length.
 *
 * The bow is taken perpendicular to the line and in the same absolute
 * direction for the inbound and outbound halves, so the two are one arc rather
 * than an S — the card sails up and out across the frame on its way from the
 * top-right pile to the bottom-left one, instead of tracking the diagonal
 * between them.
 */
const BOW = 0.13;

/** The extra turn the card takes *through* level, in degrees, peaking at the
 *  fastest point of the flight. It arrives having overshot and come back,
 *  which is what a flicked card does and an eased one does not. */
const KICK = 5;

/**
 * How the two halves of one flight are dealt out against each other.
 *
 * One stretch of scrolling carries two cards: the one being swept off the
 * middle of the screen and the one being thrown into it. Run both across the
 * whole stretch and they are both large and both near the centre at the
 * half-way point, which is two cards fighting rather than one being replaced —
 * it was the first thing wrong with the rewrite on a wide screen.
 *
 * So the sweep is given the front of the stretch and the throw the back, with
 * a little overlap in the middle where one is already most of the way to its
 * pile and the other has only just left its own. A dealer clears the table
 * before the next card lands, and that is what these two numbers buy.
 */
const SWEEP_END = 0.55;
const THROW_START = 0.38;

/** How far the two ghost plates pull apart at the fastest point of a flight,
 *  in the card's own units, and how much of that separation is vertical. They
 *  live inside the card's own transform, so they lean and scale with it. */
const SEPARATION = 15;
const SEP_TILT = 0.34;
/** The plates themselves. Red and cyan, the deck's own two loudest inks. */
const SEP_INKS = [TRACK_COLORS.red, TRACK_COLORS.lightBlue] as const;

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

function clamp(min: number, max: number, v: number): number {
  return v < min ? min : v > max ? max : v;
}

function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Settling: most of the speed at the start, none at the end. The card arrives
 *  and comes to rest rather than gliding the last of the way in. */
function easeOut(t: number): number {
  const c = 1 - t;
  return 1 - c * c;
}

/** Winding up: none at the start, all at the end. The card hangs for a moment
 *  where it was being read and is then gone, which is the opposite shape to
 *  `easeOut` and the reason a deal does not read as a slideshow. */
function easeIn(t: number): number {
  return t * t * t;
}

/** Zero at both ends of a flight and 1 at its middle: the shape of everything
 *  that only happens while a card is actually in the air. */
function arc(t: number): number {
  return 4 * t * (1 - t);
}

/** Where the content fade starts and how wide it is, in units of `|raw|` (see
 *  `render`). `CONTENT_FLAT` is how close to square the card must already be
 *  before its face starts to print, and `CONTENT_FADE` is how much further out
 *  it fades to nothing.
 *
 *  This used to be 0.18 and 0.4 — a fade four times wider than the flat spot,
 *  which meant the face spent most of its ramp printing over a card that was
 *  still visibly skewed and mid-air: half-opacity type on a rotated, leaning
 *  card reads as smudged rather than as a card arriving. Narrowing the fade
 *  keeps it inside the range where the pose (see `poseExtent`'s callers below,
 *  `rotate`/`skew`) is already close to flat, so the text is either off or
 *  legible and skips the washed-out middle. */
const CONTENT_FLAT = 0.18;
const CONTENT_FADE = 0.14;

/** Zero velocity at both ends — used for opacity, which has no direction to
 *  care about. */
function smooth(t: number): number {
  const c = clamp(0, 1, t);
  return c * c * (3 - 2 * c);
}

/**
 * Critically damped spring (SmoothDamp).
 * Provides continuous velocity and acceleration without overshoot or oscillation.
 * Frame-rate independent via deltaTime.
 */
function smoothDamp(
  current: number,
  target: number,
  velocityRef: { value: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number,
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;

  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = clamp(-maxChange, maxChange, change);
  target = current - change;

  const temp = (velocityRef.value + omega * change) * deltaTime;
  velocityRef.value = (velocityRef.value - omega * temp) * exp;
  let output = target + (change + temp) * exp;

  if ((originalTo - current > 0) === (output > originalTo)) {
    output = originalTo;
    velocityRef.value = (output - originalTo) / deltaTime;
  }

  return output;
}

/**
 * Half the width and half the height a card actually covers once it is turned,
 * sheared and scaled — in the card's own units.
 *
 * This is what the piles are placed from. The old deck put them at a fraction
 * of the window's width instead, which is only correct at one window: a leaning
 * card reaches well past its own box, and at 1440px and wider the waiting pile
 * was placed far enough out that a third of it was off the right-hand edge of
 * the screen.
 *
 * `rotate(a) skewX(k) scale(sx, sy)` composes to R·K·S, and the four corners of
 * the box are pushed through it directly rather than bounded by hand — there is
 * no arithmetic here to get subtly wrong when the pose is retuned.
 */
function poseExtent(
  rotate: number,
  skew: number,
  sx: number,
  sy: number,
): { hw: number; hh: number } {
  const r = (rotate * Math.PI) / 180;
  const k = Math.tan((skew * Math.PI) / 180);
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const a = cos * sx;
  const c = (cos * k - sin) * sy;
  const b = sin * sx;
  const d = (sin * k + cos) * sy;

  const hw = CARD_WIDTH / 2;
  const hh = CARD_HEIGHT / 2;
  let mx = 0;
  let my = 0;
  for (const [px, py] of [
    [hw, hh],
    [hw, -hh],
    [-hw, hh],
    [-hw, -hh],
  ] as const) {
    mx = Math.max(mx, Math.abs(a * px + c * py));
    my = Math.max(my, Math.abs(b * px + d * py));
  }
  return { hw: mx, hh: my };
}

/** Two-digit card number, the way the reference deck counts its frames. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/* -------------------------------------------------------------------- deck */

export function TracksCardDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const ghostRefs = useRef<Map<number, HTMLDivElement[]>>(new Map());
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const stage = stageRef.current;
    const rail = railRef.current;
    const counter = counterRef.current;
    if (!container || !stage || !rail || !counter) return;

    const desktop = window.matchMedia(DESKTOP);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Measured on entry and on resize rather than per frame: reading a rect
    // inside the scroll handler forces a layout flush on every scroll tick.
    let canvasScale = 1;
    let parkStart = 0;
    let travelPx = MIN_TRAVEL;
    let focusScale = 1;
    let cornerScale = 1;
    // Both piles' anchors, in plate units measured from the focused card's
    // centre — which is where the rail's own origin sits.
    let pileX = 0;
    let pileY = 0;
    let doneX = 0;
    let doneY = 0;
    let armed = false;
    let leadInPx = 0;
    let lit = -2;
    let counterLit = -1;

    /**
     * `p` runs from -1 to `COUNT - 1`; card `i` is face-on in the middle of the
     * screen at exactly `p === i`. Everything is derived from `raw = p - i`, so
     * a card only ever knows how far past it the deck has got — still waiting
     * below zero, already read above — and freezing `p` freezes the whole deck.
     *
     * The transforms are written straight to `style` rather than through
     * `gsap.set`. This is the hot loop — sixteen cards on every rendered frame
     * for the length of the section — and it also wants the composition order
     * to be exactly the one `poseExtent` models, which is easier to guarantee
     * by writing the string.
     */
    const render = (p: number) => {
      const reduced = calm.matches;

      for (const slot of SLOTS) {
        const el = cardRefs.current.get(slot);
        if (!el) continue;

        const raw = p - slot;
        const absRaw = Math.abs(raw);
        const inbound = raw <= 0;
        // Where the deck is in this card's stretch of scrolling, 0 to 1 — and
        // then the card's own share of it, which is the back of the stretch if
        // it is being thrown in and the front if it is being swept away. See
        // `SWEEP_END`.
        const stretch = inbound ? clamp(0, 1, raw + 1) : clamp(0, 1, raw);
        const own = inbound
          ? clamp(0, 1, (stretch - THROW_START) / (1 - THROW_START))
          : clamp(0, 1, stretch / SWEEP_END);
        // How far through its flight the card is: 0 sitting in a pile, 1 face
        // on in the middle. One number for both halves of the trip, so the
        // pose below is written once rather than once per direction.
        // e: 0 sitting in a pile, 1 face on in the middle
        const e = reduced
          ? Math.abs(raw) < 0.5
            ? 1
            : 0
          : inbound
            ? easeOut(own)
            : 1 - (own * own);
        // Zero in both piles, 1 at the fastest point of the flight
        const air = reduced ? 0 : arc(own);

        // How deep in its pile the card is sitting. The same distance either
        // side of the card in the air, so the pile it is leaving and the one
        // it is joining are drawn by one rule.
        const depth = Math.min(PILE_DEPTH, Math.max(0, Math.abs(raw) - 1));
        const anchorX = inbound ? pileX : doneX;
        const anchorY = inbound ? pileY : doneY;
        const restX = anchorX + depth * STEP_X * cornerScale;
        const restY = anchorY + depth * STEP_Y * cornerScale;

        let x = mix(restX, 0, e);
        let y = mix(restY, 0, e);

        // Smooth natural arc without direction reversals:
        // Inbound: gentle arc from top-right to center, y strictly <= 0
        // Outbound: gentle arc from center to bottom-left, y strictly >= 0
        if (air > 0 && !reduced) {
          if (inbound) {
            x -= 28 * air * (1 - e);
            y = Math.min(0, y - 14 * air * (1 - e));
          } else {
            x -= 28 * air * e;
            y = Math.max(0, y + 14 * air * e);
          }
        }

        const scale = mix(cornerScale, focusScale, e);
        const rotate = mix(LEAN_ROTATE, 0, e);
        const skew = mix(LEAN_SKEW, 0, e);
        const squash = mix(LEAN_SQUASH, 1, e);

        el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
          `rotate(${rotate.toFixed(2)}deg) skewX(${skew.toFixed(2)}deg) ` +
          `scale(${scale.toFixed(4)}, ${(scale * squash).toFixed(4)})`;

        // Discrete stable layer: active card on top, waiting pile under it, dealt pile under that
        const layer =
          absRaw < 0.5 ? "500" : inbound ? String(300 - slot) : String(100 + slot);
        if (el.style.zIndex !== layer) el.style.zIndex = layer;

        // The smear: keep subtle so it doesn't cause visual double-vision/flicker
        const ghosts = ghostRefs.current.get(slot);
        if (ghosts) {
          const sep = 6 * air;
          for (let g = 0; g < ghosts.length; g++) {
            const dir = g === 0 ? -1 : 1;
            ghosts[g].style.transform = `translate3d(${(sep * dir).toFixed(1)}px, ${(
              sep *
              SEP_TILT *
              dir
            ).toFixed(1)}px, 0)`;
          }
        }

        // The face prints when the card is close to the reader.
        const content = contentRefs.current.get(slot);
        if (content) {
          const shown = reduced
            ? (absRaw < 0.5 ? 1 : 0)
            : clamp(0, 1, 1 - smooth((absRaw - 0.28) / 0.28));
          content.style.opacity = shown.toFixed(3);
        }
      }

      if (typeof window !== "undefined") {
        (window as unknown as Record<string, unknown>).__TRACKS_DEBUG__ = {
          p,
          cards: SLOTS.map((s) => {
            const el = cardRefs.current.get(s);
            const content = contentRefs.current.get(s);
            return {
              slot: s,
              raw: (p - s).toFixed(2),
              transform: el?.style.transform,
              zIndex: el?.style.zIndex,
              contentOpacity: content?.style.opacity,
            };
          }),
        };
      }

      // Which track the counter is pointing at. Only touched when it changes —
      // this runs on every frame the deck moves.
      const active = clamp(0, COUNT - 1, Math.round(p));
      if (active !== lit) {
        lit = active;
        const ticks = counter.querySelectorAll<HTMLElement>("[data-tick]");
        ticks.forEach((tick, i) => {
          tick.style.opacity = i <= active ? "1" : "0.25";
        });
        const label = counter.querySelector<HTMLElement>("[data-tick-label]");
        if (label) label.textContent = pad(active + 1);
      }
    };

    /**
     * Where the stage parks, how big the card gets there, and where the two
     * piles sit relative to it.
     *
     * All of it has to be measured rather than derived from the window, because
     * the collage is a 1280px-wide plate that CSS scales to fit (see
     * `.canvas-plate` in globals.css). Everything inside it — the card's own
     * width, and any x/y written above — is multiplied by that scale before it
     * reaches the screen, so a size or an offset taken straight off
     * `window.innerWidth` is only right at exactly 1280px wide.
     */
    const measure = () => {
      const rect = container.getBoundingClientRect();
      // Below `md` the whole collage is `display: none` and measures 0x0, and
      // `MobileTracksDeck` is the deck on screen instead.
      if (!desktop.matches || rect.width === 0) {
        armed = false;
        return;
      }
      armed = true;
      canvasScale = rect.width / PLATE_WIDTH || 1;

      // The band the deck plays in: the whole window, less its own margins.
      // There is no heading to fit around any more — it scrolls away, and the
      // lead-in below is what keeps the two out of each other's way.
      const bandTop = BAND_PAD;
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

      // How far the deck is held below its parked position while the heading
      // is still on screen. The two then hand over exactly: the heading leaves
      // out of the top of the window as the deck rises into the middle of it.
      const leadIn = (HEADER_BOTTOM + HEADER_CLEAR) * canvasScale;
      leadInPx = leadIn;

      parkStart = window.scrollY + rect.top + leadIn;
      // Exactly what the section has left once the lead-in is spent and the
      // window is taken off it — so the deck finishes as the section does, at
      // every width, without the two carrying the same number separately.
      travelPx = Math.max(
        MIN_TRAVEL,
        rect.height - leadIn - window.innerHeight,
      );

      // Where a leaning card in a pile actually reaches, including how far the
      // pile's own depth carries it. Both piles recede up and to the right, so
      // the depth is added on the +x/-y side only.
      const { hw, hh } = poseExtent(
        LEAN_ROTATE,
        LEAN_SKEW,
        cornerScale,
        cornerScale * LEAN_SQUASH,
      );
      const reachX = hw * canvasScale;
      const reachY = hh * canvasScale;
      const deepX = PILE_DEPTH * STEP_X * cornerScale * canvasScale;
      const deepY = PILE_DEPTH * -STEP_Y * cornerScale * canvasScale;

      const plateX = (sx: number) => (sx - window.innerWidth / 2) / canvasScale;
      const plateY = (sy: number) => (sy - bandCenter) / canvasScale;

      // Waiting pile, tucked into the top-right corner; dealt pile, into the
      // bottom-left. Placed from the measured reach rather than a fraction of
      // the window, so neither is ever cut off by an edge.
      pileX = plateX(window.innerWidth - EDGE_MARGIN - reachX - deepX);
      pileY = plateY(bandTop + EDGE_MARGIN + reachY + deepY);
      doneX = plateX(EDGE_MARGIN + reachX);
      doneY = plateY(bandBottom - EDGE_MARGIN - reachY);

      // The rail's origin is the focused card's centre, and the whole deck is
      // written against it. In the fixed portal at top: 0 with scale(canvasScale),
      // placing rail at bandCenter / canvasScale lands it at bandCenter on screen.
      // And counter at bandTop / canvasScale lands it at bandTop on screen.
      rail.style.top = `${(bandCenter / canvasScale).toFixed(1)}px`;
      counter.style.top = `${(bandTop / canvasScale).toFixed(1)}px`;
    };

    /**
     * Scroll position to deck position: the staircase described at `HOLD`.
     */
    const deckPosition = (q: number) => {
      const u = q * COUNT * UNIT;
      const k = Math.min(COUNT - 1, Math.floor(u / UNIT));
      const flight = Math.min(1, u - k * UNIT);
      // The first card flies in from the pile, so the run starts one back.
      return k - 1 + flight;
    };

    let latestScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const onScroll = () => {
      latestScrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    };

    let drawn = Number.NaN;
    let currentP = -1;
    let smoothScrollY = latestScrollY;
    const scrollVel = { value: 0 };
    const pVel = { value: 0 };
    let lastTime = typeof performance !== "undefined" ? performance.now() : 0;
    let initialized = false;

    const update = (dt: number) => {
      if (!armed) {
        if (desktop.matches) {
          measure();
        }
        if (!armed) {
          stage.style.display = "none";
          return;
        }
      }

      const currentScrollY = latestScrollY;
      const isReduced = calm.matches;

      if (!initialized) {
        smoothScrollY = currentScrollY;
        scrollVel.value = 0;
        pVel.value = 0;
      } else if (isReduced || Math.abs(currentScrollY - smoothScrollY) > 2000) {
        smoothScrollY = currentScrollY;
        scrollVel.value = 0;
      } else {
        // Smooth input filtering (dt-independent critically damped spring):
        // Eliminates discrete mouse-wheel step jumps while maintaining instant responsiveness.
        smoothScrollY = smoothDamp(smoothScrollY, currentScrollY, scrollVel, 0.08, Infinity, dt);
      }

      // Fixed Stage Y Translation:
      // While locked in park (parkStart <= smoothScrollY <= parkStart + travelPx):
      // stageY is EXACTLY 0. The stage is 100% stationary in the viewport, pinned
      // natively on the GPU compositor thread with ZERO bobbing and ZERO jitter!
      // Before parkStart: stage enters smoothly from below (parkStart - smoothScrollY).
      // After parkEnd: stage exits smoothly upward ((parkStart + travelPx) - smoothScrollY).
      let stageY = 0;
      if (smoothScrollY < parkStart) {
        stageY = parkStart - smoothScrollY;
      } else if (smoothScrollY > parkStart + travelPx) {
        stageY = (parkStart + travelPx) - smoothScrollY;
      } else {
        stageY = 0; // ZERO MOVEMENT - 100% COMPOSITOR PINNED!
      }

      // Culled when completely outside viewport
      if (
        stageY > window.innerHeight * 1.3 ||
        stageY < -window.innerHeight * 1.3
      ) {
        if (stage.style.display !== "none") stage.style.display = "none";
      } else {
        if (stage.style.display !== "block") stage.style.display = "block";
        const transformStr = `translate3d(-50%, ${stageY.toFixed(1)}px, 0) scale(${canvasScale.toFixed(4)})`;
        if (stage.style.transform !== transformStr) {
          stage.style.transform = transformStr;
        }
      }

      // Card dealing progress:
      const stuck = clamp(0, travelPx, smoothScrollY - parkStart);
      const targetP = deckPosition(stuck / travelPx);

      if (!initialized) {
        currentP = targetP;
        initialized = true;
      } else if (isReduced) {
        currentP = targetP;
        pVel.value = 0;
      } else {
        // Critically damped spring (SmoothDamp):
        // Eliminates the discontinuous velocity spike of simple lerp on mouse-wheel notches.
        // Provides smooth acceleration AND deceleration (continuous velocity, zero jerk).
        currentP = smoothDamp(currentP, targetP, pVel, 0.13, Infinity, dt);
        if (Math.abs(currentP - targetP) < 0.0001 && Math.abs(pVel.value) < 0.0001) {
          currentP = targetP;
          pVel.value = 0;
        }
      }

      // Counter fade in/out
      const enterProgress =
        (smoothScrollY - parkStart + leadInPx / 2) / (leadInPx / 2);
      const exitProgress =
        (parkStart + travelPx + leadInPx / 2 - smoothScrollY) / (leadInPx / 2);
      const shown = calm.matches
        ? 1
        : clamp(0, 1, Math.min(smooth(enterProgress), smooth(exitProgress)));

      if (Math.abs(shown - counterLit) > 0.004) {
        counterLit = shown;
        counter.style.opacity = shown.toFixed(3);
      }

      if (Number.isNaN(drawn) || Math.abs(currentP - drawn) > 0.0004) {
        drawn = currentP;
        render(currentP);
      }
    };

    let rafId = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.064, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      update(dt);
      rafId = requestAnimationFrame(tick);
    };

    const onLayout = () => {
      measure();
      drawn = Number.NaN;
      initialized = false;
      lit = -2;
      counterLit = -1;
      lastTime = performance.now();
      update(0.016);
    };

    onLayout();
    rafId = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onLayout);
    desktop.addEventListener("change", onLayout);
    calm.addEventListener("change", onLayout);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
      desktop.removeEventListener("change", onLayout);
      calm.removeEventListener("change", onLayout);
    };
  }, [mounted]);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-visible pointer-events-none"
        style={{ overflowAnchor: "none" }}
        data-node-id="596:376"
        data-name="TRACK_CARDS_DECK"
      >
        <ul className="sr-only">
          {TRACKS.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.blurb}</p>
            </li>
          ))}
        </ul>
      </div>

      {mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={stageRef}
              className="pointer-events-none"
              style={{
                position: "fixed",
                left: "50%",
                top: 0,
                width: PLATE_WIDTH,
                height: "100vh",
                transformOrigin: "top center",
                zIndex: 35,
                overflowAnchor: "none",
                display: "none",
              }}
            >
              <div
                ref={counterRef}
                aria-hidden
                className="absolute left-0 flex items-center gap-[9px] pl-[26px] font-rotonto text-[#fa1a1d] opacity-0"
              >
                <span className="text-[11px] uppercase tracking-[0.42em]">Tracks</span>
                <span className="flex items-center gap-[5px]">
                  {TRACKS.items.map((item, i) => (
                    <span
                      key={item.title}
                      data-tick
                      className="block h-[2px] w-[18px] bg-current opacity-25"
                      style={{ opacity: i === 0 ? 1 : 0.25 }}
                    />
                  ))}
                </span>
                <span className="text-[11px] tracking-[0.2em] tabular-nums">
                  <span data-tick-label>01</span>
                  <span className="opacity-50">{` / ${pad(COUNT)}`}</span>
                </span>
              </div>

              <div ref={railRef} className="absolute left-1/2 top-0">
                {SLOTS.map((slot) => {
                  const color =
                    COLOR_CYCLE[
                      ((slot % COLOR_CYCLE.length) + COLOR_CYCLE.length) %
                        COLOR_CYCLE.length
                    ];
                  const { ink, rule } = trackInk(color);
                  const item =
                    slot >= 0 && slot < COUNT ? TRACKS.items[slot] : null;

                  return (
                    <div
                      key={slot}
                      ref={(node) => {
                        if (node) cardRefs.current.set(slot, node);
                        else cardRefs.current.delete(slot);
                      }}
                      className="absolute"
                      style={{
                        left: 0,
                        top: 0,
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        marginLeft: -CARD_WIDTH / 2,
                        marginTop: -CARD_HEIGHT / 2,
                        transformOrigin: "center center",
                      }}
                      aria-hidden
                    >
                      {item
                        ? SEP_INKS.map((sepInk, g) => (
                            <div
                              key={sepInk}
                              ref={(node) => {
                                const list = ghostRefs.current.get(slot) ?? [];
                                if (node) list[g] = node;
                                ghostRefs.current.set(slot, list);
                              }}
                              className="absolute inset-0 rounded-[32px]"
                              style={{ background: sepInk }}
                            />
                          ))
                        : null}

                      <TrackCard
                        color={color}
                        isFront={item !== null}
                        is2x
                        width={CARD_WIDTH}
                        height={CARD_HEIGHT}
                        className="absolute inset-0"
                      >
                        {item ? (
                          <div
                            ref={(node) => {
                              if (node) contentRefs.current.set(slot, node);
                              else contentRefs.current.delete(slot);
                            }}
                            className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[48px] py-[40px] opacity-0"
                            style={{ color: ink }}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-rotonto text-[26px] tracking-[0.2em] tabular-nums">
                                {pad(slot + 1)}
                                <span className="opacity-50">{` / ${pad(COUNT)}`}</span>
                              </span>
                              <TrackAsterisk size={30} />
                            </div>

                            <div className="-mt-[12px] flex items-start gap-[36px]">
                              <div className="min-w-0 flex-1">
                                <h3
                                  className={`font-rotonto leading-[0.94] tracking-tight ${
                                    item.title.length > 30
                                      ? "text-[38px]"
                                      : item.title.length > 20
                                        ? "text-[46px]"
                                        : "text-[60px]"
                                  }`}
                                >
                                  {item.title}
                                </h3>
                                <div
                                  className="my-[18px] h-[2px] w-full"
                                  style={{ background: rule }}
                                />
                                <p
                                  className={`font-rotonto leading-[1.5] tracking-tight opacity-90 ${
                                    item.blurb.length > 250 ? "text-[20px]" : "text-[23px]"
                                  }`}
                                >
                                  {item.blurb}
                                </p>
                              </div>
                              <TrackVisual
                                slot={slot}
                                ink={ink}
                                rule={rule}
                                size={76}
                                is2x
                                className="h-[216px] w-[184px]"
                              />
                            </div>

                            <div className="flex items-end justify-between font-rotonto text-[16px] uppercase tracking-[0.36em] opacity-55">
                              <span>{"label" in item ? item.label : "Track"}</span>
                              <span
                                className="mx-[24px] mb-[6px] h-[2px] flex-1"
                                style={{ background: rule }}
                              />
                              <span>VinHack 26</span>
                            </div>
                          </div>
                        ) : null}
                      </TrackCard>
                    </div>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export default TracksCardDeck;
