"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  HelpCircle,
  ImagePlus,
  LogOut,
  Menu,
  Send,
  Shield,
  Trash2,
  UserRound,
  Users,
  X,
  CheckCircle2,
} from "lucide-react";
import { saveSubmissionAction } from "@/app/dashboard/actions";
import { transferLeadershipAction, deleteTeamAction } from "@/app/onboarding/actions";


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

export default function DashboardShell({
  participant,
  team,
  initialTrack = "",
}: DashboardShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<"Project Details" | "Links & Assets" | "Progress Update">("Project Details");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form state
  const [projectTitle, setProjectTitle] = useState(team.submission?.title || "");
  const [projectDescription, setProjectDescription] = useState(team.submission?.description || "");
  const [selectedTrack, setSelectedTrack] = useState(initialTrack || team.track || "Industry 6.0");
  const [githubLink, setGithubLink] = useState(team.submission?.githubLink || "");
  const [figmaLink, setFigmaLink] = useState(team.submission?.figmaLink || "");
  const [deckLink, setDeckLink] = useState(team.submission?.deckLink || "");
  const [otherLinks, setOtherLinks] = useState(team.submission?.otherLinks || "");
  const [progressStatus, setProgressStatus] = useState("In progress");
  const [teamConfidence, setTeamConfidence] = useState("Feeling good");
  const [progressNote, setProgressNote] = useState(team.submission?.progressNote || "");

  // Leader management state
  const [showLeaderActions, setShowLeaderActions] = useState(false);
  const [showTransferPicker, setShowTransferPicker] = useState(false);
  const [selectedNewLeader, setSelectedNewLeader] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLeaderActionPending, startLeaderTransition] = useTransition();


  // Real countdown state (target: Sept 18, 2026, 2:00 PM IST)
  const [timeLeft, setTimeLeft] = useState({ hours: 74, minutes: 22, seconds: 15 });

  useEffect(() => {
    const targetDate = new Date("2026-09-18T14:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const copyTeamCode = async () => {
    try {
      await navigator.clipboard?.writeText(team.code);
      setCopied(true);
      showNotice(`Team code ${team.code} copied!`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showNotice(`Team code: ${team.code}`);
    }
  };

  const moveStep = (direction: -1 | 1) => {
    const steps: Array<"Project Details" | "Links & Assets" | "Progress Update"> = [
      "Project Details",
      "Links & Assets",
      "Progress Update",
    ];
    const currentIndex = steps.indexOf(activeStep);
    const nextIndex = Math.min(steps.length - 1, Math.max(0, currentIndex + direction));
    setActiveStep(steps[nextIndex]);
  };

  const handleSaveSubmission = () => {
    startTransition(async () => {
      const fullNote = [
        `[Status: ${progressStatus}]`,
        `[Confidence: ${teamConfidence}]`,
        progressNote.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      const res = await saveSubmissionAction({
        teamId: team.id,
        track: selectedTrack,
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        githubLink: githubLink.trim(),
        figmaLink: figmaLink.trim(),
        deckLink: deckLink.trim(),
        otherLinks: otherLinks.trim(),
        progressNote: fullNote,
      });

      if (res.success) {
        showNotice(res.message);
      } else {
        showNotice(res.message || "Failed to save submission");
      }
    });
  };

  const handleTransferLeadership = () => {
    if (!selectedNewLeader) return;
    const [id, type] = selectedNewLeader.split("|");
    if (!id || (type !== "vit" && type !== "external")) return;

    startLeaderTransition(async () => {
      const res = await transferLeadershipAction(id, type as "vit" | "external");
      if (res.success) {
        showNotice("Leadership transferred! Refreshing...");
        setTimeout(() => router.refresh(), 1200);
      } else {
        showNotice(res.error || "Failed to transfer leadership.");
      }
      setShowTransferPicker(false);
      setShowLeaderActions(false);
    });
  };

  const handleDeleteTeam = () => {
    startLeaderTransition(async () => {
      const res = await deleteTeamAction();
      if (res.success) {
        showNotice("Team deleted. Redirecting...");
        setTimeout(() => router.push("/onboarding"), 1200);
      } else {
        showNotice(res.error || "Failed to delete team.");
      }
      setShowDeleteConfirm(false);
      setShowLeaderActions(false);
    });
  };



  const firstName = participant.name.split(" ")[0] || "Hacker";
  const userInitial = (participant.name.charAt(0) || "P").toUpperCase();

  const colorClasses = ["blue", "pink", "red", "yellow"];

  return (
    <div className="dashboard-shell">
      {/* Top Header */}
      <header className="dashboard-header">
        <button
          className="mobile-menu"
          aria-label="Open navigation menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={22} />
        </button>

        <Link className="dashboard-logo" href="/dashboard" aria-label="VinHack dashboard">
          Vinhack
        </Link>

        {/* Profile menu container (Desktop) */}
        <div className="profile-menu-container">
          <button
            className="profile-menu"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="Open user profile menu"
            aria-expanded={profileDropdownOpen}
          >
            <span className="profile-avatar">
              {participant.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={participant.image} alt={participant.name} />
              ) : (
                userInitial
              )}
            </span>
            <span className="profile-name">{participant.name}</span>
            <ChevronDown size={18} />
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="dropdown-user-info">
                <strong>{participant.name}</strong>
                <span>{participant.email}</span>
                {participant.regNo && <span>Reg: {participant.regNo}</span>}
              </div>

              <Link
                href="/profile"
                className="dropdown-link"
                role="menuitem"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <UserRound size={16} /> Profile & Settings
              </Link>
              <Link
                href="/help"
                className="dropdown-link"
                role="menuitem"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <HelpCircle size={16} /> Help Center
              </Link>
              <button
                className="dropdown-signout"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area (100% Fluid Ratio) */}
      <main className="dashboard-content">
        {/* Welcome Row */}
        <section className="welcome-row">
          <div>
            <p className="dashboard-kicker">// participant workspace</p>
            <h1>
              Hey <span>{firstName}!</span>
            </h1>
            <p className="welcome-copy">Build. Submit. Get Feedback. Keep Going.</p>
          </div>
          <button
            className="mobile-profile"
            aria-label="Open profile"
            onClick={() => setMenuOpen(true)}
          >
            <UserRound size={20} />
          </button>
        </section>

        {/* Two-Column Grid */}
        <div className="dashboard-grid">
          {/* Top Left: Team Card */}
          <section className="team-panel dashboard-panel">
            <div className="panel-title">
              <span>// your team</span>
              <Users size={18} />
            </div>

            <div className="team-heading">
              <div>
                <h2>{team.name}</h2>
                <p>
                  Team Code: <strong>{team.code}</strong>
                </p>
              </div>

              <button
                className="member-ticket"
                onClick={copyTeamCode}
                aria-label={`Copy team code ${team.code}`}
                title="Click to copy team code"
              >
                <strong>
                  {team.members.length}/{team.capacity}
                </strong>
                <span>Members</span>
                <Copy size={14} />
              </button>
            </div>

            <div className="team-members">
              {team.members.map((member, idx) => {
                const isLeader = member.isLeader;
                const colorClass = isLeader ? "leader" : colorClasses[idx % colorClasses.length];
                const initial = (member.name.charAt(0) || "M").toUpperCase();

                return (
                  <div
                    key={member.id}
                    className={`member ${colorClass}`}
                    title={`${member.name} (${member.type.toUpperCase()})${isLeader ? " - Team Leader" : ""}`}
                  >
                    {initial}
                    {isLeader && <small>team leader</small>}
                  </div>
                );
              })}

              <button className="copy-code" onClick={copyTeamCode}>
                {copied ? "Copied!" : "Copy code"}
              </button>
            </div>

            {/* Leader-only management actions */}
            {participant.isLeader && (
              <div className="leader-actions">
                <button
                  className="leader-manage-btn"
                  onClick={() => {
                    setShowLeaderActions((v) => !v);
                    setShowTransferPicker(false);
                    setShowDeleteConfirm(false);
                  }}
                >
                  <Shield size={14} /> Manage Team
                </button>

                {showLeaderActions && (
                  <div className="leader-panel">
                    {/* Transfer leadership */}
                    {!showDeleteConfirm && (
                      <>
                        <button
                          className="leader-action-btn transfer"
                          onClick={() => setShowTransferPicker((v) => !v)}
                        >
                          <Shield size={13} /> Transfer Leadership
                        </button>

                        {showTransferPicker && (
                          <div className="leader-transfer-picker">
                            <select
                              className="select-field"
                              value={selectedNewLeader}
                              onChange={(e) => setSelectedNewLeader(e.target.value)}
                              aria-label="Select new leader"
                            >
                              <option value="">Select a member...</option>
                              {team.members
                                .filter((m) => !m.isLeader)
                                .map((m) => (
                                  <option key={m.id} value={`${m.id}|${m.type}`}>
                                    {m.name}
                                  </option>
                                ))}
                            </select>
                            <button
                              className="leader-confirm-btn"
                              onClick={handleTransferLeadership}
                              disabled={!selectedNewLeader || isLeaderActionPending}
                            >
                              {isLeaderActionPending ? "Transferring..." : "Confirm Transfer"}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Delete team */}
                    {!showTransferPicker && (
                      <>
                        <button
                          className="leader-action-btn delete"
                          onClick={() => setShowDeleteConfirm((v) => !v)}
                        >
                          <Trash2 size={13} /> Delete Team
                        </button>

                        {showDeleteConfirm && (
                          <div className="leader-delete-confirm">
                            <p>This will remove all members and delete the team permanently.</p>
                            <div className="leader-confirm-row">
                              <button
                                className="leader-confirm-btn danger"
                                onClick={handleDeleteTeam}
                                disabled={isLeaderActionPending}
                              >
                                {isLeaderActionPending ? "Deleting..." : "Yes, Delete"}
                              </button>
                              <button
                                className="leader-cancel-btn"
                                onClick={() => setShowDeleteConfirm(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>


          {/* Top Right: Quick Actions */}
          <section className="quick-panel dashboard-panel">
            <div className="panel-title red-title">
              <span>// quick actions</span>
              <HelpCircle size={18} />
            </div>

            <div className="quick-actions">
              <Link className="action-tile pink" href="/timeline">
                <CalendarDays size={26} />
                <span>View Timeline</span>
                <ArrowRight size={16} />
              </Link>
              <Link className="action-tile blue" href="/tracks">
                <Send size={26} />
                <span>View Tracks</span>
                <ArrowRight size={16} />
              </Link>
              <Link className="action-tile green" href="/help">
                <HelpCircle size={26} />
                <span>Ask for help</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Bottom Left: Submission Wizard */}
          <section className="submission-panel dashboard-panel">
            <div>
              <div className="panel-title red-title">
                <span>// submit for review</span>
              </div>

              <div className="step-tabs">
                {(["Project Details", "Links & Assets", "Progress Update"] as const).map((step) => (
                  <button
                    key={step}
                    className={activeStep === step ? "active" : ""}
                    onClick={() => setActiveStep(step)}
                  >
                    {step}
                  </button>
                ))}
              </div>

              {activeStep === "Project Details" && (
                <div className="submission-form">
                  <p className="step-helper">Tell us what your team is building.</p>
                  <div className="form-grid">
                    <label>
                      Project Title*
                      <input
                        aria-label="Project title"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Give your project a name"
                      />
                    </label>

                    <label>
                      Track*
                      <select
                        className="select-field"
                        aria-label="Track"
                        value={selectedTrack}
                        onChange={(e) => {
                          setSelectedTrack(e.target.value);
                          showNotice(`${e.target.value} selected`);
                        }}
                      >
                        <option value="Industry 6.0">Industry 6.0</option>
                        <option value="Trust, Safety & Digital Security">Trust, Safety & Digital Security</option>
                        <option value="ClimateTech & Resilience">ClimateTech & Resilience</option>
                        <option value="Entertainment Reimagined">Entertainment Reimagined</option>
                        <option value="Wildcard">Wildcard</option>
                      </select>
                    </label>
                  </div>

                  <label className="full-field">
                    Project Description*
                    <textarea
                      aria-label="Project description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Briefly describe what your project does and the problem it solves..."
                      rows={3}
                    />
                  </label>
                </div>
              )}


              {activeStep === "Links & Assets" && (
                <div className="submission-form">
                  <p className="step-helper">Share the places where reviewers can see your work.</p>
                  <div className="form-grid">
                    <label>
                      Repository link*
                      <input
                        aria-label="Repository link"
                        type="url"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </label>

                    <label>
                      Demo link / Figma
                      <input
                        aria-label="Demo link"
                        type="url"
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        placeholder="https://..."
                      />
                    </label>
                  </div>

                  <label className="full-field">
                    Pitch deck or presentation link
                    <input
                      aria-label="Pitch deck link"
                      type="url"
                      value={deckLink}
                      onChange={(e) => setDeckLink(e.target.value)}
                      placeholder="https://docs.google.com/presentation/..."
                    />
                  </label>
                </div>
              )}

              {activeStep === "Progress Update" && (
                <div className="submission-form">
                  <p className="step-helper">Give mentors a quick snapshot of your progress.</p>
                  <div className="form-grid">
                    <label>
                      Current status
                      <select
                        className="select-field"
                        aria-label="Current status"
                        value={progressStatus}
                        onChange={(e) => setProgressStatus(e.target.value)}
                      >
                        <option>In progress</option>
                        <option>Need mentor feedback</option>
                        <option>Ready for review</option>
                      </select>
                    </label>

                    <label>
                      Team confidence
                      <select
                        className="select-field"
                        aria-label="Team confidence"
                        value={teamConfidence}
                        onChange={(e) => setTeamConfidence(e.target.value)}
                      >
                        <option>Feeling good</option>
                        <option>Could use a nudge</option>
                        <option>Blocked</option>
                      </select>
                    </label>
                  </div>

                  <label className="full-field">
                    What did you build or learn?
                    <textarea
                      aria-label="Progress update"
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      placeholder="Share a short update with mentors..."
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="submission-actions-row">
              <div className="pager">
                <button
                  aria-label="Previous step"
                  onClick={() => moveStep(-1)}
                  disabled={activeStep === "Project Details"}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  aria-label="Next step"
                  onClick={() => moveStep(1)}
                  disabled={activeStep === "Progress Update"}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <button
                className="save-submission-btn"
                onClick={handleSaveSubmission}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save Submission"}
              </button>
            </div>
          </section>

          {/* Bottom Right: Memories & Live Countdown */}
          <div className="side-stack">
            <section className="memories-panel dashboard-panel">
              <div className="memories-mark">
                memories<span>@ Vinhack</span>
              </div>
              <Link className="capture-button" href="/memories">
                <ImagePlus size={16} /> Capture now <ArrowRight size={16} />
              </Link>
            </section>

            <section className="countdown-panel dashboard-panel">
              <div className="panel-title red-title">
                <span>// vinhack live</span>
              </div>

              <div className="countdown">
                <div>
                  <strong>{String(timeLeft.hours).padStart(2, "0")}</strong>
                  <span>hours</span>
                </div>
                <b>:</b>
                <div>
                  <strong>{String(timeLeft.minutes).padStart(2, "0")}</strong>
                  <span>mins</span>
                </div>
                <b>:</b>
                <div>
                  <strong>{String(timeLeft.seconds).padStart(2, "0")}</strong>
                  <span>secs</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>
            solve what matters <b>*</b>
          </span>
          <small>made with &lt;3 by VinnovateIT</small>
        </footer>
      </main>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="dashboard-notice" role="status">
          <CheckCircle2 size={16} style={{ display: "inline", marginRight: 8, verticalAlign: "-2px" }} />
          {notice}
        </div>
      )}

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Account menu">
          <button
            className="drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close account menu"
          >
            <X size={20} />
          </button>
          <span className="profile-avatar">{userInitial}</span>
          <strong>{participant.name}</strong>
          <span style={{ fontSize: 12, color: "#888", marginTop: -6 }}>{participant.email}</span>

          <Link href="/profile" onClick={() => setMenuOpen(false)}>
            <UserRound size={17} /> Profile
          </Link>
          <Link href="/help" onClick={() => setMenuOpen(false)}>
            <HelpCircle size={17} /> Help center
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ color: "#ff4c42", borderColor: "rgba(255, 76, 66, 0.4)" }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}