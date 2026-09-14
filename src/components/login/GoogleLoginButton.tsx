"use client";

import { LOGIN_BUTTON_TEXT_PATH, LOGIN_GOOGLE_ICON_PATH } from "./paths";

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function GoogleLoginButton({
  onClick,
  disabled = false,
  className = "",
}: GoogleLoginButtonProps) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      aria-label="Login with Google"
      className={`group relative block cursor-pointer select-none bg-transparent p-0 border-0 outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-[#74D4F0] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-[15px] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        viewBox="80 620 418 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_0_20px_rgba(43,36,252,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(116,212,240,0.5)] transition-[filter] duration-200"
      >
        {/* Base / Bottom layer */}
        <rect
          opacity="0.75"
          x="81.66"
          y="626.94"
          width="414.68"
          height="79.86"
          rx="15.18"
          fill="#2B24FC"
          stroke="#74D4F0"
          strokeWidth="1.32"
        />

        {/* Diagonal corner connecting lines */}
        <line
          x1="478.933"
          y1="691"
          x2="485"
          y2="697.067"
          stroke="#74D4F0"
          strokeWidth="1.32"
          strokeLinecap="round"
        />
        <line
          x1="95"
          y1="697.067"
          x2="101.067"
          y2="691"
          stroke="#74D4F0"
          strokeWidth="1.32"
          strokeLinecap="round"
        />

        {/* Top Face Layer - translates on press */}
        <g className="transition-transform duration-100 ease-out group-active:translate-x-[-8px] group-active:translate-y-[2.5px] group-hover:brightness-110">
          <rect
            opacity="0.95"
            x="95.66"
            y="622.66"
            width="388.68"
            height="67.68"
            rx="15.18"
            fill="#2B24FC"
            stroke="#74D4F0"
            strokeWidth="1.32"
          />

          {/* Google G Icon */}
          <path d={LOGIN_GOOGLE_ICON_PATH} fill="#74D4F0" />

          {/* "LOGIN WITH GOOGLE" Text Path */}
          <path d={LOGIN_BUTTON_TEXT_PATH} fill="#74D4F0" />
        </g>
      </svg>
      <span className="sr-only">Login with Google</span>
    </button>
  );
}
