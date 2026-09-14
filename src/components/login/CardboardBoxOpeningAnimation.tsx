"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CardboardBoxOpeningAnimation() {
  const [animationKey, setAnimationKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      id="cardboard-box-replay"
      className="relative w-full h-full flex flex-col items-center justify-center select-none group cursor-pointer"
      onClick={handleReplay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Click to replay box opening animation"
    >
      {/* 3D Box & Props Viewport Frame */}
      <motion.div
        key={animationKey}
        className="relative w-full max-h-[calc(100dvh-100px)] aspect-[736/824] flex items-center justify-center drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)]"
        animate={{
          scale: isHovered ? 1.025 : 1,
          rotate: isHovered ? 0.5 : 0,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* ============================================================ */}
        {/* 1. MAIN CARDBOARD BOX BASE (Floor, depth, walls, label)       */}
        {/* ============================================================ */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <Image
            src="/login/box/box_base.svg"
            alt="Cardboard Box Base"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* ============================================================ */}
        {/* 2. BOX LIDS / FLAPS (Open outwards smoothly)                */}
        {/* ============================================================ */}

        {/* TOP FLAP - Swings backward and opens upwards */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[54%_25%]"
          initial={{ scaleY: 0.15, opacity: 0.7 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.34, 1.35, 0.64, 1] }}
        >
          <Image
            src="/login/box/flap_top.svg"
            alt="Box Top Lid"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* LEFT FLAP - Swings open outward to the left */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[32%_50%]"
          initial={{ scaleX: 0.15, opacity: 0.7 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.34, 1.35, 0.64, 1] }}
        >
          <Image
            src="/login/box/flap_left.svg"
            alt="Box Left Lid"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* RIGHT FLAP - Swings open outward to the right */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[70%_52%]"
          initial={{ scaleX: 0.15, opacity: 0.7 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.25, ease: [0.34, 1.35, 0.64, 1] }}
        >
          <Image
            src="/login/box/flap_right.svg"
            alt="Box Right Lid"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* ============================================================ */}
        {/* 3. PROPS FLYING IN FROM THE CORNERS OF THE WEBSITE           */}
        {/* ============================================================ */}

        {/* PROP 1: Schedule papers & Event tickets -> Flies from BOTTOM-LEFT */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: -750, y: 550, rotate: 45, scale: 2.2, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            duration: 0.85,
            delay: 0.45,
            type: "spring",
            stiffness: 95,
            damping: 14,
          }}
        >
          <Image
            src="/login/box/prop_tickets.svg"
            alt="Schedule Tickets"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* PROP 2: Quote Cards ("CURIOUS BY NATURE") -> Flies from TOP-LEFT */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: -700, y: -600, rotate: -40, scale: 2.3, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            duration: 0.85,
            delay: 0.7,
            type: "spring",
            stiffness: 90,
            damping: 14,
          }}
        >
          <Image
            src="/login/box/prop_quotes.svg"
            alt="Quote Cards"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* PROP 3: Polaroid 2 (Back Photo) & Blue Card -> Flies from TOP-RIGHT */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: 650, y: -500, rotate: 45, scale: 2.2, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            duration: 0.85,
            delay: 0.95,
            type: "spring",
            stiffness: 95,
            damping: 14,
          }}
        >
          <Image
            src="/login/box/prop_polaroid_back.svg"
            alt="Polaroid Memories"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* PROP 4: Green LED Dot Matrix & Pin Badges -> Flies from BOTTOM-RIGHT */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: 700, y: 450, rotate: -50, scale: 2.1, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 1.15,
            type: "spring",
            stiffness: 105,
            damping: 13,
          }}
        >
          <Image
            src="/login/box/prop_badges.svg"
            alt="Hack Badges"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* PROP 5: Front Polaroid Photo (Team Energy) -> Flies from TOP-LEFT */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: -800, y: -400, rotate: -35, scale: 2.5, opacity: 0 }}
          animate={{
            x: 0,
            y: isHovered ? -8 : 0,
            rotate: isHovered ? 2 : 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.85,
            delay: 1.35,
            type: "spring",
            stiffness: 100,
            damping: 14,
          }}
        >
          <Image
            src="/login/box/prop_polaroid_front.svg"
            alt="VinHack Team Photo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* PROP 6: VinHack Hack Attendee Lanyard Badge (The Hero) -> Flies from TOP */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: 450, y: -750, rotate: 45, scale: 2.7, opacity: 0 }}
          animate={{
            x: 0,
            y: isHovered ? -12 : 0,
            rotate: isHovered ? -3 : 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.95,
            delay: 1.55,
            type: "spring",
            stiffness: 85,
            damping: 13,
          }}
        >
          <Image
            src="/login/box/prop_lanyard.svg"
            alt="Hack Attendee Lanyard"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Subtle interactive hint */}
      <div className="mt-2 text-center transition-all duration-300">
        <span className="font-['Rotonto',sans-serif] text-[11px] uppercase tracking-wider text-neutral-400 bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 rounded-full px-3.5 py-1 backdrop-blur-sm shadow-sm transition">
          Click box to replay opening
        </span>
      </div>
    </div>
  );
}
