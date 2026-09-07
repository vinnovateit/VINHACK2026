"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface NowSvgProps {
  className?: string;
  delay?: number;
}

const NOW_PATH =
  "m 12,91.02395 c 0,0 53.503931,-58.546862 61.638019,-58.058918 10.736168,0.644036 -28.774673,92.429348 -19.880996,87.982518 8.893678,-4.44684 17.558092,-58.695597 62.135497,-83.730348 36.25738,-20.362206 -19.453501,63.750438 5.34831,73.567508 21.35046,8.45095 60.35762,-61.22903 72.96802,-77.841742 15.08375,-19.871054 -50.83071,102.534072 4.36027,74.720472 46.29975,-23.332837 18.80994,-75.207982 18.80994,-75.207982 0,0 -1.5048,0.371074 -9.95379,-2.297029 -8.449,-2.668103 -0.002,8.862327 28.50335,5.201817 28.45977,-3.654608 46.62592,-10.852181 46.62592,-13.520285 0,-2.668103 -19.78189,72.921711 -9.55416,73.811078 10.22772,0.889368 28.7384,-28.818141 47.17233,-60.670827 12.47534,-21.556623 -25.65248,54.780879 4.64065,64.321174 C 330.6937,101.1533 355.23106,87.151574 374.35246,12";

export default function NowSvg({ className, delay = 1.95 }: NowSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;

      const path = svg.querySelector<SVGPathElement>("path");
      if (!path) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(path, { visibility: "visible" });
        return;
      }

      const length = path.getTotalLength();
      const paddedLength = length + 40;

      gsap.set(path, {
        strokeDasharray: `${paddedLength} ${paddedLength}`,
        strokeDashoffset: paddedLength,
        visibility: "hidden",
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: svg,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        })
        .set(path, { visibility: "visible" }, delay)
        .to(path, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "power1.inOut",
        });
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      className={className}
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 386.35243 133.12919"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={NOW_PATH}
        stroke="#bfea88"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
