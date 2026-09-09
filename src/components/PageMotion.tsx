"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  bounceRock,
  coinFlip,
  DESKTOP,
  drift,
  hover,
  marquee,
  pendulum,
  boxesOf,
  settle,
  sineRock,
  spin,
  triggerFor,
  type SettleFrom,
} from "@/components/motion/recipes";
import { draggable } from "@/components/motion/drag";
import { handwrite } from "@/components/motion/handwrite";
import { slideIn, slideOut } from "@/components/motion/pinboard";
import { printReceipt } from "@/components/motion/receipt";
import { audio } from "@/components/motion/audio";
import { toggleSnap } from "@/components/motion/machine";
import { reveal, strikeOnce } from "@/components/motion/reveal";
import { stampIn } from "@/components/motion/stamp";

gsap.registerPlugin(useGSAP);

/**
 * Motion for everything below the hero, in the reference site's vocabulary.
 * Every recipe used here is transcribed in `motion/recipes.ts`, timings and all.
 *
 * The shape of the source's page, and so of this one: nothing fades in and
 * nothing staggers. Sections are simply present. What makes them feel alive is
 * scroll-linked drift as they cross the viewport, one-shot settles on the way
 * in, and a small number of endless loops on the graphic pieces.
 *
 * Property budget — no two concurrent tweens may share a property, or they
 * fight over the single transform matrix GSAP composes:
 *   drift (scrubbed)       ->  y, or rotation where no loop uses it
 *   slide in/out (scrubbed) -> x, the two halves of the horizontal scroll
 *                              between the Rules and Guidelines sheets
 *   settle (one-shot)      ->  x / y / scale / rotation
 *   loops                  ->  rotation, or x, or y + rotateY
 *   stamp (one-shot)       ->  scale / rotation / opacity, and the loop it
 *                              shares rotation with is not started until it
 *                              has finished
 *   drag (interactive)     ->  x / y, and so never on a drifting element
 *   marquee (endless)      ->  x, on row elements only
 *   hover (interactive)    ->  y / scale, with overwrite:"auto"
 *   write (one-shot)       ->  clip-path, so outside the budget entirely
 * A settle and a loop may share `rotation` on one element only because the
 * settle is over in 0.8s and the loop is what remains.
 */

/**
 * One element's motion. Give a node exactly one of `settle`, `drift` or `loop`
 * — they all write the same transform matrix, and a scrubbed `drift` in
 * particular re-renders from its own recorded start state, which pins whatever
 * a `settle` on the same element was in the middle of doing. Two entries for
 * one node is the same mistake spelled differently.
 *
 * The one legal exception is a `drift` alongside a `loop`, and only because
 * `drift` names only the axes it was actually given: a y-only drift and a
 * rotation-only loop never touch the same property, and GSAP composes the two
 * into one matrix off its own per-property cache. That is the pairing the
 * attendee passes use — they drift past on the scroll and lean on their own
 * clock while they do it. A `turn` on the same node would break it, because
 * then both want rotation.
 */
type Move = {
  /** Figma node id of the element to move. */
  node: string;
  /** Scroll-linked travel in px across the element's viewport pass. */
  drift?: number;
  /** Scroll-linked turn in degrees across the same pass. */
  turn?: number;
  /** Shortens the pass, as three of the source's own elements do. */
  end?: string;
  /** The offset the element eases out of, once, as it enters view. */
  settle?: SettleFrom;
  /** Panned out to the right as the section leaves — the Rules half of the
   *  horizontal scroll between the two sheets. */
  slideOut?: true;
  /** Panned in from the left as the section arrives — the Guidelines half of
   *  the same scroll, going the same way at the same rate. */
  slideIn?: true;
  /** Endless loop. */
  loop?: "bounce" | "sine" | "flip" | "spin" | "swing";
  /** Loop phase offset in seconds, so neighbours never move in step. */
  offset?: number;
  /** Loop amplitude in degrees, where the recipe's own default is drawn for a
   *  small graphic and would splay something the size of a card. */
  angle?: number;
  /** Loop period in seconds. */
  duration?: number;
  /** Cursive draw-on. Free to sit alongside the three above — it clips rather
   *  than transforms, so it is not competing for the transform matrix. */
  write?: { duration?: number; delay?: number; start?: string };
  /** A heading striking on once, on the descendants `select` matches (the box
   *  itself when it is left out). Spends opacity, so it is outside the budget
   *  and free to sit alongside anything above. */
  strike?: { select?: string; duration?: number };
  /** Copy pulling into focus once, staggered across whatever `select` matches.
   *  Spends opacity and filter, so likewise outside the budget. */
  reveal?: { select?: string; stagger?: number; duration?: number };
  /** Stamped down as the section arrives, this many seconds after the trigger
   *  position is reached. Owns rotation until it lands, so a `loop` — or a
   *  scrubbed `fold` — on the same node is held back until it has. */
  stamp?: number;
  /** Where in the pass the stamp fires, for a sticker that has to wait for
   *  something else to finish first. The recipe's own `top 70%` otherwise. */
  stampAt?: string;
  /** Pickable up and movable, within its own section — and, thrown hard
   *  enough, off the page for good. Owns x and y, so a `drift` on the same node
   *  is not allowed. */
  drag?: true;
};

/** Every loop takes a trigger and a phase offset; the two that are shaped like
 *  a rock also take an amplitude, and all of them take a period. Typed as the
 *  widest of those so the table can name `angle` where it means something —
 *  `spin` and `flip` simply ignore it. */
type LoopFn = (
  targets: HTMLElement[],
  options: {
    trigger: Element;
    offset?: number;
    angle?: number;
    duration?: number;
  },
) => gsap.core.Animation | undefined;

const LOOPS: Record<NonNullable<Move["loop"]>, LoopFn> = {
  bounce: bounceRock,
  sine: sineRock,
  flip: coinFlip,
  spin,
  swing: pendulum,
};

/**
 * Per section, keyed by Figma node id. The drift distances are the source's own
 * ladder — -130 / -79 / +40 / -40 px — dealt out so that neighbouring pieces
 * separate as a section crosses the viewport rather than moving as a slab.
 */
const SECTIONS: { id: string; name: string; moves: Move[] }[] = [
  {
    id: "297:328",
    name: "About",
    moves: [
      // The two passes are the only pieces on the page a visitor can operate,
      // so they are the only ones that lean on their own clock as well as
      // drifting. Small angles and long, unequal periods: they are cards lying
      // against each other on a table, not stickers on a string, and periods
      // that divided into each other would have them breathing in unison.
      { node: "297:329", drift: -130, loop: "sine", angle: 1.4, duration: 6, offset: 1.3 },
      { node: "297:385", drift: 40, loop: "sine", angle: 2, duration: 5 },
      { node: "297:441", settle: { rotation: -5 }, strike: { select: "h2" } },
      { node: "297:443", drift: -40, reveal: { select: "p" } },
    ],
  },
  {
    id: "297:312",
    name: "Who are we",
    moves: [
      { node: "297:316", settle: { scale: 0.8 } },
      { node: "297:317", drift: -79 },
      { node: "297:326", settle: { rotation: 9 } },
    ],
  },
  {
    id: "297:300",
    name: "Projects",
    moves: [
      { node: "297:311", settle: { rotation: -5 } },
      { node: "297:310", drift: 40 },
      // The four cards are staggered across the drift ladder, so the stack
      // pulls apart on the way past and closes again on the way out.
      { node: "297:302", drift: -79 },
      { node: "297:304", drift: 40 },
      { node: "297:306", drift: -130 },
      { node: "297:308", drift: -40 },
    ],
  },
  {
    id: "594:33",
    name: "Tracks",
    moves: [
      { node: "594:34", settle: { scale: 0.8 } },
      { node: "596:376", drift: -40 },
    ],
  },
  {
    id: "343:2038",
    name: "Timeline",
    moves: [
      { node: "343:2222", settle: { rotation: -5 } },
      { node: "343:2039", drift: -79 },
      { node: "343:2115", drift: 40 },
      { node: "343:2119", settle: { rotation: -5 } },
      // The six loose stickers. All of them stamp down as the section arrives,
      // dealt out a tenth of a second apart so the section is stuck together
      // in front of you rather than appearing assembled, and all of them are
      // then the visitor's to move — which is why not one of them carries a
      // drift any more. A piece you can pick up cannot also be on a string.
      //
      // The three round ones turn all the way round rather than rocking
      // through an arc: a badge is a disc, and a disc that stops at 25 degrees
      // and comes back reads as stuck. They are given three unequal periods,
      // so they are never in step.
      { node: "343:2120", stamp: 0, drag: true, loop: "sine", angle: 2.5, duration: 7, offset: 0.4 },
      { node: "343:2215", stamp: 0.1, drag: true, loop: "spin", duration: 14 },
      { node: "343:2216", stamp: 0.2, drag: true, loop: "sine", angle: 2, duration: 6.5, offset: 0.9 },
      { node: "343:2217", stamp: 0.3, drag: true, loop: "sine", angle: 3, duration: 5.5, offset: 1.4 },
      { node: "343:2221", stamp: 0.4, drag: true, loop: "spin", duration: 20 },
      { node: "343:2223", stamp: 0.5, drag: true, loop: "spin", duration: 17 },
    ],
  },
  {
    id: "343:709",
    name: "Rules",
    moves: [
      // The sheet: read where it is drawn, then panned off the board to the
      // right as the section goes. The rules themselves are revealed through
      // this entry rather than getting one of their own — `reveal` selects
      // inside the node and spends opacity, so it neither claims the box away
      // from the pan nor competes with it. Whole block at once, because the pin
      // is waiting on it and ten staggered bullets is a long wait.
      {
        node: "343:710",
        slideOut: true,
        reveal: { select: '[data-node-id="343:715"]', stagger: 0 },
      },
      // The pin is stamped where it is drawn and does not move again until the
      // sheet goes, which it then goes with — it is through the paper, so it
      // cannot stay behind. Nothing about its arrival is scroll-linked.
      { node: "343:716", stamp: 0.8, slideOut: true },
      // Stamped, and then still. The badge's life is the asterisk beside it,
      // which breathes on its own clock in CSS (`.asterisk` in globals.css);
      // it used to rock as well, and the two together were fidgeting.
      { node: "343:719", stamp: 0.95, slideOut: true },
    ],
  },
  {
    id: "343:751",
    name: "Guidelines",
    moves: [
      // The other half of Rules' movement: the sheet comes in from the left the
      // way the rules went out to the right, clipped by the section until it is
      // properly on. Then the text resolves on it and the pin is driven in.
      { node: "343:753", slideIn: true },
      // The heading comes in with the sheet rather than settling on its own:
      // it is printed on the paper, and a heading that stayed put while the
      // page it is on arrived would be the one thing giving the trick away.
      { node: "343:756", slideIn: true },
      { node: "343:757", slideIn: true, reveal: { select: "p", stagger: 0 } },
      // Both stamped once the sheet has actually landed — `top 40%` rather
      // than the default `top 70%`, which is still inside the pan.
      { node: "343:760", stamp: 0.1, stampAt: "top 40%", slideIn: true },
      { node: "343:761", stamp: 0.25, stampAt: "top 40%", loop: "bounce", offset: 0.9 },
    ],
  },
  {
    id: "297:166",
    name: "Register",
    moves: [
      // "register now" cursive strokes are drawn by RegisterSvg and NowSvg.
      { node: "297:167", drift: -40 },
    ],
  },
  {
    id: "297:3",
    name: "Footer",
    moves: [
      { node: "297:20", drift: -40, end: "bottom top+=45%" },
    ],
  },
];

/** `speed: 100` at every breakpoint is what the source's marquees carry, and
 *  `direction: ltr` is content travelling leftwards. */
const MARQUEES = ["footer", "who"];

const TABS = ["email", "github", "instagram", "linkedin", "medium"];

/** The timeline's receipt printer, by Figma node id. */
const RECEIPT = {
  /** The paper itself — clipped, so it can be fed out of the slot. Everything
   *  printed on it, the zigzag edge included, travels with it. */
  paper: "343:2041",
  /** The day switch: a pill that slides under whichever day is selected. */
  toggle: "343:2115",
  day1Label: "343:2118",
  day2Label: "343:2116",
  /** The filled pill that slides between the two days. */
  pill: "343:2117",
} as const;

export default function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const canvas = scope.closest(".canvas") as HTMLElement | null;

      const mm = gsap.matchMedia();
      const cleanups: (() => void)[] = [];

      /**
       * Every draggable sticker's idle loop, by Figma node id.
       *
       * Shared between the two `matchMedia` blocks below — the first builds
       * the loops, the second is what picks the stickers up — and filled in
       * late rather than up front, because a stamped sticker's loop does not
       * exist until it has finished landing. The lookup is by id for exactly
       * that reason: there is nothing to hold a reference to at the moment the
       * drag is wired.
       */
      const idle = new Map<string, gsap.core.Animation>();

      // Gated to the width where the collage is on screen: below `md` this tree
      // is `display: none` and `MobileSite` renders instead. A hidden tree
      // measures 0x0, which would leave every ScrollTrigger with a start and an
      // end that coincide — and `unscale` below dividing by zero.
      mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
        /** Layout px per rendered px — the canvas is scaled to the viewport.
         *  Measured here rather than once on mount, so a window that starts
         *  below `md` and is then widened past it reads the canvas it got. */
        const canvasWidth = canvas?.getBoundingClientRect().width ?? 0;
        const unscale = canvasWidth ? 1280 / canvasWidth : 1;

        for (const section of SECTIONS) {
          const el = scope.querySelector(`[data-node-id="${section.id}"]`);
          if (!el) continue;

          // Some of the moves below name a group and others name something
          // inside it. Where they overlap the child wins: whoever holds the
          // more specific entry gets the box, and the group's move skips it.
          // Two tweens on one box would otherwise fight over its transform,
          // and the scrubbed one — re-rendering on every scroll tick — wins by
          // attrition, silently cancelling the other.
          const resolved = section.moves
            .map((move) => ({
              move,
              node: el.querySelector(`[data-node-id="${move.node}"]`),
            }))
            .filter((r): r is { move: Move; node: Element } => r.node !== null);
          const claimed = resolved.map((r) => r.node);

          const wire = (move: Move, node: Element) => {
            const boxes = boxesOf(node).filter(
              (box) =>
                !claimed.some(
                  (other) =>
                    // Only a claim from *inside* this node takes a box off it;
                    // a claim from an ancestor must not, or a nested move would
                    // filter away its own target.
                    other !== node &&
                    node.contains(other) &&
                    (box.contains(other) || other.contains(box)),
                ),
            );
            if (!boxes.length) return;
            const trigger = triggerFor(node);

            if (move.settle) {
              settle(boxes, move.settle, { trigger });
            }
            if (move.drift || move.turn) {
              drift(boxes, {
                trigger,
                y: move.drift ?? 0,
                rotation: move.turn ?? 0,
                ...(move.end ? { end: move.end } : {}),
              });
            }
            // The sheet recipes are the section's gesture, not the element's,
            // so they hang off the section rather than off whatever they are
            // moving. It matters twice over. The Guidelines sheet is drawn at
            // top -379 *inside* its section, so hung off its own rect it
            // crossed the viewport a full sheet-height early and had finished
            // arriving while you were still reading the rules. And the two
            // halves only read as one scroll if they are keyed to the two ends
            // of the gap between the sections — which the section edges are,
            // and no two elements inside them are.
            //
            // Neither is handed `unscale`: they spend x alone, and a layout px
            // is a layout px whatever the canvas is scaled to. It is only the
            // recipes that turn something which have to be told.
            const startSheet = () => {
              if (move.slideOut) slideOut(boxes, { trigger: el });
              if (move.slideIn) slideIn(boxes, { trigger: el });
            };

            const startLoop = move.loop
              ? () => {
                  const loop = LOOPS[move.loop!](boxes, {
                    trigger,
                    offset: move.offset ?? 0,
                    ...(move.angle !== undefined ? { angle: move.angle } : {}),
                    ...(move.duration !== undefined
                      ? { duration: move.duration }
                      : {}),
                  });
                  if (loop) idle.set(move.node, loop);
                }
              : null;

            // Everything that shares the transform matrix with the stamp is
            // built after it rather than alongside it.
            //
            // The loop is the obvious one — it wants the rotation the stamp is
            // still using. The sheet recipes are the subtle one, and they are
            // the reason the pin was not stamping at all: a scrubbed tween
            // re-renders from its own recorded start state on every scroll
            // tick, so a slide built first sat there rewriting the pin's
            // transform out from under the stamp for the whole of its 0.83s.
            // That is the hazard this file's header warns about, and the cure
            // is the same as for the loop — start it once the stamp is done.
            if (move.stamp !== undefined) {
              stampIn(boxes, {
                trigger,
                delay: move.stamp,
                unscale,
                ...(move.stampAt ? { start: move.stampAt } : {}),
                onSettled: () => {
                  startSheet();
                  startLoop?.();
                },
              });
            } else {
              startSheet();
              startLoop?.();
            }

            if (move.write) {
              handwrite(boxes, { trigger, ...move.write });
            }
            // The two below select inside the node rather than taking its
            // boxes, because what they animate is the words — a heading, a run
            // of paragraphs — and those are children of whatever box the
            // layout happens to have put around them.
            if (move.strike) {
              const { select, ...rest } = move.strike;
              const target = select
                ? node.querySelector<HTMLElement>(select)
                : (boxes[0] ?? null);
              if (target) strikeOnce(target, { trigger, ...rest });
            }
            if (move.reveal) {
              const { select, ...rest } = move.reveal;
              const targets = select
                ? Array.from(node.querySelectorAll<HTMLElement>(select))
                : boxes;
              reveal(targets, { trigger, ...rest });
            }
          };

          // One move per `try`, so a recipe that throws on one element costs
          // that element and nothing else.
          //
          // Without this the whole table is one basket: every move is wired in
          // a single pass over `SECTIONS`, so anything thrown partway down the
          // Timeline silently takes Rules, Guidelines, Register, the footer,
          // both marquees and the receipt printer with it — every section
          // after the throw simply never gets wired, with no sign of it but a
          // page that has gone still. The error is reported rather than
          // swallowed: this is here to contain a fault, not to hide one.
          for (const { move, node } of resolved) {
            try {
              wire(move, node);
            } catch (error) {
              console.error(
                `PageMotion: ${section.name} / ${move.node} failed to wire`,
                error,
              );
            }
          }
        }

        for (const key of MARQUEES) {
          const row = scope.querySelector(
            `[data-marquee="${key}"]`,
          ) as HTMLElement | null;
          if (row) marquee(row, { unscale });
        }

        // ---- Footer folder tabs ----------------------------------------
        for (const tab of TABS) {
          const hit = scope.querySelector(`[data-tab="${tab}"]`);
          const parts = Array.from(
            scope.querySelectorAll(`[data-tab-part="${tab}"]`),
          ) as HTMLElement[];
          if (!hit) continue;
          cleanups.push(hover(hit, parts, { y: -10 }, { y: 0 }));
        }

        // ---- Footer folder tabs, filed in ------------------------------
        //
        // The five bands are drawn as a drawer of folders, each overlapping the
        // last with only its lip showing — so they arrive the way a drawer is
        // filled: one at a time, from below, in the order they are stacked.
        //
        // A timeline with each tab dropped in at its own position rather than a
        // single staggered tween: a tab is a band *and* its label, and one
        // stagger across the flattened ten would deal a label a beat after the
        // band it is printed on. Each pair moves together and the pairs are
        // what stagger.
        //
        // On `y`, which the tabs' hover also spends — legal here for the same
        // reason a `settle` may share with a loop: this is over in under a
        // second, and it ends at exactly the `y: 0` the hover's own leave
        // tween returns to.
        const footer = scope.querySelector('[data-node-id="297:3"]');
        if (footer) {
          const drawer = gsap.timeline({
            scrollTrigger: {
              trigger: footer,
              start: "top bottom-=5%",
              toggleActions: "play none none none",
            },
          });
          TABS.forEach((tab, i) => {
            const parts = Array.from(
              scope.querySelectorAll(`[data-tab-part="${tab}"]`),
            ) as HTMLElement[];
            if (!parts.length) return;
            drawer.from(
              parts,
              { y: 96, opacity: 0, duration: 0.62, ease: "power3.out" },
              i * 0.09,
            );
          });
          cleanups.push(() => drawer.kill());
        }

        // ---- Project cards ---------------------------------------------
        for (const card of Array.from(scope.querySelectorAll("[data-card]"))) {
          // Scale only: the card's own drift owns `y` on the same box.
          cleanups.push(
            hover(card, [card as HTMLElement], { scale: 1.03 }, { scale: 1 }),
          );
        }

        // ---- Timeline receipt ------------------------------------------
        const node = (id: string) =>
          scope.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;

        const paper = node(RECEIPT.paper);
        const printer = node("343:2039");
        if (paper && printer) {
          const receipt = printReceipt(paper, { trigger: printer });

          // The day switch. The markup is two static labels and a filled pill,
          // so the whole control is wired here: the pill slides to whichever
          // half was clicked, the two labels trade places, and the receipt is
          // torn off and printed again for the day now selected.
          const toggle = node(RECEIPT.toggle);
          const pill = node(RECEIPT.pill);
          const day1Label = node(RECEIPT.day1Label);
          const day2Label = node(RECEIPT.day2Label);

          /** Show one day's schedule and hide the other. */
          const showDay = (day: "1" | "2") => {
            for (const which of ["1", "2"] as const) {
              paper
                .querySelectorAll<HTMLElement>(`[data-day="${which}"]`)
                .forEach((el) => {
                  el.style.display = which === day ? "" : "none";
                });
            }
          };

          if (receipt && toggle && pill && day1Label && day2Label) {
            // How far the pill travels to cover the other half.
            const throw_ = toggle.clientWidth - pill.offsetWidth;

            let onDayTwo = false;

            const pick = (wantDayTwo: boolean) => {
              const ac = audio();
              if (ac && ac.state === "suspended") void ac.resume();

              if (wantDayTwo === onDayTwo) {
                toggleSnap();
                receipt.reprint();
                return;
              }
              onDayTwo = wantDayTwo;

              const slide = {
                duration: 0.32,
                ease: "power3.out",
                overwrite: "auto" as const,
                onComplete: () => toggleSnap(),
              };
              gsap.to(pill, { x: wantDayTwo ? throw_ : 0, ...slide });
              day1Label.style.color = wantDayTwo ? "#2849cb" : "#74d4f0";
              day2Label.style.color = wantDayTwo ? "#74d4f0" : "#2849cb";

              // Swap which day's schedule is on the paper. Both are authored
              // in `sections/Timeline.tsx`; only one is ever displayed. Done
              // before reprinting, so the day now selected is what feeds out
              // rather than something that changes partway.
              showDay(wantDayTwo ? "2" : "1");

              receipt.reprint();
            };

            // Each half of the pill's track is a hit area. `pointerdown`
            // rather than `click` so the paper starts moving under the finger.
            const onDown = (event: Event) => {
              const ac = audio();
              if (ac && ac.state === "suspended") void ac.resume();
              const box = toggle.getBoundingClientRect();
              const x = (event as PointerEvent).clientX - box.left;
              const target = x > box.width / 2;
              pick(target === onDayTwo ? !onDayTwo : target);
            };

            toggle.style.cursor = "pointer";
            toggle.addEventListener("pointerdown", onDown);
            cleanups.push(() =>
              toggle.removeEventListener("pointerdown", onDown),
            );
          }
        }

        return () => {
          cleanups.forEach((fn) => fn());
          cleanups.length = 0;
          idle.clear();
        };
      });

      /**
       * The loose stickers, made pickable.
       *
       * Gated to the collage's width — a hidden tree has no boxes to grab —
       * but deliberately *not* to `prefers-reduced-motion`. Everything in the
       * block above moves without being asked and is rightly switched off by
       * that preference; this only ever moves because a hand moved it, and
       * withholding it would be withholding a control rather than sparing
       * someone an effect.
       */
      mm.add(DESKTOP, () => {
        const canvasWidth = canvas?.getBoundingClientRect().width ?? 0;
        const unscale = canvasWidth ? 1280 / canvasWidth : 1;
        const undo: (() => void)[] = [];

        for (const section of SECTIONS) {
          const el = scope.querySelector(`[data-node-id="${section.id}"]`);
          if (!el) continue;
          for (const move of section.moves) {
            if (!move.drag) continue;
            const node = el.querySelector(`[data-node-id="${move.node}"]`);
            if (!node) continue;
            undo.push(
              draggable(boxesOf(node), {
                // Its own section, so nothing can be dropped onto the rules or
                // pushed off the canvas and lost.
                bounds: el,
                unscale,
                onGrab: () => idle.get(move.node)?.pause(),
                onDrop: () => idle.get(move.node)?.resume(),
                // Thrown off the page: the loop has nothing left to turn, and
                // leaving it running is a forever timeline driving a hidden
                // box for the rest of the visit.
                onThrown: () => {
                  idle.get(move.node)?.kill();
                  idle.delete(move.node);
                },
              }),
            );
          }
        }

        return () => {
          undo.forEach((fn) => fn());
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
