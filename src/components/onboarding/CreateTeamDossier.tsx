"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import KeyButton from "@/components/ui/KeyButton";
import ClientQrCode from "./ClientQrCode";
import { validateTeamNameAction } from "@/app/onboarding/actions";

interface CreateTeamDossierProps {
  initialTeamName?: string;
  teamCode: string;
  onSaveAndContinue: (teamName: string) => Promise<{ success: boolean; error?: string } | void> | void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function CreateTeamDossier({
  initialTeamName = "",
  teamCode,
  onSaveAndContinue,
  onBack,
  isLoading = false,
}: CreateTeamDossierProps) {
  const [teamName, setTeamName] = useState(initialTeamName);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time duplicate check state
  const [checking, setChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedRef = useRef<string>("");

  // Debounced validation — fires 500ms after user stops typing
  useEffect(() => {
    const trimmed = teamName.trim();

    // Reset if empty or too short
    if (trimmed.length < 2) {
      setChecking(false);
      setNameAvailable(null);
      setError(trimmed.length > 0 ? "Team name must be at least 2 characters." : null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    // Don't re-check if the trimmed value hasn't changed
    if (trimmed === lastCheckedRef.current) return;

    setChecking(true);
    setNameAvailable(null);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      lastCheckedRef.current = trimmed;
      try {
        const result = await validateTeamNameAction(trimmed);
        if (result.valid) {
          setNameAvailable(true);
          setError(null);
        } else {
          setNameAvailable(false);
          setError(result.error || "This team name is already taken.");
        }
      } catch {
        // Network error — don't block submission
        setNameAvailable(null);
        setError(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [teamName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
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

  // Block submit if name is taken or check is in-flight
  const isSubmitDisabled = isLoading || !teamName.trim() || checking || nameAvailable === false;

  // Input border colour
  const inputBorderClass = error
    ? "border-red-500 bg-red-500/10"
    : nameAvailable === true
    ? "border-green-500 bg-green-500/5"
    : "border-neutral-800 focus:border-[#FC2425]";

  return (
    <div className="relative w-full max-w-[1280px] min-h-[100dvh] lg:h-full lg:max-h-[100dvh] mx-auto bg-black text-white px-4 sm:px-6 md:px-12 py-3 md:py-4 flex flex-col justify-start lg:justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden">
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
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start my-2 lg:my-auto">
        {/* Left Column: 03 SETUP YOUR TEAM */}
        <div className="lg:col-span-6 flex flex-col justify-start space-y-3 sm:space-y-4 md:space-y-5 z-10 pt-1 lg:pt-2">
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
            <div className="relative">
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                }}
                maxLength={50}
                placeholder="e.g. Cyber Knights"
                className={`w-full bg-neutral-950 border ${inputBorderClass} rounded-xl px-4 py-2.5 pr-10 text-white font-['Rotonto',sans-serif] text-base md:text-lg outline-none transition`}
              />
              {/* Status icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {checking && (
                  <svg className="w-4 h-4 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {!checking && nameAvailable === true && (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!checking && nameAvailable === false && (
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            {/* Status text */}
            {checking && (
              <p className="text-neutral-400 text-xs font-mono">Checking availability...</p>
            )}
            {!checking && nameAvailable === true && (
              <p className="text-green-400 text-xs font-mono">✓ Team name is available</p>
            )}
            {!checking && error && (
              <p className="text-red-400 text-xs font-mono">{error}</p>
            )}
          </div>

          <div className="font-['Rotonto',sans-serif] text-[16px] sm:text-[18px] md:text-[20px] text-neutral-300 font-light leading-relaxed max-w-[420px] space-y-1 sm:space-y-2">
            <p className="text-white">The hard part&apos;s done.</p>
            <p className="text-neutral-400 text-[14px] sm:text-[16px] md:text-[18px]">Share your team code and let your crew join in.</p>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <KeyButton
              color="pink"
              size="compact"
              onClick={handleCopy}
              className="w-full sm:flex-1 shrink-0"
            >
              {copied ? "COPIED CODE!" : "COPY SHAREABLE CODE"}
            </KeyButton>

            <KeyButton
              color="blue"
              size="compact"
              onClick={handleContinue}
              disabled={isSubmitDisabled}
              className="w-full sm:flex-1 shrink-0"
            >
              {isLoading ? "SAVING..." : checking ? "CHECKING..." : "SAVE AND CONTINUE"}
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Red Dispenser & Printed Thermal Receipt (matching Homepage Timeline ReceiptPrinter) */}
        <div className="lg:col-span-6 flex items-start justify-center relative select-none w-full min-h-[460px] sm:min-h-[480px] lg:min-h-0 lg:h-[430px] pt-1 lg:pt-2 pb-16 lg:pb-0">
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
              className="absolute -translate-x-1/2 left-1/2 top-[28px] md:top-[30px] w-[240px] sm:w-[260px] md:w-[272px] h-[390px] sm:h-[405px] lg:h-[395px] z-10 select-none overflow-hidden"
              data-node-id="343:2041"
            >
              {/* Authentic saw-tooth perforated receipt paper sheet (matching timeline) */}
              <div
                aria-hidden
                className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] shadow-xl"
                data-node-id="343:2061"
              />

              {/* Receipt Inner Content */}
              <div className="relative h-full flex flex-col justify-between pt-3.5 pb-4 px-3.5 md:pt-4 md:pb-4.5 md:px-4 z-10 text-black">
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

                {/* Client-Side Dynamic QR Code (0ms Server CPU) */}
                <div className="my-0.5 flex justify-center">
                  <div className="p-1 bg-white rounded-lg border border-neutral-300 shadow-inner flex items-center justify-center">
                    <ClientQrCode
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/onboarding?step=join-team&code=${teamCode}`
                          : `https://vinhack.vinnovateit.com/onboarding?step=join-team&code=${teamCode}`
                      }
                      size={76}
                    />
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
