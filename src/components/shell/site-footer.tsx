import { SpatialLink } from "./spatial-link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <SpatialLink href="/" className={styles.wordmark}>FORMA<span>®</span></SpatialLink>
        <span>MATTER IN MOTION</span>
        <span>NOTHING IS FINISHED · MMXXVI</span>
      </div>
    </footer>
  );
}
