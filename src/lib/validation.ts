// Server actions are public endpoints: the client form validation in the onboarding and dashboard
// components is a convenience, not a guarantee. Everything below runs on the server too.

export const TRACK_OPTIONS = [
  "Industry 6.0",
  "Trust, Safety & Digital Security",
  "ClimateTech & Resilience",
  "Entertainment Reimagined",
  "Wildcard",
  "Proactive Mental Health for Students",
] as const;

export type Track = (typeof TRACK_OPTIONS)[number];

export function isValidTrack(value: unknown): value is Track {
  return typeof value === "string" && (TRACK_OPTIONS as readonly string[]).includes(value);
}

export const PROJECT_TYPE_OPTIONS = ["Software", "Hardware"] as const;

export type ProjectType = (typeof PROJECT_TYPE_OPTIONS)[number];

export function isValidProjectType(value: unknown): value is ProjectType {
  return typeof value === "string" && (PROJECT_TYPE_OPTIONS as readonly string[]).includes(value);
}

export const PROGRESS_STATUS_OPTIONS = ["In progress", "Need mentor feedback", "Ready for review"] as const;

export const TEAM_CONFIDENCE_OPTIONS = ["Feeling good", "Could use a nudge", "Blocked"] as const;

function isOneOf(options: readonly string[], value: unknown): value is string {
  return typeof value === "string" && options.includes(value);
}

export function isValidProgressStatus(value: unknown): value is (typeof PROGRESS_STATUS_OPTIONS)[number] {
  return isOneOf(PROGRESS_STATUS_OPTIONS, value);
}

export function isValidTeamConfidence(value: unknown): value is (typeof TEAM_CONFIDENCE_OPTIONS)[number] {
  return isOneOf(TEAM_CONFIDENCE_OPTIONS, value);
}

export const FIELD_LIMITS = {
  name: 100,
  regNo: 20,
  phone: 20,
  address: 300,
  collegeName: 150,
  hostelBlock: 50,
  roomNo: 20,
  projectTitle: 150,
  projectDescription: 2000,
  link: 500,
  otherLinks: 1000,
  progressNote: 2000,
} as const;

/** Trimmed string of at most `max` chars, or null when the value isn't a usable string. */
export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function cleanOptionalNumber(value: unknown, min: number, max: number): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return undefined;
  const rounded = Math.round(num);
  return rounded >= min && rounded <= max ? rounded : undefined;
}
