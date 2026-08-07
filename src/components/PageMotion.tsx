"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Motion for everything below the hero: scroll reveals per section, the two
 * endless marquees, and the footer's folder-tab hover.
 *
 * Property budget — concurrent tweens must never share a property, or they
 * fight over the one transform matrix GSAP composes:
 *   reveal (one-shot, on scroll)  ->  x / y / scale / opacity
 *   marquee (endless)             ->  x, on row elements only
 *   hover (interactive)           ->  y / scale, with overwrite:"auto" so a
 *                                     hover mid-reveal simply wins
 */

/** Per-section reveal, keyed by Figma node id. */
const SECTIONS: {
  id: string;
  name: string;
  y?: number;
  x?: number;
  scale?: number;
  stagger?: number;
}[] = [
  { id: "297:328", name: "About", y: 40, stagger: 0.1 },
  { id: "297:312", name: "Who are we", y: 34, stagger: 0.05 },
  { id: "297:300", name: "Projects", y: 70, stagger: 0.09 },
  { id: "594:33", name: "Tracks", y: 46, stagger: 0.12 },
  { id: "343:2038", name: "Timeline", y: 44, stagger: 0.05 },
  { id: "343:709", name: "Rules", y: 40, scale: 0.96, stagger: 0.06 },
  { id: "343:751", name: "Guidelines", y: 40, scale: 0.97, stagger: 0.07 },
  { id: "297:166", name: "Register", y: 30, scale: 0.9, stagger: 0.1 },
  { id: "297:3", name: "Footer", y: 36, stagger: 0.05 },
];

const MARQUEES = [
  // px per second — the footer strip is long and calm, the huge "Who are we?"
  // lettering needs to be slower still to stay readable.
  { key: "footer", speed: 85 },
  { key: "who", speed: 55 },
];

const TABS = ["email", "github", "instagram", "linkedin", "medium"];

/** Figma grouping wrappers are `display: contents` and generate no box, so
 *  transforms are inert on them — descend to the real boxes underneath. */
function realBoxes(node: Element, out: HTMLElement[] = []) {
  for (const child of Array.from(node.children)) {
    if (getComputedStyle(child).display === "contents") realBoxes(child, out);
    else out.push(child as HTMLElement);
  }
  return out;
}

export default function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const canvas = scope.closest(".canvas") as HTMLElement | null;
      /** Layout px per rendered px — the canvas is scaled to the viewport. */
      const unscale = canvas ? 1280 / canvas.getBoundingClientRect().width : 1;
      const width = (el: Element) => el.getBoundingClientRect().width * unscale;

      const mm = gsap.matchMedia();
      const cleanups: (() => void)[] = [];

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ---- Section reveals -------------------------------------------
        for (const section of SECTIONS) {
          const el = scope.querySelector(`[data-node-id="${section.id}"]`);
          if (!el) continue;
          const boxes = realBoxes(el);
          if (!boxes.length) continue;
          gsap.from(boxes, {
            y: section.y ?? 40,
            x: section.x ?? 0,
            scale: section.scale ?? 1,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: section.stagger ?? 0.07,
            scrollTrigger: { trigger: el, start: "top 78%", once: true },
          });
        }

        // ---- Endless marquees ------------------------------------------
        for (const { key, speed } of MARQUEES) {
          const row = scope.querySelector(
            `[data-marquee="${key}"]`,
          ) as HTMLElement | null;
          if (!row || !row.firstElementChild) continue;

          const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
          const unit = width(row.firstElementChild) + gap;
          if (!unit) continue;

          // Enough copies to cover the frame plus the one that scrolls off,
          // so the seam is never on screen. Widths shift with the webfont, so
          // this is measured rather than assumed.
          const frame = row.closest("section, footer") ?? row.parentElement!;
          const needed = Math.ceil(width(frame) / unit) + 1;
          while (row.children.length < needed) {
            const copy = row.firstElementChild.cloneNode(true) as HTMLElement;
            copy.setAttribute("aria-hidden", "true");
            copy.removeAttribute("data-node-id");
            row.appendChild(copy);
          }

          const tween = gsap.to(row, {
            x: `-=${unit}`,
            duration: unit / speed,
            ease: "none",
            repeat: -1,
          });

          // Don't burn frames animating a marquee nobody can see.
          ScrollTrigger.create({
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
          });
        }

        // ---- Footer folder tabs ----------------------------------------
        for (const tab of TABS) {
          const hit = scope.querySelector(`[data-tab="${tab}"]`);
          const parts = Array.from(
            scope.querySelectorAll(`[data-tab-part="${tab}"]`),
          );
          if (!hit || !parts.length) continue;

          const lift = (y: number, ease: string) => () =>
            gsap.to(parts, { y, duration: 0.3, ease, overwrite: "auto" });
          const enter = lift(-10, "back.out(2.2)");
          const leave = lift(0, "power2.out");

          hit.addEventListener("pointerenter", enter);
          hit.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            hit.removeEventListener("pointerenter", enter);
            hit.removeEventListener("pointerleave", leave);
          });
        }

        // ---- Project cards ---------------------------------------------
        for (const card of Array.from(scope.querySelectorAll("[data-card]"))) {
          const enter = () =>
            gsap.to(card, {
              y: -14,
              scale: 1.03,
              duration: 0.35,
              ease: "back.out(2)",
              overwrite: "auto",
            });
          const leave = () =>
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
          });
        }

        return () => {
          cleanups.forEach((fn) => fn());
          cleanups.length = 0;
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
