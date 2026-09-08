"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { keyDown, keyUp } from "@/components/motion/click";
import {
  boxesOf,
  DESKTOP,
  hover,
  neonStrike,
  reelIn,
  typewriter,
} from "@/components/motion/recipes";
import { wireSpeaker } from "@/components/motion/speaker";
import { HERO } from "@/content/site";

gsap.registerPlugin(useGSAP);

/**
 * Motion for the hero collage, in the reference site's vocabulary. Every recipe
 * used here is transcribed in `motion/recipes.ts`, timings and all — except the
 * typewriter, which the source has no equivalent for.
 *
 * The source's own hero is loop-only — no entrance, no fade, no parallax; the
 * page is simply there and the pieces never stop moving. The body of this page
 * still follows that. The hero no longer does: it opens instead, once, and only
 * then hands over to the loops.
 *
 * The opening is a neon sign coming on over a card table. The wordmark's
 * outline is a cold tube that strikes, drops out and catches again before it
 * holds; the solid lettering floods in behind it once the tube is lit, and the
 * whole sign blooms and settles. Then the stickers are dealt onto the black,
 * each thrown in from the edge it already sits nearest, a beat apart. The
 * commit line lands last and lands mechanically — it spins through glyphs and
 * resolves a column at a time, like a split-flap board, which is the one piece
 * of the collage that is a *display* rather than a sticker. The letters of
 * "scroll down for more" run in along their curve like bulbs round a marquee.
 *
 * Then, and only then, the loops arm. Nothing that repeats forever starts while
 * the entrance is still running.
 *
 * Targets are tagged in `sections/Hero.tsx` with `data-hero="<role>"`. Several
 * of those tags sit on Figma grouping wrappers, emitted as `display: contents`
 * — those generate no box, so transforms are inert on them and `boxesOf`
 * descends to the real boxes underneath. That distinction decides what a piece
 * may be dealt *with*: a role that resolves to several boxes has several
 * separate pivots, so rotating or scaling it splays it rather than moving it,
 * and those roles are thrown on x and y only. See `DEALT`.
 *
 * Property budget — no two concurrent tweens may share a property, or they
 * fight over the single transform matrix GSAP composes:
 *   disc arrow  ->  y, and opacity for the pulse
 *   keycap      ->  x and y, driven only by the pointer
 *   hover       ->  scale, or x/y on the wordmark, with overwrite:"auto"
 *   entrance    ->  everything else, but it is over before the loops arm
 *   speaker     ->  the arcs pulse on their own boxes; the on/off fade is on
 *                   their wrapper, so the two never meet
 *
 * Nothing in the hero rocks or rotates once it has landed. What was a collage
 * of stickers all swinging on their own timers is now four pieces that each do
 * one legible thing — the sticker types, the disc's arrow falls, the keycap
 * presses, the speaker's arcs leave the horn — and the rest holds still.
 */

/** Where `vinhack-outline.svg` sits relative to `vinhack-fill.svg`, in the px
 *  of the 1020.951 x 356.181 box the wordmark occupies. Measured off the two
 *  paths of the SVG they were split from, so it is the drawing's own offset
 *  rather than a guess: the outline's centre sits +14.32, +11.43 from the
 *  fill's in a 1023.16 x 357.889 viewBox. Moving the lettering by exactly this
 *  lands it inside its own outline. */
const LAYER_OFFSET = { x: 14.3, y: 11.4 };

/** Pitch of the disc's LED grid: the cells are 22.68px on a 26.46px stride,
 *  read straight off their `top` values in `sections/Hero.tsx`. The arrow moves
 *  in whole multiples of this so it always lands on the grid. */
const CELL = 26.46;

/** Rows the arrow travels to get from above the disc to its resting place, and
 *  again to clear the bottom. Six puts every cell outside the 169.785px circle
 *  at both ends, so the arrow is fully hidden before it turns around. */
const ARROW_ROWS = 6;

/**
 * How far the cap sinks when pressed, in the key's own drawing.
 *
 * The artwork already encodes the travel: the bright cap is drawn at
 * (6.52, 2.48) and the dim plate under it at (1.47, 5.07), and that 5.05 left /
 * 2.59 down difference is exactly the parallax of a cap standing above its
 * well. Pressing closes most of it — not all, or the cap looks like it fell
 * through the plate rather than bottoming out on it.
 */
const KEY_TRAVEL = { x: 3*0.3, y: 3 };

/**
 * How each sticker is thrown onto the black, and when.
 *
 * `from` is where the piece starts; every one of them comes from outside the
 * plate on the side it already lives on, so the deal reads as pieces arriving
 * at the arrangement rather than converging on the middle of it.
 *
 * `lede` is tagged on a `display: contents` wrapper and resolves to a single
 * box, so it can take a rotation. `qr` is now a real box, but it is the whole
 * plate carrying a scale about the sticker's own centre (see the note in
 * `sections/Hero.tsx`) — a rotation or a scale on it would turn or grow the
 * plate, not the sticker, so it stays x and y only.
 */
const DEALT: { role: string; at: number; from: gsap.TweenVars }[] = [
  { role: "git", at: 0.86, from: { x: -150, y: -54, rotation: -12, scale: 0.86 } },
  { role: "speaker", at: 0.95, from: { x: 132, y: -62, rotation: 14, scale: 0.78 } },
  { role: "note", at: 1.04, from: { x: -104, y: 104, rotation: 14, scale: 0.82 } },
  { role: "qr", at: 1.13, from: { x: 148, y: 46 } },
  { role: "lede", at: 1.2, from: { y: 58, rotation: 8 } },
  { role: "key", at: 1.28, from: { x: -84, y: 62, rotation: -22, scale: 0.72 } },
  { role: "disc", at: 1.36, from: { y: 96, scale: 0.62 } },
];

/** Where on the entrance the commit display starts spinning, and how long it
 *  then holds its landed line before the typewriter takes the sticker over. */
const REEL_AT = 1.28;
const REEL_HOLD = 0.85;

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
      const one = (role: string) =>
        scope.querySelector<HTMLElement>(`[data-hero="${role}"]`);

      const hero = scope.querySelector('[data-node-id="343:1172"]');
      if (!hero) return;

      /** The same "arm once it has been scrolled into view" the recipes use. */
      const seen = {
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play none none none",
      };

      /** The speaker sticker, wired as the page's sound switch. The wiring
       *  itself is `motion/speaker.ts` — the phone's hero draws the same
       *  sticker, and a switch drawn twice must not be two switches. */
      const speakerCleanups = (animated: boolean) => {
        const speaker = one("speaker");
        return speaker ? [wireSpeaker(speaker, animated)] : [];
      };

      /**
       * The three things the visitor can operate. Wired in both motion
       * branches, because reduced motion is a request to stop the page moving
       * on its own — not to take the controls away.
       *
       * `smooth` is the one thing that differs: a scroll the visitor asked for
       * still happens, it just arrives instead of gliding.
       */
      const wireControls = (smooth: boolean) => {
        const cleanups: (() => void)[] = [...speakerCleanups(smooth)];

        // The disc is the scroll cue, so it scrolls. `.body-frame` is the other
        // half of the canvas and starts exactly where the hero ends, so it is
        // the "next section" without naming any particular one.
        const disc = one("disc");
        const body = document.querySelector(".body-frame");
        if (disc && body) {
          const go = () =>
            body.scrollIntoView({
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

        // The keycap goes down and comes back up, and makes the noise a key
        // makes. It answers both the pointer and the `;` it is drawn with —
        // the cap's own legend is ":" over ";", so the key it depicts is the
        // one the visitor's keyboard has in the same place.
        const key = one("key");
        const cap = boxes("key-cap");
        if (key && cap.length) {
          // Pointer and keyboard can hold it down at the same time, so the
          // press is reference-counted: the cap goes down when the first hold
          // arrives and comes back up when the last one lets go.
          const held = new Set<string>();
          const press = (source: string) => {
            if (held.has(source)) return;
            const wasUp = held.size === 0;
            held.add(source);
            if (!wasUp) return;
            keyDown();
            gsap.to(cap, {
              ...KEY_TRAVEL,
              duration: 0.09,
              ease: "power2.out",
              overwrite: "auto",
            });
          };
          const release = (source: string) => {
            if (!held.delete(source) || held.size) return;
            keyUp();
            // `back.out` on the way up only: a switch is damped going down and
            // sprung coming back, and matching that is most of why it reads as
            // a key rather than a rectangle sliding.
            gsap.to(cap, {
              x: 0,
              y: 0,
              duration: 0.24,
              ease: "back.out(2.6)",
              overwrite: "auto",
            });
          };

          const onDown = () => press("pointer");
          // Released on the window rather than the cap: dragging off a held key
          // and letting go elsewhere must not leave it stuck down.
          const onUp = () => release("pointer");
          // The listener is on the window, so it would also fire for a `;`
          // typed into a field. There is nothing to type into on the page
          // today, but a registration form is exactly the kind of thing this
          // site grows, and a keycap thocking while someone fills one in is a
          // bug that would be hard to trace back to here.
          const typing = (target: EventTarget | null) =>
            target instanceof HTMLElement &&
            (target.isContentEditable ||
              ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

          const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== ";" || event.repeat || event.metaKey || event.ctrlKey)
              return;
            if (typing(event.target)) return;
            press("key");
          };
          const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === ";") release("key");
          };
          // A key held down while the tab loses focus never sees its keyup.
          const onBlur = () => release("key");

          key.addEventListener("pointerdown", onDown);
          window.addEventListener("pointerup", onUp);
          window.addEventListener("pointercancel", onUp);
          window.addEventListener("keydown", onKeyDown);
          window.addEventListener("keyup", onKeyUp);
          window.addEventListener("blur", onBlur);
          cleanups.push(() => {
            key.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", onBlur);
          });
        }

        return cleanups;
      };

      const mm = gsap.matchMedia();

      // Below `md` the collage is not the page — `MobileSite` is, and this tree
      // is `display: none`. Nothing here would measure correctly against boxes
      // with no layout, so the whole hero timeline is gated to the width where
      // the collage is on screen. `.hero-motion`'s opacity rule is gated to the
      // same width, so the hero is never left hidden by a timeline that did not
      // arm.
      mm.add(`${DESKTOP} and (prefers-reduced-motion: reduce)`, () => {
        gsap.set(scope, { opacity: 1 });
        const cleanups = wireControls(false);
        return () => cleanups.forEach((fn) => fn());
      });

      mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
        const line = one("commit-line");
        const caret = one("commit-caret");

        /**
         * Everything that runs forever, started only once the entrance is over.
         *
         * These used to arm on a ScrollTrigger at "top bottom", which for the
         * hero is true from the first frame — so they would all have been
         * running underneath the entrance, and the typewriter in particular
         * would have cleared the commit display while the reel was still
         * spinning it. Held back instead, and started by hand at the end of the
         * timeline.
         */
        const armLoops = () => {
          // The commit sticker is a terminal command, so it behaves like one:
          // each message types itself in, holds, clears, and the next one
          // starts. This replaces the rocking it used to do — a command being
          // written is a better reason for the sticker to be alive than a
          // wobble is.
          if (line) typewriter(line, HERO.commits, { trigger: hero });

          // The disc's lit cells spell an arrow pointing down, and the disc
          // sits above "scroll down for more" — so instead of turning the whole
          // badge (which tumbled the arrow through every orientation including
          // upside down) the arrow itself falls through the grid, top to
          // bottom, and the disc holds still.
          //
          // `steps()` rather than a smooth slide: this is a pixel display, and
          // the cells should land on their own grid rather than drift between
          // rows. The circle clips, so the arrow is genuinely gone at both ends.
          const arrow = boxes("disc-arrow");
          if (arrow.length) {
            gsap
              .timeline({ repeat: -1, scrollTrigger: seen })
              .set(arrow, { y: -ARROW_ROWS * CELL, opacity: 1 })
              .to(arrow, {
                y: 0,
                duration: 0.6,
                ease: `steps(${ARROW_ROWS})`,
              })
              // The pause, spent where the design draws the arrow. It breathes
              // rather than going dark, so the disc never looks switched off.
              .to(arrow, {
                opacity: 0.4,
                duration: 0.7,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 3,
              })
              .to(arrow, {
                y: ARROW_ROWS * CELL,
                duration: 0.6,
                ease: `steps(${ARROW_ROWS})`,
              })
              .to({}, { duration: 0.35 });
          }
        };

        /* ---------------------------------------------------- the entrance */

        const show = gsap.timeline();
        const sign = scope.querySelector<HTMLElement>('[data-hero="wordmark"]');
        const tube = one("wordmark-outline");
        const letters = boxes("wordmark-fill");

        // The tube strikes first and alone. `neonStrike` is a `fromTo` off
        // zero, so — like every `from` below — it hides its target the moment
        // it is built rather than when its turn comes, and the collage is dark
        // from the first painted frame.
        if (tube) show.add(neonStrike(tube), 0);

        // Then the gas floods the letterforms, from a hair oversize so the
        // lettering arrives *into* its outline rather than under it.
        if (letters.length) {
          show.fromTo(
            letters,
            { opacity: 0, scale: 1.035 },
            { opacity: 1, scale: 1, duration: 0.55, ease: "expo.out" },
            0.6,
          );
        }

        // And the whole sign blooms once. The halo is on the `<h1>` rather than
        // on either layer so it surrounds the wordmark as one object — and it
        // is cleared rather than left at zero, because a live `filter` keeps
        // the element rasterized and a containing block for the rest of the
        // page's life, for a glow that is no longer being drawn.
        if (sign) {
          show
            .fromTo(
              sign,
              { filter: "drop-shadow(0px 0px 26px rgba(191,234,136,0.8))" },
              {
                filter: "drop-shadow(0px 0px 0px rgba(191,234,136,0))",
                duration: 1.05,
                ease: "power2.out",
              },
              0.6,
            )
            .set(sign, { clearProps: "filter" }, 1.7);
        }

        // The deal. `back.out` lands each piece slightly past its mark and lets
        // it settle, which is a thrown object rather than a placed one.
        for (const { role, at, from } of DEALT) {
          const parts = boxes(role);
          if (!parts.length) continue;
          show.from(
            parts,
            { ...from, opacity: 0, duration: 0.72, ease: "back.out(1.4)" },
            at,
          );
        }

        // "scroll down for more" is set as twenty separately rotated letters
        // curving under the disc, so it gets the one thing twenty boxes are
        // good for: they light in sequence along the curve, like bulbs round a
        // marquee. Uniform y and nothing else — a scale or a rotation here
        // would be twenty letters each turning about its own centre.
        const curve = boxes("scroll");
        if (curve.length) {
          show.from(
            curve,
            {
              y: 22,
              opacity: 0,
              duration: 0.34,
              ease: "power2.out",
              stagger: 0.018,
            },
            1.5,
          );
        }

        // The commit display lands mechanically while its sticker is still
        // arriving, holds the line the markup shipped, and hands over.
        let landed = REEL_AT;
        if (line) {
          const reel = reelIn(line, HERO.commits[0]);
          show.add(reel, REEL_AT);
          // Measured off the tween rather than restated: the reel's duration is
          // its own business, and a relative `">"` here would hang off whatever
          // was added last instead — which is the caret, and much shorter.
          landed = REEL_AT + reel.duration();
        }
        if (caret) {
          show.fromTo(
            caret,
            { opacity: 0 },
            { opacity: 1, duration: 0.1, ease: "steps(1)" },
            REEL_AT,
          );
        }

        const handover = landed + REEL_HOLD;
        show.call(armLoops, undefined, handover);

        if (caret) {
          // `steps(1)` because a caret is on or off; easing it would fade.
          // Started with the loops, not before: a caret blinking under a reel
          // that is still spinning belongs to neither.
          show.call(
            () =>
              gsap.to(caret, {
                opacity: 0,
                duration: 0.5,
                ease: "steps(1)",
                repeat: -1,
                yoyo: true,
              }),
            undefined,
            handover,
          );
        }

        // Revealed synchronously rather than as a tween's first frame: the
        // ticker runs off requestAnimationFrame, which never fires while the
        // tab is backgrounded, and the collage must not sit blank until the tab
        // is focused. Every piece inside it is already hidden by its own tween,
        // so what this uncovers is the black plate they are dealt onto.
        gsap.set(scope, { opacity: 1 });

        const cleanups = wireControls(true);
        cleanups.push(() => show.kill());

        // The wordmark closes into its own border on hover: the outline stays
        // exactly where it is drawn and the solid lettering slides down onto
        // it, closing the gap between the two.
        //
        // The move is the source's; the timing is not. At the source's 0.3s
        // `power2.inOut` a 14px slide is over before the eye has followed it,
        // and easing in as well as out makes the start feel hesitant. It runs
        // long and front-loaded instead — `expo.out` leaves immediately and
        // spends the rest of its 0.55s settling onto the outline, which is what
        // reads as smooth. Leaving is slower still and eased at both ends,
        // because there is nothing to arrive at on the way back.
        const wordmarkHit = scope.querySelector('[data-hero="wordmark"]');
        const fill = boxes("wordmark-fill");
        if (wordmarkHit && fill.length) {
          cleanups.push(
            hover(
              wordmarkHit,
              fill,
              {
                x: LAYER_OFFSET.x,
                y: LAYER_OFFSET.y,
                duration: 0.55,
                ease: "expo.out",
              },
              { x: 0, y: 0, duration: 0.45, ease: "power2.inOut" },
            ),
          );
        }

        // The "Register Now" note lifts under the cursor. The tagged node is a
        // `display: contents` wrapper, which takes no pointer events itself but
        // does see them bubble up from the boxes inside it.
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
