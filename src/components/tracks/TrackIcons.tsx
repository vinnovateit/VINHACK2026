/**
 * One small line-art mark per track, standing in for a photograph neither the
 * design file nor the repo has. Each is drawn at the same 48x48 grid and the
 * same stroke weight as `TrackAsterisk` in `TrackCard`, so whichever one lands
 * on a card reads as part of the same set rather than a mismatched icon pack.
 *
 * `TRACK_ICONS` is indexed the same way `TRACKS.items` is (see
 * `content/site.ts`), so a card can just do `TRACK_ICONS[slot % TRACK_ICONS.length]`.
 */

import type { ReactElement } from "react";

type IconProps = { size: number; className?: string };

const VB = 48;

function IdeaIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      fill="none"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path
        d="M24 6C16.8 6 11 11.8 11 19c0 4.6 2.4 8.6 6 11v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5c3.6-2.4 6-6.4 6-11 0-7.2-5.8-13-13-13Z"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M20 42h8" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M24 6V2M8 19H4M44 19h-4M11 8 8 5M37 8l3-3" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function PeopleIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      fill="none"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <circle cx="17" cy="14" r="6" stroke="currentColor" strokeWidth={3} />
      <path d="M6 40c0-7.2 4.9-13 11-13s11 5.8 11 13" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <circle cx="33" cy="12" r="4.5" stroke="currentColor" strokeWidth={3} />
      <path d="M28 26c1.5-1 3.2-1.5 5-1.5 5 0 9 4.6 9 10.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function BuildIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      fill="none"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <rect x="7" y="27" width="13" height="15" rx="1.5" stroke="currentColor" strokeWidth={3} />
      <rect x="22" y="18" width="13" height="24" rx="1.5" stroke="currentColor" strokeWidth={3} />
      <rect x="37" y="9" width="4" height="33" rx="1.5" stroke="currentColor" strokeWidth={3} />
      <path d="M4 42h40" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      fill="none"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <circle cx="21" cy="27" r="15" stroke="currentColor" strokeWidth={3} />
      <circle cx="21" cy="27" r="8.5" stroke="currentColor" strokeWidth={3} />
      <circle cx="21" cy="27" r="2.5" fill="currentColor" />
      <path d="M31 17 44 4M44 4h-9M44 4v9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const TRACK_ICONS: ReadonlyArray<(props: IconProps) => ReactElement> = [
  IdeaIcon,
  PeopleIcon,
  BuildIcon,
  TargetIcon,
];

/**
 * The card's image slot, standing in for a track photograph until one exists.
 *
 * This used to be a 32-48px mark pushed into the header's corner alongside
 * the track number — an icon doing an image's job in a fraction of an
 * image's space. `TrackVisual` is drawn instead as a proper panel with its
 * own footprint on the card, framed like a photo corner so swapping the icon
 * for a real `<img>` later is a one-line change rather than a re-layout: drop
 * an `<img className="absolute inset-0 size-full object-cover" />` in place
 * of the `<Icon>` below and the frame around it still reads correctly.
 */
export function TrackVisual({
  slot,
  ink,
  rule,
  className = "",
}: {
  slot: number;
  ink: string;
  rule: string;
  className?: string;
}) {
  const Icon = TRACK_ICONS[((slot % TRACK_ICONS.length) + TRACK_ICONS.length) % TRACK_ICONS.length];
  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] ${className}`}
      style={{ border: `1px solid ${rule}`, background: `color-mix(in srgb, ${ink} 8%, transparent)` }}
    >
      {/* Photo-corner ticks, so the panel reads as a frame waiting on an
          image rather than as a decorated icon. */}
      <span
        className="absolute left-1.5 top-1.5 h-2 w-2 border-l border-t"
        style={{ borderColor: rule }}
      />
      <span
        className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r"
        style={{ borderColor: rule }}
      />
      <Icon size={40} className="opacity-90" />
    </div>
  );
}
