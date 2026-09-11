import { TIMELINE } from "@/content/site";

export default function TimelineToggle({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[#74d4f0] border-[#2849cb] border-[1.8px] border-solid h-[63px] overflow-clip rounded-[13.5px] w-[356.4px] select-none cursor-pointer touch-manipulation relative z-10 ${className ?? ""}`}
      data-node-id="343:2115"
      role="group"
      aria-label="Schedule day"
    >
      <div
        className="-translate-y-1/2 absolute bg-[#2849cb] border-[#74d4f0] border-[1.8px] border-solid h-[59.4px] left-0 rounded-[11.7px] top-1/2 w-[181.8px] pointer-events-none"
        data-node-id="343:2117"
      />
      <p
        className="-translate-y-1/2 absolute font-rotonto leading-[normal] left-0 not-italic text-[#74d4f0] text-[21.6px] text-center top-1/2 w-[178.2px] whitespace-nowrap z-1 pointer-events-none transition-colors duration-300"
        data-node-id="343:2118"
      >
        {TIMELINE.days[0].name}
      </p>
      <p
        className="-translate-y-1/2 absolute font-rotonto leading-[normal] left-[178.2px] not-italic text-[#2849cb] text-[21.6px] text-center top-1/2 w-[178.2px] whitespace-nowrap z-1 pointer-events-none transition-colors duration-300"
        data-node-id="343:2116"
      >
        {TIMELINE.days[1].name}
      </p>
    </div>
  );
}
