import type { ReactNode } from "react";
import { TIMELINE } from "@/content/site";
import ReceiptPrinter from "@/components/timeline/ReceiptPrinter";
import TimelineToggle from "@/components/timeline/TimelineToggle";
import {
  TimelineArrowVector,
  TimelineDay1Stamp,
  TimelineExploreSticker,
  TimelinePhoto234,
  TimelinePhoto235,
  TimelinePhoto236,
  TimelineVector227,
} from "@/components/timeline/TimelineStickers";
import Piece from "@/components/mobile/Piece";

function Loose({
  width,
  height,
  max,
  size,
  stamp,
  className,
  children,
}: {
  width: number;
  height: number;
  max: number;
  size: number;
  stamp: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`shrink-0 ${className ?? ""}`}
      style={{ width: size }}
      data-m-drag
      data-m-stamp={stamp}
    >
      <Piece width={width} height={height} max={max}>
        {children}
      </Piece>
    </div>
  );
}

export default function TimelineSection({
  variant = "canvas",
}: {
  variant?: "canvas" | "flow";
}) {
  if (variant === "flow") {
    return (
      <section
        aria-label="Timeline"
        className="mx-auto max-w-[560px] w-full px-5 py-16 overflow-x-clip"
      >
        {/* The two that ride above the schedule. */}
        <div className="mb-10 flex items-end justify-center gap-4">
          <Loose width={204.814} height={147} max={0.8} size={140} stamp={0}>
            <TimelinePhoto235 />
          </Loose>

          <Loose width={136.85} height={134.841} max={0.9} size={108} stamp={0.12}>
            <div className="absolute top-0 left-0 flex h-[134.841px] w-[136.85px] items-center justify-center">
              <TimelinePhoto234 />
            </div>
          </Loose>
        </div>

        <h2 className="mb-10 text-[44px] text-[#fa1a1d]">{TIMELINE.heading}</h2>

        <Piece width={440.363} height={646}>
          <ReceiptPrinter className="relative" />
        </Piece>

        {/* Day 1 / Day 2 toggle placed below printer on mobile */}
        <div className="mt-8 relative z-20">
          <Piece width={356.4} height={63}>
            <TimelineToggle className="relative mx-auto" />
          </Piece>
        </div>

        {/* And the three stickers below it. */}
        <div className="mt-12 flex flex-wrap items-start justify-center gap-4">
          <Loose width={185.111} height={166.791} max={0.95} size={150} stamp={0.24}>
            <TimelineExploreSticker />
          </Loose>

          <Loose width={160.514} height={164.786} max={0.9} size={116} stamp={0.36}>
            <div
              className="absolute top-0 left-0 flex h-[164.786px] w-[160.514px] items-center justify-center"
              style={{ containerType: "size" }}
            >
              <TimelinePhoto236 />
            </div>
          </Loose>

          <Loose width={150.24} height={144.718} max={0.9} size={110} stamp={0.48}>
            <div className="absolute top-0 left-0 flex h-[144.718px] w-[150.24px] items-center justify-center">
              <TimelineVector227 />
            </div>
          </Loose>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Timeline"
      className="absolute bg-black h-[832px] left-0 overflow-clip top-[5600px] w-[1280px]"
      data-node-id="343:2038"
      data-name="MacBook Air - 17"
    >
      <ReceiptPrinter className="-translate-x-1/2 absolute left-[calc(50%+360.18px)] top-[126px]" />
      <TimelineToggle className="absolute left-[240px] top-[473px]" />
      <TimelineArrowVector />
      <TimelineDay1Stamp />
      <div
        className="absolute flex h-[134.841px] items-center justify-center left-[50px] top-[457.02px] w-[136.85px]"
        data-node-id="343:2215"
      >
        <TimelinePhoto234 />
      </div>
      <div
        className="absolute h-[147px] left-[36px] top-[207px] w-[204.814px]"
        data-node-id="343:2216"
        data-name="image 234"
      >
        <TimelinePhoto235 />
      </div>
      <div
        className="absolute contents h-[239.862px] left-[488px] top-[214px] w-[245.087px]"
        data-node-id="343:2217"
      >
        <TimelineExploreSticker />
      </div>
      <div
        className="absolute aspect-[160.5143220682155/164.78555757652543] flex items-center justify-center left-[33.83%] right-[53.63%] top-[199px]"
        data-node-id="343:2221"
        style={{ containerType: "size" }}
      >
        <TimelinePhoto236 />
      </div>
      <h2
        className="[word-break:break-word] absolute font-rotonto leading-[normal] left-[167px] not-italic text-[#fa1a1d] text-[128px] top-[calc(50%-97px)] whitespace-nowrap"
        data-node-id="343:2222"
      >
        {TIMELINE.heading}
      </h2>
      <div
        className="absolute flex h-[144.718px] items-center justify-center left-[529.2px] top-[504.5px] w-[150.24px]"
        data-node-id="343:2223"
      >
        <TimelineVector227 />
      </div>
    </section>
  );
}
