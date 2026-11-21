import Link from "next/link";
import { HeroForm } from "@/features/experience/components/hero-form";
import styles from "./page.module.css";

const disciplines = [
  { number: "01", name: "Playground", descriptor: "INTERACTIVE EXPERIMENTS", description: "Small worlds with their own rules. Touchable studies in form, color, and unexpected behavior.", shape: "shapePlayground" },
  { number: "02", name: "Motion Lab", descriptor: "GENERATIVE MOTION", description: "A place to tune rhythm, tension, repetition, and the mathematics of movement.", shape: "shapeMotion" },
  { number: "03", name: "Scene Studio", descriptor: "SPATIAL AUTHORING", description: "A working space for dimensional ideas, assembled with precision and built to be shared.", shape: "shapeStudio" },
  { number: "04", name: "Archive", descriptor: "COLLECTED FORMS", description: "Experiments, systems, and finished pieces. A growing record of things made along the way.", shape: "shapeArchive" },
] as const;

export default function HomePage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroMeta}>
          <span>INDEPENDENT CREATIVE TECHNOLOGY</span>
          <span>EST. 2026 <i aria-hidden="true">/</i> WEB PLATFORM</span>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> WHERE FORM MEETS FUNCTION</p>
            <h1 id="hero-title" className={styles.heading}>Make room<br />for the<br /><em>unexpected.</em></h1>
            <p className={styles.heroDescription}>A playground for ideas in motion. Where design, code, and dimensional thinking become things you can actually experience.</p>
            <Link className={styles.exploreLink} href="#disciplines"><span>ENTER THE PLAYGROUND</span><span aria-hidden="true">↓</span></Link>
          </div>
          <div className={styles.heroVisual}><HeroForm /></div>
          <span className={styles.verticalNote} aria-hidden="true">A DIGITAL PLAYGROUND FOR THE CURIOUS — VOL. 001</span>
        </div>
        <div className={styles.heroFoot}>
          <span>DESIGN IS NOT A STILL IMAGE.</span>
          <span>SCROLL TO FEEL THE FORM SHIFT <span aria-hidden="true">↓</span></span>
        </div>
      </section>

      <section id="the-idea" className={styles.manifesto} aria-labelledby="manifesto-title">
        <div className={styles.sectionMeta}><span>01 / THE IDEA</span><span>THOUGHT MADE TANGIBLE</span></div>
        <div className={styles.manifestoGrid}>
          <p className={styles.manifestoAside}>NOT ANOTHER STATIC SHOWCASE.</p>
          <h2 id="manifesto-title">Digital things should be <em>felt.</em><span> Not just seen.</span></h2>
        </div>
        <div className={styles.manifestoFoot}>
          <span>FORM / FUNCTION / FEELING</span>
          <p>FORMA is a living collection of interactive experiments and creative tools. A space for trying, breaking, reshaping, and discovering what digital form can become.</p>
        </div>
      </section>

      <section id="disciplines" className={styles.disciplines} aria-labelledby="disciplines-title">
        <div className={styles.sectionMeta}><span>02 / THE TERRITORIES</span><span>FOUR WAYS IN</span></div>
        <div className={styles.disciplinesIntro}>
          <h2 id="disciplines-title">Different tools.<br /><em>One playground.</em></h2>
          <p>Each territory has its own material, behavior, and point of view. Start anywhere. Follow what moves you.</p>
        </div>
        <div className={styles.disciplineList}>
          {disciplines.map((item) => (
            <article className={styles.discipline} key={item.number}>
              <div className={styles.disciplineVisual} aria-hidden="true">
                <div className={styles[item.shape]}><span /><span /><span /></div>
                <span className={styles.disciplineNumber}>{item.number}</span>
              </div>
              <div className={styles.disciplineInfo}>
                <span className={styles.disciplineDescriptor}>{item.descriptor}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span className={styles.comingSoon}>IN DEVELOPMENT <i aria-hidden="true">↗</i></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.invitation} aria-labelledby="invitation-title">
        <div className={styles.invitationOrb} aria-hidden="true" />
        <div className={styles.sectionMeta}><span>03 / YOUR MOVE</span><span>THE FORM IS NEVER FINAL</span></div>
        <div className={styles.invitationContent}>
          <p>AN OPEN INVITATION TO EXPERIMENT</p>
          <h2 id="invitation-title">Curiosity looks<br /><em>good on you.</em></h2>
          <Link href="https://github.com/poltergit/forma" target="_blank" rel="noreferrer">FOLLOW THE BUILD <span aria-hidden="true">↗</span></Link>
        </div>
        <span className={styles.invitationIndex}>F—∞</span>
      </section>
    </main>
  );
}
