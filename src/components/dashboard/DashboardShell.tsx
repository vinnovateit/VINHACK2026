"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Copy, HelpCircle, ImagePlus, Menu, Send, UserRound, Users, X } from "lucide-react";

export default function DashboardShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState("Project Details");

  const copyTeamCode = async () => {
    await navigator.clipboard?.writeText("VH26-2522");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <button className="mobile-menu" aria-label="Open account menu" onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
        <a className="dashboard-logo" href="/dashboard" aria-label="VinHack dashboard">Vinhack</a>
        <div className="profile-menu"><span className="profile-avatar">A</span><span className="profile-name">Aditya Madan</span><ChevronDown size={23} /></div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-row"><div><p className="dashboard-kicker">Participant workspace</p><h1>Hey <span>Aditya!</span></h1><p className="welcome-copy">Build. Submit. Get Feedback. Keep Going.</p></div><button className="mobile-profile" aria-label="Open profile"><UserRound size={20} /></button></section>

        <div className="dashboard-grid">
          <section className="team-panel dashboard-panel"><div className="panel-title"><span>{"// your team"}</span><Users size={20} /></div><div className="team-heading"><div><h2>Team Green Chicken</h2><p>Team Code: <strong>VH26-2522</strong></p></div><button className="member-ticket" onClick={copyTeamCode} aria-label="Copy team code"><strong>5/5</strong><span>Members</span><Copy size={16} /></button></div><div className="team-members"><div className="member leader">A<small>team leader</small></div><div className="member blue">B</div><div className="member pink">J</div><div className="member red">A</div><div className="member yellow">R</div><button className="copy-code" onClick={copyTeamCode}>{copied ? "Copied" : "Copy code"}</button></div></section>

          <section className="quick-panel dashboard-panel"><div className="panel-title red-title"><span>{"// quick actions"}</span><HelpCircle size={20} /></div><div className="quick-actions"><button className="action-tile pink" onClick={() => setActiveStep("Timeline")}><CalendarDays size={31} /><span>View Timeline</span><ArrowRight size={18} /></button><button className="action-tile blue" onClick={() => setActiveStep("Tracks")}><Send size={31} /><span>View Tracks</span><ArrowRight size={18} /></button><button className="action-tile green" onClick={() => setActiveStep("Help")}><HelpCircle size={31} /><span>Ask for help</span><ArrowRight size={18} /></button></div></section>

          <section className="submission-panel dashboard-panel"><div className="panel-title red-title"><span>{"// submit for review"}</span></div><div className="step-tabs">{["Project Details", "Links & Assets", "Progress Update"].map((step) => <button key={step} className={activeStep === step ? "active" : ""} onClick={() => setActiveStep(step)}>{step}</button>)}</div><div className="form-grid"><label>Project Title*<input aria-label="Project title" /></label><label>Track*<button className="select-field">Select a track <ChevronDown size={18} /></button></label></div><div className="pager"><button aria-label="Previous step" onClick={() => setActiveStep("Project Details")}><ChevronLeft size={23} /></button><button aria-label="Next step" onClick={() => setActiveStep("Links & Assets")}><ChevronRight size={23} /></button></div></section>

          <div className="side-stack"><section className="memories-panel dashboard-panel"><div className="memories-mark">memories<span>@ Vinhack</span></div><button className="capture-button"><ImagePlus size={18} /> Capture now <ArrowRight size={18} /></button></section><section className="countdown-panel dashboard-panel"><div className="panel-title red-title"><span>{"// vinhack live"}</span></div><div className="countdown"><div><strong>22</strong><span>hours</span></div><b>:</b><div><strong>18</strong><span>mins</span></div><b>:</b><div><strong>31</strong><span>secs</span></div></div></section></div>
        </div>
        <footer className="dashboard-footer"><span>solve what matters <b>*</b></span><small>made with &lt;3 by VinnovateIT</small></footer>
      </main>

      {menuOpen && <div className="mobile-drawer" role="dialog" aria-label="Account menu"><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close account menu"><X /></button><span className="profile-avatar">A</span><strong>Aditya Madan</strong><button><UserRound size={18} /> Profile</button><button><HelpCircle size={18} /> Help center</button></div>}
    </div>
  );
}