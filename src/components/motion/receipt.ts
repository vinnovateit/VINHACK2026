import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { audio } from "@/components/motion/audio";
import { feedTick, tearRip, toggleSnap } from "@/components/motion/machine";

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
 * And it is audible. One tick per line feed and a rip on the tear, both from
 * `motion/machine.ts` — the same synthesized construction as the keycap and the
 * shutter, so there is no audio file to fetch and nothing to 404. The ticks are
 * fired off the step index rather than off `onUpdate`, because `steps()` holds
 * a value across many frames and a tick a frame would be a buzz; the sound and
 * the picture then advance on exactly the same beat.
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
  const full = paper.offsetHeight || 595.872;
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
    let fed = 0;
    feed(0);
    gsap.set(paper, { rotation: 0, transformOrigin: "50% 0%" });

    const stepTo = (targetP: number, dur: number, stepCount: number) => ({
      p: targetP,
      duration: dur,
      ease: `steps(${stepCount})`,
      onUpdate: () => {
        feed(roll.p);
        const currentStep = Math.round(roll.p * 26);
        if (currentStep > fed) {
          fed = currentStep;
          feedTick();
        }
      },
    });

    const scale = duration / 1.86;

    return (
      gsap
        .timeline()
        // Chunk 1: Header / logo emerges
        .to(roll, stepTo(0.28, 0.35 * scale, 7))
        .to({}, { duration: 0.18 * scale })
        // Chunk 2: Masthead & date divider
        .to(roll, stepTo(0.55, 0.38 * scale, 7))
        .to({}, { duration: 0.16 * scale })
        // Chunk 3: Schedule entries & checkpoints
        .to(roll, stepTo(0.82, 0.36 * scale, 7))
        .to({}, { duration: 0.15 * scale })
        // Chunk 4: Footer lines & feed out to tear line
        .to(roll, stepTo(1.0, 0.28 * scale, 5))
        // The tear: a quick rip across the slot, then the freed strip swings
        // and settles.
        .call(tearRip)
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
  // nobody to watch it print. Leave the paper out rather than blank, and put
  // it there in silence: events are suppressed so the whole feed's worth of
  // ticks and the tear do not all fire at once on an unwatched sheet, which
  // means the paper has to be laid out by hand rather than by `onUpdate`.
  if (trigger.getBoundingClientRect().bottom < window.innerHeight) {
    feed(1);
    tl.progress(1, true);
  }

  return {
    reprint: () => {
      const ac = audio();
      if (ac && ac.state === "suspended") void ac.resume();
      tl.kill();
      tl = build();
      tl.play(0);
    },
  };
}

export const RECEIPT = {
  printer: "343:2039",
  slot: "343:2040",
  paper: "343:2041",
  toggle: "343:2115",
  day1Label: "343:2118",
  day2Label: "343:2116",
  pill: "343:2117",
} as const;

export function wireTimelineReceipt(scope: HTMLElement): () => void {
  const node = (id: string) =>
    scope.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;

  const paper = node(RECEIPT.paper);
  const printer = node(RECEIPT.printer);
  if (!paper || !printer) return () => {};

  let receipt = printReceipt(paper, { trigger: printer });
  const getReceipt = () => {
    if (!receipt) {
      receipt = printReceipt(paper, { trigger: printer });
    }
    return receipt;
  };

  const toggle = node(RECEIPT.toggle);
  const pill = node(RECEIPT.pill);
  const day1Label = node(RECEIPT.day1Label);
  const day2Label = node(RECEIPT.day2Label);

  if (!toggle || !pill || !day1Label || !day2Label) return () => {};

  const cleanups: (() => void)[] = [];

  const showDay = (day: "1" | "2") => {
    for (const which of ["1", "2"] as const) {
      paper
        .querySelectorAll<HTMLElement>(`[data-day="${which}"]`)
        .forEach((el) => {
          el.style.display = which === day ? "" : "none";
        });
    }
  };

  let onDayTwo = false;

  // Preserve yPercent: -50 so pill stays vertically centered
  gsap.set(pill, { yPercent: -50 });

  const pick = (wantDayTwo: boolean) => {
    const ac = audio();
    if (ac && ac.state === "suspended") void ac.resume();

    const r = getReceipt();

    if (wantDayTwo === onDayTwo) {
      toggleSnap();
      if (r) r.reprint();
      return;
    }
    onDayTwo = wantDayTwo;

    const throw_ =
      toggle.clientWidth && pill.offsetWidth
        ? toggle.clientWidth - pill.offsetWidth
        : 174.6;

    const slide = {
      duration: 0.32,
      ease: "power3.out",
      overwrite: "auto" as const,
      onComplete: () => toggleSnap(),
    };
    gsap.to(pill, { x: wantDayTwo ? throw_ : 0, yPercent: -50, ...slide });
    day1Label.style.color = wantDayTwo ? "#2849cb" : "#74d4f0";
    day2Label.style.color = wantDayTwo ? "#74d4f0" : "#2849cb";

    showDay(wantDayTwo ? "2" : "1");
    if (r) r.reprint();
  };

  let lastHandled = 0;
  const handleAction = (clientX: number) => {
    const now = Date.now();
    if (now - lastHandled < 250) return;
    lastHandled = now;

    const box = toggle.getBoundingClientRect();
    const x = clientX - box.left;
    const target = x > box.width / 2;
    pick(target);
  };

  const onPointerDown = (e: PointerEvent) => {
    handleAction(e.clientX);
  };
  const onClick = (e: MouseEvent) => {
    handleAction(e.clientX);
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches && e.changedTouches[0]) {
      handleAction(e.changedTouches[0].clientX);
    }
  };

  toggle.style.cursor = "pointer";
  toggle.style.touchAction = "manipulation";
  toggle.addEventListener("pointerdown", onPointerDown);
  toggle.addEventListener("click", onClick);
  toggle.addEventListener("touchend", onTouchEnd);
  cleanups.push(() => {
    toggle.removeEventListener("pointerdown", onPointerDown);
    toggle.removeEventListener("click", onClick);
    toggle.removeEventListener("touchend", onTouchEnd);
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}

