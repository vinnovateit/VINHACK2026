import {
  BAR,
  CARD,
  GROUND,
  HEADLINE,
  MARK,
  MESSAGE,
  VIIT,
  WINDOW,
  barOf,
  cover,
  font,
  type Aspect,
  type Line,
  type Placed,
  type PlacedText,
} from "@/components/memories/card";
import { BY_ID, badgeLines, boxOf } from "@/components/memories/stickers";

/**
 * The card, drawn onto a canvas at full size — the file the viewer saves.
 *
 * This is the second of the two renderers described in `card.ts`, and it is the
 * one that has to be right: the preview only has to look like this. Everything
 * it needs — the fitted type size, the finished lines and where each word and
 * mark sits along them, where the photo and every sticker ended up — is handed
 * in rather than worked out here, so there is no second opinion about any of it.
 *
 * Every asset is same-origin, and an `<img>` holding an SVG does not taint a
 * canvas the way a foreign image would, so the canvas stays readable and
 * `toBlob` works. The photo is a data URL the page made itself, which is
 * same-origin by construction.
 *
 * Draw order, and the one place it is a decision rather than an accident: the
 * ground, the photo, the message, then the stickers. The stickers go over both
 * because that is what a sticker does to the thing it is stuck on.
 *
 * The last step is the one the preview deliberately does not have. The saved
 * image gets a single black bar across the top with the two marks in it, and
 * the card art is scaled to fit under it — so a square export is still exactly
 * 1080 square and nothing is cropped off it. Everything below the bar is the
 * card as the viewer left it: the camera's frame, the message, the stickers.
 * There is no reason to make the viewer edit around furniture that only exists
 * in the file, which is why none of this is in the preview.
 */

const cache = new Map<string, Promise<HTMLImageElement>>();

function image(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`memory card: could not load ${src}`));
    img.src = src;
  });
}

/** Shipped artwork, held for the life of the page. */
function load(src: string): Promise<HTMLImageElement> {
  const hit = cache.get(src);
  if (hit) return hit;
  const pending = image(src);
  cache.set(src, pending);
  return pending;
}

/** Centred text, tracked between the glyphs rather than after each of them.
 *  Only the sticker badges are tracked; the message is not. */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  tracking: number,
) {
  if (!tracking) {
    ctx.textAlign = "center";
    ctx.fillText(text, 0, y);
    return;
  }
  ctx.textAlign = "left";
  let x =
    -(ctx.measureText(text).width + tracking * Math.max(0, text.length - 1)) / 2;
  for (const glyph of Array.from(text)) {
    ctx.fillText(glyph, x, y);
    x += ctx.measureText(glyph).width + tracking;
  }
}

/** A sticker badge's lines, centred as a block on the origin. */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  size: number,
  lineHeight: number,
  tracking: number,
) {
  const step = size * lineHeight;
  let y = -((lines.length - 1) * step) / 2;
  ctx.textBaseline = "middle";
  for (const line of lines) {
    drawTracked(ctx, line, y, tracking);
    y += step;
  }
}

/**
 * The message, centred as a block on the origin — words set in type, the word
 * VinHack drawn as the mark.
 *
 * Every horizontal position was settled by `layout`; all this does is subtract
 * half the line's width to centre it. If the mark did not load the line simply
 * has a gap in it where it would have been, which is a worse card but still a
 * card — better than throwing away the save.
 */
function drawMessage(
  ctx: CanvasRenderingContext2D,
  lines: readonly Line[],
  size: number,
  mark: HTMLImageElement | null,
) {
  const step = size * MESSAGE.lineHeight;
  let y = -((lines.length - 1) * step) / 2;
  ctx.fillStyle = HEADLINE;
  ctx.font = font(size);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const line of lines) {
    const left = -line.width / 2;
    for (const item of line.items) {
      if (item.kind === "word") ctx.fillText(item.text, left + item.x, y);
      else if (mark) ctx.drawImage(mark, left + item.x, y - item.h / 2, item.w, item.h);
    }
    y += step;
  }
}

/** The card itself, at full size and with nothing added: what the preview
 *  shows. Kept separate so the save can scale it as one picture. */
async function paintArt({
  aspect,
  lines,
  size,
  text,
  placed,
  photo,
  filter,
}: {
  aspect: Aspect;
  lines: readonly Line[];
  size: number;
  text: PlacedText;
  placed: readonly Placed[];
  photo: { url: string; w: number; h: number } | null;
  filter: string;
}): Promise<HTMLCanvasElement> {
  const { w, h } = CARD[aspect];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("memory card: no 2d context");

  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, w, h);

  if (photo) {
    const shot = await image(photo.url).catch(() => null);
    if (shot) {
      const box = WINDOW[aspect];
      const crop = cover(photo, box);
      ctx.save();
      // The filter is the colourway's, applied here rather than baked into the
      // capture — so a filter picked before the shot can still be changed after
      // it, and the stored frame stays the frame the camera gave us. Where the
      // browser has no `ctx.filter` the photo lands untreated, which is the one
      // graceful thing to do with a missing filter.
      if (filter && filter !== "none" && "filter" in ctx) ctx.filter = filter;
      ctx.drawImage(shot, crop.x, crop.y, crop.w, crop.h, box.x, box.y, box.w, box.h);
      ctx.restore();
    }
  }

  const mark = await load(MARK.src).catch(() => null);
  ctx.save();
  ctx.translate(text.xf * w, text.yf * h);
  ctx.rotate((text.rotation * Math.PI) / 180);
  ctx.scale(text.scale, text.scale);
  drawMessage(ctx, lines, size, mark);
  ctx.restore();

  for (const item of placed) {
    const sticker = BY_ID.get(item.sticker);
    if (!sticker) continue;
    const art = await load(sticker.src).catch(() => null);
    if (!art) continue;
    const box = boxOf(sticker);

    ctx.save();
    ctx.translate(item.xf * w, item.yf * h);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.scale, item.scale);

    ctx.save();
    if (sticker.round) {
      ctx.beginPath();
      ctx.arc(0, 0, box.w / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    if (sticker.crop) {
      const { x, y, w: cw, h: ch } = sticker.crop;
      ctx.drawImage(art, x, y, cw, ch, -box.w / 2, -box.h / 2, box.w, box.h);
    } else {
      ctx.drawImage(art, -box.w / 2, -box.h / 2, box.w, box.h);
    }
    ctx.restore();

    if (sticker.badge) {
      const badge = sticker.badge;
      const type = badge.size * box.w;
      ctx.save();
      ctx.translate((badge.cx - 0.5) * box.w, (badge.cy - 0.5) * box.h);
      ctx.rotate((badge.rotate * Math.PI) / 180);
      ctx.fillStyle = badge.color;
      ctx.font = font(type);
      drawBadge(
        ctx,
        badgeLines(badge, box.w),
        type,
        badge.lineHeight,
        (badge.tracking ?? 0) * box.w,
      );
      ctx.restore();
    }

    ctx.restore();
  }

  return canvas;
}

export async function paintCard(options: {
  aspect: Aspect;
  /** Already broken and laid out, by `fitMessage`. */
  lines: readonly Line[];
  size: number;
  text: PlacedText;
  placed: readonly Placed[];
  photo: { url: string; w: number; h: number } | null;
  filter: string;
}): Promise<HTMLCanvasElement> {
  const { aspect } = options;
  const { w, h } = CARD[aspect];

  // Rotonto is the only face on the card, and a canvas will silently fall back
  // to a system font rather than wait for a webface.
  if (document.fonts) {
    await document.fonts.load(font(MESSAGE.max));
    await document.fonts.ready;
  }

  const art = await paintArt(options);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("memory card: no 2d context");

  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, w, h);

  // One bar, at the top. The art keeps its own aspect and is scaled to the
  // height left under it, which leaves a hairline of ground either side rather
  // than stretching the picture to the full width.
  const bar = barOf(aspect);
  const k = (h - bar) / h;
  ctx.drawImage(art, (w - w * k) / 2, bar, w * k, h * k);

  // The two marks, centred as a pair in the bar.
  const [vinhack, viit] = await Promise.all([
    load(MARK.src).catch(() => null),
    load(VIIT.src).catch(() => null),
  ]);
  const markH = bar * BAR.mark;
  const sized = [
    vinhack && { img: vinhack, w: (markH * MARK.natural.w) / MARK.natural.h, h: markH },
    viit && { img: viit, w: (markH * VIIT.natural.w) / VIIT.natural.h, h: markH },
  ].filter((entry): entry is { img: HTMLImageElement; w: number; h: number } => !!entry);

  if (sized.length) {
    const total =
      sized.reduce((sum, entry) => sum + entry.w, 0) + BAR.gap * (sized.length - 1);
    let x = (w - total) / 2;
    for (const entry of sized) {
      ctx.drawImage(entry.img, x, (bar - entry.h) / 2, entry.w, entry.h);
      x += entry.w + BAR.gap;
    }
  }

  return canvas;
}
