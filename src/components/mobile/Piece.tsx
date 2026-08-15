import type { CSSProperties, ReactNode } from "react";

/**
 * A drawing from the design file, dropped in at its own size and scaled to fit
 * the column.
 *
 * The collage's stickers, folders and speech bubbles are each a small collage
 * in their own right — a dozen boxes at exact offsets and exact angles, with
 * type set into them. There is no reflowed version of a sticker: rotating type
 * inside a rounded blob either is that drawing or is a different one. So on the
 * phone they are kept whole and scaled, while everything around them reflows.
 *
 * `width` and `height` are the artwork's size in the Figma frame; children are
 * positioned against that box exactly as they are on the collage. `max` caps
 * the scale so a piece is never enlarged past the size it was drawn at — on a
 * wide phone the column outgrows the smaller stickers, and blowing them up
 * would only soften them.
 *
 * A piece fills its parent and centres the drawing inside itself. To make one
 * narrower, pass a `max-width` through `className` — never a shrink-to-fit
 * context, which collapses it (see `.piece` in globals.css for why).
 *
 * See `.piece` in globals.css for the scaling itself.
 */
export default function Piece({
  width,
  height,
  max = 1,
  className,
  children,
}: {
  width: number;
  height: number;
  max?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className ? `piece ${className}` : "piece"}>
      <div
        className="piece-frame"
        style={
          {
            "--piece-w": `${width}px`,
            "--piece-h": `${height}px`,
            "--piece-max": max,
          } as CSSProperties
        }
      >
        <div className="piece-plate">{children}</div>
      </div>
    </div>
  );
}
