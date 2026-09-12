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

function IndustryIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      fill="none"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <rect x="14" y="14" width="20" height="20" rx="3" stroke="currentColor" strokeWidth={3} />
      <circle cx="24" cy="24" r="3.5" fill="currentColor" />
      <path d="M20 14V6M28 14V6M20 34V42M28 34V42M14 20H6M14 28H6M34 20H42M34 28H42" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function SecurityIcon({ size, className }: IconProps) {
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
        d="M24 5L39 10.5V22C39 31.5 24 41 24 43C24 41 9 31.5 9 22V10.5L24 5Z"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="19" y="22" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth={2.5} />
      <path d="M21 22V18C21 16.34 22.34 15 24 15C25.66 15 27 16.34 27 18V22" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

function ClimateIcon({ size, className }: IconProps) {
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
        d="M39 9C25 9 13 18 13 32C17 32 21 31 25 28C31 22 39 9 39 9Z"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M13 32C21 26 29 18 39 9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M23 25C25 21.5 29 20 29 20M18 29C20 26.5 23 25.5 23 25.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M13 32C11 36.5 7 40 4 41" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function EntertainmentIcon({ size, className }: IconProps) {
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
        d="M13 16C18 14 30 14 35 16C40 18 43 28 39 35C36 40 32 36 30 32C26 31 22 31 18 32C16 36 12 40 9 35C5 28 8 18 13 16Z"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M14 24H20M17 21V27" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="31" cy="22.5" r="1.5" fill="currentColor" />
      <circle cx="34.5" cy="25.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function WildcardIcon({ size, className }: IconProps) {
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
        d="M24 4C24 14.5 17 21.5 6.5 21.5C17 21.5 24 28.5 24 39C24 28.5 31 21.5 41.5 21.5C31 21.5 24 14.5 24 4Z"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <circle cx="37" cy="11" r="2.5" fill="currentColor" />
      <circle cx="11" cy="33" r="2" fill="currentColor" />
    </svg>
  );
}

export const TRACK_ICONS: ReadonlyArray<(props: IconProps) => ReactElement> = [
  IndustryIcon,
  SecurityIcon,
  ClimateIcon,
  EntertainmentIcon,
  WildcardIcon,
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
  size = 40,
  is2x = false,
}: {
  slot: number;
  ink: string;
  rule: string;
  className?: string;
  size?: number;
  is2x?: boolean;
}) {
  const Icon = TRACK_ICONS[((slot % TRACK_ICONS.length) + TRACK_ICONS.length) % TRACK_ICONS.length];
  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${
        is2x ? "rounded-[20px]" : "rounded-[10px]"
      } ${className}`}
      style={{
        border: is2x ? `2px solid ${rule}` : `1px solid ${rule}`,
        background: `color-mix(in srgb, ${ink} 8%, transparent)`,
      }}
    >
      {/* Photo-corner ticks, so the panel reads as a frame waiting on an
          image rather than as a decorated icon. */}
      <span
        className={`absolute ${
          is2x
            ? "left-3 top-3 h-4 w-4 border-l-2 border-t-2"
            : "left-1.5 top-1.5 h-2 w-2 border-l border-t"
        }`}
        style={{ borderColor: rule }}
      />
      <span
        className={`absolute ${
          is2x
            ? "bottom-3 right-3 h-4 w-4 border-b-2 border-r-2"
            : "bottom-1.5 right-1.5 h-2 w-2 border-b border-r"
        }`}
        style={{ borderColor: rule }}
      />
      <Icon size={size} className="opacity-90" />
    </div>
  );
}
