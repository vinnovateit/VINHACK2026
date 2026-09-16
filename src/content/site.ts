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

/* Type-only, so this stays a module of words with no runtime dependency on the
   feature switches — it is here purely so `NavItem.flag` cannot name a switch
   that does not exist. */
import type { FEATURES } from "@/content/features";

/* --------------------------------------------------------------- hero */

export const HERO = {
  lede: "Where ideas become prototypes and prototypes become possibilities. VinHack brings together curious minds, creative thinkers, and passionate developers to build, learn, and innovate in just 30 hours.",
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
  note: ["Login", ""],
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

/* ---------------------------------------------------------------- nav */

/**
 * A book on the shelf that slides out from behind the logo button.
 *
 * `target` is the destination section's `aria-label`. That is deliberately the
 * handle rather than an `id`: the page is drawn twice — the collage in
 * `components/sections/` and the reflowed column in `components/mobile/` — and
 * both trees are in the document at once, so an `id` would have to be spelled
 * differently in each and the nav would then need to know which one is on
 * screen. The two drawings share no markup, but they do already label every
 * section with the same words, and `SiteNav` picks whichever of the pair is
 * currently laid out.
 *
 * `spine` is the board, `cap` the top edge the book is seen from below, `ink`
 * the lettering — the trio the design gives each one.
 */
export type NavItem = {
  name: string;
  target: string;
  spine: string;
  cap: string;
  ink: string;
  /**
   * How thick the book is, as a multiple of the shelf's base width. No two
   * next to each other are the same: a shelf of identically thick books reads
   * as a chart, and the design draws ten different ones — a fat GUIDELINES
   * beside a thin one is most of what makes it a shelf.
   */
  book: number;
  /** Set when the destination is behind a switch in `content/features.ts`. */
  flag?: keyof typeof FEATURES;
};

/**
 * The shelf, in the order the page runs.
 *
 * The numbers printed on the spines are not written here. `PROJECTS` comes
 * and goes with `FEATURES.projects`, and a shelf that then reads 01 02 03 05 06
 * is a typo the reader can see — so `SiteNav` counts them off the list that
 * actually renders.
 *
 * No two neighbours share a spine colour; two colours repeat further apart,
 * which is what a shelf looks like.
 */
export const NAV = {
  /** The eyebrow over the shelf. */
  label: "// EXPLORE",
  /** Names the drawer itself, once it is open. */
  title: "Site navigation",
  open: "Open the navigation shelf",
  close: "Close the navigation shelf",
  /**
   * The word curving over the mark on the button, the way "PLAY AROUND" curves
   * over the gamepad in the hero — the button is a sticker off the same sheet,
   * thrown into the corner the design gives the gamepad.
   *
   * Short on purpose. It is set along a fixed arc in `SiteNav`, and a word much
   * past seven or eight characters runs off the end of it.
   */
  badge: { closed: "PLAY ALONG", open: "CLOSE" },
  items: [
    { name: "HOME", target: "VinHack", spine: "#8f86e8", cap: "#56508f", ink: "#131b24", book: 1 },
    { name: "ABOUT", target: "About VinHack", spine: "#5cc4e0", cap: "#2f6b7d", ink: "#0f172a", book: 0.86 },
    { name: "PROJECTS", target: "Projects", spine: "#db9eef", cap: "#8b5f9c", ink: "#131b24", book: 1.1, flag: "projects" },
    { name: "TRACKS", target: "Tracks", spine: "#b9e06a", cap: "#6d8a44", ink: "#1c563c", book: 1.16 },
    { name: "SPONSORS", target: "Sponsors", spine: "#8f86e8", cap: "#56508f", ink: "#131b24", book: 0.88 },
    { name: "TIMELINE", target: "Timeline", spine: "#ee1b1e", cap: "#7d1113", ink: "#131b24", book: 1.02 },
    { name: "RULES", target: "Rules", spine: "#f5a8e8", cap: "#a06a97", ink: "#1c563c", book: 0.96 },
    { name: "GUIDELINES", target: "Guidelines", spine: "#5cc4e0", cap: "#2f6b7d", ink: "#0f172a", book: 1.22 },
    { name: "FAQS", target: "Frequently Asked Questions", spine: "#ee1b1e", cap: "#7d1113", ink: "#ffffff", book: 1.05 },
  ] satisfies readonly NavItem[],
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
    { label: "Duration", value: "30 Hours" },
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
 * Two screens: the title, the words and the loose stickers; then the studio,
 * where the camera sits in the card's own photo window and the filters, the
 * stickers and the line are all on the one page under it. The copy below is
 * grouped the same way — `intro`, then `booth` for the camera's own words,
 * `fx` for the filter row, and the editor's after them.
 *
 * The card is drawn on the hero's black ground, so the lines are set in Rotonto
 * at display size over it. Keep them short: the card fits three lines and
 * shrinks the type to make longer ones fit, so a long line arrives small. Any
 * "VinHack" in a line is drawn as the logo rather than set in type — a line
 * that mentions it twice will show the mark twice, so don't.
 */
export const MEMORIES = {
  heading: "VinHack Memories",
  /** What the page's cursive title says. The h1 is artwork — pen-drawn strokes
   *  like "register now" — so this is the words it draws, read out for anything
   *  that cannot see it. `heading` stays the name in the browser tab. */
  mark: "memories @vinhack",
  back: "back to vinhack",
  lede: "Take the shot, throw some stickers at it, keep the picture.",

  /** The first screen. Words and the pieces the page is made of, and nothing
   *  that switches a camera on — the booth is one press further in, which is
   *  the whole reason this screen exists. */
  intro: {
    lines: [
      "Thirty-six hours, one photo booth.",
      "Take the shot, add filters & stickers, keep your VinHack memory.",
    ],
    start: "OPEN THE BOOTH",
    /** Names the loose stickers for anything that cannot see them. */
    scatter: "Stickers from around the site",
  },

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
    /** Back to the camera from a card that already has a shot on it. The
     *  stickers and the line stay exactly where they were put. */
    retake: "RETAKE",
    /** Said out loud, for anything not watching the count. */
    countdown: (n: number) => `${n}`,
    /** Back to the title screen. */
    back: "back to the title",
  },

  /** Names the filter row. One at a time, so nothing here counts anything —
   *  which chip is lit is the whole of the state. */
  fx: { label: "FILTERS" },

  /**
   * The AR drawer: what gets hung on a face and what goes behind it.
   *
   * Every one of the notices is about the same fact — the face tracker and the
   * cut-out are fetched from a CDN when the drawer is opened, and a hall full
   * of people on one router is exactly where that fails. So there is a line for
   * waiting and a line for having given up, and both of them say what still
   * works, because all of it does: the camera, the filters, the stickers and
   * the save have never needed any of this.
   */
  ar: {
    /** The button on the card that opens it. */
    open: "AR",
    label: "PROPS & BACKDROPS",
    close: "DONE",
    backdrops: "BACKDROPS",
    /** The window as the camera left it — a choice in the row, not a clear
     *  button, the same way STRAIGHT is in the filters. */
    plain: "NONE",
    loading: "Finding faces — one moment.",
    loadingScene: "Loading the cut-out — one moment.",
    blocked:
      "Face tracking could not load. Close and reopen to try again; the camera, filters and stickers are unaffected.",
    sceneBlocked:
      "The cut-out could not load, so the scenes are off. The frames need nothing and still work.",
    /** The one case that is nobody's fault and looks like a broken feature: the
     *  cut-out is made at the shutter, so a scene chosen after the photograph
     *  has nothing to stand you in front of. Said plainly, with the fix. */
    sceneLate:
      "This photo was taken without a cut-out. Choose the scene first, then RETAKE to stand in it.",
    /** Under the picture while something is being worn. */
    hint: "Props are placed by the camera and freeze where they land — drag, turn and resize them after the shot.",
  },

  /** The two camera controls on the picture. Both are labels for a control
   *  with no words on it, so they are sentence case rather than shouted. */
  zoom: "Zoom",
  flip: "Switch camera",

  messages: [
    "WE SURVIVED VINHACK",
    "WE COOKED AT VINHACK",
    "30 HOURS. NO REGRETS.",
    "IT WORKED ON MY MACHINE",
    "CTRL+S SAVED MY LIFE",
    "I CAME, I SAW, I DEPLOYED",
    "POWERED BY CHAI & CHAOS",
    "MERGE CONFLICTS BUILT CHARACTER",
  ],
  prev: "Previous line",
  next: "Next line",
  /** The two shapes the card is posted at. The switch sits on the picture
   *  itself, so these are the whole of its labels. */
  aspects: { square: "SQUARE", story: "STORY" },
  aspectLabel: "Card shape",
  tray: "STICKERS",
  save: "SAVE IMAGE",
  saving: "DRAWING…",
  /** There is no share button. A static export cannot hand a file to
   *  Instagram or LinkedIn, so the page says where to put it instead of
   *  offering a button that would not do it. */
  tag: "SHARE YOUR MEMORY: @VINNOVATEIT #VINHACK26",
  hint: "Drag anything to move it — the line too. The corner handle turns and resizes, × takes a sticker off.",
  empty: "Tap a sticker to put it on the card. Drag the line anywhere you like.",
  /** Names the movable line, for a keyboard and a screen reader. */
  textLabel: "The message. Drag to move it, corner handle to turn and resize.",
} as const;

/* -------------------------------------------------------- who are we */

export const WHO_ARE_WE = {
  title: "WHO ARE WE ?",
  reveal: {
    eyebrow: "WE ARE",
    brand: "VINNOVATEIT",
    tagline: "WHERE IDEAS FIND THEIR PEOPLE.",
  },
  quotes: [
    {
      id: "quote-green",
      headline: "BUILDING\nPROJECTS\nFOR A CAUSE",
      subline: "FOR THE STUDENTS BY THE STUDENTS",
      color: "#b4ea74",
      textColor: "#000000",
    },
    {
      id: "quote-pink",
      headline: 'WE ASK\n"WHY NOT?"',
      color: "#ffb8e7",
      textColor: "#000000",
    },
    {
      id: "quote-blue",
      headline: "CURIOUS BY\nNATURE.\nCREATIVE BY\nCHOICE.",
      subline: "ALWAYS LOOKING FOR WHAT'S NEXT.",
      color: "#48c5f8",
      textColor: "#000000",
    },
    {
      id: "quote-red",
      headline: "DIFFERENT\nMINDS.\nSAME CHAOS.",
      subline: "SOMEHOW, WE MAKE IT WORK.",
      color: "#ff1a1d",
      textColor: "#000000",
    },
  ],
  polaroids: [
    {
      id: "photo-1",
      src: "/about_us/220a17ad3a3ad4382bb239416e67f3f8e44d6413.webp",
      alt: "VinnovateIT classroom team",
      number: "01",
    },
    {
      id: "photo-2",
      src: "/about_us/67637ab629928adcbde8469183aac1877a08026b.webp",
      alt: "VinnovateIT outdoor group",
      number: "02",
    },
    {
      id: "photo-3",
      src: "/about_us/924203fb63dc0f4fd3cb3bfe64c9230caf80a54e.webp",
      alt: "VinnovateIT group selfie",
      number: "03",
    },
    {
      id: "photo-4",
      src: "/about_us/94fc2ef86e7f542a782c6ecc5761e7547108bf56.webp",
      alt: "VinnovateIT banner team",
      number: "04",
    },
  ],
  videos: [
    {
      id: "video-1",
      label: "VIDEO 1",
    },
    {
      id: "video-2",
      label: "VIDEO 2",
    },
  ],
} as const;

/* ----------------------------------------------------------- projects */

export const PROJECTS = {
  heading: "PROJECTS //",
  /** In the order the design stacks them, left to right. */
  cards: [
    {
      name: "BUNKBUDDIES",
      displayName: "BunkBuddies",
      bg: "#FA1A1D",
      hoverBg: "#2E5946",
      hoverTextColor: "#ffffff",
      shapeSvg: "/projects/shape_flower.svg",
      textColor: "#000000",
      logo: "/projects/bunkbuddies.svg",
      icon: "/projects/bunkbuddies_icon.svg",
      url: "https://bunkbuddies.vinnovateit.com",
      tagline: "Know who you're bunking with.",
      body: "VIT's most-used hostel counselling app. Find your roomie, before your room.",
    },
    {
      name: "STUDYHUB",
      displayName: "Studyhub",
      bg: "#ffffff",
      hoverBg: "#FDBBFF",
      hoverTextColor: "#000000",
      shapeSvg: "/projects/shape_star.svg",
      textColor: "#000000",
      logo: "/projects/studyhub.svg",
      icon: "/projects/studyhub.svg",
      url: "https://studyhub.vinnovateit.com",
      tagline: "Study what matters.",
      body: "VIT's academic survival kit. Find notes, question papers, and study material, all in one place.",
    },
    {
      name: "LATCH",
      displayName: "Latch",
      bg: "#74D4F0",
      hoverBg: "#FF4337",
      hoverTextColor: "#ffffff",
      shapeSvg: "/projects/shape_notched.svg",
      textColor: "#000000",
      logo: "/projects/latch.svg",
      icon: "/projects/latch.svg",
      url: "https://latch.vinnovateit.com",
      tagline: "Connecting VIT, one device at a time.",
      body: "VIT's Wi-Fi connector. Connect once. Forget the rest.",
    },
    {
      name: "MESSIT",
      displayName: "MessIT",
      bg: "#2849CB",
      hoverBg: "#BFEA88",
      hoverTextColor: "#000000",
      shapeSvg: "/projects/shape_blob.svg",
      textColor: "#ffffff",
      logo: "/projects/messit.svg",
      icon: "/projects/messit.svg",
      url: "https://messit.vinnovateit.com",
      tagline: "Know what's cooking",
      body: "VIT's go-to mess menu app, trusted by 40,000+ students.",
    },
  ],
} as const;

/* ------------------------------------------------------------- tracks */

export const TRACKS = {
  /** Three lines with a rule under each, the middle one the section heading. */
  lines: ["solve what matters", "TRACKS", "build what lasts"],
  comingSoon: "COMING SOON",
  sticker: "INNOVATE FOR IMPACT",
  /**
   * The cards the deck deals out, in order. Both lines are printed on the card
   * face itself, at the card's own scale — the blurb sits under the title in
   * small type, so keep it to roughly three lines at that size.
   */
  items: [
    {
      title: "INDUSTRY 6.0",
      blurb:
        "Power the next evolution of industry. Build solutions that bring humans and intelligent systems together through human-AI collaboration, intelligent automation, personalised learning, and next-generation workspaces.",
      tags: ["Human-AI", "Intelligent Automation", "Workspaces"],
    },
    {
      title: "TRUST, SAFETY & DIGITAL SECURITY",
      blurb:
        "Build solutions that create a safer, more secure, and trustworthy world through cybersecurity, privacy, fraud prevention, digital identity, and resilient systems.",
      tags: ["Cybersecurity", "Privacy", "Digital Identity"],
    },
    {
      title: "CLIMATETECH & RESILIENCE",
      blurb:
        "Build solutions for a climate-resilient future through clean energy, resource efficiency, waste management, climate adaptation, disaster resilience, and sustainable agriculture.",
      tags: ["Clean Energy", "Sustainability", "Climate Resilience"],
    },
    {
      title: "ENTERTAINMENT REIMAGINED",
      blurb:
        "Redefine how we create, experience, and engage with entertainment through gaming, immersive experiences, digital media, creator tools, interactive storytelling, music, AR/VR, and next-generation platforms.",
      tags: ["Gaming", "AR/VR", "Digital Media"],
    },
    {
      title: "WILDCARD",
      blurb:
        "For ideas that don't fit the mould and solutions nobody saw coming. Think beyond conventional apps and explore AI, automation, blockchain, quantum technology, smart devices, emerging technologies, or anything else you can imagine.",
      tags: ["Emerging Tech", "Quantum", "Wildcard"],
    },
  ],
} as const;

/* ------------------------------------------------------------ sponsors */

export const SPONSORS = {
  label: "SPONSORS //",
  heading: "Our Sponsors",
  /**
   * In paint order — biggest first. The first two carry a description, the
   * rest just a header and a name; `Sponsors` and `MobileSponsors` size the
   * tiers down the list (title, then gold, then the row of supporters).
   */
  tiers: [
    {
      header: "TITLE SPONSOR",
      name: "Your Company",
      desc: "Powering VinHack 2026 as our title sponsor.",
      bg: "#fa1a1d",
    },
    {
      header: "GOLD SPONSOR",
      name: "Your Company",
      desc: "Backing the builders with tools, prizes, and mentorship.",
      bg: "#74d4f0",
    },
    { header: "SPONSOR", name: "Your Company", bg: "#2849cb" },
    { header: "SPONSOR", name: "Your Company", bg: "#bfea88" },
    { header: "SPONSOR", name: "Your Company", bg: "#e2b5f0" },
    { header: "SPONSOR", name: "Your Company", bg: "#d9d9d9" },
    { header: "SPONSOR", name: "Your Company", bg: "#db9eef" },
  ],
  /** The back of the title and gold tiles, shown on click. Placeholder copy —
   *  swap for the real sponsor write-up once one exists. */
  blurb:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  flipHint: "Tap to flip back",
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
    "Hackathon runs for 30 hours continuously.",
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

/* ------------------------------------------------------------- faqs */

export type FaqQuestion = { q: string; a: string };

export type FaqCategory = {
  id: string;
  index: string;
  title: [string, string, string];
  subtitle: string;
  color: string;
  textColor: string;
  border: string;
  questions: FaqQuestion[];
};

export const FAQS = {
  heading: "FREQUENTLY ASKED QUESTIONS //",
  categories: [
    {
      id: "general",
      index: "01",
      title: ["FIRST", "THINGS", "FIRST"],
      subtitle: "general information",
      color: "#fa1a1d",
      textColor: "#000000",
      border: "border-black/30",
      questions: [
        {
          q: "What is the maximum team size?",
          a: "Each team can have 2 to 5 members. Cross-domain and cross-expertise teams are highly encouraged.",
        },
        {
          q: "What is the theme of the hackathon?",
          a: "The theme is utilising open-source software to build impactful solutions.",
        },
        {
          q: "How long is the hackathon?",
          a: "The hackathon will run for 30 hours non-stop, including time for brainstorming, coding, design, and presentations.",
        },
        {
          q: "Where will the event be held?",
          a: "The event will take place at Anna Auditorium, VIT Vellore. The venue will provide working spaces, charging stations, and Wi-Fi to support participants throughout the event.",
        },
      ],
    },
    {
      id: "teams",
      index: "02",
      title: ["FIND", "YOUR", "CREW"],
      subtitle: "participation + teams",
      color: "#bfea88",
      textColor: "#000000",
      border: "border-black/30",
      questions: [
        {
          q: "Do I need to have a project idea beforehand?",
          a: "No. You can brainstorm and decide your idea with your team during the hackathon after the theme is announced.",
        },
        {
          q: "Can I work on a pre-existing project?",
          a: "No. All projects must be started from scratch at the hackathon. You may use open-source libraries, frameworks, or tools, but not pre-built projects. GitHub repositories will be checked to ensure fairness.",
        },
        {
          q: "What if I don't have a team?",
          a: "Don't worry! You can use the #team-formation channel on our official Discord server to connect with other participants and form a team.",
        },
        {
          q: "Are mentors available to help?",
          a: "Yes. Core members skilled in technology and design will be available to guide you throughout the hackathon.",
        },
        {
          q: "Can teams have members from different colleges?",
          a: "Yes. Mixed-college teams are welcome, and collaboration across institutions is encouraged.",
        },
      ],
    },
    {
      id: "logistics",
      index: "03",
      title: ["NEED", "TO", "KNOWS"],
      subtitle: "logistics and requirements",
      color: "#74d4f0",
      textColor: "#000000",
      border: "border-black/30",
      questions: [
        {
          q: "What kind of projects are expected?",
          a: "Projects can be software or hardware-based, aligned with the theme. They should aim to solve real-world problems and will be judged on creativity, usability, technical execution, and impact.",
        },
        {
          q: "Will you provide any hardware components?",
          a: "No. Participants must bring their own hardware components if required. Basic facilities like power and Wi-Fi will be provided.",
        },
        {
          q: "What should I bring with me?",
          a: "Laptop and charger, mobile phone and accessories, any additional hardware/sensors needed for your project, extension cords, adapters, and personal essentials.",
        },
        {
          q: "Is travel reimbursement provided?",
          a: "No. Participants must cover their own travel and accommodation costs.",
        },
        {
          q: "Do I need to install any tools beforehand?",
          a: "Not mandatory, but we recommend setting up your preferred development tools and environments beforehand to save time.",
        },
        {
          q: "Is internet/Wi-Fi provided?",
          a: "Yes. Stable Wi-Fi will be available throughout the venue. However, we recommend carrying a mobile hotspot as a backup.",
        },
      ],
    },
    {
      id: "external",
      index: "04",
      title: ["FROM", "OUTSIDE", "IN"],
      subtitle: "external participants",
      color: "#2849cb",
      textColor: "#000000",
      border: "border-black/30",
      questions: [
        {
          q: "Do I need to carry my college ID card?",
          a: "Yes. A valid college ID card is mandatory for verification at check-in. Without it, entry will not be permitted.",
        },
        {
          q: "Will accommodation be provided?",
          a: "No formal accommodation is provided. However, external participants are allowed to stay overnight in the hackathon hall for the duration of the event.",
        },
        {
          q: "Can I join the hack physically?",
          a: "Yes. External participants can attend the hackathon in person. Please note that you must arrange your own travel and essentials.",
        },
      ],
    },
  ] as const satisfies readonly FaqCategory[],
} as const;

/* -------------------------------------------------------- sneak peek */

/** The two lines tiled behind the attendee pass in the About section, now
 *  moved to sit just above the footer. Read top to bottom, alternating. */
export const SNEAK_PEEK = {
  lines: ["SNEAK PEEK", "VINHACK '26"],
} as const;

/* ------------------------------------------------------------- footer */

/* ------------------------------------------------------------ discord */

/** The invite the floating sticker in the corner opens. */
export const DISCORD = {
  label: "DISCORD",
  href: "https://discord.gg/G9JtmGhQV",
} as const;

export const FOOTER = {
  /** The wordmark in nine scripts, one marquee cycle. The trailing separator is
   *  what makes it join up when it repeats. */
    marquee:
    " VINHACK • வின்ஹேக் • विनहैक • ভিনহ্যাক • વિનહેક • విన్‌హ్యాక్ • ವಿನ್‌ಹ್ಯಾಕ್ • വിൻഹാക്ക് • ਵਿਨਹੈਕ • وِن ہیک • ବିନହ୍ୟାକ • विन्हॅक • ভিনহ্যাক • ବିନ୍‌ହ୍ୟାକ • ᱵᱤᱱᱦᱮᱠ • ",
  /**
   * The five folder tabs, in the order they stack — each a coloured band with
   * its label in a contrasting colour off the same palette, which is the pair
   * the design gives it. No destinations: the design draws them as tabs rather
   * than links and none carries a URL, so neither layout links them.
   */
  tabs: [
    { name: "EMAIL", band: "#74d4f0", color: "#2849cb", href: "mailto:vinnovateit@gmail.com" },
    { name: "GITHUB", band: "#2849cb", color: "#74d4f0", href: "https://github.com/vinnovateit" },
    { name: "INSTAGRAM", band: "#bfea88", color: "#1c563c", href: "https://instagram.com/vinnovateit" },
    { name: "LINKEDIN", band: "#1c563c", color: "#bfea88", href: "https://www.linkedin.com/company/v-innovate-it" },
    { name: "MEDIUM", band: "#db9eef", color: "#fa1a1d", href: "https://medium.com/@vinnovateit" },
  ],
  /** The panel the tabs are filed into, which the closing credits sit on. */
  base: "#fa1a1d",
  madeWith: ["Made ", "with", "by", "VinnovateIT"],
  copyright: "2026 VinnovateIT, Vellore Institute of Technology",
} as const;
