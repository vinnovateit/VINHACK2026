import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { neonStrike } from "@/components/motion/recipes";

gsap.registerPlugin(ScrollTrigger);

/**
 * Heading arrival: neonStrike tube keyed to scroll.
 *
 * (Text reveal / blur-fade in-animations have been removed so copy renders
 * naturally without entrance blur).
 */

export function reveal(
  _targets?: HTMLElement[],
  _opts?: { trigger?: Element; duration?: number; stagger?: number },
) {
  // Text blur-fade in-animations removed so copy renders naturally without entrance blur.
  return undefined;
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
