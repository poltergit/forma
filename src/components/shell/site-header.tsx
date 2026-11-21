import Link from "next/link";
import styles from "./site-header.module.css";

const navigation = [
  { label: "EXPERIENCE", href: "/#main-content" },
  { label: "DISCIPLINES", href: "/#the-materials" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="FORMA home">
          <span className={styles.mark} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>FORMA</span>
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <span className={styles.edition}>DIGITAL PLAYGROUND <span>®</span></span>
      </div>
    </header>
  );
}
