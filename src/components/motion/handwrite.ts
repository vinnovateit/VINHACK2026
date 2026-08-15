import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A written-on reveal for the cursive lettering.
 *
 * Unlike everything in `motion/recipes.ts`, this is not transcribed from the
 * reference site — that site draws nothing on, so there is no source timing to
 * copy. It lives in its own file to keep the transcription honest.
 *
 * How it works, and why not the usual trick: the textbook draw-on animates
 * `stroke-dashoffset` along a path, which needs a *centreline* — one stroke
 * running down the middle of each letter. The Figma export has no such thing.
 * `register.svg` and `now.svg` are each a single filled outline path, so
 * stroking them would trace the contour of the letters, drawing an outline
 * around the word rather than writing it.
 *
 * So the reveal is a clip instead: a straight edge that sweeps left to right
 * across the lettering, uncovering it as it goes. That works here because the
 * lettering is joined cursive on one line — the pen really does travel left to
 * right without lifting, so an advancing edge lands very close to the order the
 * strokes were made. It is an approximation in two places: the crossbar of the
 * "t" and the descender loop of the "g" appear when the edge reaches their x
 * position rather than when a hand would double back for them.
 */

/**
 * How far the sweeping edge leans off vertical, matching the lettering's own
 * rightward lean so the edge runs along the strokes instead of cutting across.
 *
 * This is a chosen angle, not a measured one. Two passes at measuring it — a
 * shear-and-project slant search and a structure tensor over the ink edges —
 * both agreed the script leans right and disagreed on how far (16 to 40 deg,
 * tensor coherence only 0.47, the two words differing by 7 deg). The lettering
 * is a rounded brush script with almost no straight downstroke, so there is no
 * single slant in it to find. 15 deg is the conservative end of both estimates.
 */
const LEAN_DEG = 15;

/**
 * Sweeps a clip edge across `targets`, once, when `trigger` comes into view.
 *
 * `ease: "none"` deliberately: a hand crossing a word moves at a roughly steady
 * pace, and any ease-out would read as the pen running out of ink at the end of
 * every word.
 */
export function handwrite(
  targets: HTMLElement[],
  {
    trigger,
    duration = 1.4,
    delay = 0,
    start = "top 75%",
  }: {
    trigger: Element;
    duration?: number;
    delay?: number;
    start?: string;
  },
) {
  if (!targets.length) return;

  // A refresh partway down the page can put the lettering above the fold before
  // this ever runs. There is nobody watching it be written at that point, and
  // hiding it now would leave a blank that only un-blanks on a scroll back up —
  // so leave it drawn and skip the whole thing.
  const seen = trigger.getBoundingClientRect();
  if (seen.bottom < window.innerHeight) return;

  const lean = Math.tan((LEAN_DEG * Math.PI) / 180);

  // The lean expressed against each element's own width, which is what the
  // polygon below is measured in. Height and width both scale with the canvas,
  // so this ratio — and therefore the angle on screen — survives the scaling.
  const leads = targets.map((el) => {
    const r = el.getBoundingClientRect();
    return r.width ? (r.height / r.width) * lean * 100 : 0;
  });

  /** `p` 0 leaves the edge just off the left of the box, 1 just off the right.
   *  The left side sits at -50% so nothing is ever clipped from behind.
   *
   *  Set through GSAP rather than straight onto `style` so the clip is recorded
   *  and a `matchMedia` revert puts it back — otherwise tearing this down
   *  mid-word would leave the lettering stuck half-written. */
  const cut = (el: HTMLElement, lead: number, p: number) => {
    const foot = -lead + p * (100 + lead);
    gsap.set(el, {
      clipPath:
        `polygon(-50% 0%, ${(foot + lead).toFixed(2)}% 0%, ` +
        `${foot.toFixed(2)}% 100%, -50% 100%)`,
    });
  };

  targets.forEach((el, i) => cut(el, leads[i], 0));

  const pen = { p: 0 };
  return gsap.to(pen, {
    p: 1,
    duration,
    delay,
    ease: "none",
    scrollTrigger: {
      trigger,
      start,
      // Matches the rest of the page: play on the way in and never reverse.
      toggleActions: "play none none none",
    },
    onUpdate: () => targets.forEach((el, i) => cut(el, leads[i], pen.p)),
    // Drop the clip entirely once the word is written, so nothing is left
    // holding a clip-path on an element that is simply meant to be visible.
    onComplete: () => gsap.set(targets, { clearProps: "clipPath" }),
  });
}
