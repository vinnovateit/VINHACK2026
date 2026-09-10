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

export const TITLE_SPONSOR: SponsorColumn = {
  header: "// Title Sponsor",
  name: "COMPANY NAME",
  sheet:
    "Our title sponsor puts its name on the masthead and its weight behind the build. Thirty hours of compute, mentors on the floor at three in the morning, and a prize table worth the sleep you gave up for it. They did not come to watch a hackathon — they came to hand builders the tools and then get out of the way.",
  card:
    "Our title sponsor puts its name on the masthead and its weight behind the build. Thirty hours of compute, mentors on the floor at three in the morning, and a prize table worth the sleep you gave up for it. They did not come to watch a hackathon — they came to hand builders the tools and then get out of the way.",
};

export const MUSIC_PARTNER: SponsorColumn = {
  header: "// Music Streaming Partner",
  name: "COMPANY NAME",
  sheet:
    "Thirty hours does not run on caffeine alone. Our music partner scores the night shift — the 3 a.m. push, the last commit, the walk home at sunrise.",
  card:
    "Thirty hours does not run on caffeine alone. Our music partner scores the night shift — the 3 a.m. push, the demo rehearsal at dawn, the long walk back across campus when the sun has already beaten you to it. Free premium for every registered builder, a shared VinHack playlist the whole hall can queue into, and a live set to close the weekend out.",
};

export const TRAVEL_PARTNER: SponsorColumn = {
  header: "// Travel Booking Partner",
  name: "COMPANY NAME",
  sheet:
    "Builders arrive from every corner of the country, and distance has never once been a good reason to miss a weekend like this. Our travel partner covers the getting there — discounted fares for every confirmed team, and a booking desk that answers on the days that actually matter.",
  card:
    "Builders arrive from every corner of the country, and distance has never once been a good reason to miss a weekend like this. Our travel partner covers the getting there — discounted fares for every confirmed team, and a booking desk that answers on the days that actually matter.",
};

/** The right-hand rail: four supporters, header and name only on the sheet. */
export const SUPPORTERS: readonly { header: string; name: string }[] = [
  { header: "// XYZ Partner", name: "COMPANY NAME" },
  { header: "// XYZ Partner", name: "COMPANY NAME" },
  { header: "// XYZ Partner", name: "COMPANY NAME" },
  { header: "// XYZ Partner", name: "COMPANY NAME" },
];

/** The lede in the left column, under the team photograph. */
export const LEDE = {
  headline: "IDEAS  NEED\nPEOPLE.",
  body:
    "At Vinhack ’26, we believe great ideas don’t happen in isolation. Our sponsors power the 36-hour journey — enabling builders, backing possibilities, and helping turn bold ideas into real impact.",
} as const;

/**
 * The section's own title and standfirst.
 *
 * On the collage these start below the folded sheet and travel up into it as it
 * opens, landing where the masthead was — see `FoldedEdition`. On the phone
 * they are simply the first card of the deck.
 */
export const SPONSOR_HEADING = {
  title: "OUR SPONSORS",
  tagline: "The people backing the chaos at VinHack",
} as const;
