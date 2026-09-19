"use client";

import type { FC } from "react";

interface FilmLeaderProps {
  className?: string;
  isMobile?: boolean;
}

/**
 * Authentic 35mm Film Leader Tongue (the tapered start of a 135 film roll).
 * Features the classic curved top cutout, rounded front corners, bottom sprocket track,
 * frame "00" markers, DX barcode, and take-up slot.
 */
export const FilmLeader: FC<FilmLeaderProps> = ({ className = "", isMobile = false }) => {
  if (isMobile) {
    // Mobile dimensions: 130px wide, 155px high
    return (
      <svg
        viewBox="0 0 130 155"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 block pointer-events-none select-none ${className}`}
        aria-hidden
      >
        {/* Tapered Leader Silhouette */}
        <path
          d="M0 0 H35 C52 0 60 65 78 65 H122 A8 8 0 0 1 130 73 V147 A8 8 0 0 1 122 155 H0 Z"
          fill="#0c0c0c"
          stroke="#313131"
          strokeWidth="2"
        />

        {/* Top Sprocket Hole before ramp */}
        <rect x="12" y="4" width="10" height="13" rx="2" fill="white" />

        {/* Bottom Sprocket Holes along the full length of the tongue */}
        {[12, 28, 44, 60, 76, 92, 108].map((x) => (
          <rect key={`m-sprocket-${x}`} x={x} y="138" width="10" height="13" rx="2" fill="white" />
        ))}

        {/* DX Barcode lines */}
        <g fill="#555555" opacity="0.85">
          <rect x="62" y="80" width="2" height="16" />
          <rect x="66" y="80" width="4" height="16" />
          <rect x="72" y="80" width="1.5" height="16" />
          <rect x="75" y="80" width="3" height="16" />
          <rect x="80" y="80" width="2" height="16" />
        </g>

        {/* Printed Monospace Film Markings */}
        <text x="86" y="88" fill="#d4d4d4" fontSize="6.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">
          ▶ 00
        </text>
        <text x="86" y="99" fill="#999999" fontSize="5.5" fontFamily="monospace" letterSpacing="0.4">
          LOAD ▶
        </text>
        <text x="86" y="110" fill="#eab308" fontSize="5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.4">
          35mm
        </text>

        {/* Camera Spool Catch Notch */}
        <rect x="118" y="98" width="3" height="14" rx="1.5" fill="#1c1c1c" stroke="#333333" strokeWidth="0.8" />
      </svg>
    );
  }

  // Desktop dimensions: 200px wide, 238px high
  return (
    <svg
      viewBox="0 0 200 238"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 block pointer-events-none select-none ${className}`}
      aria-hidden
    >
      {/* Tapered Leader Silhouette */}
      <path
        d="M0 0 H52 C78 0 88 100 118 100 H192 A8 8 0 0 1 200 108 V230 A8 8 0 0 1 192 238 H0 Z"
        fill="#0c0c0c"
        stroke="#313131"
        strokeWidth="2.5"
      />

      {/* Top Sprocket Holes before ramp */}
      <rect x="14" y="8" width="14" height="19" rx="3" fill="white" />
      <rect x="37" y="8" width="14" height="19" rx="3" fill="white" />

      {/* Bottom Sprocket Holes along the full length of the tongue */}
      {[14, 37, 60, 83, 106, 129, 152, 175].map((x) => (
        <rect key={`d-sprocket-${x}`} x={x} y="211" width="14" height="19" rx="3" fill="white" />
      ))}

      {/* DX Barcode lines */}
      <g fill="#666666" opacity="0.9">
        <rect x="94" y="122" width="3" height="24" />
        <rect x="100" y="122" width="6" height="24" />
        <rect x="109" y="122" width="2" height="24" />
        <rect x="113" y="122" width="5" height="24" />
        <rect x="121" y="122" width="3" height="24" />
      </g>

      {/* Printed Monospace Film Markings */}
      <text x="132" y="134" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="0.8">
        ▶ 00
      </text>
      <text x="132" y="150" fill="#a3a3a3" fontSize="8" fontFamily="monospace" letterSpacing="0.6">
        LOAD FILM ▶
      </text>
      <text x="132" y="166" fill="#eab308" fontSize="7.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.6">
        35mm ISO 400
      </text>
      <text x="132" y="180" fill="#737373" fontSize="7" fontFamily="monospace" letterSpacing="0.4">
        36 EXP • 2026
      </text>

      {/* Camera Spool Catch Notch */}
      <rect x="182" y="148" width="4.5" height="22" rx="2" fill="#1c1c1c" stroke="#333333" strokeWidth="1" />
    </svg>
  );
};

export default FilmLeader;
