import Image from "next/image";

import {
  LEDE,
  MUSIC_PARTNER,
  SUPPORTERS,
  TITLE_SPONSOR,
  TRAVEL_PARTNER,
} from "./copy";

const BARCODE_BAR = "/figma/barcode-bar.svg";

/** The column measure, in the sheet's units. Every body column on the page is
 *  set to it, and it is what a column's own furniture is aligned against. */
const COLUMN_W = 235.2;

/**
 * The link at the foot of a column.
 *
 * Given the column's own measure and right-aligned in it, rather than dropped
 * at a hand-placed `left`. The three used to be positioned independently of
 * the copy above them and two of them landed *inside* it — the music column's
 * sat across its third and fourth lines. Aligning to the measure means the
 * only figure that has to be right is where the column ends.
 */
function ReadMore({ top, left }: { top: number; left: number }) {
  return (
    <div
      className="absolute text-right text-[13.2px] font-light text-[#6e6e6e] cursor-pointer [transition:color_0.2s_ease,_transform_0.2s_ease] hover:text-[#fa1a1d] hover:translate-x-[3px]"
      style={{ top, left, width: COLUMN_W }}
    >
      READ MORE →
    </div>
  );
}
const TEAM_IMG = "/about_us/220a17ad3a3ad4382bb239416e67f3f8e44d6413.webp";
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
 * The sheet always prints its own nameplate. It used to take a `header` prop
 * so the collage could swap the band across the top — the volume line, the
 * masthead and the strapline, everything above the first column rule at y241 —
 * for the section's heading as the cover opened. That is gone: the paper is
 * THE HACKSTREET JOURNAL wherever it is shown, and the section says what the
 * section is from outside it. See `FoldedEdition` and `SPONSOR_HEADING`.
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
        <Image className="absolute top-[248.81px] left-[30.19px] w-[246px] h-[158.4px] object-cover [filter:grayscale(100%)_contrast(125%)_brightness(95%)] [border:1.5px_solid_#000]" src={TEAM_IMG} width={246} height={158.4} sizes="100vw" alt="Ideas need people" unoptimized />
        <div className="absolute top-[415.61px] left-[32.59px] text-[31.2px] font-light whitespace-pre-wrap [text-shadow:0.6px_0_0_#000,_0_0.6px_0_#000,_-0.6px_0_0_#000,_0_-0.6px_0_#000] leading-[1.05]">{LEDE.headline}</div>
        <div className="absolute top-[503.21px] left-[33.79px] text-[15.6px] font-light inline-block w-[242.4px] leading-[1.35]">{LEDE.body}</div>
        <div className="absolute h-[10.31%] w-[19.76%] top-[86.45%] right-[77.09%] bottom-[3.24%] left-[3.16%] text-center text-[19.2px]">
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[98.63%] bottom-[35.29%] left-[0%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[97.25%] bottom-[35.29%] left-[2.07%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[95.18%] bottom-[35.29%] left-[4.14%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[90.36%] bottom-[35.29%] left-[7.59%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[88.97%] bottom-[35.29%] left-[10.34%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[86.91%] bottom-[35.29%] left-[11.72%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[83.46%] bottom-[35.29%] left-[15.17%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[80.69%] bottom-[35.29%] left-[18.62%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[77.94%] bottom-[35.29%] left-[21.38%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[76.56%] bottom-[35.29%] left-[22.76%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[73.81%] bottom-[35.29%] left-[24.14%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[70.36%] bottom-[35.29%] left-[28.27%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[68.29%] bottom-[35.29%] left-[30.35%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[65.52%] bottom-[35.29%] left-[33.79%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[64.14%] bottom-[35.29%] left-[35.17%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[61.39%] bottom-[35.29%] left-[37.93%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[60.01%] bottom-[35.29%] left-[39.31%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[56.56%] bottom-[35.29%] left-[42.07%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[53.8%] bottom-[35.29%] left-[45.52%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[51.04%] bottom-[35.29%] left-[48.28%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[47.6%] bottom-[35.29%] left-[51.03%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[46.21%] bottom-[35.29%] left-[53.1%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[44.15%] bottom-[35.29%] left-[54.48%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[40.02%] bottom-[35.29%] left-[57.93%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[38.63%] bottom-[35.29%] left-[60.69%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[35.88%] bottom-[35.29%] left-[62.07%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.78%] top-[0%] right-[32.4%] bottom-[35.29%] left-[64.83%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={6.5} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[30.36%] bottom-[35.29%] left-[68.28%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[28.28%] bottom-[35.29%] left-[71.03%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[24.84%] bottom-[35.29%] left-[73.1%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[22.09%] bottom-[35.29%] left-[75.86%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[20.01%] bottom-[35.29%] left-[79.31%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[17.25%] bottom-[35.29%] left-[81.38%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.78%] top-[0%] right-[13.77%] bottom-[35.29%] left-[83.45%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={6.5} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[11.05%] bottom-[35.29%] left-[86.89%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[9.66%] bottom-[35.29%] left-[89.65%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[7.6%] bottom-[35.29%] left-[91.03%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[2.05%] top-[0%] right-[3.46%] bottom-[35.29%] left-[94.48%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[0.68%] top-[0%] right-[2.08%] bottom-[35.29%] left-[97.24%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className="absolute h-[64.71%] w-[1.37%] top-[0%] right-[0.01%] bottom-[35.29%] left-[98.62%] max-w-full overflow-hidden max-h-full bg-black" src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <div className="absolute w-[160.8px] top-[70.59%] left-[11.79%] font-light inline-block tracking-[0.1em] text-[16px]">VINHACK2026</div>
        </div>
        <div className="absolute top-[260.81px] left-[570.19px] font-light text-[#fa1a1d]">{MUSIC_PARTNER.header}</div>
        <div className="absolute top-[261.94px] left-[305.08px] text-[28.8px] font-light text-[#fa1a1d]">{TITLE_SPONSOR.header}</div>
        <div className="absolute top-[466.01px] left-[568.99px] font-light text-[#fa1a1d]">{TRAVEL_PARTNER.header}</div>
        <div className="absolute top-[260.81px] left-[842.59px] font-light text-[#fa1a1d]">{SUPPORTERS[0].header}</div>
        <div className="absolute top-[383.82px] left-[840.63px] font-light text-[#fa1a1d]">{SUPPORTERS[1].header}</div>
        <div className="absolute top-[514.6px] left-[838.35px] font-light text-[#fa1a1d]">{SUPPORTERS[2].header}</div>
        <div className="absolute top-[634.58px] left-[836.25px] font-light text-[#fa1a1d]">{SUPPORTERS[3].header}</div>
        <Image className="absolute h-[10.5%] top-[44.21%] bottom-[45.29%] left-[calc(50%_-_295.61px)] max-h-full w-[88.9px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={88.9} height={79.6} sizes="100vw" alt="Title Sponsor" unoptimized />
        <Image className="absolute h-[8.07%] top-[39.45%] bottom-[52.48%] left-[calc(50%_-_22.01px)] max-h-full w-[68.4px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="Music Streaming Partner" unoptimized />
        <Image className="absolute h-[8.07%] top-[66.51%] bottom-[25.42%] left-[calc(50%_-_23.21px)] max-h-full w-[68.4px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="Travel Booking Partner" unoptimized />
        <Image className="absolute h-[8.07%] top-[39.45%] bottom-[52.48%] left-[calc(50%_+_250.39px)] max-h-full w-[68.4px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <Image className="absolute h-[8.07%] top-[55.7%] bottom-[36.23%] left-[calc(50%_+_247.76px)] max-h-full w-[68.4px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <Image className="absolute h-[8.07%] top-[72.47%] bottom-[19.46%] left-[calc(50%_+_245.53px)] max-h-full w-[68.4px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <Image className="absolute h-[8.07%] top-[88.29%] bottom-[3.64%] left-[calc(50%_+_243.44px)] max-h-full w-[68.4px] opacity-[0.88] object-contain" src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <div className="absolute top-[341.82px] left-[405.7px] text-[25.17px] font-light text-[#3b3b3b] inline-block w-[146.6px] h-[74.9px] leading-[1.08]">{TITLE_SPONSOR.name}</div>
        <div className="absolute top-[306.41px] left-[674.59px] text-[19.36px] font-light text-[#3b3b3b] inline-block w-[112.8px] h-[57.6px] leading-[1.08]">{MUSIC_PARTNER.name}</div>
        <div className="absolute top-[511.61px] left-[673.39px] text-[19.36px] font-light text-[#3b3b3b] inline-block w-[112.8px] h-[57.6px] leading-[1.08]">{TRAVEL_PARTNER.name}</div>
        <div className="absolute top-[306.41px] left-[946.99px] text-[19.36px] font-light text-[#3b3b3b] inline-block w-[112.8px] h-[57.6px] leading-[1.08]">{SUPPORTERS[0].name}</div>
        <div className="absolute top-[423.84px] left-[944.35px] text-[19.36px] font-light text-[#3b3b3b] inline-block w-[112.8px] h-[57.6px] leading-[1.08]">{SUPPORTERS[1].name}</div>
        <div className="absolute top-[553.42px] left-[942.08px] text-[19.36px] font-light text-[#3b3b3b] inline-block w-[112.8px] h-[57.6px] leading-[1.08]">{SUPPORTERS[2].name}</div>
        <div className="absolute top-[673.41px] left-[939.99px] text-[19.36px] font-light text-[#3b3b3b] inline-block w-[112.8px] h-[57.6px] leading-[1.08]">{SUPPORTERS[3].name}</div>
        <div className="absolute top-[457.97px] left-[301.65px] font-light inline-block w-[235.2px] leading-[1.35] text-[14.4px]">{TITLE_SPONSOR.sheet}</div>
        <ReadMore top={706.4} left={301.65} />
        <ReadMore top={437.2} left={570.19} />
        <ReadMore top={706.4} left={568.99} />
        <div className="absolute top-[372.41px] left-[570.19px] font-light inline-block w-[235.2px] leading-[1.35] text-[14px]">{MUSIC_PARTNER.sheet}</div>
        <div className="absolute top-[577.61px] left-[568.99px] font-light inline-block w-[235.2px] leading-[1.35] text-[14px]">{TRAVEL_PARTNER.sheet}</div>
        <div className="absolute top-[372.12px] left-[816.34px] [border-top:1px_solid_#000] box-border w-[331px] h-[1px]" />
        <div className="absolute top-[499.36px] left-[817.72px] [border-top:1px_solid_#000] box-border w-[331px] h-[1px]" />
        <div className="absolute top-[624.21px] left-[819.14px] [border-top:1px_solid_#000] box-border w-[331px] h-[1px]" />
        <div className="absolute top-[241.13px] left-[29.71px] [border-top:1px_solid_#000] box-border w-[1124.2px] h-[1px]" />
        <div className="absolute top-[241.13px] left-[282.91px] [border-right:1px_solid_#000] box-border w-[1px] h-[484.6px]" />
        <div className="absolute top-[241.13px] left-[550.51px] [border-right:1px_solid_#000] box-border w-[1px] h-[484.6px]" />
        <div className="absolute top-[241.13px] left-[818.11px] [border-right:1px_solid_#000] box-border w-[1px] h-[484.6px]" />
        <div className="absolute top-[457.61px] left-[550.81px] [border-top:1px_solid_#000] box-border w-[268.6px] h-[1px]" />
      </div>
    </div>
  );
};

/**
 * The nameplate band across the top of the sheet: y0 to the rule at y199.7.
 *
 * Its own component because it is one band of the drawing rather than one
 * element of it — the volume line, the nameplate, the strapline and the two
 * heavy rules that bracket them — and because keeping it separate is what
 * makes the sheet's own structure legible in among 60 absolutely-placed boxes.
 * Everything keeps the offsets Figma gave it.
 */
function EditionMasthead() {
  return (
    <>
      <div className="absolute top-[31.61px] left-[32.59px] font-light whitespace-pre-wrap">Vol 26  // SPECIAL SPONSOR EDITION</div>
      <div className="absolute top-[31.61px] left-[961.39px] font-light">30 hours ∞ possibilities</div>
      <div className="absolute top-[94px] left-[0] w-full text-center text-[70px] leading-[1] font-light [text-shadow:1.2px_0_0_#000,_0_1.2px_0_#000,_-1.2px_0_0_#000,_0_-1.2px_0_#000] tracking-[0.015em] whitespace-nowrap">
        <span>{`THE `}</span>
        <span className="text-[#fa1a1d]">HACKSTREET</span>
        <span> JOURNAL</span>
      </div>
      <div className="absolute top-[210.41px] left-[0] w-full text-center text-[18px] font-light tracking-[0.04em] whitespace-nowrap">SOLVE WHAT MATTERS // BUILD BEYOND THE OBVIOUS // SOLVE WHAT MATTERS // BUILD BEYOND THE OBVIOUS //</div>
      <div className="absolute top-[70.13px] left-[29.11px] [border-top:2.2px_solid_#000] box-border w-[1125.4px] h-[2.2px]" />
      <div className="absolute top-[199.73px] left-[29.11px] [border-top:2.2px_solid_#000] box-border w-[1125.4px] h-[2.2px]" />
    </>
  );
}

export default SponsorEdition;
