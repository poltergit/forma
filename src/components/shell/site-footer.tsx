import { SpatialLink } from "./spatial-link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <SpatialLink href="/" className={styles.wordmark}><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 35 24 7l16 28M13 27h22M17 35l7-14 7 14" /><circle cx="24" cy="24" r="19" /></svg>FORMA<span>®</span></SpatialLink>
        <span>MATTER IN MOTION</span>
        <span>NOTHING IS FINISHED · MMXXVI</span>
      </div>
    </footer>
  );
}
