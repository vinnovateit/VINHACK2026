import type { ReactNode } from "react";

/**
 * The Figma frame this page is drawn against (node 297:2, "FINAL"): a fixed
 * 1280 x 8834 collage. Sections overlap and every element sits at an exact
 * pixel offset, so there is no meaningful reflow — the canvas is instead
 * scaled as a whole to the viewport width, up as well as down, keeping the
 * full-bleed sections running to the screen edge at any size.
 *
 * The scaling is pure CSS (see `.canvas-frame` in globals.css), so it is
 * correct in the server-rendered HTML with no hydration step and no resize
 * handler.
 */
export default function DesignCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="canvas-container bg-black">
      <div className="canvas-frame">
        <div className="canvas relative bg-black">{children}</div>
      </div>
    </div>
  );
}
