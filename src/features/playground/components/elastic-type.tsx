"use client";

import { useState } from "react";
import styles from "./elastic-type.module.css";

export function ElasticType() {
  const [tension, setTension] = useState(62);
  const [release, setRelease] = useState(48);
  const [inverted, setInverted] = useState(false);

  return (
    <section className={styles.experiment} id="elastic-type" aria-labelledby="elastic-title">
      <div className={styles.heading}>
        <div><span>EXPERIMENT / 002 — TYPE STUDY</span><h2 id="elastic-title">Elastic <em>matter.</em></h2></div>
        <p>Letters are not fixed objects. Pull their width, tune the tension, and decide when the form lets go.</p>
      </div>
      <div className={styles.stage} data-inverted={inverted}>
        <span className={styles.coordinate}>TYPE / VARIABLE FORM / 02</span>
        <div className={styles.specimen} style={{ "--tension": tension / 50, "--release": release / 100 } as React.CSSProperties} aria-label="Elastic Matter typographic specimen">
          <span>F</span><span>O</span><span>R</span><span>M</span><span>A</span>
        </div>
        <span className={styles.baseline}>STRETCH IS A FORM OF EXPRESSION</span>
      </div>
      <div className={styles.controls}>
        <label><span>LETTER TENSION <output>{tension}%</output></span><input type="range" min="20" max="100" step="2" value={tension} onChange={(event) => setTension(Number(event.target.value))} /></label>
        <label><span>RELEASE <output>{release}%</output></span><input type="range" min="0" max="100" step="2" value={release} onChange={(event) => setRelease(Number(event.target.value))} /></label>
        <button type="button" aria-pressed={inverted} onClick={() => setInverted((value) => !value)}>{inverted ? "RELEASE FORM ↗" : "INVERT TENSION ↗"}</button>
        <button type="button" onClick={() => { setTension(62); setRelease(48); setInverted(false); }}>RESET STUDY ↺</button>
      </div>
    </section>
  );
}
