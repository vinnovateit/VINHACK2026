import type { CSSProperties } from "react";
import type { FeedOverlay } from "@/components/memories/filters";

/**
 * The half of a treatment a `filter` cannot do: scanlines, a chroma split and
 * a tear, laid over the picture rather than applied to it.
 *
 * Three named layers rather than one named look, because they are mixed
 * differently in different places. CRT is scanlines alone; GLITCH is the split
 * and the tear; the title screen wants the split and the scanlines and
 * emphatically not a bar sweeping down the page every few seconds.
 *
 * It goes over three different things — the live camera, the photo on the card
 * preview, and (redrawn by `paint.ts`) the saved PNG — so it takes no view on
 * what is underneath it. It is a stack of absolutely positioned gradients that
 * fills its parent, and the parent is whatever box the picture is in.
 *
 * `period` is the scanline pitch in the caller's own units. On the card that is
 * a card unit, because the preview sits inside one scaled box and CSS lengths
 * in there are card units already — which is the same reason every other figure
 * in the studio is one. In the booth it is a CSS pixel, because the camera
 * panel is not the card.
 *
 * Not a client component: no state, no handlers, and the animation is in
 * `globals.css` with the site's other CSS motion — see the `.fx-` block there.
 */
export default function FeedFx({
  overlays,
  period,
  className,
}: {
  overlays: readonly FeedOverlay[];
  period: number;
  className?: string;
}) {
  if (!overlays.length) return null;
  return (
    <span
      aria-hidden
      className={`fx pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ "--fx-period": `${period}px`, "--fx-ink": `${period / 3}px` } as CSSProperties}
    >
      {overlays.includes("scan") ? <span className="fx-scan" /> : null}
      {overlays.includes("chroma") ? <span className="fx-chroma" /> : null}
      {overlays.includes("tear") ? <span className="fx-tear" /> : null}
    </span>
  );
}
