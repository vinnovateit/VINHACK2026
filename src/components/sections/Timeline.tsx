import { TIMELINE, type ScheduleEntry } from "@/content/site";

/* The receipt's schedule is drawn in the type Figma set for Day 1 — the same
   sizes, the same left margin, times right-aligned on the same edge. The words
   and times themselves live in `content/site.ts`, which the phone's timeline
   reads too; what stays here is where each line lands on the paper. */

/** One line of the schedule: what is happening, and when. */
function Row({ label, time, top }: { label: string; time: string; top: number }) {
  return (
    <>
      <p
        className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[33.08px] not-italic text-[17.772px] text-black whitespace-nowrap"
        style={{ top }}
      >
        {label}
      </p>
      {/* Right-aligned rather than positioned per string: Day 1's times are
          each nudged to land on the same edge, and this reaches it directly. */}
      <p
        className="[word-break:break-word] absolute font-rotonto leading-[13.823px] not-italic right-[41px] text-[17.772px] text-black text-right whitespace-nowrap"
        style={{ top }}
      >
        {time}
      </p>
    </>
  );
}

/** A review checkpoint, centred across the paper. */
function Review({ label, top }: { label: string; top: number }) {
  return (
    <p
      className="-translate-x-1/2 [word-break:break-word] absolute font-rotonto leading-[13.823px] left-1/2 not-italic text-[17.772px] text-black text-center whitespace-nowrap"
      style={{ top }}
    >
      {label}
    </p>
  );
}

/** The dashed rule the receipt separates its blocks with. */
function Rule({ top }: { top: number }) {
  return (
    <div
      className="-translate-x-1/2 absolute h-0 left-[calc(50%-0.74px)] w-[294.233px]"
      style={{ top }}
    >
      <div className="absolute inset-[-1.97px_0_0_0]">
        <img alt="" className="block max-w-none size-full" src="/figma/line13.svg" />
      </div>
    </div>
  );
}

/**
 * Where each day's schedule lands on the paper, parallel to that day's
 * `entries` in `content/site.ts`.
 *
 * The two days are placed rather than pitched, because they are different
 * shapes fitted to the same 235px between the date rule and the footer rule:
 * Day 1 is four rows, a review, then one more, and sits on a 25.2px pitch; Day
 * 2 opens on a review and runs to six rows and two reviews, which is what
 * closes it to 23px. The rules bracketing each review are placed by eye around
 * it in the design file, so they are listed separately rather than derived.
 */
const LAYOUT = [
  {
    entries: [321.39, 346.56, 371.74, 396.92, 435.43, 473.44],
    rules: [297.2, 424.56, 459.62],
  },
  {
    entries: [318.9, 353, 376, 399, 422, 455.9, 490, 513],
    rules: [297.2, 308, 341, 445, 478],
  },
];

/**
 * One day's printing. Only ever one is displayed — `PageMotion` swaps the two
 * `data-day` sets and reprints the paper — so the second is hidden from the
 * start rather than unmounted, which keeps both days' ink on the sheet the
 * printer measures.
 */
function DaySheet({ index }: { index: number }) {
  const day = TIMELINE.days[index];
  const layout = LAYOUT[index];

  return (
    <div
      className="absolute inset-0"
      data-day={String(index + 1)}
      style={index === 0 ? undefined : { display: "none" }}
    >
      <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[calc(50%-36.43px)] not-italic text-[29.621px] text-black top-[174.76px] whitespace-nowrap">
        {day.name}
      </p>
      <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[250.79px] not-italic text-[17.772px] text-black top-[265.11px] whitespace-nowrap">
        {day.date}
      </p>

      {layout.rules.map((top) => (
        <Rule key={top} top={top} />
      ))}

      {day.entries.map((entry: ScheduleEntry, i) =>
        entry.kind === "row" ? (
          <Row
            key={entry.label}
            label={entry.label}
            time={entry.time}
            top={layout.entries[i]}
          />
        ) : (
          <Review key={entry.label} label={entry.label} top={layout.entries[i]} />
        ),
      )}
    </div>
  );
}

export default function TimelineSection() {
  return (
    <section aria-label="Timeline" className="absolute bg-black h-[832px] left-0 overflow-clip top-[4680px] w-[1280px]" data-node-id="343:2038" data-name="MacBook Air - 17">
      <div className="-translate-x-1/2 absolute bg-[#fa1a1d] h-[98.736px] left-[calc(50%+360.18px)] rounded-[19.747px] top-[126px] w-[440.363px]" data-node-id="343:2039">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[18.76px] left-1/2 top-1/2 w-[380.134px]" data-node-id="343:2040" />
        <div className="absolute bg-[#f1f0f0] h-[595.872px] left-[39.49px] overflow-clip top-[49.37px] w-[361.867px]" data-node-id="343:2041">
          <div className="absolute flex h-[21.722px] items-center justify-center left-[0.99px] top-[580.07px] w-[363.347px]" data-node-id="343:2061">
            <div className="flex-none rotate-180">
              <div className="h-[21.722px] relative w-[363.347px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group48095503.svg" />
              </div>
            </div>
          </div>
          <div className="absolute h-0 left-[75.53px] top-[144.65px] w-[214.257px]" data-node-id="343:2080">
            <div className="absolute inset-[-5.92px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src="/figma/line12.svg" />
            </div>
          </div>
          <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[calc(50%-59px)] not-italic text-[17.772px] text-black top-[206.36px] whitespace-nowrap" data-node-id="343:2081">{TIMELINE.masthead}</p>
          <div className="-translate-x-1/2 absolute h-0 left-[calc(50%+0.25px)] top-[246.84px] w-[294.233px]" data-node-id="343:2083">
            <div className="absolute inset-[-1.97px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src="/figma/line13.svg" />
            </div>
          </div>
          <div className="-translate-x-1/2 absolute h-0 left-[calc(50%-2.22px)] top-[531.69px] w-[294.233px]" data-node-id="343:2084">
            <div className="absolute inset-[-1.97px_0_0_0]">
              <img alt="" className="block max-w-none size-full" src="/figma/line13.svg" />
            </div>
          </div>
          <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[37.03px] not-italic text-[17.772px] text-black top-[265.11px] whitespace-nowrap" data-node-id="343:2088">{TIMELINE.dateLabel}</p>
          <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[31.6px] not-italic text-[6.912px] text-black top-[535.64px] whitespace-nowrap" data-node-id="343:2110">
            {TIMELINE.site}
          </p>
          <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[254.74px] not-italic text-[6.912px] text-black top-[535.64px] whitespace-nowrap" data-node-id="343:2111">
            {TIMELINE.email}
          </p>
          <div className="absolute h-[78.77px] left-[65.51px] top-[40px] w-[230px]" data-node-id="343:2269" data-name="LOGO">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/logo-red.svg" />
          </div>

          <DaySheet index={0} />
          <DaySheet index={1} />
        </div>
      </div>
      <div className="absolute bg-[#74d4f0] border-[#2849cb] border-[1.8px] border-solid h-[63px] left-[240px] overflow-clip rounded-[13.5px] top-[473px] w-[356.4px]" data-node-id="343:2115">
        <p className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[calc(50%+66.6px)] not-italic text-[#2849cb] text-[21.6px] top-[calc(50%-12.6px)] whitespace-nowrap" data-node-id="343:2116">
          {TIMELINE.days[1].name}
        </p>
        <div className="-translate-y-1/2 absolute bg-[#2849cb] border-[#74d4f0] border-[1.8px] border-solid h-[59.4px] left-0 overflow-clip rounded-[13.5px] top-1/2 w-[181.8px]" data-node-id="343:2117">
          <p className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[calc(50%-26.1px)] not-italic text-[#74d4f0] text-[21.6px] top-[calc(50%-12.6px)] whitespace-nowrap" data-node-id="343:2118">
            {TIMELINE.days[0].name}
          </p>
        </div>
      </div>
      <div className="-translate-y-1/2 absolute aspect-[77.25666706933134/71.41451740581158] flex items-center justify-center left-[23.93%] right-[70.04%] top-[calc(50%-127.69px)]" data-node-id="343:2119" style={{ containerType: "size" }}>
        <div className="-scale-x-100 flex-none h-[hypot(-71.9713cqw,-38.2022cqh)] rotate-[116.14deg] w-[hypot(28.0287cqw,-61.7978cqh)]">
          <div className="relative size-full" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/vector17.svg" />
          </div>
        </div>
      </div>
      <div className="absolute contents h-[125.263px] left-[98px] top-[539px] w-[186.754px]" data-node-id="343:2120">
        <div className="absolute contents h-[125.263px] left-[98px] top-[539px] w-[186.754px]" data-node-id="343:2121">
          <div className="absolute flex h-[121.426px] items-center justify-center left-[101.15px] top-[540.94px] w-[180.575px]" data-node-id="343:2122">
            <div className="flex-none rotate-15">
              <div className="bg-[#d5d1be] h-[81.467px] relative rounded-[2.7px] w-[165.116px]" />
            </div>
          </div>
          <div className="absolute flex h-[82.623px] items-center justify-center left-[98px] top-[540.17px] w-[31.682px]" data-node-id="343:2123">
            <div className="-rotate-75 flex-none">
              <div className="h-[10.645px] relative w-[82.685px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group48095575.svg" />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[82.622px] items-center justify-center left-[253.07px] top-[580.47px] w-[31.683px]" data-node-id="343:2133">
            <div className="-rotate-75 -scale-y-100 flex-none">
              <div className="h-[10.645px] relative w-[82.684px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group48095577.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex h-[49.426px] items-center justify-center left-[123.83px] top-[calc(50%+187.34px)] w-[137.209px]" data-node-id="343:2143">
          <div className="flex-none rotate-15">
            <p className="[word-break:break-word] font-rotonto h-[14.121px] leading-[normal] not-italic relative text-[16.2px] text-black w-[138.265px]">{TIMELINE.stamp}</p>
          </div>
        </div>
        <div className="absolute flex inset-[67.28%_79.62%_23.95%_9.68%] items-center justify-center" data-node-id="343:2144" style={{ containerType: "size" }}>
          <div className="flex-none h-[hypot(-7.66586cqw,53.6256cqh)] rotate-15 w-[hypot(92.3341cqw,46.3744cqh)]">
            <div className="relative size-full" data-name="Group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group39.svg" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[134.841px] items-center justify-center left-[50px] top-[457.02px] w-[136.85px]" data-node-id="343:2215">
        <div className="flex-none rotate-[-13.5deg]">
          <div className="h-[111.295px] relative w-[114.013px]" data-name="image 234">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src="/figma/image234.png" />
          </div>
        </div>
      </div>
      <div className="absolute h-[147px] left-[36px] top-[207px] w-[204.814px]" data-node-id="343:2216" data-name="image 234">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[131.71%] left-0 max-w-none top-[-12.2%] w-full" src="/figma/image235.png" />
        </div>
      </div>
      <div className="absolute contents h-[239.862px] left-[488px] top-[214px] w-[245.087px]" data-node-id="343:2217">
        <div className="absolute flex h-[166.791px] items-center justify-center left-[517.99px] top-[250.53px] w-[185.111px]" data-node-id="343:2218">
          <div className="flex-none rotate-[-14.05deg] skew-x-[-1.48deg]">
            <div className="h-[130.714px] relative w-[161.483px]" data-name="sticker">
              <div className="absolute inset-[-2.2%_-1.64%_-1.9%_-2.08%]">
                <img alt="" className="block max-w-none size-full" src="/figma/sticker.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex h-[83.826px] items-center justify-center left-[555.88px] top-[298.64px] w-[123.225px]" data-node-id="343:2220">
          <div className="flex-none rotate-15">
            <div className="[word-break:break-word] font-rotonto h-[56.669px] leading-[0] not-italic relative text-[#db9eef] text-[14.753px] tracking-[2.9506px] w-[112.388px] whitespace-pre-wrap">
              <p className="leading-[16.094px] mb-0">{TIMELINE.sticker[0]}</p>
              <p className="leading-[16.094px]">{TIMELINE.sticker[1]}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute aspect-[160.5143220682155/164.78555757652543] flex items-center justify-center left-[33.83%] right-[53.63%] top-[199px]" data-node-id="343:2221" style={{ containerType: "size" }}>
        <div className="flex-none h-[hypot(34.0099cqw,69.1918cqh)] rotate-[-25.61deg] skew-x-[-0.02deg] w-[hypot(65.9901cqw,-30.8082cqh)]">
          <div className="relative size-full" data-name="image 234">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src="/figma/image236.png" />
          </div>
        </div>
      </div>
      <h2 className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[167px] not-italic text-[#fa1a1d] text-[128px] top-[calc(50%-97px)] whitespace-nowrap" data-node-id="343:2222">
        {TIMELINE.heading}
      </h2>
      <div className="absolute flex h-[144.718px] items-center justify-center left-[529.2px] top-[504.5px] w-[150.24px]" data-node-id="343:2223">
        <div className="flex-none rotate-[-7.91deg]">
          <div className="h-[127.496px] relative w-[133.971px]" data-name="image 227 [Vectorized]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/image227-vectorized.svg" />
          </div>
        </div>
      </div>
    </section>
  );
}
