/** VIT Vellore hostel blocks, as offered in the check-in form's Hostel Block dropdown. */
export const HOSTEL_BLOCKS = {
  MH: ["A", "B", "B_ANNEXE", "C", "D", "D_ANNEXE", "E", "F", "G", "H", "J", "K", "L", "L_ANNEXE", "M", "M_ANNEXE", "T", "R", "N", "Q", "P"],
  LH: ["A", "B", "C", "D", "E", "F", "G", "G_ANNEXE", "H", "J", "S"],
} as const;

export type HostelType = keyof typeof HOSTEL_BLOCKS;

/** "B_ANNEXE" → "B Annexe", "Q" → "Q Block". */
export function hostelBlockLabel(block: string): string {
  const [letter, annexe] = block.split("_");
  return annexe ? `${letter} Annexe` : `${letter} Block`;
}

/**
 * The value stored in the database. It starts with the hostel type ("MH Q Block", "LH G Annexe")
 * so the Men's/Ladies' choice survives a reload; the block letter alone can't tell them apart.
 */
export function hostelBlockValue(type: HostelType, block: string): string {
  return `${type} ${hostelBlockLabel(block)}`;
}

/** Dropdown options, A→Z with each annexe right after its block ("B Block", "B Annexe", "C Block"). */
export function hostelBlockOptions(type: HostelType) {
  return [...HOSTEL_BLOCKS[type]]
    .sort((a, b) => a.localeCompare(b))
    .map((block) => ({ value: hostelBlockValue(type, block), label: hostelBlockLabel(block) }));
}

export function isValidHostelBlock(type: unknown, value: unknown): boolean {
  return (
    (type === "MH" || type === "LH") &&
    typeof value === "string" &&
    hostelBlockOptions(type).some((option) => option.value === value)
  );
}

/** Men's or Ladies' hostel for a stored block value. Values saved before the "MH "/"LH " prefix default to MH. */
export function hostelTypeOf(value: string): HostelType {
  return /^LH\b/i.test(value.trim()) ? "LH" : "MH";
}
