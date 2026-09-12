"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { WHO_ARE_WE } from "@/content/site";

const PAD = "px-5";
const COL = "mx-auto max-w-[560px] w-full";

export default function MobileWhoAreWe() {
  const [revealed, setRevealed] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "photos">("cards");

  const greenQuote = WHO_ARE_WE.quotes[0];
  const pinkQuote = WHO_ARE_WE.quotes[1];
  const blueQuote = WHO_ARE_WE.quotes[2];
  const redQuote = WHO_ARE_WE.quotes[3];

  return (
    <section
      aria-label="Who Are We"
      className={`${COL} ${PAD} py-16 overflow-x-clip text-white`}
    >
      {/* Interactive Title Banner: Toggles between "WHO ARE WE ?" and "WE ARE VINNOVATEIT" */}
      <div
        onClick={() => setRevealed(!revealed)}
        className="cursor-pointer select-none bg-[#111111] p-6 rounded-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.8)] relative overflow-hidden transition-colors hover:border-[#bfea88]/40"
      >
        <div className="absolute top-0 right-0 p-2 text-[10px] font-mono text-[#bfea88]/70 uppercase tracking-wider">
          [ TAP TO REVEAL ]
        </div>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="who"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="py-4 text-center"
            >
              <p className="font-rotonto text-[13px] text-[#bfea88] tracking-widest uppercase mb-1">
                {"// DISCOVER"}
              </p>
              <h2 className="font-rotonto text-[#bfea88] text-[42px] leading-tight tracking-wider uppercase drop-shadow-[0_0_25px_rgba(191,234,136,0.3)]">
                {WHO_ARE_WE.title}
              </h2>
              <p className="font-mono text-[10px] text-white/50 tracking-widest mt-2 uppercase">
                TAP TO SEE WHAT DRIVES US
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="vinnovate"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="py-4 text-center"
            >
              <span className="font-rotonto text-[#bfea88] text-[15px] tracking-[0.2em] uppercase opacity-90 block mb-1">
                {WHO_ARE_WE.reveal.eyebrow}
              </span>
              <h2 className="font-rotonto text-[#bfea88] text-[40px] leading-tight tracking-wide uppercase drop-shadow-[0_0_30px_rgba(191,234,136,0.35)]">
                {WHO_ARE_WE.reveal.brand}
              </h2>
              <p className="font-sans font-semibold text-white/90 text-[13px] tracking-[0.16em] mt-2 uppercase">
                {WHO_ARE_WE.reveal.tagline}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Switcher */}
      <div className="mt-8 flex gap-2 p-1 bg-[#1a1a1a] rounded-lg border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all ${
            activeTab === "cards"
              ? "bg-[#bfea88] text-black shadow-xs"
              : "text-white/60 hover:text-white"
          }`}
        >
          {"// QUOTES & MEDIA"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all ${
            activeTab === "photos"
              ? "bg-[#bfea88] text-black shadow-xs"
              : "text-white/60 hover:text-white"
          }`}
        >
          {`// TEAM POLAROIDS (${WHO_ARE_WE.polaroids.length})`}
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === "cards" ? (
          <div className="flex flex-col gap-5">
            {/* 1. GREEN CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-5 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]"
              style={{ backgroundColor: greenQuote.color }}
            >
              <div className="absolute -top-3 left-8 w-12 h-4 bg-white/70 backdrop-blur-xs rotate-2 border border-black/10" />
              <h3 className="font-rotonto text-black text-[22px] leading-tight font-bold uppercase mb-2">
                {greenQuote.headline}
              </h3>
              <p className="font-mono text-[10px] text-black/75 tracking-widest uppercase font-bold">
                {greenQuote.subline}
              </p>
            </motion.div>

            {/* 2. PINK CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-5 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[1.5deg]"
              style={{ backgroundColor: pinkQuote.color }}
            >
              <div className="absolute -top-3 right-8 w-12 h-4 bg-white/70 backdrop-blur-xs -rotate-2 border border-black/10" />
              <h3 className="font-rotonto text-black text-[24px] leading-tight font-bold uppercase mb-2 whitespace-pre-line">
                {pinkQuote.headline}
              </h3>
              <p className="font-mono text-[10px] text-black/70 tracking-widest uppercase font-semibold">
                {"// ALWAYS CURIOUS"}
              </p>
            </motion.div>

            {/* 3. VIDEO CARDS ROW */}
            <div className="grid grid-cols-2 gap-3">
              {WHO_ARE_WE.videos.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="bg-gradient-to-br from-[#d4d4d4] to-[#a3a3a3] p-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  <div className="size-9 rounded-full bg-black/85 flex items-center justify-center shadow-md mb-2">
                    <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-[#bfea88] ml-0.5" />
                  </div>
                  <span className="font-rotonto text-black text-[13px] font-bold tracking-wider uppercase">
                    {vid.label}
                  </span>
                  <span className="font-mono text-[8px] text-black/70 tracking-wide mt-0.5">
                    {idx === 0 ? "REEL • 0:45" : "AFTERMOVIE"}
                  </span>
                </div>
              ))}
            </div>

            {/* 4. BLUE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-5 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1.5deg]"
              style={{ backgroundColor: blueQuote.color }}
            >
              <h3 className="font-rotonto text-black text-[21px] leading-tight font-bold uppercase mb-2 whitespace-pre-line">
                {blueQuote.headline}
              </h3>
              <p className="font-mono text-[10px] text-black/70 tracking-widest uppercase font-semibold">
                VIT VELLORE // EST. 2014
              </p>
            </motion.div>

            {/* 5. RED CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-5 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[1deg]"
              style={{ backgroundColor: redQuote.color }}
            >
              <h3 className="font-rotonto text-white text-[22px] leading-tight font-bold uppercase mb-2 whitespace-pre-line">
                {redQuote.headline}
              </h3>
              <p className="font-mono text-[10px] text-white/80 tracking-widest uppercase font-semibold">
                DIFFERENT MINDS. ONE GOAL.
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {WHO_ARE_WE.polaroids.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-[#fdfdfd] p-2 pb-6 rounded-xs shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-black/15 ${
                  i % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]"
                }`}
              >
                <div className="relative w-full aspect-[4/3] bg-black overflow-hidden mb-2">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover contrast-110"
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="font-rotonto text-[9px] text-black/70 font-bold uppercase tracking-wider">
                    MEMORIES
                  </span>
                  <span className="font-mono text-[9px] font-bold text-black/50">
                    {photo.number}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
