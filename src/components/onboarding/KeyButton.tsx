"use client";

import React, { useState } from "react";

export type KeyColor = "pink" | "red" | "blue";

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
    shadowColor: "#734682",
  },
  red: {
    bg: "bg-[#FC2425]",
    border: "border-[#FF4337]",
    text: "text-white",
    lineColor: "#FF4337",
    shadowColor: "#FF4337",
  },
  blue: {
    bg: "bg-[#2B24FC]",
    border: "border-[#74D4F0]",
    text: "text-[#74D4F0]",
    lineColor: "#74D4F0",
    shadowColor: "#74d4f0",
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
  const [pressed, setPressed] = useState(false);
  const theme = colorMap[color] || colorMap.pink;

  const height = size === "compact" ? "h-[54px]" : "h-[68px]";
  const wellHeight = size === "compact" ? "h-[48px]" : "h-[60px]";
  const capHeight = size === "compact" ? "h-[42px]" : "h-[52px]";
  const fontSize = size === "compact" ? "text-[16px]" : "text-[20px]";

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <div
      className={`relative ${height} select-none transition-opacity duration-150 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${className || "w-[340px]"}`}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => !disabled && setPressed(false)}
      onMouseLeave={() => !disabled && setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => !disabled && setPressed(false)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Hidden button for form submission if type="submit" */}
      {type === "submit" && (
        <button
          type="submit"
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Well */}
      <div
        className={`absolute top-[4px] left-0 w-full ${wellHeight} rounded-[13px] ${theme.bg} border-[1.3px] ${theme.border} opacity-75 pointer-events-none`}
      />

      {/* Bevel left */}
      <div className="absolute bottom-0 left-[10px] w-[6px] h-[6px] pointer-events-none z-10 flex items-center justify-center">
        <div
          className="-rotate-45 w-[7px] h-[1.3px]"
          style={{ backgroundColor: theme.lineColor }}
        />
      </div>

      {/* Bevel right */}
      <div className="absolute bottom-0 right-[10px] w-[6px] h-[6px] pointer-events-none z-10 flex items-center justify-center">
        <div
          className="rotate-45 w-[7px] h-[1.3px]"
          style={{ backgroundColor: theme.lineColor }}
        />
      </div>

      {/* Cap */}
      <div
        className={`absolute top-0 left-[11px] w-[calc(100%-22px)] ${capHeight} rounded-[13px] ${theme.bg} border-[1.3px] ${theme.border} opacity-95 pointer-events-none transition-transform duration-75`}
        style={{ transform: pressed ? "translateY(4px)" : "translateY(0)" }}
      />

      {/* Content */}
      <div
        className={`absolute top-0 left-[11px] w-[calc(100%-22px)] ${capHeight} flex items-center justify-center px-5 gap-3 transition-transform duration-75`}
        style={{ transform: pressed ? "translateY(4px)" : "translateY(0)" }}
      >
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        <span
          className={`font-['Rotonto',sans-serif] ${fontSize} font-light ${theme.text} uppercase leading-none tracking-wide text-center`}
          style={{
            textShadow: `0.4px 0 0 ${theme.shadowColor}, 0 0.4px 0 ${theme.shadowColor}, -0.4px 0 0 ${theme.shadowColor}, 0 -0.4px 0 ${theme.shadowColor}`,
          }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
