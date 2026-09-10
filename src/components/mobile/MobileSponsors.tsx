"use client";

import Image from "next/image";
import SponsorEdition from "@/components/sections/sponsors/SponsorEdition";
import Piece from "@/components/mobile/Piece";
import { useInView } from "@/components/useInView";

export default function MobileSponsors() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Sponsors"
      className="relative mx-auto w-full max-w-[560px] px-4 py-12 overflow-hidden"
    >
      <div className="flex items-end justify-between mb-5 px-1">
        <div className="font-rotonto font-light text-[22px] leading-[1.15] text-[#fa1a1d]">
          The people backing<br />
          up the chaos
          <Image
            src="/figma/star2.svg"
            alt=""
            width={20}
            height={24}
            className="inline-block ml-1.5 mb-0.5 align-middle"
            unoptimized
          />
        </div>
        <div className="text-right font-rotonto font-normal text-[36px] leading-[0.9] tracking-tight text-[#fa1a1d]">
          OUR<br />SPONSORS
        </div>
      </div>

      <Piece width={1184} height={758.4} max={1}>
        <SponsorEdition />
      </Piece>
    </section>
  );
}
