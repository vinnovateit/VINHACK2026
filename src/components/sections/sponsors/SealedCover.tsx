import WordmarkArt from "@/components/hero/WordmarkArt";
import { COVER, SPONSOR_HEADING } from "./copy";

/**
 * Clean, bold front page cover for the sponsor edition.
 * Features the VinHack hero logo and prominent "OUR SPONSORS" presentation.
 */
export default function SealedCover() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-[32px] text-black select-none [font-family:var(--font-rotonto),_Rotonto,_sans-serif] bg-[#ebebe9]">
      {/* Top Masthead Header Bar */}
      <div>
        <div className="flex items-center justify-between text-[15px] font-normal uppercase tracking-[0.05em] text-black">
          <span>{COVER.volume}</span>
          <span className="text-[#fa1a1d]">30 HOURS ∞ POSSIBILITIES</span>
        </div>
        <div className="mt-3 w-full border-t-[2.2px] border-black" />
      </div>

      {/* Main Center Stage: VinHack Hero Logo & Our Sponsors */}
      <div className="my-auto flex flex-col items-center justify-center text-center py-4">
        {/* VinHack Hero Wordmark */}
        <div className="relative w-[780px] max-w-[90%] h-[210px] flex items-center justify-center">
          <WordmarkArt />
        </div>

        {/* Thick divider bar */}
        <div className="mt-6 w-[560px] max-w-[80%] border-t-[2.4px] border-black" />

        {/* Section Heading */}
        <h2 className="mt-5 font-rotonto font-normal text-[64px] sm:text-[72px] leading-[0.92] tracking-tight uppercase text-[#fa1a1d] [text-shadow:1.2px_0_0_#000,_0_1.2px_0_#000,_-1.2px_0_0_#000,_0_-1.2px_0_#000]">
          {SPONSOR_HEADING.title}
        </h2>

        <p className="mt-4 font-rotonto text-[17px] font-normal tracking-[0.2em] uppercase text-[#333]">
          {SPONSOR_HEADING.tagline}
        </p>
      </div>

      {/* Bottom Footer Band */}
      <div>
        <div className="w-full border-t-[1.8px] border-black" />
        <div className="mt-3 flex items-center justify-between text-[13px] font-normal uppercase tracking-[0.14em] text-black/70">
          <span>{COVER.colophon}</span>
          <div className="flex items-center gap-2 text-[#fa1a1d] font-medium">
            <span>SCROLL TO OPEN</span>
            <span className="text-base">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
