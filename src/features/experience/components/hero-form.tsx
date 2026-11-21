"use client";

import { useState } from "react";
import styles from "./hero-form.module.css";

const arrangements = [
  { name: "ORIGIN", index: "01", description: "A form finding its center." },
  { name: "DISPLACE", index: "02", description: "A structure pulled out of alignment." },
  { name: "REFRACT", index: "03", description: "One system, seen from another angle." },
] as const;

function Cube({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden="true">
      <span className={styles.faceFront} />
      <span className={styles.faceBack} />
      <span className={styles.faceRight} />
      <span className={styles.faceLeft} />
      <span className={styles.faceTop} />
      <span className={styles.faceBottom} />
    </div>
  );
}

export function HeroForm() {
  const [arrangement, setArrangement] = useState(0);
  const current = arrangements[arrangement];

  function recompose() {
    setArrangement((value) => (value + 1) % arrangements.length);
  }

  return (
    <div className={styles.stage}>
      <div
        className={styles.artwork}
        data-arrangement={current.name.toLowerCase()}
        role="img"
        aria-label={`Abstract dimensional modular sculpture, arrangement ${current.index}: ${current.name.toLowerCase()}.`}
      >
        <div className={styles.stageGrid} />
        <div className={styles.orbit orbitOne} />
        <div className={styles.orbit orbitTwo} />
        <div className={styles.axis axisHorizontal} />
        <div className={styles.axis axisVertical} />
        <div className={styles.sculpture}>
          <Cube className={`${styles.cube} ${styles.cubeMain}`} />
          <Cube className={`${styles.cube} ${styles.cubeSatellite}`} />
          <Cube className={`${styles.cube} ${styles.cubeCore}`} />
          <span className={styles.marker} />
        </div>
        <span className={styles.coordinateTop}>X  /  03.28</span>
        <span className={styles.coordinateBottom}>FORM STUDY — {current.index}</span>
      </div>

      <div className={styles.caption}>
        <div aria-live="polite" aria-atomic="true">
          <span className={styles.captionIndex}>{current.index} / 03</span>
          <p className={styles.captionName}>{current.name}</p>
          <p className={styles.captionDescription}>{current.description}</p>
        </div>
        <button className={styles.recompose} type="button" onClick={recompose}>
          <span>RECOMPOSE</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
