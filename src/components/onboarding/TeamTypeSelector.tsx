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
    <div className="relative w-full max-w-[1280px] mx-auto bg-black text-white px-6 md:px-12 pt-6 md:pt-8 pb-10 flex flex-col overflow-hidden">
      {/* Top Bar: Brand Logo & Back link */}
      <div className="flex items-center justify-between z-10 shrink-0">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2 md:mt-4 pb-6">
        {/* Left Column: 02 TEAM UP */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5 md:space-y-6 z-10">
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

          <div className="pt-2 md:pt-4">
            <KeyButton
              color="red"
              type="button"
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onSelect(selected);
                }
              }}
              className="w-[340px]"
            >
              SAVE AND CONTINUE
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Circular Stamps */}
        <div className="lg:col-span-6 relative min-h-[480px] md:min-h-[520px] flex items-center justify-center select-none">
          {/* CREATE A TEAM Stamp Badge */}
          <div
            onClick={() => setSelected("create")}
            className={`cursor-pointer transition-all duration-300 absolute top-[10px] md:top-[20px] left-[10px] sm:left-[25px] md:left-[45px] ${
              selected === "create"
                ? "scale-105 drop-shadow-[0_0_30px_rgba(212,194,36,0.65)]"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
          >
            <div className="relative w-[230px] h-[228px] sm:w-[260px] sm:h-[258px]">
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
            className={`cursor-pointer transition-all duration-300 absolute bottom-[10px] md:bottom-[20px] right-[10px] sm:right-[25px] md:right-[45px] ${
              selected === "join"
                ? "scale-105 drop-shadow-[0_0_30px_rgba(212,194,36,0.65)]"
                : "opacity-80 hover:opacity-100 hover:scale-102"
            }`}
          >
            <div className="relative w-[240px] h-[248px] sm:w-[270px] sm:h-[279px]">
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
  );
}
