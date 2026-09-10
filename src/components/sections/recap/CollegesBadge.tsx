"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface CollegesBadgeProps {
  inView?: boolean;
}

export default function CollegesBadge({ inView = true }: CollegesBadgeProps) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setDrawn(true), 150);
    return () => {
      clearTimeout(timer);
      setDrawn(false);
    };
  }, [inView]);

  return (
    <div className="relative w-full h-full select-none">
      {/* 1. Complete authentic handwritten text "15+ COLLEGES" + heart doodle */}
      <div
        className="w-full h-full transition-all duration-700"
        style={{
          opacity: drawn ? 1 : 0,
          transform: drawn ? "scale(1)" : "scale(0.85)",
          transformOrigin: "center center",
        }}
      >
        <Image
          className="w-full h-full object-contain"
          src="/recap/colleges_text.svg"
          width={222}
          height={160}
          alt="15+ Colleges"
          unoptimized
        />
      </div>

      {/* 2. Animated Circle Draw SVG overlay directly on top */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 222 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 pointer-events-none overflow-visible"
      >
        {/* Loop 1: Draws itself around 15+ COLLEGES */}
        <path
          d="M98.1639 31.5823C122.382 28.1914 145.057 30.6443 162.134 37.3272C179.227 44.0166 190.61 54.894 192.486 68.2977C194.363 81.7014 186.406 95.2875 171.807 106.414C157.222 117.53 136.093 126.116 111.875 129.507C87.6563 132.898 64.9813 130.445 47.9044 123.762C30.8113 117.073 19.4297 106.194 17.553 92.7905C15.6764 79.3869 23.6328 65.8017 38.2313 54.6752C52.8162 43.5591 73.9455 34.9732 98.1639 31.5823Z"
          stroke="#FDBBFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{
            strokeDasharray: 580,
            strokeDashoffset: drawn ? 0 : 580,
            transition: "stroke-dashoffset 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />

        {/* Loop 2: Second hand-drawn loop */}
        <path
          d="M88.8198 33.8317C111.924 25.8181 134.645 23.8366 152.693 27.0885C170.757 30.3435 184.029 38.8125 188.464 51.5997C192.899 64.3868 187.722 79.256 175.552 92.9974C163.394 106.726 144.326 119.238 121.222 127.252C98.1175 135.265 75.3964 137.247 57.3491 133.995C39.2846 130.74 26.0129 122.27 21.5778 109.483C17.1428 96.6956 22.3198 81.8275 34.4892 68.0862C46.6471 54.3578 65.7155 41.8452 88.8198 33.8317Z"
          stroke="#FDBBFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{
            strokeDasharray: 580,
            strokeDashoffset: drawn ? 0 : 580,
            transition:
              "stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1) 0.15s",
          }}
        />
      </svg>
    </div>
  );
}
