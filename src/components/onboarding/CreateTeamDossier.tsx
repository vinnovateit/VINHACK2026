"use client";

import React, { useState } from "react";
import Image from "next/image";
import KeyButton from "./KeyButton";

interface CreateTeamDossierProps {
  initialTeamName?: string;
  teamCode: string;
  qrDataUrl?: string;
  onSaveAndContinue: (teamName: string) => Promise<void> | void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function CreateTeamDossier({
  initialTeamName = "",
  teamCode,
  qrDataUrl,
  onSaveAndContinue,
  onBack,
  isLoading = false,
}: CreateTeamDossierProps) {
  const [teamName, setTeamName] = useState(initialTeamName);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleContinue = () => {
    onSaveAndContinue(teamName.trim());
  };

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
            ← Back to Team Up
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2 md:mt-4 pb-6">
        {/* Left Column: 03 SETUP YOUR TEAM */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5 md:space-y-6 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[48px] md:text-[64px] text-[#FC2425] leading-none block">
              03
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[42px] md:text-[56px] text-[#FC2425] leading-tight uppercase">
              SETUP YOUR TEAM
            </h1>
          </div>

          <div className="max-w-[440px] space-y-3">
            <label className="block font-['Rotonto',sans-serif] text-neutral-300 text-sm uppercase tracking-wider">
              Name your team
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. CreamChicken"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#FC2425] rounded-xl px-4 py-3 text-white font-['Rotonto',sans-serif] text-lg outline-none transition"
            />
          </div>

          <div className="font-['Rotonto',sans-serif] text-[18px] md:text-[22px] text-neutral-300 font-light leading-relaxed max-w-[440px] space-y-2">
            <p className="text-white">The hard part&apos;s done.</p>
            <p className="text-neutral-400">Share your team code and let your crew join in.</p>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <KeyButton
              color="pink"
              size="compact"
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? "COPIED CODE!" : "COPY SHAREABLE CODE"}
            </KeyButton>

            <KeyButton
              color="blue"
              size="compact"
              onClick={handleContinue}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "SAVING..." : "SAVE AND CONTINUE"}
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Red Dispenser & Printed Thermal Receipt */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative select-none pt-4">
          {/* Red Dispenser Hood */}
          <div className="relative w-[320px] md:w-[370px] h-[65px] md:h-[83px] bg-[#FA1A1D] rounded-[16px] shadow-2xl flex items-center justify-center z-20">
            {/* Black Exit Slot */}
            <div className="w-[280px] md:w-[320px] h-[12px] md:h-[16px] bg-black rounded-full" />
          </div>

          {/* Printed Thermal Receipt coming out of slot */}
          <div className="relative w-[270px] md:w-[310px] bg-[#F1F0F0] text-black shadow-2xl rounded-b-none -mt-4 pt-8 px-6 pb-6 z-10 border-x border-neutral-300">
            {/* Top Logo on ticket */}
            <div className="w-[140px] h-[45px] mx-auto relative mb-3">
              <Image
                src="/figma/logo-red.svg"
                alt="VinHack"
                fill
                className="object-contain"
              />
            </div>

            <div className="border-t border-b border-black/20 py-2 text-center my-3">
              <p className="text-[11px] font-mono tracking-widest text-[#676767] uppercase">VinHack 2026</p>
              <h2 className="font-['Rotonto',sans-serif] text-[20px] md:text-[24px] tracking-wider uppercase font-bold text-black">
                TEAM DOSSIER
              </h2>
            </div>

            {/* Receipt Metadata */}
            <div className="flex justify-between items-center text-[12px] md:text-[13px] font-mono border-b border-black/20 pb-2 text-neutral-800">
              <span>Date :</span>
              <span className="font-semibold">18th Sept</span>
            </div>

            <div className="text-center pt-3 pb-1">
              <p className="text-[11px] md:text-[12px] font-mono uppercase text-neutral-600 tracking-wider">
                Your shareable team code
              </p>
              <div className="font-['Rotonto',sans-serif] text-[34px] md:text-[42px] font-bold text-black tracking-widest my-1 select-all">
                {teamCode}
              </div>
            </div>

            {/* Dynamic QR Code */}
            <div className="my-3 flex justify-center">
              <div className="p-2 bg-white rounded-lg border border-neutral-300 shadow-inner">
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt="Team QR Code"
                    className="w-[95px] h-[95px] object-contain"
                  />
                ) : (
                  <div className="w-[95px] h-[95px] relative">
                    <Image
                      src="/onboarding/imgQrCodeGeneratorUxhf8J_f8e80aef.png"
                      alt="QR"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="border-t border-black/20 pt-2 flex justify-between text-[7px] md:text-[8px] font-mono text-neutral-500">
              <span>vinhack.vinnovateit.com</span>
              <span>vinnovateit@gmail.com</span>
            </div>

            {/* Serrated tear-off bottom edge */}
            <div className="absolute -bottom-[16px] left-0 w-full h-[18px] overflow-hidden pointer-events-none">
              <Image
                src="/onboarding/imgGroup48095504_946d3f55.svg"
                alt=""
                width={310}
                height={18}
                className="w-full h-full object-cover rotate-180"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
