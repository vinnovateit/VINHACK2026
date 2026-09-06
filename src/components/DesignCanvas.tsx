import type { ReactNode } from "react";

/**
 * The Figma frame this page is drawn against (node 297:2, "FINAL"): a fixed
 * 1280 x 8834 collage, rendered 9250 tall — the one place the page departs from
 * the file is the gap opened between Rules and Guidelines, and everything below
 * Rules carries its Figma top plus that 416 (see `--canvas-height`). Sections
 * overlap and every element sits at an exact pixel offset, so there is no
 * meaningful reflow — the canvas is scaled as a whole instead.
 *
 * It is split into two independently scaled halves (see `.canvas-frame` and
 * below it in globals.css):
 *
 *   hero    drawn 1:1 and centred, never enlarged past its native 1280px, so
 *           the collage keeps the proportions it was designed at
 *   body    scaled to fill the viewport at any width, so the full-bleed
 *           sections still run to both screen edges
 *
 * The split is why `hero` is a prop rather than just the first child: the two
 * halves live in different frames. Body sections keep the `top` values Figma
 * gave them — measured from the top of the whole frame — and `.body-sheet`
 * absorbs the offset.
 *
 * The scaling is pure CSS, so it is correct in the server-rendered HTML with
 * no hydration step and no resize handler.
 */
export default function DesignCanvas({
  hero,
  children,
}: {
  hero: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="canvas-container bg-black">
      <div className="canvas-frame hero-frame">
        <div className="canvas-plate bg-black">{hero}</div>
      </div>
      <div className="canvas-frame body-frame">
        {/* `canvas` is also what PageMotion measures to undo the scaling on
            its marquees, so it belongs on the plate that actually holds them. */}
        <div className="canvas-plate canvas bg-black">
          <div className="body-sheet">{children}</div>
        </div>
      </div>
    </div>
  );
}
