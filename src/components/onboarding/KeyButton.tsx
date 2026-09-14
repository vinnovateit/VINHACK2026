"use client";

import React, { useState } from "react";

type KeyColor = "pink" | "red" | "blue";

interface KeyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: KeyColor;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  size?: "normal" | "compact";
  icon?: React.ReactNode;
}

const colorMap = {
  pink: {
    bg: "bg-[#FDBBFF]",
    border: "border-[#9B83F0]",
    text: "text-[#734682]",
    lineColor: "#9B83F0",
  },
  red: {
    bg: "bg-[#FC2425]",
    border: "border-[#FF4337]",
    text: "text-white",
    lineColor: "#FF4337",
  },
  blue: {
    bg: "bg-[#2B24FC]",
    border: "border-[#74D4F0]",
    text: "text-[#74D4F0]",
    lineColor: "#74D4F0",
  },
};

export default function KeyButton({
  children,
  onClick,
  color = "pink",
  type = "button",
  disabled = false,
  className = "",
  size = "normal",
  icon,
}: KeyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const theme = colorMap[color];

  const heightClass = size === "compact" ? "h-[54px]" : "h-[68px]";
  const textClass = size === "compact" ? "text-[15px]" : "text-[19px] md:text-[21px]";

  return (
    <div
      className={`relative inline-block select-none transition-all duration-150 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => !disabled && setIsPressed(false)}
    >
      {/* Base Layer (Bottom well / shadow plate) */}
      <div
        className={`absolute inset-0 translate-y-[6px] rounded-[15.84px] border-[1.32px] border-solid opacity-75 ${theme.bg} ${theme.border} pointer-events-none`}
      />

      {/* Bottom corner bevel tick left */}
      <div className="absolute left-[3px] -bottom-[1px] w-[8px] h-[8px] flex items-center justify-center pointer-events-none z-10">
        <div className="-rotate-45 w-[9px] h-[1.32px]" style={{ backgroundColor: theme.lineColor }} />
      </div>

      {/* Bottom corner bevel tick right */}
      <div className="absolute right-[3px] -bottom-[1px] w-[8px] h-[8px] flex items-center justify-center pointer-events-none z-10">
        <div className="rotate-45 w-[9px] h-[1.32px]" style={{ backgroundColor: theme.lineColor }} />
      </div>

      {/* Top Layer (Cap) with interactive travel */}
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`relative flex items-center justify-center w-full ${heightClass} px-6 md:px-8 rounded-[15.84px] border-[1.32px] border-solid opacity-95 ${theme.bg} ${theme.border} font-['Rotonto',sans-serif] ${textClass} ${theme.text} uppercase tracking-wider transition-transform duration-100 ease-out outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-400 ${
          isPressed ? "translate-y-[5px]" : "translate-y-0 hover:-translate-y-[1px]"
        }`}
      >
        <span className="flex items-center gap-3">
          {children}
          {icon && <span className="inline-flex items-center">{icon}</span>}
        </span>
      </button>
    </div>
  );
}
