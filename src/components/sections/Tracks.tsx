import { TRACKS } from "@/content/site";
import TracksCardDeck from "@/components/tracks/TracksCardDeck";

export default function TracksSection() {
  return (
    <section
      aria-label="Tracks"
      className="-translate-x-1/2 absolute bg-black h-[2900px] left-1/2 top-[3342px] w-[1280px]"
      data-node-id="594:33"
      data-name="TRACKS"
    >
      {/* The section is drawn far taller than the artwork on it: everything
          past the first screenful is scrolling room for `TracksCardDeck`, which
          parks this whole stage and deals one card per stretch of it. See the
          note at the top of that file, and `--canvas-height` in globals.css,
          which carries the same surplus.

          The heading is passed *into* the deck rather than sitting beside it,
          because it parks too — it is on screen for every card, and the band it
          leaves underneath is what the focused card is sized against. */}
      <TracksCardDeck>
        {/* Header text and lines. */}
        <div
          className="-translate-x-1/2 absolute h-[298px] left-[calc(50%-0.32px)] top-[99px] w-[1155.364px]"
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

          {/* Sticker */}
          <div
            className="absolute contents left-[866px] top-[33px]"
            data-node-id="594:50"
          >
            <div
              className="absolute h-[211.237px] left-[866px] top-[33px] w-[270.424px]"
              data-node-id="594:51"
              data-name="Union"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src="/figma/union6.svg"
              />
            </div>
            <div
              className="-translate-x-1/2 absolute flex h-[94.349px] items-center justify-center left-[1001.54px] top-[90.96px] w-[248.313px]"
              data-node-id="594:56"
            >
              <div className="flex-none rotate-[-8.3deg]">
                <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative text-[#2849cb] text-[24.84px] text-center w-[242.187px]">
                  {TRACKS.sticker}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TracksCardDeck>
    </section>
  );
}
