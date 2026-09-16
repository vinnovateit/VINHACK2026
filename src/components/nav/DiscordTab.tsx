import DiscordIcon from "@/components/nav/DiscordIcon";
import { DISCORD } from "@/content/site";


export default function DiscordTab() {
  return (
    <a
      href={DISCORD.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={DISCORD.label}
      className="group fixed right-4 bottom-4 z-100 flex items-center gap-2 border border-black bg-[#74d4f0] px-3 py-2 font-rotonto text-[13px] tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-transform duration-200 ease-out -rotate-2 hover:-translate-y-1 hover:rotate-0 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#bfea88] active:translate-y-0 md:right-7 md:bottom-7 md:gap-2.5 md:px-4 md:py-2.5 md:text-[15px]"
    >

      <DiscordIcon className="block size-4 shrink-0 md:size-[18px]" />

      {DISCORD.label}


      <span className="text-[11px] leading-none opacity-70 transition-opacity duration-200 group-hover:opacity-100 md:text-[12px]">
        ↗
      </span>
    </a>
  );
}
