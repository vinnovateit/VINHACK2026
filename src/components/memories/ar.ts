import {
  CARD,
  WINDOW,
  cover,
  font,
  type Aspect,
} from "@/components/memories/card";
import { mirrorFace, type Face, type Point } from "@/components/memories/vision";

/**
 * The things the booth hangs on a face, and the arithmetic that decides where.
 *
 * Every piece is drawn rather than shipped. A sticker is an SVG file because it
 * came off the Figma the rest of the site came off; a prop cannot be, because
 * it is drawn three times at three different sizes in three different places —
 * onto the live feed sixty times a second, into a small DOM canvas with drag
 * handles round it once the shot is taken, and into the saved PNG at full card
 * size — and the only way those three agree is if they are the same function.
 * So a prop is a `draw`, working in a box one unit wide, and the caller scales.
 *
 * ------------------------------------------------------------------- placing
 *
 * A prop hangs off one of the five points `vision.ts` reduces a face to, offset
 * along the head's own axes rather than the frame's, and sized as a multiple of
 * the distance between the eyes. All three of those matter. Off the head's axes
 * so a hat stays on top of a tilted head instead of sliding down beside it; a
 * multiple of the eye span so the far end of a group photo gets sunglasses that
 * fit; off a named landmark rather than the bounding box so a moustache is
 * under the nose and not merely in the lower third of a rectangle.
 *
 * The numbers are in eye spans throughout, which is a real unit — an adult's
 * pupils are about a third of their face's width apart — so `span: 2.2` on the
 * sunglasses means "a shade over twice as wide as the eyes are apart", which is
 * what a pair of sunglasses is.
 *
 * ------------------------------------------------------------------- keeping
 *
 * Detection stops at the shutter. What the countdown records is where every
 * prop *was* on the frame it fired on, in fractions of that photograph, and
 * from then on the prop is a piece on the card like any other: draggable,
 * turnable, resizable, removable. Nothing tracks a still photograph, and a
 * misdetected face is a thing you nudge rather than a thing you retake for.
 *
 * Those fractions are of the *photo*, not of the card, and that is the whole
 * reason `photoMap` exists. Stickers are placed in card fractions because a
 * sticker belongs to the card; a prop belongs to the face under it, and the
 * face moves when the square / story switch re-crops the picture. Storing card
 * fractions would slide everybody's sunglasses off their faces the first time
 * somebody tried the other shape.
 */

const INK = "#101010";
const GREEN = "#bfea88";
const RED = "#fa1a1d";
const CYAN = "#74d4f0";
const PINK = "#fdbbff";
const WHITE = "#fcfcfc";

/** `roundRect` is everywhere that can run this page, but not on every version
 *  of everywhere, and a prop that throws takes the whole frame loop with it. */
function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Centred lettering in the card's own face, fitted to `max` units wide. The
 *  props that carry words are few and their words are short, so this shrinks
 *  the type rather than breaking the line — a two-line "36H" is not a thing. */
function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  max: number,
  y: number,
) {
  ctx.font = font(size);
  const width = ctx.measureText(text).width;
  const fitted = width > max ? size * (max / width) : size;
  ctx.font = font(fitted);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, y);
}

export type PropGroup = "eyes" | "head" | "face" | "float";

export type Prop = {
  id: string;
  /** What the tray says. Shouted, like every other label in the booth. */
  label: string;
  group: PropGroup;
  /** The face point it hangs off. */
  anchor: "eyes" | "brow" | "nose" | "mouth" | "chin";
  /** Drawn width, in eye spans. */
  span: number;
  /** Offset from the anchor, in eye spans, along the head's own axes. */
  dx: number;
  dy: number;
  /** Drawn height as a fraction of the drawn width. */
  ratio: number;
  /** The piece, centred on the origin, one unit wide and `ratio` tall. The
   *  caller has already scaled and turned the context. */
  draw: (ctx: CanvasRenderingContext2D) => void;
};

/* ------------------------------------------------------------ the eyewear */

const shades: Prop["draw"] = (ctx) => {
  ctx.fillStyle = INK;
  box(ctx, -0.5, -0.2, 1, 0.07, 0.035);
  ctx.fill();
  box(ctx, -0.5, -0.17, 0.43, 0.31, 0.07);
  ctx.fill();
  box(ctx, 0.07, -0.17, 0.43, 0.31, 0.07);
  ctx.fill();
  ctx.fillRect(-0.08, -0.16, 0.16, 0.06);

  // The glint. Two strips across each lens on the diagonal, clipped to the
  // lens, which is what a photograph of a pair of sunglasses actually has on
  // it and what stops these reading as two black holes.
  for (const side of [-1, 1]) {
    ctx.save();
    box(ctx, side < 0 ? -0.5 : 0.07, -0.17, 0.43, 0.31, 0.07);
    ctx.clip();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = WHITE;
    ctx.translate(side * 0.28, 0);
    ctx.rotate(-0.62);
    ctx.fillRect(-0.3, -0.26, 0.07, 0.52);
    ctx.fillRect(-0.17, -0.26, 0.03, 0.52);
    ctx.restore();
  }

  // The arms, going back past the temples.
  ctx.fillStyle = INK;
  ctx.fillRect(-0.56, -0.19, 0.07, 0.06);
  ctx.fillRect(0.49, -0.19, 0.07, 0.06);
};

const visor: Prop["draw"] = (ctx) => {
  const glass = ctx.createLinearGradient(-0.5, 0, 0.5, 0);
  glass.addColorStop(0, RED);
  glass.addColorStop(0.5, "#2849cb");
  glass.addColorStop(1, CYAN);
  ctx.fillStyle = INK;
  box(ctx, -0.54, -0.15, 1.08, 0.3, 0.14);
  ctx.fill();
  ctx.fillStyle = glass;
  box(ctx, -0.5, -0.115, 1, 0.23, 0.11);
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = WHITE;
  box(ctx, -0.44, -0.075, 0.88, 0.035, 0.018);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const pixel: Prop["draw"] = (ctx) => {
  // Hard edges and one grid, because that is the entire joke. `u` is the pixel.
  const u = 1 / 16;
  ctx.fillStyle = INK;
  ctx.fillRect(-8 * u, -2 * u, 16 * u, 2 * u);
  ctx.fillRect(-8 * u, 0, 5 * u, 4 * u);
  ctx.fillRect(3 * u, 0, 5 * u, 4 * u);
  ctx.fillStyle = WHITE;
  ctx.fillRect(-7 * u, u, u, u);
  ctx.fillRect(4 * u, u, u, u);
};

/* ------------------------------------------------------------- the headwear */

const cap: Prop["draw"] = (ctx) => {
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.ellipse(0, 0.14, 0.5, 0.15, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.ellipse(0, 0.15, 0.34, 0.44, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillRect(-0.34, 0.08, 0.68, 0.07);
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.arc(0, -0.28, 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  label(ctx, "VH", 0.19, 0.4, -0.08);
};

const crown: Prop["draw"] = (ctx) => {
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.moveTo(-0.5, 0.26);
  ctx.lineTo(-0.42, -0.16);
  ctx.lineTo(-0.21, 0.06);
  ctx.lineTo(0, -0.28);
  ctx.lineTo(0.21, 0.06);
  ctx.lineTo(0.42, -0.16);
  ctx.lineTo(0.5, 0.26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = RED;
  ctx.fillRect(-0.5, 0.16, 1, 0.1);
  for (const [x, y] of [
    [-0.42, -0.19],
    [0, -0.31],
    [0.42, -0.19],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
};

const grad: Prop["draw"] = (ctx) => {
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-0.34, 0.3);
  ctx.lineTo(0.34, 0.3);
  ctx.lineTo(0.28, 0.02);
  ctx.lineTo(-0.28, 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -0.16);
  ctx.lineTo(0.5, 0.04);
  ctx.lineTo(0, 0.24);
  ctx.lineTo(-0.5, 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = RED;
  ctx.lineWidth = 0.028;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0.04);
  ctx.lineTo(0.34, 0.1);
  ctx.lineTo(0.36, 0.3);
  ctx.stroke();
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(0.36, 0.34, 0.05, 0, Math.PI * 2);
  ctx.fill();
};

/* ------------------------------------------------------------ the face marks */

const stache: Prop["draw"] = (ctx) => {
  ctx.fillStyle = "#241c16";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -0.14);
    ctx.bezierCurveTo(side * 0.16, -0.2, side * 0.42, -0.18, side * 0.5, -0.02);
    ctx.bezierCurveTo(side * 0.53, 0.12, side * 0.36, 0.2, side * 0.26, 0.12);
    ctx.bezierCurveTo(side * 0.22, 0.04, side * 0.16, -0.02, 0, 0.02);
    ctx.closePath();
    ctx.fill();
  }
};

const blush: Prop["draw"] = (ctx) => {
  for (const side of [-1, 1]) {
    const wash = ctx.createRadialGradient(side * 0.36, 0, 0, side * 0.36, 0, 0.16);
    wash.addColorStop(0, "rgba(250, 26, 29, 0.5)");
    wash.addColorStop(1, "rgba(250, 26, 29, 0)");
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.ellipse(side * 0.36, 0, 0.16, 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PINK;
  for (const side of [-1, 1]) {
    for (const step of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * (0.3 + step * 0.06), step * 0.03, 0.018, 0.013, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const warpaint: Prop["draw"] = (ctx) => {
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(-0.5, -0.09);
  ctx.lineTo(0.5, -0.09);
  ctx.lineTo(0.46, 0.09);
  ctx.lineTo(-0.46, 0.09);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = GREEN;
  for (const side of [-1, 1]) {
    ctx.fillRect(side * 0.4 - 0.03, -0.2, 0.06, 0.09);
    ctx.fillRect(side * 0.28 - 0.025, 0.11, 0.05, 0.08);
  }
};

/* --------------------------------------------------------- over the head */

const bubble: Prop["draw"] = (ctx) => {
  ctx.fillStyle = GREEN;
  box(ctx, -0.5, -0.24, 1, 0.4, 0.08);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-0.08, 0.15);
  ctx.lineTo(0.02, 0.15);
  ctx.lineTo(-0.09, 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = INK;
  label(ctx, "36 HOURS. NO SLEEP.", 0.115, 0.86, -0.045);
};

const badge: Prop["draw"] = (ctx) => {
  ctx.fillStyle = RED;
  box(ctx, -0.5, -0.2, 1, 0.4, 0.2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  label(ctx, "36H", 0.24, 0.72, 0.005);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 0.03;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * 0.42, 0, 0.15, side < 0 ? 0.6 : Math.PI - 0.6, side < 0 ? -0.6 : Math.PI + 0.6, side > 0);
    ctx.stroke();
  }
};

/**
 * Every prop, in the order the tray shows them: what you wear on your eyes,
 * then on your head, then on your face, then what floats over it.
 */
export const PROPS: readonly Prop[] = [
  { id: "shades", label: "SHADES", group: "eyes", anchor: "eyes", span: 2.2, dx: 0, dy: 0, ratio: 0.4, draw: shades },
  { id: "visor", label: "VISOR", group: "eyes", anchor: "eyes", span: 2.5, dx: 0, dy: -0.02, ratio: 0.3, draw: visor },
  { id: "pixel", label: "8-BIT", group: "eyes", anchor: "eyes", span: 2.2, dx: 0, dy: -0.03, ratio: 0.375, draw: pixel },
  { id: "cap", label: "CAP", group: "head", anchor: "brow", span: 3.1, dx: 0, dy: -0.95, ratio: 0.62, draw: cap },
  { id: "crown", label: "CROWN", group: "head", anchor: "brow", span: 2.7, dx: 0, dy: -0.55, ratio: 0.6, draw: crown },
  { id: "grad", label: "MORTARBOARD", group: "head", anchor: "brow", span: 3.2, dx: 0, dy: -0.72, ratio: 0.6, draw: grad },
  { id: "stache", label: "MOUSTACHE", group: "face", anchor: "mouth", span: 1.35, dx: 0, dy: -0.3, ratio: 0.36, draw: stache },
  { id: "blush", label: "BLUSH", group: "face", anchor: "nose", span: 2.8, dx: 0, dy: 0.06, ratio: 0.34, draw: blush },
  { id: "warpaint", label: "WAR PAINT", group: "face", anchor: "nose", span: 2.3, dx: 0, dy: -0.12, ratio: 0.34, draw: warpaint },
  { id: "bubble", label: "SPEECH", group: "float", anchor: "brow", span: 3.4, dx: 0.5, dy: -1.6, ratio: 0.56, draw: bubble },
  { id: "badge", label: "36H BADGE", group: "float", anchor: "brow", span: 1.7, dx: 0, dy: -1.15, ratio: 0.4, draw: badge },
];

export const PROP_BY_ID = new Map(PROPS.map((prop) => [prop.id, prop]));

/** The tray's sections, and what each is called. */
export const PROP_GROUPS: readonly { id: PropGroup; label: string }[] = [
  { id: "eyes", label: "EYES" },
  { id: "head", label: "HEAD" },
  { id: "face", label: "FACE" },
  { id: "float", label: "OVERHEAD" },
];

/* ----------------------------------------------------------------- placing */

/** Where one prop lands on one face: a centre, a drawn width and an angle, all
 *  in the frame-width space `vision.ts` works in. */
export type Placement = { at: Point; span: number; roll: number };

export function placeProp(prop: Prop, face: Face): Placement {
  const radians = (face.roll * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const base = face[prop.anchor];
  return {
    at: {
      x: base.x + (prop.dx * cos - prop.dy * sin) * face.span,
      y: base.y + (prop.dx * sin + prop.dy * cos) * face.span,
    },
    span: prop.span * face.span,
    roll: face.roll,
  };
}

/**
 * A face read off the live frame, moved into the photograph that was cut out of
 * it.
 *
 * The shutter takes a centred rectangle out of the camera's frame and, on the
 * front lens, flips it. The landmarks were read before either of those things
 * happened, so every one of them has to make the same journey or the props land
 * where the face used to be. Mirroring first and cropping second is the same
 * result as the other way round — the crop is centred, so it is symmetric about
 * the axis the flip is about — which is why this can be two steps rather than a
 * matrix.
 */
export function rebase(
  face: Face,
  shot: {
    w: number;
    source: { w: number; h: number };
    crop: { x: number; y: number };
    mirrored: boolean;
  },
): Face {
  const base = shot.mirrored ? mirrorFace(face) : face;
  const move = (p: Point): Point => ({
    x: (p.x * shot.source.w - shot.crop.x) / shot.w,
    y: (p.y * shot.source.w - shot.crop.y) / shot.w,
  });
  return {
    eyes: move(base.eyes),
    brow: move(base.brow),
    nose: move(base.nose),
    mouth: move(base.mouth),
    chin: move(base.chin),
    span: (base.span * shot.source.w) / shot.w,
    roll: base.roll,
  };
}

/** One prop, drawn into whatever units the context is already in. */
export function drawProp(
  ctx: CanvasRenderingContext2D,
  prop: Prop,
  x: number,
  y: number,
  width: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(width, width);
  prop.draw(ctx);
  ctx.restore();
}

/* --------------------------------------------------------- on the card */

/**
 * One prop as the shutter left it. Everything is a fraction of the *photo* —
 * see the note at the top of this file — so the square / story switch re-crops
 * the picture and the props go with it.
 */
export type PlacedProp = {
  id: number;
  /** A `Prop.id`. */
  prop: string;
  /** Centre, in frame-width fractions of the captured photo. */
  px: number;
  py: number;
  /** Drawn width, as a fraction of the photo's width, as detection left it. */
  span: number;
  /** The viewer's own multiplier on top of that, from the corner handle. */
  scale: number;
  rotation: number;
};

/**
 * The photograph's coordinates, in card units — the one place the two spaces
 * meet.
 *
 * `cover` decides which part of the photo the window shows, and the scale it
 * comes in at is uniform, so a fraction of the photo's width is a fixed number
 * of card units and an angle survives the trip untouched. Everything below is
 * that one number applied in each direction.
 */
export type PhotoMap = {
  /** Card units per photo pixel. */
  k: number;
  /** A photo point, in card units. */
  toCard: (px: number, py: number) => { x: number; y: number };
  /** A card point, back in photo fractions. */
  toPhoto: (x: number, y: number) => { px: number; py: number };
  /** A fraction of the photo's width, in card units. */
  size: (fraction: number) => number;
};

export function photoMap(shot: { w: number; h: number }, aspect: Aspect): PhotoMap {
  const window_ = WINDOW[aspect];
  const crop = cover(shot, window_);
  const k = window_.w / crop.w;
  return {
    k,
    toCard: (px, py) => ({
      x: window_.x + (px * shot.w - crop.x) * k,
      y: window_.y + (py * shot.w - crop.y) * k,
    }),
    toPhoto: (x, y) => ({
      px: ((x - window_.x) / k + crop.x) / shot.w,
      py: ((y - window_.y) / k + crop.y) / shot.w,
    }),
    size: (fraction) => fraction * shot.w * k,
  };
}

/** A placed prop's centre as a fraction of the *card*, which is the space the
 *  studio's drag maths speaks. */
export function propAt(item: PlacedProp, map: PhotoMap, aspect: Aspect) {
  const card = CARD[aspect];
  const point = map.toCard(item.px, item.py);
  return { xf: point.x / card.w, yf: point.y / card.h };
}

/** And back again, so a drag that arrives in card fractions is stored in the
 *  photo's own space. */
export function propFrom(xf: number, yf: number, map: PhotoMap, aspect: Aspect) {
  const card = CARD[aspect];
  return map.toPhoto(xf * card.w, yf * card.h);
}
