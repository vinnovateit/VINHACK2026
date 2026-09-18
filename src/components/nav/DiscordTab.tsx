"use client";

import { useEffect, useState } from "react";
import DiscordIcon from "@/components/nav/DiscordIcon";
import KeyButton from "@/components/ui/KeyButton";
import { DISCORD } from "@/content/site";

export default function DiscordTab() {
  const [entered, setEntered] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if the user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Entrance animation delay (~1.35s) so it lands last after hero elements
    const timer = setTimeout(
      () => {
        if (isMounted) setEntered(true);
      },
      prefersReducedMotion ? 0 : 1350,
    );

    // Detect if any visible footer is in the viewport
    const checkFooterVisibility = () => {
      if (!isMounted) return;
      const footers = document.querySelectorAll("footer");
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let inView = false;

      for (const footer of footers) {
        // Only evaluate footers that are currently rendered and visible in layout
        if (footer.getClientRects().length > 0) {
          const rect = footer.getBoundingClientRect();
          // Footer is in view if its top has entered viewport and bottom has not left past top
          if (rect.top < vh && rect.bottom > 0) {
            inView = true;
            break;
          }
        }
      }

      setFooterVisible(inView);
    };

    // Set up IntersectionObserver for all footer elements
    const footers = document.querySelectorAll("footer");
    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        () => {
          checkFooterVisibility();
        },
        {
          root: null,
          threshold: [0, 0.05, 0.1],
        },
      );
      footers.forEach((el) => observer?.observe(el));
    }

    window.addEventListener("scroll", checkFooterVisibility, { passive: true });
    window.addEventListener("resize", checkFooterVisibility, { passive: true });

    // Initial check on mount
    checkFooterVisibility();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("scroll", checkFooterVisibility);
      window.removeEventListener("resize", checkFooterVisibility);
    };
  }, []);

  const isVisible = entered && !footerVisible;

  return (
    <aside
      aria-label="Discord community link"
      className={`fixed right-4 bottom-4 z-100 md:right-7 md:bottom-7 select-none transition-all duration-400 ease-out ${
        isVisible
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none translate-y-4"
      }`}
    >
      <div className="-rotate-2 hover:rotate-0 transition-transform duration-200">
        <KeyButton
          href={DISCORD.href}
          target="_blank"
          rel="noopener noreferrer"
          color="#5865f2"
          size="compact"
          className="w-[145px] sm:w-[160px] md:w-[170px]"
          icon={<DiscordIcon className="size-4 md:size-[18px] shrink-0" />}
        >
          {DISCORD.label}
        </KeyButton>
      </div>
    </aside>
  );
}

