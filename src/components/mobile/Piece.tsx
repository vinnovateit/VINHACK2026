"use client";

import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * A drawing from the design file, dropped in at its own size and scaled to fit
 * the column.
 *
 * It uses ResizeObserver on the client so that switching between screen sizes,
 * rotating devices, or toggling mobile emulation in DevTools IMMEDIATELY measures
 * and centers the piece without needing a page refresh.
 *
 * Pure CSS container queries and tan(atan2) are preserved as CSS fallback variables.
 */
export default function Piece({
  width,
  height,
  max = 1,
  className,
  children,
}: {
  width: number;
  height: number;
  max?: number;
  className?: string;
  children: ReactNode;
}) {
  const pieceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = pieceRef.current;
    if (!el) return;

    const measure = () => {
      const containerW = el.clientWidth;
      if (containerW > 0) {
        const fit = containerW / width;
        const computed = Math.min(max, fit);
        setScale((prev) => (prev !== computed ? computed : prev));
      }
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [width, max]);

  const frameStyle: CSSProperties = {
    "--piece-w": `${width}px`,
    "--piece-h": `${height}px`,
    "--piece-max": max,
    ...(scale !== null
      ? {
          "--piece-scale": scale,
          width: `${width * scale}px`,
          height: `${height * scale}px`,
        }
      : {}),
  } as CSSProperties;

  const plateStyle: CSSProperties = {
    ...(scale !== null
      ? {
          transform: `scale(${scale})`,
        }
      : {}),
  };

  return (
    <div
      ref={pieceRef}
      className={className ? `piece ${className}` : "piece"}
    >
      <div className="piece-frame" style={frameStyle}>
        <div className="piece-plate" style={plateStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}
