"use client";

import { useEffect, useRef, useState } from "react";
import RECAP from "./recap/Recap";
import { playFilmRollout, playFilmRewind } from "@/components/motion/film";

export default function RecapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const lastScrollY = useRef(0);
  const wasInView = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const updateInView = (next: boolean) => {
      if (next === wasInView.current) return;
      wasInView.current = next;
      setInView(next);
      if (next) {
        playFilmRollout();
      } else {
        playFilmRewind();
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY >= lastScrollY.current;
      lastScrollY.current = currentScrollY;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Check if section is completely outside of viewport
      const isCompletelyOffScreen = rect.bottom <= 0 || rect.top >= vh;
      if (isCompletelyOffScreen) {
        updateInView(false);
        return;
      }

      if (scrollingDown) {
        // When scrolling down, roll out when top enters within 85% of viewport
        if (rect.top < vh * 0.85 && rect.bottom > 60) {
          updateInView(true);
        }
      } else {
        // When scrolling UP (from down to up):
        // As the section moves down towards the lower part of the viewport,
        // roll backwards into the canister!
        if (rect.top > vh * 0.2) {
          updateInView(false);
        } else if (rect.bottom > vh * 0.3) {
          // If scrolling up from sections below into Recap
          updateInView(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    const frame = requestAnimationFrame(handleScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Recap"
      className="absolute bg-black h-[560px] left-0 w-full overflow-hidden top-[832px] z-10"
      data-name="RECAP"
    >
      <RECAP inView={inView} />
    </section>
  );
}
