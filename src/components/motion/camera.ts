/**
 * The photobooth's two noises: the countdown's tick and the shutter's clack.
 *
 * Same construction as the keycap in `click.ts` — a filtered-noise transient
 * over a falling tone — because they are the same kind of event: a mechanism
 * answering a press. A camera is just a louder switch with a mirror in it.
 *
 * The shutter is two blades rather than one, so it is scheduled as a pair a few
 * milliseconds apart: the mirror going up, then the curtain closing. That gap
 * is the whole difference between "clack" and "click".
 *
 * Both check the mute switch first, and neither runs anywhere but from a real
 * gesture — the countdown's ticks are scheduled from the press that started it.
 */

import { audio, tone, transient } from "@/components/motion/audio";
import { isMuted } from "@/components/motion/sound";

/** One step of the countdown. `last` is the go-ahead beep on zero: higher and
 *  longer, so you know the frame is being taken rather than waited for. */
export function countTick(last = false) {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  const pitch = last ? 1320 : 760;
  tone(ac, {
    gain: 0.07,
    from: pitch,
    to: pitch,
    decay: last ? 0.16 : 0.05,
    type: "sine",
  });
}

/** The frame being taken: mirror, then curtain. */
export function shutterClack() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  transient(ac, { gain: 0.2, freq: 3200, q: 0.9, decay: 0.028 });
  tone(ac, { gain: 0.12, from: 240, to: 96, decay: 0.06 });
  transient(ac, { gain: 0.14, freq: 1900, q: 1.4, decay: 0.035, at: 0.055 });
  tone(ac, { gain: 0.08, from: 180, to: 70, decay: 0.07, at: 0.055 });
}
