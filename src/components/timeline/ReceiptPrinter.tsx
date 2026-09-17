import { TIMELINE, type ScheduleEntry } from "@/content/site";

/* The printed schedule, between the Date header's rule and the footer's.

   It is laid out rather than placed: the receipt used to carry one hand-measured
   `top` per line and one per divider, transcribed from the Figma frame, which
   only holds for as long as the schedule does. A day with a longer label in it
   wraps to two lines and every measurement below that point is wrong by one.

   So the lines are a column with a fixed rhythm, and the dividers are worked
   out from the content: a review is fenced above and below, and a run of them
   is fenced once as a block rather than ruled between every line. */
const SHEET_TOP = 303;
const SHEET_BOTTOM = 527;

function isReviewEntry(entry: ScheduleEntry): boolean {
  return entry.kind === "review" || Boolean(entry.isReview);
}

function Fence() {
  return <div className="receipt-rule my-[6px] h-px w-full shrink-0" aria-hidden />;
}

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

      {/* The rule the schedule hangs from. */}
      <div className="receipt-rule absolute h-[1px] left-[33.8px] right-[33.8px] top-[297.2px]" />

      {/* Aligned from the top directly after the date section and divider rule. */}
      <div
        className="absolute left-[33.8px] right-[33.8px] flex flex-col justify-start gap-[6px]"
        style={{ top: SHEET_TOP, height: SHEET_BOTTOM - SHEET_TOP }}
      >
        {day.entries.map((entry: ScheduleEntry, i) => {
          const review = isReviewEntry(entry);
          const time = entry.kind === "row" ? entry.time : "";
          /* One fence per run, not one per line: three review rows in a row
             are a single block of the day, and ruling between each of them
             would read as three separate ones. */
          const opensRun = review && !(i > 0 && isReviewEntry(day.entries[i - 1]));
          const closesRun =
            review && !(i < day.entries.length - 1 && isReviewEntry(day.entries[i + 1]));

          return (
            <div key={entry.label} className="contents">
              {opensRun && <Fence />}
              <div className="flex items-baseline justify-between gap-2 font-rotonto text-black">
                <span
                  className={`min-w-0 flex-1 text-[11.5px] leading-[12.6px] tracking-tight ${
                    review ? "font-bold" : ""
                  }`}
                >
                  {entry.label}
                </span>
                {time ? (
                  <span
                    className={`shrink-0 text-right text-[10.8px] leading-[12.6px] whitespace-nowrap tabular-nums ${
                      review ? "font-bold" : "opacity-90"
                    }`}
                  >
                    {time}
                  </span>
                ) : null}
              </div>
              {closesRun && <Fence />}
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
          className="receipt-rule absolute h-[1px] left-[33.8px] right-[33.8px] top-[246.84px]"
          data-node-id="343:2083"
        />
        <div
          className="receipt-rule absolute h-[1px] left-[33.8px] right-[33.8px] top-[531.69px]"
          data-node-id="343:2084"
        />
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[33.8px] not-italic text-[16px] text-black top-[265.11px] whitespace-nowrap"
          data-node-id="343:2088"
        >
          {TIMELINE.dateLabel}
        </p>
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[31.6px] not-italic text-[6.912px] text-black top-[535.64px] whitespace-nowrap"
          data-node-id="343:2110"
        >
          {TIMELINE.site}
        </p>
        <p
          className="[word-break:break-word] absolute font-rotonto leading-[13.823px] left-[254.74px] not-italic text-[6.912px] text-black top-[535.64px] whitespace-nowrap"
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
