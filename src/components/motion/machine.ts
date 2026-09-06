/**
 * The two machines on the page, synthesized: the timeline's receipt printer,
 * and the rubber stamp the section's stickers land like.
 *
 * Same construction as `click.ts` and `camera.ts` — a filtered-noise transient
 * over a falling tone, out of `audio.ts` — for the same reason: these are
 * mechanisms, and a mechanism is a transient plus a body. What is here is only
 * the tuning that makes one a stepper motor and the other a wooden handle
 * hitting paper.
 *
 * One thing is different from the keycap and the shutter, and it is worth being
 * plain about. Those two only ever run from a press. These run from a scroll —
 * the receipt prints itself when it comes into view, and the stickers stamp
 * themselves in — and a browser will not start audio before the visitor has
 * interacted with the page at all. So the first print a visitor scrolls to may
 * be silent, and the same print after they have clicked anything will not be.
 * That is the browser's rule and the right one; nothing here tries to get round
 * it, and `audio()` returning a suspended context is simply a quiet tick.
 */

import { audio, tone, transient } from "@/components/motion/audio";
import { isMuted } from "@/components/motion/sound";

/**
 * One line feed: the platen stepping the paper on by a line.
 *
 * Very quiet and very short, because this fires two dozen times in under two
 * seconds and anything with a tail turns the run into a buzz. The pitch is
 * jittered a few per cent each time — a stepper is not a metronome, and
 * identical ticks at a fixed rate read as a synthesizer rather than a motor.
 */
export function feedTick() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  const wobble = 0.94 + Math.random() * 0.12;
  transient(ac, { gain: 0.045, freq: 1850 * wobble, q: 2.4, decay: 0.016 });
  tone(ac, { gain: 0.022, from: 168 * wobble, to: 120, decay: 0.022 });
}

/**
 * The tear: the strip pulled across the serrated edge.
 *
 * A rip is broadband and *long* next to a tick — a few tens of milliseconds of
 * wide noise rather than a narrow band — so the filter opens right up and the
 * decay runs ten times a feed tick's. The low tone under it is the machine's
 * body flexing as the paper is pulled against it.
 */
export function tearRip() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  transient(ac, { gain: 0.13, freq: 3400, q: 0.35, decay: 0.14 });
  transient(ac, { gain: 0.07, freq: 6200, q: 0.5, decay: 0.09, at: 0.02 });
  tone(ac, { gain: 0.05, from: 210, to: 84, decay: 0.13 });
}

/**
 * A whole print, scheduled up front: `steps` feeds over `duration`, then the
 * tear.
 *
 * The collage does not use this — its printer is a GSAP timeline that can be
 * killed and rebuilt halfway through by the day switch, and audio already
 * scheduled cannot be called back, so there the ticks are fired one at a time
 * off the step the animation is actually on. The phone's printer is a CSS
 * animation with no such handle: it is started and it runs, so the sound is
 * laid out to match it in one go.
 */
export function printRun({
  steps,
  duration,
}: {
  steps: number;
  duration: number;
}) {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  const gap = duration / steps;
  for (let i = 0; i < steps; i++) {
    const wobble = 0.94 + Math.random() * 0.12;
    transient(ac, {
      gain: 0.045,
      freq: 1850 * wobble,
      q: 2.4,
      decay: 0.016,
      at: i * gap,
    });
    tone(ac, { gain: 0.022, from: 168 * wobble, to: 120, decay: 0.022, at: i * gap });
  }
  transient(ac, { gain: 0.13, freq: 3400, q: 0.35, decay: 0.14, at: duration });
  transient(ac, { gain: 0.07, freq: 6200, q: 0.5, decay: 0.09, at: duration + 0.02 });
  tone(ac, { gain: 0.05, from: 210, to: 84, decay: 0.13, at: duration });
}

/**
 * A sticker being stamped down: the hit, then the board under it.
 *
 * Lower and blunter than the keycap's click. A stamp is a wooden handle driven
 * onto a soft pad, so there is very little high end in the transient and most
 * of the sound is a short low thump that dies almost at once.
 */
export function stampThud() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  transient(ac, { gain: 0.14, freq: 900, q: 0.7, decay: 0.03 });
  tone(ac, { gain: 0.14, from: 150, to: 58, decay: 0.1 });
}
