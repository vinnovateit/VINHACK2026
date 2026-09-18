"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { keyDown, keyUp } from "@/components/motion/click";

export type KeyColor =
  | "pink"
  | "red"
  | "blue"
  | "white"
  | "green"
  | "yellow"
  | "discord"
  | "grey"
  | "gray"
  | (string & {});

export interface KeyButtonProps {
  children?: React.ReactNode;
  content?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  color?: KeyColor;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  size?: "normal" | "compact";
  icon?: React.ReactNode;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  ariaLabel?: string;
  title?: string;
}

const colorMap: Record<
  "pink" | "red" | "blue" | "white" | "green" | "yellow" | "discord" | "grey" | "gray",
  {
    bg: string;
    border: string;
    text: string;
    lineColor: string;
    shadowColor: string;
  }
> = {
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
  white: {
    bg: "bg-white",
    border: "border-neutral-300",
    text: "text-black",
    lineColor: "#d4d4d4",
    shadowColor: "#737373",
  },
  green: {
    bg: "bg-[#10B981]",
    border: "border-[#34D399]",
    text: "text-black",
    lineColor: "#34D399",
    shadowColor: "#065F46",
  },
  yellow: {
    bg: "bg-[#FBBF24]",
    border: "border-[#FDE68A]",
    text: "text-black",
    lineColor: "#FDE68A",
    shadowColor: "#92400E",
  },
  discord: {
    bg: "bg-[#5865F2]",
    border: "border-[#7983F5]",
    text: "text-white",
    lineColor: "#7983F5",
    shadowColor: "#3C45A5",
  },
  grey: {
    bg: "bg-[#3a3a3c]",
    border: "border-[#545458]",
    text: "text-[#8e8e93]",
    lineColor: "#545458",
    shadowColor: "#2c2c2e",
  },
  gray: {
    bg: "bg-[#3a3a3c]",
    border: "border-[#545458]",
    text: "text-[#8e8e93]",
    lineColor: "#545458",
    shadowColor: "#2c2c2e",
  },
};

function resolveTheme(color: string) {
  const lower = color.toLowerCase();
  if (lower === "#5865f2" || lower === "discord") {
    return {
      bgClass: colorMap.discord.bg,
      borderClass: colorMap.discord.border,
      textClass: colorMap.discord.text,
      lineColor: colorMap.discord.lineColor,
      shadowColor: colorMap.discord.shadowColor,
      wellStyle: undefined as React.CSSProperties | undefined,
      capStyle: undefined as React.CSSProperties | undefined,
      textStyle: undefined as React.CSSProperties | undefined,
    };
  }

  if (color in colorMap) {
    const p = colorMap[color as keyof typeof colorMap];
    return {
      bgClass: p.bg,
      borderClass: p.border,
      textClass: p.text,
      lineColor: p.lineColor,
      shadowColor: p.shadowColor,
      wellStyle: undefined,
      capStyle: undefined,
      textStyle: undefined,
    };
  }

  // Custom color code (e.g. hex, rgb, hsl)
  return {
    bgClass: "",
    borderClass: "",
    textClass: "text-white",
    lineColor: color,
    shadowColor: color,
    wellStyle: { backgroundColor: color, borderColor: color },
    capStyle: { backgroundColor: color, borderColor: color },
    textStyle: { color: "#ffffff" },
  };
}

export default function KeyButton({
  children,
  content,
  onClick,
  href,
  color = "pink",
  type = "button",
  disabled = false,
  className = "",
  size = "normal",
  icon,
  target,
  rel,
  "aria-label": ariaLabelProp,
  ariaLabel,
  title,
}: KeyButtonProps) {
  const isPressedRef = useRef(false);
  const keyRef = useRef<HTMLElement>(null);

  const theme = resolveTheme(color);
  const aLabel = ariaLabelProp || ariaLabel;

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

  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const lastTriggerTime = useRef<number>(0);

  const fireClick = () => {
    const now = Date.now();
    if (now - lastTriggerTime.current < 250) return;
    lastTriggerTime.current = now;
    onClick?.();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    animatePress();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled) return;
    animateRelease();
    if (pointerStartPos.current && !href) {
      const dx = Math.abs(e.clientX - pointerStartPos.current.x);
      const dy = Math.abs(e.clientY - pointerStartPos.current.y);
      pointerStartPos.current = null;
      if (dx < 15 && dy < 15 && e.pointerType === "touch") {
        fireClick();
      }
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

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    fireClick();
  };

  const labelContent = content ?? children;

  const innerContent = (
    <>
      {/* Hidden button for form submission if type="submit" */}
      {type === "submit" && !href && (
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
        } left-0 w-full ${wellHeight} ${theme.bgClass} border-[1.4px] ${theme.borderClass} opacity-75 pointer-events-none`}
        style={theme.wellStyle}
      />

      {/* Cap */}
      <div
        className={`absolute top-0 ${
          size === "compact"
            ? "left-[8px] w-[calc(100%-16px)] rounded-[10px]"
            : "left-[10px] w-[calc(100%-20px)] rounded-[12px]"
        } ${capHeight} ${theme.bgClass} border-[1.4px] ${theme.borderClass} opacity-95 pointer-events-none`}
        style={theme.capStyle}
      />

      {/* Content */}
      <div
        className={`absolute top-0 ${
          size === "compact"
            ? "left-[8px] w-[calc(100%-16px)]"
            : "left-[10px] w-[calc(100%-20px)]"
        } ${capHeight} flex items-center justify-center px-2 sm:px-3 gap-1.5 sm:gap-2 z-20 pointer-events-none`}
      >
        {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
        {labelContent && (
          <span
            className={`font-['Rotonto',sans-serif] ${fontSize} font-normal ${theme.textClass} uppercase leading-none tracking-wide text-center flex items-center justify-center`}
            style={{
              ...theme.textStyle,
              textShadow: `0.4px 0 0 ${theme.shadowColor}, 0 0.4px 0 ${theme.shadowColor}, -0.4px 0 0 ${theme.shadowColor}, 0 -0.4px 0 ${theme.shadowColor}`,
            }}
          >
            {labelContent}
          </span>
        )}
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
    </>
  );

  const sharedClasses = `relative ${height} shrink-0 select-none transition-opacity duration-150 will-change-transform inline-block ${
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
  } ${className || "w-[340px]"}`;

  if (href) {
    return (
      <Link
        ref={keyRef as unknown as React.RefObject<HTMLAnchorElement>}
        href={disabled ? "#" : href}
        className={sharedClasses}
        onClick={handleClick}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        target={target}
        rel={rel}
        aria-label={aLabel}
        title={title}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <div
      ref={keyRef as unknown as React.RefObject<HTMLDivElement>}
      className={sharedClasses}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
      aria-label={aLabel}
      title={title}
    >
      {innerContent}
    </div>
  );
}
