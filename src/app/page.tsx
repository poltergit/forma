import Link from "next/link";
import styles from "./page.module.css";

const coordinates = [
  { label: "01", value: "DESIGN" },
  { label: "02", value: "MOTION" },
  { label: "03", value: "GENERATIVE" },
  { label: "04", value: "SPATIAL" },
];

export default function HomePage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.meta}>
          <span>INDEPENDENT CREATIVE TECHNOLOGY</span>
          <span>EST. 2026 / WEB PLATFORM</span>
        </div>

        <div className={styles.composition}>
          <div className={styles.orbit} aria-hidden="true">
            <span className={styles.orbitRing} />
            <span className={styles.orbitCore} />
            <span className={styles.orbitCross} />
            <span className={styles.orbitIndex}>F—01</span>
          </div>

          <div className={styles.headingWrap}>
            <p className={styles.eyebrow}>WHERE FORM MEETS FUNCTION.</p>
            <h1 id="hero-title" className={styles.heading}>
              Make room
              <br />
              for <span>the</span> <em>unexpected.</em>
            </h1>
          </div>
        </div>

        <div className={styles.bottomLine}>
          <p className={styles.intro}>
            A playground for ideas in motion. A space to shape digital
            experiences through design, code, and dimensional thinking.
          </p>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span>FOUNDATION / IN DEVELOPMENT</span>
          </div>
        </div>
      </section>

      <section id="the-materials" className={styles.index} aria-label="FORMA disciplines">
        <div className={styles.indexHeader}>
          <span>THE MATERIALS</span>
          <span>SCROLL TO EXPLORE</span>
        </div>
        <div className={styles.coordinates}>
          {coordinates.map((item) => (
            <div className={styles.coordinate} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <span aria-hidden="true">↗</span>
            </div>
          ))}
        </div>
        <div className={styles.note}>
          <p>
            The experience is being assembled with intention. The foundation
            comes first; the spectacle follows.
          </p>
          <Link href="https://github.com/poltergit/forma" target="_blank" rel="noreferrer">
            FOLLOW THE BUILD <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
