"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { keyDown, keyUp } from "@/components/motion/click";
import { draggable } from "@/components/motion/drag";
import { slideIn, slideOut } from "@/components/motion/pinboard";
import { MOBILE, typewriter } from "@/components/motion/recipes";
import { reveal } from "@/components/motion/reveal";
import { wireSpeaker } from "@/components/motion/speaker";
import { stampIn } from "@/components/motion/stamp";
import { wireTimelineReceipt } from "@/components/motion/receipt";
import { HERO } from "@/content/site";

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
        const keyTarget =
          scope.querySelector<HTMLElement>('[data-hero="key-press"]') ?? key;
        if (key && keyTarget) {
          let releaseTimer: ReturnType<typeof setTimeout> | null = null;
          let pressTime = 0;

          const press = () => {
            if (releaseTimer) {
              clearTimeout(releaseTimer);
              releaseTimer = null;
            }
            pressTime = Date.now();
            keyDown();
            gsap.to(keyTarget, {
              y: 6,
              scale: 0.93,
              duration: 0.09,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          const release = () => {
            const elapsed = Date.now() - pressTime;
            const delay = Math.max(0, 140 - elapsed);
            if (releaseTimer) clearTimeout(releaseTimer);
            releaseTimer = setTimeout(() => {
              keyUp();
              gsap.to(keyTarget, {
                y: 0,
                scale: 1,
                duration: 0.24,
                ease: "back.out(2.6)",
                overwrite: "auto",
              });
            }, delay);
          };

          key.addEventListener("pointerdown", press);
          window.addEventListener("pointerup", release);
          window.addEventListener("pointercancel", release);
          cleanups.push(() => {
            if (releaseTimer) clearTimeout(releaseTimer);
            key.removeEventListener("pointerdown", press);
            window.removeEventListener("pointerup", release);
            window.removeEventListener("pointercancel", release);
          });
        }

        // ---- the wordmark ----------------------------------------------
        //
        // Fits into its outline on hover / touch, matching the desktop
        // gesture proportionally scaled to the mobile viewport.
        const wordmarkHit = scope.querySelector<SVGElement>('[data-hero="wordmark-hit"]');
        const fill = scope.querySelectorAll<HTMLElement>('[data-hero="wordmark-fill"]');
        const sign = scope.querySelector<HTMLElement>('[data-hero="wordmark"]');
        if (wordmarkHit && fill.length && sign) {
          let leaveTimer: ReturnType<typeof setTimeout> | null = null;
          let pressTime = 0;

          const enter = () => {
            if (leaveTimer) {
              clearTimeout(leaveTimer);
              leaveTimer = null;
            }
            pressTime = Date.now();
            const scale = sign.offsetWidth / 1020.951;
            gsap.to(fill, {
              x: 14.3 * scale,
              y: 11.4 * scale,
              duration: 0.28,
              ease: "expo.out",
              overwrite: "auto",
            });
          };

          const leave = () => {
            const elapsed = Date.now() - pressTime;
            const delay = Math.max(0, 300 - elapsed);
            if (leaveTimer) clearTimeout(leaveTimer);
            leaveTimer = setTimeout(() => {
              gsap.to(fill, {
                x: 0,
                y: 0,
                duration: 0.35,
                ease: "power2.inOut",
                overwrite: "auto",
              });
            }, delay);
          };

          wordmarkHit.addEventListener("pointerenter", enter);
          wordmarkHit.addEventListener("pointerleave", leave);
          wordmarkHit.addEventListener("pointerdown", enter);
          window.addEventListener("pointerup", leave);
          window.addEventListener("pointercancel", leave);

          cleanups.push(() => {
            if (leaveTimer) clearTimeout(leaveTimer);
            wordmarkHit.removeEventListener("pointerenter", enter);
            wordmarkHit.removeEventListener("pointerleave", leave);
            wordmarkHit.removeEventListener("pointerdown", enter);
            window.removeEventListener("pointerup", leave);
            window.removeEventListener("pointercancel", leave);
          });
        }

        // ---- the commit line typewriter --------------------------------
        const commitLine = scope.querySelector<HTMLElement>('[data-hero="commit-line"]');
        const commitGhost = scope.querySelector<HTMLElement>('[data-hero="commit-ghost"]');
        const commitCaret = scope.querySelector<HTMLElement>('[data-hero="commit-caret"]');
        if (commitLine) {
          const tw = typewriter(commitLine, HERO.commits, {
            trigger: commitLine,
            ghost: commitGhost,
          });
          if (tw) cleanups.push(() => tw.kill());
        }
        if (commitCaret) {
          const caretTween = gsap.to(commitCaret, {
            opacity: 0,
            duration: 0.5,
            ease: "steps(1)",
            repeat: -1,
            yoyo: true,
          });
          cleanups.push(() => caretTween.kill());
        }

        // ---- the "Register Now" note -----------------------------------
        const note = scope.querySelector<HTMLElement>('[data-hero="note"]');
        const noteHit =
          scope.querySelector<SVGElement>('[data-hero="note-hit"]') ?? note;
        if (note && noteHit) {
          const enterNote = () => {
            gsap.to(note, { scale: 1.06, duration: 0.2, ease: "power2.out", overwrite: "auto" });
          };
          const leaveNote = () => {
            gsap.to(note, { scale: 1, duration: 0.25, ease: "power2.inOut", overwrite: "auto" });
          };
          noteHit.addEventListener("pointerenter", enterNote);
          noteHit.addEventListener("pointerleave", leaveNote);
          noteHit.addEventListener("pointerdown", enterNote);
          window.addEventListener("pointerup", leaveNote);
          window.addEventListener("pointercancel", leaveNote);
          cleanups.push(() => {
            noteHit.removeEventListener("pointerenter", enterNote);
            noteHit.removeEventListener("pointerleave", leaveNote);
            noteHit.removeEventListener("pointerdown", enterNote);
            window.removeEventListener("pointerup", leaveNote);
            window.removeEventListener("pointercancel", leaveNote);
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
