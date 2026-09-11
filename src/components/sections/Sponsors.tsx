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
 * The heading as it is *drawn* — red on the black, standfirst left, title
 * right — belongs to `FoldedEdition`, because it is held on screen with the
 * paper and fitted to the window with it rather than scrolling past above it.
 *
 * The sheet is printed at the size it was drawn. It used to be fitted into a
 * 1006px column at 0.85, which took the broadsheet's 14px newsprint down to
 * 12px and left the three text columns and the four-supporter rail fighting
 * over boxes that were never redrawn for it — the sheet is a fixed layout, so
 * shrinking the paper shrinks the type without giving any of it more room. At
 * 1:1 the 1184 x 758.4 sheet still clears the 1280 plate on both sides and
 * still fits the section's 840px with the top padding on, and every column is
 * set at the size the design actually specifies.
 */
export default function SponsorsSection() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="-translate-x-1/2 absolute bg-black h-[1540px] left-1/2 top-[4710px] w-[1280px] flex flex-col items-center justify-start pt-3 overflow-visible z-10"
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
        className="relative flex w-[1184px] shrink-0 justify-center"
        style={{ height: EDITION_BLOCK_HEIGHT }}
      >
        <FoldedEdition />
      </div>
    </section>
  );
}
