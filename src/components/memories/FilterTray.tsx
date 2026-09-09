"use client";

import FeedFx from "@/components/memories/FeedFx";
import {
  CHIP_ART,
  SCAN,
  TREATMENTS,
  type Treatment,
} from "@/components/memories/filters";

/**
 * The filter row.
 *
 * Two shapes, and the second one is the whole reason this is a component rather
 * than a loop in the studio. On a phone the chips lie in one line under the
 * thumb, the way they do in every camera app anybody has actually used, and a
 * thumb drags that line sideways without being told it can. On a desktop that
 * same line is a trap: there is no thumb, a wheel scrolls the page rather than
 * the row, and the treatments past the right edge are simply unreachable. So
 * above `md` the row stops being a row — it wraps and centres, every chip on
 * screen at once, and there is nothing left to scroll.
 *
 * One chip is lit at a time. `STRAIGHT` is a chip like any other rather than a
 * clear button, so the unfiltered picture is somewhere you land rather than
 * something you undo.
 *
 * A chip shows its own treatment doing its own job: one fixed strip of the
 * site's palette with the chip's filter over it and, where the treatment is a
 * painted one, the same overlay the picture gets. So CRT's chip is scanlined
 * and GLITCH's chip is torn, and nothing in the row is a drawing of what a
 * filter might do.
 */
export default function FilterTray({
  active,
  onPick,
  className,
}: {
  active: string;
  onPick: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-[9px] overflow-x-auto px-[14px] pb-[2px] [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-x-visible [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
    >
      {TREATMENTS.map((treatment) => (
        <Chip
          key={treatment.id}
          treatment={treatment}
          on={active === treatment.id}
          onPick={() => onPick(treatment.id)}
        />
      ))}
    </div>
  );
}

function Chip({
  treatment,
  on,
  onPick,
}: {
  treatment: Treatment;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className="flex shrink-0 flex-col items-center gap-[4px]"
    >
      <span
        className={`relative block size-[46px] overflow-hidden rounded-full transition-[box-shadow,transform] duration-150 hover:scale-105 ${
          on ? "shadow-[0_0_0_2px_#000,0_0_0_4px_#bfea88]" : "shadow-[0_0_0_1px_#3a3a3a]"
        }`}
      >
        <span
          aria-hidden
          className="absolute inset-0 block"
          style={{ background: CHIP_ART, filter: treatment.css }}
        />
        {/* Over the filtered swatch rather than inside it, which is where the
            picture gets its overlay too — see the note in `MemoriesStudio`. */}
        <FeedFx overlays={treatment.overlay ?? []} period={SCAN.booth} />
      </span>
      <span
        className={`text-[10px] tracking-[1px] transition-colors ${
          on ? "text-[#bfea88]" : "text-[#a8a2a2]"
        }`}
      >
        {treatment.label}
      </span>
    </button>
  );
}
