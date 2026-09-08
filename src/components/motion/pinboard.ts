import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The swap between the two pinned sheets.
 *
 * Rules and Guidelines are drawn as the same object: a sheet of paper with a
 * pin through the top of it, one after the other down the page. Scrolling from
 * the first to the second should therefore not read as two sections passing
 * vertically — it should read as one board being scrolled sideways past the
 * window. So the rules pan out to the right and the guidelines follow them in
 * from the left: same direction, same distance, same rate. Two halves of one
 * horizontal scroll, and a board that moved at two speeds would be two boards.
 *
 * Flat, and deliberately so. Neither half turns and neither rises: a horizontal
 * scroll is horizontal, and a sheet that also swings on its way out reads as
 * being lifted off a board rather than as the board moving under it. It is also
 * why neither recipe needs the `shareOrigin` that `stampIn` does — a shared
 * *rotation* has to be about a shared point, but a shared translation is the
 * same delta wherever each box's own origin happens to sit.
 *
 * Both are scrub-linked, and both are keyed to a section edge rather than to
 * either sheet's own rect — `PageMotion` hands them the section elements, and
 * the rules' bottom and the guidelines' top are the two ends of the gap between
 * them. `--canvas-height` opens 416px there, and that gap is what the scroll
 * has to travel across: the rules pan off the right, a beat of empty board goes
 * by, and the guidelines arrive from the left.
 *
 * Each half is spent over a full viewport of scroll rather than the 70% it used
 * to be. Same travel, half again the page to do it in: the sheets move at about
 * two thirds the rate they did, which is the difference between a board being
 * scrolled and a slide being cut.
 *
 * Neither section's scroll is held. The page keeps moving at the rate the
 * visitor is moving it; what changes is the direction the two sheets travel
 * while it does. Genuinely pinning the scroll here would need more than a
 * recipe — every section on this page is absolutely positioned inside a
 * CSS-scaled canvas, so a pin-spacer adds no scroll length to push against and
 * `position: fixed` is trapped by the scale — so it is deliberately not
 * attempted here.
 */

/** How far a sheet travels, in layout px. One figure rather than one each,
 *  because the two halves are the same movement seen twice. */
const SHIFT = 620;

/**
 * The rules sheet leaving — straight out to the right.
 *
 * Clipped by the section's own `overflow-clip`, so it is gone at the edge of
 * the frame rather than travelling over whatever is beside it.
 */
export function slideOut(
  boxes: HTMLElement[],
  {
    trigger,
    shift = SHIFT,
    // Begun as the section's bottom edge reaches the fold and finished as it
    // reaches the top of the screen: the whole pan is on screen, and it has a
    // viewport of scroll to spend rather than 70% of one.
    start = "bottom 100%",
    end = "bottom 0%",
  }: {
    trigger: Element;
    /** How far to the side it travels, in layout px. */
    shift?: number;
    start?: string;
    end?: string;
  },
) {
  if (!boxes.length) return;
  gsap.set(boxes, { willChange: "transform", force3D: true });
  return gsap.fromTo(
    boxes,
    { x: 0 },
    {
      x: shift,
      force3D: true,
      ease: "none",
      scrollTrigger: { trigger, start, end, scrub: true },
    },
  );
}

/**
 * The guidelines sheet arriving — in from the left, the way the rules went, and
 * clipped by the section it is arriving in until it is properly on.
 */
export function slideIn(
  boxes: HTMLElement[],
  {
    trigger,
    shift = SHIFT,
    // The extra scroll is taken at the near end rather than the far one: the
    // sheet is begun while the section is still below the fold, where its own
    // `overflow-clip` hides it, so the pan is longer without the landing
    // moving — which matters, because the pin is stamped against that landing.
    start = "top 115%",
    end = "top 40%",
  }: {
    trigger: Element;
    /** How far it starts to the left of its resting place, in layout px. */
    shift?: number;
    start?: string;
    end?: string;
  },
) {
  if (!boxes.length) return;
  gsap.set(boxes, { willChange: "transform", force3D: true });
  return gsap.fromTo(
    boxes,
    { x: -shift },
    {
      x: 0,
      force3D: true,
      ease: "none",
      scrollTrigger: { trigger, start, end, scrub: true },
    },
  );
}
