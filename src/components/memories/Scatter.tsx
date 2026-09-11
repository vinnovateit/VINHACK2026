"use client";

import type { CSSProperties } from "react";
import StickerArt from "@/components/memories/StickerArt";
import { BY_ID } from "@/components/memories/stickers";

/**
 * The stickers loose on the first screen of `/memories` — the tray's own pieces,
 * pinned round the title instead of onto a card.
 *
 * They are decoration and they say so: `aria-hidden`, no handlers, nothing to
 * tap. That is the whole point of putting them here rather than the carousel.
 * The first screen is the title, a line about what the page is for and the way
 * in; the tray and the camera are the screen after it, where there is a picture
 * for a sticker to go on. Showing the pieces early is a promise, not a control.
 *
 * The scatter is a table rather than a random draw, for the same reason the
 * studio's own scatter is: two people opening the page see the same wall, and
 * nothing rearranges itself under a re-render.
 *
 * Positions are percentages of the block the title sits in, so the arrangement
 * holds its shape as the column narrows; sizes are fixed, so a sticker does not
 * shrink to a smudge on the way down. What gives instead is the count — the
 * pieces that would land on top of the words at phone width are simply not
 * drawn there, and the ones in the corners are.
 */

type Pinned = {
  /** A sticker id from the tray. */
  id: string;
  /** Percentages of the scatter's box, to the centre of the piece. */
  left: number;
  top: number;
  /** Drawn width, in CSS pixels. */
  size: number;
  /** Where it was pinned at. */
  rotate: number;
  /** Seconds into the drift it starts, so nine pieces do not breathe together. */
  delay: number;
  /** Tailwind that hides it on the widths it would land on the words at. */
  at?: string;
};

const SCATTER: readonly Pinned[] = [
  { id: "star", left: 5, top: 7, size: 60, rotate: -16, delay: 0 },
  { id: "pushpin", left: 94, top: 4, size: 56, rotate: 13, delay: 1.4, at: "hidden sm:block" },
  { id: "pin", left: 13, top: 30, size: 52, rotate: 15, delay: 2.6, at: "hidden lg:block" },
  { id: "hello", left: 72, top: 12, size: 124, rotate: -7, delay: 0.8, at: "hidden lg:block" },
  { id: "curious", left: 1, top: 52, size: 122, rotate: -9, delay: 2, at: "hidden md:block" },
  { id: "impact", left: 97, top: 47, size: 126, rotate: 10, delay: 3.2, at: "hidden md:block" },
  { id: "heart", left: 11, top: 86, size: 76, rotate: 9, delay: 1.1 },
  { id: "repeat", left: 87, top: 87, size: 82, rotate: -12, delay: 2.3 },
  { id: "doodle", left: 49, top: 93, size: 70, rotate: 7, delay: 3.6, at: "hidden sm:block" },
];

export default function Scatter({ measured }: { measured: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
      {SCATTER.map((pin) => {
        const sticker = BY_ID.get(pin.id);
        if (!sticker) return null;
        return (
          <span
            key={pin.id}
            data-memories-appear="scatter"
            className={`absolute block ${pin.at ?? ""}`}
            style={{
              left: `${pin.left}%`,
              top: `${pin.top}%`,
              // The centring lives out here and the drift lives inside, because
              // the animation owns `transform` on the element it runs on and
              // would throw this away.
              transform: "translate(-50%, -50%)",
            }}
          >
            <span
              className="sticker-drift block opacity-80"
              style={
                {
                  "--r": `${pin.rotate}deg`,
                  animationDelay: `${pin.delay}s`,
                } as CSSProperties
              }
            >
              <StickerArt sticker={sticker} width={pin.size} measured={measured} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
