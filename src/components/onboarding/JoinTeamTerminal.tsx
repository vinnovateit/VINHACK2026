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

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.85);

  const paperRef = useRef<HTMLDivElement>(null);
  const printedRef = useRef(false);

  // Dynamically scale the 470px x 725px terminal to fit available container bounds
  // ensuring the entire view fits in 100dvh with strictly zero scrolling.
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (!clientWidth || !clientHeight) return;

      const scaleX = (clientWidth - 8) / 470;
      const scaleY = (clientHeight - 8) / 725;
      const nextScale = Math.min(1.22, Math.max(0.48, Math.min(scaleX, scaleY)));
      setScale(nextScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateScale);
      ro.disconnect();
    };
  }, []);

  const triggerPrint = () => {
    const paper = paperRef.current;
    if (!paper) return null;

    const ac = audio();
    if (ac && ac.state === "suspended") void ac.resume();

    const full = paper.offsetHeight || 360;
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
        const currentStep = Math.round(roll.p * 26);
        if (currentStep > fed) {
          fed = currentStep;
          feedTick();
        }
      },
    });

    const tl = gsap
      .timeline({ delay: 0.1 })
      // Chunk 1: Header / logo emerges
      .to(roll, stepTo(0.28, 0.38, 7))
      .to({}, { duration: 0.16 })
      // Chunk 2: TEAM JOIN REQUEST & participant
      .to(roll, stepTo(0.55, 0.4, 7))
      .to({}, { duration: 0.14 })
      // Chunk 3: Target team code display
      .to(roll, stepTo(0.82, 0.38, 7))
      .to({}, { duration: 0.14 })
      // Chunk 4: Footer lines & feed out to tear line
      .to(roll, stepTo(1.0, 0.28, 5))
      // The tear: rip sound + elastic swing and settle
      .call(tearRip)
      .to(paper, { rotation: 1.1, duration: 0.09, ease: "power3.in" })
      .to(paper, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });

    return tl;
  };

  useEffect(() => {
    let tl: gsap.core.Timeline | null = null;
    // Debounce mount to handle React Strict Mode in development so animation always plays
    const timer = setTimeout(() => {
      tl = triggerPrint();
    }, 120);

    return () => {
      clearTimeout(timer);
      tl?.kill();
    };
  }, []);

  const handleInputChange = (val: string) => {
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
      <div className="flex-shrink-0 flex items-center justify-between z-20 h-10 md:h-12 pointer-events-none">
        <div className="w-[140px] md:w-[170px] h-[38px] md:h-[48px] relative pointer-events-auto">
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
            className="text-neutral-400 hover:text-white font-['Rotonto',sans-serif] text-xs md:text-sm flex items-center gap-2 border border-neutral-800 rounded-full px-3 md:px-4 py-1.5 transition hover:border-neutral-700 cursor-pointer pointer-events-auto z-30"
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

        {/* Right Column: Scaled Beige Hardware Terminal ("TEAM ACCESS PANEL") */}
        <div
          ref={containerRef}
          className="lg:col-span-7 xl:col-span-7 w-full h-full lg:h-[calc(100%+3rem)] lg:-mt-12 flex items-center justify-center relative select-none min-h-0 overflow-hidden py-1"
        >
          <div
            style={{
              width: `${470 * scale}px`,
              height: `${725 * scale}px`,
              position: "relative",
            }}
            className="flex-shrink-0 transition-all duration-75"
          >
            {/* Exactly 470px x 725px matching Figma Frame48095662 */}
            <div
              style={{
                width: "470px",
                height: "725px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              className="rounded-[33px] bg-[#d9cfc7] text-black font-['Rotonto',sans-serif] text-[14px] text-left overflow-hidden select-none shadow-2xl"
            >
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

              {/* VINHACK 26 Header */}
              <div className="absolute top-[32px] left-[137px] text-[32px] font-light leading-none">
                VINHACK 26
              </div>

              {/* Black Divider line (.frameChild) */}
              <div className="absolute top-[87px] left-[38px] w-[393px] h-[2px] border-t-2 border-black box-border" />

              {/* TEAM ACCESS PANEL Subtitle */}
              <div className="absolute top-[99px] left-[129px] text-[20px] font-light leading-none">
                TEAM ACCESS PANEL
              </div>

              {/* CRT Monitor (.rectangleParent) */}
              <div className="absolute top-[142px] left-[33px] w-[321.9px] h-[155px] text-[16.13px] text-[#83ee91]">
                {/* Outer monitor screen (.groupChild) */}
                <div className="absolute top-0 left-0 rounded-[20.16px] bg-black border-[5.4px] border-[#d9d9d9] box-border w-[321.9px] h-[155px]" />

                {/* Header inside monitor (.enterTeamCode) */}
                <div className="absolute top-[25px] left-0 w-full text-center font-light uppercase tracking-wide text-[13px]">
                  {stage === "validated"
                    ? "CODE VALIDATED"
                    : stage === "validating"
                    ? "VALIDATING CODE..."
                    : stage === "joined"
                    ? "ACCESS AUTHORIZED"
                    : "ENTER TEAM CODE"}
                </div>

                {/* Input Outline Box (.groupItem) */}
                <div className="absolute top-[58.63px] left-[21.9px] rounded-[8.06px] border-[0.7px] border-[#83ee91] box-border w-[278.1px] h-[41px] flex items-center px-3 gap-2 bg-black/50">
                  <span className="text-[#83ee91] font-mono text-[13px] shrink-0 select-none animate-pulse">&gt;_</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (stage === "validated") handleJoin();
                        else if (stage === "input") handleValidate();
                      }
                    }}
                    placeholder="VH26-XXXX"
                    disabled={stage === "joined"}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-transparent font-mono text-[#83ee91] text-[14px] tracking-widest uppercase outline-none placeholder:text-[#83ee91]/40 font-light cursor-text"
                  />
                </div>

                {/* Status prompt / feedback below input (.div / .awaitingAccessCode) */}
                <div className="absolute top-[112px] left-0 w-full text-center font-light flex items-center justify-center h-[23.7px] text-[11px] text-[#93eb9e] font-mono px-3">
                  <span className="truncate">
                    {feedback || (code.trim() ? "PRESS ENTER TO VALIDATE" : "AWAITING ACCESS CODE")}
                  </span>
                </div>
              </div>

              {/* Status LEDs & Labels */}
              {/* POWER */}
              <div className="absolute top-[180px] left-[370px] rounded-full bg-[#00d753] w-[12px] h-[12px] shadow-[0_0_8px_#00d753]" />
              <div className="absolute top-[177px] left-[391px] font-light text-[14px] text-black leading-none">
                POWER
              </div>

              {/* NETWORK */}
              <div
                className={`absolute top-[211px] left-[370px] rounded-full bg-[#ffed25] w-[12px] h-[12px] shadow-[0_0_8px_#ffed25] ${
                  isLoading ? "animate-ping" : ""
                }`}
              />
              <div className="absolute top-[208px] left-[391px] font-light text-[14px] text-black leading-none">
                NETWORK
              </div>

              {/* READY */}
              <div
                className={`absolute top-[242px] left-[370px] rounded-full w-[12px] h-[12px] transition-colors duration-200 ${
                  stage === "validated" || stage === "joined"
                    ? "bg-[#00d753] shadow-[0_0_8px_#00d753]"
                    : "bg-[#656565]"
                }`}
              />
              <div className="absolute top-[239px] left-[391px] font-light text-[14px] text-black leading-none">
                READY
              </div>

              {/* Red Dispenser Housing with black slot & emerging ticket (Structured identically to homepage ReceiptPrinter.tsx) */}
              <div
                className="absolute top-[316px] left-[32px] w-[315px] h-[58px] rounded-[11.61px] bg-[#fa1a1d] shadow-md z-20"
                data-node-id="343:2039"
              >
                {/* Black Exit Slot */}
                <div
                  className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[12px] left-1/2 top-1/2 w-[251px] rounded-full overflow-hidden"
                  data-node-id="343:2040"
                />

                {/* Emerging Ticket Paper Container */}
                <div
                  ref={paperRef}
                  style={{ clipPath: "inset(0 0 100% 0)" }}
                  className="-translate-x-1/2 absolute h-[360px] left-1/2 overflow-clip top-[29px] w-[220px] z-10 select-none"
                  data-node-id="343:2041"
                >
                  {/* Perforated receipt sheet with authentic saw-tooth bottom edge (matching ReceiptPrinter.tsx) */}
                  <div
                    aria-hidden
                    className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] border-x border-neutral-300/60 shadow-md"
                    data-node-id="343:2061"
                  />

                  {/* Logo */}
                  <div className="absolute top-[22px] left-1/2 -translate-x-1/2 w-[138px] h-[46px]">
                    <Image
                      src="/figma/logo-red.svg"
                      alt="VinHack"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Top dashed divider */}
                  <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[78px] w-[184px]" />

                  {/* Title: TEAM JOIN REQUEST */}
                  <div className="absolute top-[88px] left-0 w-full text-center text-[13.5px] leading-tight font-light uppercase tracking-wider text-black font-['Rotonto',sans-serif]">
                    TEAM JOIN REQUEST
                  </div>

                  {/* VinHack 2026 */}
                  <div className="absolute top-[106px] left-0 w-full text-center leading-tight font-light text-[10.5px] text-neutral-800 font-['Rotonto',sans-serif]">
                    VinHack 2026
                  </div>

                  {/* Dashed line 1 */}
                  <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[126px] w-[184px]" />

                  {/* Participant row */}
                  <div className="absolute top-[136px] left-[18px] right-[18px] flex justify-between items-center text-[10.5px] leading-none font-light font-['Rotonto',sans-serif]">
                    <span className="text-neutral-700">Participant</span>
                    <span className="font-semibold text-black truncate max-w-[110px] text-right">
                      {participantName || "John Doe"}
                    </span>
                  </div>

                  {/* Dashed line 2 */}
                  <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[158px] w-[184px]" />

                  {/* Enter Team Code label */}
                  <div className="absolute top-[168px] left-0 w-full text-center text-[9.5px] leading-none font-light text-neutral-600 uppercase tracking-wider font-['Rotonto',sans-serif]">
                    Target Team Code
                  </div>

                  {/* Target Team Code value */}
                  <div className="absolute top-[184px] left-0 w-full text-center text-[27px] font-light tracking-wider leading-none select-all font-['Rotonto',sans-serif] text-black">
                    {code || "VH26-_ _ _ _"}
                  </div>

                  {/* Note / Disclaimer */}
                  <div className="absolute top-[232px] left-1/2 -translate-x-1/2 text-[10px] font-light text-[#676767] text-center inline-block w-[184px] leading-snug font-['Rotonto',sans-serif]">
                    By entering this code, you will request access to an existing team.
                  </div>

                  {/* Dashed line 3 */}
                  <div className="receipt-rule -translate-x-1/2 absolute h-[1px] left-1/2 top-[282px] w-[184px]" />

                  {/* URLs */}
                  <div className="absolute top-[294px] left-[18px] right-[18px] flex justify-between text-[6.5px] font-mono leading-none font-light text-neutral-500">
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

                {/* Slot Exit Shadow Lip (matching ReceiptPrinter.tsx) */}
                <div
                  aria-hidden
                  className="-translate-x-1/2 pointer-events-none absolute left-1/2 top-[26px] h-[5px] w-[253px] rounded-full bg-[#161616] shadow-[0_3px_5px_rgba(0,0,0,0.55)] z-20"
                />
              </div>


              {/* Vertical Rotated Text on Left (.propertyOfVinnovateit) */}
              <div className="absolute top-[645px] left-[19px] font-light text-[13px] text-[#676767] -rotate-90 origin-top-left whitespace-nowrap tracking-wider">
                PROPERTY OF VINNOVATEIT // 26
              </div>

              {/* VinHack QR on Right (.frameChild9) */}
              <div className="absolute top-[433px] left-[370px] w-[68px] h-[138.5px] pointer-events-none">
                <Image
                  src="/onboarding/onboarding_vinhackqr.svg"
                  alt="VinHack QR"
                  width={68}
                  height={139}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Separator line on Right (.frameChild8) */}
              <div className="absolute top-[584.5px] left-[355.5px] w-[96px] h-[1px] border-t border-[#676767] box-border" />

              {/* Slogan on Right (.samePeopleBigger) */}
              <div className="absolute top-[598px] left-[355px] font-light text-[13px] text-[#676767] leading-tight">
                SAME PEOPLE<br />BIGGER IDEAS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
