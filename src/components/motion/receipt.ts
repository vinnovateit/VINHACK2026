import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The timeline's receipt, fed out of its printer and torn off.
 *
 * The design already draws the machine: `343:2039` is the red body, `343:2040`
 * the black slot across it, and the paper hangs below. So the honest reading of
 * "animate it like a real bill" is a print — the paper advances out of the slot
 * a line at a time, then gets torn off.
 *
 * Three things make it read as paper rather than a growing rectangle:
 *
 *   the ink travels          the printing is carried along with the paper
 *                            instead of being uncovered in place. A printer
 *                            prints at the slot and pushes what it has already
 *                            printed out ahead, so the footer clears the slot
 *                            first and the header lands last — the content
 *                            fills bottom to top, which is the giveaway that
 *                            it is a print and not a wipe.
 *   the feed is mechanical   `steps()`, not a smooth ease. A thermal printer
 *                            advances in discrete line feeds.
 *   the tear is a snap       a fast rip against the slot, then a damped swing
 *                            as the freed strip settles.
 *
 * Revealed with `clip-path` rather than by animating `height`: the paper holds
 * two dozen absolutely positioned children, and clipping keeps the whole feed
 * off the layout path.
 */

export type Receipt = {
  /** Feed it out again from nothing — what the day toggle calls. */
  reprint: () => void;
};

export function printReceipt(
  paper: HTMLElement,
  {
    trigger,
    duration = 1.9,
    start = "top 70%",
  }: { trigger: Element; duration?: number; start?: string },
): Receipt | undefined {
  const full = paper.offsetHeight;
  if (!full) return;

  /** Everything printed on the paper, the ragged edge included — it is part of
   *  the sheet and travels with it. */
  const ink = Array.from(paper.children) as HTMLElement[];

  /** `p` 0 is fully inside the printer, 1 is fully fed out.
   *
   *  Two things move together. The paper is clipped from the bottom, so its
   *  visible run grows downward from the slot. The printing is shifted up by
   *  whatever is still inside the machine, which puts the sheet's bottom edge
   *  exactly on the clip line at every moment — so the footer is what clears
   *  the slot first and the header arrives last, the paper filling from the
   *  bottom up. At p = 1 the shift is zero and everything sits on the mark
   *  Figma gave it. */
  const feed = (p: number) => {
    const shown = full * p;
    gsap.set(paper, {
      clipPath: `inset(0 0 ${((full - shown) / full) * 100}% 0)`,
    });
    gsap.set(ink, { y: shown - full });
  };

  const build = () => {
    const roll = { p: 0 };
    feed(0);
    gsap.set(paper, { rotation: 0, transformOrigin: "50% 0%" });

    return (
      gsap
        .timeline()
        .to(roll, {
          p: 1,
          duration,
          // ~14 line feeds a second, which is about the rate a receipt
          // printer actually advances at.
          ease: `steps(${Math.round(duration * 14)})`,
          onUpdate: () => feed(roll.p),
        })
        // The tear: a quick rip across the slot, then the freed strip swings
        // and settles. Small numbers — the paper is only 360px wide, and
        // anything more reads as a flag rather than a receipt.
        .to(paper, { rotation: 1.1, duration: 0.09, ease: "power3.in" })
        .to(paper, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" })
    );
  };

  let tl = build();
  tl.pause();

  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => tl.play(0),
  });

  // Already past it on load — a refresh partway down the page — so there is
  // nobody to watch it print. Leave the paper out rather than blank.
  if (trigger.getBoundingClientRect().bottom < window.innerHeight) {
    tl.progress(1);
  }

  return {
    reprint: () => {
      tl.kill();
      tl = build();
      tl.play(0);
    },
  };
}
