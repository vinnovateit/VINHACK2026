import { font } from "@/components/memories/card";

/**
 * What goes behind you and what goes round you — the VinHack dressing on the
 * photo window.
 *
 * Two kinds, and the difference is not decoration, it is what they cost.
 *
 *   frame   drawn *over* the finished picture, inside the window. Corner tape,
 *           a ticker along the bottom, confetti, a terminal chrome. These are
 *           ink on a rectangle: they need no model, no network and no camera,
 *           they work on a photograph taken before any of this loaded, and they
 *           can be changed at any point right up to the save.
 *
 *   scene   drawn *behind* you, which means somebody has to say where you stop
 *           and the room starts. That is the selfie segmenter in `vision.ts`,
 *           over a CDN, and it is the one thing on this page that can simply
 *           fail to arrive. So a scene is offered only once the segmenter is
 *           actually in, and a card that has no mask on it falls back to the
 *           plain window rather than to a hole where somebody used to be.
 *
 * A scene stays changeable after the shot for the same reason the filters do:
 * the shutter records the *mask* beside the photograph rather than baking the
 * two together, so the picture the camera gave us is still the picture we have.
 * Choosing a different hall to have stood in is then the same kind of act as
 * choosing a different filter, which is what it ought to be.
 *
 * Like `ar.ts`, every piece here is a `draw` rather than a file: the preview
 * canvas and the saved PNG are the same function at two sizes, so there is no
 * second version of a backdrop to keep in step.
 */

const GREEN = "#bfea88";
const RED = "#fa1a1d";
const CYAN = "#74d4f0";
const LILAC = "#db9eef";
const PINK = "#fdbbff";
const BLUE = "#2849cb";
const WHITE = "#fcfcfc";

/**
 * A fixed shuffle.
 *
 * Confetti and falling code want to look scattered and must not *be* random:
 * the preview and the saved file draw them separately, and a card whose
 * confetti moved between the screen and the download is a card that lied. One
 * seeded generator, restarted at the top of every draw, gives both the same
 * scatter forever.
 */
function shuffled(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export type BackdropKind = "frame" | "scene";

export type Backdrop = {
  id: string;
  label: string;
  kind: BackdropKind;
  /** Fills a box `w` by `h` with its top-left at the origin. */
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
};

/** The one that is nothing, first in the row — the window as the camera left
 *  it. Like `STRAIGHT` in the filter tray, it is a choice rather than the
 *  absence of one, so there is always somewhere to land back on. */
export const PLAIN = "plain";

/* ------------------------------------------------------------- the frames */

const tape: Backdrop["draw"] = (ctx, w, h) => {
  const strip = Math.min(w, h) * 0.34;
  const thick = Math.min(w, h) * 0.075;
  ctx.globalAlpha = 0.72;
  const corners: [number, number, number][] = [
    [0, 0, -45],
    [w, 0, 45],
    [0, h, 45],
    [w, h, -45],
  ];
  for (const [x, y, angle] of corners) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = angle < 0 ? GREEN : PINK;
    ctx.fillRect(-strip / 2, -thick / 2, strip, thick);
    // The torn ends: a row of nicks bitten out of each edge, which is the only
    // thing that separates a strip of tape from a rectangle.
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 7; i += 1) {
      const t = -thick / 2 + (i * thick) / 6;
      ctx.beginPath();
      ctx.arc(-strip / 2, t, thick * 0.11, 0, Math.PI * 2);
      ctx.arc(strip / 2, t, thick * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }
  ctx.globalAlpha = 1;
};

const ticker: Backdrop["draw"] = (ctx, w, h) => {
  const band = h * 0.088;
  const size = band * 0.62;
  ctx.fillStyle = RED;
  ctx.fillRect(0, h - band, w, band);
  ctx.fillStyle = "#000000";
  ctx.font = font(size);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const run = "VINHACK 2026   ·   ";
  const step = ctx.measureText(run).width;
  for (let x = 0; x < w + step; x += step) {
    ctx.fillText(run, x, h - band / 2);
  }
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, h - band - band * 0.14, w, band * 0.14);
};

const confetti: Backdrop["draw"] = (ctx, w, h) => {
  const next = shuffled(20260214);
  const palette = [GREEN, RED, CYAN, LILAC, PINK, WHITE];
  const size = Math.min(w, h) * 0.03;
  for (let i = 0; i < 74; i += 1) {
    const x = next() * w;
    const y = next() * h;
    // Kept to the border, so nothing lands on a face. The middle of the
    // picture is the one part of it that is not ours to draw on.
    const clear = Math.min(x, w - x) > w * 0.22 && Math.min(y, h - y) > h * 0.24;
    if (clear) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(next() * Math.PI);
    ctx.globalAlpha = 0.55 + next() * 0.45;
    ctx.fillStyle = palette[i % palette.length];
    const long = size * (0.7 + next() * 1.1);
    ctx.fillRect(-long / 2, -size * 0.22, long, size * 0.44);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
};

const terminal: Backdrop["draw"] = (ctx, w, h) => {
  const bar = h * 0.082;
  const rule = Math.min(w, h) * 0.011;
  ctx.fillStyle = "rgba(0,0,0,0.86)";
  ctx.fillRect(0, 0, w, bar);
  ctx.fillStyle = GREEN;
  ctx.font = font(bar * 0.5);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("~/vinhack-2026 $ ./shoot --keep", w * 0.075, bar * 0.52);
  for (const [i, colour] of [RED, PINK, GREEN].entries()) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(w * 0.026 + i * bar * 0.34, bar * 0.52, bar * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = rule;
  ctx.strokeRect(rule / 2, rule / 2, w - rule, h - rule);
};

/* ------------------------------------------------------------- the scenes */

const grid: Backdrop["draw"] = (ctx, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#12021c");
  sky.addColorStop(0.52, "#3a0a2c");
  sky.addColorStop(0.55, "#0b0b12");
  sky.addColorStop(1, "#000000");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.55;
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(w / 2, horizon, Math.min(w, h) * 0.26, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(191, 234, 136, 0.55)";
  ctx.lineWidth = Math.min(w, h) * 0.004;
  // Verticals converge on the vanishing point; horizontals bunch towards it.
  // Both are the same trick and neither needs a projection matrix.
  for (let i = -14; i <= 14; i += 1) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + (i * w) / 12, h);
    ctx.lineTo(w / 2 + (i * w) / 90, horizon);
    ctx.stroke();
  }
  for (let i = 1; i <= 16; i += 1) {
    const y = horizon + (h - horizon) * (i / 16) ** 2.1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
};

const code: Backdrop["draw"] = (ctx, w, h) => {
  ctx.fillStyle = "#04070a";
  ctx.fillRect(0, 0, w, h);
  const next = shuffled(360024);
  const columns = 26;
  const step = w / columns;
  const size = step * 0.86;
  ctx.font = font(size);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const glyphs = "01<>{}[]/\\$#*+=;:VINHACK2026";
  for (let c = 0; c < columns; c += 1) {
    const head = next() * h;
    const run = 6 + Math.floor(next() * 12);
    for (let i = 0; i < run; i += 1) {
      const y = (head + i * size * 1.08) % (h + size);
      const fade = 1 - i / run;
      ctx.fillStyle = i === 0 ? WHITE : GREEN;
      ctx.globalAlpha = i === 0 ? 0.95 : 0.13 + fade * 0.55;
      ctx.fillText(
        glyphs[Math.floor(next() * glyphs.length)],
        step * (c + 0.5),
        y - size,
      );
    }
  }
  ctx.globalAlpha = 1;
};

const blocks: Backdrop["draw"] = (ctx, w, h) => {
  const palette = [BLUE, LILAC, CYAN, GREEN, PINK, RED];
  const columns = 5;
  const rows = 4;
  const next = shuffled(9182026);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      ctx.fillStyle = palette[Math.floor(next() * palette.length)];
      ctx.fillRect(
        (c * w) / columns,
        (r * h) / rows,
        w / columns + 1,
        h / rows + 1,
      );
    }
  }
  // One black band across the middle to sit a silhouette against — without it
  // a cut-out head lands on whichever colour happened to be behind it and the
  // edge disappears into it.
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, h * 0.3, w, h * 0.44);
  ctx.fillStyle = GREEN;
  ctx.font = font(h * 0.1);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VINHACK 2026", w / 2, h * 0.52);
};

export const BACKDROPS: readonly Backdrop[] = [
  { id: "tape", label: "TAPE", kind: "frame", draw: tape },
  { id: "ticker", label: "TICKER", kind: "frame", draw: ticker },
  { id: "confetti", label: "CONFETTI", kind: "frame", draw: confetti },
  { id: "terminal", label: "TERMINAL", kind: "frame", draw: terminal },
  { id: "grid", label: "GRID", kind: "scene", draw: grid },
  { id: "code", label: "CODE RAIN", kind: "scene", draw: code },
  { id: "blocks", label: "BLOCKS", kind: "scene", draw: blocks },
];

export const BACKDROP_BY_ID = new Map(BACKDROPS.map((item) => [item.id, item]));

export function backdropOf(id: string): Backdrop | null {
  return BACKDROP_BY_ID.get(id) ?? null;
}

/** Whether the chosen backdrop is one that needs somebody cut out of the
 *  picture. Asked before the segmenter is woken and before a mask is kept. */
export function needsMask(id: string): boolean {
  return backdropOf(id)?.kind === "scene";
}
