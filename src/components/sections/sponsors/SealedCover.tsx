import { COVER } from "./copy";

/**
 * What is printed on the closed cover of the sponsor edition.
 *
 * Drawn in the sheet's own 1184 x 758.4 units, the same as `SponsorEdition`, so
 * the two are the same size and the cover sits exactly over the page it hides.
 *
 * The cover used to carry the paper's nameplate and the section's headline —
 * i.e. the two things the reader was about to be shown anyway. This is the
 * other kind of cover: a sealed edition. An embargo line across the top, a
 * stamp struck over it, the statement the section is actually making, a
 * contents rail teasing the four columns underneath, and — down the right-hand
 * edge — a perforation.
 *
 * The perforation is the part that has to be right. `FoldedEdition` hinges the
 * cover on its *left* edge, so the edge that lifts away from the page is the
 * right one, and that is the edge this marks: the cue says open here, and then
 * the scroll opens it exactly there. Put it on the wrong side and the cover is
 * a poster with an instruction on it.
 */

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
    <div className="flex items-baseline gap-[10px] py-[7px]">
      <span className="w-[22px] shrink-0 text-[13px] tabular-nums text-[#fa1a1d]">
        {n}
      </span>
      <span className="shrink-0 text-[15px] leading-[1.15]">{line}</span>
      {/* The leader. A dotted rule rather than a run of full stops, so it sets
          the same at every width the sheet is fitted to. */}
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
      {/* The strip across the top, and the heavy rule under it — the same rule
          the sheet's own nameplate sits above, so the cover and the page agree
          about where the paper's top band ends. */}
      <div className="absolute left-[60px] top-[31.61px] font-light whitespace-pre-wrap">
        {COVER.volume}
      </div>
      <div className="absolute right-[104px] top-[31.61px] font-light uppercase tracking-[0.06em] text-[#fa1a1d]">
        {COVER.embargo}
      </div>
      <div className="absolute left-[58px] top-[70.13px] h-[2.2px] w-[982px] border-t-[2.2px] border-black" />

      {/* The stamp. Struck at an angle and in the paper's red, with the double
          rule a rubber stamp leaves — it is the loudest thing on the cover
          because it is the only thing on it that is an instruction. */}
      <div className="absolute left-[62px] top-[132px] w-[430px] origin-top-left rotate-[-5.5deg]">
        <div className="border-[3px] border-[#fa1a1d] px-[20px] py-[16px] text-[#fa1a1d]">
          <div className="border border-[#fa1a1d] px-[16px] py-[13px]">
            <div className="text-[43px] leading-[0.92] tracking-[0.01em]">
              {COVER.stamp.mark}
            </div>
            <div className="mt-[8px] text-[15px] uppercase tracking-[0.14em]">
              {COVER.stamp.under}
            </div>
          </div>
        </div>
      </div>

      {/* What the section is actually saying, which nothing else on the page
          says — the sheet lists the sponsors, this is the line about them. */}
      <div className="absolute left-[62px] top-[372px] w-[500px]">
        {/* `nowrap` per line: the break between the two is the whole line, and
            at this size MASTHEAD is one wide word away from taking a third. */}
        <div className="whitespace-nowrap text-[46px] font-light leading-[1] [text-shadow:0.9px_0_0_#000,_0_0.9px_0_#000,_-0.9px_0_0_#000,_0_-0.9px_0_#000]">
          {COVER.lede[0]}
          <br />
          {COVER.lede[1]}
        </div>
        <div className="mt-[18px] h-px w-[300px] bg-black/60" />
        <div className="mt-[16px] w-[400px] text-[16px] font-light leading-[1.4]">
          {COVER.standfirst}
        </div>
      </div>

      {/* The contents rail, in the column the perforation runs beside. */}
      <div className="absolute left-[600px] top-[132px] w-[400px]">
        <div className="text-[15px] uppercase tracking-[0.34em] text-[#fa1a1d]">
          {COVER.contentsHeader}
        </div>
        <div className="mt-[10px] h-px w-full bg-black" />
        <div className="mt-[4px]">
          {COVER.contents.map((row) => (
            <ContentsRow key={row.n} {...row} />
          ))}
        </div>
        <div className="mt-[6px] h-px w-full bg-black" />
        <div className="mt-[16px] w-[330px] text-[13px] font-light leading-[1.5] text-black/65">
          {COVER.colophon}
        </div>

        {/* The late item, boxed off the way a paper boxes one. It is also what
            keeps the bottom of this column from being a blank quarter of the
            cover — the contents rail is short, and a sealed edition with
            nothing under it reads as unfinished rather than withheld. */}
        <div className="mt-[46px] border-[1.6px] border-black px-[18px] py-[15px]">
          <div className="text-[13px] uppercase tracking-[0.34em] text-[#fa1a1d]">
            {COVER.stopPress.kicker}
          </div>
          <div className="mt-[10px] text-[15px] font-light leading-[1.42]">
            {COVER.stopPress.body}
          </div>
        </div>
      </div>

      {/* The free edge. The dashed rule is the perforation, the words run down
          it, and the arrow points at the edge that is about to lift. */}
      <div
        aria-hidden
        className="absolute bottom-[58px] right-[74px] top-[100px] border-l border-dashed border-black/45"
      />
      <div className="absolute right-[26px] top-1/2 -translate-y-1/2">
        <div className="rotate-90 whitespace-nowrap text-[13px] uppercase tracking-[0.42em] text-[#fa1a1d]">
          {COVER.openHere}
        </div>
      </div>

      {/* The cue along the bottom, where the reader's eye leaves the cover. */}
      <div className="absolute bottom-[30px] left-[60px] flex items-center gap-[14px] text-[14px] uppercase tracking-[0.3em] text-black/70">
        <span>{COVER.cue}</span>
        <span aria-hidden className="h-px w-[74px] bg-black/45" />
        <span aria-hidden className="text-[#fa1a1d]">↓</span>
      </div>
    </div>
  );
}
