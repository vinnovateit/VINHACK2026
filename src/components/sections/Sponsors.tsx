"use client";

import FoldedEdition, {
  EDITION_BLOCK_HEIGHT,
} from "./sponsors/FoldedEdition";
import { SPONSOR_HEADING } from "./sponsors/copy";
import { useInView } from "@/components/useInView";

/**
 * The collage's sponsor section.
 *
 * All that is here is the frame: the section's place on the canvas, and the
 * heading given plainly for anything that is not going to watch an animation.
 * The paper is held on screen and fitted to the window with it.
 *
 * The sheet is printed at the size it was drawn (1184 x 860). At 1:1 the sheet
 * clears the 1280 plate on both sides and every column is set at the size the
 * design specifies.
 */
export default function SponsorsSection({
  variant = "canvas",
}: {
  variant?: "canvas" | "flow";
} = {}) {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className={
        variant === "flow"
          ? "relative w-full bg-black flex flex-col items-center justify-start overflow-visible z-10"
          : "-translate-x-1/2 absolute bg-black h-[1340px] left-1/2 top-[4710px] w-[1280px] flex flex-col items-center justify-start pt-3 overflow-visible z-10"
      }
      data-name="SPONSORS"
    >
      {/* The paper spells this out over the course of a scroll; a screen reader
          should not have to wait for it. */}
      <h2 className="sr-only">
        {SPONSOR_HEADING.title} — {SPONSOR_HEADING.tagline}
      </h2>

      {/* Exactly what `FoldedEdition` draws — the heading band, the gap, and
          the sheet — so the section reserves the space the artwork occupies
          rather than the sheet's height alone. The width is the sheet's own,
          which is what the edition measures its scale against. */}
      <div
        className={
          variant === "flow"
            ? "relative flex w-full justify-center overflow-visible"
            : "relative flex w-[1184px] shrink-0 justify-center"
        }
        style={{ height: variant === "flow" ? undefined : EDITION_BLOCK_HEIGHT }}
      >
        <FoldedEdition variant={variant} />
      </div>
    </section>
  );
}
