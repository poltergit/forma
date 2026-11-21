"use client";

import { useState } from "react";
import styles from "./motion-lab.module.css";

type MotionMode = "orbit" | "pulse" | "shift" | "stagger";
type Easing = "ease-in-out" | "linear" | "cubic-bezier(.2,.8,.2,1)" | "steps(5,end)";

const modes: Array<{ id: MotionMode; label: string; note: string }> = [
  { id: "orbit", label: "Orbit", note: "A body moving around an invisible center." },
  { id: "pulse", label: "Pulse", note: "Expansion and contraction as a rhythmic signal." },
  { id: "shift", label: "Shift", note: "A form traveling across a spatial axis." },
  { id: "stagger", label: "Stagger", note: "A stepped sequence with deliberate interruption." },
];

export function MotionLab() {
  const [mode, setMode] = useState<MotionMode>("orbit");
  const [duration, setDuration] = useState(4);
  const [intensity, setIntensity] = useState(50);
  const [easing, setEasing] = useState<Easing>("ease-in-out");
  const [paused, setPaused] = useState(false);

  const reset = () => {
    setMode("orbit");
    setDuration(4);
    setIntensity(50);
    setEasing("ease-in-out");
    setPaused(false);
  };

  const selected = modes.find((item) => item.id === mode) ?? modes[0];

  return (
    <section className={styles.workspace} aria-label="Interactive motion instrument">
      <div className={styles.stageColumn}>
        <div className={styles.stageMeta}><span>LIVE STAGE / 001</span><span className={styles.live}><i /> {paused ? "PAUSED" : "PLAYING"}</span></div>
        <div
          className={`${styles.stage} ${paused ? styles.paused : ""}`}
          data-motion={mode}
          style={{
            "--duration": `${duration}s`,
            "--intensity": intensity / 50,
            "--easing": easing,
          } as React.CSSProperties}
        >
          <span className={styles.cornerMark} aria-hidden="true">+</span>
          <div className={`${styles.object} ${styles[mode]}`} aria-hidden="true"><i /><i /><i /></div>
          <span className={styles.stageCoordinates}>X / 0.00 &nbsp; Y / 1.00 &nbsp; Z / 0.50</span>
          <span className={styles.stageInstruction}>CHANGE THE PARAMETERS → CHANGE THE FEELING</span>
        </div>
        <div className={styles.stageFooter}>
          <span>{selected.note}</span>
          <button type="button" onClick={() => setPaused((value) => !value)}>{paused ? "▶ PLAY" : "Ⅱ PAUSE"}</button>
        </div>
      </div>
      <aside className={styles.panel} aria-label="Motion parameters">
        <div className={styles.panelTitle}><span>THE INSTRUMENT</span><span>PARAM / 04</span></div>
        <fieldset className={styles.modeField}>
          <legend>01 / BEHAVIOR</legend>
          <div className={styles.modeGrid}>
            {modes.map((item) => (
              <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>
                <span>{item.label}</span><i aria-hidden="true">{mode === item.id ? "●" : "↗"}</i>
              </button>
            ))}
          </div>
        </fieldset>
        <label className={styles.control}>
          <span><span>02 / DURATION</span><output>{duration.toFixed(1)}s</output></span>
          <input type="range" min="1" max="8" step=".5" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          <small><span>QUICK</span><span>DELIBERATE</span></small>
        </label>
        <label className={styles.control}>
          <span><span>03 / INTENSITY</span><output>{intensity}%</output></span>
          <input type="range" min="10" max="100" step="5" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} />
          <small><span>SUBTLE</span><span>EXPRESSIVE</span></small>
        </label>
        <label className={styles.control}>
          <span><span>04 / EASING</span></span>
          <select value={easing} onChange={(event) => setEasing(event.target.value as Easing)}>
            <option value="ease-in-out">Ease in / out</option>
            <option value="linear">Linear</option>
            <option value="cubic-bezier(.2,.8,.2,1)">Ease out</option>
            <option value="steps(5,end)">Stepped</option>
          </select>
        </label>
        <button className={styles.reset} type="button" onClick={reset}>↺ RESET PARAMETERS</button>
      </aside>
    </section>
  );
}
