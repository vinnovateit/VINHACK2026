/**
 * The sound a newspaper makes.
 *
 * Same two ingredients as the keycap in `click.ts` and the shutter in
 * `camera.ts` — filtered noise for the transient, a falling tone for the body —
 * because a sheet of newsprint opening is the same kind of event: a mechanism
 * moving once and stopping.
 *
 * The one thing paper does that a keycap does not is *last*. A rustle is not a
 * hit, it is several dozen small hits smeared over half a second as the fibres
 * let go of each other. So rather than one long burst, both voices here are a
 * scheduled scatter of short ones with the band walking downward — bright and
 * papery at the top of the movement, duller and woodier as the sheet settles.
 * That also sidesteps a limit in `audio.ts`: its noise buffer is 50ms long, so
 * a `decay` past that plays into silence. Every burst below stays under it.
 *
 * Like every other sound on the site this checks `isMuted()` before it touches
 * an AudioContext, so a visitor who arrived muted never has one built for them.
 */

import { audio, tone, transient } from "@/components/motion/audio";
import { isMuted } from "@/components/motion/sound";

/**
 * The floor between two rustles, in seconds.
 *
 * Both callers are scroll-driven, and a scrubbed ScrollTrigger will happily
 * cross the same threshold a dozen times while a trackpad settles. The callers
 * latch as well, but a latch is per-element and this is per-ear: two cards
 * turning in the same frame should not double the volume.
 */
const GAP = 0.35;

let last = 0;

/** True if enough quiet has passed to make another noise. */
function ready(): boolean {
  const now = typeof performance !== "undefined" ? performance.now() / 1000 : 0;
  if (now - last < GAP) return false;
  last = now;
  return true;
}

/**
 * One burst of the scatter: noise through a narrow band, gone in ~30ms.
 * `spread` jitters the centre frequency so no two openings are quite the same
 * sheet — real paper never rustles the same way twice.
 */
function rustle(
  ac: AudioContext,
  { gain, freq, at, spread = 0.25 }: { gain: number; freq: number; at: number; spread?: number },
) {
  transient(ac, {
    gain,
    freq: freq * (1 + (Math.random() * 2 - 1) * spread),
    q: 0.7 + Math.random() * 0.8,
    decay: 0.022 + Math.random() * 0.016,
    at,
  });
}

/**
 * The desktop spread: the folded sheet splitting and both panels swinging out.
 *
 * Three movements, and they are the three things you hear when someone opens a
 * broadsheet across a table — the crease cracking, the long sweep of the panels
 * travelling, and the low slap as the paper flattens out.
 */
export function paperUnfold(): void {
  if (isMuted() || !ready()) return;
  const ac = audio();
  if (!ac) return;

  // 1. The crease letting go. Bright, immediate, a single snap.
  rustle(ac, { gain: 0.16, freq: 4200, at: 0 });
  rustle(ac, { gain: 0.11, freq: 3100, at: 0.018 });

  // 2. The sweep. Fourteen bursts over ~0.42s, the band walking 3200Hz down to
  //    850Hz and the level tapering, so the movement reads as going away from
  //    you rather than just stopping.
  const BURSTS = 14;
  for (let i = 0; i < BURSTS; i++) {
    const t = i / (BURSTS - 1);
    rustle(ac, {
      gain: 0.085 * (1 - t * 0.62),
      freq: 3200 * Math.pow(850 / 3200, t),
      // Uneven spacing — evenly spaced bursts turn into a buzz at a pitch of
      // their own, which is a machine, not a sheet of paper.
      at: 0.05 + t * 0.42 + Math.random() * 0.02,
    });
  }

  // 3. The paper flattening. The only pitched thing in here, and the reason the
  //    movement has an end rather than a fade.
  tone(ac, { gain: 0.075, from: 150, to: 58, decay: 0.11, at: 0.44 });
  rustle(ac, { gain: 0.05, freq: 700, at: 0.45, spread: 0.15 });
}

/**
 * The phone's version: one card of the deck turning.
 *
 * Shorter, quieter and higher than `paperUnfold` — a single page turning over,
 * not a whole sheet opening — because this fires four or five times on the way
 * through the deck and the full rustle at that rate would be a nuisance.
 *
 * Worth knowing: browsers will not start an AudioContext until the visitor has
 * tapped something, so the first card or two are silent for a reader who has
 * only ever scrolled. That is the platform's rule, and `audio.ts` already
 * resumes the context on the first `pointerdown`, so it corrects itself.
 */
export function paperTurn(): void {
  if (isMuted() || !ready()) return;
  const ac = audio();
  if (!ac) return;

  rustle(ac, { gain: 0.075, freq: 3600, at: 0 });
  const BURSTS = 6;
  for (let i = 0; i < BURSTS; i++) {
    const t = i / (BURSTS - 1);
    rustle(ac, {
      gain: 0.045 * (1 - t * 0.55),
      freq: 2800 * Math.pow(1100 / 2800, t),
      at: 0.02 + t * 0.17 + Math.random() * 0.015,
    });
  }
  tone(ac, { gain: 0.035, from: 190, to: 86, decay: 0.06, at: 0.19 });
}
