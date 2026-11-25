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
        <div className={styles.meta}><span>ROOM 02 / THE FORCE ROOM</span><span>TIME IS A MATERIAL · HANDLE WITH INTENT</span></div>
        <div className={styles.heading}>
          <h1>Give it<br /><em>gravity.</em></h1>
          <p>A laboratory for invisible forces. Tune rhythm, tension, weight, and interruption until movement develops a character of its own.</p>
        </div>
        <div className={styles.foot}><span>ENERGY / RHYTHM / CONSEQUENCE</span><span>ENTER THE FORCE FIELD ↓</span></div>
      </section>
      <section className={styles.instrument} aria-labelledby="instrument-title">
        <div className={styles.instrumentHeading}><div><span>FORCE STUDY / 001</span><h2 id="instrument-title">A study in<br /><em>momentum.</em></h2></div><p>Choose a behavior, tune the conditions, and watch one simple specimen take on a completely different character.</p></div>
        <MotionLab />
      </section>
      <section className={styles.closing}><span>EVERY MOVEMENT HAS A CAUSE.</span><p>Give every movement<br /><em>a reason.</em></p></section>
    </main>
  );
}
