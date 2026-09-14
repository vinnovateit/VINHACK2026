"use client";

import React, { useState } from "react";
import Image from "next/image";
import KeyButton from "./KeyButton";

export type StudentType = "vit" | "external";

export interface CheckInData {
  studentType: StudentType;
  name: string;
  isHosteller: boolean;
  blockType?: "MH" | "LH";
  hostelBlock?: string;
  roomNo?: string;
  collegeName?: string;
  takingAccommodation?: boolean;
}

interface CheckInChecklistProps {
  initialData?: Partial<CheckInData>;
  studentType: StudentType;
  onStudentTypeChange?: (type: StudentType) => void;
  onSubmit: (data: CheckInData) => Promise<void> | void;
  isLoading?: boolean;
}

export default function CheckInChecklist({
  initialData,
  studentType,
  onStudentTypeChange,
  onSubmit,
  isLoading = false,
}: CheckInChecklistProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  
  // VIT specific
  const [isHosteller, setIsHosteller] = useState<boolean>(initialData?.isHosteller ?? true);
  const [blockType, setBlockType] = useState<"MH" | "LH">(initialData?.blockType ?? "MH");
  
  // External specific
  const [collegeName, setCollegeName] = useState(initialData?.collegeName ?? "");
  const [takingAccommodation, setTakingAccommodation] = useState<boolean>(
    initialData?.takingAccommodation ?? true
  );

  // Shared hostel info
  const [hostelBlock, setHostelBlock] = useState(initialData?.hostelBlock ?? "");
  const [roomNo, setRoomNo] = useState(initialData?.roomNo ?? "");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      studentType,
      name: name.trim(),
      isHosteller,
      blockType,
      collegeName: collegeName.trim(),
      takingAccommodation,
      hostelBlock: hostelBlock.trim(),
      roomNo: roomNo.trim(),
    });
  };

  return (
    <div className="relative w-full max-w-[1280px] mx-auto bg-black text-white px-6 md:px-12 pt-6 md:pt-8 pb-10 flex flex-col overflow-hidden">
      {/* Top bar: Brand logo & student type switch */}
      <div className="flex items-center justify-between z-10 shrink-0">
        <div className="w-[180px] md:w-[211px] h-[60px] md:h-[74px] relative">
          <Image
            src="/figma/logo-red.svg"
            alt="VinHack"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {onStudentTypeChange && (
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full p-1 text-xs md:text-sm font-['Rotonto',sans-serif]">
            <button
              type="button"
              onClick={() => onStudentTypeChange("vit")}
              className={`px-3 md:px-4 py-1.5 rounded-full transition ${
                studentType === "vit"
                  ? "bg-[#FA1A1D] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              VIT Student
            </button>
            <button
              type="button"
              onClick={() => onStudentTypeChange("external")}
              className={`px-3 md:px-4 py-1.5 rounded-full transition ${
                studentType === "external"
                  ? "bg-[#FA1A1D] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              External Participant
            </button>
          </div>
        )}
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2 md:mt-4 pb-6">
        {/* Left Column: Step & Description */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5 md:space-y-6 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[48px] md:text-[64px] text-[#FC2425] leading-none block">
              01
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[48px] md:text-[64px] text-[#FC2425] leading-tight uppercase">
              CHECK-IN
            </h1>
          </div>

          <div className="font-['Rotonto',sans-serif] text-[20px] md:text-[26px] text-neutral-200 font-light leading-relaxed max-w-[440px] space-y-4">
            <p>Let&apos;s get the paperwork out of the way.</p>
            <p className="text-neutral-400 text-[18px] md:text-[22px]">
              After this, you&apos;ll be able to create or join your team, access your dashboard, and focus on what really matters.
            </p>
          </div>

          <div className="pt-2 md:pt-4">
            <KeyButton
              color="pink"
              type="submit"
              onClick={() => handleSubmit()}
              disabled={isLoading || !name.trim()}
              className="w-[340px]"
            >
              {isLoading ? "SAVING..." : "SAVE AND CONTINUE"}
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Tilted Clipboard with Papers & Pin */}
        <div className="lg:col-span-6 flex items-center justify-center relative min-h-[580px] select-none">
          {/* Back FAQ Sheet (Tilted ~9deg) */}
          <div className="absolute w-[360px] md:w-[440px] h-[520px] bg-[#EFEFEA] border border-black/80 rounded-sm p-6 shadow-2xl rotate-[9deg] translate-x-4 md:translate-x-8 translate-y-2 pointer-events-none hidden sm:block">
            <div className="text-[12px] font-mono tracking-widest text-[#676767] uppercase flex justify-between border-b border-black/20 pb-2">
              <span>VINHACK 2026</span>
              <span>GENERAL INFORMATION</span>
            </div>
            <div className="mt-8 space-y-4">
              <span className="text-[11px] font-mono tracking-wider text-[#676767] uppercase block">
                FAQS
              </span>
              <h3 className="font-['Rotonto',sans-serif] text-[20px] md:text-[22px] text-black leading-snug">
                What is the maximum team size?
              </h3>
              <p className="font-['Rotonto',sans-serif] text-[15px] text-neutral-800 leading-relaxed pt-2">
                Each team can have up to 5 members.
              </p>
              <p className="font-['Rotonto',sans-serif] text-[14px] text-neutral-700 leading-relaxed">
                Cross-domain and cross-expertise teams are highly encouraged.
              </p>
            </div>
          </div>

          {/* Front Checklist Sheet (Tilted ~0.6deg) */}
          <form
            onSubmit={handleSubmit}
            className="relative w-[340px] sm:w-[410px] md:w-[460px] bg-[#F4F4EF] border border-black rounded-sm p-6 md:p-8 shadow-2xl rotate-[0.6deg] text-black z-20"
          >
            {/* Realistic Pin at top right */}
            <div className="absolute -top-[25px] right-[25px] w-[50px] h-[75px] pointer-events-none z-30 drop-shadow-md">
              <Image
                src="/onboarding/imgPin_8d9d010c.svg"
                alt="Pin"
                width={50}
                height={75}
                className="object-contain"
              />
            </div>

            {/* Checklist Header */}
            <div className="text-[10px] md:text-[11px] font-mono tracking-widest text-[#676767] uppercase flex justify-between border-b border-black/20 pb-2">
              <span>VINHACK 2026</span>
              <span>{studentType === "vit" ? "REGISTRATION" : "ATTENDEE"} INFO</span>
            </div>

            <div className="mt-4 mb-6">
              <h2 className="font-['Rotonto',sans-serif] text-[20px] md:text-[23px] font-normal tracking-wide text-black uppercase">
                {studentType === "vit" ? "REGISTRATION CHECKLIST" : "PARTICIPANT CHECKLIST"}
              </h2>
            </div>

            {/* Table layout with Ques and Questions */}
            <div className="space-y-6 text-[15px] md:text-[16px] font-['Rotonto',sans-serif]">
              {/* Question 1: Name */}
              <div className="grid grid-cols-12 gap-3 items-baseline border-b border-neutral-300 pb-4">
                <span className="col-span-2 text-[#676767] font-mono text-sm">Q1</span>
                <div className="col-span-10 space-y-2">
                  <label className="block text-black">What do we call you ?</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-1 text-black font-['Rotonto',sans-serif] text-[16px] md:text-[18px] transition"
                  />
                </div>
              </div>

              {/* Question 2: VIT Hosteller or External College */}
              {studentType === "vit" ? (
                <div className="grid grid-cols-12 gap-3 items-baseline border-b border-neutral-300 pb-4">
                  <span className="col-span-2 text-[#676767] font-mono text-sm">Q2</span>
                  <div className="col-span-10 space-y-2">
                    <label className="block text-black">Are you a hosteller ?</label>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isHosteller"
                          checked={isHosteller}
                          onChange={() => setIsHosteller(true)}
                          className="size-4.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-sm md:text-base">Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isHosteller"
                          checked={!isHosteller}
                          onChange={() => setIsHosteller(false)}
                          className="size-4.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-sm md:text-base">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-3 items-baseline border-b border-neutral-300 pb-4">
                  <span className="col-span-2 text-[#676767] font-mono text-sm">Q2</span>
                  <div className="col-span-10 space-y-2">
                    <label className="block text-black">College name</label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. IIT Madras, BITS Pilani..."
                      className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-1 text-black font-['Rotonto',sans-serif] text-[15px] md:text-[17px] transition"
                    />
                  </div>
                </div>
              )}

              {/* Question 3: Where do you live / Accommodation */}
              {studentType === "vit" ? (
                <div className="grid grid-cols-12 gap-3 items-start">
                  <span className="col-span-2 text-[#676767] font-mono text-sm pt-1">Q3</span>
                  <div className="col-span-10 space-y-3">
                    <label className="block text-black">Where do you live ?</label>

                    {isHosteller && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-6">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              checked={blockType === "MH"}
                              onChange={() => setBlockType("MH")}
                              className="size-4 accent-[#FC2425] cursor-pointer"
                            />
                            <span className="text-sm font-medium">MH (Men&apos;s)</span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              checked={blockType === "LH"}
                              onChange={() => setBlockType("LH")}
                              className="size-4 accent-[#FC2425] cursor-pointer"
                            />
                            <span className="text-sm font-medium">LH (Ladies&apos;)</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">Hostel Block</label>
                            <input
                              type="text"
                              value={hostelBlock}
                              onChange={(e) => setHostelBlock(e.target.value)}
                              placeholder="e.g. Q Block"
                              className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-1 text-black text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">Room No</label>
                            <input
                              type="text"
                              value={roomNo}
                              onChange={(e) => setRoomNo(e.target.value)}
                              placeholder="e.g. 412"
                              className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-1 text-black text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-3 items-start">
                  <span className="col-span-2 text-[#676767] font-mono text-sm pt-1">Q3</span>
                  <div className="col-span-10 space-y-3">
                    <label className="block text-black">Are you taking accommodation ?</label>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="takingAccommodation"
                          checked={takingAccommodation}
                          onChange={() => setTakingAccommodation(true)}
                          className="size-4.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-sm md:text-base">YES</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="takingAccommodation"
                          checked={!takingAccommodation}
                          onChange={() => setTakingAccommodation(false)}
                          className="size-4.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-sm md:text-base">NO</span>
                      </label>
                    </div>

                    {takingAccommodation && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs text-neutral-600 mb-1">Hostel Block</label>
                          <input
                            type="text"
                            value={hostelBlock}
                            onChange={(e) => setHostelBlock(e.target.value)}
                            placeholder="Optional / Assigned"
                            className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-1 text-black text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-600 mb-1">Room No</label>
                          <input
                            type="text"
                            value={roomNo}
                            onChange={(e) => setRoomNo(e.target.value)}
                            placeholder="Optional / Assigned"
                            className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-1 text-black text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
