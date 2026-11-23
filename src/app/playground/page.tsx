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
        <div className={styles.introMeta}><span>01 / THE PLAYGROUND</span><span>AN INDEX OF EXPERIMENTS</span></div>
        <div className={styles.introGrid}>
          <h1>Enter the<br /><em>unknown.</em></h1>
          <p>Not a gallery of finished answers. A field of strange little worlds. Move through them, change the rules, and see what happens.</p>
        </div>
        <div className={styles.introFoot}><span>FORM / FORCE / FEELING</span><span>SCROLL TO INTERACT ↓</span></div>
      </section>
      <section className={styles.experiment} id="displacement-field" aria-labelledby="experiment-title">
        <div className={styles.experimentHeading}>
          <div><span>FEATURED EXPERIMENT / 001</span><h2 id="experiment-title">Displacement<br /><em>field.</em></h2></div>
          <p>A seeded field of dimensional forms. Your movement bends the composition; parameters let you change its density and influence.</p>
        </div>
        <PlaygroundExperience />
      </section>
      <ExperimentIndex />
      <ElasticType />
      <section className={styles.next}>
        <span>MORE WORLDS ARE TAKING SHAPE</span>
        <p>One experiment at a time.<br /><em>No two rules need to be alike.</em></p>
      </section>
    </main>
  );
}
