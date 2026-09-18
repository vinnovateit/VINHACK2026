import Image from "next/image";

import {
  SUPPORTERS,
  TITLE_SPONSOR,
} from "./copy";

/**
 * Stacked paper sheets background effect
 */
export const STACKED_PAPER_CONFIG = {
  sheetTopLeft: {
    transform: "translate(5px, -14px) rotate(3deg)",
    backgroundColor: "#d0d0cb",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.22)",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "2px",
  },
  sheetBottomRight: {
    transform: "translate(5px, 16px) rotate(-3deg)",
    backgroundColor: "#dedede",
    boxShadow: "0 14px 34px rgba(0, 0, 0, 0.26)",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "2px",
  },
};

/**
 * The sheet itself.
 * Desktop: 1184 x 860 landscape broadsheet.
 * Mobile flow: 480 x 760 portrait tabloid edition with 2x2 partner grid.
 */
const SponsorEdition = ({
  variant = "canvas",
}: {
  variant?: "canvas" | "flow";
} = {}) => {
  if (variant === "flow") {
    return <MobileSponsorEdition />;
  }

  return (
    <div className="relative mx-auto w-[1184px] max-w-full select-none">
      {/* Stacked paper sheets */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={STACKED_PAPER_CONFIG.sheetTopLeft}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={STACKED_PAPER_CONFIG.sheetBottomRight}
      />

      {/* Main Newspaper Front Page */}
      <div className="w-[1184px] max-w-full h-[860px] relative shadow-[0_20px_48px_rgba(0,_0,_0,_0.45),_0_4px_12px_rgba(0,_0,_0,_0.25),_0_16px_40px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.2)] bg-[#ebebe9] overflow-hidden text-left text-[18px] text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif] mx-auto z-10">
        <EditionMasthead />

        {/* Outer newspaper grid frame */}
        <div className="absolute top-[241.13px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />
        <div className="absolute top-[828px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />
        <div className="absolute top-[241.13px] left-[29.71px] [border-right:1px_solid_#000] box-border w-[1px] h-[587px]" />
        <div className="absolute top-[241.13px] left-[1153.91px] [border-right:1px_solid_#000] box-border w-[1px] h-[587px]" />

        {/* Horizontal divider between Title Sponsor and 4 Partners */}
        <div className="absolute top-[471.13px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />

        {/* Title Partner: Fateh Education */}
        <a
          href={TITLE_SPONSOR.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute top-[241.13px] left-[29.71px] w-[1124.2px] h-[230px] flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="text-[#fa1a1d] text-[20px] font-bold tracking-[0.16em] uppercase mb-2.5">
            {TITLE_SPONSOR.header}
          </div>

          <div className="flex items-center justify-center my-1.5 transition-transform duration-200 group-hover:scale-[1.02]">
            <Image
              src="/sponsors/fateh.webp"
              alt="Fateh Education"
              width={420}
              height={135}
              className="h-[115px] w-auto object-contain"
              priority
            />
          </div>

          <div className="mt-2 text-[17px] font-medium text-[#222] tracking-[0.03em]">
            {TITLE_SPONSOR.tagline}
          </div>
        </a>

        {/* Vertical column dividers between the 4 Partners */}
        <div className="absolute top-[471.13px] left-[310.76px] [border-right:1px_solid_#000] box-border w-[1px] h-[356.87px]" />
        <div className="absolute top-[471.13px] left-[591.81px] [border-right:1px_solid_#000] box-border w-[1px] h-[356.87px]" />
        <div className="absolute top-[471.13px] left-[872.86px] [border-right:1px_solid_#000] box-border w-[1px] h-[356.87px]" />

        {/* 4 Partners below Title Partner */}
        {SUPPORTERS.slice(0, 4).map((partner, i) => (
          <a
            key={i}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute top-[471.13px] w-[281.05px] h-[356.87px] flex flex-col items-center justify-between pt-5 pb-5 px-3 text-center cursor-pointer"
            style={{ left: 29.71 + i * 281.05 }}
          >
            {/* Header */}
            <div className="h-[40px] w-full px-2 flex items-center justify-center text-[#fa1a1d] text-[15px] font-bold tracking-[0.04em] uppercase leading-[1.25] text-center">
              {partner.header.includes("MUSIC STREAMING") ? (
                <span className="inline-block font-bold">
                  OFFICIAL MUSIC
                  <br />
                  STREAMING PARTNER
                </span>
              ) : (
                <span className="whitespace-nowrap font-bold">{partner.header}</span>
              )}
            </div>

            {/* Logo */}
            <div className="h-[140px] w-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.04]">
              {partner.name.toLowerCase().includes("abhi") ? (
                <div className="flex items-center justify-center">
                  <Image
                    src="/sponsors/abhibus.webp"
                    alt="AbhiBus"
                    width={220}
                    height={65}
                    className="h-[58px] w-auto object-contain"
                  />
                </div>
              ) : partner.name.toLowerCase().includes("aha") ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Image
                    src="/sponsors/aha.webp"
                    alt="Aha Therapy"
                    width={165}
                    height={80}
                    className="h-[60px] w-auto object-contain"
                  />
                  <div className="font-rotonto text-[15px] font-bold tracking-[0.18em] text-[#2d6a4f] uppercase leading-none">
                    Therapy
                  </div>
                </div>
              ) : partner.name.toLowerCase().includes("saavn") ? (
                <div className="flex items-center justify-center">
                  <Image
                    src="/sponsors/jiosaavn.webp"
                    alt="JioSaavn"
                    width={210}
                    height={70}
                    className="h-[60px] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Image
                    src="/sponsors/ola_cv.webp"
                    alt="ola.cv"
                    width={155}
                    height={75}
                    className="h-[68px] w-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* Tagline */}
            <div className="h-[52px] flex items-center justify-center px-1">
              <p className="text-[14.5px] font-medium text-[#222] leading-[1.3] max-w-[245px]">
                {partner.tagline}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

function EditionMasthead() {
  return (
    <>
      <div className="absolute top-[32px] left-[29.11px] [border-top:2.2px_solid_#000] box-border w-[1125.4px] h-[2.2px]" />
      <div className="absolute top-[72px] left-0 w-full text-center text-[54px] leading-[1] font-bold [text-shadow:1.2px_0_0_#000,_0_1.2px_0_#000,_-1.2px_0_0_#000,_0_-1.2px_0_#000] tracking-[0.02em] whitespace-nowrap">
        <span>{`THE `}</span>
        <span className="text-[#fa1a1d]">VINHACK</span>
        <span> PARTNERS</span>
      </div>
      <div className="absolute top-[152px] left-0 w-full text-center text-[16.5px] font-bold tracking-[0.06em] whitespace-nowrap">
        BUILDING BOLD IDEAS · BACKING THE BUILDERS · 30 HOURS OF CODE
      </div>
      <div className="absolute top-[199.73px] left-[29.11px] [border-top:2.2px_solid_#000] box-border w-[1125.4px] h-[2.2px]" />
    </>
  );
}

/**
 * Mobile portrait tabloid broadsheet (480 x 760).
 * Prominent title sponsor and 2x2 grid for 4 partners with large, legible typography.
 */
function MobileSponsorEdition() {
  return (
    <div className="relative mx-auto w-[480px] max-w-full select-none">
      {/* Stacked paper sheets background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          transform: "translate(3px, -8px) rotate(2deg)",
          backgroundColor: "#d0d0cb",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.22)",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "2px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          transform: "translate(3px, 10px) rotate(-2deg)",
          backgroundColor: "#dedede",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.26)",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "2px",
        }}
      />

      {/* Main Newspaper Sheet */}
      <div className="w-[480px] max-w-full h-[760px] relative shadow-[0_20px_48px_rgba(0,_0,_0,_0.45),_0_4px_12px_rgba(0,_0,_0,_0.25)] bg-[#ebebe9] overflow-hidden text-left text-black [font-family:var(--font-rotonto),_Rotonto,_sans-serif] mx-auto z-10">
        {/* Mobile Masthead */}
        <div className="absolute top-[16px] left-[16px] [border-top:2px_solid_#000] box-border w-[448px] h-[2px]" />
        <div className="absolute top-[26px] left-0 w-full text-center text-[30px] leading-tight font-bold [text-shadow:1px_0_0_#000,_0_1px_0_#000,_-1px_0_0_#000,_0_-1px_0_#000] tracking-[0.02em] whitespace-nowrap">
          <span>THE </span>
          <span className="text-[#fa1a1d]">VINHACK</span>
          <span> PARTNERS</span>
        </div>
        <div className="absolute top-[68px] left-0 w-full text-center text-[10.5px] font-bold tracking-[0.06em] whitespace-nowrap text-[#111]">
          BUILDING BOLD IDEAS · BACKING THE BUILDERS · 30 HOURS OF CODE
        </div>
        <div className="absolute top-[92px] left-[16px] [border-top:2px_solid_#000] box-border w-[448px] h-[2px]" />

        {/* Outer newspaper grid frame */}
        <div className="absolute top-[104px] left-[16px] [border-top:1px_solid_#000] box-border w-[448px] h-[1px]" />
        <div className="absolute top-[736px] left-[16px] [border-top:1px_solid_#000] box-border w-[448px] h-[1px]" />
        <div className="absolute top-[104px] left-[16px] [border-right:1px_solid_#000] box-border w-[1px] h-[632px]" />
        <div className="absolute top-[104px] left-[464px] [border-right:1px_solid_#000] box-border w-[1px] h-[632px]" />

        {/* Title Partner: Fateh Education */}
        <a
          href={TITLE_SPONSOR.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute top-[104px] left-[16px] w-[448px] h-[220px] flex flex-col items-center justify-center p-3 cursor-pointer"
        >
          <div className="text-[#fa1a1d] text-[16px] font-bold tracking-[0.16em] uppercase mb-1.5">
            {TITLE_SPONSOR.header}
          </div>

          <div className="flex items-center justify-center my-1 transition-transform duration-200 group-hover:scale-[1.03]">
            <Image
              src="/sponsors/fateh.webp"
              alt="Fateh Education"
              width={340}
              height={108}
              className="h-[84px] w-auto object-contain"
              priority
            />
          </div>

          <div className="mt-1.5 text-[14px] font-medium text-[#222] tracking-[0.02em] text-center px-4">
            {TITLE_SPONSOR.tagline}
          </div>
        </a>

        {/* Horizontal divider between Title Sponsor and 4 Partners */}
        <div className="absolute top-[324px] left-[16px] [border-top:1px_solid_#000] box-border w-[448px] h-[1px]" />

        {/* Vertical divider down the middle of the 2x2 grid */}
        <div className="absolute top-[324px] left-[240px] [border-right:1px_solid_#000] box-border w-[1px] h-[412px]" />

        {/* Horizontal divider between Row 1 and Row 2 of partners */}
        <div className="absolute top-[530px] left-[16px] [border-top:1px_solid_#000] box-border w-[448px] h-[1px]" />

        {/* 4 Partners in 2x2 Grid */}
        {SUPPORTERS.slice(0, 4).map((partner, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const left = 16 + col * 224;
          const top = 324 + row * 206;

          return (
            <a
              key={i}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group absolute w-[224px] h-[206px] flex flex-col items-center justify-between pt-3.5 pb-3 px-2.5 text-center cursor-pointer"
              style={{ left, top }}
            >
              {/* Header */}
              <div className="h-[34px] w-full px-1 flex items-center justify-center text-[#fa1a1d] text-[12.5px] font-bold tracking-[0.03em] uppercase leading-[1.2] text-center">
                {partner.header.includes("MUSIC STREAMING") ? (
                  <span className="inline-block font-bold">
                    OFFICIAL MUSIC
                    <br />
                    STREAMING PARTNER
                  </span>
                ) : (
                  <span className="whitespace-nowrap font-bold">{partner.header}</span>
                )}
              </div>

              {/* Logo */}
              <div className="h-[90px] w-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.04]">
                {partner.name.toLowerCase().includes("abhi") ? (
                  <Image
                    src="/sponsors/abhibus.webp"
                    alt="AbhiBus"
                    width={180}
                    height={54}
                    className="h-[52px] w-auto object-contain"
                  />
                ) : partner.name.toLowerCase().includes("aha") ? (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Image
                      src="/sponsors/aha.webp"
                      alt="Aha Therapy"
                      width={140}
                      height={65}
                      className="h-[50px] w-auto object-contain"
                    />
                    <div className="font-rotonto text-[13px] font-bold tracking-[0.18em] text-[#2d6a4f] uppercase leading-none">
                      Therapy
                    </div>
                  </div>
                ) : partner.name.toLowerCase().includes("saavn") ? (
                  <Image
                    src="/sponsors/jiosaavn.webp"
                    alt="JioSaavn"
                    width={170}
                    height={56}
                    className="h-[50px] w-auto object-contain"
                  />
                ) : (
                  <Image
                    src="/sponsors/ola_cv.webp"
                    alt="ola.cv"
                    width={130}
                    height={62}
                    className="h-[54px] w-auto object-contain"
                  />
                )}
              </div>

              {/* Tagline */}
              <div className="h-[40px] flex items-center justify-center px-1">
                <p className="text-[12px] font-medium text-[#222] leading-[1.25] max-w-[200px] line-clamp-2">
                  {partner.tagline}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default SponsorEdition;
