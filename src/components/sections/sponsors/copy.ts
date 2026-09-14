/**
 * The words on the sponsor sheet.
 *
 * Pulled out of `SponsorEdition` because the phone tells the same story as a
 * deck of cards (`MobileSponsors`) rather than as a broadsheet, and two copies
 * of the copy is how the two layouts drift apart. Same reason `content/site.ts`
 * exists for everything else on the page; this lives next to the sheet instead
 * because it is the sheet's own furniture — column headers, kickers, the
 * newsprint voice — rather than site-wide content.
 *
 * Each column carries its text twice:
 *
 *   sheet  what fits the column it is set in on the 1184px broadsheet, where
 *          the box is a fixed 235px wide and the rules below it will not move
 *   card   the longer version, for the phone, where a card is the whole screen
 *          and has room to actually say the thing
 *
 * They are not the same sentence truncated — `card` says more, because there is
 * somewhere to put it. Where a column has nothing extra to add the two match.
 */

/** One column of the sheet: a red kicker, a name, and the copy under it. */
export type SponsorColumn = {
  /** The red `// Something Partner` kicker above the logo. */
  header: string;
  /** Placeholder until the real logos land. */
  name: string;
  sheet: string;
  card: string;
};

export const TITLE_SPONSOR: SponsorColumn & { tagline?: string; logo?: string; url?: string } = {
  header: "// TITLE PARTNER",
  name: "FATEH EDUCATION",
  tagline: "Backing the builders behind the next big idea.",
  logo: "/sponsors/fateh.webp",
  url: "https://www.fateheducation.com/",
  sheet: "",
  card: "",
};

export const MUSIC_PARTNER: SponsorColumn & { url?: string } = {
  header: "// OFFICIAL MUSIC STREAMING PARTNER",
  name: "JIO SAAVN",
  url: "https://www.jiosaavn.com/",
  sheet: "",
  card: "",
};

export const TRAVEL_PARTNER: SponsorColumn & { url?: string } = {
  header: "// OFFICIAL TRAVEL PARTNER",
  name: "AbhiBus",
  url: "https://www.abhibus.com/",
  sheet: "",
  card: "",
};

/** Four partners below the title partner. */
export const SUPPORTERS: readonly {
  header: string;
  name: string;
  tagline: string;
  logo?: string;
  url: string;
}[] = [
  {
    header: "// OFFICIAL TRAVEL PARTNER",
    name: "AbhiBus",
    tagline: "Getting builders where ideas meet.",
    logo: "/sponsors/abhibus.webp",
    url: "https://www.abhibus.com/",
  },
  {
    header: "// OFFICIAL WELLNESS PARTNER",
    name: "AHA THERAPY",
    tagline: "Stronger minds build brighter tomorrows.",
    logo: "/sponsors/aha.webp",
    url: "https://www.ahatherapy.com/",
  },
  {
    header: "// OFFICIAL MUSIC STREAMING PARTNER",
    name: "JIO SAAVN",
    tagline: "Fueling the makers through every beat.",
    logo: "/sponsors/jiosaavn.webp",
    url: "https://www.jiosaavn.com/",
  },
  {
    header: "// OFFICIAL PORTFOLIO PARTNER",
    name: "OLA.CV",
    tagline: "Showcasing talent beyond the hack.",
    logo: "/sponsors/ola_cv.webp",
    url: "https://ola.cv/",
  },
];

/** Small side notes for the collage margins */
export const SIDE_NOTES = [
  "IDEAS NEED PEOPLE.",
  "SAME PEOPLE. BIGGER IDEAS.",
  "BUILD TOGETHER. BRIGHTER.",
  "THANK YOU FOR BELIEVING IN VINHACK.",
] as const;

/** The lede in the left column, under the team photograph. */
export const LEDE = {
  headline: "IDEAS  NEED\nPEOPLE.",
  body:
    "At Vinhack ’26, we believe great ideas don’t happen in isolation. Our sponsors power the 36-hour journey — enabling builders, backing possibilities, and helping turn bold ideas into real impact.",
} as const;

/**
 * The section's own title and standfirst.
 *
 * On the collage these are set in red on the black above the paper — the
 * tagline in the left corner, the title in the right — and they stay there for
 * the whole of the opening. They used to be printed on the closed cover and
 * travel up into the sheet as it opened, landing in the band the nameplate had
 * vacated, which meant the finished sheet was a broadsheet with the section
 * heading where its own masthead should be. The paper says THE HACKSTREET
 * JOURNAL because that is what it is; the section says what the section is,
 * from outside it. On the phone they are simply the first card of the deck.
 *
 * `title` and `tagline` are the whole strings, for the phone and for anything
 * reading the page rather than looking at it. The collage sets each of them on
 * two lines and the break is a piece of typesetting rather than punctuation,
 * so it is given separately rather than smuggled in as a newline.
 */
export const SPONSOR_HEADING = {
  title: "OUR SPONSORS",
  tagline: "The people backing up the chaos",
  titleLines: ["OUR", "SPONSORS"],
  taglineLines: ["The people backing", "up the chaos"],
} as const;

/**
 * The closed cover — everything the reader sees before the paper opens.
 *
 * It is deliberately not a preview of the sheet underneath and not a second
 * printing of the section heading, which is what it used to be: a cover that
 * repeats the page behind it gives the reader no reason to open it. This is a
 * sealed edition instead — an embargo notice, a struck stamp, a contents rail,
 * and a cue on the one edge that actually opens.
 *
 * That last part is the join between the words and the mechanism. The cover is
 * hinged down its left edge (see `FoldedEdition`), so the edge that lifts is
 * the right-hand one — which is where the perforation and `openHere` are set,
 * running down the free edge the reader's scroll is about to peel back.
 */
export const COVER = {
  volume: "Vol 26  // SEALED EDITION",
  embargo: "Embargo lifts on scroll",
  /** Struck across the cover in red, at an angle, the way a stamp lands. */
  stamp: { mark: "DO NOT OPEN", under: "BEFORE THE FIRST COMMIT" },
  /** Two lines, and the break between them is the point of it. */
  lede: ["FIVE NAMES.", "ONE MASTHEAD."],
  standfirst:
    "None of them asked for a logo wall. They asked what the builders would need at three in the morning, and then paid for it.",
  contentsHeader: "Inside",
  /** Contents lines */
  contents: [
    { n: "01", line: "The name on the masthead", page: "P1" },
    { n: "02", line: "Four partners backing the build", page: "P2—5" },
  ],
  colophon: "Set in Vellore · Printed overnight · No advertisements accepted",
  /** The stub under the contents rail — a newspaper's late item, boxed off. */
  stopPress: {
    kicker: "Stop press",
    body: "One of the five is still under wraps. It goes on the masthead, and it is not being announced on a cover.",
  },
  /** Set down the free edge, beside the perforation. */
  openHere: "Open here",
  cue: "Turn the page",
} as const;
