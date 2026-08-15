import { PROJECTS } from "@/content/site";

/**
 * Where each card sits on the collage, in paint order — the largest goes down
 * first and ATLAS lands on top, which is the overlap the design draws.
 *
 * `nudge` is half the label's own width: Figma centres the text by offsetting
 * it from the card's midpoint rather than by centring a box, and the number is
 * particular to the string, so it travels with the layout rather than with the
 * name. `rise` is the matching vertical offset, half the line box.
 */
const CARDS = [
  { name: "MESSIT", id: "297:302", label: "297:303", left: 948, top: 307, width: 318, height: 364, nudge: 69, rise: 14 },
  { name: "LATCH", id: "297:304", label: "297:305", left: 729, top: 413, width: 219, height: 252, nudge: 59.5, rise: 14 },
  { name: "STUDYHUB", id: "297:306", label: "297:307", left: 289, top: 237, width: 440, height: 503, nudge: 102, rise: 13.5 },
  { name: "ATLAS", id: "297:308", label: "297:309", left: 14, top: 286, width: 275, height: 314, nudge: 57.5, rise: 14 },
];

export default function ProjectsSection() {
  const colour = new Map<string, string>(
    PROJECTS.cards.map((card) => [card.name, card.bg]),
  );

  return (
    <section aria-label="Projects" className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-clip top-[2496px] w-[1280px]" data-node-id="297:300" data-name="PROJECTS">
      <div className="absolute contents left-[14px] top-[237px]" data-node-id="297:301">
        {CARDS.map((card) => (
          <div
            key={card.name}
            className="absolute overflow-clip"
            style={{
              background: colour.get(card.name),
              left: card.left,
              top: card.top,
              width: card.width,
              height: card.height,
            }}
            data-card
            data-node-id={card.id}
            data-name={card.name}
          >
            <p
              className="[word-break:break-word] absolute font-rotonto leading-[28px] not-italic text-[36px] text-black whitespace-nowrap"
              style={{
                left: `calc(50% - ${card.nudge}px)`,
                top: `calc(50% - ${card.rise}px)`,
              }}
              data-node-id={card.label}
            >
              {card.name}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute h-0 left-[209.99px] right-[13.99px] top-[171.5px]" data-node-id="297:310">
        <div className="absolute inset-[-1px_0_0_0]">
          <img alt="" className="block max-w-none size-full" src="/figma/line4.svg" />
        </div>
      </div>
      <h2 className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[210px] not-italic text-[#fa1a1d] text-[20px] top-[140px] whitespace-nowrap" data-node-id="297:311">{PROJECTS.heading}</h2>
    </section>
  );
}
