import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The motion vocabulary this page is built on, transcribed from a running
 * reference site.
 *
 * The numbers here were read off the live page rather than eyeballed — the
 * tweens were pulled straight out of `ScrollTrigger.getAll()` and
 * `gsap.globalTimeline` — so the durations, easings and distances are the
 * source's own. Where the source names a legacy ease ("Expo.easeOut") the GSAP
 * 3 spelling is used; same curve.
 *
 * The source is a Semplice 6 theme with an 18px root, authored at a 1280px
 * viewport — the same width as this canvas — so its rem distances convert at
 * x18 and land here 1:1. Both are quoted on each recipe.
 *
 * Two things the source never does, and for most of this file neither does it:
 * nothing fades in, and nothing staggers. Content is simply present, and the
 * page stays alive through endless loops and scroll-linked drift instead.
 *
 * The exception is the "entrance" section near the bottom — `neonStrike` —
 * which is not transcribed from anywhere. The hero now opens with a
 * deliberate reveal rather than being simply present, and that is its
 * vocabulary. Everything above that heading still follows the source's rule,
 * and nothing below the hero has an entrance at all.
 */

/** Root font-size on the reference site, for reading its rem distances back as
 *  px. */
const REM = 18;

/**
 * The width at and above which the 1280px collage is the page. Below it the
 * collage is `display: none` and `MobileSite` renders instead, so every recipe
 * here is gated to this width through `gsap.matchMedia`: a hidden tree measures
 * 0x0, which leaves ScrollTriggers whose start and end coincide and distances
 * derived from `offsetWidth` at zero.
 *
 * It is Tailwind's `md`, and it has to stay in step with the `md:` classes in
 * `page.tsx` that do the switching — the two are the same breakpoint written in
 * the two languages, and matchMedia cannot read a Tailwind variant.
 */
export const DESKTOP = "(min-width: 768px)";

/** The other half of the same switch: the width at which `MobileSite` is the
 *  page and the collage is `display: none`. `MobileMotion` gates on it for the
 *  same reason everything here gates on `DESKTOP` — whichever tree is hidden
 *  measures 0x0, and a recipe pointed at it moves nothing by no distance. */
export const MOBILE = "(max-width: 767px)";

/** Figma grouping wrappers are emitted as `display: contents` and generate no
 *  box, so transforms are inert on them — descend to the real boxes underneath. */
export function realBoxes(node: Element, out: HTMLElement[] = []): HTMLElement[] {
  for (const child of Array.from(node.children)) {
    if (getComputedStyle(child).display === "contents") realBoxes(child, out);
    else out.push(child as HTMLElement);
  }
  return out;
}

/** The same walk, except the node itself counts when it generates a box. */
export function boxesOf(node: Element): HTMLElement[] {
  return getComputedStyle(node).display === "contents"
    ? realBoxes(node)
    : [node as HTMLElement];
}

/**
 * The element to hang a ScrollTrigger off. A `display: contents` wrapper
 * measures 0x0, which leaves a trigger whose start and end coincide and whose
 * progress therefore never moves off zero — so fall through to the first real
 * box inside it, which sits in the same place and does have a rect.
 */
export function triggerFor(node: Element): Element {
  if (getComputedStyle(node).display !== "contents") return node;
  return realBoxes(node)[0] ?? node;
}

/**
 * Puts every box under one transform origin — the centre of the group they
 * make between them — so that a turn or a scale moves them as one drawing.
 *
 * This is what any Figma group needs before it can be rotated or scaled. The
 * grouping wrappers are `display: contents` and generate no box, so a group
 * like the rules sheet reaches a recipe as five separate boxes; each turning
 * about its own middle is not the sheet turning, it is five pieces of paper
 * splaying apart. Translation is the one transform that does not need this,
 * which is why `drift` has never wanted it.
 *
 * The origin is written in each box's own pixels, so the canvas scale has to
 * be divided back out: `getBoundingClientRect` is in rendered pixels and
 * `transform-origin` is in layout pixels.
 */
export function shareOrigin(boxes: HTMLElement[], unscale = 1) {
  if (boxes.length < 2) return;
  const rects = boxes.map((box) => box.getBoundingClientRect());
  const cx =
    (Math.min(...rects.map((r) => r.left)) +
      Math.max(...rects.map((r) => r.right))) /
    2;
  const cy =
    (Math.min(...rects.map((r) => r.top)) +
      Math.max(...rects.map((r) => r.bottom))) /
    2;

  boxes.forEach((box, i) => {
    gsap.set(box, {
      transformOrigin:
        `${((cx - rects[i].left) * unscale).toFixed(2)}px ` +
        `${((cy - rects[i].top) * unscale).toFixed(2)}px`,
    });
  });
}

/** Every loop below only arms once its element has been scrolled into view,
 *  which is what the source's bare `toggleActions: "play"` triggers do. Once
 *  armed they run forever — the source never pauses them. */
function whenSeen(trigger: Element): ScrollTrigger.Vars {
  return {
    trigger,
    start: "top bottom",
    end: "bottom top",
    toggleActions: "play none none none",
  };
}

/* ------------------------------------------------------------------ loops */

export type SlidePhase = "leads" | "follows";

/**
 * Two words taking turns sliding out of frame and back — the source's hero
 * "WORK" / "PLAY" pair. One leads while the other waits out its round trip, so
 * only one is ever moving. Both halves are an 8s cycle, which is what keeps
 * them interlocked.
 *
 * Transcribed and no longer called: the hero's HOME / EXPLORE pair, which was
 * the only thing running it, has been taken off the design. It stays on the
 * menu the way `pendulum` does.
 *
 *   leads:    -> -22.2222rem (-400px)  2s expo.out
 *             -> 0                     2s expo.in
 *             -> 0                     4s power1.out   (the wait)
 *   follows:  -> 0                     4s expo.in      (the wait)
 *             -> +22.2222rem (+400px)  2s expo.out
 *             -> 0                     2s expo.in
 */
export function splitSlide(
  targets: HTMLElement[],
  { trigger, phase, distance = 22.2222 * REM }: {
    trigger: Element;
    phase: SlidePhase;
    distance?: number;
  },
) {
  if (!targets.length) return;
  const tl = gsap.timeline({ repeat: -1, scrollTrigger: whenSeen(trigger) });
  if (phase === "follows") {
    tl.to(targets, { x: 0, duration: 4, ease: "expo.in" })
      .to(targets, { x: distance, duration: 2, ease: "expo.out" })
      .to(targets, { x: 0, duration: 2, ease: "expo.in" });
  } else {
    tl.to(targets, { x: -distance, duration: 2, ease: "expo.out" })
      .to(targets, { x: 0, duration: 2, ease: "expo.in" })
      .to(targets, { x: 0, duration: 4, ease: "power1.out" });
  }
  return tl;
}

/**
 * A word swinging between two extremes — the source's own wordmark lettering.
 * It jumps to one end on a zero-duration tween, then rocks across and back.
 *
 * Transcribed for completeness but not currently used anywhere: the wordmark
 * and the timeline heading both ran it and both were wanted still instead.
 * It stays on the menu in `PageMotion`'s `LOOPS` as `swing`.
 *
 *   set x +8.3333rem (+150px)
 *   -> -8.3333rem (-150px)  2s power2.inOut
 *   -> +8.3333rem (+150px)  2s power2.inOut
 */
export function pendulum(
  targets: HTMLElement[],
  { trigger, distance = 8.3333 * REM, duration = 2, offset = 0 }: {
    trigger: Element;
    distance?: number;
    duration?: number;
    offset?: number;
  },
) {
  if (!targets.length) return;
  return gsap
    .timeline({ repeat: -1, delay: offset, scrollTrigger: whenSeen(trigger) })
    .to(targets, { x: distance, duration: 0 })
    .to(targets, { x: -distance, duration, ease: "power2.inOut" })
    .to(targets, { x: distance, duration, ease: "power2.inOut" });
}

/**
 * A slow vertical flip — the source's ornament svg. It rises through a half
 * turn at a constant rate, then falls back through the other half, eased.
 *
 *   -> y +3.2222rem (+58px), rotateY 180deg  5s none
 *   -> y 0,                  rotateY 0deg    5s power1.inOut
 *
 * The source also carries `scale: 1.2` on both keyframes. That is the element's
 * design size held constant across the loop, so it contributes no motion, and
 * it is left to the element's own styling here rather than baked into the tween.
 */
export function coinFlip(
  targets: HTMLElement[],
  { trigger, rise = 3.2222 * REM, duration = 5, offset = 0 }: {
    trigger: Element;
    rise?: number;
    duration?: number;
    offset?: number;
  },
) {
  if (!targets.length) return;
  return gsap
    .timeline({ repeat: -1, delay: offset, scrollTrigger: whenSeen(trigger) })
    .to(targets, { y: rise, rotateY: 180, duration, ease: "none" })
    .to(targets, { y: 0, rotateY: 0, duration, ease: "power1.inOut" });
}

/**
 * A sticker knocked back and forth, landing hard each time — the source's
 * hand-lettered "hello". `bounce.out` on both legs is what gives it the little
 * settle at each end.
 *
 *   -> rotation +9deg  3s bounce.out
 *   -> rotation -9deg  3s bounce.out
 */
export function bounceRock(
  targets: HTMLElement[],
  { trigger, angle = 9, duration = 3, offset = 0 }: {
    trigger: Element;
    angle?: number;
    duration?: number;
    offset?: number;
  },
) {
  if (!targets.length) return;
  return gsap
    .timeline({ repeat: -1, delay: offset, scrollTrigger: whenSeen(trigger) })
    .to(targets, { rotation: angle, duration, ease: "bounce.out" })
    .to(targets, { rotation: -angle, duration, ease: "bounce.out" });
}

/**
 * A wide, even sweep — the source's pointing-hand graphic. Much further than
 * the bounce and completely smooth at both ends.
 *
 *   -> rotation -25deg  2s sine.inOut
 *   -> rotation +25deg  2s sine.inOut
 */
export function sineRock(
  targets: HTMLElement[],
  { trigger, angle = 25, duration = 2, offset = 0 }: {
    trigger: Element;
    angle?: number;
    duration?: number;
    offset?: number;
  },
) {
  if (!targets.length) return;
  return gsap
    .timeline({ repeat: -1, delay: offset, scrollTrigger: whenSeen(trigger) })
    .to(targets, { rotation: -angle, duration, ease: "sine.inOut" })
    .to(targets, { rotation: angle, duration, ease: "sine.inOut" });
}

/**
 * A badge turning at a constant rate. The source does this one in CSS rather
 * than GSAP — `.roti { animation: 20s linear infinite rotation }` — so 20s a
 * turn, no easing, never stopping.
 */
export function spin(
  targets: HTMLElement[],
  { trigger, duration = 20, offset = 0 }: {
    trigger: Element;
    duration?: number;
    offset?: number;
  },
) {
  if (!targets.length) return;
  return gsap.to(targets, {
    rotation: "+=360",
    duration,
    delay: offset,
    ease: "none",
    repeat: -1,
    scrollTrigger: whenSeen(trigger),
  });
}

/* ---------------------------------------------------------------- one-shot */

/** The transform an element eases out of as it enters view. */
export type SettleFrom = {
  y?: number;
  x?: number;
  rotation?: number;
  scale?: number;
};

/**
 * The source's one-shot entrance: 0.8s `power1.out`, fired once on the way in,
 * with no fade and no stagger. Semplice tweens *to* the element's authored
 * transform; this tweens *from* an equivalent offset so the element still comes
 * to rest exactly where the layout puts it. Same curve, same distance, same
 * one-shot — the design is just left alone at the end of it.
 *
 * Offsets in use on the source: rotation -5 / +9 / +32 / -111 deg, scale 0.7 /
 * 0.8. The short 0.3s variant is what it uses for the smallest pieces.
 */
export function settle(
  targets: HTMLElement[],
  from: SettleFrom,
  { trigger, duration = 0.8 }: { trigger: Element; duration?: number },
) {
  if (!targets.length) return;
  return gsap.from(targets, {
    ...from,
    duration,
    ease: "power1.out",
    scrollTrigger: {
      trigger,
      start: "top bottom",
      // The source's bare `toggleActions: "play"`, and deliberately not
      // `once` — `once` tears the trigger down the moment it fires, which on
      // an element that also drifts can leave the tween stranded at its start
      // value. Play-and-never-reverse gets there without the teardown.
      toggleActions: "play none none none",
    },
  });
}

/* ------------------------------------------------------------------ scroll */

/**
 * Scroll-linked travel: the element drifts the whole time it is crossing the
 * viewport, tied directly to the scrollbar with no smoothing.
 *
 *   start "top bottom", end "bottom top", scrub
 *
 * Distances in use on the source: y -7.2222rem (-130px), -4.3889rem (-79px),
 * +/-2.2222rem (+/-40px), and one rotation of 32deg. A handful of its elements
 * shorten the pass to `bottom top+=45%`, which `end` exposes.
 *
 * The travel is split around zero so the element sits at its authored position
 * at the midpoint of the pass — the layout stays put and only the approach and
 * the exit move.
 */
export function drift(
  targets: HTMLElement[],
  { trigger, y = 0, rotation = 0, end = "bottom top" }: {
    trigger: Element;
    y?: number;
    rotation?: number;
    end?: string;
  },
) {
  if (!targets.length || (!y && !rotation)) return;
  // Only the axes actually asked for: a scrubbed tween re-renders constantly,
  // so naming `rotation: 0` here would hold every target's rotation at zero and
  // quietly cancel any loop or settle that also wants it.
  const from = {
    ...(y ? { y: -y / 2 } : {}),
    ...(rotation ? { rotation: -rotation / 2 } : {}),
  };
  const to = {
    ...(y ? { y: y / 2 } : {}),
    ...(rotation ? { rotation: rotation / 2 } : {}),
  };
  return gsap.fromTo(targets, from, {
    ...to,
    ease: "none",
    scrollTrigger: { trigger, start: "top bottom", end, scrub: true },
  });
}

/**
 * The source's marquee: `direction: ltr` with `speed: 100` at every breakpoint,
 * which is content travelling leftwards at 100px a second, endlessly.
 *
 * Endless is a property of the row, not of the tween. The tween only ever
 * travels one copy's width and repeats, so what decides whether the loop reads
 * as seamless is whether there is still a copy covering the frame at the moment
 * it snaps back: the row is padded with clones until it spans its frame plus
 * the copy that has scrolled off, and one spare beyond that.
 *
 * Which means the measurement has to be right, and on first paint it is not.
 * These rows are set in Rotonto, and a row measured in the fallback face comes
 * out at the wrong width — wider, and too few clones are cut, which is exactly
 * the gap that breaks the seam once the real face swaps in and every copy
 * shrinks. So the row is built twice: once now, so it is never sitting still,
 * and again on `document.fonts.ready` against the widths it will keep.
 *
 * Off-screen the tween is parked — invisible, and not worth the frames.
 *
 * Returns a teardown, because there is now a pending promise to disown as well
 * as a tween and a trigger to kill.
 */
export function marquee(
  row: HTMLElement,
  { speed = 100, unscale = 1 }: { speed?: number; unscale?: number } = {},
) {
  /** The copies authored in the markup, as opposed to the ones cloned below —
   *  a rebuild has to strip its predecessor's clones and keep these. */
  const authored = Array.from(row.children);
  let tween: gsap.core.Tween | null = null;
  let trigger: ScrollTrigger | null = null;

  const build = () => {
    tween?.kill();
    trigger?.kill();
    tween = null;
    trigger = null;
    for (const child of Array.from(row.children)) {
      if (!authored.includes(child)) child.remove();
    }
    gsap.set(row, { x: 0 });

    const first = row.firstElementChild;
    if (!first) return;

    const width = (el: Element) => el.getBoundingClientRect().width * unscale;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const unit = width(first) + gap;
    if (!unit) return;

    const frame = row.closest("section, footer") ?? row.parentElement!;
    const needed = Math.ceil(width(frame) / unit) + 2;
    while (row.children.length < needed) {
      const copy = first.cloneNode(true) as HTMLElement;
      copy.setAttribute("aria-hidden", "true");
      copy.removeAttribute("data-node-id");
      for (const el of Array.from(copy.querySelectorAll("[data-node-id]"))) {
        el.removeAttribute("data-node-id");
      }
      row.appendChild(copy);
    }

    tween = gsap.to(row, {
      x: `-=${unit}`,
      duration: unit / speed,
      ease: "none",
      repeat: -1,
    });

    const running = tween;
    trigger = ScrollTrigger.create({
      trigger: frame,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? running.play() : running.pause()),
    });
  };

  build();

  let live = true;
  document.fonts?.ready.then(() => {
    if (live) build();
  });

  return () => {
    live = false;
    tween?.kill();
    trigger?.kill();
  };
}

/* -------------------------------------------------------------- this page's */

/**
 * Not a transcription — the reference site has no equivalent. Everything above
 * this line was read off the source; this was written for VinHack, because the
 * hero's commit sticker is a terminal command and a command is more convincing
 * typed than rocked.
 *
 * Types each message character by character, holds the finished line, clears it
 * in one frame and moves to the next, forever. The order is shuffled once per
 * page load, so the sticker does not read the same way twice, but every message
 * still gets its turn before any repeats.
 *
 * `steps()` rather than a smooth ease: a caret lands on whole characters, and
 * interpolating the index smoothly would type at a rate that visibly eases in
 * and out. Constant, one character at a time is what a keyboard does.
 *
 * The clear is the timeline's first act, not something done on the way in, so a
 * visitor whose ScrollTrigger never fires — landing already scrolled past the
 * hero — is left looking at the line the markup shipped rather than an empty
 * bubble.
 */
export function typewriter(
  line: HTMLElement,
  messages: readonly string[],
  {
    trigger,
    perChar = 0.055,
    hold = 1.6,
    gap = 0.35,
    ghost,
  }: {
    trigger: Element;
    /** Seconds a single character takes to appear. */
    perChar?: number;
    /** Seconds the finished line stays on screen. */
    hold?: number;
    /** Seconds of empty bubble between one message and the next. */
    gap?: number;
    /** Ghost element reserving text-only width for length-based centering. */
    ghost?: HTMLElement | null;
  },
) {
  if (!messages.length) return;

  const targetGhost =
    ghost ??
    line.parentElement?.parentElement?.querySelector<HTMLElement>(
      '[data-hero="commit-ghost"]',
    );

  const order = [...messages];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const tl = gsap
    .timeline({ repeat: -1, scrollTrigger: whenSeen(trigger) });

  for (const message of order) {
    const head = { chars: 0 };
    tl.call(() => {
      if (targetGhost) targetGhost.textContent = message;
      line.textContent = "";
    })
      .to(head, {
        chars: message.length,
        duration: message.length * perChar,
        ease: `steps(${message.length})`,
        onUpdate: () => {
          line.textContent = message.slice(0, Math.round(head.chars));
        },
      })
      .to({}, { duration: hold })
      .to(head, {
        chars: 0,
        duration: message.length * (perChar * 0.35),
        ease: `steps(${message.length})`,
        onUpdate: () => {
          line.textContent = message.slice(0, Math.round(head.chars));
        },
      })
      .to({}, { duration: gap });
  }

  return tl;
}

/* ----------------------------------------------------------------- entrance */


/**
 * A cold neon tube striking: the current catches, drops out, catches harder,
 * and finally holds.
 *
 * The rhythm is the point and it is deliberately uneven — a flicker on a metre
 * reads as an effect, and a real tube stutters at intervals that do not divide
 * into each other. `steps(1)` on every keyframe because a tube is lit or it is
 * not; easing between the levels would make it a dimmer.
 *
 * Returns a tween, so a caller can drop it onto a timeline at a position.
 */
export function neonStrike(target: HTMLElement, { duration = 0.72 } = {}) {
  // Fractions of the whole strike, so the shape survives a change of duration.
  const beats: [number, number][] = [
    [0.55, 0.07],
    [0.05, 0.1],
    [0.85, 0.06],
    [0.12, 0.13],
    [1, 0.07],
    [0.3, 0.08],
    [1, 0.49],
  ];
  return gsap.fromTo(
    target,
    { opacity: 0 },
    {
      keyframes: beats.map(([opacity, share]) => ({
        opacity,
        duration: share * duration,
        ease: "steps(1)",
      })),
    },
  );
}

/* ------------------------------------------------------------------- hover */

/**
 * Pointer response, at the source's hover timing: 0.3s `power1.out` in and out
 * alike. `overwrite: "auto"` so a hover landing mid-loop simply wins the
 * properties it touches.
 *
 * Returns its own teardown.
 */
export function hover(
  hit: Element,
  parts: HTMLElement[],
  over: gsap.TweenVars,
  out: gsap.TweenVars,
) {
  if (!parts.length) return () => {};
  const to = (vars: gsap.TweenVars) => () =>
    gsap.to(parts, { duration: 0.3, ease: "power1.out", overwrite: "auto", ...vars });
  const enter = to(over);
  const leave = to(out);
  hit.addEventListener("pointerenter", enter);
  hit.addEventListener("pointerleave", leave);
  return () => {
    hit.removeEventListener("pointerenter", enter);
    hit.removeEventListener("pointerleave", leave);
  };
}
