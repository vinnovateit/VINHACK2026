import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { neonStrike } from "@/components/motion/recipes";

gsap.registerPlugin(ScrollTrigger);

/**
 * Two one-shot arrivals for a section's own words, kept out of
 * `motion/recipes.ts` for the reason `motion/handwrite.ts` is: the reference
 * site fades nothing and staggers nothing, so there is no source timing to
 * transcribe and pretending otherwise would spoil the transcription.
 *
 * Both are deliberately outside the page's transform budget. `PageMotion`
 * already spends x, y, scale and rotation on drift, settle and the loops, and
 * an entrance that also wanted one of those would have to take it off whatever
 * holds it. These spend `opacity` and `filter` instead, so a paragraph can
 * arrive *and* keep drifting, and a heading can strike on while it settles.
 */

/** The arrival, shared by both: out of focus and dark, into focus and lit. */
const FROM = { opacity: 0, filter: "blur(12px)" };

/**
 * Copy arriving as it comes into view — each target pulling into focus a beat
 * after the one before.
 *
 * The blur is what makes this read as type resolving rather than as a plain
 * fade, and it is cleared rather than left at `blur(0px)`: a live filter keeps
 * the element rasterized and a containing block for the rest of the page's
 * life, for a blur that is no longer being drawn.
 */
export function reveal(
  targets: HTMLElement[],
  {
    trigger,
    duration = 0.72,
    stagger = 0.16,
  }: { trigger: Element; duration?: number; stagger?: number },
) {
  if (!targets.length) return;
  return gsap.fromTo(
    targets,
    FROM,
    {
      opacity: 1,
      filter: "blur(0px)",
      duration,
      stagger,
      ease: "power2.out",
      onComplete: () => gsap.set(targets, { clearProps: "filter" }),
      scrollTrigger: {
        trigger,
        start: "top bottom-=10%",
        toggleActions: "play none none none",
      },
    },
  );
}

/**
 * A heading striking on like the hero's wordmark does, but keyed to the scroll
 * rather than to a page load — the same `neonStrike` tube, armed the first time
 * the section is on screen.
 *
 * The tween itself is built paused and played by the trigger, because
 * `neonStrike` is a `fromTo` off zero: it hides its target the moment it is
 * built, which is what keeps the heading dark from the first painted frame
 * rather than flashing at full strength and then striking.
 */
export function strikeOnce(
  target: HTMLElement,
  { trigger, duration = 0.9 }: { trigger: Element; duration?: number },
) {
  const tween = neonStrike(target, { duration });
  tween.pause();
  ScrollTrigger.create({
    trigger,
    start: "top bottom-=10%",
    once: true,
    onEnter: () => tween.play(),
  });
  return tween;
}
