import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stampThud } from "@/components/motion/machine";
import { shareOrigin } from "@/components/motion/recipes";

gsap.registerPlugin(ScrollTrigger);

/**
 * A sticker arriving the way a rubber stamp arrives: from above, fast, and
 * hard enough that the paper answers.
 *
 * Not transcribed from anywhere — the reference site has no entrance below its
 * hero at all. It is here because the timeline's stickers are now things the
 * visitor can pick up and move, and a piece you are invited to handle should
 * arrive as an object rather than simply be present.
 *
 * The shape, and why each part of it is there:
 *
 *   the drop      `power3.in` off a large scale. Ease *in*, not out: a stamp
 *                 accelerates all the way down and stops dead, so the fast
 *                 part has to be the last part. An ease-out would read as the
 *                 sticker floating into place.
 *   the squash    one frame under full size, immediately after the hit. This
 *                 is the whole difference between a stamp and a zoom — it is
 *                 the pad compressing, and without it nothing was struck.
 *   the settle    `elastic.out`, brief and heavily damped. Rubber, not jelly.
 *
 * Rotation comes off the same keyframes: the stamp lands very slightly turned
 * and straightens as it settles, so no two of them hit flat.
 *
 * Property budget (see `PageMotion`): this spends `scale`, `rotation` and
 * `opacity`. Rotation is the one that matters — every idle loop on these
 * stickers wants it too, so the caller does not start the loop until
 * `onSettled` says the stamp is done rather than trying to overlap them.
 */

/** Roughly how long the whole thing takes, for callers scheduling after it. */
export const STAMP_DURATION = 0.83;

export function stampIn(
  boxes: HTMLElement[],
  {
    trigger,
    delay = 0,
    from = 2.6,
    tilt = -13,
    unscale = 1,
    start = "top 70%",
    onSettled,
  }: {
    trigger: Element;
    /** Seconds after the trigger position is reached, for dealing a row of
     *  them out. */
    delay?: number;
    /** Where in the pass it fires. Far enough in by default that the sticker
     *  is properly on screen when it lands — a stamp nobody saw hit is just a
     *  sticker that was already there. A caller pushes this later when the
     *  sticker has to wait for something else, such as the sheet it is being
     *  stamped onto arriving. */
    start?: string;
    /** The scale the stamp comes down from. */
    from?: number;
    /** Degrees it is turned by on the way down. */
    tilt?: number;
    /** Layout px per rendered px, for the shared transform origin. */
    unscale?: number;
    /** Called once the sticker has stopped moving — where the idle loop is
     *  started, since it wants the rotation this is still using. */
    onSettled?: () => void;
  },
) {
  if (!boxes.length) return;

  // Already gone by the time this runs — a refresh partway down the page. The
  // sticker is above the fold and nobody is going to see it land, and a
  // `fromTo` off `opacity: 0` would hide it the moment it was built and only
  // un-hide it on a scroll back up. Leave it stuck down, and let whatever was
  // waiting on the stamp get on with it. Same guard, same reason, as the one
  // in `motion/handwrite.ts`.
  if (trigger.getBoundingClientRect().bottom < 0) {
    onSettled?.();
    return;
  }

  // A group scales as one drawing — without this a group thrown down at 2.6x
  // comes apart on the way, the tape flying off one side of the label and the
  // print off the other. A single box is left on its own middle, which is
  // already where it should turn about.
  shareOrigin(boxes, unscale);

  const tl = gsap
    .timeline({ paused: true, delay })
    .fromTo(
      boxes,
      { scale: from, rotation: tilt, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.26, ease: "power3.in" },
    )
    .call(stampThud)
    .to(boxes, { scale: 0.9, duration: 0.07, ease: "power2.out" })
    .to(boxes, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" })
    .call(() => onSettled?.());

  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => tl.play(0),
  });

  return tl;
}
