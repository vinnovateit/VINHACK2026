"use client";

import React, { useState } from "react";
import Image from "next/image";
import KeyButton from "@/components/ui/KeyButton";
import { hostelBlockOptions, isValidHostelBlock, type HostelType } from "@/content/hostels";

export type StudentType = "vit" | "external";

export interface CheckInData {
  studentType: StudentType;
  name: string;
  regNo: string;
  phone: string;
  year?: number;
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
  /** Error returned by the server for the last submit attempt. */
  submitError?: string | null;
}

export default function CheckInChecklist({
  initialData,
  studentType,
  onSubmit,
  isLoading = false,
  submitError = null,
}: CheckInChecklistProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [regNo, setRegNo] = useState(initialData?.regNo ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [year, setYear] = useState<number | undefined>(initialData?.year);

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

  React.useEffect(() => {
    if (initialData?.phone) {
      setPhone(initialData.phone);
    }
  }, [initialData?.phone]);

  React.useEffect(() => {
    if (initialData?.year !== undefined) {
      setYear(initialData.year);
    }
  }, [initialData?.year]);

  // VIT specific
  const [isHosteller, setIsHosteller] = useState<boolean>(initialData?.isHosteller ?? true);
  const [blockType, setBlockType] = useState<HostelType>(initialData?.blockType ?? "MH");
  const [address, setAddress] = useState(initialData?.address ?? "");

  // External specific
  const [collegeName, setCollegeName] = useState(initialData?.collegeName ?? "");
  const [takingAccommodation, setTakingAccommodation] = useState<boolean>(
    initialData?.takingAccommodation ?? true
  );

  // Shared hostel info
  // VIT hostellers pick from the block list; a value saved before the list existed has to be re-picked.
  const [hostelBlock, setHostelBlock] = useState(() => {
    const saved = initialData?.hostelBlock ?? "";
    return studentType === "vit" && !isValidHostelBlock(initialData?.blockType ?? "MH", saved) ? "" : saved;
  });

  const chooseHostelType = (type: HostelType) => {
    setBlockType(type);
    if (!isValidHostelBlock(type, hostelBlock)) setHostelBlock("");
  };
  const [roomNo, setRoomNo] = useState(initialData?.roomNo ?? "");

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isPhoneValid = (num: string) => {
    const digits = num.replace(/\D/g, "");
    return digits.length === 10;
  };

  const getMissingFieldLabels = (): string[] => {
    const missing: string[] = [];
    if (!name.trim()) missing.push("Name");
    if (!regNo.trim()) missing.push("Registration Number");
    if (!phone.trim()) missing.push("Phone Number");
    else if (!isPhoneValid(phone)) missing.push("Valid 10-digit Phone Number");

    if (studentType === "vit") {
      if (isHosteller) {
        if (!hostelBlock.trim()) missing.push("Hostel Block");
        if (!roomNo.trim()) missing.push("Room Number");
      } else {
        if (!address.trim()) missing.push("Residential Address");
      }
    } else {
      if (!collegeName.trim()) missing.push("College Name");
      if (!year) missing.push("Year of Study");
      if (takingAccommodation) {
        if (!hostelBlock.trim()) missing.push("Hostel Block");
        if (!roomNo.trim()) missing.push("Room Number");
      } else {
        if (!address.trim()) missing.push("Current Address / City");
      }
    }
    return missing;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAttemptedSubmit(true);

    const missing = getMissingFieldLabels();
    if (missing.length > 0) {
      setFormError(`Please fill in all required fields: ${missing.join(", ")}`);
      // Auto-focus first empty field
      if (!name.trim()) {
        document.getElementById("checkin-name")?.focus();
      } else if (!regNo.trim()) {
        document.getElementById("checkin-regNo")?.focus();
      } else if (!phone.trim() || !isPhoneValid(phone)) {
        document.getElementById("checkin-phone")?.focus();
      } else if (studentType === "vit" && isHosteller && !hostelBlock.trim()) {
        document.getElementById("checkin-hostelBlock")?.focus();
      } else if (studentType === "vit" && isHosteller && !roomNo.trim()) {
        document.getElementById("checkin-roomNo")?.focus();
      } else if (studentType === "vit" && !isHosteller && !address.trim()) {
        document.getElementById("checkin-address")?.focus();
      } else if (studentType === "external" && !collegeName.trim()) {
        document.getElementById("checkin-college")?.focus();
      } else if (studentType === "external" && !year) {
        document.getElementById("checkin-year-1")?.focus();
      } else if (studentType === "external" && takingAccommodation && !hostelBlock.trim()) {
        document.getElementById("checkin-hostelBlock")?.focus();
      } else if (studentType === "external" && takingAccommodation && !roomNo.trim()) {
        document.getElementById("checkin-roomNo")?.focus();
      } else if (studentType === "external" && !takingAccommodation && !address.trim()) {
        document.getElementById("checkin-address")?.focus();
      }
      return;
    }

    setFormError(null);
    onSubmit({
      studentType,
      name: name.trim(),
      regNo: regNo.trim(),
      phone: phone.trim(),
      year,
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
    <div className="relative w-full max-w-[1280px] min-h-[100dvh] lg:h-full lg:max-h-[100dvh] mx-auto bg-black text-white px-4 sm:px-6 md:px-12 py-3 md:py-4 flex flex-col justify-start lg:justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden">
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

          {(formError || submitError) && (
            <div className="bg-red-500/15 border border-red-500/40 rounded-lg px-3 py-2 text-xs font-rotonto text-red-300 max-w-[360px] flex items-start gap-2">
              <span className="text-red-400 font-bold">⚠️</span>
              <span className="leading-snug">{formError || submitError}</span>
            </div>
          )}

          <div className="pt-2">
            <KeyButton
              color="pink"
              size="compact"
              type="submit"
              onClick={() => handleSubmit()}
              disabled={isLoading}
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
            <div className="text-[11px] font-rotonto tracking-widest text-[#676767] uppercase flex justify-between border-b border-black/20 pb-2">
              <span>VINHACK 2026</span>
              <span>GENERAL INFORMATION</span>
            </div>
            <div className="mt-6 space-y-3">
              <span className="text-[10px] font-rotonto tracking-wider text-[#676767] uppercase block">
                FAQS
              </span>
              <h3 className="font-['Rotonto',sans-serif] text-[18px] md:text-[20px] text-black leading-snug">
                What is the team size?
              </h3>
              <p className="font-['Rotonto',sans-serif] text-[14px] text-neutral-800 leading-relaxed pt-1">
                Each team must have 3 to 5 members.
              </p>
              <p className="font-['Rotonto',sans-serif] text-[13px] text-neutral-700 leading-relaxed">
                Cross-domain and cross-expertise teams are highly encouraged.
              </p>
            </div>
          </div>

          {/* Front Checklist Sheet (Tilted ~0.6deg) */}
          <form
            onSubmit={handleSubmit}
            className="relative w-[320px] sm:w-[380px] md:w-[430px] max-h-[calc(100dvh-100px)] bg-[#F4F4EF] border border-black rounded-sm p-3.5 sm:p-4 md:p-5 shadow-2xl rotate-[0.6deg] text-black z-20 flex flex-col justify-between overflow-y-auto"
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
            <div className="text-[10px] font-rotonto tracking-widest text-[#676767] uppercase flex justify-between border-b border-black/20 pb-1">
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
              {/* Question 1: Name */}
              <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                <span className="col-span-2 text-[#676767] font-rotonto text-xs">Q1</span>
                <div className="col-span-10 space-y-0.5">
                  <label className="block text-black text-xs font-semibold">What do we call you ?</label>
                  <input
                    id="checkin-name"
                    type="text"
                    required
                    readOnly={studentType === "vit"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={studentType === "vit" ? "Participant name" : "Enter your full name"}
                    className={`w-full bg-transparent border-b-2 ${
                      attemptedSubmit && !name.trim()
                        ? "border-red-500 bg-red-500/10"
                        : studentType === "vit"
                        ? "border-black/40 cursor-default select-none font-medium"
                        : "border-black/60 focus:border-black transition"
                    } outline-none px-1 py-0.5 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[15px]`}
                  />
                  {attemptedSubmit && !name.trim() && (
                    <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Name is required</span>
                  )}
                </div>
              </div>

              {/* Question 2: Registration Number */}
              <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                <span className="col-span-2 text-[#676767] font-rotonto text-xs">Q2</span>
                <div className="col-span-10 space-y-0.5">
                  <label className="block text-black text-xs font-semibold">Registration number</label>
                  <input
                    id="checkin-regNo"
                    type="text"
                    required
                    readOnly={studentType === "vit"}
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder={studentType === "vit" ? "Registration number" : "College Roll No / Reg No"}
                    className={`w-full bg-transparent border-b-2 ${
                      attemptedSubmit && !regNo.trim()
                        ? "border-red-500 bg-red-500/10"
                        : studentType === "vit"
                        ? "border-black/40 cursor-default select-none font-medium"
                        : "border-black/60 focus:border-black transition"
                    } outline-none px-1 py-0.5 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[15px]`}
                  />
                  {attemptedSubmit && !regNo.trim() && (
                    <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Registration number is required</span>
                  )}
                </div>
              </div>

              {/* Question 3: Phone number */}
              <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                <span className="col-span-2 text-[#676767] font-rotonto text-xs">Q3</span>
                <div className="col-span-10 space-y-0.5">
                  <label className="block text-black text-xs font-semibold">Phone number</label>
                  <input
                    id="checkin-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className={`w-full bg-transparent border-b-2 ${
                      attemptedSubmit && (!phone.trim() || !isPhoneValid(phone))
                        ? "border-red-500 bg-red-500/10"
                        : "border-black/60 focus:border-black"
                    } outline-none px-1 py-0.5 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[15px] transition`}
                  />
                  {attemptedSubmit && (!phone.trim() || !isPhoneValid(phone)) && (
                    <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">
                      {!phone.trim() ? "* Phone number is required" : "* Must be a valid 10-digit mobile number"}
                    </span>
                  )}
                </div>
              </div>

              {/* Question 4: Hosteller (VIT) OR College Name (External) */}
              {studentType === "vit" ? (
                <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                  <span className="col-span-2 text-[#676767] font-rotonto text-xs">Q4</span>
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
                  <span className="col-span-2 text-[#676767] font-rotonto text-xs">Q4</span>
                  <div className="col-span-10 space-y-0.5">
                    <label className="block text-black text-xs">College name</label>
                    <input
                      id="checkin-college"
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. IIT Madras, BITS Pilani..."
                      className={`w-full bg-transparent border-b-2 ${
                        attemptedSubmit && !collegeName.trim()
                          ? "border-red-500 bg-red-500/10"
                          : "border-black/60 focus:border-black"
                      } outline-none px-1 py-0.5 text-black font-['Rotonto',sans-serif] text-[13px] md:text-[14px] transition`}
                    />
                    {attemptedSubmit && !collegeName.trim() && (
                      <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* College name is required</span>
                    )}
                  </div>
                </div>
              )}

              {/* Question 5: Year of study (External only) */}
              {studentType === "external" && (
                <div className="grid grid-cols-12 gap-2 items-baseline border-b border-neutral-300 pb-2">
                  <span className="col-span-2 text-[#676767] font-rotonto text-xs">Q5</span>
                  <div className="col-span-10 space-y-1">
                    <label className="block text-black text-xs font-semibold">Year of study</label>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      {[
                        { value: 1, label: "1st Year" },
                        { value: 2, label: "2nd Year" },
                        { value: 3, label: "3rd Year" },
                        { value: 4, label: "4th Year" },
                        { value: 5, label: "5th Year / PG" },
                      ].map(({ value, label }) => (
                        <label key={value} className="inline-flex items-center gap-1 cursor-pointer select-none">
                          <input
                            id={`checkin-year-${value}`}
                            type="radio"
                            name="yearOfStudy"
                            value={value}
                            checked={year === value}
                            onChange={() => setYear(value)}
                            className="size-3.5 accent-[#FC2425] cursor-pointer"
                          />
                          <span className="text-black text-xs font-['Rotonto',sans-serif]">{label}</span>
                        </label>
                      ))}
                    </div>
                    {attemptedSubmit && !year && (
                      <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Year of study is required</span>
                    )}
                  </div>
                </div>
              )}

              {/* Question 5: Where do you live (VIT) OR Question 6: Accommodation (External) */}
              {studentType === "vit" ? (
                <div className="grid grid-cols-12 gap-2 items-start">
                  <span className="col-span-2 text-[#676767] font-rotonto text-xs pt-0.5">Q5</span>
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
                              onChange={() => chooseHostelType("MH")}
                              className="size-3 accent-[#FC2425] cursor-pointer"
                            />
                            <span className="text-xs font-medium">MH (Men&apos;s)</span>
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              checked={blockType === "LH"}
                              onChange={() => chooseHostelType("LH")}
                              className="size-3 accent-[#FC2425] cursor-pointer"
                            />
                            <span className="text-xs font-medium">LH (Ladies&apos;)</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div>
                            <label className="block text-[10px] text-neutral-600 mb-0.5">Hostel Block</label>
                            <select
                              id="checkin-hostelBlock"
                              required
                              value={hostelBlock}
                              onChange={(e) => setHostelBlock(e.target.value)}
                              className={`w-full bg-transparent border-b ${
                                attemptedSubmit && !hostelBlock.trim()
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-black/60 focus:border-black"
                              } outline-none px-0.5 py-0.5 text-xs cursor-pointer ${hostelBlock ? "text-black" : "text-neutral-500"}`}
                            >
                              <option value="" disabled>
                                Select block
                              </option>
                              {hostelBlockOptions(blockType).map((option) => (
                                <option key={option.value} value={option.value} className="text-black">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {attemptedSubmit && !hostelBlock.trim() && (
                              <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Required</span>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] text-neutral-600 mb-0.5">Room No</label>
                            <input
                              id="checkin-roomNo"
                              type="text"
                              required
                              value={roomNo}
                              onChange={(e) => setRoomNo(e.target.value)}
                              placeholder="e.g. 412"
                              className={`w-full bg-transparent border-b ${
                                attemptedSubmit && !roomNo.trim()
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-black/60 focus:border-black"
                              } outline-none px-1 py-0.5 text-black text-xs`}
                            />
                            {attemptedSubmit && !roomNo.trim() && (
                              <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Required</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Dayscholar Residential Address */
                      <div className="pt-0.5">
                        <input
                          id="checkin-address"
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Katpadi, Vellore / Local address"
                          className={`w-full bg-transparent border-b ${
                            attemptedSubmit && !address.trim()
                              ? "border-red-500 bg-red-500/10"
                              : "border-black/60 focus:border-black"
                          } outline-none px-1 py-0.5 text-black text-xs md:text-[13px] transition`}
                        />
                        {attemptedSubmit && !address.trim() && (
                          <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Residential address is required</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* External Accommodation */
                <div className="grid grid-cols-12 gap-2 items-start">
                  <span className="col-span-2 text-[#676767] font-rotonto text-xs pt-0.5">Q6</span>
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
                            id="checkin-hostelBlock"
                            type="text"
                            required
                            value={hostelBlock}
                            onChange={(e) => setHostelBlock(e.target.value)}
                            placeholder="e.g. Block / Campus or TBD"
                            className={`w-full bg-transparent border-b ${
                              attemptedSubmit && !hostelBlock.trim()
                                ? "border-red-500 bg-red-500/10"
                                : "border-black/60 focus:border-black"
                            } outline-none px-1 py-0.5 text-black text-xs`}
                          />
                          {attemptedSubmit && !hostelBlock.trim() && (
                            <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Required</span>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-600 mb-0.5">Room No</label>
                          <input
                            id="checkin-roomNo"
                            type="text"
                            required
                            value={roomNo}
                            onChange={(e) => setRoomNo(e.target.value)}
                            placeholder="e.g. Room No or TBD"
                            className={`w-full bg-transparent border-b ${
                              attemptedSubmit && !roomNo.trim()
                                ? "border-red-500 bg-red-500/10"
                                : "border-black/60 focus:border-black"
                            } outline-none px-1 py-0.5 text-black text-xs`}
                          />
                          {attemptedSubmit && !roomNo.trim() && (
                            <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Required</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-0.5">
                        <label className="block text-[10px] text-neutral-600 mb-0.5">Current Address / City</label>
                        <input
                          id="checkin-address"
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Chennai / Hotel / City address"
                          className={`w-full bg-transparent border-b ${
                            attemptedSubmit && !address.trim()
                              ? "border-red-500 bg-red-500/10"
                              : "border-black/60 focus:border-black"
                          } outline-none px-1 py-0.5 text-black text-xs md:text-[13px] transition`}
                        />
                        {attemptedSubmit && !address.trim() && (
                          <span className="text-[10px] text-red-600 font-rotonto block pt-0.5">* Address / City is required</span>
                        )}
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
