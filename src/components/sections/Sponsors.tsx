"use client";

import FoldedEdition from "./sponsors/FoldedEdition";
import { SPONSOR_HEADING } from "./sponsors/copy";
import { useInView } from "@/components/useInView";

/**
 * The collage's sponsor section.
 *
 * There is no header row above the paper any more. The section's title and its
 * standfirst are printed on the folded newspaper itself and travel up into it
 * as it opens — see `FoldedEdition`, which owns the whole movement. All that is
 * left here is the frame: the section's place on the canvas, and the heading
 * given plainly for anything that is not going to watch an animation.
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
      className="-translate-x-1/2 absolute bg-black h-[840px] left-1/2 top-[4710px] w-[1280px] flex flex-col items-center justify-start pt-3 overflow-visible z-10"
      data-name="SPONSORS"
    >
      {/* The paper spells this out over the course of a scroll; a screen reader
          should not have to wait for it. */}
      <h2 className="sr-only">
        {SPONSOR_HEADING.title} — {SPONSOR_HEADING.tagline}
      </h2>

      <div className="w-[1184px] h-[758.4px] relative flex justify-center shrink-0">
        <FoldedEdition />
      </div>
    </section>
  );
}
