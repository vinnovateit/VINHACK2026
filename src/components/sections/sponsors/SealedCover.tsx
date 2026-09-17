import { COVER } from "./copy";

/** One contents line: number, teaser, leader dots, page. */
function ContentsRow({
  n,
  line,
  page,
}: {
  n: string;
  line: string;
  page: string;
}) {
  return (
    <div className="flex items-baseline gap-[10px] py-[6px]">
      <span className="w-[22px] shrink-0 text-[13px] tabular-nums text-[#fa1a1d]">
        {n}
      </span>
      <span className="shrink-0 text-[14.5px] leading-[1.15]">{line}</span>
      <span
        aria-hidden
        className="mb-[4px] min-w-[12px] flex-1 border-b border-dotted border-black/45"
      />
      <span className="shrink-0 text-[13px] tabular-nums text-black/70">
        {page}
      </span>
    </div>
  );
}

export default function SealedCover() {
  return (
    <div className="absolute inset-0 text-left text-[18px] text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif]">
      {/* Top Header Bar */}
      <div className="absolute left-[60px] top-[31.61px] font-normal whitespace-pre-wrap text-[15px]">
        {COVER.volume}
      </div>
      <div className="absolute right-[104px] top-[31.61px] font-normal uppercase tracking-[0.06em] text-[15px] text-[#fa1a1d]">
        {COVER.embargo}
      </div>
      <div className="absolute left-[58px] top-[70.13px] h-[2.2px] w-[982px] border-t-[2.2px] border-black" />

      {/* Stamp */}
      <div className="absolute left-[62px] top-[130px] w-[430px] origin-top-left rotate-[-5deg]">
        <div className="border-[3px] border-[#fa1a1d] px-[20px] py-[16px] text-[#fa1a1d]">
          <div className="border border-[#fa1a1d] px-[16px] py-[12px]">
            <div className="text-[42px] leading-[0.92] tracking-[0.01em] font-normal">
              {COVER.stamp.mark}
            </div>
            <div className="mt-[8px] text-[15px] uppercase tracking-[0.14em]">
              {COVER.stamp.under}
            </div>
          </div>
        </div>
      </div>

      {/* Headline & Standfirst */}
      <div className="absolute left-[62px] top-[372px] w-[500px]">
        <div className="whitespace-nowrap text-[46px] font-normal leading-[1] [text-shadow:0.9px_0_0_#000,_0_0.9px_0_#000,_-0.9px_0_0_#000,_0_-0.9px_0_#000]">
          {COVER.lede[0]}
          <br />
          {COVER.lede[1]}
        </div>
        <div className="mt-[18px] h-px w-[300px] bg-black/60" />
        <div className="mt-[16px] w-[420px] text-[16px] font-normal leading-[1.4] text-[#333]">
          {COVER.standfirst}
        </div>
      </div>

      {/* Contents Rail */}
      <div className="absolute left-[600px] top-[130px] w-[400px]">
        <div className="text-[15px] uppercase tracking-[0.34em] text-[#fa1a1d] font-normal">
          {COVER.contentsHeader}
        </div>
        <div className="mt-[10px] h-px w-full bg-black" />
        <div className="mt-[4px]">
          {COVER.contents.map((row) => (
            <ContentsRow key={row.n} {...row} />
          ))}
        </div>
        <div className="mt-[6px] h-px w-full bg-black" />
        <div className="mt-[14px] w-[330px] text-[13px] font-normal leading-[1.4] text-black/65">
          {COVER.colophon}
        </div>

        {/* Notice Box */}
        <div className="mt-[38px] border-[1.6px] border-black px-[18px] py-[14px]">
          <div className="text-[13px] uppercase tracking-[0.3em] text-[#fa1a1d] font-normal">
            {COVER.stopPress.kicker}
          </div>
          <div className="mt-[8px] text-[14.5px] font-normal leading-[1.4] text-[#222]">
            {COVER.stopPress.body}
          </div>
        </div>
      </div>

      {/* Free edge perforation */}
      <div
        aria-hidden
        className="absolute bottom-[58px] right-[74px] top-[100px] border-l border-dashed border-black/45"
      />
      <div className="absolute right-[26px] top-1/2 -translate-y-1/2">
        <div className="rotate-90 whitespace-nowrap text-[13px] uppercase tracking-[0.42em] text-[#fa1a1d]">
          {COVER.openHere}
        </div>
      </div>

      {/* Bottom scroll cue */}
      <div className="absolute bottom-[30px] left-[60px] flex items-center gap-[14px] text-[14px] uppercase tracking-[0.3em] text-black/70">
        <span>{COVER.cue}</span>
        <span aria-hidden className="h-px w-[74px] bg-black/45" />
        <span aria-hidden className="text-[#fa1a1d]">↓</span>
      </div>
    </div>
  );
}
