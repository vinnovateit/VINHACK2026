"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import KeyButton from "../onboarding/KeyButton";

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/onboarding" });
  };

  return (
    <div className="relative w-full max-w-[1280px] mx-auto min-h-[832px] bg-black text-white px-6 md:px-12 py-8 flex flex-col justify-between overflow-hidden">
      {/* Top Bar: Brand Logo */}
      <div className="flex items-center justify-between z-20">
        <Link href="/" className="w-[180px] md:w-[211px] h-[60px] md:h-[74px] relative block">
          <Image
            src="/figma/logo-red.svg"
            alt="VinHack"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <Link
          href="/"
          className="text-neutral-400 hover:text-white font-['Rotonto',sans-serif] text-sm flex items-center gap-2 border border-neutral-800 rounded-full px-4 py-1.5 transition"
        >
          ← Home
        </Link>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
        {/* Left Column: Heading & Google Sign-In */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 z-10">
          <p className="font-['Rotonto',sans-serif] text-neutral-400 text-[22px] md:text-[28px] tracking-wide">
            Build. Collaborate. Ideate.
          </p>

          <div className="font-['Rotonto',sans-serif] text-[44px] sm:text-[54px] md:text-[64px] font-normal leading-[1.08] tracking-tight select-none">
            <p className="text-[#FC2425]">GOOD IDEAS</p>
            <p className="text-[#FC2425]">START WITH</p>
            <p>
              <span className="text-[#FC2425]">THE </span>
              <span className="text-white">RIGHT</span>
            </p>
            <p className="text-white">PEOPLE.</p>
          </div>

          {/* Login Button with Google G Icon */}
          <div className="pt-4 space-y-4">
            <KeyButton
              color="blue"
              onClick={handleGoogleSignIn}
              className="w-full max-w-[416px]"
              icon={
                <svg className="w-6 h-6 ml-2" viewBox="0 0 24 24">
                  <path
                    fill="#74D4F0"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#74D4F0"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#74D4F0"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#74D4F0"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              }
            >
              LOGIN WITH GOOGLE
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Retro Polaroid & Memory Collage */}
        <div className="lg:col-span-6 relative min-h-[480px] md:min-h-[560px] flex items-center justify-center select-none">
          {/* Cardboard Box Container */}
          <div className="relative w-[340px] sm:w-[420px] md:w-[460px] h-[360px] md:h-[420px] bg-[#B88F61] border-[8px] border-[#846542] rounded-lg shadow-2xl rotate-[-4deg] p-6 flex flex-col justify-between overflow-hidden">
            {/* Box Header Stamps */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-['Rotonto',sans-serif] text-[36px] md:text-[44px] font-bold text-[#624B31] leading-none">
                  VH &apos;26
                </p>
                <p className="font-['Rotonto',sans-serif] text-[10px] md:text-[11px] font-bold text-[#5C452C] tracking-widest uppercase mt-1">
                  FRAGILE : A LOT OF MEMORIES INSIDE
                </p>
              </div>

              {/* Fragile / Badge Sticker */}
              <div className="bg-[#D5D1BE] border border-black/30 rounded px-2.5 py-1 text-[9px] font-mono text-black font-semibold rotate-2">
                VINHACK 2026
              </div>
            </div>

            {/* Overlapping Hackathon Polaroids */}
            <div className="relative w-full h-[220px] mt-2">
              {/* Photo 1 (Tilted Left) */}
              <div className="absolute left-2 top-3 w-[150px] md:w-[170px] h-[170px] md:h-[190px] bg-white p-2 pb-6 shadow-xl rotate-[-8deg] border border-neutral-300 transform hover:scale-105 transition duration-200 z-10">
                <div className="relative w-full h-[130px] md:h-[150px] bg-neutral-900 overflow-hidden">
                  <Image
                    src="/login/imgWhatsAppImage20260826At2303401_6c1da26b.png"
                    alt="VinHack Memories"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-[9px] font-mono text-center text-neutral-600 mt-1">HACKATHON 2024</p>
              </div>

              {/* Photo 2 (Tilted Right) */}
              <div className="absolute right-2 top-6 w-[150px] md:w-[170px] h-[170px] md:h-[190px] bg-white p-2 pb-6 shadow-xl rotate-[9deg] border border-neutral-300 transform hover:scale-105 transition duration-200 z-20">
                <div className="relative w-full h-[130px] md:h-[150px] bg-neutral-900 overflow-hidden">
                  <Image
                    src="/login/imgWhatsAppImage20260826At2306201_929cec87.png"
                    alt="VinHack Team"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-[9px] font-mono text-center text-neutral-600 mt-1">TEAM ENERGY</p>
              </div>

              {/* Small sticker badge in center */}
              <div className="absolute left-[38%] top-[30%] -translate-x-1/2 w-16 h-16 pointer-events-none z-30">
                <Image
                  src="/figma/group48095565.svg"
                  alt=""
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
