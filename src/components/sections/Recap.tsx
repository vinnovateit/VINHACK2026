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

    let hasAnimated = false;

    const handleScroll = () => {
      if (hasAnimated) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      if (rect.top < vh * 0.85 && rect.bottom > 60) {
        hasAnimated = true;
        setInView(true);
        playFilmRollout();
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
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
