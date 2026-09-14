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
              onClick={() => onSelect(selected)}
              className="w-full max-w-[360px]"
            >
              SAVE AND CONTINUE
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Circular Stamps */}
        <div className="lg:col-span-7 xl:col-span-7 relative h-full min-h-[360px] md:min-h-[440px] max-h-[calc(100dvh-120px)] flex items-center justify-center select-none py-2">
          {/* CREATE A TEAM Stamp Badge */}
          <div
            onClick={() => setSelected("create")}
            className={`cursor-pointer transition-all duration-300 absolute top-[10px] sm:top-[20px] md:top-[30px] left-[10px] sm:left-[30px] md:left-[60px] p-2 rounded-full ${
              selected === "create"
                ? "scale-105 drop-shadow-[0_0_30px_rgba(212,194,36,0.65)]"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
          >
            <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] -skew-x-4">
              {/* Concentric rings artwork */}
              <Image
                src={selected === "create" ? "/create_team_yellow.svg" : "/create_team.svg"}
                alt="Create a Team"
                fill
                className="object-contain"
                priority
              />
              <Image
                src="/onboarding/imgEllipse90_939cdeac.svg"
                alt=""
                fill
                className="object-contain p-2"
              />
              <Image
                src="/onboarding/imgEllipse91_0f52bdea.svg"
                alt=""
                fill
                className="object-contain p-4"
              />
              <Image
                src="/onboarding/imgEllipse92_326fabac.svg"
                alt=""
                fill
                className="object-contain p-7"
              />

              {/* Stamp Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1 text-[#3B3B3B] group-hover:text-black transition">
                  👥
                </div>
                <div className={`font-['Rotonto',sans-serif] text-[15px] sm:text-[17px] md:text-[18px] leading-tight uppercase font-medium transition ${
                  selected === "create" ? "text-[#FC2425] font-bold" : "text-[#3B3B3B]"
                }`}>
                  <p>CREATE</p>
                  <p>A TEAM</p>
                </div>
                {selected === "create" && (
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#FC2425] mt-1 uppercase font-semibold">
                    ✓ SELECTED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* JOIN A TEAM Stamp Badge */}
          <div
            onClick={() => setSelected("join")}
            className={`cursor-pointer transition-all duration-300 absolute bottom-[10px] sm:bottom-[20px] md:bottom-[30px] right-[10px] sm:right-[30px] md:right-[50px] p-2 rounded-full ${
              selected === "join"
                ? "scale-105 drop-shadow-[0_0_30px_rgba(212,194,36,0.65)]"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
          >
            <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] rotate-6 skew-x-4">
              {/* Concentric rings artwork */}
              <Image
                src={selected === "join" ? "/join_team_yellow.svg" : "/join_team.svg"}
                alt="Join a Team"
                fill
                className="object-contain"
                priority
              />
              <Image
                src="/onboarding/imgEllipse86_ace52028.svg"
                alt=""
                fill
                className="object-contain p-2"
              />
              <Image
                src="/onboarding/imgEllipse87_b43db7a6.svg"
                alt=""
                fill
                className="object-contain p-4"
              />
              <Image
                src="/onboarding/imgEllipse88_b6da655d.svg"
                alt=""
                fill
                className="object-contain p-7"
              />

              {/* Stamp Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1 text-[#3B3B3B]">
                  🔑
                </div>
                <div className={`font-['Rotonto',sans-serif] text-[15px] sm:text-[17px] md:text-[18px] leading-tight uppercase font-medium transition ${
                  selected === "join" ? "text-[#2B24FC] font-bold" : "text-[#3B3B3B]"
                }`}>
                  <p>JOIN</p>
                  <p>A TEAM</p>
                </div>
                {selected === "join" && (
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#2B24FC] mt-1 uppercase font-semibold">
                    ✓ SELECTED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
