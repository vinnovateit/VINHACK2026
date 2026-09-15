"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { keyDown, keyUp } from "@/components/motion/click";

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
  const isPressedRef = useRef(false);
  const keyRef = useRef<HTMLDivElement>(null);

  const theme = colorMap[color] || colorMap.pink;

  const height = size === "compact" ? "h-[52px]" : "h-[64px]";
  const wellHeight = size === "compact" ? "h-[45px]" : "h-[56px]";
  const capHeight = size === "compact" ? "h-[38px]" : "h-[48px]";
  const fontSize = size === "compact" ? "text-[15px]" : "text-[19px]";

  const animatePress = () => {
    if (disabled || isPressedRef.current) return;
    isPressedRef.current = true;
    keyDown();

    if (keyRef.current) {
      gsap.to(keyRef.current, {
        y: 6,
        scale: 0.93,
        duration: 0.09,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const animateRelease = () => {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    keyUp();

    if (keyRef.current) {
      gsap.to(keyRef.current, {
        y: 0,
        scale: 1,
        duration: 0.24,
        ease: "back.out(2.6)",
        overwrite: "auto",
      });
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      if (isPressedRef.current) animateRelease();
    };
    window.addEventListener("pointerup", handleGlobalUp);
    window.addEventListener("pointercancel", handleGlobalUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalUp);
      window.removeEventListener("pointercancel", handleGlobalUp);
    };
  }, []);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <div
      ref={keyRef}
      className={`relative ${height} select-none transition-opacity duration-150 will-change-transform ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${className || "w-[340px]"}`}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onPointerDown={() => !disabled && animatePress()}
      onPointerUp={() => !disabled && animateRelease()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          animatePress();
          setTimeout(() => {
            animateRelease();
            onClick?.();
          }, 90);
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

      {/* Well / Base */}
      <div
        className={`absolute ${
          size === "compact" ? "top-[5px] rounded-[12px]" : "top-[6px] rounded-[14px]"
        } left-0 w-full ${wellHeight} ${theme.bg} border-[1.4px] ${theme.border} opacity-75 pointer-events-none`}
      />

      {/* Cap */}
      <div
        className={`absolute top-0 ${
          size === "compact" ? "left-[8px] w-[calc(100%-16px)] rounded-[10px]" : "left-[10px] w-[calc(100%-20px)] rounded-[12px]"
        } ${capHeight} ${theme.bg} border-[1.4px] ${theme.border} opacity-95 pointer-events-none`}
      />

      {/* Content */}
      <div
        className={`absolute top-0 ${
          size === "compact" ? "left-[8px] w-[calc(100%-16px)]" : "left-[10px] w-[calc(100%-20px)]"
        } ${capHeight} flex items-center justify-center px-4 sm:px-5 gap-2.5 sm:gap-3 z-20 pointer-events-none`}
      >
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        <span
          className={`font-['Rotonto',sans-serif] ${fontSize} font-normal ${theme.text} uppercase leading-none tracking-wide text-center`}
          style={{
            textShadow: `0.4px 0 0 ${theme.shadowColor}, 0 0.4px 0 ${theme.shadowColor}, -0.4px 0 0 ${theme.shadowColor}, 0 -0.4px 0 ${theme.shadowColor}`,
          }}
        >
          {children}
        </span>
      </div>

      {/* Bevel edge left (frontmost z-index, slightly reduced height) */}
      <svg
        className="absolute left-0 top-0 w-[24px] h-full pointer-events-none z-30 overflow-visible"
        viewBox={size === "compact" ? "0 0 24 52" : "0 0 24 64"}
        fill="none"
      >
        <line
          x1={size === "compact" ? 7.5 : 9.5}
          y1={size === "compact" ? 34.5 : 43.5}
          x2={size === "compact" ? 3 : 3.5}
          y2={size === "compact" ? 41 : 51.5}
          stroke={theme.lineColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>

      {/* Bevel edge right (frontmost z-index, slightly reduced height) */}
      <svg
        className="absolute right-0 top-0 w-[24px] h-full pointer-events-none z-30 overflow-visible"
        viewBox={size === "compact" ? "0 0 24 52" : "0 0 24 64"}
        fill="none"
      >
        <line
          x1={size === "compact" ? 16.5 : 14.5}
          y1={size === "compact" ? 34.5 : 43.5}
          x2={size === "compact" ? 21 : 20.5}
          y2={size === "compact" ? 41 : 51.5}
          stroke={theme.lineColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
