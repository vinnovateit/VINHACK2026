"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface ClientQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export default function ClientQrCode({
  value,
  size = 86,
  className = "",
  darkColor = "#000000",
  lightColor = "#ffffff",
}: ClientQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    }).catch((err) => {
      console.error("[ClientQrCode] Failed to render canvas QR:", err);
      setError(true);
    });
  }, [value, size, darkColor, lightColor]);

  if (error || !value) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-neutral-100 flex items-center justify-center text-[10px] font-rotonto text-neutral-400 ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded ${className}`}
    />
  );
}
