import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>FORMA / WHERE FORM MEETS FUNCTION</span>
        <span>BUILT WITH INTENTION · 2026</span>
      </div>
    </footer>
  );
}
