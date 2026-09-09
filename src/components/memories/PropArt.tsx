"use client";

import { useEffect, useRef } from "react";
import { PROP_BY_ID, type Prop } from "@/components/memories/ar";

/**
 * One prop, drawn still — in the tray as a thumbnail, and on the card as the
 * piece the handles go round once the shutter has been.
 *
 * The same `draw` the live feed and the saved PNG use, which is the whole point
 * of a prop being a function rather than a file: what you pick in the tray, what
 * you wore in the camera, what you drag around afterwards and what lands in the
 * download are one piece of code at four sizes.
 *
 * `width` is in the caller's units — card units on the card, CSS pixels in the
 * tray — and the backing store is drawn at twice that so neither is soft. On the
 * card it is doubly safe: the whole card is scaled *down* from 1080 units to
 * whatever the column allows, so a canvas sized in card units is already being
 * asked for fewer pixels than it has.
 */

const DENSITY = 2;
const MAX = 1024;

export default function PropArt({
  prop,
  width,
  className,
}: {
  prop: Prop | string;
  width: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const piece = typeof prop === "string" ? PROP_BY_ID.get(prop) : prop;
  const height = piece ? width * piece.ratio : 0;

  useEffect(() => {
    const el = canvas.current;
    if (!el || !piece || !width) return;
    const backing = Math.min(MAX, Math.round(width * DENSITY));
    el.width = backing;
    el.height = Math.max(1, Math.round(backing * piece.ratio));
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, el.width, el.height);
    ctx.save();
    // The origin is the middle of the piece, and `draw` works in a box one
    // unit wide — see `ar.ts`.
    ctx.translate(el.width / 2, el.height / 2);
    ctx.scale(backing, backing);
    piece.draw(ctx);
    ctx.restore();
  }, [piece, width]);

  if (!piece) return null;
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={`block ${className ?? ""}`}
      style={{ width, height }}
    />
  );
}
