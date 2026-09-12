/**
 * Sound effects for the Recap section, matching the site's Web Audio synthesis design language.
 *
 * Built using the same filtered-noise transients and falling tones as `click.ts`, `camera.ts`,
 * and `machine.ts`. Zero external audio files, zero latency, zero 404 risk, strictly respecting
 * the site's master mute switch (`isMuted`).
 */

import { audio, tone, transient } from "@/components/motion/audio";
import { isMuted } from "@/components/motion/sound";
import { stampThud } from "@/components/motion/machine";
import { shutterClack } from "@/components/motion/camera";

/**
 * 35mm film spool rollout sound: sprocket teeth clicking past the canister velvet seal.
 * A gentle mechanical cascade that decrescendoes as the film strip extends.
 */
export function playFilmRollout() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;

  const count = 16;
  const duration = 1.5; // seconds
  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const timeOffset = Math.pow(progress, 1.2) * duration;
    const wobble = 0.94 + Math.random() * 0.12;

    // Delicate sprocket hole click
    transient(ac, {
      gain: 0.06 * (1 - progress * 0.45),
      freq: 2750 * wobble,
      q: 2.4,
      decay: 0.016,
      at: timeOffset,
    });

    // Subtle canister body resonance
    if (i % 3 === 0) {
      tone(ac, {
        gain: 0.022,
        from: 145 * wobble,
        to: 90,
        decay: 0.035,
        at: timeOffset,
        type: "triangle",
      });
    }
  }
}

/**
 * 35mm film rewind sound: faster, smooth winding ratchet back into canister.
 */
export function playFilmRewind() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;

  const count = 13;
  const duration = 0.95; // seconds
  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const timeOffset = progress * duration;
    const wobble = 1.06 + Math.random() * 0.12;

    transient(ac, {
      gain: 0.048,
      freq: 3300 * wobble,
      q: 2.5,
      decay: 0.013,
      at: timeOffset,
    });
  }
}

/**
 * Rubber stamp slam sound (wooden handle hit onto paper).
 */
export function playStampSlam() {
  stampThud();
}

/**
 * Camera photo frame click (mirror up then shutter curtain).
 */
export function playPhotoClick() {
  shutterClack();
}

/**
 * Cheerful retro electronic chime for the LED Pixel Smiley.
 */
export function playSmileyChirp() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;

  tone(ac, { gain: 0.05, from: 523.25, to: 659.25, decay: 0.06, at: 0, type: "sine" });
  tone(ac, { gain: 0.06, from: 659.25, to: 783.99, decay: 0.08, at: 0.05, type: "sine" });
  tone(ac, { gain: 0.07, from: 783.99, to: 1046.5, decay: 0.12, at: 0.1, type: "sine" });
}

/**
 * Crisp latch click when counter reaches 300+ or circles complete.
 */
export function playLatchClick() {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;

  transient(ac, { gain: 0.09, freq: 3600, q: 2.1, decay: 0.02 });
  tone(ac, { gain: 0.05, from: 220, to: 110, decay: 0.035 });
}
