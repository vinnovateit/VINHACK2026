/**
 * Whether the page is allowed to make a noise.
 *
 * There is one thing on the site that makes a sound — the keycap in the hero,
 * synthesized in `click.ts` — and one control that governs it, the speaker
 * sticker beside the lede. This module is the single fact they share, so the
 * switch does not have to know what a bandpass filter is and the click does not
 * have to know where the switch is drawn.
 *
 * Three things it deliberately does:
 *
 *   - It defaults to *unmuted*, which is the behaviour the site already had.
 *     Nothing here plays on its own; the only sound is the answer to a press
 *     the visitor made, so silence-by-default would be muting a sound they
 *     asked for.
 *   - It remembers the choice in `localStorage`, because a visitor who muted
 *     the page once has said something about every visit, not just this one.
 *   - It survives the storage being unavailable — Safari's private mode throws
 *     on `localStorage` rather than returning null, and a page that cannot
 *     remember a preference must still honour it for the session.
 */

const KEY = "vinhack:muted";

let muted = false;
let restored = false;

const listeners = new Set<(muted: boolean) => void>();

/**
 * Reads the stored choice, once, on first use in the browser.
 *
 * Deliberately lazy rather than done at module scope: this module is imported
 * into the server render too, where there is no `localStorage` at all, and the
 * markup must ship the default state so the server and the client agree on
 * their first frame. The stored preference is applied after mount, by whoever
 * called in.
 */
function restore() {
  if (restored || typeof window === "undefined") return;
  restored = true;
  try {
    muted = window.localStorage.getItem(KEY) === "1";
  } catch {
    // No storage (private mode, storage disabled). The default stands.
  }
}

/** Whether sound is currently suppressed. */
export function isMuted(): boolean {
  restore();
  return muted;
}

/** Sets the state and tells everyone drawing it. A no-op if nothing changes,
 *  so a redundant call cannot restart the switch's animation. */
export function setMuted(next: boolean): void {
  restore();
  if (next === muted) return;
  muted = next;
  try {
    window.localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    // Remembered for this page view only, which is better than throwing.
  }
  for (const listener of listeners) listener(muted);
}

/** Flips the state, and returns what it became. */
export function toggleMuted(): boolean {
  setMuted(!isMuted());
  return muted;
}

/** Subscribes to changes. Returns its own teardown, in the shape `HeroMotion`
 *  collects cleanups in. */
export function onMuteChange(listener: (muted: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
