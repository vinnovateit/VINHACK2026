"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowLeft, Bell, LockKeyhole, LogOut, UserRound, Check } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import DiscordIcon from "@/components/nav/DiscordIcon";
import { DISCORD } from "@/content/site";
import styles from "./participant-page.module.css";

interface ProfileClientProps {
  participant: {
    id: string;
    name: string;
    email: string;
    type: "vit" | "external";
    regNo?: string;
    year?: number;
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

  const yearSuffix = (y: number) => (y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th");

  /** For VIT students derive year from first two digits of the reg number.
   *  23 → 4th year, 24 → 3rd year, 25 → 2nd year, 26 → 1st year */
  const deriveYearFromRegNo = (regNo?: string): number | null => {
    if (!regNo) return null;
    const prefix = parseInt(regNo.slice(0, 2), 10);
    const currentYear = 26; // academic year digits
    const yearOfStudy = currentYear - prefix + 1;
    return yearOfStudy >= 1 && yearOfStudy <= 5 ? yearOfStudy : null;
  };

  const effectiveYear =
    participant.type === "vit"
      ? deriveYearFromRegNo(participant.regNo) ?? participant.year
      : participant.year;

  const yearLabel = effectiveYear ? `${effectiveYear}${yearSuffix(effectiveYear)} Year` : null;

  const categoryLabel =
    participant.type === "vit"
      ? `VIT Student ${yearLabel ? `(${yearLabel})` : ""}${participant.isHosteller ? ` - Hosteller (${participant.hostelBlock || "MH"}, Room ${participant.roomNo || "-"})` : " - Dayscholar"}`
      : `External Student ${yearLabel ? `(${yearLabel})` : ""}${participant.collegeName ? ` - ${participant.collegeName}` : ""}`;

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

          {yearLabel && (
            <label>
              Year of study
              <input defaultValue={yearLabel} readOnly />
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

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #282828", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              Need help or want to connect with organizers and participants?
            </p>
            <KeyButton
              href={DISCORD.href}
              target="_blank"
              rel="noopener noreferrer"
              color="blue"
              size="compact"
              className="w-full"
              icon={<DiscordIcon className="size-4 shrink-0" />}
            >
              JOIN DISCORD
            </KeyButton>
          </div>
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
