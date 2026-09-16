import Link from "next/link";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <img className={styles.artwork} src="/404-figma.svg" alt="404 page not found" />

        <Link className={`${styles.hotspot} ${styles.homeLink}`} href="/">
          <span className={styles.srOnly}>Home</span>
        </Link>
        <Link className={`${styles.hotspot} ${styles.exploreLink}`} href="/">
          <span className={styles.srOnly}>Explore</span>
        </Link>
        <Link className={`${styles.hotspot} ${styles.backHomeLink}`} href="/">
          <span className={styles.srOnly}>Go Back Home</span>
        </Link>
      </div>
    </main>
  );
}
