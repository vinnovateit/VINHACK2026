"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowLeft, Bell, LockKeyhole, LogOut, UserRound, Check } from "lucide-react";
import styles from "./participant-page.module.css";

interface ProfileClientProps {
  participant: {
    id: string;
    name: string;
    email: string;
    type: "vit" | "external";
    regNo?: string;
    collegeName?: string;
    isHosteller?: boolean;
    hostelBlock?: string;
    roomNo?: string;
  };
  teamName: string;
}

export default function ProfileClient({ participant, teamName }: ProfileClientProps) {
  const [savedNotice, setSavedNotice] = useState(false);
  const userInitial = (participant.name.charAt(0) || "P").toUpperCase();

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const categoryLabel =
    participant.type === "vit"
      ? `VIT Student (${participant.isHosteller ? `Hosteller - Block ${participant.hostelBlock || "MH"}, Room ${participant.roomNo || "-"}` : "Dayscholar"})`
      : `External Student (${participant.collegeName || "Institute"})`;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logo} href="/dashboard">
          Vinhack
        </Link>
        <Link className={styles.backLink} href="/dashboard">
          <ArrowLeft size={16} /> Back to workspace
        </Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>{"// your account"}</p>
        <h1>Make your workspace yours.</h1>
        <p className={styles.intro}>
          Keep your participant details and event preferences close at hand.
        </p>
      </section>

      <section className={styles.profileGrid} aria-label="Participant profile">
        <article className={styles.profileCard}>
          <div className={styles.profileHeading}>
            <span className={styles.profileAvatarLarge}>{userInitial}</span>
            <div>
              <p className={styles.cardKicker}>{participant.type.toUpperCase()} PARTICIPANT</p>
              <h2>{participant.name}</h2>
              <p>{teamName}</p>
            </div>
          </div>

          <label>
            Full name
            <input defaultValue={participant.name} readOnly />
          </label>

          <label>
            Email address
            <input defaultValue={participant.email} readOnly type="email" />
          </label>

          {participant.regNo && (
            <label>
              Registration Number
              <input defaultValue={participant.regNo} readOnly />
            </label>
          )}

          <label>
            Category & Residency
            <input defaultValue={categoryLabel} readOnly />
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
            <button className={styles.saveButton} onClick={handleSave}>
              {savedNotice ? (
                <>
                  <Check size={16} style={{ display: "inline", marginRight: 6 }} /> Saved
                </>
              ) : (
                "Save preferences"
              )}
            </button>

            <button
              className={styles.signoutBtn}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </article>

        <article className={`${styles.profileCard} ${styles.preferenceCard}`}>
          <UserRound size={26} />
          <h2>Workspace preferences</h2>

          <label className={styles.toggleRow}>
            <span>
              <Bell size={17} /> Event announcements & updates
            </span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className={styles.toggleRow}>
            <span>
              <LockKeyhole size={17} /> Keep profile private on leaderboard
            </span>
            <input type="checkbox" />
          </label>

          <p>These settings customize your VinHack 2026 participant workspace experience.</p>
        </article>
      </section>

      <footer className={styles.footer}>
        <span>
          solve what matters <b>*</b>
        </span>
        <small>made with &lt;3 by VinnovateIT</small>
      </footer>
    </main>
  );
}
