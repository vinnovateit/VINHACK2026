import { TRACKS } from "@/content/site";
import TracksCardDeck from "@/components/tracks/TracksCardDeck";

export default function TracksSection() {
  return (
    <section
      aria-label="Tracks"
      className="-translate-x-1/2 absolute bg-black h-[3600px] left-1/2 top-[3342px] w-[1280px]"
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
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src="/figma/vector32.svg"
              />
            </div>
          </div>
          <div
            className="absolute h-0 left-0 right-0 top-[86px]"
            data-node-id="594:39"
          >
            <div className="absolute inset-[-1px_0_0_0]">
              <img
                alt=""
                className="block max-w-none size-full"
                src="/figma/line1.svg"
              />
            </div>
          </div>
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
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src="/figma/group48095496.svg"
              />
            </div>
          </div>
          <div
            className="absolute h-0 left-0 right-0 top-[192px]"
            data-node-id="594:45"
          >
            <div className="absolute inset-[-1px_0_0_0]">
              <img
                alt=""
                className="block max-w-none size-full"
                src="/figma/line1.svg"
              />
            </div>
          </div>
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
              className="h-[44.5px] relative shrink-0 w-[37.5px]"
              data-node-id="594:48"
              data-name="star 2"
            >
              <div className="absolute inset-[0_-3.7%_0_-3.53%]">
                <img
                  alt=""
                  className="block max-w-none size-full"
                  src="/figma/star2.svg"
                />
              </div>
            </div>
          </div>
          <div
            className="absolute h-0 left-0 right-0 top-[298px]"
            data-node-id="594:49"
          >
            <div className="absolute inset-[-1px_0_0_0]">
              <img
                alt=""
                className="block max-w-none size-full"
                src="/figma/line1.svg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
