"use client";

import RECAP from "./recap/Recap";
import { useInView } from "@/components/useInView";

export default function RecapSection() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.1, {
    once: false,
  });

  return (
    <section
      ref={sectionRef}
      data-in-view={inView || undefined}
      aria-label="Recap"
      className="absolute bg-black h-[560px] left-0 w-full overflow-hidden top-[1664px] z-10"
      data-name="RECAP"
    >
      <RECAP inView={inView} />
    </section>
  );
}
