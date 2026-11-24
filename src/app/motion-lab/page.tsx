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
        <div className={styles.meta}><span>02 / MOTION LAB</span><span>TIME / TENSION / CHARACTER</span></div>
        <div className={styles.heading}>
          <h1>Give it<br /><em>feeling.</em></h1>
          <p>Motion is a material with weight, rhythm, and intention. Shape its behavior, interrupt its timing, and make the smallest movement carry meaning.</p>
        </div>
        <div className={styles.foot}><span>TIME / FORCE / RESPONSE</span><span>LIVE MOTION STUDY ↓</span></div>
      </section>
      <section className={styles.instrument} aria-labelledby="instrument-title">
        <div className={styles.instrumentHeading}><div><span>THE INSTRUMENT / 001</span><h2 id="instrument-title">A study in<br /><em>movement.</em></h2></div><p>Choose a behavior, tune the conditions, and watch one simple specimen take on a completely different character.</p></div>
        <MotionLab />
      </section>
      <section className={styles.closing}><span>THE SMALL THINGS MOVE US.</span><p>Give every movement<br /><em>a reason.</em></p></section>
    </main>
  );
}
