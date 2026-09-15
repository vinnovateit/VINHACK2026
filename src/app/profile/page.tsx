import Link from "next/link";
import { ArrowLeft, Bell, LockKeyhole, UserRound } from "lucide-react";
import styles from "@/components/dashboard/participant-page.module.css";

export const metadata = { title: "Profile | VinHack 2026", description: "Manage your VinHack 2026 participant profile." };

export default function ProfilePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logo} href="/dashboard">Vinhack</Link>
        <Link className={styles.backLink} href="/dashboard"><ArrowLeft size={17} /> Back to workspace</Link>
      </header>
      <section className={styles.hero}>
        <p className={styles.kicker}>{"// your account"}</p>
        <h1>Make your workspace yours.</h1>
        <p className={styles.intro}>Keep your participant details and event preferences close at hand.</p>
      </section>
      <section className={styles.profileGrid} aria-label="Participant profile">
        <article className={styles.profileCard}>
          <div className={styles.profileHeading}><span className={styles.profileAvatarLarge}>A</span><div><p className={styles.cardKicker}>Participant</p><h2>Aditya Madan</h2><p>Team Green Chicken</p></div></div>
          <label>Full name<input defaultValue="Aditya Madan" /></label>
          <label>Email address<input defaultValue="aditya@example.com" type="email" /></label>
          <button className={styles.saveButton}>Save changes</button>
        </article>
        <article className={`${styles.profileCard} ${styles.preferenceCard}`}>
          <UserRound size={27} />
          <h2>Workspace preferences</h2>
          <label className={styles.toggleRow}><span><Bell size={18} /> Event updates</span><input type="checkbox" defaultChecked /></label>
          <label className={styles.toggleRow}><span><LockKeyhole size={18} /> Keep profile private</span><input type="checkbox" /></label>
          <p>These settings only affect your participant workspace.</p>
        </article>
      </section>
      <footer className={styles.footer}><span>solve what matters <b>*</b></span><small>made with &lt;3 by VinnovateIT</small></footer>
    </main>
  );
}
