"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PASS_VARIANTS, type PassVariant } from "@/components/pass/variants";
import { PASS } from "@/content/site";

/**
 * The attendee pass's card body, wired as a colour cycle with a deal.
 *
 * This replaces the plain `div` the Figma export put the card's fill on, and it
 * is deliberately the *innermost* box of the pass rather than a new wrapper
 * around it. `PageMotion` finds its drift and settle targets by `data-node-id`
 * and resolves them down to real boxes, so a wrapper inserted anywhere above
 * this would change what those moves land on. Sitting exactly where the fill
 * already sat, this is invisible to that pass.
 *
 * The whole card is the hit target — a click anywhere on it advances the
 * colourway — with two deliberate holes in it:
 *
 *   the camera panel   toggles the webcam, as it always did
 *   the shutter        goes to /memories
 *
 * Both stop the click from bubbling, which is what keeps the card from also
 * recolouring underneath them. That is the one rule anything added inside the
 * card has to follow.
 *
 * A card-sized click target is a mouse affordance and nothing else, so the
 * cycle is also on a real button that is off-screen until it is focused. The
 * card itself is left as a plain `div`: giving it `role="button"` would put a
 * button around the camera's button and the shutter's link, which is worse for
 * anything reading the page than an unlabelled decorative click is.
 *
 * The colourway is published as custom properties rather than pushed onto the
 * children, because the children are server-rendered markup in
 * `sections/About.tsx` and `mobile/MobileSite.tsx` — they name a role
 * (`var(--pass-ink)`) and inherit whatever this is currently painting.
 */
export default function PassCard({
  start,
  className,
  children,
}: {
  /** Index into `PASS_VARIANTS` this pass is drawn at. */
  start: number;
  className?: string;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(start);
  const card = useRef<HTMLDivElement>(null);
  const riffle = useRef<gsap.core.Timeline | null>(null);
  const variant: PassVariant = PASS_VARIANTS[index % PASS_VARIANTS.length];

  useEffect(
    () => () => {
      riffle.current?.kill();
    },
    [],
  );

  /**
   * The deal. The card lifts off the stack, tips against its own rotation and
   * drops back with a little bounce — a card being thumbed off a deck rather
   * than a box being scaled.
   *
   * `zIndex` is raised for the length of the move and then cleared. Raised, the
   * clicked pass passes over its neighbour, which is what makes two of these
   * side by side read as one stack being shuffled; cleared, the front pass gets
   * its camera and its shutter back on top where they can be clicked. Leaving
   * it raised would win the shuffle and lose the controls.
   *
   * Nothing here is on the critical path of the recolour: `next` sets the
   * colourway whether or not this runs, so a reduced-motion visitor gets the
   * same five passes without the flick.
   */
  const deal = useCallback(() => {
    const el = card.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    riffle.current?.kill();
    riffle.current = gsap
      .timeline()
      .set(el, { zIndex: 5 })
      .to(el, {
        y: -16,
        rotation: -4,
        scale: 1.035,
        duration: 0.16,
        ease: "power2.out",
      })
      .to(el, {
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.55)",
      })
      .set(el, { clearProps: "zIndex,transform" });
  }, []);

  const next = () => {
    setIndex((n) => (n + 1) % PASS_VARIANTS.length);
    deal();
  };

  return (
    <div
      ref={card}
      className={`${className ?? ""} cursor-pointer transition-colors duration-300`}
      style={
        {
          "--pass-bg": variant.bg,
          "--pass-ink": variant.ink,
          "--pass-stub": variant.stub,
          "--pass-feed": variant.feed,
          backgroundColor: "var(--pass-bg)",
        } as CSSProperties
      }
      onClick={next}
    >
      {children}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          next();
        }}
        className="sr-only rounded-[6px] bg-black px-[8px] py-[4px] font-rotonto text-[13px] text-white focus:not-sr-only focus:absolute focus:top-[10px] focus:left-[10px] focus:z-20"
      >
        {PASS.swatch}
      </button>
      {/* Says which colourway was landed on, for anything not looking. The card
          is decoration, so this is the only running commentary it owes. */}
      <span aria-live="polite" className="sr-only">
        {variant.name}
      </span>
    </div>
  );
}
