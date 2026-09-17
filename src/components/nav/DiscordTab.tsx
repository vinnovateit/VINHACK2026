"use client";

import DiscordIcon from "@/components/nav/DiscordIcon";
import KeyButton from "@/components/ui/KeyButton";
import { DISCORD } from "@/content/site";

export default function DiscordTab() {
  return (
    <aside
      aria-label="Discord community link"
      className="fixed right-4 bottom-4 z-100 md:right-7 md:bottom-7 -rotate-2 hover:rotate-0 transition-transform duration-200 select-none"
    >
      <KeyButton
        href={DISCORD.href}
        target="_blank"
        rel="noopener noreferrer"
        color="blue"
        size="compact"
        className="w-[145px] sm:w-[160px] md:w-[170px]"
        icon={<DiscordIcon className="size-4 md:size-[18px] shrink-0" />}
      >
        {DISCORD.label}
      </KeyButton>
    </aside>
  );
}
