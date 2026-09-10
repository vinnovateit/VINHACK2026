import type { NextPage } from 'next';
import Image from "next/image";
import styles from './index.module.css';

const BARCODE_BAR = "/figma/barcode-bar.svg";
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

const SponsorEdition: NextPage = () => {
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
      <div className={`${styles.vol26SpecialSponsorEditParent} relative z-10 shadow-[0_16px_40px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.2)]`}>
        <div className={styles.vol26}>Vol 26  // SPECIAL SPONSOR EDITION</div>
        <div className={styles.hoursPossibilities}>30 hours ∞ possibilities</div>
        <div className={styles.theHackstreetJournalContainer}>
          <span>{`THE `}</span>
          <span className={styles.hackstreet}>HACKSTREET</span>
          <span> JOURNAL</span>
        </div>
        <div className={styles.solveWhatMatters}>SOLVE WHAT MATTERS // BUILD BEYOND THE OBVIOUS // SOLVE WHAT MATTERS // BUILD BEYOND THE OBVIOUS //</div>
        <Image className={styles.frameChild} src={TEAM_IMG} width={246} height={158.4} sizes="100vw" alt="Ideas need people" unoptimized />
        <div className={styles.ideasNeedPeople}>IDEAS  NEED<br />PEOPLE.</div>
        <div className={styles.atVinhack26}>At Vinhack ’26, we believe great ideas don’t happen in isolation. Our sponsors power the 36-hour journey — enabling builders, backing possibilities, and helping turn bold ideas into real impact.</div>
        <div className={styles.group}>
          <Image className={styles.vectorIcon} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon2} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon3} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon4} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon5} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon6} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon7} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon8} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon9} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon10} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon11} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon12} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon13} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon14} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon15} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon16} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon17} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon18} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon19} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon20} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon21} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon22} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon23} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon24} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon25} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon26} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon27} src={BARCODE_BAR} width={6.5} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon28} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon29} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon30} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon31} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon32} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon33} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon34} src={BARCODE_BAR} width={6.5} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon35} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon36} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon37} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon38} src={BARCODE_BAR} width={4.8} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon39} src={BARCODE_BAR} width={1.6} height={50.6} sizes="100vw" alt="" unoptimized />
          <Image className={styles.vectorIcon40} src={BARCODE_BAR} width={3.2} height={50.6} sizes="100vw" alt="" unoptimized />
          <div className={styles.vinhack2026}>VINHACK2026</div>
        </div>
        <div className={styles.musicStreamingPartner}>{"// Music Streaming Partner"}</div>
        <div className={styles.titleSponsor}>{"// Title Sponsor"}</div>
        <div className={styles.travelBookingPartner}>{"// Travel Booking Partner"}</div>
        <div className={styles.xyzPartner}>{"// XYZ Partner"}</div>
        <div className={styles.xyzPartner2}>{"// XYZ Partner"}</div>
        <div className={styles.xyzPartner3}>{"// XYZ Partner"}</div>
        <div className={styles.xyzPartner4}>{"// XYZ Partner"}</div>
        <Image className={styles.vectorIcon41} src={SPONSOR_LOGO} width={88.9} height={79.6} sizes="100vw" alt="Title Sponsor" unoptimized />
        <Image className={styles.vectorIcon42} src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="Music Streaming Partner" unoptimized />
        <Image className={styles.vectorIcon43} src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="Travel Booking Partner" unoptimized />
        <Image className={styles.vectorIcon44} src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <Image className={styles.vectorIcon45} src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <Image className={styles.vectorIcon46} src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <Image className={styles.vectorIcon47} src={SPONSOR_LOGO} width={68.4} height={61.2} sizes="100vw" alt="XYZ Partner" unoptimized />
        <div className={styles.companyName}>COMPANY <br />NAME</div>
        <div className={styles.companyName2}>COMPANY <br />NAME</div>
        <div className={styles.companyName3}>COMPANY <br />NAME</div>
        <div className={styles.companyName4}>COMPANY <br />NAME</div>
        <div className={styles.companyName5}>COMPANY <br />NAME</div>
        <div className={styles.companyName6}>COMPANY <br />NAME</div>
        <div className={styles.companyName7}>COMPANY <br />NAME</div>
        <div className={styles.loremIpsumDolor}>{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do `}</div>
        <div className={styles.readMore}>READ MORE →</div>
        <div className={styles.readMore2}>READ MORE →</div>
        <div className={styles.readMore3}>READ MORE →</div>
        <div className={styles.loremIpsumDolor2}>{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do `}</div>
        <div className={styles.loremIpsumDolor3}>{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do , Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do , Lorem ipsum dolor sit amet, consectetur `}</div>
        <div className={styles.frameItem} />
        <div className={styles.frameInner} />
        <div className={styles.lineDiv} />
        <div className={styles.frameChild2} />
        <div className={styles.frameChild3} />
        <div className={styles.frameChild4} />
        <div className={styles.frameChild5} />
        <div className={styles.frameChild6} />
        <div className={styles.frameChild7} />
        <div className={styles.frameChild8} />
      </div>
    </div>
  );
};

export default SponsorEdition;
