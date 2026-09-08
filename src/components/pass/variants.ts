/**
 * The colourways the attendee pass cycles through, and the filter each one puts
 * on the live camera feed.
 *
 * These are not in `content/site.ts` because they are not words — they are a
 * mechanism. What is in site.ts is the pass's copy; what is here is the five
 * ways that copy can be printed.
 *
 * Every colour is off the design's own palette. `ink` and `stub` are the two
 * that have to move with the card: `ink` is the pass's own lettering (the
 * title, the Type / Duration labels, the barcode caption) and `stub` is the
 * VINHACK 2026 line inside the torn ticket, which the design sets in the card's
 * colour on the cyan pass and in a contrasting pink on the purple one. Both are
 * read out of CSS custom properties by `sections/About.tsx` and
 * `mobile/MobileSite.tsx`, so the markup names a role rather than a colour and
 * only this table knows the hexes.
 *
 * The first two entries are the two passes the design actually draws, in the
 * order it draws them — the cyan front one and the purple one behind it. That
 * is load-bearing: each pass starts on its own index, so the first paint is the
 * collage exactly as designed and the cycling only starts once someone clicks.
 *
 * The feed filter is what makes the cycle worth having on the front pass, which
 * is the one with the webcam in it. Index 0 is deliberately `none` — the
 * unfiltered camera is a state you must be able to get back to.
 *
 * `treatment` names what each filter does rather than what colour the card is,
 * which is the one thing about a colourway that is worth saying out loud
 * anywhere the pass itself is not on screen.
 *
 * The photobooth at `/memories` does not use this table. It stacks several
 * filters at once and none of them is a colourway, so it keeps its own — see
 * `memories/filters.ts`, which says why the two are apart.
 */
export type PassVariant = {
  /** For `aria-live`, so a keyboard user is told what they landed on. */
  name: string;
  bg: string;
  ink: string;
  stub: string;
  /** A CSS `filter` value, applied to the camera panel. */
  feed: string;
  /** What that filter does, for the booth's picker. */
  treatment: string;
};

export const PASS_VARIANTS: readonly PassVariant[] = [
  {
    name: "Cyan",
    bg: "#74d4f0",
    ink: "#2849cb",
    stub: "#74d4f0",
    feed: "none",
    treatment: "STRAIGHT",
  },
  {
    name: "Purple",
    bg: "#9b83f0",
    ink: "#fdbbff",
    stub: "#db9eef",
    feed: "grayscale(1)",
    treatment: "MONO",
  },
  {
    name: "Green",
    bg: "#bfea88",
    ink: "#1c563c",
    stub: "#bfea88",
    feed: "saturate(2.4)",
    treatment: "VIVID",
  },
  {
    name: "Pink",
    bg: "#db9eef",
    ink: "#fa1a1d",
    stub: "#db9eef",
    feed: "sepia(0.85)",
    treatment: "SEPIA",
  },
  {
    name: "Red",
    bg: "#fa1a1d",
    ink: "#fcfcfc",
    stub: "#fa1a1d",
    feed: "invert(0.92)",
    treatment: "INVERT",
  },
] as const;

/** Where each drawn pass starts, by the name the layouts know it as. */
export const PASS_START = { front: 0, behind: 1 } as const;
