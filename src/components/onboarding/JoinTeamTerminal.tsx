"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { feedTick, tearRip } from "@/components/motion/machine";
import { audio } from "@/components/motion/audio";
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

  const paperRef = useRef<HTMLDivElement>(null);
  const printedRef = useRef(false);

  const triggerPrint = () => {
    const paper = paperRef.current;
    if (!paper) return;

    const ac = audio();
    if (ac && ac.state === "suspended") void ac.resume();

    const full = paper.offsetHeight || 364;
    const ink = Array.from(paper.children) as HTMLElement[];

    const feed = (p: number) => {
      const shown = full * p;
      gsap.set(paper, {
        clipPath: `inset(0 0 ${((full - shown) / full) * 100}% 0)`,
      });
      gsap.set(ink, { y: shown - full });
    };

    const roll = { p: 0 };
    let fed = 0;
    feed(0);
    gsap.set(paper, { rotation: 0, transformOrigin: "50% 0%" });

    const stepTo = (targetP: number, dur: number, stepCount: number) => ({
      p: targetP,
      duration: dur,
      ease: `steps(${stepCount})`,
      onUpdate: () => {
        feed(roll.p);
        const currentStep = Math.round(roll.p * 24);
        if (currentStep > fed) {
          fed = currentStep;
          feedTick();
        }
      },
    });

    const tl = gsap
      .timeline({ delay: 0.25 })
      // Chunk 1: Header / logo emerges
      .to(roll, stepTo(0.28, 0.42, 7))
      .to({}, { duration: 0.16 })
      // Chunk 2: TEAM JOIN REQUEST & participant
      .to(roll, stepTo(0.55, 0.42, 7))
      .to({}, { duration: 0.14 })
      // Chunk 3: Target team code display
      .to(roll, stepTo(0.82, 0.4, 7))
      .to({}, { duration: 0.14 })
      // Chunk 4: Footer lines & feed out to tear line
      .to(roll, stepTo(1.0, 0.32, 5))
      // The tear: rip sound + elastic swing and settle
      .call(tearRip)
      .to(paper, { rotation: 1.1, duration: 0.09, ease: "power3.in" })
      .to(paper, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });

    return tl;
  };

  useEffect(() => {
    if (!printedRef.current) {
      printedRef.current = true;
      const tl = triggerPrint();
      return () => {
        tl?.kill();
      };
    }
  }, []);

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
        {/* Left Column: 03 JOIN A TEAM */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-5 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[36px] sm:text-[44px] md:text-[52px] text-[#FC2425] leading-none block">
              03
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[32px] sm:text-[40px] md:text-[46px] text-[#FC2425] leading-tight uppercase">
              JOIN A TEAM
            </h1>
          </div>

          <div className="font-['Rotonto',sans-serif] text-[16px] sm:text-[18px] md:text-[20px] text-neutral-200 font-light leading-relaxed max-w-[420px] space-y-2">
            <p className="text-white">Someone&apos;s expecting you.</p>
            <p className="text-neutral-400 text-[14px] sm:text-[16px] md:text-[18px]">
              Enter the team code shared by your team leader to join your team and continue to the dashboard.
            </p>
          </div>

          {/* Action Button that morphs across stages */}
          <div className="pt-2">
            {stage === "joined" ? (
              <KeyButton
                color="blue"
                size="compact"
                onClick={onContinueToDashboard}
                className="w-full max-w-[360px]"
              >
                CONTINUE TO DASHBOARD
              </KeyButton>
            ) : stage === "validated" ? (
              <KeyButton
                color="blue"
                size="compact"
                onClick={handleJoin}
                disabled={isLoading}
                className="w-full max-w-[360px]"
              >
                {isLoading ? "JOINING..." : "JOIN THE TEAM"}
              </KeyButton>
            ) : (
              <KeyButton
                color="blue"
                size="compact"
                onClick={handleValidate}
                disabled={isLoading || !code.trim()}
                className="w-full max-w-[360px]"
              >
                {isLoading ? "CHECKING..." : "VALIDATE CODE"}
              </KeyButton>
            )}
          </div>
        </div>

        {/* Right Column: Beige Hardware Terminal ("TEAM ACCESS PANEL") */}
        <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center relative select-none h-full min-h-0 py-2">
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] max-h-[calc(100dvh-120px)] bg-[#D9CFC7] text-black rounded-[24px] md:rounded-[28px] p-4 md:p-6 shadow-2xl overflow-hidden border border-neutral-400 flex flex-col justify-between">
            {/* 4 Corner Mounting Screws */}
            <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={16} height={16} />
            </div>
            <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={16} height={16} />
            </div>
            <div className="absolute bottom-3 left-3 w-4 h-4 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={16} height={16} />
            </div>
            <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={16} height={16} />
            </div>

            {/* Panel Top Header & Title */}
            <div className="text-center pt-1 pb-2 border-b-2 border-black/80">
              <h2 className="font-['Rotonto',sans-serif] text-[20px] md:text-[24px] font-bold tracking-widest uppercase">
                VINHACK 26
              </h2>
              <p className="text-[10px] md:text-[12px] font-mono tracking-widest text-neutral-800 uppercase mt-0.5">
                TEAM ACCESS PANEL
              </p>
            </div>

            {/* Middle section: CRT Screen & Status LEDs */}
            <div className="grid grid-cols-12 gap-3 items-center my-2">
              {/* CRT Terminal Screen */}
              <div className="col-span-9 bg-black rounded-xl border-[3px] border-[#D9D9D9] p-3 shadow-inner min-h-[120px] md:min-h-[135px] flex flex-col justify-between">
                <div className="text-[10px] md:text-[11px] font-mono text-[#83EE91] tracking-widest uppercase">
                  {stage === "validated"
                    ? "TEAM CODE VALIDATED"
                    : stage === "validating"
                    ? "VALIDATING CODE..."
                    : stage === "joined"
                    ? "ACCESS AUTHORIZED"
                    : "ENTER TEAM CODE"}
                </div>

                {/* CRT Monospace input line */}
                <div className="my-1.5 border border-[#83EE91]/70 rounded-md px-2.5 py-1 flex items-center gap-2 bg-[#83EE91]/5">
                  <span className="text-[#83EE91] font-mono text-xs md:text-sm animate-pulse">&gt;_</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="VH26-XXXX"
                    disabled={stage === "joined"}
                    className="w-full bg-transparent font-mono text-[#83EE91] text-sm md:text-base tracking-widest uppercase outline-none placeholder:text-[#83EE91]/40"
                  />
                </div>

                <div className="text-[9px] font-mono text-[#93EB9E] truncate uppercase">
                  {feedback || "AWAITING ACCESS CODE"}
                </div>

              {/* Status LEDs on right */}
              <div className="col-span-3 flex flex-col justify-center space-y-2.5 pl-1 text-[9px] md:text-[11px] font-mono font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  <span>POWER</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    isLoading ? "bg-amber-400 animate-ping" : "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                  }`} />
                  <span>NET</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    stage === "validated" || stage === "joined"
                      ? "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                      : "bg-neutral-400"
                  }`} />
                  <span>READY</span>
                </div>

            {/* Red Dispenser Housing */}
            <div className="relative w-full bg-[#FA1A1D] h-[36px] md:h-[42px] rounded-lg flex items-center justify-center my-1.5 shadow-md">
              <div className="w-[82%] h-[8px] bg-black rounded-full" />
            </div>

            {/* Printed Join Request Slip */}
            <div className="relative bg-[#F1F0F0] text-black rounded-b-none p-3 shadow-md border-x border-neutral-300 text-center">
              <p className="text-[8px] md:text-[9px] font-mono tracking-widest text-neutral-600 uppercase">
                VinHack 2026 TEAM JOIN REQUEST
              </p>

              <div className="flex justify-between items-center text-[9px] md:text-[10px] font-mono border-t border-b border-black/15 py-1 my-1.5">
                <span>Participant:</span>
                <span className="font-bold">{participantName || "You"}</span>
              </div>

              <div className="text-[9px] font-mono text-neutral-600 uppercase">
                Target Team Code:
              </div>
              <div className="font-['Rotonto',sans-serif] text-[18px] md:text-[22px] font-bold tracking-widest my-0.5">
                {code || "VH26-____"}
              </div>

              <p className="text-[8px] text-neutral-600 leading-tight pt-0.5">
                By entering this code, you will request access to an existing team.
              </p>

              {/* Serrated tear-off edge */}
              <div className="absolute -bottom-[10px] left-0 w-full h-[12px] overflow-hidden pointer-events-none">
                <Image
                  src="/onboarding/imgGroup48095504_946d3f55.svg"
                  alt=""
                  width={310}
                  height={12}
                  className="w-full h-full object-cover rotate-180"
                />
              </div>

              {/* ACCESS GRANTED Sticker (Stamped diagonally if joined) */}
              {stage === "joined" && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="relative w-[150px] h-[60px] -rotate-6 scale-110 drop-shadow-xl animate-in fade-in zoom-in-75 duration-200">
                    <Image
                      src="/onboarding/imgSticker_3ec30ab1.svg"
                      alt="ACCESS GRANTED"
                      fill
                      className="object-contain"
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-['Rotonto',sans-serif] text-[11px] font-bold text-black tracking-wider uppercase">
                      ACCESS GRANTED
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Bottom Branding & Slogans */}
            <div className="flex items-center justify-between text-[8px] md:text-[9px] font-mono text-[#676767] pt-2.5 border-t border-black/20">
              <span className="uppercase">PROPERTY OF VINNOVATEIT // 26</span>
              <span className="uppercase text-right">SAME PEOPLE // BIGGER IDEAS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
