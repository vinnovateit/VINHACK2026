"use client";

import React, { useState } from "react";
import Image from "next/image";
import KeyButton from "./KeyButton";

export type TeamChoice = "create" | "join";

interface TeamTypeSelectorProps {
  onSelect: (choice: TeamChoice) => void;
  onBack?: () => void;
  initialChoice?: TeamChoice;
}

export default function TeamTypeSelector({
  onSelect,
  onBack,
  initialChoice,
}: TeamTypeSelectorProps) {
  const [selected, setSelected] = useState<TeamChoice | null>(initialChoice ?? null);

  return (
    <div className="relative w-full max-w-[1280px] h-full max-h-[100dvh] mx-auto bg-black text-white px-6 md:px-12 py-3 md:py-4 flex flex-col justify-between overflow-hidden">
      {/* Top Bar: Brand Logo & Back link */}
      <div className="flex-shrink-0 flex items-center justify-between z-10 h-10 md:h-12">
        <div className="w-[140px] md:w-[170px] h-[38px] md:h-[48px] relative">
          <Image
            src="/figma/logo-red.svg"
            alt="VinHack"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-neutral-400 hover:text-white font-['Rotonto',sans-serif] text-xs md:text-sm flex items-center gap-2 border border-neutral-800 rounded-full px-3 md:px-4 py-1.5 transition hover:border-neutral-700"
          >
            ← Back to Check-In
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto">
        {/* Left Column: 02 TEAM UP */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-5 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[36px] sm:text-[44px] md:text-[52px] text-[#FC2425] leading-none block">
              02
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[36px] sm:text-[44px] md:text-[52px] text-[#FC2425] leading-tight uppercase">
              TEAM UP
            </h1>
          </div>

          <div className="font-['Rotonto',sans-serif] text-[16px] sm:text-[18px] md:text-[20px] text-neutral-200 font-light leading-relaxed max-w-[420px] space-y-2">
            <p>Now it&apos;s time to assemble your crew.</p>
            <p className="text-neutral-400 text-[14px] sm:text-[16px] md:text-[18px]">
              Whether you&apos;re leading a team or joining one, this is where your hackathon journey starts to take shape.
            </p>
          </div>

          <div className="pt-2">
            <KeyButton
              color="red"
              size="compact"
              type="button"
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onSelect(selected);
                }
              }}
              className="w-full max-w-[360px]"
            >
              SAVE AND CONTINUE
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Circular Stamps (Tight Centered Cluster) */}
        <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center select-none py-2 h-full min-h-[340px]">
          <div className="relative w-[320px] sm:w-[390px] md:w-[440px] h-[280px] sm:h-[320px] md:h-[340px] flex items-center justify-center">
            {/* CREATE A TEAM Stamp Badge */}
            <div
              onClick={() => setSelected("create")}
              className={`cursor-pointer transition-all duration-300 absolute top-1 sm:top-2 left-1 sm:left-4 md:left-6 ${
                selected === "create"
                  ? "scale-105 drop-shadow-[0_0_30px_rgba(212,194,36,0.65)] z-20"
                  : "opacity-85 hover:opacity-100 hover:scale-102 z-10"
              }`}
            >
              <div className="relative w-[180px] h-[178px] sm:w-[210px] sm:h-[208px] md:w-[230px] md:h-[228px]">
                <Image
                  src={selected === "create" ? "/create_team_yellow.svg" : "/create_team.svg"}
                  alt="Create a Team"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* JOIN A TEAM Stamp Badge */}
            <div
              onClick={() => setSelected("join")}
              className={`cursor-pointer transition-all duration-300 absolute bottom-1 sm:bottom-2 right-1 sm:right-4 md:right-6 ${
                selected === "join"
                  ? "scale-105 drop-shadow-[0_0_30px_rgba(212,194,36,0.65)] z-20"
                  : "opacity-85 hover:opacity-100 hover:scale-102 z-10"
              }`}
            >
              <div className="relative w-[190px] h-[198px] sm:w-[220px] sm:h-[228px] md:w-[240px] md:h-[248px]">
                <Image
                  src={selected === "join" ? "/join_team_yellow.svg" : "/join_team.svg"}
                  alt="Join a Team"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
