/**
 * Sponsor edition copy and structured data.
 *
 * Shared between desktop broadsheet (SponsorEdition) and mobile cards (MobileSponsors).
 */

export type SponsorColumn = {
  header: string;
  name: string;
  sheet: string;
  card: string;
};

export const TITLE_SPONSOR: SponsorColumn & { tagline?: string; logo?: string; url?: string } = {
  header: "TITLE PARTNER",
  name: "FATEH EDUCATION",
  tagline: "Backing the builders behind the next big idea.",
  logo: "/sponsors/fateh.webp",
  url: "https://www.fateheducation.com/",
  sheet: "",
  card: "",
};

export const MUSIC_PARTNER: SponsorColumn & { url?: string } = {
  header: "OFFICIAL MUSIC STREAMING PARTNER",
  name: "JIO SAAVN",
  url: "https://www.jiosaavn.com/",
  sheet: "",
  card: "",
};

export const TRAVEL_PARTNER: SponsorColumn & { url?: string } = {
  header: "OFFICIAL TRAVEL PARTNER",
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
    header: "OFFICIAL TRAVEL PARTNER",
    name: "AbhiBus",
    tagline: "Travel support for hackathon participants.",
    logo: "/sponsors/abhibus.webp",
    url: "https://www.abhibus.com/",
  },
  {
    header: "OFFICIAL WELLNESS PARTNER",
    name: "AHA THERAPY",
    tagline: "Mental wellness and focus support during the build.",
    logo: "/sponsors/aha.webp",
    url: "https://www.ahatherapy.com/",
  },
  {
    header: "OFFICIAL MUSIC STREAMING PARTNER",
    name: "JIO SAAVN",
    tagline: "Curated music streams to power 30 hours of hacking.",
    logo: "/sponsors/jiosaavn.webp",
    url: "https://www.jiosaavn.com/",
  },
  {
    header: "OFFICIAL PORTFOLIO PARTNER",
    name: "OLA.CV",
    tagline: "Developer portfolios and verified credentials.",
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
    "At VinHack 2026, great ideas happen together. Our partners back the 30-hour build with tools, travel, focus, and resources.",
} as const;

export const SPONSOR_HEADING = {
  title: "OUR SPONSORS",
  tagline: "The partners backing the build",
  titleLines: ["OUR", "SPONSORS"],
  taglineLines: ["The partners backing", "the build"],
} as const;

export const COVER = {
  volume: "VOL. 26 · SEALED EDITION",
  embargo: "EMBARGO LIFTS ON SCROLL",
  stamp: { mark: "DO NOT OPEN", under: "BEFORE FIRST COMMIT" },
  lede: ["FIVE PARTNERS.", "ONE EDITION."],
  standfirst:
    "Direct tools, credits, and infrastructure powering the teams at VinHack 2026.",
  contentsHeader: "INSIDE",
  contents: [
    { n: "01", line: "Fateh Education · Title Partner", page: "P1" },
    { n: "02", line: "AbhiBus · Travel Partner", page: "P2" },
    { n: "03", line: "Aha Therapy · Wellness Partner", page: "P3" },
    { n: "04", line: "JioSaavn · Music Streaming", page: "P4" },
    { n: "05", line: "Ola.cv · Portfolio Partner", page: "P5" },
  ],
  colophon: "Vellore · Printed for VinHack 2026",
  stopPress: {
    kicker: "NOTICE",
    body: "Official partner directory and developer perks. Scroll down to open.",
  },
  openHere: "OPEN",
  cue: "SCROLL TO OPEN",
} as const;
