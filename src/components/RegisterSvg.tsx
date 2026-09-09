"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface RegisterSvgProps {
  className?: string;
}

const BODY_PATH =
  "m 13.946375,170.41958 c 12.724728,-15.75129 32.908961,-43.461 30.112088,-53.77568 -8.152332,-13.59964 7.398218,33.26729 37.191355,9.63825 29.793132,-23.62904 -40.45014,73.99707 -10.451899,90.01219 24.132362,12.88351 161.126341,-83.1497 117.638881,-106.48704 -42.34289,-22.723109 -61.60537,89.12108 -27.47768,96.71252 11.33872,2.5222 103.03105,-8.81749 129.03291,-52.15888 49.18092,-81.977554 -46.00242,-38.48761 -53.3657,5.03691 -13.94472,82.42756 84.31331,-24.70434 82.6145,-47.70842 -1.59832,-21.64334 -67.75211,230.02772 -103.41956,201.21638 -43.59472,-35.2148 43.07656,-72.49771 107.79385,-133.11963 71.13789,-66.63622 50.36441,-73.20473 52.93278,-67.55431 2.56837,5.65043 -39.28268,97.95777 2.77058,76.80045 42.05326,-21.15732 55.73738,-70.50442 58.30584,-74.31388 12.22872,-18.137194 19.76009,-18.229683 21.30112,-17.716009 1.54102,0.513675 -20.85817,22.110909 -20.85817,24.679279 0,2.56838 52.07677,36.49396 30.55384,65.32358 -25.95464,34.76583 -91.21816,15.09111 60.64973,-90.409278 l 26.51283,-83.644495 c 0,0 -56.27658,133.768653 -29.03051,175.744503 4.25627,6.55729 41.72526,-4.6415 68.53284,-29.29995 25.68709,-23.62778 42.49513,-80.149553 12.78291,-65.82969 -40.05352,19.30387 -38.39115,66.75729 -15.5564,83.85119 19.36828,14.49893 53.09875,12.01241 77.09857,-60.12776 18.09192,-54.381849 -17.44594,28.85016 34.9547,-13.83373 20.12601,-16.393999 3.77142,2.77489 -3.78598,27.27196 -7.35869,23.85293 -8.67944,51.17523 11.82115,40.20782 13.02452,-6.96786 23.30681,-11.10444 31.18173,-15.91025 14.81969,-9.04397 21.1137,-15.83705 21.1137,-15.83705";

const T_BAR_PATH =
  "M 494.34013,55.12215 C 526.38736,49.598958 572.67095,43.876192 616.89895,39.875597";

const I_DOT_PATH =
  "m 385.26864,72.714325 1.86536,-5.980808 3.4123,3.048779";

export default function RegisterSvg({ className }: RegisterSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;

      const paths = gsap.utils.toArray<SVGPathElement>("path", svg);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(paths, { visibility: "visible" });
        return;
      }

      // 1. Initial State: Buffer length hides round caps
      paths.forEach((path) => {
        const length = path.getTotalLength();
        const paddedLength = length + 40;

        gsap.set(path, {
          strokeDasharray: `${paddedLength} ${paddedLength}`,
          strokeDashoffset: paddedLength,
          visibility: "hidden",
        });
      });

      // 2. Build Timeline: human handwriting rhythm
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      const [bodyPath, tBarPath, iDotPath] = paths;

      if (bodyPath) {
        // Word body: natural cursive flow
        tl.set(bodyPath, { visibility: "visible" }, 0).to(bodyPath, {
          strokeDashoffset: 0,
          duration: 1.9,
          ease: "power1.inOut",
        });
      }

      if (tBarPath) {
        // Cross 't' along with 'now': draws concurrently
        tl.set(tBarPath, { visibility: "visible" }, 1.95).to(tBarPath, {
          strokeDashoffset: 0,
          duration: 0.35,
          ease: "power2.out",
        });
      }

      if (iDotPath) {
        // Dot 'i' along with 'now': deliberate smooth pen press
        tl.set(iDotPath, { visibility: "visible" }, "+=0.08").to(iDotPath, {
          strokeDashoffset: 0,
          duration: 0.28,
          ease: "power2.out",
        });
      }
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      className={className}
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 774.95002 326.21492"
      fill="none"
      aria-label="register"
      role="img"
    >
      <g transform="translate(-1.946375,-0.97443821)">
        <path
          d={BODY_PATH}
          stroke="#bfea88"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={T_BAR_PATH}
          stroke="#bfea88"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={I_DOT_PATH}
          stroke="#bfea88"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
