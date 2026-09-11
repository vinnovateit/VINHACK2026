"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { keyDown, keyUp } from "@/components/motion/click";
import { draggable } from "@/components/motion/drag";
import { slideIn, slideOut } from "@/components/motion/pinboard";
import { boxesOf, MOBILE } from "@/components/motion/recipes";
import { reveal } from "@/components/motion/reveal";
import { wireSpeaker } from "@/components/motion/speaker";
import { stampIn } from "@/components/motion/stamp";
import { wireTimelineReceipt } from "@/components/motion/receipt";

gsap.registerPlugin(useGSAP);

/**
 * Motion for the phone's page — `PageMotion` and `HeroMotion`'s opposite
 * number.
 *
 * Those two are gated to `DESKTOP` because below it the collage they measure is
 * `display: none`; everything they drive was therefore simply absent here, and
 * the phone had exactly the motion CSS alone could give it: the neon sign, the
 * dealt-in stickers, the two marquees, the receipt feed and the asterisk. Which
 * left the parts of the design that *are* a gesture — the rules sheet coming
 * off the board, the guidelines going up in its place, the stickers being
 * stamped down and then picked up — with nothing to perform them.
 *
 * This is the same vocabulary, pointed at the reflowed tree. It reads the same
 * recipes rather than reimplementing them, so a change to how a sheet folds is
 * one change and not two, and it finds its targets through `data-m-*`
 * attributes in `MobileSite` rather than through Figma node ids — that column
 * is not a Figma export and has no node ids to name:
 *
 *   data-m-stamp="0.4"       stamped down, this many seconds after its trigger
 *   data-m-stamp-at="top 45%"  where in the pass it fires, when it has to wait
 *   data-m-slide-out         panned off to the right as its section leaves
 *   data-m-slide-in          panned in from the left as its section arrives
 *   data-m-reveal            copy pulling into focus once
 *   data-m-drag              pickable up, and throwable off the page
 *
 * Split in two the way `PageMotion` is: everything that moves on its own is
 * behind `prefers-reduced-motion`, and the controls — the sound switch, the
 * scroll cue, the keycap, and picking a sticker up — are not. Reduced motion is
 * a request to stop the page moving by itself, not to take the controls away.
 */

/** How far the cap sinks when pressed, in the key's own drawing — the same
 *  figure `HeroMotion` uses, and for the same reason: the artwork draws the cap
 *  5.05 left and 2.59 up from its plate, and a press closes most of that. */
const KEY_TRAVEL = { x: -4.05, y: 2.1 };

/** How far a sheet travels across the phone. The collage's 620 is drawn for a
 *  1280px plate; a column is half that, and a sheet that overshoots simply
 *  spends the rest of the scroll gone. The same figure both ways, for the
 *  reason `motion/pinboard.ts` gives: a board that moved at two speeds would
 *  read as two boards. */
const SHEET_SHIFT = 360;

export default function MobileMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      const all = (selector: string) =>
        Array.from(scope.querySelectorAll<HTMLElement>(selector));
      /** The section an element belongs to — its bounds when it is dragged, and
       *  what the sheet recipes key off. */
      const sectionOf = (el: Element) => el.closest("section") ?? scope;

      mm.add(`${MOBILE} and (prefers-reduced-motion: no-preference)`, () => {
        // ---- the two pinned sheets -------------------------------------
        //
        // Hung off the sections rather than off the sheets themselves, for the
        // reason given in `motion/pinboard.ts`: the two halves only read as one
        // horizontal scroll if they are keyed to the ends of the gap between
        // the sections, and the sections' own edges are that gap.
        for (const el of all("[data-m-slide-out]")) {
          slideOut([el], { trigger: sectionOf(el), shift: SHEET_SHIFT });
        }
        for (const el of all("[data-m-slide-in]")) {
          slideIn([el], { trigger: sectionOf(el), shift: SHEET_SHIFT });
        }

        // ---- stamps ----------------------------------------------------
        //
        // Triggered off the sticker itself, not its section: the timeline's
        // rows sit at opposite ends of a very tall section, and one trigger for
        // both would deal the bottom row while it was still below the fold.
        for (const el of all("[data-m-stamp]")) {
          const at = el.dataset.mStampAt;
          stampIn([el], {
            trigger: el,
            delay: Number(el.dataset.mStamp) || 0,
            ...(at ? { start: at } : {}),
          });
        }

        // ---- copy ------------------------------------------------------
        for (const el of all("[data-m-reveal]")) {
          reveal([el], { trigger: sectionOf(el), stagger: 0 });
        }
      });

      mm.add(MOBILE, () => {
        const cleanups: (() => void)[] = [];

        // ---- the sound switch ------------------------------------------
        const speaker = scope.querySelector<HTMLElement>('[data-hero="speaker"]');
        if (speaker) {
          cleanups.push(
            wireSpeaker(
              speaker,
              !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            ),
          );
        }

        // ---- the scroll cue --------------------------------------------
        //
        // The disc is the cue, so it scrolls. What it scrolls to is whatever
        // follows the hero — named as "the next section" rather than by name,
        // so the cue keeps working if the order of the page changes.
        const disc = scope.querySelector<HTMLElement>('[data-hero="disc"]');
        const next = disc ? sectionOf(disc).nextElementSibling : null;
        if (disc && next) {
          const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches;
          const go = () =>
            next.scrollIntoView({
              behavior: smooth ? "smooth" : "auto",
              block: "start",
            });
          // Enter and Space, because the disc carries `role="button"` and that
          // is the keyboard contract a button owes.
          const onKey = (event: Event) => {
            const key = (event as KeyboardEvent).key;
            if (key !== "Enter" && key !== " ") return;
            event.preventDefault();
            go();
          };
          disc.addEventListener("click", go);
          disc.addEventListener("keydown", onKey);
          cleanups.push(() => {
            disc.removeEventListener("click", go);
            disc.removeEventListener("keydown", onKey);
          });
        }

        // ---- the keycap ------------------------------------------------
        //
        // It goes down and comes back up, and makes the noise a key makes.
        // There is no `;` to press on a phone, so this answers the finger only
        // — the keyboard half of the collage's version has nothing to listen
        // for here.
        const key = scope.querySelector<HTMLElement>('[data-hero="key"]');
        // `boxesOf` rather than the nodes themselves: the cap's two glyphs are
        // tagged through a `display: contents` wrapper, which generates no box,
        // and a transform on it would move nothing.
        const cap = key
          ? Array.from(
              key.querySelectorAll<HTMLElement>('[data-hero="key-cap"]'),
            ).flatMap((node) => boxesOf(node))
          : [];
        if (key && cap.length) {
          const press = () => {
            keyDown();
            gsap.to(cap, {
              ...KEY_TRAVEL,
              duration: 0.09,
              ease: "power2.out",
              overwrite: "auto",
            });
          };
          // `back.out` on the way up only: a switch is damped going down and
          // sprung coming back, and matching that is most of why it reads as a
          // key rather than a rectangle sliding.
          const release = () => {
            keyUp();
            gsap.to(cap, {
              x: 0,
              y: 0,
              duration: 0.24,
              ease: "back.out(2.6)",
              overwrite: "auto",
            });
          };
          // Released on the window rather than on the cap: dragging off a held
          // key and letting go elsewhere must not leave it stuck down.
          key.addEventListener("pointerdown", press);
          window.addEventListener("pointerup", release);
          window.addEventListener("pointercancel", release);
          cleanups.push(() => {
            key.removeEventListener("pointerdown", press);
            window.removeEventListener("pointerup", release);
            window.removeEventListener("pointercancel", release);
          });
        }

        // ---- the loose stickers ----------------------------------------
        //
        // Bounded by their own section, so nothing can be dropped onto the
        // rules or pushed off the column and lost — unless it is thrown, which
        // is the one way past the bounds and is meant to be.
        for (const el of all("[data-m-drag]")) {
          cleanups.push(draggable([el], { bounds: sectionOf(el) }));
        }

        // ---- the timeline receipt --------------------------------------
        cleanups.push(wireTimelineReceipt(scope));

        return () => cleanups.forEach((fn) => fn());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
