import { SpatialLink } from "./spatial-link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <SpatialLink href="/" className={styles.wordmark}><svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="21" ry="10" transform="rotate(-32 24 24)" /><ellipse cx="24" cy="24" rx="17" ry="21" transform="rotate(38 24 24)" /><path d="M15 36V11h20M15 22h15" /><path d="m14 36 20-25" /><circle cx="36" cy="13" r="2.4" /></svg>FORMA<span>®</span></SpatialLink>
        <span>MATTER IN MOTION</span>
        <span>NOTHING IS FINISHED · MMXXVI</span>
      </div>
    </footer>
  );
}
