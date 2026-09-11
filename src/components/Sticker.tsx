import type { CSSProperties } from "react";

/**
 * A four-point star, thrown onto a section the same way the hero's stickers
 * are — drawn rather than exported, since it is two mirrored curves. Pop-in
 * timing is `.sticker-pop` in globals.css, armed by the nearest ancestor
 * carrying `data-in-view` (see `useInView`).
 */
export function Sticker({
  size = 24,
  color = "#fcfcfc",
  rotateFrom = -24,
  rotateTo = 0,
  delay = 0,
  className = "",
  style,
}: {
  size?: number;
  color?: string;
  /** The tilt it's thrown in from, in degrees. */
  rotateFrom?: number;
  /** The tilt it settles at, in degrees — the resting angle on the section. */
  rotateTo?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill={color}
      className={`sticker-pop pointer-events-none ${className}`}
      style={
        {
          width: size,
          height: size,
          "--pop-delay": `${delay}ms`,
          "--sticker-rotate-from": `${rotateFrom}deg`,
          "--sticker-rotate-to": `${rotateTo}deg`,
          ...style,
        } as CSSProperties
      }
    >
      <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12Z" />
    </svg>
  );
}
