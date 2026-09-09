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
  onClick,
  children,
}: TrackCardProps) {
  const isDark =
    color.toLowerCase() === "#2849cb" || color.toLowerCase() === "#fa1a1d";
  const textColor = isDark ? "text-white" : "text-black";

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-transform duration-300 rounded-[16px] overflow-hidden ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      } ${className}`}
      style={{
        backgroundColor: color,
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        boxShadow: isFront
          ? "0 18px 40px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.06)"
          : "0 10px 25px -8px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {/* Subtle inner top-edge highlight for tactile card feel */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-white/25 pointer-events-none"
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
              <p className="font-rotonto text-xs opacity-75 line-clamp-2">
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
