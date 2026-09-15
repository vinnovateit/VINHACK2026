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
  const extractSuffix = (val: string) => {
    if (!val) return "";
    return val.replace(/^VH26[-_]?/i, "").trim().toUpperCase();
  };

  const [suffix, setSuffix] = useState(() => extractSuffix(initialCode));
  const code = suffix.trim() ? `VH26-${suffix.trim().toUpperCase()}` : "";
  const [stage, setStage] = useState<"input" | "validating" | "validated" | "joined">("input");
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressSegments, setProgressSegments] = useState<number>(0);
  const [validatedTeamName, setValidatedTeamName] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.85);

  const paperRef = useRef<HTMLDivElement>(null);
  const smallSlipRef = useRef<HTMLDivElement>(null);
  const validatingSlipRef = useRef<HTMLDivElement>(null);
  const printerInputRef = useRef<HTMLInputElement>(null);

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

  // Format code display like "VH26 - 3515" matching the design screens
  const getFormattedCode = (raw: string) => {
    const clean = raw.trim().toUpperCase();
    if (!clean) return "VH26 - ____";
    if (clean.includes("-")) {
      const parts = clean.split("-");
      return `${parts[0].trim()} - ${parts.slice(1).join("-").trim()}`;
    }
    if (clean.length > 4) {
      return `${clean.slice(0, 4)} - ${clean.slice(4)}`;
    }
    return clean;
  };

  const triggerPrint = () => {
    const paper = paperRef.current;
    if (!paper) return null;

    const ac = audio();
    if (ac && ac.state === "suspended") void ac.resume().catch(() => { });

    const full = paper.offsetHeight || 285;
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
      .timeline({ delay: 0.15 })
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

  const triggerValidatingSlipPrint = () => {
    const slip = validatingSlipRef.current;
    if (!slip) return null;

    const ac = audio();
    if (ac && ac.state === "suspended") void ac.resume().catch(() => { });

    const full = slip.offsetHeight || 100;
    const ink = Array.from(slip.children) as HTMLElement[];

    const feed = (p: number) => {
      const shown = full * p;
      gsap.set(slip, { clipPath: `inset(0 0 ${((full - shown) / full) * 100}% 0)` });
      gsap.set(ink, { y: shown - full });
    };

    const roll = { p: 0 };
    let fed = 0;
    feed(0);
    gsap.set(slip, { rotation: 0, transformOrigin: "50% 0%" });

    return gsap
      .timeline({ delay: 0.05 })
      .to(roll, {
        p: 1.0,
        duration: 0.38,
        ease: "steps(8)",
        onUpdate: () => {
          feed(roll.p);
          const currentStep = Math.round(roll.p * 8);
          if (currentStep > fed) { fed = currentStep; feedTick(); }
        },
      })
      .call(tearRip)
      .to(slip, { rotation: 0.8, duration: 0.08, ease: "power3.in" })
      .to(slip, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
  };

  const triggerSmallSlipPrint = () => {
    const slip = smallSlipRef.current;
    if (!slip) return null;

    const ac = audio();
    if (ac && ac.state === "suspended") void ac.resume().catch(() => { });

    // Read actual height — 300px for the validated ACCESS GRANTED slip
    const full = slip.offsetHeight || 300;
    const ink = Array.from(slip.children) as HTMLElement[];

    const feed = (p: number) => {
      const shown = full * p;
      gsap.set(slip, { clipPath: `inset(0 0 ${((full - shown) / full) * 100}% 0)` });
      gsap.set(ink, { y: shown - full });
    };

    const roll = { p: 0 };
    let fed = 0;
    feed(0);
    gsap.set(slip, { rotation: 0, transformOrigin: "50% 0%" });

    const stepTo = (targetP: number, dur: number, stepCount: number) => ({
      p: targetP,
      duration: dur,
      ease: `steps(${stepCount})`,
      onUpdate: () => {
        feed(roll.p);
        const currentStep = Math.round(roll.p * 20);
        if (currentStep > fed) { fed = currentStep; feedTick(); }
      },
    });

    return gsap
      .timeline({ delay: 0.15 })
      .to(roll, stepTo(0.30, 0.42, 7))
      .to({}, { duration: 0.18 })
      .to(roll, stepTo(0.58, 0.44, 7))
      .to({}, { duration: 0.14 })
      .to(roll, stepTo(0.85, 0.40, 7))
      .to({}, { duration: 0.14 })
      .to(roll, stepTo(1.0, 0.28, 5))
      .call(tearRip)
      .to(slip, { rotation: 1.1, duration: 0.09, ease: "power3.in" })
      .to(slip, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
  };

  // Initial page load mount effect: Roll out the pre-validation request ticket with mechanical audio
  useEffect(() => {
    let tl: gsap.core.Timeline | null = null;
    const timer = setTimeout(() => {
      tl = triggerPrint();
      setTimeout(() => {
        printerInputRef.current?.focus();
      }, 1100);
    }, 200);

    return () => {
      clearTimeout(timer);
      tl?.kill();
    };
  }, []);

  const handleSuffixChange = (val: string) => {
    const cleaned = val
      .replace(/^VH26[-_]?/i, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    setSuffix(cleaned);
    if (stage !== "input") {
      setStage("input");
      setFeedback("");
    }
  };

  // STEP 1 -> STEP 2: Validate code with CRT progress animation
  const handleValidate = async () => {
    if (!suffix.trim()) {
      setFeedback("PLEASE ENTER A TEAM CODE");
      return;
    }
    const targetCode = `VH26-${suffix.trim().toUpperCase()}`;
    setIsLoading(true);
    setStage("validating");
    setProgressSegments(0);

    // Roll out the small disclaimer slip during validation
    setTimeout(() => {
      triggerValidatingSlipPrint();
    }, 40);

    // Animate 18 progress bar blocks over ~1.8s
    const totalSegments = 18;
    const progressPromise = new Promise<void>((resolve) => {
      let current = 0;
      const interval = setInterval(() => {
        current++;
        setProgressSegments(current);
        feedTick();
        if (current >= totalSegments) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

    const validatePromise = onValidateCode(targetCode);

    const [, res] = await Promise.all([progressPromise, validatePromise]);
    setIsLoading(false);

    if (res.success) {
      setValidatedTeamName(res.teamName ?? "");
      setStage("validated");
      // Use rAF to guarantee React has painted the new 300px slip before reading offsetHeight
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          triggerSmallSlipPrint();
        });
      });
    } else {
      setStage("input");
      setFeedback(res.error ?? "INVALID TEAM CODE");
    }
  };

  // STEP 2 -> STEP 3: Join team and roll out full thermal ticket
  const handleJoin = async () => {
    if (!suffix.trim()) {
      setFeedback("PLEASE ENTER A TEAM CODE");
      return;
    }
    const targetCode = `VH26-${suffix.trim().toUpperCase()}`;
    setIsLoading(true);

    const res = await onJoinTeam(targetCode);
    setIsLoading(false);

    if (res.success) {
      setStage("joined");
      // Trigger full thermal ticket printing animation, then auto-redirect to dashboard
      setTimeout(() => {
        triggerPrint();
      }, 100);
      // Let the ticket animation (~2s) play out before redirecting
      setTimeout(() => {
        onContinueToDashboard();
      }, 2800);
    } else {
      setFeedback(res.error ?? "COULD NOT JOIN TEAM");
    }
  };

  return (
    <div className="relative w-full max-w-[1280px] h-full max-h-[100dvh] mx-auto bg-black text-white px-6 md:px-12 py-3 md:py-4 flex flex-col justify-between overflow-hidden">
      {/* Top Bar: Brand Logo & Back link - locked in exact position */}
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
        {/* Left Column: 03 JOIN A TEAM - locked in exact position */}
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
            ) : stage === "validating" ? (
              <KeyButton
                color="blue"
                size="compact"
                onClick={() => { }}
                disabled={true}
                className="w-full max-w-[360px] opacity-80"
              >
                JOIN THE TEAM
              </KeyButton>
            ) : (
              <KeyButton
                color="blue"
                size="compact"
                onClick={handleValidate}
                disabled={isLoading}
                className="w-full max-w-[360px]"
              >
                VALIDATE CODE
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
                <div className="absolute top-[22px] left-0 w-full text-center font-light uppercase tracking-wider text-[12.5px] text-[#83ee91]">
                  {stage === "validating"
                    ? "VALIDATING CODE"
                    : stage === "validated" || stage === "joined"
                      ? "TEAM CODE VALIDATED"
                      : "ENTER TEAM CODE"}
                </div>

                {/* Center Content: Mode-specific UI */}
                {stage === "validating" ? (
                  /* Stage 1: Segmented Progress Bar */
                  <div className="absolute top-[58px] left-[21.9px] w-[278px] h-[41px] flex items-center justify-center">
                    <div className="w-full h-[36px] bg-black/60 border border-[#83ee91]/50 rounded-[6px] px-2 py-1 flex items-center gap-[3px] shadow-inner">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-[22px] flex-1 rounded-[1.5px] transition-all duration-75 ${i < progressSegments
                            ? "bg-[#83ee91] shadow-[0_0_6px_#83ee91]"
                            : "bg-[#83ee91]/15"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : stage === "validated" || stage === "joined" ? (
                  /* Stage 2 & 3: Validated Code Box */
                  <div className="absolute top-[58px] left-[21.9px] w-[278px] h-[41px] rounded-[8px] border border-[#83ee91] flex items-center justify-center bg-black/50 shadow-inner">
                    <span className="font-mono text-[#83ee91] text-[18px] tracking-widest uppercase font-medium">
                      {getFormattedCode(code || "VH26-3515")}
                    </span>
                  </div>
                ) : (
                  /* Initial State: Clean Terminal Readout (User types directly on the printer ticket below) */
                  <div
                    onClick={() => printerInputRef.current?.focus()}
                    className="absolute top-[58px] left-[21.9px] rounded-[8px] border-[0.8px] border-[#83ee91]/70 box-border w-[278px] h-[41px] flex items-center justify-center px-3 bg-black/50 cursor-pointer hover:border-[#83ee91] transition"
                  >
                    <span className="font-mono text-[#83ee91] text-[13px] tracking-widest uppercase font-light select-none">
                      {code.trim() ? `CODE: ${code.trim()}` : "AWAITING ACCESS CODE"}
                    </span>
                  </div>
                )}

                {/* Bottom line: Cursor prompt / status */}
                <div className="absolute bottom-[12px] left-[22px] flex items-center">
                  <span className="text-[#83ee91] font-mono text-[13px] select-none">&gt;_</span>
                  {feedback && (
                    <span className="ml-2 font-mono text-[11px] text-red-400 font-light">
                      {feedback}
                    </span>
                  )}
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
                className={`absolute top-[211px] left-[370px] rounded-full bg-[#ffed25] w-[12px] h-[12px] shadow-[0_0_8px_#ffed25] ${stage === "validating" ? "animate-ping" : ""
                  }`}
              />
              <div className="absolute top-[208px] left-[391px] font-light text-[14px] text-black leading-none">
                NETWORK
              </div>

              {/* READY */}
              <div
                className={`absolute top-[242px] left-[370px] rounded-full w-[12px] h-[12px] transition-colors duration-200 ${stage === "validated" || stage === "joined"
                  ? "bg-[#00d753] shadow-[0_0_8px_#00d753]"
                  : "bg-[#656565]"
                  }`}
              />
              <div className="absolute top-[239px] left-[391px] font-light text-[14px] text-black leading-none">
                READY
              </div>

              {/* Red Dispenser Housing with black slot & emerging ticket */}
              <div
                className="absolute top-[316px] left-[32px] w-[315px] h-[58px] rounded-[11.61px] bg-[#fa1a1d] shadow-md z-20"
                data-node-id="343:2039"
              >
                {/* Black Exit Slot */}
                <div
                  className="-translate-x-1/2 -translate-y-1/2 absolute bg-black h-[12px] left-1/2 top-1/2 w-[251px] rounded-full overflow-hidden"
                  data-node-id="343:2040"
                />

                {/* Ticket Container: Staged based on user flow images */}
                {stage === "joined" ? (
                  /* STAGE 3 ("JOIN TEAM - 4"): Full printed ticket rolled out with mechanical animation */
                  <div
                    ref={paperRef}
                    style={{
                      position: "absolute",
                      left: "47.5px",
                      top: "29px",
                      width: "220px",
                      height: "360px",
                      clipPath: "inset(0 0 100% 0)",
                    }}
                    className="overflow-clip z-10 select-none"
                    data-node-id="343:2041"
                  >
                    {/* Perforated receipt sheet with authentic saw-tooth bottom edge */}
                    <div
                      aria-hidden
                      className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] border-x border-neutral-300/60 shadow-md"
                      data-node-id="343:2061"
                    />

                    {/* Logo */}
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "41px",
                        width: "138px",
                        height: "46px",
                      }}
                    >
                      <Image
                        src="/figma/logo-red.svg"
                        alt="VinHack"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Top dashed divider */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "74px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Title: TEAM JOIN REQUEST */}
                    <div className="absolute top-[84px] left-0 w-full text-center text-[13px] leading-tight font-light uppercase tracking-wider text-black font-['Rotonto',sans-serif]">
                      TEAM JOIN REQUEST
                    </div>

                    {/* VinHack 2026 */}
                    <div className="absolute top-[102px] left-0 w-full text-center leading-tight font-light text-[10px] text-neutral-800 font-['Rotonto',sans-serif]">
                      VinHack 2026
                    </div>

                    {/* Dashed line 1 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "120px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Participant row */}
                    <div className="absolute top-[130px] left-[18px] right-[18px] flex justify-between items-center text-[10.5px] leading-none font-light font-['Rotonto',sans-serif]">
                      <span className="text-neutral-700">Participant</span>
                      <span className="font-semibold text-black truncate max-w-[110px] text-right">
                        {participantName || "John Doe"}
                      </span>
                    </div>

                    {/* Dashed line 2 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "150px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Target Team Code label */}
                    <div className="absolute top-[160px] left-0 w-full text-center text-[9px] leading-none font-light text-neutral-600 uppercase tracking-wider font-['Rotonto',sans-serif]">
                      Target Team Code
                    </div>

                    {/* Target Team Code value */}
                    <div className="absolute top-[174px] left-0 w-full text-center text-[24px] font-bold tracking-wider leading-none select-all font-['Rotonto',sans-serif] text-black">
                      {code.trim() ? (code.toUpperCase().startsWith("VH26") ? code.toUpperCase() : `VH26-${code.toUpperCase()}`) : "VH26-3515"}
                    </div>

                    {/* ACCESS GRANTED rectangular outline badge matching Screen 3 */}
                    <div
                      style={{
                        position: "absolute",
                        top: "214px",
                        left: "42px",
                        width: "136px",
                      }}
                      className="border-[1.5px] border-black rounded-[4px] py-1 text-[11px] font-['Rotonto',sans-serif] font-bold text-black tracking-wider uppercase text-center whitespace-nowrap bg-white/40"
                    >
                      ACCESS GRANTED
                    </div>

                    {/* Dashed line 3 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "282px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* URLs */}
                    <div
                      style={{
                        position: "absolute",
                        top: "294px",
                        left: "14px",
                        width: "192px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "6.5px",
                        fontFamily: "monospace",
                        color: "#4a4a4a",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <span>vinhack.vinnovateit.com</span>
                      <span>vinnovateit@gmail.com</span>
                    </div>
                  </div>
                ) : stage === "validating" ? (
                  /* STAGE 1 ("JOIN TEAM - 2"): Small disclaimer slip rolling out during validation */
                  <div
                    ref={validatingSlipRef}
                    style={{
                      position: "absolute",
                      left: "47.5px",
                      top: "29px",
                      width: "220px",
                      height: "100px",
                      clipPath: "inset(0 0 100% 0)",
                    }}
                    className="overflow-clip z-10 select-none"
                    data-node-id="343:2041"
                  >
                    {/* Perforated receipt sheet */}
                    <div
                      aria-hidden
                      className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] border-x border-neutral-300/60 shadow-md"
                      data-node-id="343:2061"
                    />

                    {/* Disclaimer text */}
                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        left: "14px",
                        width: "192px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "9.5px",
                          lineHeight: "1.35",
                          color: "#676767",
                          margin: 0,
                          textAlign: "center",
                          fontFamily: "'Rotonto', sans-serif",
                          fontWeight: 300,
                        }}
                      >
                        By entering this code, you will request access to an existing team.
                      </p>
                    </div>

                    {/* Dashed line */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "48px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* URLs */}
                    <div
                      style={{
                        position: "absolute",
                        top: "56px",
                        left: "14px",
                        width: "192px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "6.5px",
                        fontFamily: "monospace",
                        color: "#4a4a4a",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <span>vinhack.vinnovateit.com</span>
                      <span>vinnovateit@gmail.com</span>
                    </div>
                  </div>
                ) : stage === "validated" ? (
                  /* STAGE 2 ("JOIN TEAM - 3"): ACCESS GRANTED slip — mirrors the full joined ticket layout */
                  <div
                    ref={smallSlipRef}
                    style={{
                      position: "absolute",
                      left: "47.5px",
                      top: "29px",
                      width: "220px",
                      height: "300px",
                      clipPath: "inset(0 0 100% 0)",
                    }}
                    className="overflow-clip z-10 select-none"
                    data-node-id="343:2041"
                  >
                    {/* Perforated receipt sheet */}
                    <div
                      aria-hidden
                      className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] border-x border-neutral-300/60 shadow-md"
                    />

                    {/* Logo */}
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "41px",
                        width: "138px",
                        height: "46px",
                      }}
                    >
                      <Image
                        src="/figma/logo-red.svg"
                        alt="VinHack"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Top dashed divider */}
                    <div
                      className="receipt-rule"
                      style={{ position: "absolute", top: "74px", left: "18px", width: "184px", height: "1px" }}
                    />

                    {/* Title: TEAM JOIN REQUEST */}
                    <div className="absolute top-[84px] left-0 w-full text-center text-[13px] leading-tight font-light uppercase tracking-wider text-black font-['Rotonto',sans-serif]">
                      TEAM JOIN REQUEST
                    </div>

                    {/* VinHack 2026 */}
                    <div className="absolute top-[102px] left-0 w-full text-center leading-tight font-light text-[10px] text-neutral-800 font-['Rotonto',sans-serif]">
                      VinHack 2026
                    </div>

                    {/* Dashed line 1 */}
                    <div
                      className="receipt-rule"
                      style={{ position: "absolute", top: "120px", left: "18px", width: "184px", height: "1px" }}
                    />

                    {/* Participant row */}
                    <div className="absolute top-[130px] left-[18px] right-[18px] flex justify-between items-center text-[10.5px] leading-none font-light font-['Rotonto',sans-serif]">
                      <span className="text-neutral-700">Participant</span>
                      <span className="font-semibold text-black truncate max-w-[110px] text-right">
                        {participantName || "John Doe"}
                      </span>
                    </div>

                    {/* Dashed line 2 */}
                    <div
                      className="receipt-rule"
                      style={{ position: "absolute", top: "150px", left: "18px", width: "184px", height: "1px" }}
                    />

                    {/* Enter Team Code label */}
                    <div className="absolute top-[160px] left-0 w-full text-center text-[9px] leading-none font-light text-neutral-600 uppercase tracking-wider font-['Rotonto',sans-serif]">
                      Enter Team Code
                    </div>

                    {/* Team code value */}
                    <div className="absolute top-[174px] left-0 w-full text-center text-[24px] font-bold tracking-wider leading-none font-['Rotonto',sans-serif] text-black">
                      {code.trim() ? (code.toUpperCase().startsWith("VH26") ? code.toUpperCase() : `VH26-${code.toUpperCase()}`) : "VH26-3515"}
                    </div>

                    {/* ACCESS GRANTED badge */}
                    <div
                      style={{ position: "absolute", top: "214px", left: "42px", width: "136px" }}
                      className="border-[1.5px] border-black rounded-[4px] py-1 text-[11px] font-['Rotonto',sans-serif] font-bold text-black tracking-wider uppercase text-center whitespace-nowrap bg-white/40"
                    >
                      ACCESS GRANTED
                    </div>

                    {/* Dashed line 3 */}
                    <div
                      className="receipt-rule"
                      style={{ position: "absolute", top: "244px", left: "18px", width: "184px", height: "1px" }}
                    />

                    {/* URLs */}
                    <div
                      style={{
                        position: "absolute",
                        top: "254px",
                        left: "14px",
                        width: "192px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "6.5px",
                        fontFamily: "monospace",
                        color: "#4a4a4a",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <span>vinhack.vinnovateit.com</span>
                      <span>vinnovateit@gmail.com</span>
                    </div>
                  </div>
                ) : (
                  /* INITIAL STAGE (JOIN TEAM - 1): Pre-validation request ticket matching user screenshot */
                  <div
                    ref={paperRef}
                    style={{
                      position: "absolute",
                      left: "47.5px",
                      top: "29px",
                      width: "220px",
                      height: "290px",
                      clipPath: "inset(0 0 100% 0)",
                    }}
                    className="overflow-clip z-10 select-none"
                    data-node-id="343:2041"
                  >
                    {/* Perforated receipt sheet with authentic saw-tooth bottom edge */}
                    <div
                      aria-hidden
                      className="receipt-paper-sheet pointer-events-none absolute inset-0 bg-[#f1f0f0] border-x border-neutral-300/60 shadow-md"
                      data-node-id="343:2061"
                    />

                    {/* Logo */}
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "41px",
                        width: "138px",
                        height: "46px",
                      }}
                    >
                      <Image
                        src="/figma/logo-red.svg"
                        alt="VinHack"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Top dashed divider */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "74px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Title: TEAM JOIN REQUEST */}
                    <div className="absolute top-[84px] left-0 w-full text-center text-[13px] leading-tight font-light uppercase tracking-wider text-black font-['Rotonto',sans-serif]">
                      TEAM JOIN REQUEST
                    </div>

                    {/* VinHack 2026 */}
                    <div className="absolute top-[102px] left-0 w-full text-center leading-tight font-light text-[10px] text-neutral-800 font-['Rotonto',sans-serif]">
                      VinHack 2026
                    </div>

                    {/* Dashed line 1 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "120px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Participant row */}
                    <div className="absolute top-[130px] left-[18px] right-[18px] flex justify-between items-center text-[10.5px] leading-none font-light font-['Rotonto',sans-serif]">
                      <span className="text-neutral-700">Participant</span>
                      <span className="font-semibold text-black truncate max-w-[110px] text-right">
                        {participantName || "John Doe"}
                      </span>
                    </div>

                    {/* Dashed line 2 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "150px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Enter Team Code label */}
                    <div className="absolute top-[156px] left-0 w-full text-center text-[9px] leading-none font-light text-neutral-600 uppercase tracking-wider font-['Rotonto',sans-serif]">
                      Enter Team Code
                    </div>

                    {/* Enter Team Code interactive input directly on the printer ticket with fixed VH26- */}
                    <div className="absolute top-[168px] left-0 w-full flex items-center justify-center z-20 pointer-events-auto">
                      <div
                        onClick={() => printerInputRef.current?.focus()}
                        className="inline-flex items-center justify-center font-['Rotonto',sans-serif] font-bold text-[21px] text-black tracking-wider border-b border-dashed border-black/30 focus-within:border-black py-0.5 cursor-text"
                        style={{ maxWidth: "196px" }}
                      >
                        <span className="select-none text-black leading-none flex-shrink-0">VH26-</span>
                        <input
                          ref={printerInputRef}
                          type="text"
                          value={suffix}
                          onChange={(e) => handleSuffixChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleValidate();
                          }}
                          placeholder="____"
                          maxLength={6}
                          autoFocus
                          autoComplete="off"
                          spellCheck={false}
                          style={{ width: "90px" }}
                          className="bg-transparent text-left font-['Rotonto',sans-serif] font-bold text-[21px] text-black tracking-wider outline-none placeholder:text-neutral-400 uppercase cursor-text leading-none p-0 m-0"
                        />
                      </div>
                    </div>

                    {/* Dashed line 3 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "204px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* Disclaimer - Perfectly Centered */}
                    <div
                      style={{
                        position: "absolute",
                        top: "214px",
                        left: "14px",
                        width: "192px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "9.5px",
                          lineHeight: "1.35",
                          color: "#676767",
                          margin: 0,
                          textAlign: "center",
                          fontFamily: "'Rotonto', sans-serif",
                          fontWeight: 300,
                        }}
                      >
                        By entering this code, you will request access to an existing team.
                      </p>
                    </div>

                    {/* Dashed line 4 */}
                    <div
                      className="receipt-rule"
                      style={{
                        position: "absolute",
                        top: "248px",
                        left: "18px",
                        width: "184px",
                        height: "1px",
                      }}
                    />

                    {/* URLs */}
                    <div
                      style={{
                        position: "absolute",
                        top: "256px",
                        left: "14px",
                        width: "192px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "6.5px",
                        fontFamily: "monospace",
                        color: "#4a4a4a",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <span>vinhack.vinnovateit.com</span>
                      <span>vinnovateit@gmail.com</span>
                    </div>
                  </div>
                )}

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
