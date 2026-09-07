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
  lede: "Where ideas become prototypes and prototypes become possibilities. VinHack brings together curious minds, creative thinkers, and passionate developers to build, learn, and innovate in just 36 hours.",
  /**
   * The lines the commit sticker types, one after another, forever.
   *
   * The first is the one Figma drew, and it is also the longest — which is
   * load-bearing. The sticker's text sits centred in a fixed 290.935px box with
   * `white-space: nowrap`, so the line's own width is what decides where it
   * starts. Left to itself each message would centre on its own width and the
   * text would jitter left and right every time it changed, so the collage
   * reserves the width of the *widest* line and types into the left edge of
   * that reservation. `commits[0]` is what gets reserved, so nothing here may
   * be longer than it (31 characters) — a longer line would both overflow the
   * speech bubble and shift the sticker's resting position off the design.
   */
  commits: [
    'git commit -m "innit to vinnit"',
    'git commit -m "it works now"',
    'git commit -m "final final v2"',
    'git commit -m "fix the fix"',
    'git commit -m "demo in 5 mins"',
    'git commit -m "trust me bro"',
    'git commit -m "ship it anyway"',
    'git commit -m "revert revert"',
  ],
  note: ["Register", "Now "],
  qr: { lead: "this QR", follow: "changes lives" },
  /**
   * The scroll cue's words. They are drawn letter by letter along a curve in
   * `hero/ScrollCue` — the design file placed and turned each glyph by hand, so
   * the shape of the line is not derivable from the string — and this is what
   * the disc is labelled with for anything not looking at the curve.
   */
  scroll: "scroll down for more",
  /**
   * The speaker sticker is the page's sound switch, and this names it for a
   * screen reader.
   *
   * The state itself is not written out here any more. The drawing carries it
   * three ways over — the horn's colour, the two arcs leaving it, and the cross
   * struck where they were — and it used to carry a "SOUND ON" / "MUTED"
   * caption under the horn as well, which is a sticker explaining its own
   * picture. What that caption was actually for is anything not looking at the
   * screen, and `aria-checked` on the switch says it to them properly.
   */
  sound: { label: "Page sound" },
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
  /** The shutter sits in the gap the design leaves between the Type and
   *  Duration columns, and is the only way into `/memories`. */
  shutter: "Take a VinHack memory",
  /** The pass recolours on click. The card itself is the hit target, so this
   *  names the same action for a keyboard, on a control that is invisible
   *  until it is focused. */
  swatch: "Next pass colour",
} as const;

/**
 * The photobooth at `/memories`, reached from the shutter on the attendee pass
 * and from nowhere else — it is not in any nav.
 *
 * Two stages: the camera, then the card. The copy below is grouped the same
 * way, `booth` first and the editor's after it.
 *
 * The card is drawn on the hero's black ground, so the lines are set in Rotonto
 * at display size over it. Keep them short: the card fits three lines and
 * shrinks the type to make longer ones fit, so a long line arrives small. Any
 * "VinHack" in a line is drawn as the logo rather than set in type — a line
 * that mentions it twice will show the mark twice, so don't.
 */
export const MEMORIES = {
  heading: "VinHack Memories",
  back: "back to vinhack",
  lede: "Take the shot, throw some stickers at it, keep the picture.",

  /** The camera stage. Nothing here opens the camera on its own: `enable` is
   *  the label on a panel that is off until it is pressed. */
  booth: {
    idle: ["STEP", "INTO", "FRAME"],
    enable: "CLICK TO ENABLE",
    requesting: "REQUESTING…",
    retry: "CLICK TO RETRY",
    blocked: "CAMERA BLOCKED",
    missing: "NO CAMERA FOUND",
    unsupported: "CAMERA UNSUPPORTED",
    insecure: "HTTPS REQUIRED",
    unavailable: "CAMERA UNAVAILABLE",
    shoot: "TAKE THE SHOT",
    counting: "HOLD IT…",
    filter: "FILTER",
    skip: "SKIP THE CAMERA",
    /** In the editor, back to the camera — the stickers already placed stay
     *  where they are. */
    retake: "RETAKE",
    /** Said out loud, for anything not watching the count. */
    countdown: (n: number) => `${n}`,
  },

  messages: [
    "WE SURVIVED VINHACK",
    "WE COOKED AT VINHACK",
    "36 HOURS. NO REGRETS.",
    "IT WORKED ON MY MACHINE",
    "CTRL+S SAVED MY LIFE",
    "I CAME, I SAW, I DEPLOYED",
    "POWERED BY CHAI & CHAOS",
    "MERGE CONFLICTS BUILT CHARACTER",
  ],
  prev: "Previous line",
  next: "Next line",
  aspects: { square: "SQUARE", story: "STORY" },
  tray: "STICKERS",
  save: "SAVE IMAGE",
  saving: "DRAWING…",
  /** There is no share button. A static export cannot hand a file to
   *  Instagram or LinkedIn, so the page says where to put it instead of
   *  offering a button that would not do it. */
  tag: "TAG @VINNOVATEIT · #VINHACK2026",
  hint: "Drag anything to move it — the line too. The corner handle turns and resizes, × takes a sticker off.",
  empty: "Tap a sticker to put it on the card. Drag the line anywhere you like.",
  /** Names the movable line, for a keyboard and a screen reader. */
  textLabel: "The message. Drag to move it, corner handle to turn and resize.",
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
  dateLabel: "Date",
  site: "vinhack.vinnovateit.com",
  email: "vinnovateit@gmail.com",
  sticker: ["Be Curious ", "Keep Exploring !"],
  stamp: "VINHACK 2026",
  days: [
    {
      name: "Day 1",
      date: "18th Sept",
      entries: [
        row("Check-in", "9:00 AM"),
        row("Speaker Session", "11:30 AM"),
        row("Lunch Break", "1:00 PM"),
        row("Mini Event 1", "2:00 PM"),
        review("Review 1 @ 4:00 PM"),
        row("Dinner Break", "7:00 PM"),
      ],
    },
    {
      name: "Day 2",
      date: "19th Sept",
      entries: [
        review("Review 2 @ 2:00 AM"),
        row("Break", "6:00 AM"),
        row("Report Back at Venue", "8:00 AM"),
        row("Final Countdown", "10:00 AM"),
        row("Lunch Break", "1:00 PM"),
        review("Review 3 @ 1:30 PM"),
        row("Final Presentation", "5:00 PM"),
        row("Closing Ceremony", "7:00 PM"),
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
    "Internet access is permitted. Submissions must include working prototype/demo, pitch deck or documentation, and GitHub repo with source code.",
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
