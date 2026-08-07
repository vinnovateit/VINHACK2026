"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Motion for the hero collage.
 *
 * Targets are tagged in `sections/Hero.tsx` with `data-hero="<role>"`. Several
 * of those tags sit on Figma grouping wrappers, which are emitted as
 * `display: contents` — those generate no box at all, so transforms and opacity
 * are inert on them and we descend to the real boxes underneath.
 *
 * Three properties are deliberately kept apart so the concurrent tweens never
 * fight over one transform: the entrance uses `scale`/`rotation`, the idle
 * float uses `y`, and the scroll parallax uses `yPercent`. GSAP composes all of
 * them into a single matrix.
 */

/** Stickers, in the order they land. `tilt` is the entrance overshoot (deg),
 *  `drift` the idle float (px), `sway` the idle rock (deg), `depth` the
 *  parallax rate. The disc's `sway` is 0 because its own slow spin owns
 *  `rotation` — two tweens on one property would fight. */
const STICKERS = [
  { role: "git", tilt: -14, drift: 7, sway: 1.4, depth: 0.9 },
  { role: "folder", tilt: 12, drift: -6, sway: -1.4, depth: 1.2 },
  { role: "qr", tilt: -11, drift: -8, sway: -1.2, depth: 1.1 },
  { role: "note", tilt: -16, drift: -5, sway: -1.6, depth: 0.8 },
  { role: "disc", tilt: 10, drift: 8, sway: 0, depth: 1.0 },
  { role: "megaphone", tilt: 16, drift: 5, sway: 1.8, depth: 1.4 },
  { role: "key", tilt: 18, drift: 6, sway: 1.5, depth: 1.5 },
] as const;

/** Must clear the entrance timeline: the idle loops reuse `y`, and starting
 *  one while the entrance is still tweening the same property would fight. */
const ENTRANCE_END = 2.1;

/** Figma group wrappers are `display: contents`; walk past them to real boxes. */
function collectBoxes(node: Element, out: HTMLElement[]) {
  const el = node as HTMLElement;
  if (getComputedStyle(el).display === "contents") {
    for (const child of Array.from(el.children)) collectBoxes(child, out);
  } else {
    out.push(el);
  }
}

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
          .forEach((node) => collectBoxes(node, out));
        return out;
      };

      const hero = scope.querySelector('[data-node-id="343:1172"]');
      // The arc lettering is one <p> per character — enough to stagger a wave.
      const letters = boxes("scroll").filter((el) => el.textContent?.trim());

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scope, { opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Reveal synchronously rather than as the timeline's first frame: the
        // ticker is driven by requestAnimationFrame, which never fires while
        // the tab is in the background, and the collage must not stay blank
        // until the tab is focused.
        gsap.set(scope, { opacity: 1 });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(boxes("nav"), {
          yPercent: -130,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
        })
          // The wordmark is the anchor: it lands first and everything is
          // stuck onto it afterwards.
          .from(
            boxes("wordmark"),
            {
              scale: 0.8,
              rotation: -6,
              opacity: 0,
              duration: 0.85,
              ease: "back.out(1.5)",
            },
            0.15,
          );

        // Stickers slap onto the page one after another.
        STICKERS.forEach(({ role, tilt }, i) => {
          tl.from(
            boxes(role),
            {
              scale: 0.35,
              rotation: `+=${tilt}`,
              opacity: 0,
              duration: 0.7,
              ease: "back.out(2)",
            },
            0.45 + i * 0.07,
          );
        });

        tl.from(boxes("lede"), { y: 26, opacity: 0, duration: 0.7 }, 0.95)
          .from(
            letters,
            { y: 12, opacity: 0, duration: 0.45, stagger: 0.025 },
            1.1,
          );

        // Idle: everything breathes slightly, desynced so it never pulses in
        // step. Concentric group members share one y, so they stay glued.
        STICKERS.forEach(({ role, drift, sway }, i) => {
          gsap.to(boxes(role), {
            y: drift,
            ...(sway ? { rotation: `+=${sway}` } : {}),
            duration: 3.4 + i * 0.31,
            delay: ENTRANCE_END + i * 0.17,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        // The pixel disc turns slowly, like a badge.
        gsap.to(boxes("disc"), {
          rotation: "+=360",
          duration: 48,
          delay: ENTRANCE_END,
          ease: "none",
          repeat: -1,
        });

        // A wave running through "scroll down for more".
        gsap.to(letters, {
          y: -5,
          duration: 0.75,
          delay: ENTRANCE_END,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.055 },
        });

        // Parallax as the hero scrolls away — the collage comes apart by depth.
        if (hero) {
          const parallax = (targets: HTMLElement[], depth: number) => {
            if (!targets.length) return;
            gsap.to(targets, {
              yPercent: -14 * depth,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 0.4,
              },
            });
          };
          STICKERS.forEach(({ role, depth }) => parallax(boxes(role), depth));
          parallax(boxes("wordmark"), 0.35);
          parallax(boxes("lede"), 0.6);
        }

        // The "Register Now" note lifts under the cursor. Scale only — the
        // idle loop owns `y` and `rotation` on these same boxes, and a second
        // tween on either would fight it (or, with overwrite, kill it).
        const note = boxes("note");
        if (note.length) {
          const enter = () =>
            gsap.to(note, { scale: 1.06, duration: 0.35, ease: "back.out(2)" });
          const leave = () =>
            gsap.to(note, { scale: 1, duration: 0.45, ease: "power2.out" });
          note.forEach((el) => {
            el.addEventListener("pointerenter", enter);
            el.addEventListener("pointerleave", leave);
          });
          return () => {
            note.forEach((el) => {
              el.removeEventListener("pointerenter", enter);
              el.removeEventListener("pointerleave", leave);
            });
          };
        }
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
