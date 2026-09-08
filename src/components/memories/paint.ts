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
import { SCAN, type FeedOverlay } from "@/components/memories/filters";
import { BY_ID, badgeLines, boxOf } from "@/components/memories/stickers";
import {
  PROP_BY_ID,
  drawProp,
  photoMap,
  type PlacedProp,
} from "@/components/memories/ar";
import { backdropOf } from "@/components/memories/backdrops";
import type { Shot } from "@/components/memories/useCamera";

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
 * The backdrop splits across that order rather than sitting at one point in it,
 * because the two kinds of backdrop are not the same kind of thing. A *scene*
 * is part of the photograph — it goes behind the person, inside the filter,
 * before the overlay treatments, and it is composed off to one side first
 * because `ctx.filter` treats each draw as it is made and the scene and the
 * person have to be treated as the one picture they now are. A *frame* is ink
 * on the window: after the overlay, unfiltered, clipped to the photo. The AR
 * props come after both and are clipped to nothing at all, because by the time
 * they reach this file they are pieces on the card that happen to have been
 * placed by a camera.
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

/**
 * The overlay treatments, drawn into the photo window — the half of a filter
 * that is ink rather than a filter, and the only part of the booth's stack this
 * file has to render itself.
 *
 * Same three layers as the `.fx-` block in `globals.css`, at the same strengths
 * and in the same order, because they are the same treatment: what the viewer
 * chose on the camera has to be what lands in the file. What does not come
 * across is the motion — a still cannot roll, drift or tear its way down the
 * frame, so each layer is drawn at one moment of its loop. The tear is placed
 * at the point in its sweep where it is on the picture rather than off the top
 * of it, which is the frame anybody would have picked to keep.
 *
 * Clipped to the window, so nothing lands on the black the message is written
 * on: the treatment is on the photograph, not on the card.
 */
function drawOverlays(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  overlays: readonly FeedOverlay[],
) {
  if (!overlays.length) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();

  // Legacy `rgba()` rather than the space-separated form the stylesheet
  // uses: a canvas parses colours with its own parser, and the older syntax is
  // the one every engine that can run this page agrees on.
  if (overlays.includes("scan")) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    for (let y = box.y; y < box.y + box.h; y += SCAN.period) {
      ctx.fillRect(box.x, y, box.w, SCAN.ink);
    }
  }

  // `screen` is what a chroma split does to a signal — it adds a channel back
  // rather than washing one over the top.
  ctx.globalCompositeOperation = "screen";

  if (overlays.includes("chroma")) {
    const chroma = ctx.createLinearGradient(box.x, 0, box.x + box.w, 0);
    chroma.addColorStop(0, "rgba(250, 26, 29, 0.4)");
    chroma.addColorStop(0.22, "rgba(0, 0, 0, 0)");
    chroma.addColorStop(0.78, "rgba(0, 0, 0, 0)");
    chroma.addColorStop(1, "rgba(116, 212, 240, 0.42)");
    ctx.fillStyle = chroma;
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }

  if (overlays.includes("tear")) {
    const tearH = box.h * 0.08;
    const tearY = box.y + box.h * 0.38;
    const tear = ctx.createLinearGradient(box.x, 0, box.x + box.w, 0);
    tear.addColorStop(0, "rgba(250, 26, 29, 0.34)");
    tear.addColorStop(0.5, "rgba(252, 252, 252, 0.22)");
    tear.addColorStop(1, "rgba(116, 212, 240, 0.34)");
    ctx.fillStyle = tear;
    ctx.fillRect(box.x, tearY, box.w, tearH);
  }

  ctx.restore();
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
  props,
  photo,
  backdrop,
  filter,
  overlays,
}: {
  aspect: Aspect;
  lines: readonly Line[];
  size: number;
  text: PlacedText;
  placed: readonly Placed[];
  props: readonly PlacedProp[];
  photo: Shot | null;
  backdrop: string;
  filter: string;
  overlays: readonly FeedOverlay[];
}): Promise<HTMLCanvasElement> {
  const { w, h } = CARD[aspect];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("memory card: no 2d context");

  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, w, h);

  const art = backdropOf(backdrop);

  if (photo) {
    const shot = await image(photo.url).catch(() => null);
    if (shot) {
      const box = WINDOW[aspect];
      const crop = cover(photo, box);
      // A scene goes behind the person, and only where the shutter kept a
      // cut-out to put them in front of it with. Without one — the segmenter
      // never arrived, or the photograph was taken before a scene was picked —
      // this is a plain window, which is the graceful version of the failure.
      const cut =
        art?.kind === "scene" && photo.mask
          ? await image(photo.mask).catch(() => null)
          : null;

      ctx.save();
      // The filter is the colourway's, applied here rather than baked into the
      // capture — so a filter picked before the shot can still be changed after
      // it, and the stored frame stays the frame the camera gave us. Where the
      // browser has no `ctx.filter` the photo lands untreated, which is the one
      // graceful thing to do with a missing filter.
      if (filter && filter !== "none" && "filter" in ctx) ctx.filter = filter;
      if (art && cut) {
        // Composed off to the side and drawn in as one image, because the
        // filter has to treat the scene and the person together — they are one
        // photograph as far as the card is concerned — and `ctx.filter` treats
        // each draw as it is made.
        const stage = document.createElement("canvas");
        stage.width = box.w;
        stage.height = box.h;
        const scene = stage.getContext("2d");
        if (scene) {
          art.draw(scene, box.w, box.h);
          const person = document.createElement("canvas");
          person.width = box.w;
          person.height = box.h;
          const front = person.getContext("2d");
          if (front) {
            front.drawImage(shot, crop.x, crop.y, crop.w, crop.h, 0, 0, box.w, box.h);
            // The mask is the photo's own size, so it takes the same rectangle.
            front.globalCompositeOperation = "destination-in";
            front.drawImage(cut, crop.x, crop.y, crop.w, crop.h, 0, 0, box.w, box.h);
            scene.drawImage(person, 0, 0);
          }
        }
        ctx.drawImage(stage, box.x, box.y);
      } else {
        ctx.drawImage(shot, crop.x, crop.y, crop.w, crop.h, box.x, box.y, box.w, box.h);
      }
      ctx.restore();
      // After the photo and before anything else: the overlay treats the
      // picture, and the message and the stickers go on top of the treated
      // picture the same way they sit on top of it in the preview.
      drawOverlays(ctx, box, overlays);

      // The frame is ink on the window rather than a treatment of it, so it
      // goes on after the overlay and is not filtered — the same order, and the
      // same reasoning, as `ArStage` draws it in.
      if (art?.kind === "frame") {
        ctx.save();
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.w, box.h);
        ctx.clip();
        ctx.translate(box.x, box.y);
        art.draw(ctx, box.w, box.h);
        ctx.restore();
      }
    }
  }

  // The props the camera hung on a face, where the shutter left them and
  // wherever they have been dragged since. Not clipped to the window: they are
  // pieces on the card now, and a piece dragged off the picture has to survive
  // the trip into the file the same way a sticker does.
  if (photo && props.length) {
    const map = photoMap(photo, aspect);
    for (const item of props) {
      const prop = PROP_BY_ID.get(item.prop);
      if (!prop) continue;
      const at = map.toCard(item.px, item.py);
      drawProp(ctx, prop, at.x, at.y, map.size(item.span) * item.scale, item.rotation);
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
  /** The AR props, frozen at the shutter and moved by hand since. */
  props: readonly PlacedProp[];
  photo: Shot | null;
  /** A `Backdrop.id`, or `PLAIN`. */
  backdrop: string;
  filter: string;
  overlays: readonly FeedOverlay[];
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
