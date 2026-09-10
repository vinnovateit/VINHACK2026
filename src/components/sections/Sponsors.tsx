"use client";

import Image from "next/image";
import SponsorEdition from "./sponsors/SponsorEdition";
import { useInView } from "@/components/useInView";

export default function SponsorsSection() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="-translate-x-1/2 absolute bg-black h-[840px] left-1/2 top-[4710px] w-[1280px] flex flex-col items-center justify-start pt-3 overflow-visible z-10"
      data-name="SPONSORS"
    >
      {/* Top Header matching reference comp with proportional scale */}
      <div className="flex w-[1006px] max-w-full items-end justify-between px-1 mb-16">
        <div className="font-rotonto font-light text-[32px] leading-[1.12] text-[#fa1a1d] tracking-wide">
          The people backing<br />
          up the chaos
          <Image
            src="/figma/star2.svg"
            alt=""
            width={28}
            height={33}
            className="inline-block ml-2.5 mb-0.5 align-middle"
            unoptimized
          />
        </div>
        <div className="text-right font-rotonto font-normal text-[48px] leading-[0.9] tracking-tight text-[#fa1a1d]">
          OUR<br />SPONSORS
        </div>
      </div>

      {/* Proportional Scaled Newspaper Edition */}
      <div className="w-[1006px] h-[655px] relative flex justify-center shrink-0">
        <div className="w-[1184px] shrink-0 origin-top scale-[0.85]">
          <SponsorEdition />
        </div>
      </div>
    </section>
  );
}
