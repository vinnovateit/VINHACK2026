"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Copy, HelpCircle, ImagePlus, Menu, Send, UserRound, Users, X } from "lucide-react";

export default function DashboardShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState("Project Details");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const copyTeamCode = async () => {
    await navigator.clipboard?.writeText("VH26-2522");
    setCopied(true);
    showNotice("Team code copied");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const moveStep = (direction: -1 | 1) => {
    const steps = ["Project Details", "Links & Assets", "Progress Update"];
    const currentIndex = steps.indexOf(activeStep);
    const nextIndex = Math.min(steps.length - 1, Math.max(0, currentIndex + direction));
    setActiveStep(steps[nextIndex]);
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <button className="mobile-menu" aria-label="Open account menu" onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
        <a className="dashboard-logo" href="/dashboard" aria-label="VinHack dashboard">Vinhack</a>
        <button className="profile-menu" onClick={() => setMenuOpen(true)} aria-label="Open profile menu"><span className="profile-avatar">A</span><span className="profile-name">Aditya Madan</span><ChevronDown size={23} /></button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-row"><div><p className="dashboard-kicker">Participant workspace</p><h1>Hey <span>Aditya!</span></h1><p className="welcome-copy">Build. Submit. Get Feedback. Keep Going.</p></div><button className="mobile-profile" aria-label="Open profile" onClick={() => setMenuOpen(true)}><UserRound size={20} /></button></section>

        <div className="dashboard-grid">
          <section className="team-panel dashboard-panel"><div className="panel-title"><span>{"// your team"}</span><Users size={20} /></div><div className="team-heading"><div><h2>Team Green Chicken</h2><p>Team Code: <strong>VH26-2522</strong></p></div><button className="member-ticket" onClick={copyTeamCode} aria-label="Copy team code"><strong>5/5</strong><span>Members</span><Copy size={16} /></button></div><div className="team-members"><div className="member leader">A<small>team leader</small></div><div className="member blue">B</div><div className="member pink">J</div><div className="member red">A</div><div className="member yellow">R</div><button className="copy-code" onClick={copyTeamCode}>{copied ? "Copied" : "Copy code"}</button></div></section>

          <section className="quick-panel dashboard-panel"><div className="panel-title red-title"><span>{"// quick actions"}</span><HelpCircle size={20} /></div><div className="quick-actions"><a className="action-tile pink" href="/timeline"><CalendarDays size={31} /><span>View Timeline</span><ArrowRight size={18} /></a><a className="action-tile blue" href="/tracks"><Send size={31} /><span>View Tracks</span><ArrowRight size={18} /></a><a className="action-tile green" href="/help"><HelpCircle size={31} /><span>Ask for help</span><ArrowRight size={18} /></a></div></section>

          <section className="submission-panel dashboard-panel"><div className="panel-title red-title"><span>{"// submit for review"}</span></div><div className="step-tabs">{["Project Details", "Links & Assets", "Progress Update"].map((step) => <button key={step} className={activeStep === step ? "active" : ""} onClick={() => setActiveStep(step)}>{step}</button>)}</div>{activeStep === "Project Details" && <div className="submission-form"><p className="step-helper">Tell us what your team is building.</p><div className="form-grid"><label>Project Title*<input aria-label="Project title" placeholder="Give your project a name" /></label><label>Track*<select className="select-field" aria-label="Track" value={selectedTrack} onChange={(event) => { setSelectedTrack(event.target.value); showNotice(event.target.value ? `${event.target.value} selected` : "Choose a track"); }}><option value="">Select a track</option><option>Open Innovation</option><option>Social Impact</option><option>Sustainability</option></select></label></div></div>}{activeStep === "Links & Assets" && <div className="submission-form"><p className="step-helper">Share the places where reviewers can see your work.</p><div className="form-grid"><label>Repository link*<input aria-label="Repository link" type="url" placeholder="https://github.com/..." /></label><label>Demo link<input aria-label="Demo link" type="url" placeholder="https://..." /></label></div><label className="full-field">Pitch deck or assets<input aria-label="Pitch deck or assets" type="file" /></label></div>}{activeStep === "Progress Update" && <div className="submission-form"><p className="step-helper">Give mentors a quick snapshot of your progress.</p><div className="form-grid"><label>Current status<select className="select-field" aria-label="Current status"><option>In progress</option><option>Need mentor feedback</option><option>Ready for review</option></select></label><label>Team confidence<select className="select-field" aria-label="Team confidence"><option>Feeling good</option><option>Could use a nudge</option><option>Blocked</option></select></label></div><label className="full-field">What did you build or learn?<textarea aria-label="Progress update" placeholder="Share a short update with the mentors..." /></label></div>}<div className="pager"><button aria-label="Previous step" onClick={() => moveStep(-1)} disabled={activeStep === "Project Details"}><ChevronLeft size={23} /></button><button aria-label="Next step" onClick={() => moveStep(1)} disabled={activeStep === "Progress Update"}><ChevronRight size={23} /></button></div></section>

          <div className="side-stack"><section className="memories-panel dashboard-panel"><div className="memories-mark">memories<span>@ Vinhack</span></div><button className="capture-button" onClick={() => showNotice("Camera capture is ready")}><ImagePlus size={18} /> Capture now <ArrowRight size={18} /></button></section><section className="countdown-panel dashboard-panel"><div className="panel-title red-title"><span>{"// vinhack live"}</span></div><div className="countdown"><div><strong>22</strong><span>hours</span></div><b>:</b><div><strong>18</strong><span>mins</span></div><b>:</b><div><strong>31</strong><span>secs</span></div></div></section></div>
        </div>
        <footer className="dashboard-footer"><span>solve what matters <b>*</b></span><small>made with &lt;3 by VinnovateIT</small></footer>
      </main>

      {notice && <div className="dashboard-notice" role="status">{notice}</div>}
      {menuOpen && <div className="mobile-drawer" role="dialog" aria-label="Account menu"><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close account menu"><X /></button><span className="profile-avatar">A</span><strong>Aditya Madan</strong><button onClick={() => { setMenuOpen(false); showNotice("Profile opened"); }}><UserRound size={18} /> Profile</button><button onClick={() => { setMenuOpen(false); showNotice("Help center opened"); }}><HelpCircle size={18} /> Help center</button></div>}
    </div>
  );
}