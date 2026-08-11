"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  boxesOf,
  bounceRock,
  coinFlip,
  hover,
  settle,
  sineRock,
  splitSlide,
} from "@/components/motion/besharm";

gsap.registerPlugin(useGSAP);

/**
 * Motion for the hero collage, in besharm.in's vocabulary. Every recipe used
 * here is transcribed in `motion/besharm.ts`, timings and all.
 *
 * The source's own hero is loop-only — no entrance, no fade, no parallax; the
 * page is simply there and the pieces never stop moving. This follows that:
 * the collage is revealed in one frame and the loops carry it. Scroll-linked
 * drift starts below the fold, which is also where the source starts it.
 *
 * Targets are tagged in `sections/Hero.tsx` with `data-hero="<role>"`. Several
 * of those tags sit on Figma grouping wrappers, emitted as `display: contents`
 * — those generate no box, so transforms are inert on them and `boxesOf`
 * descends to the real boxes underneath.
 *
 * Property budget — no two concurrent tweens may share a property, or they
 * fight over the single transform matrix GSAP composes:
 *   splitSlide / pendulum  ->  x
 *   coinFlip               ->  y + rotateY
 *   bounceRock / sineRock  ->  rotation
 *   hover                  ->  scale, with overwrite:"auto"
 */

/** Which loop each sticker runs, and how far its phase is offset so that
 *  neighbours never swing in step. */
const STICKERS = [
  { role: "git", loop: bounceRock, offset: 0 },
  { role: "folder", loop: coinFlip, offset: 0 },
  { role: "megaphone", loop: sineRock, offset: 0.4 },
  { role: "key", loop: sineRock, offset: 1.1 },
  { role: "note", loop: bounceRock, offset: 1.5 },
] as const;

/** Where `vinhack-outline.svg` sits relative to `vinhack-fill.svg`, in the px
 *  of the 1020.951 x 356.181 box the wordmark occupies. Measured off the two
 *  paths of the SVG they were split from, so it is the drawing's own offset
 *  rather than a guess: the outline's centre sits +14.32, +11.43 from the
 *  fill's in a 1023.16 x 357.889 viewBox. Moving the lettering by exactly this
 *  lands it inside its own outline. */
const LAYER_OFFSET = { x: 14.3, y: 11.4 };

export default function HeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const boxes = (role: string) => {
        const out: HTMLElement[] = [];
        scope
          .querySelectorAll(`[data-hero="${role}"]`)
          .forEach((node) => out.push(...boxesOf(node)));
        return out;
      };

      const hero = scope.querySelector('[data-node-id="343:1172"]');
      if (!hero) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scope, { opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Revealed synchronously rather than as a tween's first frame: the
        // ticker runs off requestAnimationFrame, which never fires while the
        // tab is backgrounded, and the collage must not sit blank until the tab
        // is focused. There is nothing to hide behind — none of this fades.
        gsap.set(scope, { opacity: 1 });

        // The two nav words take turns crossing the frame, the way the source's
        // "WORK" and "PLAY" do. The hero clips, so each one slides cleanly out
        // and back rather than overflowing the canvas.
        splitSlide(boxes("nav-lead"), { trigger: hero, phase: "leads" });
        splitSlide(boxes("nav-follow"), { trigger: hero, phase: "follows" });

        for (const { role, loop, offset } of STICKERS) {
          loop(boxes(role), { trigger: hero, offset });
        }

        // The disc carries a grid with a deliberate arrangement of lit cells,
        // and "scroll down for more" curves along under it — so unlike the
        // source's `.roti` badge it cannot turn all the way round without the
        // pattern tumbling and the pairing reading upside down. It rocks
        // instead: 45deg each way, so a full sweep is 90deg and it never sits
        // more than 45deg off the orientation the design draws it at.
        sineRock(boxes("disc"), { trigger: hero, angle: 45, duration: 3.5 });

        // The two pieces of running copy get the source's one-shot instead of a
        // loop — 0.8s power1.out out of a small offset, once, no fade.
        settle(boxes("lede"), { rotation: 9 }, { trigger: hero });
        settle(boxes("scroll"), { scale: 0.8 }, { trigger: hero, duration: 0.3 });

        const cleanups: (() => void)[] = [];

        // The wordmark closes into its own border on hover: the outline stays
        // exactly where it is drawn and the solid lettering slides down onto
        // it, closing the gap between the two. Off the cursor it slides back
        // out. Both directions run the source's own hover timing — 0.3s
        // power2.inOut — which eases in and out of the move with no overshoot.
        const wordmarkHit = scope.querySelector('[data-hero="wordmark"]');
        const fill = boxes("wordmark-fill");
        if (wordmarkHit && fill.length) {
          cleanups.push(
            hover(
              wordmarkHit,
              fill,
              { x: LAYER_OFFSET.x, y: LAYER_OFFSET.y, ease: "power2.inOut" },
              { x: 0, y: 0, ease: "power2.inOut" },
            ),
          );
        }

        // The "Register Now" note lifts under the cursor at the source's hover
        // timing. Scale only — its bounce loop owns `rotation` on the same
        // boxes, and a second tween on that would fight it. The tagged node is
        // a `display: contents` wrapper, which takes no pointer events itself
        // but does see them bubble up from the boxes inside it.
        const noteHit = scope.querySelector('[data-hero="note"]');
        if (noteHit) {
          cleanups.push(hover(noteHit, boxes("note"), { scale: 1.06 }, { scale: 1 }));
        }

        return () => cleanups.forEach((fn) => fn());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="hero-motion">
      {children}
    </div>
  );
}
