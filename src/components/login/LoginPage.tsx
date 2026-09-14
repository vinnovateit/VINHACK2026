"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [pressed, setPressed] = useState(false);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/onboarding" });
  };

  return (
    <div className="relative w-full max-w-[1280px] mx-auto h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-20 px-14 pt-4 shrink-0">
        <Link href="/" className="w-[160px] h-[48px] relative block">
          <Image src="/figma/logo-red.svg" alt="VinHack" fill className="object-contain object-left" priority />
        </Link>
        <Link
          href="/"
          className="text-neutral-400 hover:text-white font-['Rotonto',sans-serif] text-sm flex items-center gap-2 border border-neutral-800 rounded-full px-4 py-1.5 transition"
        >
          ← Home
        </Link>
      </div>

      {/* Body: left text + right illustration side-by-side, fills remaining height */}
      <div className="flex-1 flex items-center overflow-hidden">
        {/* Left column */}
        <div className="w-1/2 shrink-0 flex flex-col justify-center gap-6 px-14 z-10">
          <p className="font-['Rotonto',sans-serif] text-neutral-400 text-[24px] tracking-wide">
            Build. Collaborate. Ideate.
          </p>

          <div className="font-['Rotonto',sans-serif] text-[58px] font-normal leading-[1.05] tracking-tight select-none">
            <p className="text-[#FC2425]">GOOD IDEAS</p>
            <p className="text-[#FC2425]">START WITH</p>
            <p><span className="text-[#FC2425]">THE </span><span className="text-white">RIGHT</span></p>
            <p className="text-white">PEOPLE.</p>
          </div>

          {/* Key Button */}
          <div
            className="relative w-[340px] h-[68px] cursor-pointer select-none"
            onClick={handleGoogleSignIn}
            role="button"
            tabIndex={0}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            onKeyDown={(e) => e.key === "Enter" && handleGoogleSignIn()}
          >
            {/* Well */}
            <div className="absolute top-[4px] left-0 w-full h-[60px] rounded-[13px] bg-[#2B24FC] border-[1.3px] border-[#74D4F0] opacity-75 pointer-events-none" />
            {/* Bevel left */}
            <div className="absolute bottom-0 left-[10px] w-[6px] h-[6px] pointer-events-none z-10 flex items-center justify-center">
              <div className="-rotate-45 w-[7px] h-[1.3px] bg-[#74D4F0]" />
            </div>
            {/* Bevel right */}
            <div className="absolute bottom-0 right-[10px] w-[6px] h-[6px] pointer-events-none z-10 flex items-center justify-center">
              <div className="rotate-45 w-[7px] h-[1.3px] bg-[#74D4F0]" />
            </div>
            {/* Cap */}
            <div
              className="absolute top-0 left-[11px] w-[calc(100%-22px)] h-[52px] rounded-[13px] bg-[#2B24FC] border-[1.3px] border-[#74D4F0] opacity-95 pointer-events-none transition-transform duration-75"
              style={{ transform: pressed ? "translateY(4px)" : "translateY(0)" }}
            />
            {/* Content */}
            <div
              className="absolute top-0 left-[11px] w-[calc(100%-22px)] h-[52px] flex items-center px-5 gap-3 transition-transform duration-75"
              style={{ transform: pressed ? "translateY(4px)" : "translateY(0)" }}
            >
              <svg className="w-[20px] h-[20px] shrink-0" viewBox="0 0 24 24">
                <path fill="#74D4F0" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#74D4F0" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#74D4F0" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#74D4F0" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span
                className="font-['Rotonto',sans-serif] text-[20px] font-light text-[#74D4F0] uppercase leading-none tracking-wide"
                style={{ textShadow: "0.4px 0 0 #74d4f0, 0 0.4px 0 #74d4f0, -0.4px 0 0 #74d4f0, 0 -0.4px 0 #74d4f0" }}
              >
                LOGIN WITH GOOGLE
              </span>
            </div>
          </div>
        </div>

        {/* Right column — illustration fills and bleeds */}
        <div className="flex-1 h-full flex items-center justify-center overflow-visible select-none">
          <Image
            src="/auth.svg"
            alt="VinHack login illustration"
            width={900}
            height={900}
            className="w-full h-full object-contain object-center scale-110 translate-y-8"
            priority
          />
        </div>
      </div>
    </div>
  );
}
