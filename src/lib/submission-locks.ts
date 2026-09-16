import "server-only";

import { getMongoDb } from "@/lib/mongo";

/**
 * Organisers can freeze each of the three submission sections from the admin console. A locked
 * section stays visible — the team can still read what they submitted — but it cannot be saved.
 *
 * Lock state is written by the admin portal in two layers:
 *   - a global default per section, in admin_settings (_id "submission-locks")
 *   - an optional per-team override, in teams.sectionLocks
 * A team's effective lock is its override when it has one, otherwise the global default.
 */
export const SUBMISSION_SECTION_KEYS = ["details", "links", "progress"] as const;

export type SubmissionSectionKey = (typeof SUBMISSION_SECTION_KEYS)[number];

export type SectionLocks = Record<SubmissionSectionKey, boolean>;

export const SECTION_LOCK_LABELS: Record<SubmissionSectionKey, string> = {
  details: "Project details",
  links: "Links & assets",
  progress: "Progress update",
};

const NOTHING_LOCKED: SectionLocks = { details: false, links: false, progress: false };

const SETTINGS_ID = "submission-locks";

/** Never throws: a database hiccup must not lock everyone out of their own submission. */
export async function getGlobalSubmissionLocks(): Promise<SectionLocks> {
  try {
    const db = await getMongoDb();
    if (!db) return NOTHING_LOCKED;

    // The admin portal writes this document with a fixed string _id, not an ObjectId.
    const doc = await db
      .collection<{ _id: string; details?: boolean; links?: boolean; progress?: boolean }>(
        "admin_settings"
      )
      .findOne({ _id: SETTINGS_ID });
    if (!doc) return NOTHING_LOCKED;

    return {
      details: Boolean(doc.details),
      links: Boolean(doc.links),
      progress: Boolean(doc.progress),
    };
  } catch (err) {
    console.warn("[submission-locks] Could not read global locks, treating all as open:", err);
    return NOTHING_LOCKED;
  }
}

export function resolveSectionLocks(
  teamSectionLocks: unknown,
  globalLocks: SectionLocks
): SectionLocks {
  const overrides = (teamSectionLocks ?? {}) as Partial<Record<SubmissionSectionKey, unknown>>;
  const resolved = { ...NOTHING_LOCKED };

  for (const section of SUBMISSION_SECTION_KEYS) {
    const override = overrides[section];
    resolved[section] = typeof override === "boolean" ? override : globalLocks[section];
  }
  return resolved;
}

/** Convenience for callers that hold a team document and just need the final answer. */
export async function getSectionLocksForTeam(teamSectionLocks: unknown): Promise<SectionLocks> {
  return resolveSectionLocks(teamSectionLocks, await getGlobalSubmissionLocks());
}
