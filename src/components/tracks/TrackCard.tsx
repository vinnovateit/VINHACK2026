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
 * The official VinHack wordmark logo, inlined for crisp SVG rendering at any scale,
 * with fill set to currentColor so it adapts to the card's text ink.
 */
export function TrackCardLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 230 78.7705"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block shrink-0 ${className}`}
      aria-hidden
    >
      <path
        d="M54.5654 4.34762C59.0524 5.04344 61.3007 5.83484 63.0439 10.6494C43.5087 36.3485 34.2745 51.4614 18.6953 78.7705C14.8659 78.2335 12.6771 77.403 8.69531 75.0761L15.7607 33.1386L6.41309 44.6552L0 40.3095C7.56115 26.455 13.1653 22.1972 24.6738 18.4716C27.7925 20.3095 29.0391 21.8271 29.6738 26.0771L26.5215 27.8154L21.8477 55.6289C32.4787 33.1334 39.234 21.435 54.5654 4.34762ZM205.652 1.19723C206.492 -1.49654 215.326 1.19723 215.326 1.19723L207.826 22.4922C211.834 18.8955 214.216 17.0905 219.674 15.7558C223.707 16.4511 225.055 17.6548 226.087 21.0791C226.686 27.2455 225.393 30.7688 220.435 37.1591C216.564 41.5711 214.529 42.1087 210.979 41.9394L214.456 46.8281L225 41.9394C227.169 43.5982 228.268 44.8521 229.831 46.6357L230 46.8281C223.973 52.2153 219.756 54.0289 210.979 55.4111L200.652 43.1347L196.195 54.1074C192.866 54.8578 191.189 54.4588 188.695 51.6093V48.2412C181.848 55.5074 177.572 57.9406 169.131 59.1054L161.521 52.4785L157.718 59.1054C155.105 59.1287 153.672 58.6996 151.195 56.8242C151.195 56.8242 151.195 50.4138 149.782 49.6533C148.369 48.8944 144.587 59.3383 135.869 62.4736L128.152 56.8242V50.414L115.544 63.4511C111.148 63.2746 109.811 61.8935 107.718 59.1054C113.953 50.5622 116.107 45.7802 117.174 37.1591L117.029 37.2314C111.785 39.8473 109.394 41.0398 107.718 44.6552C103.001 53.1611 101.587 57.6511 99.2393 65.624C95.5858 64.9832 93.7413 64.4594 91.7393 62.4736L93.1523 55.4111L83.3691 65.624C79.983 65.1936 78.1389 64.6962 75.3262 61.6045L81.1953 46.2851C81.1604 46.3149 73.7995 52.594 71.8477 55.6289C69.8911 58.6711 64.6738 68.8838 64.6738 68.8838C61.344 68.5542 59.705 67.931 57.1738 65.624L59.2393 59.1054L45.6523 69.7529C42.6436 68.8345 40.9912 68.0154 38.1523 65.624L50 36.5068C55.0086 37.2108 58.4731 37.2383 59.2393 40.3095C59.2393 40.3095 53.1533 52.5854 53.0439 53.5644C52.9352 54.5422 63.5869 45.0898 64.6738 43.7861C65.7568 42.4868 69.2133 34.0721 69.2393 34.0088C72.9629 34.2422 74.8789 34.7087 77.8262 36.5068L76.8477 40.3095L83.3691 33.1386C87.9594 33.3306 90.244 33.856 93.1523 36.5068L89.5654 49.1103L97.1738 41.9394L107.718 11.8447C111.398 10.4193 113.466 10.3448 117.174 13.1484L110.869 33.1386C113.589 29.5974 115.402 28.0166 119.892 26.9463C123.211 27.8571 125.76 27.707 126.956 30.4228C128.15 33.135 125.66 41.9137 125.652 41.9394C137.573 28.6686 142.752 24.2975 149.131 22.4922C152.697 23.9427 153.6 25.1577 153.805 27.8154L142.826 36.5068C137.371 42.8283 134.456 51.3918 135.869 52.4785C137.282 53.5649 145.974 43.2886 149.131 33.1386C151.659 30.0974 153.53 29.7373 157.718 31.6181V44.6552L161.521 41.9394C167.585 27.0882 172.384 23.0881 182.174 19.7754C186.734 21.6264 189.015 22.9682 190.869 27.8154L186.195 34.0088C186.153 34.0186 182.93 34.7576 182.174 33.1386C181.413 31.5087 182.174 27.8154 182.174 27.8154C172.816 35.8226 166.957 46.7201 169.131 50.414C171.305 54.107 181.859 43.8849 193.805 30.4228L205.652 1.19723ZM217.394 24.122C216.414 22.7115 203.916 35.5305 204.459 36.291C205.003 37.0511 208.224 36.4723 213.154 32.3789C215.68 29.5354 218.372 25.5344 217.394 24.122ZM59.2393 21.2968C63.9418 21.0069 66.1639 21.673 69.2393 24.665L63.0439 35.0947L54.5654 31.6181C56.2041 26.6055 57.3652 25.0723 59.2393 21.2968Z"
        fill="currentColor"
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
      ) : (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-[48px]"
          style={{ color: trackInk(color).ink }}
        >
          <TrackCardLogo className={`${is2x ? "w-[52%] max-w-[380px]" : "w-[55%] max-w-[190px]"} h-auto`} />
        </div>
      )}
    </div>
  );
}

export default TrackCard;
