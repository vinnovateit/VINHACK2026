"use client";

import React, { useState } from "react";
import Image from "next/image";
import KeyButton from "./KeyButton";

interface JoinTeamTerminalProps {
  participantName: string;
  onValidateCode: (code: string) => Promise<{ success: boolean; teamName?: string; error?: string }>;
  onJoinTeam: (code: string) => Promise<{ success: boolean; error?: string }>;
  onContinueToDashboard: () => void;
  onBack?: () => void;
  initialCode?: string;
}

export default function JoinTeamTerminal({
  participantName,
  onValidateCode,
  onJoinTeam,
  onContinueToDashboard,
  onBack,
  initialCode = "",
}: JoinTeamTerminalProps) {
  const [code, setCode] = useState(initialCode);
  const [stage, setStage] = useState<"input" | "validating" | "validated" | "joined">("input");
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (val: string) => {
    // Format to uppercase, ensure prefix VH26- if applicable
    const formatted = val.toUpperCase();
    setCode(formatted);
    if (stage !== "input") {
      setStage("input");
      setFeedback("");
    }
  };

  const handleValidate = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setStage("validating");
    setFeedback("VALIDATING CODE...");

    const res = await onValidateCode(code.trim());
    setIsLoading(false);

    if (res.success) {
      setStage("validated");
      setFeedback(`TEAM FOUND: ${res.teamName ?? "VALID TEAM"}`);
    } else {
      setStage("input");
      setFeedback(res.error ?? "INVALID TEAM CODE");
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setIsLoading(true);

    const res = await onJoinTeam(code.trim());
    setIsLoading(false);

    if (res.success) {
      setStage("joined");
      setFeedback("ACCESS GRANTED - WELCOME TO THE TEAM");
    } else {
      setFeedback(res.error ?? "COULD NOT JOIN TEAM");
    }
  };

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
            ← Back to Team Up
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
        {/* Left Column: 03 JOIN A TEAM */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[48px] md:text-[64px] text-[#FC2425] leading-none block">
              03
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[42px] md:text-[56px] text-[#FC2425] leading-tight uppercase">
              JOIN A TEAM
            </h1>
          </div>

          <div className="font-['Rotonto',sans-serif] text-[18px] md:text-[22px] text-neutral-200 font-light leading-relaxed max-w-[440px] space-y-3">
            <p className="text-white">Someone&apos;s expecting you.</p>
            <p className="text-neutral-400">
              Enter the team code shared by your team leader to join your team and continue to the dashboard.
            </p>
          </div>

          {/* Action Button that morphs across stages */}
          <div className="pt-4">
            {stage === "joined" ? (
              <KeyButton
                color="blue"
                onClick={onContinueToDashboard}
                className="w-full max-w-[380px]"
              >
                CONTINUE TO DASHBOARD
              </KeyButton>
            ) : stage === "validated" ? (
              <KeyButton
                color="blue"
                onClick={handleJoin}
                disabled={isLoading}
                className="w-full max-w-[380px]"
              >
                {isLoading ? "JOINING..." : "JOIN THE TEAM"}
              </KeyButton>
            ) : (
              <KeyButton
                color="blue"
                onClick={handleValidate}
                disabled={isLoading || !code.trim()}
                className="w-full max-w-[380px]"
              >
                {isLoading ? "CHECKING..." : "VALIDATE CODE"}
              </KeyButton>
            )}
          </div>
        </div>

        {/* Right Column: Beige Hardware Terminal ("TEAM ACCESS PANEL") */}
        <div className="lg:col-span-6 flex items-center justify-center relative select-none">
          <div className="relative w-[340px] sm:w-[420px] md:w-[484px] min-h-[660px] md:h-[720px] bg-[#D9CFC7] text-black rounded-[33px] p-6 md:p-8 shadow-2xl overflow-hidden border border-neutral-400 flex flex-col justify-between">
            {/* 4 Corner Mounting Screws */}
            <div className="absolute top-4 left-4 w-5 h-5 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>
            <div className="absolute top-4 right-4 w-5 h-5 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>
            <div className="absolute bottom-4 left-4 w-5 h-5 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>
            <div className="absolute bottom-4 right-4 w-5 h-5 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>

            {/* Panel Top Header & Title */}
            <div className="text-center pt-2 pb-3 border-b-2 border-black/80">
              <h2 className="font-['Rotonto',sans-serif] text-[24px] md:text-[28px] font-bold tracking-widest uppercase">
                VINHACK 26
              </h2>
              <p className="text-[12px] md:text-[14px] font-mono tracking-widest text-neutral-800 uppercase mt-0.5">
                TEAM ACCESS PANEL
              </p>
            </div>

            {/* Middle section: CRT Screen & Status LEDs */}
            <div className="grid grid-cols-12 gap-4 items-center my-3">
              {/* CRT Terminal Screen */}
              <div className="col-span-9 bg-black rounded-2xl border-[4px] border-[#D9D9D9] p-4 shadow-inner min-h-[145px] flex flex-col justify-between">
                <div className="text-[11px] md:text-[13px] font-mono text-[#83EE91] tracking-widest uppercase">
                  {stage === "validated"
                    ? "TEAM CODE VALIDATED"
                    : stage === "validating"
                    ? "VALIDATING CODE..."
                    : stage === "joined"
                    ? "ACCESS AUTHORIZED"
                    : "ENTER TEAM CODE"}
                </div>

                {/* CRT Monospace input line */}
                <div className="my-2 border border-[#83EE91]/70 rounded-lg px-3 py-1.5 flex items-center gap-2 bg-[#83EE91]/5">
                  <span className="text-[#83EE91] font-mono text-sm md:text-base animate-pulse">&gt;_</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="VH26-XXXX"
                    disabled={stage === "joined"}
                    className="w-full bg-transparent font-mono text-[#83EE91] text-base md:text-lg tracking-widest uppercase outline-none placeholder:text-[#83EE91]/40"
                  />
                </div>

                <div className="text-[10px] font-mono text-[#93EB9E] truncate uppercase">
                  {feedback || "AWAITING ACCESS CODE"}
                </div>
              </div>

              {/* Status LEDs on right */}
              <div className="col-span-3 flex flex-col justify-center space-y-3 pl-2 text-[10px] md:text-[12px] font-mono font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  <span>POWER</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isLoading ? "bg-amber-400 animate-ping" : "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                  }`} />
                  <span>NETWORK</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    stage === "validated" || stage === "joined"
                      ? "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                      : "bg-neutral-400"
                  }`} />
                  <span>READY</span>
                </div>
              </div>
            </div>

            {/* Red Dispenser Housing */}
            <div className="relative w-full bg-[#FA1A1D] h-[44px] md:h-[50px] rounded-xl flex items-center justify-center my-2 shadow-md">
              <div className="w-[82%] h-[10px] bg-black rounded-full" />
            </div>

            {/* Printed Join Request Slip */}
            <div className="relative bg-[#F1F0F0] text-black rounded-b-none p-4 shadow-md border-x border-neutral-300 text-center">
              <p className="text-[9px] font-mono tracking-widest text-neutral-600 uppercase">
                VinHack 2026 TEAM JOIN REQUEST
              </p>

              <div className="flex justify-between items-center text-[10px] font-mono border-t border-b border-black/15 py-1.5 my-2">
                <span>Participant:</span>
                <span className="font-bold">{participantName || "You"}</span>
              </div>

              <div className="text-[10px] font-mono text-neutral-600 uppercase">
                Target Team Code:
              </div>
              <div className="font-['Rotonto',sans-serif] text-[20px] md:text-[24px] font-bold tracking-widest my-0.5">
                {code || "VH26-____"}
              </div>

              <p className="text-[9px] text-neutral-600 leading-tight pt-1">
                By entering this code, you will request access to an existing team.
              </p>

              {/* Serrated tear-off edge */}
              <div className="absolute -bottom-[12px] left-0 w-full h-[14px] overflow-hidden pointer-events-none">
                <Image
                  src="/onboarding/imgGroup48095504_946d3f55.svg"
                  alt=""
                  width={310}
                  height={14}
                  className="w-full h-full object-cover rotate-180"
                />
              </div>

              {/* ACCESS GRANTED Sticker (Stamped diagonally if joined) */}
              {stage === "joined" && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="relative w-[180px] h-[75px] -rotate-6 scale-110 drop-shadow-xl animate-in fade-in zoom-in-75 duration-200">
                    <Image
                      src="/onboarding/imgSticker_3ec30ab1.svg"
                      alt="ACCESS GRANTED"
                      fill
                      className="object-contain"
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-['Rotonto',sans-serif] text-[13px] font-bold text-black tracking-wider uppercase">
                      ACCESS GRANTED
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Bottom Branding & Slogans */}
            <div className="flex items-center justify-between text-[9px] md:text-[10px] font-mono text-[#676767] pt-4 border-t border-black/20">
              <span className="uppercase">PROPERTY OF VINNOVATEIT // 26</span>
              <span className="uppercase text-right">SAME PEOPLE // BIGGER IDEAS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
