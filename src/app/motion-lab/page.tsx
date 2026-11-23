import type { Metadata } from "next";
import { MotionLab } from "@/features/motion-lab/components/motion-lab";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Motion Lab",
  description: "Shape timing, easing, intensity, and spatial behavior in a live motion instrument.",
};

export default function MotionLabPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.intro}>
        <div className={styles.meta}><span>02 / MOTION LAB</span><span>THE PHYSICS OF FEELING</span></div>
        <div className={styles.heading}>
          <h1>Give it<br /><em>feeling.</em></h1>
          <p>Motion is a material. Tune its rhythm, change its character, and discover how a small shift can change the feeling of a form.</p>
        </div>
        <div className={styles.foot}><span>TIME / FORCE / RESPONSE</span><span>LIVE MOTION STUDY ↓</span></div>
      </section>
      <section className={styles.instrument} aria-labelledby="instrument-title">
        <div className={styles.instrumentHeading}><div><span>THE INSTRUMENT / 001</span><h2 id="instrument-title">A study in<br /><em>movement.</em></h2></div><p>Choose a behavior. Change its parameters. Watch the same form tell a different story.</p></div>
        <MotionLab />
      </section>
      <section className={styles.closing}><span>THE SMALL THINGS MOVE US.</span><p>Make the movement<br /><em>mean something.</em></p></section>
    </main>
  );
}
