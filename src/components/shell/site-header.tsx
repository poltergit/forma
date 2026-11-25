import { SpatialLink } from "./spatial-link";
import styles from "./site-header.module.css";

const navigation = [
  { label: "STUDIES", href: "/playground" },
  { label: "MOTION", href: "/motion-lab" },
  { label: "SCENE STUDIO", href: "/scene-studio" },
  { label: "ARCHIVE", href: "/archive" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <SpatialLink className={styles.brand} href="/" aria-label="FORMA home">
          <span className={styles.mark} aria-hidden="true"><i /><i /><i /></span>
          <span>FORMA<span className={styles.registered}>®</span></span>
        </SpatialLink>
        <nav className={styles.nav} aria-label="Main navigation">
          <span className={styles.navIndex}>ATELIER INDEX / 01—04</span>
          {navigation.map((item, index) => <SpatialLink key={item.label} href={item.href}><small>{String(index + 1).padStart(2, "0")}</small><span>{item.label}</span></SpatialLink>)}
        </nav>
        <SpatialLink className={styles.contact} href="/playground">MAKE SOMETHING <span>↗</span></SpatialLink>
      </div>
    </header>
  );
}
