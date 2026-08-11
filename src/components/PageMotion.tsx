"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  bounceRock,
  coinFlip,
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
} from "@/components/motion/besharm";
import { handwrite } from "@/components/motion/handwrite";

gsap.registerPlugin(useGSAP);

/**
 * Motion for everything below the hero, in besharm.in's vocabulary. Every
 * recipe used here is transcribed in `motion/besharm.ts`, timings and all.
 *
 * The shape of the source's page, and so of this one: nothing fades in and
 * nothing staggers. Sections are simply present. What makes them feel alive is
 * scroll-linked drift as they cross the viewport, one-shot settles on the way
 * in, and a small number of endless loops on the graphic pieces.
 *
 * Property budget — no two concurrent tweens may share a property, or they
 * fight over the single transform matrix GSAP composes:
 *   drift (scrubbed)       ->  y, or rotation where no loop uses it
 *   settle (one-shot)      ->  x / y / scale / rotation
 *   loops                  ->  rotation, or x, or y + rotateY
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
  /** Endless loop. */
  loop?: "bounce" | "sine" | "flip" | "spin" | "swing";
  /** Loop phase offset in seconds, so neighbours never move in step. */
  offset?: number;
  /** Cursive draw-on. Free to sit alongside the three above — it clips rather
   *  than transforms, so it is not competing for the transform matrix. */
  write?: { duration?: number; delay?: number };
};

const LOOPS = {
  bounce: bounceRock,
  sine: sineRock,
  flip: coinFlip,
  spin,
  swing: pendulum,
} as const;

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
      { node: "297:329", drift: -130 },
      { node: "297:385", drift: 40 },
      { node: "297:441", settle: { rotation: -5 } },
      { node: "297:443", drift: -40 },
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
      { node: "343:2120", drift: -40 },
      { node: "343:2215", loop: "sine", offset: 0.6 },
      { node: "343:2216", drift: -130 },
      { node: "343:2217", drift: -40 },
      { node: "343:2221", loop: "spin" },
      { node: "343:2223", loop: "bounce", offset: 1.2 },
    ],
  },
  {
    id: "343:709",
    name: "Rules",
    moves: [
      { node: "343:710", drift: -40 },
      { node: "343:716", settle: { rotation: 9 } },
      { node: "343:719", loop: "sine", offset: 0.3 },
    ],
  },
  {
    id: "343:751",
    name: "Guidelines",
    moves: [
      { node: "343:753", drift: -79 },
      { node: "343:756", settle: { rotation: -5 } },
      { node: "343:757", drift: -40 },
      { node: "343:760", settle: { rotation: 9 } },
      { node: "343:761", loop: "bounce", offset: 0.9 },
    ],
  },
  {
    id: "297:166",
    name: "Register",
    moves: [
      // "register now" is joined cursive on two lines, so it is written the way
      // it would be by hand: the top word first, then the second, with the gap
      // between them reading as the pen lifting to the next line. "now" is the
      // shorter word and gets a proportionally shorter stroke.
      { node: "297:169", write: { duration: 1.4 } },
      { node: "297:177", write: { duration: 0.6, delay: 1.45 } },
      { node: "297:167", drift: -40 },
    ],
  },
  {
    id: "297:3",
    name: "Footer",
    moves: [
      { node: "297:39", settle: { rotation: -5 } },
      { node: "297:20", drift: -40, end: "bottom top+=45%" },
    ],
  },
];

/** `speed: 100` at every breakpoint is what the source's marquees carry, and
 *  `direction: ltr` is content travelling leftwards. */
const MARQUEES = ["footer", "who"];

const TABS = ["email", "github", "instagram", "linkedin", "medium"];

export default function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const canvas = scope.closest(".canvas") as HTMLElement | null;
      /** Layout px per rendered px — the canvas is scaled to the viewport. */
      const unscale = canvas ? 1280 / canvas.getBoundingClientRect().width : 1;

      const mm = gsap.matchMedia();
      const cleanups: (() => void)[] = [];

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

          for (const { move, node } of resolved) {
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
            if (!boxes.length) continue;
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
            if (move.loop) {
              LOOPS[move.loop](boxes, {
                trigger,
                offset: move.offset ?? 0,
              });
            }
            if (move.write) {
              handwrite(boxes, { trigger, ...move.write });
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

        // ---- Project cards ---------------------------------------------
        for (const card of Array.from(scope.querySelectorAll("[data-card]"))) {
          // Scale only: the card's own drift owns `y` on the same box.
          cleanups.push(
            hover(card, [card as HTMLElement], { scale: 1.03 }, { scale: 1 }),
          );
        }

        return () => {
          cleanups.forEach((fn) => fn());
          cleanups.length = 0;
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
