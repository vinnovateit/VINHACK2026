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
    <footer className="-translate-x-1/2 absolute bg-black h-[826px] left-1/2 overflow-clip top-[8008px] w-[1280px]" data-node-id="297:3" data-name="FOOTER">
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
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[99.84px] text-black w-max whitespace-nowrap" dir="auto" data-node-id="297:29">{FOOTER.marquee}</p>
        <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative shrink-0 text-[99.84px] text-black w-max whitespace-nowrap" dir="auto" aria-hidden>{FOOTER.marquee}</p>
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
      <div className="absolute h-[53.568px] left-[1055px] overflow-clip top-[732px] w-[169.107px]" data-node-id="297:39" data-name="VIIT 3">
        <div className="absolute contents inset-[92.32%_97.42%_0_0]" data-node-id="297:40" data-name="Mask group">
          <div className="absolute inset-[92.97%_97.55%_-0.14%_0] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-0.003px_-0.347px] mask-size-[4.366px_4.113px]" data-node-id="297:43" style={{ maskImage: "url('/figma/group.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group1.svg" />
          </div>
        </div>
        <div className="absolute inset-[0_33.78%_92.83%_63.77%]" data-node-id="297:45" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector2.svg" />
        </div>
        <div className="absolute contents inset-[49.05%_82.36%_45.82%_16.22%]" data-node-id="297:46" data-name="Mask group">
          <div className="absolute inset-[49.05%_82.36%_45.83%_16.22%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-size-[2.411px_2.744px]" data-node-id="297:49" style={{ maskImage: "url('/figma/group2.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group3.svg" />
          </div>
        </div>
        <div className="absolute contents inset-[51.19%_82.18%_43.7%_16.39%]" data-node-id="297:51" data-name="Mask group">
          <div className="absolute inset-[51.19%_82.18%_43.7%_16.39%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-size-[2.411px_2.741px]" data-node-id="297:54" style={{ maskImage: "url('/figma/group4.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group5.svg" />
          </div>
        </div>
        <div className="absolute contents inset-[49.88%_82.18%_45%_16.39%]" data-node-id="297:56" data-name="Mask group">
          <div className="absolute inset-[49.88%_82.18%_45%_16.39%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-size-[2.411px_2.741px]" data-node-id="297:59" style={{ maskImage: "url('/figma/group6.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group7.svg" />
          </div>
        </div>
        <div className="absolute contents inset-[16.41%_77.01%_78.55%_21.01%]" data-node-id="297:61" data-name="Mask group">
          <div className="absolute inset-[16.41%_77.01%_78.55%_21.01%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-size-[3.346px_2.698px]" data-node-id="297:64" style={{ maskImage: "url('/figma/group8.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group9.svg" />
          </div>
        </div>
        <div className="absolute contents inset-[22.59%_86.79%_72.38%_9.99%]" data-node-id="297:66" data-name="Mask group">
          <div className="absolute inset-[22.59%_86.79%_72.38%_9.99%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-size-[5.452px_2.694px]" data-node-id="297:69" style={{ maskImage: "url('/figma/group10.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group11.svg" />
          </div>
        </div>
        <div className="absolute contents inset-[22.29%_82.19%_44.28%_11.29%]" data-node-id="297:71" data-name="Mask group">
          <div className="absolute contents inset-[22.59%_82.2%_45.83%_11.6%]" data-node-id="297:74" data-name="Group">
            <div className="absolute contents inset-[22.59%_82.2%_45.83%_11.6%]" data-node-id="297:75" data-name="Mask group">
              <div className="absolute inset-[22.59%_82.2%_45.82%_11.6%] mask-position-[-0.526px_-0.162px,_0px_0px] mask-size-[11.04px_17.905px,_10.486px_16.916px]" data-node-id="297:78" style={{ maskImage: "url('/figma/group12.svg'), url('/figma/group13.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group14.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[15.93%_77.29%_45.87%_15.64%]" data-node-id="297:80" data-name="Mask group">
          <div className="absolute contents inset-[16.42%_77.38%_45.98%_16.06%]" data-node-id="297:83" data-name="Group">
            <div className="absolute contents inset-[16.42%_77.38%_45.98%_16.06%]" data-node-id="297:84" data-name="Mask group">
              <div className="absolute inset-[16.42%_77.38%_45.98%_16.06%] mask-position-[-0.709px_-0.263px,_0px_0px] mask-size-[11.96px_20.463px,_11.094px_20.144px]" data-node-id="297:87" style={{ maskImage: "url('/figma/group15.svg'), url('/figma/group16.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group17.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[13.89%_73.93%_76.03%_22.62%]" data-node-id="297:89" data-name="Mask group">
          <div className="absolute contents inset-[13.89%_73.93%_76.03%_22.62%]" data-node-id="297:92" data-name="Group">
            <div className="absolute contents inset-[13.89%_73.93%_76.03%_22.62%]" data-node-id="297:93" data-name="Mask group">
              <div className="absolute inset-[13.89%_73.93%_76.03%_22.62%] mask-position-[0px_-0.002px,_0px_0px] mask-size-[5.829px_5.402px,_5.829px_5.402px]" data-node-id="297:96" style={{ maskImage: "url('/figma/group18.svg'), url('/figma/group19.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group20.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[23.88%_81.64%_42.69%_11.29%]" data-node-id="297:98" data-name="Mask group">
          <div className="absolute contents inset-[24.73%_82.03%_43.69%_11.77%]" data-node-id="297:101" data-name="Group">
            <div className="absolute contents inset-[24.73%_82.03%_43.69%_11.77%]" data-node-id="297:102" data-name="Mask group">
              <div className="absolute inset-[24.73%_82.03%_43.68%_11.77%] mask-position-[-0.823px_-0.456px,_0px_0px] mask-size-[11.96px_17.905px,_10.486px_16.916px]" data-node-id="297:105" style={{ maskImage: "url('/figma/group21.svg'), url('/figma/group22.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group23.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[17.51%_76.74%_42.69%_16.18%]" data-node-id="297:107" data-name="Mask group">
          <div className="absolute contents inset-[18.55%_77.21%_43.85%_16.23%]" data-node-id="297:110" data-name="Group">
            <div className="absolute contents inset-[18.55%_77.21%_43.85%_16.23%]" data-node-id="297:111" data-name="Mask group">
              <div className="absolute inset-[18.55%_77.21%_43.85%_16.23%] mask-position-[-0.086px_-0.553px,_0px_0px] mask-size-[11.96px_21.316px,_11.094px_20.144px]" data-node-id="297:114" style={{ maskImage: "url('/figma/group24.svg'), url('/figma/group25.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group26.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[22.29%_81.64%_44.28%_11.29%]" data-node-id="297:116" data-name="Mask group">
          <div className="absolute contents inset-[23.43%_82.03%_45%_11.77%]" data-node-id="297:119" data-name="Group">
            <div className="absolute contents inset-[23.43%_82.03%_45%_11.77%]" data-node-id="297:120" data-name="Mask group">
              <div className="absolute inset-[23.43%_82.03%_44.99%_11.77%] mask-position-[-0.823px_-0.607px,_0px_0px] mask-size-[11.96px_17.905px,_10.486px_16.916px]" data-node-id="297:123" style={{ maskImage: "url('/figma/group27.svg'), url('/figma/group28.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group29.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[15.93%_76.74%_44.28%_16.18%]" data-node-id="297:125" data-name="Mask group">
          <div className="absolute contents inset-[17.25%_77.21%_45.15%_16.23%]" data-node-id="297:128" data-name="Group">
            <div className="absolute contents inset-[17.25%_77.21%_45.15%_16.23%]" data-node-id="297:129" data-name="Mask group">
              <div className="absolute inset-[17.25%_77.21%_45.15%_16.23%] mask-position-[-0.086px_-0.708px,_0px_0px] mask-size-[11.96px_21.316px,_11.094px_20.144px]" data-node-id="297:132" style={{ maskImage: "url('/figma/group30.svg'), url('/figma/group31.svg')" }} data-name="Group">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group32.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[50.94%_82.18%_44.28%_16.18%]" data-node-id="297:134" data-name="Mask group">
          <div className="absolute contents inset-[51.39%_82.26%_43.32%_15.99%]" data-node-id="297:137" data-name="Group">
            <div className="absolute contents inset-[51.39%_82.26%_43.32%_15.99%]" data-node-id="297:138" data-name="Mask group">
              <div className="absolute contents inset-[51.39%_82.26%_45.08%_16.34%]" data-node-id="297:141" data-name="Group">
                <div className="absolute contents inset-[51.39%_82.26%_45.08%_16.34%]" data-node-id="297:142" data-name="Mask group">
                  <div className="absolute inset-[51.38%_82.26%_43.32%_15.99%] mask-position-[0.323px_-0.237px,_0.001px_0.002px,_0.589px_0.002px] mask-size-[2.76px_2.558px,_2.954px_2.838px,_2.365px_1.896px]" data-node-id="297:145" style={{ maskImage: "url('/figma/group33.svg'), url('/figma/group34.svg'), url('/figma/group35.svg')" }} data-name="Group">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group36.svg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[1.6%_0.07%_4.49%_1.5%]" data-node-id="297:147" data-name="Mask group">
          <div className="absolute inset-[2.97%_0.03%_4.54%_1.86%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-0.624px_-0.734px] mask-size-[166.456px_50.306px]" data-node-id="297:150" style={{ maskImage: "url('/figma/group37.svg')" }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group38.svg" />
          </div>
        </div>
        <div className="absolute inset-[72.37%_20.89%_19.64%_40.88%]" data-node-id="297:152" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector3.svg" />
        </div>
        <div className="absolute inset-[72.36%_16.41%_19.65%_78.47%]" data-node-id="297:153" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector4.svg" />
        </div>
        <div className="absolute inset-[72.36%_12.04%_19.65%_82.83%]" data-node-id="297:154" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector5.svg" />
        </div>
        <div className="absolute inset-[72.36%_7.68%_19.65%_87.2%]" data-node-id="297:155" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector6.svg" />
        </div>
        <div className="absolute inset-[25.7%_74.75%_45.73%_23.51%]" data-node-id="297:156" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector7.svg" />
        </div>
        <div className="absolute inset-[33.77%_66.37%_45.73%_26.63%]" data-node-id="297:157" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector8.svg" />
        </div>
        <div className="absolute inset-[33.77%_58.06%_45.73%_34.94%]" data-node-id="297:158" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector9.svg" />
        </div>
        <div className="absolute inset-[33.77%_49.83%_45.73%_43.16%]" data-node-id="297:159" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector10.svg" />
        </div>
        <div className="absolute inset-[33.77%_42%_45.73%_50.93%]" data-node-id="297:160" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector11.svg" />
        </div>
        <div className="absolute inset-[33.77%_34.23%_45.73%_58.76%]" data-node-id="297:161" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector12.svg" />
        </div>
        <div className="absolute inset-[30.57%_29.43%_45.73%_67.07%]" data-node-id="297:162" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector13.svg" />
        </div>
        <div className="absolute inset-[33.77%_21.52%_45.73%_71.48%]" data-node-id="297:163" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector14.svg" />
        </div>
        <div className="absolute inset-[29.35%_17.34%_44.56%_80.26%]" data-node-id="297:164" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector15.svg" />
        </div>
        <div className="absolute inset-[29.35%_8.81%_44.56%_83.63%]" data-node-id="297:165" data-name="Vector">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector16.svg" />
        </div>
      </div>
    </footer>
  );
}
