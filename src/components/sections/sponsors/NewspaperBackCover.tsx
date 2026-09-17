/**
 * Authentic reverse side (Page 2) of the newspaper front page.
 * Displayed when the cover turns past 90 degrees in 3D.
 */
export default function NewspaperBackCover() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-[36px] text-black select-none [font-family:var(--font-rotonto),_Rotonto,_sans-serif] bg-[#e5e5e0] overflow-hidden">
      {/* Newspaper double border */}
      <div className="absolute inset-[16px] border-[1.5px] border-black pointer-events-none" />
      <div className="absolute inset-[20px] border-[0.75px] border-black pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10">
        <div className="flex items-center justify-between text-[13px] uppercase tracking-[0.1em] text-black/80 font-medium">
          <span>THE VINHACK GAZETTE</span>
          <span>PAGE 2 · EDITORIAL &amp; INDEX</span>
          <span>FEBRUARY 2026</span>
        </div>
        <div className="mt-2 w-full border-t-[1.5px] border-black" />
      </div>

      {/* 3-Column Newspaper Article Grid */}
      <div className="relative z-10 my-auto grid grid-cols-3 gap-6 h-[540px] pt-4 pb-2">
        {/* Column 1: Editorial */}
        <div className="flex flex-col justify-between border-r border-black/25 pr-5">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#fa1a1d]">
              EDITORIAL NOTE
            </span>
            <h3 className="mt-1 text-[24px] font-bold leading-[1.08] tracking-tight uppercase">
              THE SPIRIT OF THE BUILD
            </h3>
            <div className="my-2.5 w-full border-t border-black/40" />
            <p className="text-[12px] leading-[1.65] text-black/85 text-justify font-sans">
              <span className="float-left text-[38px] leading-[0.8] font-bold mr-2 mt-1 font-rotonto text-[#fa1a1d]">
                W
              </span>
              ELCOME to VinHack 2026. Over the next thirty hours, extraordinary
              teams converge in Vellore to push the boundaries of technology,
              design, and creative problem solving. From autonomous intelligence
              to decentralized networks, the floor belongs to the builders.
            </p>
            <p className="mt-3 text-[12px] leading-[1.65] text-black/75 text-justify font-sans">
              Every revolution began as an idea debated at 3:00 AM on a whiteboard.
              We extend our deepest gratitude to the visionary partners whose
              support makes this platform possible for every developer here today.
            </p>
          </div>

          <div className="pt-3 border-t border-dashed border-black/30">
            <div className="text-[11px] uppercase tracking-wider font-bold text-black/70">
              VELLORE INSTITUTE OF TECHNOLOGY
            </div>
            <div className="text-[10px] text-black/50 tracking-widest uppercase mt-0.5">
              VINNOVATEIT · SPECIAL PRINT
            </div>
          </div>
        </div>

        {/* Column 2: Index & Numbers */}
        <div className="flex flex-col justify-between border-r border-black/25 pr-5">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#fa1a1d]">
              EDITION SUMMARY
            </span>
            <h3 className="mt-1 text-[24px] font-bold leading-[1.08] tracking-tight uppercase">
              OFFICIAL DIRECTORY
            </h3>
            <div className="my-2.5 w-full border-t border-black/40" />

            <div className="space-y-3 font-sans text-[12px]">
              <div className="flex items-baseline justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">TITLE SPONSOR</span>
                <span className="font-rotonto text-[11px] text-[#fa1a1d]">FATEH EDUCATION</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">TRAVEL PARTNER</span>
                <span className="font-rotonto text-[11px]">ABHIBUS</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">WELLNESS PARTNER</span>
                <span className="font-rotonto text-[11px]">AHA THERAPY</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">STREAMING PARTNER</span>
                <span className="font-rotonto text-[11px]">JIOSAAVN</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-black/15 pb-1.5">
                <span className="font-bold">PORTFOLIO PARTNER</span>
                <span className="font-rotonto text-[11px]">OLA.CV</span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-black/5 rounded-[2px] border border-black/15 text-center">
              <div className="font-rotonto text-[13px] font-bold tracking-wide uppercase text-black">
                30 HOURS ∞ POSSIBILITIES
              </div>
              <div className="font-sans text-[10.5px] text-black/60 uppercase tracking-widest mt-1">
                VIT VELLORE · CHENNAI · WORLDWIDE
              </div>
            </div>
          </div>

          {/* Faux Barcode stamp */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-[2px] h-[30px] items-end">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 1, 2].map((w, idx) => (
                <div key={idx} className="bg-black/75 h-full" style={{ width: `${w}px` }} />
              ))}
            </div>
            <span className="text-[10px] font-mono tracking-widest text-black/50">
              VIN-2026-SPON
            </span>
          </div>
        </div>

        {/* Column 3: The Call to Build */}
        <div className="flex flex-col justify-between pl-1">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#fa1a1d]">
              BUILDERS&apos; MANIFESTO
            </span>
            <h3 className="mt-1 text-[24px] font-bold leading-[1.08] tracking-tight uppercase">
              CODE. SHIP. DISRUPT.
            </h3>
            <div className="my-2.5 w-full border-t border-black/40" />

            <div className="p-3 bg-[#fa1a1d]/10 border-l-[3px] border-[#fa1a1d] my-3">
              <p className="font-rotonto text-[13.5px] leading-snug uppercase text-[#fa1a1d] font-bold">
                &ldquo;WE DO NOT JUST PREDICT THE FUTURE. WE DEPLOY IT.&rdquo;
              </p>
            </div>

            <p className="text-[12px] leading-[1.65] text-black/85 text-justify font-sans">
              To every hacker opening this edition: test your hypotheses, break
              assumptions, and build tools that empower the people around you.
              The stage is yours.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-black/25 pt-3 text-[11px] uppercase tracking-wider text-black/60 font-medium">
            <span>VINNOVATEIT ARCHIVES</span>
            <span className="font-rotonto text-black">VOL. 26</span>
          </div>
        </div>
      </div>

      {/* Bottom Colophon */}
      <div className="relative z-10 border-t border-black pt-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-black/60 font-sans">
        <span>AUTHENTIC BROADSHEET REVERSE</span>
        <span>TURN TO PAGE 3 FOR SPECIAL SUPPORTERS →</span>
      </div>

      {/* Inner spine crease shadow on the right (hinge side when flipped 180deg) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[42px] bg-[linear-gradient(270deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.12)_45%,rgba(0,0,0,0)_100%)]"
      />
    </div>
  );
}
