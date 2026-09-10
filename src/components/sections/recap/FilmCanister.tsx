import type { FC } from "react";
import Image from "next/image";

export const FilmCanister: FC = () => {
  return (
    <div className="absolute top-[148px] left-[32px] w-[144px] h-[315px] z-10 pointer-events-none select-none">
      <div className="relative w-full h-full">
        {/* 35mm Film Canister Vector Artwork from Figma */}
        <Image
          className="absolute inset-0 w-full h-full object-contain"
          src="/recap/film_canister.svg"
          width={231}
          height={504}
          alt="35mm Film Canister"
          unoptimized
          priority
        />

        {/* Canister Vertical Title - Centered directly in green cylinder (44% x, 48.6% y) */}
        <div className="absolute left-[44%] top-[48.6%] -translate-x-1/2 -translate-y-1/2 -rotate-90 flex flex-col items-center gap-[2px] pointer-events-none whitespace-nowrap font-rotonto">
          <span className="text-[17px] font-normal tracking-[0.08em] text-black leading-tight">
            ROLLING
          </span>
          <span className="text-[17px] font-normal tracking-[0.08em] text-black leading-tight">
            BACK TO &apos;25
          </span>
        </div>
      </div>
    </div>
  );
};

export const Group48095632 = FilmCanister;
export default FilmCanister;
