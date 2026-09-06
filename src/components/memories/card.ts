/**
 * The memory card's layout, in card units, and the type measuring that both
 * things which draw it depend on.
 *
 * The card is drawn twice — once as DOM for the studio to edit and once onto a
 * canvas for the file that gets saved — and the only way two rasterisers agree
 * is if neither owns the numbers. So a card unit is one pixel of the exported
 * image: the canvas draws at 1:1 and the preview lays the same figures out
 * inside a box it has scaled down with a transform. Nothing in either renderer
 * measures the other, and nothing is written twice.
 *
 * Line breaking is the part that has to be shared rather than merely matched.
 * The preview cannot wrap the text itself — the browser would break it at the
 * preview's own width and the canvas would break it somewhere else — so the
 * lines are decided once here, with `measureText`, and both renderers are
 * handed the finished array.
 *
 * That sharing is now load-bearing for a second reason: the word VinHack is not
 * set in type on this card, it is drawn as the logo. A line is therefore a run
 * of words *and marks*, and where each of them sits along the line is decided
 * here too — as an offset from the line's own left edge — so the canvas and the
 * DOM place them from the same numbers rather than each doing its own version
 * of "centre this".
 *
 * The card itself is a polaroid: a photo window with a strip of card under it.
 * The message starts in that strip and can be dragged anywhere from there, so
 * the geometry below is a starting position rather than a slot.
 */

export type Aspect = "square" | "story";

/** 1080 wide either way, because that is what both aspect ratios are posted
 *  at, and it makes a card unit the same size in both. */
export const CARD: Record<Aspect, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
};

/** The hero's ground and its ink. The frame is the ground: there is no rule
 *  around the photo, so the black simply stops where the picture starts. */
export const GROUND = "#000000";
export const HEADLINE = "#bfea88";

export const FACE = "Rotonto, sans-serif";

/**
 * The photo window — where the captured frame sits, in card units.
 *
 * Landscape on the square card and portrait on the story one, because the card
 * is what has to look composed; the webcam's own 4:3 frame is cropped to fill
 * whichever of the two it lands in. Both leave a deep strip underneath, which
 * is the part of a polaroid you write on.
 */
export const WINDOW: Record<Aspect, { x: number; y: number; w: number; h: number }> = {
  square: { x: 72, y: 72, w: 936, h: 660 },
  story: { x: 72, y: 120, w: 936, h: 1248 },
};

/** The message block: a column the type is fitted into rather than a size the
 *  type is set at, so a long line arrives smaller instead of overflowing. */
export const MESSAGE = {
  width: 936,
  max: 104,
  min: 36,
  maxLines: 3,
  lineHeight: 1.06,
  /** Where the block starts, as a fraction of the card — the middle of the
   *  strip under the photo. From here it is the viewer's to move. */
  home: {
    square: { xf: 0.5, yf: 0.839 },
    story: { xf: 0.5, yf: 0.856 },
  } as Record<Aspect, { xf: number; yf: number }>,
};

/**
 * The VinHack mark, as it appears *inside* a line of the message and in the
 * saved image's top bar.
 *
 * One file, because the mark is now red wherever it is drawn — an `<img>`
 * cannot inherit a colour and a canvas cannot recolour an SVG it draws, so a
 * second ink would mean a second file, and there is no longer a second ink.
 * Red sits over the message's black ground and over the black bar alike.
 *
 * `height` is a fraction of the type size the mark stands in for. Set against
 * the cap height rather than the em box, so the mark reads as the same size as
 * the capitals either side of it rather than as an image dropped into a line.
 */
export const MARK = {
  src: "/figma/logo-red.svg",
  natural: { w: 230, h: 78.7705 },
  height: 0.74,
};

/** The VinNovate IT mark, for the saved image's top bar. Recoloured from the
 *  society's own file: its purple is this site's red, its white left alone so
 *  it can sit on the black bar beside the VinHack mark. */
export const VIIT = {
  src: "/figma/vinnovate.svg",
  natural: { w: 244.5, h: 80.25 },
};

/**
 * The bar the saved image gets and the preview does not: a black strip across
 * the top with the two marks in it, and nothing else added anywhere.
 *
 * A fraction of the card's height, so a story gets a taller bar than a square
 * and both keep the posted size exactly — the card art is scaled to fit under
 * it rather than the image growing. There is no bottom bar: the credit and the
 * tag were furniture in a file nobody had asked for it in, and the picture is
 * what the card is for.
 */
export const BAR = {
  fraction: 0.082,
  /** Height of the marks inside the bar, as a fraction of the bar. */
  mark: 0.46,
  /** Gap between the two marks, in card units. */
  gap: 46,
};

export function barOf(aspect: Aspect) {
  return Math.round(CARD[aspect].h * BAR.fraction);
}

/** One sticker as the viewer has arranged it. Position is a fraction of the
 *  card rather than a card unit, so switching between square and story keeps
 *  everything where it was put instead of stranding it off the bottom. */
export type Placed = {
  id: number;
  /** `Sticker.id` in `stickers.ts`. */
  sticker: string;
  /** Centre of the sticker, 0..1 across and down the card. */
  xf: number;
  yf: number;
  scale: number;
  /** Degrees, clockwise. */
  rotation: number;
};

/** The message block, moved and turned by the same handles a sticker gets. */
export type PlacedText = {
  xf: number;
  yf: number;
  scale: number;
  rotation: number;
};

export function textHome(aspect: Aspect): PlacedText {
  return { ...MESSAGE.home[aspect], scale: 1, rotation: 0 };
}

export function font(size: number) {
  return `${size}px ${FACE}`;
}

/** A scratch context, kept for measuring only. */
let scratch: CanvasRenderingContext2D | null = null;
export function measurer(): CanvasRenderingContext2D | null {
  if (scratch) return scratch;
  if (typeof document === "undefined") return null;
  scratch = document.createElement("canvas").getContext("2d");
  return scratch;
}

/**
 * Width of a line as it will actually be drawn.
 *
 * Tracking is added between the glyphs rather than after each one, because that
 * is what the canvas renderer does when it draws a tracked line a character at
 * a time. `canvas.letterSpacing` would be the obvious thing and is not used:
 * it is recent enough that a browser without it would silently measure one
 * thing and draw another.
 */
export function lineWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking = 0,
) {
  return (
    ctx.measureText(text).width + (tracking ? tracking * Math.max(0, text.length - 1) : 0)
  );
}

/** Greedy wrap at `max` card units. A single word wider than the column is
 *  left on its own line — the caller shrinks the type until it fits. Still used
 *  by the stickers, whose badges are words and nothing else. */
export function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  max: number,
  tracking = 0,
): string[] {
  ctx.font = font(size);
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && lineWidth(ctx, next, tracking) > max) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out.length ? out : [""];
}

/* ------------------------------------------------------ words and marks */

/** A piece of a line: type, or the logo standing in for the word VinHack.
 *  `x` is its left edge measured from the line's own left. */
export type Token =
  | { kind: "word"; text: string; x: number; w: number }
  | { kind: "mark"; x: number; w: number; h: number };

export type Line = { items: Token[]; width: number };

/** Every case of the word, on its own or inside a longer word ("VINHACK2026"),
 *  because the rule the card follows is that the word is never *set* here. */
const WORD = /vinhack/gi;

/**
 * A word of the message, split into the pieces it is drawn from.
 *
 * Whitespace has already been taken off by the caller, so what comes back is
 * set solid: "VINHACK2026" is the mark followed immediately by "2026" with no
 * gap, exactly as it would be if it were all type.
 */
function pieces(word: string, size: number, ctx: CanvasRenderingContext2D) {
  const markH = size * MARK.height;
  const markW = (markH * MARK.natural.w) / MARK.natural.h;
  const out: { kind: "word" | "mark"; text?: string; w: number; h?: number }[] = [];
  let last = 0;
  WORD.lastIndex = 0;
  for (let hit = WORD.exec(word); hit; hit = WORD.exec(word)) {
    if (hit.index > last) {
      const text = word.slice(last, hit.index);
      out.push({ kind: "word", text, w: ctx.measureText(text).width });
    }
    out.push({ kind: "mark", w: markW, h: markH });
    last = hit.index + hit[0].length;
  }
  if (last < word.length) {
    const text = word.slice(last);
    out.push({ kind: "word", text, w: ctx.measureText(text).width });
  }
  return out;
}

/**
 * The message, broken into lines and laid out along each of them.
 *
 * A greedy wrap like `wrapLines`, but over words that may be part type and part
 * logo, and it settles the horizontal position of every piece rather than
 * leaving that to whoever draws it. Both renderers then place a piece at
 * `x - width / 2` from the block's centre and cannot disagree.
 */
export function layout(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  max: number,
): Line[] {
  ctx.font = font(size);
  const space = ctx.measureText(" ").width;
  const lines: Line[] = [];
  let items: Token[] = [];
  let x = 0;

  const flush = () => {
    if (!items.length) return;
    lines.push({ items, width: x });
    items = [];
    x = 0;
  };

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const parts = pieces(word, size, ctx);
    const width = parts.reduce((sum, part) => sum + part.w, 0);
    const gap = items.length ? space : 0;
    if (items.length && x + gap + width > max) flush();
    else x += gap;
    for (const part of parts) {
      items.push(
        part.kind === "mark"
          ? { kind: "mark", x, w: part.w, h: part.h ?? 0 }
          : { kind: "word", text: part.text ?? "", x, w: part.w },
      );
      x += part.w;
    }
  }
  flush();
  return lines.length ? lines : [{ items: [], width: 0 }];
}

/** The largest size at which the message fits the column in `maxLines`. */
export function fitMessage(
  ctx: CanvasRenderingContext2D,
  text: string,
): { size: number; lines: Line[] } {
  for (let size = MESSAGE.max; size > MESSAGE.min; size -= 2) {
    const lines = layout(ctx, text, size, MESSAGE.width);
    if (lines.length > MESSAGE.maxLines) continue;
    if (lines.every((line) => line.width <= MESSAGE.width)) return { size, lines };
  }
  return {
    size: MESSAGE.min,
    lines: layout(ctx, text, MESSAGE.min, MESSAGE.width),
  };
}

/** How a photo fills its window: the crop that covers it without squashing it,
 *  in the source image's own pixels. */
export function cover(
  src: { w: number; h: number },
  box: { w: number; h: number },
) {
  const scale = Math.max(box.w / src.w, box.h / src.h);
  const w = box.w / scale;
  const h = box.h / scale;
  return { x: (src.w - w) / 2, y: (src.h - h) / 2, w, h };
}
