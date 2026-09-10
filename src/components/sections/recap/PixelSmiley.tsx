"use client";

import { useEffect, useState } from "react";

// The 48 LED cells matrix coordinates from green.svg
const PIXEL_COORDS: [number, number][] = [
  [65.85, 16.12], [61.11, 25.67], [56.4, 35.21], [51.67, 44.75], [46.95, 54.29], [42.23, 63.83], [37.51, 73.38],
  [94.27, 30.68], [89.53, 40.22], [84.82, 49.77], [80.08, 59.31], [75.36, 68.85], [70.66, 78.39], [65.92, 87.94],
  [107.78, 27.35], [103.07, 36.89], [98.34, 46.44], [93.63, 55.98], [88.89, 65.52], [84.19, 75.06], [79.44, 84.61],
  [46.85, 6.42], [42.14, 15.97], [37.4, 25.51], [32.69, 35.05], [27.96, 44.59], [23.24, 54.14],
  [75.31, 20.97], [70.58, 30.52], [65.86, 40.06], [61.13, 49.61], [56.41, 59.14], [51.7, 68.69], [46.95, 78.23],
  [56.37, 11.27], [51.63, 20.81], [46.92, 30.36], [42.19, 39.9], [37.47, 49.44], [32.74, 58.99], [28.03, 68.52],
  [84.79, 25.83], [80.05, 35.38], [75.34, 44.92], [70.61, 54.46], [65.89, 64.0], [61.16, 73.55], [56.44, 83.08],
];

// Face expressions mapping pixel indices
const FACES: number[][] = [
  // 1. Classic smile
  [2, 3, 43, 44, 5, 11, 32, 38, 46],
  // 2. Wink ;)
  [2, 3, 44, 5, 11, 32, 38, 46],
  // 3. Open mouth :O
  [2, 3, 43, 44, 4, 11, 31, 32, 37, 38],
  // 4. Cool sunglasses B)
  [1, 2, 3, 8, 9, 28, 29, 42, 43, 44, 5, 11, 32, 46],
  // 5. Smirk / Grin
  [2, 3, 43, 44, 11, 32, 46],
  // 6. Cute / Wide smile
  [2, 3, 43, 44, 4, 11, 32, 38, 45, 46],
];

export default function PixelSmiley() {
  const [currentFace, setCurrentFace] = useState<number>(0);
  const [isBlank, setIsBlank] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Screen goes blank
      setIsBlank(true);

      // 2. 250ms later, display a new random face
      setTimeout(() => {
        setCurrentFace((prev) => {
          let next = Math.floor(Math.random() * FACES.length);
          while (next === prev) {
            next = Math.floor(Math.random() * FACES.length);
          }
          return next;
        });
        setIsBlank(false);
      }, 250);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const activeIndices = isBlank ? [] : FACES[currentFace] || [];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 108 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <g clipPath="url(#clip0_pixel_smiley)">
        {/* Outer lime green pill */}
        <rect
          width="79.6987"
          height="76.1771"
          rx="38.0885"
          transform="matrix(-0.835951 -0.548805 -0.537443 0.8433 107.565 43.739)"
          fill="#BFEA88"
        />
        <g clipPath="url(#clip1_pixel_smiley)">
          {/* Inner dark green display screen */}
          <rect
            width="75.9189"
            height="70.718"
            rx="35.359"
            transform="matrix(-0.890175 -0.455618 -0.443531 0.896259 103.347 39.8864)"
            fill="#274135"
          />

          {/* 48 LED Pixel Cells */}
          {PIXEL_COORDS.map(([dx, dy], idx) => {
            const isActive = activeIndices.includes(idx);
            return (
              <rect
                key={`pixel-${idx}`}
                width="9.12515"
                height="9.12601"
                rx="3.44963"
                transform={`matrix(-0.890175 -0.455618 -0.443531 0.896259 ${dx} ${dy})`}
                fill={isActive ? "#00D753" : "#171918"}
                className="transition-colors duration-150"
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 3px rgba(0, 215, 83, 0.75))"
                    : "none",
                }}
              />
            );
          })}
        </g>
      </g>
      <defs>
        <clipPath id="clip0_pixel_smiley">
          <rect
            width="79.6987"
            height="76.1771"
            rx="38.0885"
            transform="matrix(-0.835951 -0.548805 -0.537443 0.8433 107.565 43.739)"
            fill="white"
          />
        </clipPath>
        <clipPath id="clip1_pixel_smiley">
          <rect
            width="75.9189"
            height="70.718"
            rx="35.359"
            transform="matrix(-0.890175 -0.455618 -0.443531 0.896259 103.347 39.8864)"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
