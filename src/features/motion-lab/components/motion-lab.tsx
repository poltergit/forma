"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import styles from "./motion-lab.module.css";
import { createMotionRecipe, type MotionEasing as Easing, type MotionMode } from "../motion-recipe";

const curvePaths: Record<Easing, string> = {
  "ease-in-out": "M 8 70 C 28 70, 28 10, 50 40 S 72 10, 92 10",
  linear: "M 8 70 L 92 10",
  "cubic-bezier(.2,.8,.2,1)": "M 8 70 C 20 18, 46 10, 92 10",
  "steps(5,end)": "M 8 70 H 25 V 58 H 42 V 46 H 59 V 34 H 76 V 22 H 92 V 10",
};

const modes: Array<{ id: MotionMode; label: string; note: string }> = [
  { id: "orbit", label: "Orbit", note: "A body moving around an invisible center." },
  { id: "pulse", label: "Pulse", note: "Expansion and contraction as a rhythmic signal." },
  { id: "shift", label: "Shift", note: "A form traveling across a spatial axis." },
  { id: "stagger", label: "Stagger", note: "A stepped sequence with deliberate interruption." },
];

export function MotionLab() {
  const objectRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<MotionMode>("orbit");
  const [duration, setDuration] = useState(4);
  const [intensity, setIntensity] = useState(50);
  const [easing, setEasing] = useState<Easing>("ease-in-out");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedRecipe, setCopiedRecipe] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<{ recipeKey: string; message: string } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const reset = () => {
    setMode("orbit");
    setDuration(4);
    setIntensity(50);
    setEasing("ease-in-out");
    setPaused(false);
    setProgress(0);
    setCopiedRecipe(null);
    setCopyStatus(null);
  };

  const selected = modes.find((item) => item.id === mode) ?? modes[0];

  useEffect(() => {
    if (reducedMotion || progress !== 0 || paused) return;
    const animation = objectRef.current?.getAnimations()[0];
    if (animation) animation.currentTime = 0;
  }, [duration, easing, mode, paused, progress, reducedMotion]);
  const recipe = useMemo(() => createMotionRecipe(mode, duration, intensity, easing), [mode, duration, intensity, easing]);
  const recipeKey = JSON.stringify(recipe);
  const copied = copiedRecipe === recipeKey;
  const copyMessage = copyStatus?.recipeKey === recipeKey ? copyStatus.message : "";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);


  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
      setCopiedRecipe(recipeKey);
      setCopyStatus({ recipeKey, message: "Recipe copied to clipboard." });
    } catch {
      setCopiedRecipe(null);
      setCopyStatus({ recipeKey, message: "Clipboard unavailable. Select and copy the JSON below." });
    }
  };

  return (
    <section className={styles.workspace} aria-label="Interactive motion instrument">
      <div className={styles.stageColumn}>
        <div className={styles.stageMeta}><span>LIVE STAGE / 001</span><span className={styles.live} role="status" aria-live="polite"><i /> {reducedMotion ? "STATIC / REDUCED MOTION" : paused ? "PAUSED" : "LIVE PREVIEW"}</span></div>
        <div
          className={`${styles.stage} ${paused ? styles.paused : ""}`}
          data-motion={mode}
          style={{
            "--duration": `${duration}s`,
            "--intensity": intensity / 50,
            "--easing": easing,
          } as CSSProperties}
        >
          <span className={styles.cornerMark} aria-hidden="true">+</span>
          <div ref={objectRef} className={`${styles.object} ${styles[mode]}`} aria-hidden="true"><i /><i /><i /></div>
          <span className={styles.stageCoordinates}>X / 0.00 &nbsp; Y / 1.00 &nbsp; Z / 0.50</span>
          <span className={styles.stageInstruction}>CHANGE THE PARAMETERS → CHANGE THE FEELING</span>
        </div>
        <p className={styles.reducedMotionNote} hidden={!reducedMotion}>Motion is reduced by your system preference. The stage stays still; timing controls continue to shape the reproducible recipe.</p>
        <div className={styles.timeline} hidden={reducedMotion}>
          <div className={styles.timelineMeta}><span>SCRUB / FREEZE AT A MOMENT</span><output>{progress}%</output></div>
          <input aria-label="Motion timeline position" type="range" min="0" max="100" step="1" value={progress} onChange={(event) => { const next = Number(event.target.value); setProgress(next); setPaused(true); const animation = objectRef.current?.getAnimations()[0]; if (animation) { animation.pause(); animation.currentTime = (next / 100) * duration * 2000; } }} />
          <div className={styles.timelineScale}><span>0:00</span><span>{(duration * 2).toFixed(1)}s / FULL CYCLE</span></div>
        </div>
        <div className={styles.stageFooter}>
          <span>{selected.note}</span>
          <button type="button" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={() => setPaused((value) => !value)}>{paused ? "▶ PLAY" : "Ⅱ PAUSE"}</button>
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
        <div className={styles.curve}>
          <div><span>CURVE / RESPONSE</span><span>{easing === "ease-in-out" ? "BALANCED" : easing === "linear" ? "CONSTANT" : easing === "steps(5,end)" ? "DISCRETE" : "DECELERATE"}</span></div>
          <svg viewBox="0 0 100 80" role="img" aria-label="Selected easing curve">
            <path className={styles.curveGrid} d="M8 10V70H92 M8 40H92 M50 10V70" />
            <path className={styles.curveLine} d={curvePaths[easing]} />
          </svg>
        </div>
        <div className={styles.presets}>
          <span>STARTING POINTS</span>
          <div>
            <button type="button" onClick={() => { setMode("orbit"); setDuration(6); setIntensity(35); setEasing("ease-in-out"); setProgress(0); setPaused(false); }}>DRIFT / 01</button>
            <button type="button" onClick={() => { setMode("pulse"); setDuration(2); setIntensity(85); setEasing("cubic-bezier(.2,.8,.2,1)"); setProgress(0); setPaused(false); }}>IMPACT / 02</button>
            <button type="button" onClick={() => { setMode("stagger"); setDuration(5); setIntensity(55); setEasing("steps(5,end)"); setProgress(0); setPaused(false); }}>GLITCH / 03</button>
          </div>
        </div>
        <div className={styles.recipe}>
          <div><span>REPRODUCIBLE RECIPE / JSON</span><button type="button" onClick={copyRecipe}>{copied ? "COPIED ✓" : "COPY RECIPE ↗"}</button></div>
          <pre>{JSON.stringify(recipe, null, 2)}</pre>
          <p className={styles.copyMessage} role="status" aria-live="polite">{copyMessage}</p>
        </div>
        <button className={styles.reset} type="button" onClick={reset}>↺ RESET PARAMETERS</button>
      </aside>
    </section>
  );
}
