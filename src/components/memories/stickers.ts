import { measurer, wrapLines } from "@/components/memories/card";
import { TIMELINE, TRACKS } from "@/content/site";

/**
 * The tray, drawn entirely from artwork the site already ships. Nothing here is
 * new: every piece is lifted from the collage, at the aspect ratio the design
 * gives it, so a saved card is recognisably made of this site.
 *
 * Three kinds of piece, and the awkward one is the middle:
 *
 *   plain      an SVG or a cut-out PNG, drawn as it is
 *   cropped    a photographed pin badge, which arrives on a white sheet. The
 *              collage hides that behind `object-cover` inside a box; on a
 *              black card there is nowhere to hide it, so the badge is cropped
 *              to a square and clipped to a circle, which takes the paper off
 *              and leaves the badge.
 *   badge      artwork with the design's own lettering set over it — the
 *              timeline and tracks stickers are a drawn shape plus type, and
 *              without the type they are a blank blob.
 *
 * `image235.png` is deliberately absent. It is the BUILD / LEARN / INNOVATE
 * badge, and it is photographed at an angle with a second badge in frame, so
 * neither a square crop nor a circle gets it off its white sheet.
 *
 * Every fraction on a badge is a fraction of the sticker's own drawn width, so
 * the lettering scales with the piece however far the viewer resizes it.
 */

export type StickerBadge = {
  /** Paragraphs. Each is wrapped to `width` at draw time, so this stays the
   *  copy in `content/site.ts` rather than a second set of line breaks. */
  lines: readonly string[];
  color: string;
  /** Type size, column width and tracking, as fractions of the drawn width. */
  size: number;
  width: number;
  tracking?: number;
  lineHeight: number;
  /** Centre of the text block, as a fraction of the sticker box. */
  cx: number;
  cy: number;
  /** Degrees the lettering sits at within the sticker. */
  rotate: number;
};

export type Sticker = {
  id: string;
  /** What it is called in the tray, and to a screen reader. */
  label: string;
  src: string;
  /** Natural pixels. Only the ratio is used. */
  w: number;
  h: number;
  /** Drawn width in card units before the viewer resizes it. */
  base: number;
  /** Square region of the source to use, in natural pixels. */
  crop?: { x: number; y: number; w: number; h: number };
  /** Clip the drawn piece to a circle. Goes with `crop`. */
  round?: boolean;
  badge?: StickerBadge;
};

export const STICKERS: readonly Sticker[] = [
  {
    id: "curious",
    label: "Be curious",
    src: "/figma/sticker.svg",
    w: 167.49,
    h: 136.082,
    base: 300,
    badge: {
      lines: TIMELINE.sticker,
      color: "#db9eef",
      size: 0.088,
      width: 0.671,
      tracking: 0.0176,
      lineHeight: 1.09,
      cx: 0.5,
      cy: 0.52,
      rotate: 8,
    },
  },
  {
    id: "impact",
    label: "Innovate for impact",
    src: "/figma/union6.svg",
    w: 270.425,
    h: 211.237,
    base: 330,
    badge: {
      lines: [TRACKS.sticker],
      color: "#2849cb",
      size: 0.092,
      width: 0.66,
      lineHeight: 1.15,
      cx: 0.5,
      cy: 0.5,
      rotate: -8.3,
    },
  },
  {
    id: "hello",
    label: "Vinhack 2026",
    src: "/figma/image205.png",
    w: 4096,
    h: 1617,
    base: 400,
  },
  {
    id: "doodle",
    label: "Doodled badge",
    src: "/figma/image227-vectorized.svg",
    w: 133.971,
    h: 127.496,
    base: 210,
  },
  {
    id: "heart",
    label: "Pixel heart badge",
    src: "/figma/image234.png",
    w: 258,
    h: 252,
    base: 175,
    crop: { x: 6, y: 3, w: 246, h: 246 },
    round: true,
  },
  {
    id: "repeat",
    label: "Code. Collab. Create. Repeat.",
    src: "/figma/image236.png",
    w: 297,
    h: 320,
    base: 185,
    crop: { x: 9, y: 18, w: 280, h: 280 },
    round: true,
  },
  { id: "star", label: "Star", src: "/figma/star2.svg", w: 40.2117, h: 44.5, base: 92 },
  { id: "pin", label: "Pin", src: "/figma/pin.svg", w: 58.5428, h: 75.4121, base: 94 },
  {
    id: "pushpin",
    label: "Push pin",
    src: "/figma/pin1.svg",
    w: 77.5466,
    h: 143.199,
    base: 104,
  },
];

export const BY_ID = new Map(STICKERS.map((sticker) => [sticker.id, sticker]));

/** The sticker's drawn box, in card units, at scale 1. A cropped piece is
 *  square by construction; everything else keeps its artwork's ratio. */
export function boxOf(sticker: Sticker) {
  const w = sticker.base;
  const ratio = sticker.crop ? sticker.crop.h / sticker.crop.w : sticker.h / sticker.w;
  return { w, h: w * ratio };
}

/**
 * A badge's lettering, broken into lines for a piece drawn `drawn` card units
 * wide — the same shared-breaking rule the message uses, for the same reason:
 * the preview and the canvas must agree, and the only way they do is if neither
 * decides on its own.
 *
 * Falls back to the unbroken copy where there is no canvas to measure with,
 * which is server rendering. The studio is a client component and re-measures
 * on mount, so that fallback is never what gets drawn.
 */
export function badgeLines(badge: StickerBadge, drawn: number): string[] {
  const ctx = measurer();
  if (!ctx) return [...badge.lines];
  return badge.lines.flatMap((line) =>
    wrapLines(
      ctx,
      line,
      badge.size * drawn,
      badge.width * drawn,
      (badge.tracking ?? 0) * drawn,
    ),
  );
}
