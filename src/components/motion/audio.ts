/**
 * The shared Web Audio plumbing, and the two voices everything on the site is
 * built out of.
 *
 * This was the private half of `click.ts` until the camera on `/memories` grew
 * a countdown and a shutter. Both sounds are the same two ingredients as the
 * keycap — filtered noise for the transient, a falling tone for the body — so
 * the parts moved here rather than being written a second time.
 *
 * Nothing in this file checks the mute switch. That is deliberate: the callers
 * are the ones that know whether they are answering a gesture, and every one of
 * them returns on `isMuted()` *before* getting here, so a visitor who arrives
 * muted never has an AudioContext created on their behalf.
 */

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

/** The shared context, resumed if the browser parked it. Null where Web Audio
 *  is unavailable — every caller is a no-op in that case rather than a thrown
 *  error, because a missing sound must not break the control that made it. */
export function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    if (context && context.state === "suspended") void context.resume();
  };
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
  window.addEventListener("wheel", unlock, { capture: true, passive: true });
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });
}

/** 50ms of white noise, generated once and re-triggered for every hit. */
function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (!noise) {
    const frames = Math.floor(ac.sampleRate * 0.05);
    noise = ac.createBuffer(1, frames, ac.sampleRate);
    const channel = noise.getChannelData(0);
    for (let i = 0; i < frames; i++) channel[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** Noise through a narrow band, gone in a few tens of ms — a stem releasing,
 *  or a shutter blade. `at` is an offset from now, for scheduling a pair. */
export function transient(
  ac: AudioContext,
  {
    gain,
    freq,
    q,
    decay,
    at = 0,
  }: { gain: number; freq: number; q: number; decay: number; at?: number },
) {
  const source = ac.createBufferSource();
  source.buffer = noiseBuffer(ac);

  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = q;

  const level = ac.createGain();
  const t = ac.currentTime + at;
  // Exponential ramps cannot reach zero, so they land just under audibility.
  level.gain.setValueAtTime(gain, t);
  level.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  source.connect(band).connect(level).connect(ac.destination);
  source.start(t);
  source.stop(t + decay + 0.02);
}

/** A short tone sliding in pitch as it fades: a cap bottoming out, or a beep
 *  when `from` and `to` are the same. */
export function tone(
  ac: AudioContext,
  {
    gain,
    from,
    to,
    decay,
    at = 0,
    type = "triangle",
  }: {
    gain: number;
    from: number;
    to: number;
    decay: number;
    at?: number;
    type?: OscillatorType;
  },
) {
  const osc = ac.createOscillator();
  osc.type = type;

  const level = ac.createGain();
  const t = ac.currentTime + at;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + decay);
  level.gain.setValueAtTime(gain, t);
  level.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  osc.connect(level).connect(ac.destination);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}
