import { HERO } from "@/content/site";

/**
 * The hero's scroll cue: the LED disc with a pixel arrow falling through it,
 * and "scroll down for more" curving underneath.
 *
 * Lifted out of `sections/Hero.tsx` so the phone can have the same one. It used
 * to be written straight into the collage at plate coordinates (the disc at
 * 548, 550 and each letter at its own absolute offset in the 1280 x 832 hero);
 * everything here is the same drawing re-based onto its own 220.512 x 223 box,
 * so a caller places the box and the contents land where Figma put them.
 *
 * Both layouts tag the same roles — `disc`, `disc-arrow`, `scroll` — so
 * `HeroMotion` on the collage and `MobileMotion` on the phone each find what
 * they drive without knowing which tree they are in.
 */

/**
 * "scroll down for more", one rotated box per letter, exactly as Figma set it.
 *
 * The curve is not computable from anything — the design file placed and turned
 * each glyph by hand — so it is transcribed. `x` / `y` are the box's top-left in
 * the cue's own pixels (the plate offsets less 548, 550), `w` / `h` its size,
 * `r` its turn in degrees, and `iw` the width of the type box inside it, which
 * is what the outer box centres.
 *
 * Two of the twenty are spaces. They are kept as real entries because the
 * entrance lights the letters in sequence along the curve, and a gap in that
 * sequence is the space being read.
 */
const CURVE: { c: string; x: number; y: number; w: number; h: number; r: number; iw: number }[] = [
  { c: "s", x: 25.54, y: 183.53, w: 14.526, h: 15.075, r: 40.91, iw: 7.771 },
  { c: "c", x: 31.42, y: 188.55, w: 14.9, h: 15.668, r: 38.31, iw: 8.55 },
  { c: "r", x: 38.13, y: 192.66, w: 12.346, h: 14.04, r: 35.85, iw: 5.686 },
  { c: "o", x: 42.72, y: 196.58, w: 14.569, h: 15.86, r: 33.14, iw: 8.773 },
  { c: "l", x: 50.09, y: 199.68, w: 9.768, h: 13.158, r: 30.69, iw: 3.518 },
  { c: "l", x: 53.07, y: 201.32, w: 9.524, h: 13.248, r: 29.24, iw: 3.518 },
  { c: " ", x: 56.17, y: 203.1, w: 9.921, h: 13.702, r: 27.55, iw: 4.297 },
  { c: "d", x: 59.96, y: 205.84, w: 13.521, h: 15.685, r: 24.63, iw: 8.816 },
  { c: "o", x: 67.97, y: 209.04, w: 12.852, h: 15.452, r: 20.55, iw: 8.773 },
  { c: "w", x: 76.15, y: 211.96, w: 14.291, h: 15.739, r: 15.79, iw: 11.115 },
  { c: "n", x: 86.87, y: 214.09, w: 10.638, h: 14.555, r: 11.11, iw: 8.245 },
  { c: " ", x: 94.95, y: 215.07, w: 6.124, h: 13.688, r: 8.14, iw: 4.297 },
  { c: "f", x: 99.21, y: 215.64, w: 6.903, h: 13.713, r: 5.83, iw: 5.589 },
  { c: "o", x: 104.76, y: 216.14, w: 9.364, h: 13.598, r: 2.6, iw: 8.773 },
  { c: "r", x: 113.4, y: 216.26, w: 6.073, h: 13.27, r: -0.55, iw: 5.947 },
  { c: " ", x: 118.86, y: 216.13, w: 4.899, h: 13.396, r: -2.63, iw: 4.297 },
  { c: "m", x: 122.41, y: 215.52, w: 14.064, h: 14.451, r: -5.87, iw: 12.779 },
  { c: "o", x: 134.25, y: 214.13, w: 10.844, h: 14.486, r: -9.55, iw: 8.773 },
  { c: "r", x: 142.47, y: 212.82, w: 8.268, h: 14.097, r: -11.8, iw: 5.686 },
  { c: "e", x: 147.5, y: 211.29, w: 11.649, h: 14.919, r: -13.81, iw: 8.749 },
];

/** The cue's own box, for callers placing or scaling it. */
export const SCROLL_CUE = { width: 220.512, height: 223 };

/** Where the dark cells of the LED grid sit, as `left` and the `top` of the
 *  first cell in that column. Each column is seven cells on a 26.46px stride,
 *  which is what the design draws and what `CELL` in `HeroMotion` steps by. */
const COLUMNS = [-5.67, 20.79, 47.25, 73.71, 100.17, 126.63, 153.09];
const COLUMN_TOP: Record<number, number> = {
  [-5.67]: -28.35,
  [153.09]: -32.13,
};

/** The nine lit cells that spell the arrow, over a grid that is otherwise
 *  entirely dark. Light green for the head and shaft, darker for the trailing
 *  pixels — the design's own two greens. */
const ARROW = [
  { left: 73.71, top: 20.79, fill: "#00d753" },
  { left: 73.71, top: 47.25, fill: "#00d753" },
  { left: 73.71, top: 73.71, fill: "#00d753" },
  { left: 73.71, top: 100.17, fill: "#00d753" },
  { left: 73.71, top: 126.63, fill: "#00a335" },
  { left: 47.25, top: 100.17, fill: "#00d753" },
  { left: 100.17, top: 100.17, fill: "#00a335" },
  { left: 20.79, top: 73.71, fill: "#00a335" },
  { left: 126.63, top: 73.71, fill: "#00a335" },
];

export default function ScrollCue({ label = HERO.scroll }: { label?: string }) {
  return (
    /* Transparent to the pointer as a whole, so the box does not sit over the
       wordmark above it and swallow the hover; the disc inside takes its own
       events back. */
    <div className="pointer-events-none relative size-full">
      {/* The lit cells of this grid spell a pixel arrow pointing down, and
          "scroll down for more" curves along underneath it — so the disc is not
          decoration, it is the page's scroll cue. It is wired as a real control
          by whichever motion module owns the tree: clicking or entering it takes
          you to what's below. The nine green cells carry `disc-arrow` and are
          the only things that move; the disc itself holds still.

          `role` rather than a `<button>`: the collage is a Figma export of
          nested transformed boxes and a button would bring its own box model
          into the middle of that. */}
      <div className="pointer-events-auto absolute top-0 left-0 flex size-[220.512px] cursor-pointer items-center justify-center" data-hero="disc" data-node-id="343:1194" role="button" tabIndex={0} aria-label={label}>
        <div className="-scale-y-100 flex-none rotate-[165.86deg]">
          <div className="relative size-[181.65px] overflow-clip rounded-[3150px] bg-[#bfea88]">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[calc(50%+0.37px)] left-[calc(50%+0.37px)] size-[169.785px] overflow-clip rounded-[3150px] bg-[#274135]" data-node-id="343:1195">
              {COLUMNS.map((left) => {
                const top = COLUMN_TOP[left] ?? -5.67;
                return Array.from({ length: 7 }, (_, row) => (
                  <div
                    key={`${left}:${row}`}
                    className="absolute size-[22.68px] rounded-[4.725px] bg-[#171918]"
                    style={{ left, top: top + row * 26.46 }}
                  />
                ));
              })}
              {/* The arrow, on its own layer over a grid that is now complete
                  and entirely unlit.

                  These nine used to *be* nine of the grid's cells, which is why
                  the disc had a hole in it: the cells the arrow travelled out of
                  were not dimmed, they were gone, so a nine-cell gap of bare
                  disc moved up the face behind it. The grid keeps its dark cell
                  at every position now and the arrow rides above them. */}
              <div className="absolute contents" data-name="arrow">
                {ARROW.map((cell) => (
                  <div
                    key={`${cell.left}:${cell.top}`}
                    className="absolute size-[22.68px] rounded-[4.725px]"
                    style={{ left: cell.left, top: cell.top, background: cell.fill }}
                    data-hero="disc-arrow"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute contents" data-hero="scroll" data-node-id="343:1521">
        {CURVE.map((glyph, i) => (
          <div
            key={`${glyph.c}${i}`}
            className="-translate-y-1/2 absolute flex items-center justify-center"
            style={{ left: glyph.x, top: glyph.y, width: glyph.w, height: glyph.h }}
          >
            <div className="flex-none" style={{ transform: `rotate(${glyph.r}deg)` }}>
              <div
                className="relative flex h-[13.213px] flex-col justify-center font-rotonto text-[13.213px] leading-[0] text-white"
                style={{ width: glyph.iw }}
              >
                <p className="leading-[normal]">{glyph.c === " " ? " " : glyph.c}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
