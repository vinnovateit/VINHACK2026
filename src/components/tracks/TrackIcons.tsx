/**
 * Track icons: FontAwesome 6 Solid filled icons from Iconify (fa6-solid).
 * Rendered using exact SVG paths with fill="currentColor".
 */

import type { ReactElement } from "react";

type IconProps = { size: number; className?: string };

// fa6-solid:industry
function IndustryIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 576 512"
      width={size * (576 / 512)}
      height={size}
      fill="currentColor"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M64 32c-17.7 0-32 14.3-32 32v368c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V152.2c0-18.2-19.4-29.7-35.4-21.1L352 215.4v-63.2c0-18.2-19.4-29.7-35.4-21.1L160 215.4V64c0-17.7-14.3-32-32-32z" />
    </svg>
  );
}

// fa6-solid:shield-halved
function SecurityIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="currentColor"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M256 0c4.6 0 9.2 1 13.4 2.9l188.3 79.9c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0m0 66.8v378.1C394 378 431.1 230.1 432 141.4z" />
    </svg>
  );
}

// fa6-solid:leaf
function ClimateIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="currentColor"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16h-88c-16.6 0-32.7 1.9-48.3 5.4c-25.9 5.9-49.9 16.4-71.4 30.7C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24v-16c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448h1c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96z" />
    </svg>
  );
}

// fa6-solid:gamepad
function EntertainmentIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 640 512"
      width={size * (640 / 512)}
      height={size}
      fill="currentColor"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M192 64C86 64 0 150 0 256s86 192 192 192h256c106 0 192-86 192-192S554 64 448 64zm304 104a40 40 0 1 1 0 80a40 40 0 1 1 0-80M392 304a40 40 0 1 1 80 0a40 40 0 1 1-80 0M168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24h-32v32c0 13.3-10.7 24-24 24s-24-10.7-24-24v-32h-32c-13.3 0-24-10.7-24-24s10.7-24 24-24h32z" />
    </svg>
  );
}

// fa6-solid:wand-magic-sparkles
function WildcardIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 576 512"
      width={size * (576 / 512)}
      height={size}
      fill="currentColor"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1l14.1 37.7c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2l-37.7-14.1L263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0l381.3-381.4c18.7-18.7 18.7-49.1 0-67.9l-34.6-34.5c-18.7-18.7-49.1-18.7-67.9 0zM484.6 82.6l-105 105l-23.3-23.3l105-105zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L64 96zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352z" />
    </svg>
  );
}

// fa6-solid:heart-pulse
function MentalHealthIcon({ size, className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="currentColor"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4h87c22.6 0 43-13.6 51.7-34.5l10.5-25.2l49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3l42.4-84.9l1.7 3.4c9.5 19 28.9 31 50.1 31h104.5c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9M503.7 240h-132c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8l-51-113.9c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9v-5.8c0-69.9 50.5-129.5 119.4-141c45.6-7.6 92 7.3 124.6 39.9l12 12l12-12c32.6-32.6 79-47.5 124.6-39.9c68.9 11.5 119.4 71.1 119.4 141v5.8c0 16.9-2.8 33.5-8.3 49.1" />
    </svg>
  );
}

export const TRACK_ICONS: ReadonlyArray<(props: IconProps) => ReactElement> = [
  MentalHealthIcon,
  IndustryIcon,
  SecurityIcon,
  ClimateIcon,
  EntertainmentIcon,
  WildcardIcon,
];

export function TrackVisual({
  slot,
  className = "",
  size = 72,
}: {
  slot: number;
  ink?: string;
  rule?: string;
  className?: string;
  size?: number;
  is2x?: boolean;
}) {
  const Icon = TRACK_ICONS[((slot % TRACK_ICONS.length) + TRACK_ICONS.length) % TRACK_ICONS.length];

  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center ${className}`}
    >
      <Icon size={size} className="opacity-95" />
    </div>
  );
}
