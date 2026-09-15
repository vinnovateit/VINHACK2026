"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import KeyButton from "./KeyButton";

export type StudentType = "vit" | "external";

export interface CheckInData {
  studentType: StudentType;
  name: string;
  regNo: string;
  isHosteller: boolean;
  blockType?: "MH" | "LH";
  hostelBlock?: string;
  roomNo?: string;
  address?: string;
  collegeName?: string;
  takingAccommodation?: boolean;
}

interface CheckInChecklistProps {
  initialData?: Partial<CheckInData>;
  studentType: StudentType;
  onSubmit: (data: CheckInData) => Promise<void> | void;
  isLoading?: boolean;
}

export default function CheckInChecklist({
  initialData,
  studentType,
  onSubmit,
  isLoading = false,
}: CheckInChecklistProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [regNo, setRegNo] = useState(initialData?.regNo ?? "");

  // Ensure fields sync if initialData arrives after initial mount
  React.useEffect(() => {
    if (initialData?.name) {
      setName(initialData.name);
    }
  }, [initialData?.name]);

  React.useEffect(() => {
    if (initialData?.regNo) {
      setRegNo(initialData.regNo);
    }
  }, [initialData?.regNo]);

  // VIT specific
  const [isHosteller, setIsHosteller] = useState<boolean>(initialData?.isHosteller ?? true);
  const [blockType, setBlockType] = useState<"MH" | "LH">(initialData?.blockType ?? "MH");
  const [address, setAddress] = useState(initialData?.address ?? "");

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
      regNo: regNo.trim(),
      isHosteller,
      blockType,
      address: address.trim(),
      collegeName: collegeName.trim(),
      takingAccommodation,
      hostelBlock: hostelBlock.trim(),
      roomNo: roomNo.trim(),
    });
  };

  return (
    <div className="relative w-full max-w-[1280px] h-full max-h-[100dvh] mx-auto bg-black text-white px-6 md:px-12 py-3 md:py-4 flex flex-col justify-between overflow-hidden">
      {/* Top bar: Brand logo & locked participant type badge */}
      <div className="flex-shrink-0 flex items-center justify-between z-10 h-10 md:h-12">
        <div className="w-[140px] md:w-[170px] h-[38px] md:h-[48px] relative">
          <Image
            src="/figma/logo-red.svg"
            alt="VinHack"
            fill
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Locked participant status pill (cannot be switched) */}
        <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 rounded-full px-3.5 py-1.5 text-xs font-['Rotonto',sans-serif] text-neutral-300 select-none shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              studentType === "vit" ? "bg-[#FC2425]" : "bg-sky-400"
            }`}
          />
          <span className="tracking-wide uppercase">
            {studentType === "vit" ? "INTERNAL (VIT STUDENT)" : "EXTERNAL PARTICIPANT"}
          </span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto">
        {/* Left Column: Step & Description */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-5 z-10">
          <div>
            <span className="font-['Rotonto',sans-serif] text-[36px] sm:text-[44px] md:text-[52px] text-[#FC2425] leading-none block">
              01
            </span>
            <h1 className="font-['Rotonto',sans-serif] text-[36px] sm:text-[44px] md:text-[52px] text-[#FC2425] leading-tight uppercase">
              CHECK-IN
            </h1>
          </div>

          <div className="font-['Rotonto',sans-serif] text-[16px] sm:text-[18px] md:text-[20px] text-neutral-200 font-light leading-relaxed max-w-[420px] space-y-2">
            <p>Let&apos;s get the paperwork out of the way.</p>
            <p className="text-neutral-400 text-[14px] sm:text-[16px] md:text-[18px]">
              After this, you&apos;ll be able to create or join your team, access your dashboard, and focus on what really matters.
            </p>
          </div>

          <div className="pt-2">
            <KeyButton
              color="pink"
              size="compact"
              type="submit"
              onClick={() => handleSubmit()}
              disabled={isLoading || !name.trim()}
              className="w-full max-w-[360px]"
            >
              {isLoading ? "SAVING..." : "SAVE AND CONTINUE"}
            </KeyButton>
          </div>
        </div>

        {/* Right Column: Tilted Clipboard with Papers & Pin */}
        <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center relative select-none h-full min-h-0 py-2">
          {/* Back FAQ Sheet (Tilted ~9deg) */}
          <div className="absolute w-[320px] sm:w-[380px] md:w-[420px] h-[450px] md:h-[480px] max-h-[calc(100dvh-130px)] bg-[#EFEFEA] border border-black/80 rounded-sm p-5 shadow-2xl rotate-[9deg] translate-x-4 md:translate-x-8 translate-y-2 pointer-events-none hidden sm:block">
            <div className="text-[11px] font-mono tracking-widest text-[#676767] uppercase flex justify-between border-b border-black/20 pb-2">
              <span>VINHACK 2026</span>
              <span>GENERAL INFORMATION</span>
            </div>
            <div className="mt-6 space-y-3">
              <span className="text-[10px] font-mono tracking-wider text-[#676767] uppercase block">
                FAQS
              </span>
              <h3 className="font-['Rotonto',sans-serif] text-[18px] md:text-[20px] text-black leading-snug">
                What is the maximum team size?
              </h3>
              <p className="font-['Rotonto',sans-serif] text-[14px] text-neutral-800 leading-relaxed pt-1">
                Each team can have up to 5 members.
              </p>
              <p className="font-['Rotonto',sans-serif] text-[13px] text-neutral-700 leading-relaxed">
                Cross-domain and cross-expertise teams are highly encouraged.
              </p>
            </div>
          </div>

          {/* Front Checklist Sheet (Tilted ~0.6deg) */}
          <form
            onSubmit={handleSubmit}
            className="relative w-[320px] sm:w-[380px] md:w-[430px] max-h-[calc(100dvh-100px)] bg-[#F4F4EF] border border-black rounded-sm p-3.5 sm:p-4 md:p-5 shadow-2xl rotate-[0.6deg] text-black z-20 flex flex-col justify-between"
          >
            {/* Realistic Pin at top right */}
            <div className="absolute -top-[20px] right-[20px] w-[42px] h-[64px] pointer-events-none z-30 drop-shadow-md">
              <Image
                src="/onboarding/imgPin_8d9d010c.svg"
                alt="Pin"
                width={42}
                height={64}
                className="object-contain"
              />
            </div>

            {/* Checklist Header */}
            <div className="text-[10px] font-mono tracking-widest text-[#676767] uppercase flex justify-between border-b border-black/20 pb-1">
              <span>VINHACK 2026</span>
              <span>{studentType === "vit" ? "REGISTRATION" : "ATTENDEE"} INFO</span>
            </div>

            <div className="mt-1 mb-2">
              <h2 className="font-['Rotonto',sans-serif] text-[16px] md:text-[18px] font-normal tracking-wide text-black uppercase">
                {studentType === "vit" ? "REGISTRATION CHECKLIST" : "PARTICIPANT CHECKLIST"}
              </h2>
            </div>

            {/* Table layout with Ques and Questions */}
            <div className="space-y-2 sm:space-y-2.5 text-[12px] md:text-[13px] font-['Rotonto',sans-serif]">
              {/* Question 1: Name (Locked) */}
              <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                <span className="col-span-2 text-[#676767] font-mono text-xs">Q1</span>
                <div className="col-span-10 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-black text-xs font-semibold">What do we call you ?</label>
                    <span className="text-[10px] font-mono text-neutral-600 uppercase flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded">
                      <Lock size={10} /> LOCKED
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    value={name}
                    placeholder="Participant name"
                    className="w-full bg-black/[0.04] cursor-not-allowed border-b-2 border-black/30 outline-none px-2 py-1 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[15px] select-none font-medium transition"
                  />
                </div>
              </div>

              {/* Question 2: Registration Number (Locked) */}
              <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                <span className="col-span-2 text-[#676767] font-mono text-xs">Q2</span>
                <div className="col-span-10 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-black text-xs font-semibold">Registration number</label>
                    <span className="text-[10px] font-mono text-neutral-600 uppercase flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded">
                      <Lock size={10} /> {studentType === "vit" ? "FETCHED FROM VIT RECORD" : "LOCKED"}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    value={regNo}
                    placeholder="Registration number"
                    className="w-full bg-black/[0.04] cursor-not-allowed border-b-2 border-black/30 outline-none px-2 py-1 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[15px] select-none font-medium transition"
                  />
                </div>
              </div>

              {/* Question 3: Hosteller (VIT) OR College Name (External) */}
              {studentType === "vit" ? (
                <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                  <span className="col-span-2 text-[#676767] font-mono text-xs">Q3</span>
                  <div className="col-span-10 space-y-0.5">
                    <label className="block text-black text-xs">Are you a hosteller ?</label>
                    <div className="flex items-center gap-5 pt-0.5">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isHosteller"
                          checked={isHosteller}
                          onChange={() => setIsHosteller(true)}
                          className="size-3.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-xs">Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isHosteller"
                          checked={!isHosteller}
                          onChange={() => setIsHosteller(false)}
                          className="size-3.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-xs">No (Dayscholar)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                  <span className="col-span-2 text-[#676767] font-mono text-xs">Q3</span>
                  <div className="col-span-10 space-y-0.5">
                    <label className="block text-black text-xs">College name</label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. IIT Madras, BITS Pilani..."
                      className="w-full bg-transparent border-b-2 border-black/60 focus:border-black outline-none px-1 py-0.5 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[14px] transition"
                    />
                  </div>
                </div>
              )}

              {/* Question 4: Where do you live (VIT) OR Accommodation (External) */}
              {studentType === "vit" ? (
                <div className="grid grid-cols-12 gap-2 items-start">
                  <span className="col-span-2 text-[#676767] font-mono text-xs pt-0.5">Q4</span>
                  <div className="col-span-10 space-y-1.5">
                    <label className="block text-black text-xs">
                      {isHosteller ? "Where do you live ?" : "Residential Address (Dayscholar)"}
                    </label>

                    {isHosteller ? (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center gap-5">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              checked={blockType === "MH"}
                              onChange={() => setBlockType("MH")}
                              className="size-3 accent-[#FC2425] cursor-pointer"
                            />
                            <span className="text-xs font-medium">MH (Men&apos;s)</span>
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              checked={blockType === "LH"}
                              onChange={() => setBlockType("LH")}
                              className="size-3 accent-[#FC2425] cursor-pointer"
                            />
                            <span className="text-xs font-medium">LH (Ladies&apos;)</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div>
                            <label className="block text-[10px] text-neutral-600 mb-0.5">Hostel Block</label>
                            <input
                              type="text"
                              value={hostelBlock}
                              onChange={(e) => setHostelBlock(e.target.value)}
                              placeholder="e.g. Q Block"
                              className="w-full bg-transparent border-b border-black/60 focus:border-black outline-none px-1 py-0.5 text-black text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-neutral-600 mb-0.5">Room No</label>
                            <input
                              type="text"
                              value={roomNo}
                              onChange={(e) => setRoomNo(e.target.value)}
                              placeholder="e.g. 412"
                              className="w-full bg-transparent border-b border-black/60 focus:border-black outline-none px-1 py-0.5 text-black text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Dayscholar Residential Address */
                      <div className="pt-0.5">
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Katpadi, Vellore / Local address"
                          className="w-full bg-transparent border-b border-black/60 focus:border-black outline-none px-1 py-0.5 text-black text-xs md:text-[13px] transition"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* External Accommodation */
                <div className="grid grid-cols-12 gap-2 items-start">
                  <span className="col-span-2 text-[#676767] font-mono text-xs pt-0.5">Q4</span>
                  <div className="col-span-10 space-y-1.5">
                    <label className="block text-black text-xs">Are you taking accommodation ?</label>
                    <div className="flex items-center gap-5">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="takingAccommodation"
                          checked={takingAccommodation}
                          onChange={() => setTakingAccommodation(true)}
                          className="size-3.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-xs">YES</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="takingAccommodation"
                          checked={!takingAccommodation}
                          onChange={() => setTakingAccommodation(false)}
                          className="size-3.5 accent-[#FC2425] cursor-pointer"
                        />
                        <span className="text-black text-xs">NO</span>
                      </label>
                    </div>

                    {takingAccommodation ? (
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <label className="block text-[10px] text-neutral-600 mb-0.5">Hostel Block</label>
                          <input
                            type="text"
                            value={hostelBlock}
                            onChange={(e) => setHostelBlock(e.target.value)}
                            placeholder="Optional / Assigned"
                            className="w-full bg-transparent border-b border-black/60 focus:border-black outline-none px-1 py-0.5 text-black text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-600 mb-0.5">Room No</label>
                          <input
                            type="text"
                            value={roomNo}
                            onChange={(e) => setRoomNo(e.target.value)}
                            placeholder="Optional / Assigned"
                            className="w-full bg-transparent border-b border-black/60 focus:border-black outline-none px-1 py-0.5 text-black text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-0.5">
                        <label className="block text-[10px] text-neutral-600 mb-0.5">Current Address / City</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Chennai / Hotel / City address"
                          className="w-full bg-transparent border-b border-black/60 focus:border-black outline-none px-1 py-0.5 text-black text-xs md:text-[13px] transition"
                        />
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
