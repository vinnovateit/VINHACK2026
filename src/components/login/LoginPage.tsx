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
    <div className="relative w-full max-w-[1280px] mx-auto min-h-screen bg-black text-white px-6 md:px-12 pt-3 pb-8 flex flex-col gap-1 overflow-hidden">
      {/* Top Bar: Brand Logo */}
      <div className="flex items-center justify-between z-20">
        <Link href="/" className="w-[150px] md:w-[180px] h-[44px] md:h-[54px] relative block">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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

        {/* Right Column: Auth Illustration */}
        <div className="lg:col-span-6 relative min-h-[480px] md:min-h-[560px] flex items-center justify-center select-none">
          <Image
            src="/auth.svg"
            alt="VinHack login illustration"
            width={560}
            height={560}
            className="w-full max-w-[480px] h-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
