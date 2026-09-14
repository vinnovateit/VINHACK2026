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
        <div className="lg:col-span-7 xl:col-span-7 h-full max-h-[calc(100dvh-120px)] flex items-center justify-center relative select-none min-h-0 py-1 overflow-hidden">
          <div className="relative w-[540px] h-[725px] min-w-[540px] max-w-[540px] rounded-[33px] bg-[#d9cfc7] text-black font-['Rotonto',sans-serif] text-[14px] text-left overflow-hidden select-none shadow-2xl origin-center scale-[0.64] sm:scale-[0.72] md:scale-[0.78] lg:scale-[0.80] xl:scale-[0.86] 2xl:scale-[0.92]">
            {/* Screws at the 4 corners */}
            <div className="absolute top-[18px] left-[18px] w-5 h-5 pointer-events-none z-30">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>
            <div className="absolute top-[18px] right-[18px] w-5 h-5 pointer-events-none z-30">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>
            <div className="absolute bottom-[18px] left-[18px] w-5 h-5 pointer-events-none z-30">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>
            <div className="absolute bottom-[18px] right-[18px] w-5 h-5 pointer-events-none z-30">
              <Image src="/onboarding/imgGroup48095662_7a26d23a.svg" alt="" width={20} height={20} />
            </div>

            {/* VINHACK 26 header */}
            <div className="absolute top-[32px] left-0 w-full text-center text-[32px] font-light leading-none">
              VINHACK 26
            </div>

            {/* Divider line */}
            <div className="absolute top-[87px] left-1/2 -translate-x-1/2 border-t-2 border-black box-border w-[460px] h-[2px]" />

            {/* TEAM ACCESS PANEL */}
            <div className="absolute top-[99px] left-0 w-full text-center text-[20px] font-light leading-none">
              TEAM ACCESS PANEL
            </div>

            {/* CRT Monitor (.rectangleParent) */}
            <div className="absolute top-[142px] left-[38px] w-[360px] h-[155px] text-[16.13px] text-[#83ee91]">
              {/* Outer monitor screen */}
              <div className="absolute top-0 left-0 rounded-[20.16px] bg-black border-[5.4px] border-[#d9d9d9] box-border w-[360px] h-[155px]" />

              {/* ENTER TEAM CODE */}
              <div className="absolute top-[25px] left-1/2 -translate-x-1/2 font-light uppercase tracking-wide text-[14px]">
                {stage === "validated"
                  ? "CODE VALIDATED"
                  : stage === "validating"
                  ? "VALIDATING CODE..."
                  : stage === "joined"
                  ? "ACCESS AUTHORIZED"
                  : "ENTER TEAM CODE"}
              </div>

              {/* Input Outline Box (.groupItem) */}
              <div className="absolute top-[58.63px] left-1/2 -translate-x-1/2 rounded-[8.06px] border-[0.7px] border-[#83ee91] box-border w-[310px] h-[41px] flex items-center px-3.5 gap-2 bg-black/40">
                <span className="text-[#83ee91] font-mono text-[14px] shrink-0 animate-pulse">&gt;_</span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="VH26-XXXX"
                  disabled={stage === "joined"}
                  className="w-full bg-transparent font-mono text-[#83ee91] text-[15px] tracking-widest uppercase outline-none placeholder:text-[#83ee91]/40 font-light"
                />
              </div>

              {/* Status prompt / feedback below input */}
              <div className="absolute top-[112px] left-1/2 -translate-x-1/2 font-light flex items-center justify-center w-[300px] h-[23.7px] text-[12px] text-[#93eb9e] font-mono truncate">
                {feedback ? (
                  <span className="truncate">{feedback}</span>
                ) : (
                  <span>AWAITING ACCESS CODE</span>
                )}
              </div>
            </div>

            {/* Status LEDs & Labels */}
            {/* POWER */}
            <div className="absolute top-[180px] left-[425px] rounded-full bg-[#00d753] w-[12px] h-[12px] shadow-[0_0_8px_#00d753]" />
            <div className="absolute top-[177px] left-[446px] font-light text-[14px] text-black leading-none">
              POWER
            </div>

            {/* NETWORK */}
            <div className={`absolute top-[211px] left-[425px] rounded-full bg-[#ffed25] w-[12px] h-[12px] shadow-[0_0_8px_#ffed25] ${isLoading ? "animate-ping" : ""}`} />
            <div className="absolute top-[208px] left-[446px] font-light text-[14px] text-black leading-none">
              NETWORK
            </div>

            {/* READY */}
            <div className={`absolute top-[242px] left-[425px] rounded-full w-[12px] h-[12px] ${
              stage === "validated" || stage === "joined"
                ? "bg-[#00d753] shadow-[0_0_8px_#00d753]"
                : "bg-[#656565]"
            }`} />
            <div className="absolute top-[239px] left-[446px] font-light text-[14px] text-black leading-none">
              READY
            </div>

            {/* Red Dispenser Housing with black slot & slot lip shadow */}
            <div className="absolute top-[316px] left-[38px] w-[360px] h-[72px] rounded-[16px] bg-[#fa1a1d] shadow-md z-10">
              {/* Black Exit Slot */}
              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[14px] left-1/2 top-1/2 w-[310px] rounded-full overflow-hidden" />

              {/* Emerging Ticket Paper Container */}
              <div
                ref={paperRef}
                style={{ clipPath: "inset(0 0 100% 0)" }}
                className="absolute h-[364px] left-1/2 -translate-x-1/2 overflow-clip top-[36px] w-[240px] z-10"
              >
                {/* Perforated receipt sheet with authentic saw-tooth bottom edge */}
                <div
                  aria-hidden
                  className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] shadow-md border-x border-neutral-300/60"
                />

                {/* Logo */}
                <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[140px] h-[48px]">
                  <Image
                    src="/figma/logo-red.svg"
                    alt="VinHack"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Solid divider line */}
                <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[76px] w-[190px]" />

                {/* Title: TEAM JOIN REQUEST */}
                <div className="absolute top-[88px] left-1/2 -translate-x-1/2 text-[14px] leading-tight font-light inline-block w-[180px] text-center uppercase tracking-wide text-black">
                  TEAM JOIN REQUEST
                </div>

                {/* VinHack 2026 */}
                <div className="absolute top-[106px] left-1/2 -translate-x-1/2 leading-tight font-light text-[11px] text-center text-neutral-800">
                  VinHack 2026
                </div>

                {/* Dashed line 1 */}
                <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[128px] w-[190px]" />

                {/* Participant row */}
                <div className="absolute top-[138px] left-[20px] right-[20px] flex justify-between items-center text-[11px] leading-none font-light">
                  <span className="text-neutral-700">Participant</span>
                  <span className="font-semibold text-black truncate max-w-[120px] text-right">
                    {participantName || "John Doe"}
                  </span>
                </div>

                {/* Dashed line 2 */}
                <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[162px] w-[190px]" />

                {/* Enter Team Code label */}
                <div className="absolute top-[174px] left-1/2 -translate-x-1/2 text-[10.5px] leading-none font-light text-center text-neutral-600 uppercase tracking-wider">
                  Target Team Code
                </div>

                {/* Target Team Code value */}
                <div className="absolute top-[190px] left-0 w-full text-center text-[28px] font-light tracking-wider leading-none select-all font-['Rotonto',sans-serif] text-black">
                  {code || "VH26-_ _ _ _"}
                </div>

                {/* Note / Disclaimer */}
                <div className="absolute top-[236px] left-1/2 -translate-x-1/2 text-[10.5px] font-light text-[#676767] text-center inline-block w-[195px] leading-snug">
                  By entering this code, you will request access to an existing team.
                </div>

                {/* Dashed line 3 */}
                <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[292px] w-[190px]" />

                {/* URLs */}
                <div className="absolute top-[304px] left-[18px] right-[18px] flex justify-between text-[7px] font-mono leading-none font-light text-neutral-500">
                  <span>vinhack.vinnovateit.com</span>
                  <span>vinnovateit@gmail.com</span>
                </div>

                {/* ACCESS GRANTED Sticker (when joined) */}
                {stage === "joined" && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <div className="relative w-[170px] h-[70px] -rotate-6 scale-105 drop-shadow-xl animate-in fade-in zoom-in-75 duration-200">
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

              {/* Slot Exit Shadow Lip (identical to ReceiptPrinter.tsx) */}
              <div
                aria-hidden
                className="-translate-x-1/2 pointer-events-none absolute left-1/2 top-[34px] h-[5px] w-[306px] rounded-full bg-[#161616] shadow-[0_3px_5px_rgba(0,0,0,0.55)] z-20"
              />
            </div>

            {/* Vertical rotated text on left (.propertyOfVinnovateit) */}
            <div className="absolute top-[645px] left-[19px] font-light text-[13px] text-[#676767] -rotate-90 origin-top-left whitespace-nowrap tracking-wider">
              PROPERTY OF VINNOVATEIT // 26
            </div>

            {/* VinHack QR on right */}
            <div className="absolute top-[425px] left-[422px] w-[69px] h-[139px] pointer-events-none">
              <Image
                src="/onboarding/onboarding_vinhackqr.svg"
                alt="VinHack QR"
                width={69}
                height={139}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Separator line on right (.frameChild8) */}
            <div className="absolute top-[584.5px] left-[405px] border-t border-[#676767] box-border w-[100px] h-[1px]" />

            {/* Slogan on right (.samePeopleBigger) */}
            <div className="absolute top-[598px] left-[405px] font-light text-[13px] text-[#676767] leading-tight">
              SAME PEOPLE<br />BIGGER IDEAS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
