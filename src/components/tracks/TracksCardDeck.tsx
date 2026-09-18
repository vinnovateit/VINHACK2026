"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

import { TrackAsterisk, TrackCard, TRACK_COLORS, trackInk } from "./TrackCard";
import { TrackVisual } from "./TrackIcons";
import { DESKTOP } from "@/components/motion/recipes";
import { TRACKS } from "@/content/site";
import { clamp, mix, easeOutQuad as easeOut, easeIn, arc, smooth, smoothDamp } from "@/lib/math";

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
const HOLD = 0.5;
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

        // Subtle depth-based blur: pin-sharp at center, subtle blur as it recedes into depth
        const blurAmount = reduced ? 0 : Math.min(4.5, Math.max(0, (1 - e) * 4.5));
        const filterStr = blurAmount > 0.2 ? `blur(${blurAmount.toFixed(1)}px)` : "none";
        if (el.style.filter !== filterStr) {
          el.style.filter = filterStr;
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
        const btns = counter.querySelectorAll<HTMLElement>("[data-tick-btn]");
        btns.forEach((btn, i) => {
          btn.setAttribute("aria-selected", i === active ? "true" : "false");
        });
        const label = counter.querySelector<HTMLElement>("[data-tick-label]");
        if (label) label.textContent = `#${active + 1}`;
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
      update(0.016);
    };

    let drawn = Number.NaN;
    let currentP = -1;
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

      const currentScrollY =
        typeof window !== "undefined"
          ? (window.scrollY ?? document.documentElement.scrollTop ?? latestScrollY)
          : latestScrollY;
      const isReduced = calm.matches;

      // Fixed Stage Y Translation (Synchronous 1:1 scroll tracking with zero delay):
      // While locked in park (parkStart <= currentScrollY <= parkStart + travelPx):
      // stageY is EXACTLY 0. The stage is 100% stationary in the viewport, pinned
      // natively on the GPU compositor thread with ZERO bobbing and ZERO jitter!
      // Before parkStart: stage enters smoothly in lockstep (parkStart - currentScrollY).
      // After parkEnd: stage exits smoothly in lockstep ((parkStart + travelPx) - currentScrollY).
      let stageY = 0;
      if (currentScrollY < parkStart) {
        stageY = parkStart - currentScrollY;
      } else if (currentScrollY > parkStart + travelPx) {
        stageY = (parkStart + travelPx) - currentScrollY;
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

      // Card dealing progress (immediate 1:1 sync with scroll):
      const stuck = clamp(0, travelPx, currentScrollY - parkStart);
      const targetP = deckPosition(stuck / travelPx);
      currentP = targetP;
      initialized = true;

      // Counter fade in/out
      const enterProgress =
        (currentScrollY - parkStart + leadInPx / 2) / (leadInPx / 2);
      const exitProgress =
        (parkStart + travelPx + leadInPx / 2 - currentScrollY) / (leadInPx / 2);
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

    const goToTrack = (index: number) => {
      const targetIdx = clamp(0, COUNT - 1, index);
      const u = targetIdx * UNIT + 1 + HOLD * 0.4;
      const q = u / (COUNT * UNIT);
      const targetY = parkStart + q * travelPx;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    };

    const onCounterClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-tick-btn]");
      if (!btn) return;
      const idx = Number(btn.dataset.tickBtn);
      if (!Number.isNaN(idx)) {
        goToTrack(idx);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!armed || !desktop.matches) return;
      const scrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      if (scrollY < parkStart - 400 || scrollY > parkStart + travelPx + 400) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const active = clamp(0, COUNT - 1, Math.round(currentP));
        goToTrack(active - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const active = clamp(0, COUNT - 1, Math.round(currentP));
        goToTrack(active + 1);
      }
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

    counter.addEventListener("click", onCounterClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onLayout);
    desktop.addEventListener("change", onLayout);
    calm.addEventListener("change", onLayout);

    return () => {
      cancelAnimationFrame(rafId);
      counter.removeEventListener("click", onCounterClick);
      window.removeEventListener("keydown", onKeyDown);
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
                role="tablist"
                aria-label="Track navigation"
                className="pointer-events-auto absolute left-0 flex items-center gap-[10px] pl-[26px] font-rotonto text-[#fa1a1d] opacity-0 select-none z-50"
              >
                <span className="text-[11px] uppercase tracking-[0.42em]">Tracks</span>
                <div className="flex items-center gap-[6px] py-2">
                  {TRACKS.items.map((item, i) => (
                    <button
                      key={item.title}
                      type="button"
                      role="tab"
                      aria-label={`Go to Track ${i + 1}: ${item.title}`}
                      data-tick-btn={i}
                      className="group relative flex h-[28px] w-[24px] items-center justify-center cursor-pointer transition-transform hover:scale-115 focus-visible:outline-none"
                    >
                      <span
                        data-tick
                        className="block h-[3px] w-[18px] rounded-full bg-current opacity-25 transition-all duration-200 group-hover:opacity-80 group-hover:h-[4px]"
                        style={{ opacity: i === 0 ? 1 : 0.25 }}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] tracking-[0.2em] tabular-nums">
                  <span data-tick-label>#1</span>
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
                            className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[48px] py-[40px] opacity-100"
                            style={{ color: ink }}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-rotonto text-[26px] tracking-[0.2em] tabular-nums">
                                #{slot + 1}
                              </span>
                              <TrackAsterisk size={30} />
                            </div>

                            <div className="-mt-[12px] flex items-start gap-[36px]">
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className={`font-rotonto font-bold ${
                                      item.title.length > 30
                                        ? "text-[36px] leading-[1.12] tracking-[0.03em]"
                                        : item.title.length > 20
                                          ? "text-[44px] leading-[1.06] tracking-[0.02em]"
                                          : "text-[58px] leading-[1.02] tracking-[0.02em]"
                                    }`}
                                  >
                                    {item.title}
                                  </h3>
                                  <p
                                    className={`mt-[22px] font-rotonto text-justify leading-[1.5] tracking-tight opacity-90 ${
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
                                size={135}
                                is2x
                                className="h-[230px] w-[210px]"
                              />
                            </div>

                            <div className="flex min-h-[38px] items-end justify-end font-rotonto">
                              {"label" in item ? (
                                <span
                                  className="rounded-full px-[22px] py-[7px] text-[18px] font-bold uppercase tracking-normal shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1.5px_0_rgba(255,255,255,0.4)] border border-white/20"
                                  style={{ background: ink, color }}
                                >
                                  {item.label}
                                </span>
                              ) : null}
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
