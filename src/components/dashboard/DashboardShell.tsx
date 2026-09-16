"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  Shield,
  Trash2,
  UserMinus,
  UserRound,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";
import ClientQrCode from "@/components/onboarding/ClientQrCode";
import { FIELD_LIMITS, TRACK_OPTIONS } from "@/lib/validation";

const ZIGZAG_CLIP_PATH =
  "polygon(6px 0%, calc(100% - 6px) 0%, 100% 16.6%, calc(100% - 6px) 33.3%, 100% 50%, calc(100% - 6px) 66.6%, 100% 83.3%, calc(100% - 6px) 100%, 6px 100%, 0% 83.3%, 6px 66.6%, 0% 50%, 6px 33.3%, 0% 16.6%)";
import {
  saveSubmissionAction,
  transferLeadershipAction,
  deleteTeamAction,
  leaveTeamAction,
  removeTeamMemberAction,
} from "@/app/dashboard/actions";

export interface DashboardShellProps {
  participant: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    type: "vit" | "external";
    regNo?: string;
    isLeader: boolean;
  };
  team: {
    id: string;
    name: string;
    code: string;
    capacity: number;
    minSize: number;
    teamType: string;
    track: string | null;
    leaderId: string | null;
    leaderName: string | null;
    members: Array<{
      id: string;
      name: string;
      email: string;
      regNo: string;
      type: "vit" | "external";
      isLeader: boolean;
    }>;
    submission: {
      title: string;
      description: string;
      githubLink: string;
      figmaLink: string;
      deckLink: string;
      otherLinks: string;
      progressNote: string;
      submittedAt: string | null;
    } | null;
  };
  initialTrack?: string;
}

type TabType = "details" | "links" | "progress";

export default function DashboardShell({
  participant,
  team,
  initialTrack = "",
}: DashboardShellProps) {
  const router = useRouter();

  // Navigation & Dropdown states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Toast notification state
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Active step tab in "Submit for Review"
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [isSaving, startSaveTransition] = useTransition();

  // Submission Form state
  const [projectTitle, setProjectTitle] = useState(team.submission?.title || "");
  const [projectDescription, setProjectDescription] = useState(team.submission?.description || "");
  const [selectedTrack, setSelectedTrack] = useState(initialTrack || team.track || TRACK_OPTIONS[0]);
  const [githubLink, setGithubLink] = useState(team.submission?.githubLink || "");
  const [figmaLink, setFigmaLink] = useState(team.submission?.figmaLink || "");
  const [deckLink, setDeckLink] = useState(team.submission?.deckLink || "");
  const [otherLinks, setOtherLinks] = useState(team.submission?.otherLinks || "");
  const [progressStatus, setProgressStatus] = useState("In progress");
  const [teamConfidence, setTeamConfidence] = useState("Feeling good");
  const [progressNote, setProgressNote] = useState(team.submission?.progressNote || "");

  // Squad Dropdown state
  const [squadDropdownOpen, setSquadDropdownOpen] = useState(false);
  const [squadSubView, setSquadSubView] = useState<"kick" | "transfer" | "delete" | null>(null);
  const [leaveConfirming, setLeaveConfirming] = useState(false);
  const [selectedNewLeader, setSelectedNewLeader] = useState("");
  const [isActionPending, startActionTransition] = useTransition();
  const squadDropdownRef = useRef<HTMLDivElement | null>(null);

  // Countdown state (target: Sept 19, 2026, 8:00 PM IST)
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 77, minutes: 22, seconds: 59 });

  // Handle outside click & escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (squadDropdownRef.current && !squadDropdownRef.current.contains(e.target as Node)) {
        setSquadDropdownOpen(false);
        setSquadSubView(null);
        setLeaveConfirming(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setSquadDropdownOpen(false);
        setSquadSubView(null);
        setLeaveConfirming(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Countdown timer logic
  useEffect(() => {
    setMounted(true);
    const targetDate = new Date("2026-09-19T20:00:00+05:30").getTime();

    const updateTimer = () => {
      const diff = Math.max(0, targetDate - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3000);
  };

  const copyTeamCode = async () => {
    try {
      await navigator.clipboard?.writeText(team.code);
      showToast(`Team code ${team.code} copied!`, "success");
    } catch {
      showToast(`Team code: ${team.code}`, "info");
    }
  };

  const isLeader = Boolean(participant.isLeader);

  const handleSaveSubmission = () => {
    if (!isLeader) {
      showToast("Only the Team Leader can submit project reviews.", "error");
      return;
    }
    startSaveTransition(async () => {
      const res = await saveSubmissionAction({
        teamId: team.id,
        track: selectedTrack,
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        githubLink: githubLink.trim(),
        figmaLink: figmaLink.trim(),
        deckLink: deckLink.trim(),
        otherLinks: otherLinks.trim(),
        progressNote: progressNote.trim(),
      });

      if (res.success) {
        showToast(res.message || "Submission saved successfully!", "success");
      } else {
        showToast(res.message || "Failed to save submission.", "error");
      }
    });
  };

  const handleKickMember = (memberId: string, memberType: "vit" | "external", memberName: string) => {
    startActionTransition(async () => {
      const res = await removeTeamMemberAction(memberId, memberType);
      if (res.success) {
        showToast(`Removed ${memberName}`, "success");
        setSquadDropdownOpen(false);
        setSquadSubView(null);
        setTimeout(() => router.refresh(), 800);
      } else {
        showToast(res.error || "Failed to remove member", "error");
      }
    });
  };

  const handleTransferLeadership = () => {
    if (!selectedNewLeader) return;
    const [id, type] = selectedNewLeader.split("|");
    if (!id || (type !== "vit" && type !== "external")) return;

    startActionTransition(async () => {
      const res = await transferLeadershipAction(id, type as "vit" | "external");
      if (res.success) {
        showToast("Leadership transferred!", "success");
        setSquadDropdownOpen(false);
        setSquadSubView(null);
        setTimeout(() => router.refresh(), 800);
      } else {
        showToast(res.error || "Failed to transfer leadership", "error");
      }
    });
  };

  const handleDeleteTeam = () => {
    startActionTransition(async () => {
      const res = await deleteTeamAction();
      if (res.success) {
        showToast("Team deleted", "info");
        setSquadDropdownOpen(false);
        setSquadSubView(null);
        setTimeout(() => router.push("/onboarding"), 1000);
      } else {
        showToast(res.error || "Failed to delete team", "error");
      }
    });
  };

  const handleLeaveTeam = () => {
    startActionTransition(async () => {
      const res = await leaveTeamAction();
      if (res.success) {
        showToast("Left team. Redirecting...", "info");
        setSquadDropdownOpen(false);
        setLeaveConfirming(false);
        setTimeout(() => router.push("/onboarding?step=team-type"), 1000);
      } else {
        showToast(res.error || "Failed to leave team", "error");
      }
    });
  };

  const moveTab = (direction: -1 | 1) => {
    const tabs: TabType[] = ["details", "links", "progress"];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = Math.min(tabs.length - 1, Math.max(0, currentIndex + direction));
    setActiveTab(tabs[nextIndex]);
  };

  const firstName = (participant.name || "Hacker").split(" ")[0] || "Hacker";
  const userInitial = ((participant.name || "A").charAt(0) || "A").toUpperCase();

  const cleanTeamName = team.name.toUpperCase().startsWith("TEAM")
    ? team.name.replace(/^TEAM\s*/i, "")
    : team.name;

  // Member circle colors matching Figma: Leader (#bfea88), cyan (#74d4f0), pink (#fdbbff), red (#ff4337), yellow (#f4e460)
  const memberCircleBgs = ["#74d4f0", "#fdbbff", "#ff4337", "#f4e460", "#74d4f0"];

  return (
    <div className="min-h-screen w-full bg-black text-white font-['Rotonto',sans-serif] font-light max-w-[1380px] mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-6 flex flex-col justify-between overflow-x-hidden">
      {/* ── Top Bar: Brand Logo & User Profile ────────────── */}
      <header className="flex items-center justify-between w-full mb-4 sm:mb-6">
        <Link
          href="/"
          className="w-[140px] md:w-[170px] h-[38px] md:h-[48px] relative block"
          aria-label="VinHack Home"
        >
          <Image
            src="/figma/logo-red.svg"
            alt="VinHack"
            fill
            priority
            className="object-contain object-left"
          />
        </Link>

        {/* Profile Button on Right */}
        <div className="relative" ref={profileMenuRef}>
          <button
            className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-neutral-900 border border-transparent hover:border-[#666060] transition cursor-pointer"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="User profile menu"
            aria-expanded={profileDropdownOpen}
          >
            <span className="w-10 h-10 rounded-full bg-[#fa1a1d] text-white font-light flex items-center justify-center text-base shrink-0">
              {userInitial}
            </span>
            <span className="text-base sm:text-lg text-white font-light truncate max-w-[180px]">
              {participant.name}
            </span>
            <ChevronDown
              size={18}
              className={`text-white font-light transition-transform duration-200 ${
                profileDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[#0e0e0e] border border-[#666060] rounded p-2.5 shadow-2xl z-50 flex flex-col gap-1"
              role="menu"
            >
              <div className="px-2 py-1.5 border-b border-[#666060]/50 mb-1">
                <strong className="block text-sm text-white font-light">{participant.name}</strong>
                <span className="block text-xs text-[#9a9898] truncate font-light">{participant.email}</span>
                {participant.regNo && (
                  <small className="block text-[11px] text-[#bfea88] mt-0.5 font-light">
                    Reg No: {participant.regNo}
                  </small>
                )}
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs sm:text-sm transition font-light"
                role="menuitem"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <UserRound size={15} />
                <span>Profile & Settings</span>
              </Link>

              <Link
                href="/timeline"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs sm:text-sm transition font-light"
                role="menuitem"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <CalendarDays size={15} />
                <span>Event Timeline</span>
              </Link>

              <Link
                href="/help"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs sm:text-sm transition font-light"
                role="menuitem"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <HelpCircle size={15} />
                <span>Help & Support</span>
              </Link>

              <button
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#fa1a1d] hover:text-red-300 hover:bg-red-500/10 border-t border-[#666060]/50 mt-1 pt-2 text-xs sm:text-sm transition cursor-pointer text-left w-full font-light"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Welcome Heading ───────────────────────────────── */}
      <section className="mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-light tracking-tight leading-tight m-0 text-white">
          Hey <span className="text-[#bfea88] font-light">{firstName} !</span>
        </h1>
        <p className="text-xs sm:text-sm lg:text-[14px] font-light text-[#9a9898] mt-1">
          Build. Submit. Get Feedback. Keep Going.
        </p>
      </section>

      {/* ── 2x2 Dashboard Card Grid ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch flex-1">
        {/* ── LEFT COLUMN (Team + Submit) ─────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
          {/* ── CARD 1: TEAM CARD (Top Left) ──────────────── */}
          <section className="bg-black border border-[#666060] p-4 sm:p-6 relative flex flex-col justify-between min-h-[193px] sm:min-h-[220px]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-light tracking-tight text-white m-0">
                  <span className="font-light">TEAM </span>
                  <span className="font-light">{cleanTeamName}</span>
                </h2>
                <p className="text-sm sm:text-base lg:text-[18px] text-white mt-1.5 mb-0 font-light">
                  Team Code : <span className="text-[#fa1a1d] font-light ml-1">{team.code}</span>
                </p>
              </div>

              {/* Rotated Ticket Stamp Badge (Top Right) */}
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-5 w-[100px] sm:w-[125px] aspect-[136/106] -rotate-[8.3deg] hover:rotate-0 hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col items-center justify-center select-none"
                onClick={copyTeamCode}
                title="Click to copy team code"
                aria-label={`Copy team code ${team.code}`}
              >
                {/* SVG stamp given by user */}
                <Image
                  src="/dashboard_teamno.svg"
                  alt="Team Capacity"
                  fill
                  className="object-contain pointer-events-none"
                  priority
                />
                <span className="relative z-10 font-light text-xl sm:text-2xl lg:text-[28px] text-[#2849cb] leading-none">
                  {team.members.length}/{team.capacity}
                </span>
                <span className="relative z-10 font-light text-[10px] sm:text-[12px] text-[#2849cb] mt-0.5">
                  Members
                </span>
              </button>
            </div>

            {/* Member Circles & QR Code Row */}
            <div className="flex items-center justify-between mt-5 sm:mt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                {team.members.map((m, idx) => {
                  const initial = (m.name.charAt(0) || "M").toUpperCase();
                  if (m.isLeader) {
                    return (
                      <div
                        key={m.id}
                        className="relative flex items-center justify-center w-[43px] h-[43px] mr-1.5 shrink-0"
                        title={`${m.name} (Team Leader)`}
                      >
                        {/* Orbiting Rotating Leader Badge Text */}
                        <svg
                          className="absolute -top-[11.5px] -left-[11.5px] w-[66px] h-[66px] pointer-events-none animate-[spin_25s_linear_infinite] origin-center overflow-visible"
                          viewBox="0 0 100 100"
                        >
                          <path
                            id={`orbitPath-${m.id}`}
                            d="M 50, 50 m -40.5, 0 a 40.5,40.5 0 1,1 81,0 a 40.5,40.5 0 1,1 -81,0"
                            fill="none"
                          />
                          <text
                            fill="#bfea88"
                            fontSize="7.5"
                            fontWeight="700"
                            letterSpacing="1.5"
                            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                          >
                            <textPath href={`#orbitPath-${m.id}`}>
                              TEAM LEADER • TEAM LEADER • TEAM LEADER •{" "}
                            </textPath>
                          </text>
                        </svg>
                        {/* Leader Center Circle */}
                        <div className="w-[43px] h-[43px] rounded-full bg-[#bfea88] flex items-center justify-center relative z-10 shadow-sm">
                          <span className="text-black font-light text-xl">
                            {initial}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const bubbleBg = memberCircleBgs[(idx - 1) % memberCircleBgs.length] || "#74d4f0";
                  return (
                    <div
                      key={m.id}
                      className="w-[43px] h-[43px] rounded-full flex items-center justify-center font-light text-xl text-black shadow-sm"
                      style={{ backgroundColor: bubbleBg }}
                      title={`${m.name} (${m.type.toUpperCase()})`}
                    >
                      <span>{initial}</span>
                    </div>
                  );
                })}
              </div>

              {/* QR Code on Right */}
              <div
                className="w-[63px] h-[63px] flex items-center justify-center cursor-pointer hover:scale-105 transition shrink-0"
                onClick={copyTeamCode}
                title="Team QR Code"
              >
                <ClientQrCode
                  value={team.code}
                  size={63}
                  darkColor="#ffffff"
                  lightColor="#000000"
                />
              </div>
            </div>

            {/* Manage Squad Dropdown Button */}
            <div className="relative mt-3" ref={squadDropdownRef}>
              <button
                type="button"
                className="text-[12px] text-[#9a9898] hover:text-white cursor-pointer transition flex items-center gap-1.5 font-light py-1"
                onClick={() => {
                  setSquadDropdownOpen((v) => !v);
                  setSquadSubView(null);
                  setLeaveConfirming(false);
                }}
                aria-expanded={squadDropdownOpen}
              >
                <Shield size={12} className="text-[#9a9898]" />
                <span>Manage Squad</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    squadDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Floating Dropdown Menu */}
              {squadDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-[#0e0e0e] border border-[#666060] rounded-md p-3 shadow-2xl z-40 animate-[fadeIn_0.15s_ease-out] font-light text-white">
                  <div className="text-[11px] uppercase tracking-wider text-[#9a9898] pb-2 border-b border-[#666060]/50 mb-2 flex items-center justify-between">
                    <span>Squad Settings</span>
                    <span className="text-[10px] text-neutral-500">
                      {isLeader ? "Team Leader" : "Teammate"}
                    </span>
                  </div>

                  {isLeader ? (
                    // ── Leader Side ──────────────────────────────────────
                    <>
                      {squadSubView === null && (
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => setSquadSubView("kick")}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-neutral-800 text-xs transition cursor-pointer text-left text-neutral-200 hover:text-white"
                          >
                            <span className="flex items-center gap-2">
                              <UserMinus size={14} className="text-[#74d4f0]" />
                              <span>Kick Member</span>
                            </span>
                            <ChevronRight size={13} className="text-neutral-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSquadSubView("transfer")}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-neutral-800 text-xs transition cursor-pointer text-left text-neutral-200 hover:text-white"
                          >
                            <span className="flex items-center gap-2">
                              <Shield size={14} className="text-[#bfea88]" />
                              <span>Change Team Lead</span>
                            </span>
                            <ChevronRight size={13} className="text-neutral-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSquadSubView("delete")}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-red-500/10 text-xs transition cursor-pointer text-left text-[#fa1a1d] hover:text-red-400 mt-1 pt-2 border-t border-[#666060]/40"
                          >
                            <span className="flex items-center gap-2">
                              <Trash2 size={14} className="text-[#fa1a1d]" />
                              <span>Delete Team</span>
                            </span>
                            <ChevronRight size={13} className="text-neutral-500" />
                          </button>
                        </div>
                      )}

                      {/* Sub-view: Kick Member */}
                      {squadSubView === "kick" && (
                        <div className="animate-[fadeIn_0.15s_ease-out]">
                          <button
                            type="button"
                            onClick={() => setSquadSubView(null)}
                            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 mb-2.5 cursor-pointer"
                          >
                            <ArrowLeft size={12} /> Back to options
                          </button>
                          <div className="text-xs font-medium text-white mb-2">
                            Kick a member
                          </div>
                          {team.members.filter((m) => !m.isLeader).length === 0 ? (
                            <p className="text-[11px] text-neutral-400 italic py-2">
                              No other members in the squad to remove.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                              {team.members
                                .filter((m) => !m.isLeader)
                                .map((m) => (
                                  <div
                                    key={m.id}
                                    className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded text-xs"
                                  >
                                    <div className="flex flex-col truncate mr-2">
                                      <span className="text-white font-medium truncate">
                                        {m.name}
                                      </span>
                                      <span className="text-[10px] text-neutral-500 truncate">
                                        {m.email}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-2.5 py-1 rounded text-[11px] transition cursor-pointer shrink-0 disabled:opacity-40"
                                      disabled={isActionPending}
                                      onClick={() => handleKickMember(m.id, m.type, m.name)}
                                    >
                                      Kick
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-view: Change Team Lead */}
                      {squadSubView === "transfer" && (
                        <div className="animate-[fadeIn_0.15s_ease-out]">
                          <button
                            type="button"
                            onClick={() => setSquadSubView(null)}
                            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 mb-2.5 cursor-pointer"
                          >
                            <ArrowLeft size={12} /> Back to options
                          </button>
                          <div className="text-xs font-medium text-white mb-2">
                            Change Team Lead
                          </div>
                          {team.members.filter((m) => !m.isLeader).length === 0 ? (
                            <p className="text-[11px] text-neutral-400 italic py-2">
                              No other members in the squad to transfer leadership to.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <select
                                value={selectedNewLeader}
                                onChange={(e) => setSelectedNewLeader(e.target.value)}
                                className="w-full bg-black border border-neutral-700 text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              >
                                <option value="">Select new team lead...</option>
                                {team.members
                                  .filter((m) => !m.isLeader)
                                  .map((m) => (
                                    <option key={m.id} value={`${m.id}|${m.type}`}>
                                      {m.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                className="w-full bg-[#74d4f0] text-black font-semibold text-xs py-1.5 rounded hover:bg-[#8ee0f7] disabled:opacity-40 transition cursor-pointer"
                                disabled={!selectedNewLeader || isActionPending}
                                onClick={handleTransferLeadership}
                              >
                                {isActionPending ? "Transferring..." : "Confirm Leadership Transfer"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-view: Delete Team */}
                      {squadSubView === "delete" && (
                        <div className="animate-[fadeIn_0.15s_ease-out]">
                          <button
                            type="button"
                            onClick={() => setSquadSubView(null)}
                            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 mb-2.5 cursor-pointer"
                          >
                            <ArrowLeft size={12} /> Back to options
                          </button>
                          <div className="text-xs font-medium text-red-400 mb-1">
                            Delete Team Permanently
                          </div>
                          <p className="text-[11px] text-neutral-400 mb-3">
                            This action cannot be undone. All squad members will be removed and the team will be deleted.
                          </p>
                          <button
                            type="button"
                            className="w-full bg-[#fa1a1d] text-white text-xs py-1.5 rounded hover:bg-[#ff383f] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                            disabled={isActionPending}
                            onClick={handleDeleteTeam}
                          >
                            <Trash2 size={13} />
                            {isActionPending ? "Deleting..." : "Permanently Delete Team"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // ── Teammates Side ────────────────────────────────────
                    <>
                      {!leaveConfirming ? (
                        <button
                          type="button"
                          onClick={() => setLeaveConfirming(true)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-red-500/10 text-xs transition cursor-pointer text-left text-[#fa1a1d] hover:text-red-400"
                        >
                          <span className="flex items-center gap-2">
                            <UserMinus size={14} className="text-[#fa1a1d]" />
                            <span>Leave Team</span>
                          </span>
                          <ChevronRight size={13} className="text-neutral-500" />
                        </button>
                      ) : (
                        <div className="animate-[fadeIn_0.15s_ease-out]">
                          <div className="text-xs font-medium text-white mb-1">
                            Leave {team.name}?
                          </div>
                          <p className="text-[11px] text-neutral-400 mb-3">
                            You will be removed from this team and can join or create another team.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs py-1.5 rounded transition cursor-pointer"
                              onClick={() => setLeaveConfirming(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="flex-1 bg-[#fa1a1d] hover:bg-[#ff383f] text-white text-xs py-1.5 rounded transition cursor-pointer disabled:opacity-50"
                              disabled={isActionPending}
                              onClick={handleLeaveTeam}
                            >
                              {isActionPending ? "Leaving..." : "Yes, Leave"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── CARD 3: SUBMIT FOR REVIEW (Bottom Left) ─────── */}
          <section className="bg-black border border-[#666060] p-4 sm:p-6 relative flex flex-col justify-between min-h-[240px] sm:min-h-[280px]">
            <div className="flex items-center justify-between">
              <div className="text-[#fa1a1d] text-base sm:text-lg lg:text-[20px] font-light tracking-wider uppercase">
                // SUBMIT FOR REVIEW
              </div>
              {!isLeader && (
                <span className="text-[10px] sm:text-[11px] text-[#74d4f0] bg-[#74d4f0]/10 border border-[#74d4f0]/30 px-2.5 py-0.5 rounded-full font-light tracking-normal">
                  View only · Leader submits
                </span>
              )}
            </div>

            {/* Connected Step Tabs Bar */}
            <div className="flex items-center w-full my-3 sm:my-4 overflow-x-auto py-1">
              {/* Tab 1: Project Details */}
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                style={{
                  clipPath: activeTab === "details" ? ZIGZAG_CLIP_PATH : "none",
                }}
                className={`bg-[#fa1a1d] text-black font-light text-xs sm:text-sm lg:text-base h-[40px] sm:h-[47px] flex items-center justify-center transition-all cursor-pointer select-none shrink-0 whitespace-nowrap ${
                  activeTab === "details" ? "px-5 sm:px-6" : "px-3.5 sm:px-5"
                }`}
              >
                Project Details
              </button>

              {/* Connector Line 1 */}
              <div className="flex-1 min-w-[16px] h-[3px] bg-white" />

              {/* Tab 2: Links & Assets */}
              <button
                type="button"
                onClick={() => setActiveTab("links")}
                style={{
                  clipPath: activeTab === "links" ? ZIGZAG_CLIP_PATH : "none",
                }}
                className={`bg-[#bfea88] text-black font-light text-xs sm:text-sm lg:text-base h-[40px] sm:h-[47px] flex items-center justify-center transition-all cursor-pointer select-none shrink-0 whitespace-nowrap ${
                  activeTab === "links" ? "px-5 sm:px-6" : "px-3.5 sm:px-5"
                }`}
              >
                Links & Assets
              </button>

              {/* Connector Line 2 */}
              <div className="flex-1 min-w-[16px] h-[3px] bg-white" />

              {/* Tab 3: Progress Update */}
              <button
                type="button"
                onClick={() => setActiveTab("progress")}
                style={{
                  clipPath: activeTab === "progress" ? ZIGZAG_CLIP_PATH : "none",
                }}
                className={`bg-[#fdbbff] text-black font-light text-xs sm:text-sm lg:text-base h-[40px] sm:h-[47px] flex items-center justify-center transition-all cursor-pointer select-none shrink-0 whitespace-nowrap ${
                  activeTab === "progress" ? "px-5 sm:px-6" : "px-3.5 sm:px-5"
                }`}
              >
                Progress Update
              </button>
            </div>

            {/* Form Content */}
            <div className="min-h-[85px] flex flex-col justify-center">
              {/* Step 1: Project Title & Track */}
              {activeTab === "details" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="proj-title"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light"
                    >
                      Project Title<span className="text-[#fa1a1d] ml-0.5">*</span>
                    </label>
                    <input
                      id="proj-title"
                      type="text"
                      value={projectTitle}
                      onChange={(e) => isLeader && setProjectTitle(e.target.value)}
                      readOnly={!isLeader}
                      placeholder={isLeader ? "" : (projectTitle || "Not submitted yet")}
                      className={`bg-black border border-[#666060] text-white px-3.5 h-[51px] text-sm sm:text-base w-full focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                        isLeader ? "focus:border-[#74d4f0]" : "cursor-default opacity-85"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="proj-track"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light"
                    >
                      Track<span className="text-[#fa1a1d] ml-0.5">*</span>
                    </label>
                    <div className="relative w-full">
                      <select
                        id="proj-track"
                        value={selectedTrack}
                        onChange={(e) => isLeader && setSelectedTrack(e.target.value)}
                        disabled={!isLeader}
                        className={`bg-black border border-[#666060] text-white px-3.5 pr-10 h-[51px] text-sm sm:text-base w-full appearance-none transition font-['Rotonto',sans-serif] font-light ${
                          isLeader ? "cursor-pointer focus:outline-none focus:border-[#74d4f0]" : "cursor-default opacity-85"
                        }`}
                      >
                        {TRACK_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {isLeader && (
                        <ChevronDown
                          size={18}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label
                      htmlFor="proj-description"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light"
                    >
                      Project Description<span className="text-[#fa1a1d] ml-0.5">*</span>
                    </label>
                    <textarea
                      id="proj-description"
                      rows={3}
                      maxLength={FIELD_LIMITS.projectDescription}
                      value={projectDescription}
                      onChange={(e) => isLeader && setProjectDescription(e.target.value)}
                      readOnly={!isLeader}
                      placeholder={
                        isLeader
                          ? "What does your project do, and what problem does it solve?"
                          : (projectDescription || "Not submitted yet")
                      }
                      className={`bg-black border border-[#666060] text-white px-3.5 py-3 text-sm sm:text-base w-full min-h-[96px] focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                        isLeader ? "resize-y focus:border-[#74d4f0]" : "resize-none cursor-default opacity-85"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: 4 link columns */}
              {activeTab === "links" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="github-link"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light truncate"
                    >
                      Github Link<span className="text-[#fa1a1d] ml-0.5">*</span>
                    </label>
                    <input
                      id="github-link"
                      type="url"
                      value={githubLink}
                      onChange={(e) => isLeader && setGithubLink(e.target.value)}
                      readOnly={!isLeader}
                      placeholder={isLeader ? "" : (githubLink || "Not provided")}
                      className={`bg-black border border-[#666060] text-white px-3 h-[51px] text-sm sm:text-base w-full focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                        isLeader ? "focus:border-[#74d4f0]" : "cursor-default opacity-85"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="figma-link"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light truncate"
                    >
                      Figma Link<span className="text-[#fa1a1d] ml-0.5">*</span>
                    </label>
                    <input
                      id="figma-link"
                      type="url"
                      value={figmaLink}
                      onChange={(e) => isLeader && setFigmaLink(e.target.value)}
                      readOnly={!isLeader}
                      placeholder={isLeader ? "" : (figmaLink || "Not provided")}
                      className={`bg-black border border-[#666060] text-white px-3 h-[51px] text-sm sm:text-base w-full focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                        isLeader ? "focus:border-[#74d4f0]" : "cursor-default opacity-85"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="ppt-link"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light truncate"
                    >
                      PPT Link<span className="text-[#fa1a1d] ml-0.5">*</span>
                    </label>
                    <input
                      id="ppt-link"
                      type="url"
                      value={deckLink}
                      onChange={(e) => isLeader && setDeckLink(e.target.value)}
                      readOnly={!isLeader}
                      placeholder={isLeader ? "" : (deckLink || "Not provided")}
                      className={`bg-black border border-[#666060] text-white px-3 h-[51px] text-sm sm:text-base w-full focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                        isLeader ? "focus:border-[#74d4f0]" : "cursor-default opacity-85"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="other-links"
                      className="text-sm sm:text-base lg:text-[18px] text-white font-light truncate"
                    >
                      Any other links
                    </label>
                    <input
                      id="other-links"
                      type="url"
                      value={otherLinks}
                      onChange={(e) => isLeader && setOtherLinks(e.target.value)}
                      readOnly={!isLeader}
                      placeholder={isLeader ? "" : (otherLinks || "Not provided")}
                      className={`bg-black border border-[#666060] text-white px-3 h-[51px] text-sm sm:text-base w-full focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                        isLeader ? "focus:border-[#74d4f0]" : "cursor-default opacity-85"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Full-width update input */}
              {activeTab === "progress" && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label
                    htmlFor="progress-note"
                    className="text-sm sm:text-base lg:text-[18px] text-white font-light"
                  >
                    What has changed since the last review ?<span className="text-[#fa1a1d] ml-0.5">*</span>
                  </label>
                  <input
                    id="progress-note"
                    type="text"
                    value={progressNote}
                    onChange={(e) => isLeader && setProgressNote(e.target.value)}
                    readOnly={!isLeader}
                    placeholder={isLeader ? "" : (progressNote || "No updates submitted yet")}
                    className={`bg-black border border-[#666060] text-white px-3.5 h-[51px] text-sm sm:text-base w-full focus:outline-none transition font-['Rotonto',sans-serif] font-light ${
                      isLeader ? "focus:border-[#74d4f0]" : "cursor-default opacity-85"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Pager Controls and Submit Action on Bottom Right */}
            <div className="flex items-center justify-end gap-3 mt-4">
              {activeTab !== "progress" ? (
                <>
                  <button
                    type="button"
                    className="w-[44px] h-[44px] rounded-full bg-[#74d4f0] text-black flex items-center justify-center hover:bg-[#60caf0] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shrink-0"
                    onClick={() => moveTab(-1)}
                    disabled={activeTab === "details"}
                    aria-label="Previous step"
                  >
                    <ArrowLeft size={20} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="w-[44px] h-[44px] rounded-full bg-[#74d4f0] text-black flex items-center justify-center hover:bg-[#60caf0] transition cursor-pointer shrink-0"
                    onClick={() => moveTab(1)}
                    aria-label="Next step"
                  >
                    <ArrowRight size={20} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-[44px] h-[44px] rounded-full bg-[#74d4f0] text-black flex items-center justify-center hover:bg-[#60caf0] transition cursor-pointer shrink-0"
                    onClick={() => moveTab(-1)}
                    aria-label="Previous step"
                  >
                    <ArrowLeft size={20} strokeWidth={2} />
                  </button>
                  {isLeader ? (
                    <button
                      type="button"
                      onClick={handleSaveSubmission}
                      disabled={isSaving}
                      className="h-[44px] px-8 rounded-full bg-[#74d4f0] hover:bg-[#60caf0] text-black font-light text-sm sm:text-base uppercase tracking-wider transition cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                      {isSaving ? "SUBMITTING..." : "SUBMIT"}
                    </button>
                  ) : (
                    <div
                      className="h-[44px] px-6 rounded-full bg-neutral-900 border border-neutral-700 text-[#9a9898] font-light text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center shrink-0 cursor-not-allowed select-none"
                      title="Only the Team Leader can submit or update project reviews"
                    >
                      Leader Submits
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN (Quick Actions + Stack) ─────────── */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
          {/* ── CARD 2: QUICK ACTIONS (Top Right) ─────────── */}
          <section className="bg-black border border-[#666060] p-4 sm:p-6 relative flex flex-col justify-between min-h-[193px] sm:min-h-[220px]">
            <div className="text-[#fa1a1d] text-base sm:text-lg lg:text-[20px] font-light tracking-wider uppercase">
              // QUICK ACTIONS
            </div>

            <div className="flex items-center justify-between gap-2.5 sm:gap-3.5 mt-3 flex-1">
              {/* Note 1: Pink - View Timeline */}
              <Link
                className="flex-1 bg-[#fdbbff] -rotate-4 hover:rotate-0 hover:-translate-y-1.5 p-3 rounded-none shadow-lg hover:shadow-2xl transition duration-200 flex flex-col items-center justify-center text-black min-h-[110px] sm:min-h-[125px]"
                href="/timeline"
              >
                <div className="mb-2">
                  <CalendarDays size={28} strokeWidth={2} />
                </div>
                <span className="font-light text-xs sm:text-sm lg:text-base text-center leading-tight">
                  View Timeline
                </span>
              </Link>

              {/* Note 2: Cyan - View Tracks */}
              <Link
                className="flex-1 bg-[#74d4f0] rotate-3 hover:rotate-0 hover:-translate-y-1.5 p-3 rounded-none shadow-lg hover:shadow-2xl transition duration-200 flex flex-col items-center justify-center text-black min-h-[110px] sm:min-h-[125px]"
                href="/tracks"
              >
                <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center mb-2">
                  <Send size={16} strokeWidth={2} />
                </div>
                <span className="font-light text-xs sm:text-sm lg:text-base text-center leading-tight">
                  View Tracks
                </span>
              </Link>

              {/* Note 3: Lime - Ask for help */}
              <Link
                className="flex-1 bg-[#bfea88] -rotate-2 hover:rotate-0 hover:-translate-y-1.5 p-3 rounded-none shadow-lg hover:shadow-2xl transition duration-200 flex flex-col items-center justify-center text-black min-h-[110px] sm:min-h-[125px]"
                href="/help"
              >
                <div className="mb-2">
                  <HelpCircle size={30} strokeWidth={2} />
                </div>
                <span className="font-light text-xs sm:text-sm lg:text-base text-center leading-tight">
                  Ask for help
                </span>
              </Link>
            </div>
          </section>

          {/* ── RIGHT STACK (Memories & Countdown) ──────────── */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Card 4: memories @ Vinhack */}
            <section className="bg-black border border-[#666060] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between min-h-[89px]">
              <div className="relative w-[180px] sm:w-[219px] h-[55px] sm:h-[66px]">
                <Image
                  src="/memories_vinhack.svg"
                  alt="memories @ VinHack"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>

              <Link
                className="bg-[#fa1a1d] text-black font-light text-sm sm:text-[15px] h-[44px] px-6 rounded-full hover:scale-105 transition flex items-center justify-center gap-1.5 shrink-0"
                href="/memories?from=dashboard"
              >
                <span>CAPTURE NOW →</span>
              </Link>
            </section>

            {/* Card 5: // VINHACK LIVE Countdown */}
            <section className="bg-black border border-[#666060] p-4 sm:p-5 flex flex-col justify-between min-h-[175px] sm:min-h-[185px]">
              <div className="text-right text-[#fa1a1d] text-lg sm:text-xl lg:text-[24px] font-light tracking-wider uppercase mb-2">
                // VINHACK LIVE
              </div>

              <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl lg:text-[55px] font-light text-white tabular-nums leading-none">
                    {mounted ? String(timeLeft.hours).padStart(2, "0") : "77"}
                  </span>
                  <span className="text-xs sm:text-base lg:text-[24px] text-[#9a9898] uppercase tracking-widest mt-2 font-light">
                    HOURS
                  </span>
                </div>

                <span className="text-3xl sm:text-5xl text-white font-light mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl lg:text-[55px] font-light text-white tabular-nums leading-none">
                    {mounted ? String(timeLeft.minutes).padStart(2, "0") : "22"}
                  </span>
                  <span className="text-xs sm:text-base lg:text-[24px] text-[#9a9898] uppercase tracking-widest mt-2 font-light">
                    MINS
                  </span>
                </div>

                <span className="text-3xl sm:text-5xl text-white font-light mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl lg:text-[55px] font-light text-white tabular-nums leading-none">
                    {mounted ? String(timeLeft.seconds).padStart(2, "0") : "59"}
                  </span>
                  <span className="text-xs sm:text-base lg:text-[24px] text-[#9a9898] uppercase tracking-widest mt-2 font-light">
                    SECS
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="flex flex-col sm:flex-row items-start sm:items-end justify-between pt-6 mt-auto gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl lg:text-[40px] text-[#fa1a1d] font-light tracking-tight leading-none">
              solve what matters
            </span>
            <svg
              width="32"
              height="34"
              viewBox="0 0 40.2117 44.5"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M20.325 19V0M23.825 21L38.825 11M23.825 24.5L38.825 33.5M20.325 26.5V44.5M17.325 24.5L1.325 33.5M17.325 21L1.325 11"
                stroke="#fa1a1d"
                strokeWidth="4"
              />
            </svg>
          </div>

          {/* 5-Color Progress Segment Bar (from Figma: #ea4238, #2849cb, #74d4f0, #bfea88, #e2b5f0) */}
          <div className="flex w-[280px] sm:w-[380px] md:w-[480px] h-3 overflow-hidden">
            <div className="flex-1 bg-[#ea4238]" />
            <div className="flex-1 bg-[#2849cb]" />
            <div className="flex-1 bg-[#74d4f0]" />
            <div className="flex-1 bg-[#bfea88]" />
            <div className="flex-1 bg-[#e2b5f0]" />
          </div>
        </div>

        <div className="text-[#9a9898] font-light text-sm sm:text-base lg:text-[20px]">
          made with &lt;3 by VinnovateIT
        </div>
      </footer>

      {/* ── Floating Notification Toast ───────────────────── */}
      {notice && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs sm:text-sm font-light flex items-center gap-2 shadow-2xl z-50 animate-[bounce_0.3s_ease-out] ${
            notice.type === "error"
              ? "bg-[#fa1a1d] text-white"
              : notice.type === "info"
              ? "bg-[#74d4f0] text-black"
              : "bg-[#bfea88] text-black"
          }`}
          role="status"
        >
          {notice.type === "success" && <CheckCircle2 size={15} />}
          {notice.type === "error" && <AlertTriangle size={15} />}
          <span>{notice.message}</span>
        </div>
      )}
    </div>
  );
}