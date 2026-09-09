"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once, the first time the ref'd element crosses into the viewport —
 * the whole of what `.sponsor-pop` needs to know to arm its animation
 * (`[data-in-view]` in globals.css). Deliberately not GSAP/ScrollTrigger:
 * the desktop canvas this can sit inside is itself CSS-scaled (see
 * DesignCanvas), and a plain IntersectionObserver reads the real, transformed
 * geometry without needing to know that.
 */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  // Browsers without IntersectionObserver just start visible — there is
  // nothing to observe with, and a permanently-hidden section is worse than
  // one that skips its pop-in.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}
