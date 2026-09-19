"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CardboardBoxOpeningAnimation() {
  const [isOpened, setIsOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpened(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none group cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Box & Props Viewport Frame */}
      <motion.div
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
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{
            opacity: isOpened ? 0 : 1,
            transform: isOpened ? "scale(0.98) translateY(-8px)" : "scale(1) translateY(0px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
          }}
        >
          <Image
            src="/login/box/box_closed.svg"
            alt="Closed Cardboard Box"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* ============================================================ */}
        {/* 3. 3D BOX LIDS / 4 COVERS (Fold open outwards along hinges)   */}
        {/* ============================================================ */}

        {/* COVER 1: TOP / BACK FLAP - Hinged along back rim [58.6% 36.2%] */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[58.6%_36.2%] z-[1]"
          style={{
            transform: isOpened
              ? "rotate3d(0.8904, 0.4552, 0, 0deg)"
              : "rotate3d(0.8904, 0.4552, 0, 75deg)",
            opacity: isOpened ? 1 : 0,
            transition:
              "transform 0.85s cubic-bezier(0.34, 1.25, 0.64, 1) 0ms, opacity 0.35s ease 0ms",
          }}
        >
          <Image
            src="/login/box/flap_top.svg"
            alt="Box Back Cover"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* COVER 2: LEFT FLAP - Hinged along left rim [24.4% 38.7%] */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[24.4%_38.7%] z-[2]"
          style={{
            transform: isOpened
              ? "rotate3d(0.5569, -0.8306, 0, 0deg)"
              : "rotate3d(0.5569, -0.8306, 0, 75deg)",
            opacity: isOpened ? 1 : 0,
            transition:
              "transform 0.85s cubic-bezier(0.34, 1.25, 0.64, 1) 40ms, opacity 0.35s ease 40ms",
          }}
        >
          <Image
            src="/login/box/flap_left.svg"
            alt="Box Left Cover"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* COVER 3: RIGHT FLAP - Hinged along right rim [73.0% 60.7%] */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[73.0%_60.7%] z-[2]"
          style={{
            transform: isOpened
              ? "rotate3d(0.5363, -0.8440, 0, 0deg)"
              : "rotate3d(0.5363, -0.8440, 0, -75deg)",
            opacity: isOpened ? 1 : 0,
            transition:
              "transform 0.85s cubic-bezier(0.34, 1.25, 0.64, 1) 80ms, opacity 0.35s ease 80ms",
          }}
        >
          <Image
            src="/login/box/flap_right.svg"
            alt="Box Right Cover"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* COVER 4: BOTTOM / FRONT FLAP - Hinged along front rim [38.8% 63.2%] */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none origin-[38.8%_63.2%] z-[15]"
          style={{
            transform: isOpened
              ? "rotate3d(0.8948, 0.4465, 0, 0deg)"
              : "rotate3d(0.8948, 0.4465, 0, 75deg)",
            opacity: isOpened ? 1 : 0,
            transition:
              "transform 0.85s cubic-bezier(0.34, 1.25, 0.64, 1) 120ms, opacity 0.35s ease 120ms",
          }}
        >
          <Image
            src="/login/box/flap_front.svg"
            alt="Box Front Cover"
            fill
            className="object-contain"
            priority
          />
        </div>

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
    </div>
  );
}
