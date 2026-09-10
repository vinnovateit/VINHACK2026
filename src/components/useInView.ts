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
  // Initial state must be identical on server (SSR) and client to avoid hydration mismatch.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Browsers without IntersectionObserver just start visible — there is
    // nothing to observe with, and a permanently-hidden section is worse than
    // one that skips its pop-in.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(frame);
    }

    const el = ref.current;
    if (!el) return;
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
