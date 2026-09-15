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
  const [error, setError] = useState<string | null>(null);

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
    if (!teamName.trim()) {
      setError("Please enter a team name before continuing.");
      return;
    }
    setError(null);
    onSaveAndContinue(teamName.trim());
  };

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
            ← Back to Team Up
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto">
        {/* Left Column: 03 SETUP YOUR TEAM */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-5 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[36px] sm:text-[44px] md:text-[52px] text-[#FC2425] leading-none block">
              03
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[32px] sm:text-[40px] md:text-[46px] text-[#FC2425] leading-tight uppercase">
              SETUP YOUR TEAM
            </h1>
          </div>

          <div className="max-w-[420px] space-y-2">
            <label className="block font-['Rotonto',sans-serif] text-neutral-300 text-xs sm:text-sm uppercase tracking-wider">
              Name your team
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                if (error && e.target.value.trim()) setError(null);
              }}
              placeholder="e.g. CreamChicken"
              className={`w-full bg-neutral-950 border ${
                error ? "border-red-500 bg-red-500/10" : "border-neutral-800 focus:border-[#FC2425]"
              } rounded-xl px-4 py-2.5 text-white font-['Rotonto',sans-serif] text-base md:text-lg outline-none transition`}
            />
            {error && (
              <p className="text-red-400 text-xs font-mono">{error}</p>
            )}
          </div>

          <div className="font-['Rotonto',sans-serif] text-[16px] sm:text-[18px] md:text-[20px] text-neutral-300 font-light leading-relaxed max-w-[420px] space-y-1 sm:space-y-2">
            <p className="text-white">The hard part&apos;s done.</p>
            <p className="text-neutral-400 text-[14px] sm:text-[16px] md:text-[18px]">Share your team code and let your crew join in.</p>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2">
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
              disabled={isLoading || !teamName.trim()}
              className="flex-1"
            >
              {isLoading ? "SAVING..." : "SAVE AND CONTINUE"}
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Red Dispenser & Printed Thermal Receipt */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative select-none h-full min-h-0 py-2">
          {/* Red Dispenser Hood */}
          <div className="relative w-[280px] sm:w-[320px] md:w-[340px] h-[52px] md:h-[64px] bg-[#FA1A1D] rounded-[14px] shadow-2xl flex items-center justify-center z-20">
            {/* Black Exit Slot */}
            <div className="w-[240px] sm:w-[270px] md:w-[290px] h-[10px] md:h-[12px] bg-black rounded-full" />
          </div>

          {/* Printed Thermal Receipt coming out of slot */}
          <div className="relative w-[240px] sm:w-[270px] md:w-[290px] max-h-[calc(100dvh-130px)] bg-[#F1F0F0] text-black shadow-2xl rounded-b-none -mt-3 pt-5 px-5 pb-5 z-10 border-x border-neutral-300">
            {/* Top Logo on ticket */}
            <div className="w-[120px] h-[36px] mx-auto relative mb-2">
              <Image
                src="/figma/logo-red.svg"
                alt="VinHack"
                fill
                className="object-contain"
              />
            </div>

            <div className="border-t border-b border-black/20 py-1.5 text-center my-2">
              <p className="text-[10px] font-mono tracking-widest text-[#676767] uppercase">VinHack 2026</p>
              <h2 className="font-['Rotonto',sans-serif] text-[17px] md:text-[20px] tracking-wider uppercase font-bold text-black">
                TEAM DOSSIER
              </h2>
            </div>

            {/* Receipt Metadata */}
            <div className="flex justify-between items-center text-[11px] md:text-[12px] font-mono border-b border-black/20 pb-1.5 text-neutral-800">
              <span>Date :</span>
              <span className="font-semibold">18th Sept</span>
            </div>

            <div className="text-center pt-2 pb-0.5">
              <p className="text-[10px] md:text-[11px] font-mono uppercase text-neutral-600 tracking-wider">
                Your shareable team code
              </p>
              <div className="font-['Rotonto',sans-serif] text-[28px] md:text-[34px] font-bold text-black tracking-widest my-0.5 select-all">
                {teamCode}
              </div>
            </div>

            {/* Dynamic QR Code */}
            <div className="my-2 flex justify-center">
              <div className="p-1.5 bg-white rounded-lg border border-neutral-300 shadow-inner">
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt="Team QR Code"
                    className="w-[80px] h-[80px] md:w-[90px] md:h-[90px] object-contain"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] md:w-[90px] md:h-[90px] relative">
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
            <div className="border-t border-black/20 pt-1.5 flex justify-between text-[7px] md:text-[8px] font-mono text-neutral-500">
              <span>vinhack.vinnovateit.com</span>
              <span>vinnovateit@gmail.com</span>
            </div>

            {/* Serrated tear-off bottom edge */}
            <div className="absolute -bottom-[14px] left-0 w-full h-[15px] overflow-hidden pointer-events-none">
              <Image
                src="/onboarding/imgGroup48095504_946d3f55.svg"
                alt=""
                width={290}
                height={15}
                className="w-full h-full object-cover rotate-180"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
