import React from "react";

export interface TrackCardProps {
  /** The hex color code of the card (e.g. #D9D9D9, #E2B5F0, #FA1A1D, #2849CB, #74D4F0, #FFFFFF) */
  color: string;
  /** Optional title or track label */
  title?: string;
  /** Optional subtitle or category description */
  subtitle?: string;
  /** Optional custom class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Card dimensions (default 365.44px x 257.6px) */
  width?: number | string;
  height?: number | string;
  /** Whether the card is frontmost in a stack */
  isFront?: boolean;
  /** Whether the card is rendered at 2x retina layout resolution */
  is2x?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom inner content */
  children?: React.ReactNode;
}

export const TRACK_COLORS = {
  grey: "#D9D9D9",
  pink: "#E2B5F0",
  red: "#FA1A1D",
  darkBlue: "#2849CB",
  lightBlue: "#74D4F0",
  white: "#FFFFFF",
} as const;

/** The two card colors dark enough to need light ink on top of them. */
const DARK_CARDS = new Set(["#2849cb", "#fa1a1d"]);

export function isDarkCard(color: string): boolean {
  return DARK_CARDS.has(color.toLowerCase());
}

/**
 * Ink for anything printed on a card face. Light cards take a near-black navy,
 * the two dark ones take white, so a face reads the same whichever color the
 * cycle happens to deal it.
 *
 * The light-card ink used to be the deck's mid blue (#2849CB), which sits
 * under 4:1 contrast on the grey and pink cards — borderline even at rest, and
 * the first thing to wash out once the card's own opacity is animating. Darker
 * ink buys back the margin the animation spends.
 */
export function trackInk(color: string): { ink: string; rule: string } {
  return isDarkCard(color)
    ? { ink: "#FFFFFF", rule: "rgba(255,255,255,0.4)" }
    : { ink: "#0B1550", rule: "rgba(11,21,80,0.4)" };
}

/**
 * The section heading's asterisk (`/figma/star2.svg`), inlined so it can take
 * a card's own ink instead of the heading's fixed red. Shared between the
 * desktop deck and the mobile one so both cards carry the same mark.
 */
export function TrackAsterisk({ size }: { size: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40.2117 44.5"
      width={size}
      height={size * (44.5 / 40.2117)}
      fill="none"
      className="block shrink-0"
    >
      <path
        d="M20.325 19V0M23.825 21L38.825 11M23.825 24.5L38.825 33.5M20.325 26.5V44.5M17.325 24.5L1.325 33.5M17.325 21L1.325 11"
        stroke="currentColor"
        strokeWidth={5}
      />
    </svg>
  );
}

/**
 * Reusable TrackCard component.
 * Renders an isometric styled card with smooth border radius, subtle depth,
 * and support for custom track details or pure geometric aesthetics.
 */
export function TrackCard({
  color,
  title,
  subtitle,
  className = "",
  style = {},
  width = 365.44,
  height = 257.6,
  isFront = false,
  is2x = false,
  onClick,
  children,
}: TrackCardProps) {
  const isDark = isDarkCard(color);
  const textColor = isDark ? "text-white" : "text-black";

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-transform duration-300 ${
        is2x ? "rounded-[32px]" : "rounded-[16px]"
      } overflow-hidden ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      } ${className}`}
      style={{
        backgroundColor: color,
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        boxShadow: is2x
          ? "0 34px 75px -15px rgba(0, 0, 0, 0.55), 0 12px 28px -8px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1.5px rgba(0, 0, 0, 0.12)"
          : "0 18px 40px -10px rgba(0, 0, 0, 0.5), 0 6px 14px -4px rgba(0, 0, 0, 0.25), inset 0 1.2px 0 rgba(255, 255, 255, 0.5), inset 0 -1.5px 3px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.12)",
        ...style,
      }}
    >
      {/* Skeumorphic light sheen across card body */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-white/5 to-black/12"
        aria-hidden
      />

      {/* Crisp top specular highlight */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 ${is2x ? "h-[2.5px]" : "h-[1.5px]"} bg-gradient-to-r from-transparent via-white/60 to-transparent`}
        aria-hidden
      />

      {/* Subtle bottom edge reflection line */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 ${is2x ? "h-[2px]" : "h-px"} bg-black/15`}
        aria-hidden
      />

      {/* Optional card content */}
      {children ? (
        children
      ) : title ? (
        <div className={`p-6 flex flex-col justify-between h-full ${textColor}`}>
          <div className="flex items-center justify-between">
            <span className="font-rotonto text-xs uppercase tracking-widest opacity-70">
              Track
            </span>
            <div
              className={`size-3 rounded-full ${
                isDark ? "bg-white/40" : "bg-black/20"
              }`}
            />
          </div>
          <div>
            <h3 className="font-rotonto text-2xl font-bold tracking-tight mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="font-rotonto text-xs opacity-75 whitespace-normal break-words">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TrackCard;
