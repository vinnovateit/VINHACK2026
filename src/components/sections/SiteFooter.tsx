import { FOOTER } from "@/content/site";

/**
 * Where each tab's label sits on the exposed lip of its band, in paint order.
 * The bands themselves are full-width artwork stacked below, so the label is
 * the only part of a tab that is in a particular place. Centred on `left`.
 */
const LABELS = [
  { tab: "INSTAGRAM", id: "297:23", left: 657, top: 198 },
  { tab: "LINKEDIN", id: "297:24", left: 1091.5, top: 237 },
  { tab: "EMAIL", id: "297:25", left: 972, top: 127 },
  { tab: "MEDIUM", id: "297:26", left: 357.5, top: 275 },
  { tab: "GITHUB", id: "297:27", left: 251.5, top: 164 },
];

export default function SiteFooter() {
  const colour = new Map<string, string>(
    FOOTER.tabs.map((tab) => [tab.name, tab.color]),
  );

  return (
    <footer className="-translate-x-1/2 absolute bg-black h-[826px] left-1/2 overflow-clip top-[8424px] w-[1280px]" data-node-id="297:3" data-name="FOOTER">
      <div className="absolute contents left-0 top-[111px]" data-node-id="297:4">
        <div className="absolute flex h-[363px] items-center justify-center left-0 top-[111px] w-[1280px]" data-tab-part="email" data-node-id="297:5">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="h-[363px] relative w-[1280px]" data-name="Union">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union.svg" />
            </div>
          </div>
        </div>
        <div className="absolute h-[362px] left-0 top-[147px] w-[1280px]" data-tab-part="github" data-node-id="297:8" data-name="Union">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union1.svg" />
        </div>
        <div className="absolute h-[362px] left-0 top-[183px] w-[1280px]" data-tab-part="instagram" data-node-id="297:11" data-name="Union">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union2.svg" />
        </div>
        <div className="absolute flex h-[363px] items-center justify-center left-0 top-[220px] w-[1280px]" data-tab-part="linkedin" data-node-id="297:14">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="h-[363px] relative w-[1280px]" data-name="Union">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union3.svg" />
            </div>
          </div>
        </div>
        <div className="absolute flex h-[362px] items-center justify-center left-0 top-[260px] w-[1280px]" data-tab-part="medium" data-node-id="297:17">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="h-[362px] relative w-[1280px]" data-name="Union">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union4.svg" />
            </div>
          </div>
        </div>
        <div className="absolute h-[536px] left-0 top-[290px] w-[1280px]" data-node-id="297:20" data-name="Union">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/union5.svg" />
        </div>
        {LABELS.map((label) => (
          <p
            key={label.tab}
            className="-translate-x-1/2 [word-break:break-word] absolute font-rotonto leading-[normal] not-italic text-[28px] text-center whitespace-nowrap"
            style={{
              color: colour.get(label.tab),
              left: label.left,
              top: label.top,
            }}
            data-tab-part={label.tab.toLowerCase()}
            data-node-id={label.id}
          >
            {label.tab}
          </p>
        ))}
        {/* Hover targets for the folder tabs. The tab artwork is a
            full-width band, so the exposed lip needs its own hit area. */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div
            className="pointer-events-auto absolute left-[828px] top-[111px] h-[36px] w-[292px]"
            data-tab="email"
          />
          <div
            className="pointer-events-auto absolute left-[102px] top-[147px] h-[36px] w-[292px]"
            data-tab="github"
          />
          <div
            className="pointer-events-auto absolute left-[502px] top-[183px] h-[37px] w-[292px]"
            data-tab="instagram"
          />
          <div
            className="pointer-events-auto absolute left-[948px] top-[220px] h-[40px] w-[292px]"
            data-tab="linkedin"
          />
          <div
            className="pointer-events-auto absolute left-[218px] top-[260px] h-[30px] w-[292px]"
            data-tab="medium"
          />
        </div>
      </div>
      <div className="absolute content-stretch flex items-center justify-center left-[-382px] p-[10px] top-[428px]" data-marquee="footer" data-node-id="297:28">
        <p className="[word-break:break-word] scripts leading-[normal] not-italic relative shrink-0 text-[99.84px] text-black w-max whitespace-nowrap" dir="auto" data-node-id="297:29">{FOOTER.marquee}</p>
        <p className="[word-break:break-word] scripts leading-[normal] not-italic relative shrink-0 text-[99.84px] text-black w-max whitespace-nowrap" dir="auto" aria-hidden>{FOOTER.marquee}</p>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex gap-[10.4px] items-center left-[calc(50%-380px)] top-[703px]" data-node-id="297:30">
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:31">{FOOTER.madeWith[0]}</p>
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:32">
          {FOOTER.madeWith[1]}
        </p>
        <div className="h-[34.196px] relative shrink-0 w-[38.4px]" data-node-id="297:33" data-name="Vector">
          <img alt="love" className="absolute block inset-0 max-w-none size-full" src="/figma/vector.svg" />
        </div>
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:34">
          {FOOTER.madeWith[2]}
        </p>
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[28.8px] text-black text-center whitespace-nowrap" data-node-id="297:35">
          {FOOTER.madeWith[3]}
        </p>
      </div>
      <div className="absolute content-stretch flex gap-[6.912px] items-center left-[55px] top-[756px]" data-node-id="297:36">
        <div className="relative shrink-0 size-[14.4px]" data-node-id="297:37" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector1.svg" />
        </div>
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[17.28px] text-black whitespace-nowrap" data-node-id="297:38">
          {FOOTER.copyright}
        </p>
      </div>
      {/* The society's mark, filed bottom-right on the red panel.
          Figma exported it as forty-odd nested mask groups tracing every
          counter of the lettering; it is one flat black file here, which is
          the same drawing and one request. Black rather than the file's own
          red-and-white, so it reads as printed on the panel rather than laid
          over it. */}
      <div className="absolute h-[53.568px] left-[1058px] top-[732px] w-[163.19px]" data-node-id="297:39" data-name="VIIT 3">
        <img alt="VinnovateIT" className="absolute block inset-0 max-w-none size-full" src="/figma/vinnovate-black.svg" />
      </div>
    </footer>
  );
}
