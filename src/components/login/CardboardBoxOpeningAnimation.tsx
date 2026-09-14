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
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
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
        {/* 2. FULLY SEALED CLOSED BOX (Visible first, unseals & fades)  */}
        {/* ============================================================ */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{ duration: 0.45, delay: 0.8, ease: "easeOut" }}
        >
          <Image
            src="/login/box/box_closed.svg"
            alt="Closed Cardboard Box"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* ============================================================ */}
        {/* 3. 3D BOX LIDS / FLAPS (Fold open outwards along hinges)    */}
        {/* ============================================================ */}

        {/* TOP FLAP - Hinged at back top edge [58.8% 35.5%], swings back */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[58.8%_35.5%]"
          initial={{ rotateX: 85, scaleY: 0.15, y: 30, opacity: 0 }}
          animate={{ rotateX: 0, scaleY: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.34, 1.35, 0.64, 1] }}
        >
          <Image
            src="/login/box/flap_top.svg"
            alt="Box Top Lid"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* LEFT FLAP - Hinged at left edge [24.5% 38.6%], swings out to left */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[24.5%_38.6%]"
          initial={{ rotateY: -85, scaleX: 0.15, x: 25, opacity: 0 }}
          animate={{ rotateY: 0, scaleX: 1, x: 0, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.88, ease: [0.34, 1.35, 0.64, 1] }}
        >
          <Image
            src="/login/box/flap_left.svg"
            alt="Box Left Lid"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* RIGHT FLAP - Hinged at right edge [72.7% 60.4%], swings out to right */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[72.7%_60.4%]"
          initial={{ rotateY: 85, scaleX: 0.15, x: -25, opacity: 0 }}
          animate={{ rotateY: 0, scaleX: 1, x: 0, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.95, ease: [0.34, 1.35, 0.64, 1] }}
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
        {/* 4. PROPS APPEARING ONE BY ONE INSIDE THE OPEN CARDBOARD BOX  */}
        {/* ============================================================ */}

        {/* PROP 1: Schedule papers & Event tickets -> drops in first */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ y: -65, scale: 1.12, rotate: 4, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            delay: 1.55,
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

        {/* PROP 2: Quote Cards ("CURIOUS BY NATURE") -> drops in second */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ y: -65, scale: 1.12, rotate: -3, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            delay: 1.85,
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

        {/* PROP 3: Polaroid 2 (Back Photo) & Blue Card -> drops in third */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ y: -70, scale: 1.14, rotate: 3, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            delay: 2.15,
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

        {/* PROP 4: Green LED Dot Matrix & Pin Badges -> drops in fourth */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ y: -70, scale: 1.14, rotate: -4, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            delay: 2.45,
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

        {/* PROP 5: Front Polaroid Photo (Team Energy) -> drops in fifth */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ y: -80, scale: 1.16, rotate: 3, opacity: 0 }}
          animate={{
            y: isHovered ? -8 : 0,
            rotate: isHovered ? 2 : 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            delay: 2.75,
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

        {/* PROP 6: VinHack Attendee Lanyard Badge (The Hero) -> drops in last */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ y: -95, scale: 1.2, rotate: -5, opacity: 0 }}
          animate={{
            y: isHovered ? -12 : 0,
            rotate: isHovered ? -3 : 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 17,
            delay: 3.05,
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
