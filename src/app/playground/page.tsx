import type { Metadata } from "next";
import { PlaygroundExperience } from "@/features/playground/components/playground-experience";
import { ExperimentIndex } from "@/features/playground/components/experiment-index";
import { ElasticType } from "@/features/playground/components/elastic-type";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Playground",
  description: "Explore original interactive studies in form, matter, and generative behavior.",
};

export default function PlaygroundPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.intro}>
        <div className={styles.introMeta}><span>ROOM 01 / THE OPEN FIELD</span><span>UNFINISHED SYSTEMS · LIVE STUDIES</span></div>
        <div className={styles.introGrid}>
          <h1>Enter the<br /><em>unknown.</em></h1>
          <p>An open field for unfinished ideas. Pull at a system, interrupt its logic, and let the unexpected become part of the composition.</p>
        </div>
        <div className={styles.introFoot}><span>FIELD NOTES / 001—∞</span><span>TOUCH THE FIELD ↓</span></div>
      </section>
      <section className={styles.process} aria-label="The FORMA process">
        <div className={styles.processLead}>
          <span>A METHOD WITHOUT A MAP / 00—∞</span>
          <p>There is no straight line from idea to object.</p>
        </div>
        <div className={styles.processSteps}>
          <div><b>01</b><span>OBSERVE</span><i aria-hidden="true">↘</i></div>
          <div><b>02</b><span>DISTORT</span><i aria-hidden="true">↗</i></div>
          <div><b>03</b><span>RECOMPOSE</span><i aria-hidden="true">✳</i></div>
        </div>
      </section>
      <section className={styles.experiment} id="displacement-field" aria-labelledby="experiment-title">
        <div className={styles.experimentHeading}>
          <div><span>OPEN STUDY / 001</span><h2 id="experiment-title">Displacement<br /><em>field.</em></h2></div>
          <p>A responsive field of geometry. Move through the composition, change its density, and give the forms a new center of gravity.</p>
        </div>
        <PlaygroundExperience />
      </section>
      <ExperimentIndex />
      <ElasticType />
      <section className={styles.next}>
        <span>THE INDEX IS NEVER FINISHED</span>
        <p>One rule becomes another.<br /><em>Keep pulling the thread.</em></p>
      </section>
    </main>
  );
}
