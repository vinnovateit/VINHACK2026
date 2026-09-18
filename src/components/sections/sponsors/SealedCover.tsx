import WordmarkArt from "@/components/hero/WordmarkArt";
import { SPONSOR_HEADING } from "./copy";

/**
 * Clean, bold front page cover for the sponsor edition.
 * Features the VinHack hero logo (unstretched with native aspect ratio)
 * and prominent "OUR SPONSORS" presentation.
 */
export default function SealedCover() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[32px] text-black select-none [font-family:var(--font-rotonto),_Rotonto,_sans-serif] bg-[#ebebe9]">
      {/* Main Center Stage: VinHack Hero Logo & Our Sponsors */}
      <div className="flex flex-col items-center justify-center text-center w-full max-w-[760px] py-4">
        {/* VinHack Hero Wordmark - strictly preserving native 1023.16/357.889 aspect ratio */}
        <div className="relative w-full max-w-[680px] aspect-[1023.16/357.889] flex items-center justify-center">
          <WordmarkArt preserveAspectRatio="xMidYMid meet" />
        </div>

        {/* Thick divider bar */}
        <div className="mt-8 w-[520px] max-w-[85%] border-t-[2.4px] border-black" />

        {/* Section Heading */}
        <h2 className="mt-6 font-rotonto font-normal text-[60px] sm:text-[72px] leading-[0.92] tracking-tight uppercase text-[#fa1a1d] [text-shadow:1.2px_0_0_#000,_0_1.2px_0_#000,_-1.2px_0_0_#000,_0_-1.2px_0_#000]">
          {SPONSOR_HEADING.title}
        </h2>

        <p className="mt-4 font-rotonto text-[16px] sm:text-[18px] font-normal tracking-[0.2em] uppercase text-[#333]">
          {SPONSOR_HEADING.tagline}
        </p>
      </div>
    </div>
  );
}
