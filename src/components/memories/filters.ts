/**
 * The treatments the photobooth puts on a face.
 *
 * This is the booth's own table rather than the pass's. `pass/variants.ts` has
 * five filters in it, but they are five *colourways* — each one is the look of
 * a printed pass, and the feed filter comes along with it rather than being the
 * thing chosen. Here the filter is the choice, and there are twelve of them and
 * no cards behind them; so the two tables live apart, and neither has to bend.
 *
 * Two kinds of treatment, because a CSS `filter` cannot do everything a bad
 * signal does:
 *
 *   css        a `filter` fragment. Cheap, exact, and the only kind that
 *              survives being handed to a canvas — `ctx.filter` takes the same
 *              string, so the saved PNG gets the treatment from the same
 *              characters the screen did.
 *   overlay    layers drawn *over* the picture: scanlines, chroma split, a
 *              tear sweeping down. A filter cannot add ink that was not in the
 *              frame, so these are painted rather than filtered — animated in
 *              CSS on screen, and drawn still onto the canvas when it saves.
 *
 * A treatment may be both. GLITCH is: it lifts the contrast with a filter and
 * then tears the result up with an overlay.
 *
 * One at a time. The tray is a row of alternatives, `STRAIGHT` among them, so
 * there is always something lit and always somewhere to land back on — which
 * is the state the unfiltered camera is, and the one you must be able to get
 * back to.
 */

export type FeedOverlay = "scan" | "chroma" | "tear";

export type Treatment = {
  id: string;
  /** What the chip says. Shouted, like every other label in the booth. */
  label: string;
  /** A CSS `filter` fragment, or nothing where the treatment is all overlay. */
  css?: string;
  overlay?: readonly FeedOverlay[];
};

/**
 * The scanline pitch, in card units — one dark line every `period`, `ink` of it
 * inked. It lives here rather than in the stylesheet because both renderers
 * need it: the card preview hands it to the overlay as a length inside the
 * card's own scaled box, and `paint.ts` steps the canvas by it. The booth is
 * the one place it is not in card units — the camera panel is not the card, and
 * a treatment being previewed there only has to look like itself.
 */
export const SCAN = { period: 6, ink: 2, booth: 4 } as const;

/** The one that is nothing, first in the row: the picture as the camera gave
 *  it. Carries no `css` and no overlay, so it needs no special case anywhere —
 *  it is simply the treatment that does not do anything. */
export const STRAIGHT = "straight";

export const TREATMENTS: readonly Treatment[] = [
  { id: STRAIGHT, label: "STRAIGHT" },
  { id: "mono", label: "MONO", css: "grayscale(1)" },
  { id: "noir", label: "NOIR", css: "contrast(1.5) brightness(0.92)" },
  { id: "vivid", label: "VIVID", css: "saturate(2.4)" },
  { id: "bloom", label: "BLOOM", css: "brightness(1.14) contrast(0.9)" },
  { id: "fade", label: "FADE", css: "contrast(0.8) brightness(1.1) sepia(0.25)" },
  { id: "sepia", label: "SEPIA", css: "sepia(0.85)" },
  { id: "heat", label: "HEAT", css: "hue-rotate(-32deg) saturate(1.7)" },
  { id: "frost", label: "FROST", css: "hue-rotate(150deg) saturate(1.35)" },
  { id: "invert", label: "INVERT", css: "invert(0.92)" },
  { id: "crt", label: "CRT", overlay: ["scan"] },
  {
    id: "glitch",
    label: "GLITCH",
    css: "contrast(1.12) saturate(1.35)",
    overlay: ["chroma", "tear"],
  },
] as const;

export const TREATMENT_BY_ID = new Map(TREATMENTS.map((t) => [t.id, t]));

/**
 * The chip's face. One fixed strip of the site's own palette, shown behind
 * every treatment in the tray with that treatment's filter over it — so a chip
 * is the treatment doing its job rather than a swatch somebody chose to stand
 * for it, and a treatment that only overlays reads as unchanged, which is the
 * truth about it.
 */
export const CHIP_ART =
  "conic-gradient(from 210deg at 40% 30%, #fa1a1d, #db9eef, #74d4f0, #bfea88, #fdbbff, #fa1a1d)";

/** The chosen treatment as one `filter` value. `none` rather than an empty
 *  string: it is what CSS and `ctx.filter` both read as "leave it alone". */
export function feedOf(id: string): string {
  return TREATMENT_BY_ID.get(id)?.css ?? "none";
}

/** The layers it asks for, or none. */
export function overlaysOf(id: string): readonly FeedOverlay[] {
  return TREATMENT_BY_ID.get(id)?.overlay ?? EMPTY;
}

/** One frozen empty list, so a treatment with no overlay hands back the same
 *  array every time and nothing downstream re-renders on its account. */
const EMPTY: readonly FeedOverlay[] = [];
