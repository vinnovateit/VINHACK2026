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
  initialChoice = "create",
}: TeamTypeSelectorProps) {
  const [selected, setSelected] = useState<TeamChoice>(initialChoice);

  return (
    <div className="relative w-full max-w-[1280px] mx-auto min-h-[832px] bg-black text-white px-6 md:px-12 py-8 flex flex-col justify-between overflow-hidden">
      {/* Top Bar: Brand Logo & Back link */}
      <div className="flex items-center justify-between z-10">
        <div className="w-[180px] md:w-[211px] h-[60px] md:h-[74px] relative">
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
            className="text-neutral-400 hover:text-white font-['Rotonto',sans-serif] text-sm flex items-center gap-2 border border-neutral-800 rounded-full px-4 py-1.5 transition"
          >
            ← Back to Check-In
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
        {/* Left Column: 02 TEAM UP */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[48px] md:text-[64px] text-[#FC2425] leading-none block">
              02
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[48px] md:text-[64px] text-[#FC2425] leading-tight uppercase">
              TEAM UP
            </h1>
          </div>

          <div className="font-['Rotonto',sans-serif] text-[20px] md:text-[26px] text-neutral-200 font-light leading-relaxed max-w-[440px] space-y-4">
            <p>Now it&apos;s time to assemble your crew.</p>
            <p className="text-neutral-400 text-[18px] md:text-[22px]">
              Whether you&apos;re leading a team or joining one, this is where your hackathon journey starts to take shape.
            </p>
          </div>

          <div className="pt-4">
            <KeyButton
              color="red"
              type="button"
              onClick={() => onSelect(selected)}
              className="w-full max-w-[380px]"
            >
              SAVE AND CONTINUE
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Circular Stamps */}
        <div className="lg:col-span-6 relative min-h-[460px] md:min-h-[520px] flex items-center justify-center select-none">
          {/* CREATE A TEAM Stamp Badge */}
          <div
            onClick={() => setSelected("create")}
            className={`cursor-pointer transition-all duration-300 absolute top-[20px] md:top-[40px] left-[10px] sm:left-[40px] md:left-[80px] p-2 rounded-full ${
              selected === "create"
                ? "scale-105 drop-shadow-[0_0_25px_rgba(252,36,37,0.55)] ring-2 ring-[#FC2425]/60"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
          >
            <div className="relative w-[210px] h-[210px] md:w-[240px] md:h-[240px] -skew-x-4">
              {/* Concentric rings artwork */}
              <Image
                src="/onboarding/imgEllipse89_28425240.svg"
                alt=""
                fill
                className="object-contain"
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
                className="object-contain p-5"
              />
              <Image
                src="/onboarding/imgEllipse92_326fabac.svg"
                alt=""
                fill
                className="object-contain p-8"
              />

              {/* Stamp Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-1 text-[#3B3B3B] group-hover:text-black transition">
                  👥
                </div>
                <div className={`font-['Rotonto',sans-serif] text-[17px] md:text-[19px] leading-tight uppercase font-medium transition ${
                  selected === "create" ? "text-[#FC2425] font-bold" : "text-[#3B3B3B]"
                }`}>
                  <p>CREATE</p>
                  <p>A TEAM</p>
                </div>
                {selected === "create" && (
                  <span className="text-[11px] font-mono tracking-widest text-[#FC2425] mt-1 uppercase font-semibold">
                    ✓ SELECTED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* JOIN A TEAM Stamp Badge */}
          <div
            onClick={() => setSelected("join")}
            className={`cursor-pointer transition-all duration-300 absolute bottom-[20px] md:bottom-[30px] right-[10px] sm:right-[40px] md:right-[60px] p-2 rounded-full ${
              selected === "join"
                ? "scale-105 drop-shadow-[0_0_25px_rgba(43,36,252,0.65)] ring-2 ring-[#74D4F0]/70"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
          >
            <div className="relative w-[210px] h-[210px] md:w-[240px] md:h-[240px] rotate-6 skew-x-4">
              {/* Concentric rings artwork */}
              <Image
                src="/onboarding/imgEllipse85_85a6140f.svg"
                alt=""
                fill
                className="object-contain"
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
                className="object-contain p-5"
              />
              <Image
                src="/onboarding/imgEllipse88_b6da655d.svg"
                alt=""
                fill
                className="object-contain p-8"
              />

              {/* Stamp Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-3xl mb-1 text-[#3B3B3B]">
                  🔑
                </div>
                <div className={`font-['Rotonto',sans-serif] text-[17px] md:text-[19px] leading-tight uppercase font-medium transition ${
                  selected === "join" ? "text-[#2B24FC] font-bold" : "text-[#3B3B3B]"
                }`}>
                  <p>JOIN</p>
                  <p>A TEAM</p>
                </div>
                {selected === "join" && (
                  <span className="text-[11px] font-mono tracking-widest text-[#2B24FC] mt-1 uppercase font-semibold">
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
