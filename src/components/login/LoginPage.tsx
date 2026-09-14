"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import KeyButton from "../onboarding/KeyButton";

import CardboardBoxAnimation from "./CardboardBoxAnimation";

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/onboarding" });
  };

  return (
    <div className="relative w-full max-w-[1440px] mx-auto min-h-screen bg-black text-white px-6 md:px-12 py-6 flex flex-col justify-between overflow-x-hidden">
      {/* Top Bar: Brand Logo & Home link */}
      <div className="flex items-center justify-between z-20">
        <Link href="/" className="w-[160px] md:w-[190px] h-[48px] md:h-[58px] relative block">
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
          className="text-neutral-400 hover:text-white font-['Rotonto',sans-serif] text-sm flex items-center gap-2 border border-neutral-800 rounded-full px-4 py-1.5 transition hover:border-neutral-700"
        >
          ← Home
        </Link>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-10 items-center my-auto py-6">
        {/* Left Column: Heading & Google Sign-In */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 z-10">
          <p className="font-['Rotonto',sans-serif] text-neutral-400 text-[20px] md:text-[24px] lg:text-[26px] tracking-wide">
            Build. Collaborate. Ideate.
          </p>

          <div className="font-['Rotonto',sans-serif] text-[42px] sm:text-[50px] md:text-[56px] lg:text-[58px] xl:text-[64px] font-normal leading-[1.06] tracking-tight select-none">
            <p className="text-[#FC2425]">GOOD IDEAS</p>
            <p className="text-[#FC2425]">START WITH</p>
            <p>
              <span className="text-[#FC2425]">THE </span>
              <span className="text-white">RIGHT</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-white">PEOPLE</span>
              <div className="w-[42px] sm:w-[50px] md:w-[56px] h-[42px] sm:h-[50px] md:h-[56px] relative rotate-[20deg] inline-block shrink-0 -mt-1">
                <Image
                  src="/login/imgGroup48095565_fc3dc544.svg"
                  alt="*"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Login Button with Google G Icon */}
          <div className="pt-2">
            <KeyButton
              color="blue"
              onClick={handleGoogleSignIn}
              className="w-full max-w-[416px]"
              icon={
                <svg className="w-6 h-6 ml-2 shrink-0" viewBox="0 0 24 24">
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

        {/* Right Column: 3D Animated Cardboard Box with Items */}
        <div className="lg:col-span-7 relative flex items-center justify-center select-none w-full overflow-visible">
          <CardboardBoxAnimation />
        </div>
      </div>
    </div>
  );
}
