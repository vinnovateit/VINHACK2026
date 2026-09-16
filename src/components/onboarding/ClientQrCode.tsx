"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface ClientQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function ClientQrCode({
  value,
  size = 86,
  className = "",
}: ClientQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }).catch((err) => {
      console.error("[ClientQrCode] Failed to render canvas QR:", err);
      setError(true);
    });
  }, [value, size]);

  if (error || !value) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-neutral-100 flex items-center justify-center text-[10px] font-mono text-neutral-400 ${className}`}
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
