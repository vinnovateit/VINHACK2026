"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  once?: boolean;
  rootMargin?: string;
}

/**
 * Fires when the ref'd element crosses into the viewport.
 * Deliberately not GSAP/ScrollTrigger: the desktop canvas this can sit inside
 * is itself CSS-scaled (see DesignCanvas), and a plain IntersectionObserver reads
 * the real, transformed geometry without needing to know that.
 */
export function useInView<T extends HTMLElement>(
  threshold = 0.2,
  options: UseInViewOptions = {},
) {
  const { once = true, rootMargin } = options;
  const ref = useRef<T>(null);
  // Initial state must be identical on server (SSR) and client to avoid hydration mismatch.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Triggers as soon as the top of element enters within 85% of viewport height
      // and hasn't completely scrolled past the top
      const isVisible = rect.top < vh * 0.85 && rect.bottom > 40;
      if (isVisible) {
        setInView(true);
        if (once) {
          window.removeEventListener("scroll", checkVisibility);
          window.removeEventListener("resize", checkVisibility);
        }
      } else if (!once && (rect.top > vh || rect.bottom < 0)) {
        setInView(false);
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) {
              observer?.disconnect();
              window.removeEventListener("scroll", checkVisibility);
              window.removeEventListener("resize", checkVisibility);
            }
          } else if (!once) {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top > vh || rect.bottom < 0) {
              setInView(false);
            }
          }
        },
        { threshold, rootMargin },
      );
      observer.observe(el);
    }

    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    // Initial check on mount
    checkVisibility();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [threshold, once, rootMargin]);

  return [ref, inView] as const;
}
