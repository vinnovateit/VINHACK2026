"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import KeyButton from "./KeyButton";
import { getRandomTeamName } from "@/content/teamNames";

interface CreateTeamDossierProps {
  initialTeamName?: string;
  teamCode: string;
  qrDataUrl?: string;
  onSaveAndContinue: (teamName: string) => Promise<{ success: boolean; error?: string } | void> | void;
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
  const [isRolling, setIsRolling] = useState(false);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    if (error) setError(null);

    let count = 0;
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    rollIntervalRef.current = setInterval(() => {
      count++;
      if (count >= 5) {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
        setTeamName((prev) => getRandomTeamName(prev));
        setIsRolling(false);
      } else {
        setTeamName(getRandomTeamName());
      }
    }, 55);
  };

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

  const handleContinue = async () => {
    if (!teamName.trim()) {
      setError("Please enter a team name before continuing.");
      return;
    }
    setError(null);
    const res = await onSaveAndContinue(teamName.trim());
    if (res && !res.success && res.error) {
      setError(res.error);
    }
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

            <div className="relative flex items-center">
              <input
                type="text"
                value={teamName}
                placeholder="e.g. Cyber Knights"
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (error && e.target.value.trim()) setError(null);
                }}
                className={`w-full bg-neutral-950 border ${
                  error ? "border-red-500 bg-red-500/10" : "border-neutral-800 focus:border-[#FC2425]"
                } rounded-xl pl-4 pr-12 py-2.5 text-white placeholder:text-neutral-600 font-['Rotonto',sans-serif] text-base md:text-lg outline-none transition`}
              />
              <button
                type="button"
                onClick={handleRollDice}
                disabled={isRolling}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#FC2425] hover:bg-neutral-850 text-neutral-300 hover:text-white transition active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Roll a random funny tech hackathon team name"
                aria-label="Roll random team name"
              >
                <span
                  className={`text-base block transition-transform duration-300 ${
                    isRolling ? "animate-spin" : "hover:rotate-12"
                  }`}
                >
                  🎲
                </span>
              </button>
            </div>
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

        {/* Right Column: Red Dispenser & Printed Thermal Receipt (matching Homepage Timeline ReceiptPrinter) */}
        <div className="lg:col-span-6 flex items-start justify-center relative select-none h-full min-h-0 py-2 pt-2 md:pt-4">
          {/* Red Dispenser Housing (data-node-id="343:2039") */}
          <div
            className="relative bg-[#fa1a1d] rounded-[16px] w-[310px] sm:w-[335px] md:w-[350px] h-[58px] md:h-[64px] shadow-2xl z-20"
            data-node-id="343:2039"
          >
            {/* Black Exit Slot (data-node-id="343:2040") */}
            <div
              className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[12px] md:h-[14px] left-1/2 top-1/2 w-[260px] sm:w-[280px] md:w-[295px] rounded-full"
              data-node-id="343:2040"
            />

            {/* Ticket Container: feeds emerging directly out from inside the black slot */}
            <div
              className="absolute -translate-x-1/2 left-1/2 top-[29px] md:top-[32px] w-[240px] sm:w-[260px] md:w-[272px] h-[410px] sm:h-[430px] md:h-[450px] max-h-[calc(100dvh-150px)] z-10 select-none overflow-hidden"
              data-node-id="343:2041"
            >
              {/* Authentic saw-tooth perforated receipt paper sheet (matching timeline) */}
              <div
                aria-hidden
                className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] shadow-xl"
                data-node-id="343:2061"
              />

              {/* Receipt Inner Content */}
              <div className="relative h-full flex flex-col justify-between pt-4 md:pt-5 pb-6 px-4 z-10 text-black">
                <div>
                  {/* Top Logo */}
                  <div className="w-[110px] md:w-[125px] h-[32px] md:h-[36px] mx-auto relative mb-1.5">
                    <Image
                      src="/figma/logo-red.svg"
                      alt="VinHack"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Header Title with receipt rules */}
                  <div className="receipt-rule w-full h-[1px] my-1" />
                  <div className="py-1 text-center min-h-[34px] md:min-h-[38px] flex flex-col justify-center items-center">
                    <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#676767] uppercase leading-none mb-0.5">
                      VinHack 2026
                    </p>
                    {teamName ? (
                      <h2 className="font-['Rotonto',sans-serif] text-[15px] md:text-[18px] tracking-wider uppercase font-bold text-black leading-tight break-words px-1 max-w-full line-clamp-2">
                        {teamName}
                      </h2>
                    ) : (
                      <div className="h-[20px] md:h-[22px]" />
                    )}
                  </div>
                  <div className="receipt-rule w-full h-[1px] my-1" />

                  {/* Date metadata */}
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-mono text-neutral-800 py-1">
                    <span>Date :</span>
                    <span className="font-semibold">18th Sept</span>
                  </div>
                  <div className="receipt-rule w-full h-[1px] my-1" />

                  {/* Shareable Team Code */}
                  <div className="text-center pt-1.5 pb-0.5">
                    <p className="text-[9px] md:text-[10px] font-mono uppercase text-neutral-600 tracking-wider">
                      Your shareable team code
                    </p>
                    <div className="font-['Rotonto',sans-serif] text-[24px] md:text-[28px] font-bold text-black tracking-widest my-0.5 select-all">
                      {teamCode}
                    </div>
                  </div>
                </div>

                {/* Dynamic QR Code */}
                <div className="my-1 flex justify-center">
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-300 shadow-inner">
                    {qrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={qrDataUrl}
                        alt="Team QR Code"
                        className="w-[78px] h-[78px] md:w-[86px] md:h-[86px] object-contain"
                      />
                    ) : (
                      <div className="w-[78px] h-[78px] md:w-[86px] md:h-[86px] relative">
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

                {/* Footer URL metadata */}
                <div>
                  <div className="receipt-rule w-full h-[1px] mb-1.5" />
                  <div className="flex justify-between text-[6.5px] md:text-[7.5px] font-mono text-neutral-600">
                    <span>vinhack.vinnovateit.com</span>
                    <span>vinnovateit@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot Exit Shadow Lip (matching ReceiptPrinter.tsx) */}
            <div
              aria-hidden
              className="-translate-x-1/2 pointer-events-none absolute left-1/2 top-[27px] md:top-[30px] h-[5px] w-[262px] sm:w-[282px] md:w-[297px] rounded-full bg-[#161616] shadow-[0_3px_5px_rgba(0,0,0,0.55)] z-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
