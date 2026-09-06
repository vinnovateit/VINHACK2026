import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shareOrigin } from "@/components/motion/recipes";

gsap.registerPlugin(ScrollTrigger);

/**
 * The swap between the two pinned sheets.
 *
 * Rules and Guidelines are drawn as the same object: a sheet of paper with a
 * pin through the top of it, one after the other down the page. Scrolling from
 * the first to the second should therefore not read as two sections passing
 * vertically — it should read as one sheet being taken off the board and the
 * next going up in its place. So the rules turn and slide out to the side, and
 * the guidelines come down over the top of where they were.
 *
 * Both are scrub-linked, and both are keyed to the *boundary* between the two
 * sections rather than to either sheet's own rect — `PageMotion` hands them the
 * section elements, whose adjoining edges are the same line on the page. That
 * is what makes the two halves simultaneous: at the moment the rules are half
 * out of frame, the guidelines are half in.
 *
 * Neither section's scroll is held. The page keeps moving at the rate the
 * visitor is moving it; what changes is the direction the two sheets travel
 * while it does. Genuinely pinning the scroll here would need more than a
 * recipe — every section on this page is absolutely positioned inside a
 * CSS-scaled canvas, so a pin-spacer adds no scroll length to push against and
 * `position: fixed` is trapped by the scale — so it is deliberately not
 * attempted here.
 *
 * Both spend x, y and rotation, and both call `shareOrigin` first: these
 * sections reach the recipes as several sibling boxes (Figma's grouping
 * wrappers are `display: contents` and generate no box of their own), and a
 * turn applied to each of them separately splays the sheet into its pieces
 * instead of turning it.
 */

/**
 * The rules sheet coming off the board — turned as it goes, and out to the
 * right.
 *
 * The turn is what makes it a sheet rather than a panel sliding: paper picked
 * up by one corner swings. It is clipped by the section's own `overflow-clip`,
 * so it is gone by the edge of the frame rather than travelling over whatever
 * is beside it.
 */
export function foldAway(
  boxes: HTMLElement[],
  {
    trigger,
    shift = 620,
    turn = 15,
    lift = 60,
    unscale = 1,
    start = "bottom 85%",
    end = "bottom 15%",
  }: {
    trigger: Element;
    /** How far to the side it travels, in layout px. */
    shift?: number;
    /** Degrees it turns through on the way out. */
    turn?: number;
    /** A little rise with it, so it lifts off rather than sliding flat. */
    lift?: number;
    unscale?: number;
    start?: string;
    end?: string;
  },
) {
  if (!boxes.length) return;
  shareOrigin(boxes, unscale);
  return gsap.fromTo(
    boxes,
    { x: 0, y: 0, rotation: 0 },
    {
      x: shift,
      y: -lift,
      rotation: turn,
      ease: "none",
      scrollTrigger: { trigger, start, end, scrub: true },
    },
  );
}

/**
 * The guidelines sheet going up in its place — down from above, and clipped by
 * the section it is arriving in until it is properly on.
 *
 * It comes from the top rather than up from below because that is where a
 * sheet put on a board comes from: over the top of the one being taken off,
 * not out from under it. `drop` is deliberately larger than it looks like it
 * needs to be — the sheet has to start fully outside the frame or its top edge
 * is visible sitting in mid-air at the start of the scroll.
 */
export function dropIn(
  boxes: HTMLElement[],
  {
    trigger,
    drop = 520,
    turn = -6,
    unscale = 1,
    start = "top 85%",
    end = "top 15%",
  }: {
    trigger: Element;
    /** How far above its resting place it starts, in layout px. */
    drop?: number;
    /** Degrees it is turned by on the way down, straightening as it lands. */
    turn?: number;
    unscale?: number;
    start?: string;
    end?: string;
  },
) {
  if (!boxes.length) return;
  shareOrigin(boxes, unscale);
  return gsap.fromTo(
    boxes,
    { y: -drop, rotation: turn },
    {
      y: 0,
      rotation: 0,
      ease: "none",
      scrollTrigger: { trigger, start, end, scrub: true },
    },
  );
}
