import { TRACKS } from "@/content/site";
import TracksCardDeck from "@/components/tracks/TracksCardDeck";

export default function TracksSection() {
  return (
    <section
      aria-label="Tracks"
      className="-translate-x-1/2 absolute bg-black h-[3600px] left-1/2 top-[3342px] w-[1280px]"
      style={{ overflowAnchor: "none" }}
      data-node-id="594:33"
      data-name="TRACKS"
    >
      {/* The section is drawn far taller than the artwork on it: everything
          past the first screenful is scrolling room for `TracksCardDeck`, which
          parks over that stretch and deals one card per screenful of it. See
          the note at the top of that file, and `--canvas-height` in
          globals.css, which carries the same surplus.

          The deck is drawn first and the heading after it, so the heading
          passes over the piles on its way out rather than under them. */}
      <TracksCardDeck />

      {/* Header text and lines.

          An ordinary child of the section, so it scrolls away with the page
          the way everything else on the collage does. It used to be handed to
          the deck and parked alongside it, which held it on screen for the
          whole run at the cost of a third of the window — the deck rises into
          the space it leaves instead. `HEADER_BOTTOM` in the deck is this
          block's own bottom edge, and the hand-over is timed off it. */}
      <div
        className="-translate-x-1/2 absolute z-10 h-[298px] left-[calc(50%-0.32px)] top-[99px] w-[1155.364px]"
        data-node-id="594:34"
        data-tracks-header
      >
        <div
          className="absolute h-[298px] left-0 top-0 w-[819.022px]"
          data-node-id="594:35"
        >
          <div
            className="absolute content-stretch flex gap-[20px] items-center left-0 top-0"
            data-node-id="594:36"
          >
            <p
              className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[#fa1a1d] text-[55px] whitespace-nowrap"
              data-node-id="594:37"
            >
              {TRACKS.lines[0]}
            </p>
            <div
              className="h-[45px] relative shrink-0 w-[46px]"
              data-node-id="594:38"
              aria-hidden
            >
              <svg
                viewBox="0 0 46 45"
                fill="none"
                className="absolute inset-0 size-full block"
              >
                <path
                  d="M0 22.5H46M23 0V45M2.5 14L44 31.5M44 14L2.5 31.5M7.5 6.5L39 39M14.5 1.5L32 43M32 1.5L14.5 43M39 6.5L7.5 39"
                  stroke="#FA1A1D"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div
            className="absolute h-px left-0 w-[819.022px] top-[86px] bg-[#fa1a1d]"
            data-node-id="594:39"
            aria-hidden
          />
          <div
            className="absolute content-stretch flex gap-[20px] items-center left-[500px] top-[106px]"
            data-node-id="594:40"
          >
            <h2
              className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[#fa1a1d] text-[55px] whitespace-nowrap"
              data-node-id="594:41"
            >
              {TRACKS.lines[1]}
            </h2>
            <div
              className="relative shrink-0 size-[60px]"
              data-node-id="594:42"
              aria-hidden
            >
              <svg
                viewBox="0 0 60 60"
                fill="none"
                className="absolute inset-0 size-full block"
              >
                <circle cx="30" cy="30" r="28.5" stroke="#FA1A1D" strokeWidth="3" />
                <path
                  d="M13.5 26L22 31M20 14.5L28.5 20M18 47.5C18 47.5 29.212 42.2348 35.5 37.5C41.5674 32.9313 50 23 50 23"
                  stroke="#FA1A1D"
                  strokeWidth="5"
                />
              </svg>
            </div>
          </div>
          <div
            className="absolute h-px left-0 w-[819.022px] top-[192px] bg-[#fa1a1d]"
            data-node-id="594:45"
            aria-hidden
          />
          <div
            className="absolute content-stretch flex gap-[20px] items-center left-[250px] top-[212px]"
            data-node-id="594:46"
          >
            <p
              className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[#fa1a1d] text-[55px] whitespace-nowrap"
              data-node-id="594:47"
            >
              {TRACKS.lines[2]}
            </p>
            <div
              className="h-[44.5px] relative shrink-0 w-[40.21px]"
              data-node-id="594:48"
              data-name="star 2"
              aria-hidden
            >
              <svg
                viewBox="0 0 40.2117 44.5"
                fill="none"
                className="block size-full"
              >
                <path
                  d="M20.325 19V0M23.825 21L38.825 11M23.825 24.5L38.825 33.5M20.325 26.5V44.5M17.325 24.5L1.325 33.5M17.325 21L1.325 11"
                  stroke="#FA1A1D"
                  strokeWidth="5"
                />
              </svg>
            </div>
          </div>
          <div
            className="absolute h-px left-0 w-[819.022px] top-[298px] bg-[#fa1a1d]"
            data-node-id="594:49"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
