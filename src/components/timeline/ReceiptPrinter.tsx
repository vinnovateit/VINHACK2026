import { TIMELINE, type ScheduleEntry } from "@/content/site";

function DaySheet({ index }: { index: number }) {
  const day = TIMELINE.days[index];

  return (
    <div
      className="absolute inset-0"
      data-day={String(index + 1)}
      style={index === 0 ? undefined : { display: "none" }}
    >
      <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[calc(50%-36.43px)] not-italic text-[29.621px] text-black top-[174.76px] whitespace-nowrap">
        {day.name}
      </p>
      <p className="[word-break:break-word] absolute font-rotonto leading-[13.823px] right-[33.8px] not-italic text-[16px] text-black text-right top-[265.11px] whitespace-nowrap">
        {day.date}
      </p>

      {/* Top dashed divider above schedule items */}
      <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[297.2px] w-[294.233px]" />

      {/* Schedule Items List */}
      <div
        className="absolute left-[33.8px] right-[33.8px] top-[305px] flex flex-col justify-between"
        style={{ height: "220px" }}
      >
        {day.entries.map((entry: ScheduleEntry) => {
          const isRow = entry.kind === "row";
          const label = entry.label;
          const time = isRow ? entry.time : "";
          const isReview = (entry as any).isReview || entry.kind === "review";

          return (
            <div
              key={label}
              className={`flex items-baseline justify-between gap-1.5 font-rotonto text-black ${
                isReview ? "font-bold" : ""
              }`}
            >
              <span className="min-w-0 flex-1 text-[11.8px] leading-[13px] tracking-tight">
                {label}
              </span>
              {time ? (
                <span className="shrink-0 text-right text-[11.2px] tabular-nums whitespace-nowrap leading-[13px] opacity-90">
                  {time}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReceiptPrinter({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[#fa1a1d] h-[98.736px] rounded-[19.747px] w-[440.363px] ${className ?? ""}`}
      data-node-id="343:2039"
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[18.76px] left-1/2 top-1/2 w-[380.134px]"
        data-node-id="343:2040"
      />
      <div
        className="absolute h-[595.872px] left-[39.49px] overflow-clip top-[49.37px] w-[361.867px]"
        data-node-id="343:2041"
      >
        <div
          aria-hidden
          className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0]"
          data-node-id="343:2061"
        />
        <div
          className="absolute h-0 left-[75.53px] top-[144.65px] w-[214.257px]"
          data-node-id="343:2080"
        >
          <div className="absolute inset-[-5.92px_0_0_0]">
            <img
              alt=""
              className="block max-w-none size-full"
              src="/figma/line12.svg"
            />
          </div>
        </div>
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[calc(50%-59px)] not-italic text-[17.772px] text-black top-[206.36px] whitespace-nowrap"
          data-node-id="343:2081"
        >
          {TIMELINE.masthead}
        </p>
        <div
          className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[246.84px] w-[294.233px]"
          data-node-id="343:2083"
        />
        <div
          className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[531.69px] w-[294.233px]"
          data-node-id="343:2084"
        />
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[33.8px] not-italic text-[16px] text-black top-[265.11px] whitespace-nowrap"
          data-node-id="343:2088"
        >
          {TIMELINE.dateLabel}
        </p>
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[33.8px] not-italic text-[6.912px] text-black top-[535.64px] whitespace-nowrap"
          data-node-id="343:2110"
        >
          {TIMELINE.site}
        </p>
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] right-[33.8px] not-italic text-[6.912px] text-black text-right top-[535.64px] whitespace-nowrap"
          data-node-id="343:2111"
        >
          {TIMELINE.email}
        </p>
        <div
          className="absolute h-[78.77px] left-[65.51px] top-[40px] w-[230px]"
          data-node-id="343:2269"
          data-name="LOGO"
        >
          <img
            alt=""
            className="absolute block inset-0 max-w-none size-full"
            src="/figma/logo.svg"
          />
        </div>

        <DaySheet index={0} />
        <DaySheet index={1} />
      </div>
      <div
        aria-hidden
        className="-translate-x-1/2 pointer-events-none absolute left-1/2 top-[47px] h-[6px] w-[378px] rounded-full bg-[#161616] shadow-[0_3px_5px_rgba(0,0,0,0.55)] z-10"
      />
    </div>
  );
}
