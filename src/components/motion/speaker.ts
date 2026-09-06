import gsap from "gsap";

import { isMuted, onMuteChange, toggleMuted } from "@/components/motion/sound";

/**
 * The speaker sticker, wired as the page's sound switch.
 *
 * Lifted out of `HeroMotion` when the phone's hero gained the same sticker:
 * both layouts draw `hero/SpeakerArt`, and a switch drawn twice must not be
 * two different switches. One wiring, whichever tree it is handed.
 *
 * Everything about the state is drawn, because a switch you have to press to
 * find out the state of is not a switch:
 *
 *   the horn   purple when live, flat when muted
 *   the arcs   present and leaving the horn when live, gone when muted
 *   the cross  struck through where the arcs were when muted, retracted when
 *              not — and it is drawn *on*, one stroke then the other, in the
 *              order and direction a hand would cross something out, rather
 *              than appearing
 *   aria       role="switch" with aria-checked, for anything not looking
 *
 * There was a caption under the horn as well, reading "SOUND ON" or "MUTED". It
 * has been taken off: the drawing already answers the question, and a sticker on
 * a collage that has to label itself is a sticker that is not drawing its state
 * clearly enough. `aria-label` and `aria-checked` still say it for anything that
 * is not looking.
 *
 * The two arcs pulse inner-then-outer rather than together, which is the
 * difference between a signal leaving the horn and two shapes blinking. They
 * pulse on their own boxes and the wrapper carries the on/off fade, so the loop
 * and the switch never contend for one opacity.
 *
 * `animated` is false under reduced motion: the sticker still says everything it
 * says, it just says it without the pulse and without easing between the two
 * states.
 */

/** The horn's colour with the sound off. Off the design's own purple rather
 *  than a neutral grey — a piece of this collage that has gone flat still has to
 *  belong to it. */
const MUTED_INK = "#6b6470";

/** Long enough that each stroke of the cross reaches both ends of its drawn
 *  path, whatever a browser measures it at. A dash longer than the path simply
 *  runs off it. */
const CROSS_LENGTH = 60;

export function wireSpeaker(speaker: HTMLElement, animated: boolean): () => void {
  const part = (name: string) =>
    speaker.querySelector<HTMLElement>(`[data-speaker="${name}"]`);
  const cone = part("cone");
  const waves = part("waves");
  const cross = Array.from(
    speaker.querySelectorAll<SVGPathElement>('[data-speaker="cross"] path'),
  );
  const arcs = Array.from(
    speaker.querySelectorAll<HTMLElement>('[data-speaker="wave"]'),
  );

  // Built paused. It is started and stopped by `paint`, so the arcs are only
  // ever moving when there is a sound for them to be describing.
  let pulse: gsap.core.Timeline | null = null;
  if (animated && arcs.length) {
    pulse = gsap.timeline({ repeat: -1, paused: true });
    arcs.forEach((arc, i) => {
      // Each arc swells out of the horn and falls back; the outer one starts a
      // beat after the inner, which is what makes the pair read as one thing
      // travelling rather than two things flashing.
      pulse!
        .fromTo(
          arc,
          { opacity: 0.32, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "sine.out" },
          i * 0.18,
        )
        .to(
          arc,
          { opacity: 0.32, scale: 0.9, duration: 0.6, ease: "sine.in" },
          i * 0.18 + 0.6,
        );
    });
    // A held beat at the end, so the pair breathes rather than throbbing.
    pulse.to({}, { duration: 0.3 }, 1.5);
  }

  /** Draws a state. `instant` is for the very first paint, which is restoring a
   *  remembered preference rather than answering a press — animating that would
   *  look like the page muting itself on arrival. */
  const paint = (muted: boolean, instant: boolean) => {
    const duration = instant ? 0 : 0.32;
    speaker.setAttribute("aria-checked", muted ? "false" : "true");
    if (cone) {
      gsap.to(cone, {
        backgroundColor: muted ? MUTED_INK : "#db9eef",
        duration,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (waves) {
      gsap.to(waves, {
        opacity: muted ? 0 : 1,
        duration,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (cross.length) {
      gsap.to(cross, {
        strokeDashoffset: muted ? 0 : CROSS_LENGTH,
        // Drawn deliberately, retracted quickly: the muting is the statement,
        // the unmuting is just getting out of the way. The stagger is what makes
        // it read as a cross rather than an X — two strokes, one after the
        // other, the way one is drawn.
        duration: instant ? 0 : muted ? 0.26 : 0.16,
        stagger: instant ? 0 : muted ? 0.09 : 0.05,
        ease: muted ? "power2.out" : "power2.in",
        overwrite: "auto",
      });
    }
    if (pulse) {
      if (muted) pulse.pause();
      else pulse.play();
    }
  };

  // The switch does not paint itself — it flips the shared state, and the
  // subscription below paints. One path to the drawing, so a change made
  // anywhere lands the same way, including from the other layout's copy of the
  // sticker if both are ever alive at once.
  const flip = () => {
    toggleMuted();
  };
  const onKey = (event: Event) => {
    const key = (event as KeyboardEvent).key;
    if (key !== "Enter" && key !== " ") return;
    event.preventDefault();
    flip();
  };
  speaker.addEventListener("click", flip);
  speaker.addEventListener("keydown", onKey);
  const unsubscribe = onMuteChange((muted) => paint(muted, false));

  paint(isMuted(), true);

  return () => {
    speaker.removeEventListener("click", flip);
    speaker.removeEventListener("keydown", onKey);
    unsubscribe();
    pulse?.kill();
  };
}
