import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CircleHelp, Mail, Send } from "lucide-react";
import { TIMELINE, TRACKS } from "@/content/site";
import styles from "./participant-page.module.css";

type PageKind = "timeline" | "tracks" | "help";

const pageCopy = {
  timeline: { label: "// event timeline", title: "Know what happens next.", intro: "Keep your team moving through every checkpoint of VinHack 2026." },
  tracks: { label: "// build direction", title: "Choose a problem worth solving.", intro: "Pick a direction, find your angle, and build something that lasts." },
  help: { label: "// participant support", title: "You do not have to get stuck.", intro: "Find a quick answer or send the team a question from here." },
} as const;

export default function ParticipantPage({ kind }: { kind: PageKind }) {
  const copy = pageCopy[kind];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logo} href="/dashboard">Vinhack</Link>
        <Link className={styles.backLink} href="/dashboard"><ArrowLeft size={17} /> Back to workspace</Link>
      </header>
      <section className={styles.hero}>
        <p className={styles.kicker}>{copy.label}</p>
        <h1>{copy.title}</h1>
        <p className={styles.intro}>{copy.intro}</p>
      </section>
      {kind === "timeline" && <TimelineContent />}
      {kind === "tracks" && <TracksContent />}
      {kind === "help" && <HelpContent />}
      <footer className={styles.footer}><span>solve what matters <b>*</b></span><small>made with &lt;3 by VinnovateIT</small></footer>
    </main>
  );
}

function TimelineContent() {
  return <section className={styles.dayGrid} aria-label="Hackathon timeline">{TIMELINE.days.map((day) => <article className={styles.dayCard} key={day.name}><div className={styles.cardHeader}><div><p className={styles.cardKicker}>{day.name}</p><h2>{day.date}</h2></div><CalendarDays size={25} /></div><div className={styles.schedule}>{day.entries.map((entry) => entry.kind === "row" ? <div className={styles.scheduleRow} key={entry.label}><span>{entry.label}</span><time>{entry.time}</time></div> : <div className={styles.reviewRow} key={entry.label}>{entry.label}</div>)}</div></article>)}</section>;
}

function TracksContent() {
  const tracks = [
    { name: "Open Innovation", detail: "Build a bold answer to a problem that matters to you.", tone: "green" },
    { name: "Social Impact", detail: "Use technology to make everyday life more equitable.", tone: "blue" },
    { name: "Sustainability", detail: "Design practical ways to protect the future we share.", tone: "pink" },
  ];
  return <section className={styles.trackGrid} aria-label="Hackathon tracks"><div className={styles.trackLead}><span>{TRACKS.lines[0]}</span><strong>{TRACKS.lines[1]}</strong><span>{TRACKS.lines[2]}</span><p>{TRACKS.sticker}</p></div>{tracks.map((track) => <article className={`${styles.trackCard} ${styles[track.tone]}`} key={track.name}><span>0{tracks.indexOf(track) + 1}</span><h2>{track.name}</h2><p>{track.detail}</p><Link href={`/dashboard?track=${encodeURIComponent(track.name)}`}>Use this direction <ArrowRight size={17} /></Link></article>)}</section>;
}

function HelpContent() {
  return <section className={styles.helpGrid} aria-label="Participant help"><article className={styles.helpCard}><CircleHelp size={27} /><h2>Frequently asked</h2><details><summary>Can I change my team?</summary><p>Ask the organizers before submissions open so they can update your workspace.</p></details><details><summary>Where do I submit my project?</summary><p>Return to the dashboard and use the Submit for review panel.</p></details><details><summary>How do I get mentor feedback?</summary><p>Use the event timeline for review checkpoints and ask for help when you need a hand.</p></details></article><article className={`${styles.helpCard} ${styles.contactCard}`}><Mail size={27} /><h2>Talk to the team</h2><p>For an urgent event question, send a note with your team code and a short description of what you need.</p><a href="mailto:vinnovateit@gmail.com">Email VinnovateIT <Send size={17} /></a></article></section>;
}
