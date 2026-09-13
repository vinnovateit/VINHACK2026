import Image from "next/image";

import {
  SUPPORTERS,
  TITLE_SPONSOR,
} from "./copy";

const SPONSOR_LOGO = "/figma/sponsor-butterfly.svg";

/**
 * 🛠️ STACKED PAPER EFFECT CONFIGURATION:
 * Tweak these values anytime to adjust how the paper sheets peek out!
 */
export const STACKED_PAPER_CONFIG = {
  // Sheet 1: Peeking out Top-Left
  sheetTopLeft: {
    transform: "translate(5px, -14px) rotate(3deg)",
    backgroundColor: "#d0d0cb",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.22)",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "2px",
  },
  // Sheet 2: Peeking out Bottom-Right
  sheetBottomRight: {
    transform: "translate(5px, 16px) rotate(-3deg)",
    backgroundColor: "#dedede",
    boxShadow: "0 14px 34px rgba(0, 0, 0, 0.26)",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "2px",
  },
};

/**
 * The sheet itself, at its drawn size of 1184 x 758.4.
 *
 * One prominent sponsor on top, and four partner sponsors below that,
 * with no cluttering paragraph copy, framed in authentic newspaper styling.
 */
const SponsorEdition = () => {
  return (
    <div className="relative mx-auto w-[1184px] max-w-full select-none">
      {/* Background stacked paper sheets matching reference comp */}
      {/* Sheet 1: Peeking out Top-Left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={STACKED_PAPER_CONFIG.sheetTopLeft}
      />

      {/* Sheet 2: Peeking out Bottom-Right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={STACKED_PAPER_CONFIG.sheetBottomRight}
      />

      {/* Sheet 3: Main Newspaper Front Page */}
      <div className="w-[1184px] max-w-full h-[758.4px] relative shadow-[0_20px_48px_rgba(0,_0,_0,_0.45),_0_4px_12px_rgba(0,_0,_0,_0.25),_0_16px_40px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.2)] bg-[#ebebe9] overflow-hidden text-left text-[18px] text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif] mx-auto z-10">
        <EditionMasthead />

        {/* Outer newspaper grid frame */}
        <div className="absolute top-[241.13px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />
        <div className="absolute top-[725.73px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />
        <div className="absolute top-[241.13px] left-[29.71px] [border-right:1px_solid_#000] box-border w-[1px] h-[484.6px]" />
        <div className="absolute top-[241.13px] left-[1153.91px] [border-right:1px_solid_#000] box-border w-[1px] h-[484.6px]" />

        {/* Horizontal divider between Title Sponsor and 4 Partners */}
        <div className="absolute top-[441.13px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />

        {/* 1 Sponsor on Top (Title Partner) */}
        <a
          href={TITLE_SPONSOR.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute top-[241.13px] left-[29.71px] w-[1124.2px] h-[200px] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-85"
        >
          <div className="text-[#fa1a1d] text-[19px] font-normal tracking-[0.16em] uppercase mb-2.5">
            {TITLE_SPONSOR.header}
          </div>

          {/* Official Fateh Education Brand Logo */}
          <div className="flex items-center justify-center my-1 transition-transform duration-200 group-hover:scale-[1.03]">
            <Image
              src="/sponsors/fateh.webp"
              alt="Fateh Education"
              width={380}
              height={120}
              className="h-[102px] w-auto object-contain"
              priority
            />
          </div>

          {/* Supporting line */}
          <div className="mt-2.5 text-[16px] font-normal text-[#444] tracking-[0.04em]">
            Backing the builders behind the next big idea.
          </div>
        </a>

        {/* Vertical column dividers between the 4 Partners */}
        <div className="absolute top-[441.13px] left-[310.76px] [border-right:1px_solid_#000] box-border w-[1px] h-[284.6px]" />
        <div className="absolute top-[441.13px] left-[591.81px] [border-right:1px_solid_#000] box-border w-[1px] h-[284.6px]" />
        <div className="absolute top-[441.13px] left-[872.86px] [border-right:1px_solid_#000] box-border w-[1px] h-[284.6px]" />

        {/* 4 Partners below Title Partner */}
        {SUPPORTERS.slice(0, 4).map((partner, i) => (
          <a
            key={i}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute top-[441.13px] w-[281.05px] h-[284.6px] flex flex-col items-center justify-between pt-4 pb-4 px-2.5 text-center cursor-pointer transition-opacity duration-200 hover:opacity-85"
            style={{ left: 29.71 + i * 281.05 }}
          >
            {/* Header: fixed height for universal baseline */}
            <div className="h-[36px] w-full px-2 flex items-center justify-center text-[#fa1a1d] text-[14.5px] font-normal tracking-[0.03em] uppercase leading-[1.25] text-center">
              {partner.header.includes("MUSIC STREAMING") ? (
                <span className="inline-block">
                  // OFFICIAL MUSIC
                  <br />
                  STREAMING PARTNER
                </span>
              ) : (
                <span className="whitespace-nowrap">{partner.header}</span>
              )}
            </div>

            {/* Logo: fixed height container (h-[116px]) ensures exact horizontal centerline alignment */}
            <div className="h-[116px] w-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.05]">
              {partner.name.toLowerCase().includes("abhi") ? (
                /* ABHIBUS */
                <div className="flex items-center justify-center">
                  <Image
                    src="/sponsors/abhibus.webp"
                    alt="AbhiBus"
                    width={200}
                    height={55}
                    className="h-[48px] w-auto object-contain"
                  />
                </div>
              ) : partner.name.toLowerCase().includes("aha") ? (
                /* AHA THERAPY */
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <Image
                    src="/sponsors/aha.webp"
                    alt="Aha Therapy"
                    width={150}
                    height={70}
                    className="h-[52px] w-auto object-contain"
                  />
                  <div className="font-rotonto text-[14px] font-medium tracking-[0.18em] text-[#2d6a4f] uppercase leading-none">
                    Therapy
                  </div>
                </div>
              ) : partner.name.toLowerCase().includes("saavn") ? (
                /* JIO SAAVN */
                <div className="flex items-center justify-center">
                  <Image
                    src="/sponsors/jiosaavn.webp"
                    alt="JioSaavn"
                    width={190}
                    height={60}
                    className="h-[52px] w-auto object-contain"
                  />
                </div>
              ) : (
                /* OLA.CV */
                <div className="flex items-center justify-center">
                  <Image
                    src="/sponsors/ola_cv.webp"
                    alt="ola.cv"
                    width={140}
                    height={65}
                    className="h-[60px] w-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* Tagline: fixed height container (h-[48px]) aligns all 4 taglines at the exact same vertical distance from bottom */}
            <div className="h-[48px] flex items-center justify-center px-1">
              <p className="text-[13.5px] font-light text-[#444] leading-[1.35] max-w-[245px]">
                {partner.tagline || "Great ideas need more than code."}
              </p>
            </div>
          </a>
        ))}

        {/* Newspaper footer strip */}
        <div className="absolute top-[731px] left-[34px] w-[1115px] flex items-center justify-between text-[11px] font-light tracking-[0.08em] text-[#666]">
          <span>VINHACK 2026 // OFFICIAL PARTNER DIRECTORY</span>
          <span>IDEAS × PEOPLE × IMPACT</span>
          <span>VIT VELLORE // 30 HOURS ∞ POSSIBILITIES</span>
        </div>
      </div>
    </div>
  );
};

/**
 * The nameplate band across the top of the sheet: y0 to the rule at y199.7.
 */
function EditionMasthead() {
  return (
    <>
      <div className="absolute top-[31.61px] left-[32.59px] font-light uppercase tracking-[0.04em] text-[15px]">
        VOL. 26 // SPECIAL EDITION
      </div>
      <div className="absolute top-[31.61px] right-[32.59px] font-light text-[15px] tracking-[0.04em] uppercase">
        30 HOURS ∞ POSSIBILITIES
      </div>
      <div className="absolute top-[90px] left-[0] w-full text-center text-[54px] leading-[1] font-light [text-shadow:1.2px_0_0_#000,_0_1.2px_0_#000,_-1.2px_0_0_#000,_0_-1.2px_0_#000] tracking-[0.02em] whitespace-nowrap">
        <span>{`THE `}</span>
        <span className="text-[#fa1a1d]">VINHACK</span>
        <span> PARTNERS</span>
      </div>
      <div className="absolute top-[208px] left-[0] w-full text-center text-[16.5px] font-light tracking-[0.06em] whitespace-nowrap">
        BUILDING BOLD IDEAS // BACKING THE BUILDERS // MAKING IMPACT TOGETHER
      </div>
      <div className="absolute top-[70.13px] left-[29.11px] [border-top:2.2px_solid_#000] box-border w-[1125.4px] h-[2.2px]" />
      <div className="absolute top-[199.73px] left-[29.11px] [border-top:2.2px_solid_#000] box-border w-[1125.4px] h-[2.2px]" />
    </>
  );
}

export default SponsorEdition;
