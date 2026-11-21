"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import styles from "./playground-experience.module.css";

type Point = { x: number; y: number; depth: number; size: number; tone: number };

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function createPoints(seed: number, amount: number): Point[] {
  const next = random(seed);
  return Array.from({ length: amount }, () => ({
    x: next(),
    y: next(),
    depth: next(),
    size: 0.45 + next() * 0.9,
    tone: Math.floor(next() * 3),
  }));
}

function polygon(
  context: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  fill: string,
) {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

export function PlaygroundExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const drawRef = useRef<(() => void) | null>(null);
  const [seed, setSeed] = useState(27);
  const [density, setDensity] = useState(64);
  const [influence, setInfluence] = useState(58);
  const [status, setStatus] = useState("FIELD AT REST");

  const recompose = useCallback(() => {
    setSeed((current) => current + 1);
    setStatus("NEW COMPOSITION");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !frame || !context) return;

    const draw = () => {
      const bounds = frame.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = "#141619";
      context.fillRect(0, 0, width, height);

      const points = createPoints(seed, density);
      const originX = width * (pointerRef.current.active ? pointerRef.current.x : 0.5);
      const originY = height * (pointerRef.current.active ? pointerRef.current.y : 0.5);
      const influenceRadius = Math.min(width, height) * (0.12 + influence / 180);
      const cell = Math.sqrt((width * height) / density) * 0.9;
      const palette = ["#c7f36b", "#ff765e", "#8294ff"];
      const projected = points.map((point) => {
        const baseX = point.x * width;
        const baseY = point.y * height;
        const dx = baseX - originX;
        const dy = baseY - originY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const falloff = pointerRef.current.active
          ? Math.max(0, 1 - distance / influenceRadius)
          : 0;
        const push = falloff * (influence / 100) * 54;
        return {
          x: baseX + (dx / (distance || 1)) * push,
          y: baseY + (dy / (distance || 1)) * push,
          z: point.depth,
          size: cell * point.size * (0.38 + point.depth * 0.6),
          tone: point.tone,
        };
      });

      context.lineWidth = 0.65;
      context.strokeStyle = "rgba(242,240,234,0.08)";
      for (let index = 0; index < projected.length; index += 1) {
        const point = projected[index];
        let nearest = -1;
        let nearestDistance = cell * 1.7;
        for (let candidate = index + 1; candidate < projected.length; candidate += 1) {
          const other = projected[candidate];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < nearestDistance) {
            nearest = candidate;
            nearestDistance = distance;
          }
        }
        if (nearest >= 0) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(projected[nearest].x, projected[nearest].y);
          context.stroke();
        }
      }

      projected
        .slice()
        .sort((a, b) => a.z - b.z)
        .forEach((point) => {
          const half = point.size;
          const rise = half * (0.42 + point.z * 0.72);
          const x = point.x;
          const y = point.y;
          const tone = palette[point.tone];
          const alpha = 0.25 + point.z * 0.62;

          polygon(
            context,
            [[x, y - rise], [x + half, y], [x, y + rise], [x - half, y]],
            `rgba(242,240,234,${0.05 + point.z * 0.08})`,
          );
          polygon(
            context,
            [[x - half, y], [x, y + rise], [x, y + rise + half * 0.62], [x - half, y + half * 0.62]],
            `rgba(100,105,112,${alpha * 0.55})`,
          );
          polygon(
            context,
            [[x + half, y], [x, y + rise], [x, y + rise + half * 0.62], [x + half, y + half * 0.62]],
            `rgba(20,22,25,${alpha})`,
          );
          polygon(
            context,
            [[x, y - rise], [x + half, y], [x, y + rise], [x - half, y]],
            tone,
          );
          context.globalAlpha = 0.12 + point.z * 0.2;
          context.strokeStyle = "#ffffff";
          context.stroke();
          context.globalAlpha = 1;
        });

      const glow = context.createRadialGradient(originX, originY, 0, originX, originY, influenceRadius);
      glow.addColorStop(0, "rgba(199,243,107,0.10)");
      glow.addColorStop(1, "rgba(199,243,107,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    };

    drawRef.current = draw;
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      drawRef.current = null;
    };
  }, [density, influence, seed]);

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
      active: true,
    };
    drawRef.current?.();
    setStatus("FIELD DISPLACED");
  };

  const handleStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const step = 0.05;
    pointerRef.current = {
      x: Math.min(1, Math.max(0, pointerRef.current.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0))),
      y: Math.min(1, Math.max(0, pointerRef.current.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0))),
      active: true,
    };
    drawRef.current?.();
    setStatus("FIELD DISPLACED");
  };

  const resetPointer = () => {
    pointerRef.current = { x: 0.5, y: 0.5, active: false };
    drawRef.current?.();
    setStatus("FIELD AT REST");
  };

  return (
    <div className={styles.experience}>
      <div className={styles.stageHeader}>
        <span>EXP. 001 / FORM STUDY</span>
        <span className={styles.live}><i /> LIVE FIELD</span>
      </div>
      <div
        className={styles.stage}
        ref={frameRef}
        onPointerMove={updatePointer}
        onPointerLeave={resetPointer}
        onPointerDown={updatePointer}
        onKeyDown={handleStageKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Interactive displacement field. Move or drag a pointer, or focus the stage and use arrow keys, to influence the geometry. Use the controls below to change density and force."
      >
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className={styles.stageOverlay}>
          <span>MOVE THROUGH MATTER</span>
          <span>SEED / {String(seed).padStart(3, "0")}</span>
        </div>
        <span className={styles.stageCrosshair} aria-hidden="true">+</span>
      </div>
      <div className={styles.stageFooter}>
        <span>{status}</span>
        <span>POINTER / TOUCH RESPONSIVE</span>
      </div>
      <div className={styles.controls}>
        <div className={styles.controlIntro}>
          <span>FIELD PARAMETERS</span>
          <button type="button" onClick={recompose}>RECOMPOSE <b aria-hidden="true">↗</b></button>
        </div>
        <label className={styles.rangeControl}>
          <span><span>DENSITY</span><output>{density}</output></span>
          <input type="range" min="24" max="96" step="4" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
        </label>
        <label className={styles.rangeControl}>
          <span><span>INFLUENCE</span><output>{influence}%</output></span>
          <input type="range" min="10" max="100" step="5" value={influence} onChange={(event) => setInfluence(Number(event.target.value))} />
        </label>
        <button className={styles.reset} type="button" onClick={() => { setDensity(64); setInfluence(58); resetPointer(); }}>RESET PARAMETERS</button>
      </div>
      <p className={styles.caption}>A seeded arrangement of forms. Your movement bends the field; the rules stay yours to tune.</p>
    </div>
  );
}
