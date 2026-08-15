import { WHO_ARE_WE } from "@/content/site";

/**
 * Where each of the eight notes is pinned, in the order `WHO_ARE_WE.taglines`
 * lists them — four scattered down the left of the panel, four down the right.
 * Every one is centred on its `left`, which is what the `-translate-x-1/2` on
 * the elements below does; the widths are the wraps Figma set.
 */
const NOTES = [
  { id: "297:318", left: 241, top: 253, width: 230 },
  { id: "297:319", left: 103, top: 392, width: 206 },
  { id: "297:320", left: 283.5, top: 549, width: 215 },
  { id: "297:321", left: 205.5, top: 706, width: 263 },
  { id: "297:322", left: 1017.5, top: 283, width: 263 },
  { id: "297:323", left: 1166, top: 402, width: 228 },
  { id: "297:324", left: 1107.5, top: 549, width: 267 },
  { id: "297:325", left: 1017.5, top: 662, width: 249 },
];

export default function WhoAreWeSection() {
  return (
    <section aria-label="Who are we" className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-clip top-[1664px] w-[1280px]" data-node-id="297:312" data-name="WHO ARE WE">
      <div className="[word-break:break-word] absolute content-stretch flex font-rotonto gap-[97px] items-center leading-[normal] left-[-41px] not-italic text-[#bfea88] text-[150px] text-center top-[61px] whitespace-nowrap" data-marquee="who" data-node-id="297:313">
        <h2 className="relative shrink-0" data-node-id="297:314">
          {WHO_ARE_WE.heading}
        </h2>
        <p aria-hidden className="relative shrink-0" data-node-id="297:315">
          {WHO_ARE_WE.heading}
        </p>
        <p aria-hidden className="relative shrink-0">
          {WHO_ARE_WE.heading}
        </p>
      </div>
      <div className="-translate-x-1/2 absolute bg-[#d9d9d9] h-[603px] left-[calc(50%+0.5px)] opacity-75 top-[169px] w-[459px]" data-node-id="297:316" />
      <div className="[word-break:break-word] absolute contents font-rotonto leading-[normal] left-0 not-italic text-[#bfea88] text-[18px] text-center top-[253px]" data-node-id="297:317">
        {WHO_ARE_WE.taglines.map((line, i) => {
          const { id, ...box } = NOTES[i];
          return (
            <p
              key={line}
              className="-translate-x-1/2 absolute"
              style={box}
              data-node-id={id}
            >
              {line}
            </p>
          );
        })}
      </div>
      <div className="absolute bg-black h-[76px] left-[491px] overflow-clip top-[670px] w-[298px]" data-node-id="297:326">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-rotonto leading-[normal] left-[149px] not-italic text-[#bfea88] text-[28px] text-center top-[21px] whitespace-nowrap" data-node-id="297:327">
          {WHO_ARE_WE.connect}
        </p>
      </div>
    </section>
  );
}
