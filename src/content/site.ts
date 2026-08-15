/**
 * Everything the page says, in one place.
 *
 * The site is drawn twice — the 1280px Figma collage in `components/sections/`
 * at `md` and up, and the reflowed single column in `components/mobile/` below
 * it. The two arrangements are genuinely different drawings and share no
 * markup, so the one thing they must not each hold a copy of is the words: a
 * date corrected on the collage and missed on the phone is a wrong date shipped
 * to whoever is holding a phone.
 *
 * So this module owns the copy and the two layouts own the positions. Nothing
 * here describes appearance beyond the colour a piece is drawn in, which is
 * part of how the design identifies it — MESSIT is the blue card in both
 * layouts, GITHUB the cyan tab.
 */

/* --------------------------------------------------------------- hero */

export const HERO = {
  nav: { lead: "HOME", follow: "EXPLORE" },
  lede: "Where ideas become prototypes and prototypes become possibilities. VinHack brings together curious minds, creative thinkers, and passionate developers to build, learn, and innovate in just 36 hours.",
  commit: 'git commit -m "innit to vinnit"',
  note: ["Register", "Now "],
  folder: { title: "Idea Found !", caption: "Submit your Magic!" },
  qr: { lead: "this QR", follow: "changes lives" },
  scroll: "scroll down for more",
} as const;

/* -------------------------------------------------------------- about */

export const ABOUT = {
  heading: "About VinHack",
  paragraphs: [
    "VinHack is a 36-hour hybrid hackathon that fosters collaboration, learning, and innovation by bringing together creative minds to develop impactful solutions for real-world problems.",
    "Conducted in three rounds, teams of 1–4 members analyse problem statements, build prototypes, and refine their solutions. Alongside the competition, participants gain insights through guest speaker sessions, interactive activities, and networking opportunities. The event concludes with exciting prizes awarded across multiple categories.",
  ],
} as const;

/** The attendee pass, drawn twice on the collage and once on the phone. */
export const PASS = {
  title: ["Attendee", "Pass"],
  ticket: ["VINHACK", " 2026"],
  watermark: "VH26",
  fields: [
    { label: "Type", value: "Participant" },
    { label: "Duration", value: "36 Hours" },
  ],
  barcode: "VINHACK2026",
} as const;

/* -------------------------------------------------------- who are we */

export const WHO_ARE_WE = {
  heading: "Who are we?",
  /** The eight notes scattered either side of the panel on the collage, read
   *  top-left to bottom-right; a plain list on the phone. */
  taglines: [
    "HOME OF MIDNIGHT CODERS",
    "ORGANIZERS OF VINHACK",
    "BUILDERS OF CRAZY IDEAS",
    "FUELED BY COFFEE & CURIOSITY",
    "WHERE CODE MEETS CREATIVITY",
    "TURNING IDEAS INTO IMPACT",
    "A PLAYGROUND FOR INNOVATORS",
    "MORE THAN JUST A TECH CLUB",
  ],
  connect: "LET’S CONNECT",
} as const;

/* ----------------------------------------------------------- projects */

export const PROJECTS = {
  heading: "PROJECTS //",
  /** In the order the design stacks them, left to right. */
  cards: [
    { name: "ATLAS", bg: "#fa1a1d" },
    { name: "STUDYHUB", bg: "#ffffff" },
    { name: "LATCH", bg: "#74d4f0" },
    { name: "MESSIT", bg: "#2849cb" },
  ],
} as const;

/* ------------------------------------------------------------- tracks */

export const TRACKS = {
  /** Three lines with a rule under each, the middle one the section heading. */
  lines: ["solve what matters", "TRACKS", "build what lasts"],
  sticker: "INNOVATE FOR IMPACT",
} as const;

/* ----------------------------------------------------------- timeline */

/** One line of the schedule: what is happening, and when. */
export type ScheduleRow = { kind: "row"; label: string; time: string };

/** A review checkpoint, which spans the full width rather than sitting in the
 *  label/time columns. */
export type ScheduleReview = { kind: "review"; label: string };

export type ScheduleEntry = ScheduleRow | ScheduleReview;

export type Day = {
  /** What the switch and the receipt's own header call it. */
  name: string;
  date: string;
  entries: ScheduleEntry[];
};

const row = (label: string, time: string): ScheduleRow => ({
  kind: "row",
  label,
  time,
});

const review = (label: string): ScheduleReview => ({ kind: "review", label });

export const TIMELINE = {
  heading: "Timeline",
  masthead: "VinHack 2026 ",
  dateLabel: "Date : ",
  site: "vinhack.vinnovateit.com",
  email: "vinnovateit@gmail.com",
  sticker: ["Be Curious ", "Keep Exploring !"],
  stamp: "VINHACK 2026",
  days: [
    {
      name: "Day 1",
      date: "18th Sept",
      entries: [
        row("Check-in", "9.00 AM"),
        row("Speaker Session", "11.30 AM"),
        row("Lunch Break", "1.00 PM"),
        row("Mini Event 1", "2.00 PM"),
        review("Review 1 @ 4.00 PM"),
        row("Dinner Break", "7.00 PM"),
      ],
    },
    {
      name: "Day 2",
      date: "19th Sept",
      entries: [
        review("Review 2 @ 2.00 AM"),
        row("Break", "6.00 AM"),
        row("Report back at venue", "8.00 AM"),
        row("Final Countdown", "10.00 AM"),
        row("Lunch Break", "1.00 PM"),
        review("Review 3 @ 1.30 PM"),
        row("Final Presentation", "5.00 PM"),
        row("Closing Ceremony", "7.00 PM"),
      ],
    },
  ] satisfies Day[],
} as const;

/* -------------------------------------------------------------- rules */

export const RULES = {
  heading: "RULES",
  items: [
    "Teams must have 2–4 participants (no solo participation, no multiple teams).",
    "Hackathon runs for 36 hours continuously.",
    "All work must be done during the event; only open-source tools/libraries allowed; any AI tools can be used.",
    "Any tech stack may be used; projects must align with at least one track.",
    "Internet access is permitted.  Submissions must include: working prototype/demo, pitch deck or documentation, and GitHub repo with source code.",
    "Late submissions will not be accepted.",
    "Judging based on novelty, feasibility & impact, tech implementation, design & UX, open-source usage, and pitching.",
    "Judges’ decisions are final.",
    "Respect all participants and organizers; misconduct leads to disqualification.",
    "Teams must remain onsite throughout the hackathon.",
  ],
  sticker: "BE RESPECTFUL",
} as const;

/* --------------------------------------------------------- guidelines */

export const GUIDELINES = {
  heading: "GUIDELINES",
  paragraphs: [
    "VinnovateIT believes strongly in inclusivity. Everyone, who wants to join the event, is welcome. And we assure you that, all the submissions will be evaluated irrespective of any bias with respect to whatsoever. We will always work to maintain a welcoming and safe environment for everyone.",
    "If you witness an incident which you feel goes against this policy, and violates the rights of any individual including you, feel free to reach out to anyone on the organizing team. You can identify our team members, with the ID card they are wearing which has “Core” or “Board” title.",
    "We ensure, all such reports will be anonymous, and strict actions will be taken against such incidents.",
    "If you're joining us via online mode, feel free to reach out to any of organizing team members via personal chat on Discord, the organizers have a role of “VinnovateIT”.",
  ],
  tldr: "TL;DR: Be respectful towards everyone, be it participants, organizers, or anyone related to the event. Incase of any incidents with conduct not being abided, feel free to reach out to anyone on organizing team.",
  sticker: ["KEEP IT SAFE ", "KEEP IT FAIR"],
} as const;

/* ----------------------------------------------------------- register */

export const REGISTER = {
  /** Drawn as cursive artwork, so the words live in `register.svg` / `now.svg`
   *  and this is the alternative text for them. */
  heading: "Register now",
  tagline: [
    "Bring your curiosity, creativity, and code.",
    " We'll provide the challenge, community, and opportunity.",
  ],
} as const;

/* ------------------------------------------------------------- footer */

export const FOOTER = {
  /** The wordmark in nine scripts, one marquee cycle. The trailing separator is
   *  what makes it join up when it repeats. */
  marquee:
    "VINHACK • வின்ஹேக் • विनहैक • ভিনহ্যাক  • વિનહેક  • విన్‌హ్యాక్ • ವಿನ್‌ಹ್ಯಾಕ್ • വിൻഹാക്ക് • ون ہیک • ",
  /**
   * The five folder tabs, in the order they stack — each a coloured band with
   * its label in a contrasting colour off the same palette, which is the pair
   * the design gives it. No destinations: the design draws them as tabs rather
   * than links and none carries a URL, so neither layout links them.
   */
  tabs: [
    { name: "EMAIL", band: "#74d4f0", color: "#2849cb" },
    { name: "GITHUB", band: "#2849cb", color: "#74d4f0" },
    { name: "INSTAGRAM", band: "#bfea88", color: "#1c563c" },
    { name: "LINKEDIN", band: "#1c563c", color: "#bfea88" },
    { name: "MEDIUM", band: "#db9eef", color: "#fa1a1d" },
  ],
  /** The panel the tabs are filed into, which the closing credits sit on. */
  base: "#fa1a1d",
  madeWith: ["Made ", "with", "by", "VinnovateIT"],
  copyright: "2026 VinnovateIT, Vellore Institute of Technology",
} as const;
