/**
 * The keycap's click, synthesized rather than sampled.
 *
 * A mechanical switch is two sounds stacked: a bright, very short transient as
 * the stem releases — that is filtered noise — and a duller thump as the cap
 * bottoms out against the plate, which is a low tone falling in pitch as it
 * decays. Building it out of those two parts costs nothing to ship, tunes by
 * editing numbers, and cannot 404 the way an audio file can.
 *
 * Both parts now live in `audio.ts`, because the camera's shutter is made of
 * the same two things. What is left here is the tuning that makes them a
 * keyboard.
 *
 * Down and up are deliberately different: the press is lower and louder than
 * the release, which is what makes a real keyboard sound like two events rather
 * than the same click twice.
 *
 * Everything is created on first use and only from inside a real pointer or key
 * event, which is what browsers require before audio may start. Both entry
 * points check `sound.ts` first and return before touching Web Audio at all.
 */

import { audio, tone, transient } from "@/components/motion/audio";
import { isMuted } from "@/components/motion/sound";

/** The press. Full-bodied: bright transient over a low thump. */
export function keyDown() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  transient(ac, { gain: 0.22, freq: 2600, q: 1.1, decay: 0.035 });
  tone(ac, { gain: 0.16, from: 190, to: 78, decay: 0.075 });
}

/** The release. Thinner, quieter, higher — the stem coming back up. */
export function keyUp() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  transient(ac, { gain: 0.11, freq: 4200, q: 1.6, decay: 0.022 });
  tone(ac, { gain: 0.05, from: 320, to: 180, decay: 0.03 });
}
