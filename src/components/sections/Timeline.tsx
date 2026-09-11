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

export default function TimelineSection() {
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
