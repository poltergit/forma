import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.wordmark}>FORMA<span>®</span></Link>
        <span>AN INDEPENDENT DIGITAL ATELIER</span>
        <span>MAKE / UNMAKE / REMAKE · 2026</span>
      </div>
    </footer>
  );
}
