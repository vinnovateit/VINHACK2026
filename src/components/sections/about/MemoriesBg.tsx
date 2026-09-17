import type { FC } from "react";
import { SNEAK_PEEK } from "@/content/site";

/** One tall stack of the two lines, repeated to run the full height of the
 *  section — the unit `marquee()` (see `motion/recipes.ts`) clones
 *  sideways to fill the row, so the whole background reads as a tiled grid
 *  scrolling left. */
function Column() {
  return (
    <div className="flex flex-col shrink-0 px-[40px]">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i}>{SNEAK_PEEK.lines[i % SNEAK_PEEK.lines.length]}</div>
      ))}
    </div>
  );
}

/**
 * The About section's background: what used to be two static columns of
 * "SNEAK PEEK / VINHACK '26" is now the same text endlessly scrolling left,
 * driven by `PageMotion`'s `marquee()` recipe via `data-marquee="sneak"` —
 * the same mechanism the footer's own marquee uses. Two columns are authored
 * so the row is never empty before the recipe clones more to fill the frame.
 */
const MEMORIES: FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-hidden text-left font-rotonto font-light text-[118px] leading-[132px] text-[#041a21] whitespace-nowrap pointer-events-none select-none z-0 bg-transparent"
    >
      <div className="absolute inset-0 flex items-stretch" data-marquee="sneak">
        <Column />
        <Column />
      </div>
    </div>
  );
};

export default MEMORIES;
