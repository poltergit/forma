"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import styles from "./playground-experience.module.css";
import {
  createGeneratorPoints, createPlaygroundScene, GENERATORS, PLAYGROUND_RECIPE_KEY, PLAYGROUND_SCENE_HANDOFF_KEY,
  type GeneratorId, type PlaygroundRecipe,
} from "../playground-scene";
import { createPortableRecipe, parsePortableRecipe, PLAYGROUND_PALETTES, PLAYGROUND_PRESETS, type PaletteId } from "../playground-recipe";

const defaultPalette = PLAYGROUND_PALETTES[0];

function polygon(context: CanvasRenderingContext2D, points: Array<[number, number]>, fill: string) {
  context.beginPath();
  points.forEach(([x, y], index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
  context.closePath(); context.fillStyle = fill; context.fill();
}

function readRecipes(): PlaygroundRecipe[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(PLAYGROUND_RECIPE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is PlaygroundRecipe =>
      !!item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string" &&
      item.name.length > 0 && item.name.length <= 48 && ["displacement", "orbital-bloom", "woven-lattice"].includes(item.generator) &&
      Number.isInteger(item.seed) && item.seed >= 0 && item.seed <= 9_999_999 &&
      Number.isInteger(item.density) && item.density >= 12 && item.density <= 96 &&
      Number.isFinite(item.influence) && item.influence >= 0 && item.influence <= 100 && typeof item.createdAt === "string" && (item.palette === undefined || PLAYGROUND_PALETTES.some((paletteItem) => paletteItem.id === item.palette)),
    ).slice(0, 24);
  } catch { return []; }
}

export function PlaygroundExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const drawRef = useRef<(() => void) | null>(null);
  const [generator, setGenerator] = useState<GeneratorId>("displacement");
  const [seed, setSeed] = useState(27);
  const [density, setDensity] = useState(64);
  const [influence, setInfluence] = useState(58);\n  const [paletteId, setPaletteId] = useState<PaletteId>("atelier");
  const [status, setStatus] = useState("COMPOSITION AT REST");
  const [recipeName, setRecipeName] = useState("Untitled study");
  const [recipes, setRecipes] = useState<PlaygroundRecipe[]>([]);
  const [recipesReady, setRecipesReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => { setRecipes(readRecipes()); setRecipesReady(true); }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const activeGenerator = GENERATORS.find((item) => item.id === generator) ?? GENERATORS[0];\n  const activePalette = PLAYGROUND_PALETTES.find((item) => item.id === paletteId) ?? defaultPalette;
  const persistRecipes = (next: PlaygroundRecipe[]) => {
    setRecipes(next);
    window.localStorage.setItem(PLAYGROUND_RECIPE_KEY, JSON.stringify(next));
  };

  const recompose = useCallback(() => {
    setSeed((current) => (current + 1) % 10_000_000);
    setStatus("NEW COMPOSITION");
  }, []);

  const saveRecipe = () => {
    const cleanName = recipeName.trim().slice(0, 48);
    if (!cleanName) { setStatus("GIVE YOUR STUDY A NAME"); return; }
    const recipe: PlaygroundRecipe = { id: window.crypto.randomUUID(), name: cleanName, generator, seed, density, influence, palette: paletteId, createdAt: new Date().toISOString() };
    persistRecipes([recipe, ...recipes].slice(0, 24));
    setStatus("RECIPE SAVED TO THIS DEVICE");
  };

  const loadRecipe = (recipe: PlaygroundRecipe) => {
    setGenerator(recipe.generator); setSeed(recipe.seed); setDensity(recipe.density); setInfluence(recipe.influence); setPaletteId((recipe.palette as PaletteId) ?? "atelier");
    setRecipeName(recipe.name); pointerRef.current = { x: 0.5, y: 0.5, active: false }; setStatus("RECIPE RESTORED");
  };

  const deleteRecipe = (id: string) => { persistRecipes(recipes.filter((recipe) => recipe.id !== id)); setStatus("RECIPE REMOVED"); };

  const continueInSceneStudio = () => {
    try {
      const scene = createPlaygroundScene(seed, density, influence, generator, activePalette.colors);
      window.localStorage.setItem(PLAYGROUND_SCENE_HANDOFF_KEY, JSON.stringify(scene));
      window.location.assign("/scene-studio?from=playground");
    } catch { setStatus("SCENE HANDOFF UNAVAILABLE"); }
  };

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
      canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = activePalette.background; context.fillRect(0, 0, width, height);

      const points = createGeneratorPoints(seed, density, generator);
      const originX = width * (pointerRef.current.active ? pointerRef.current.x : 0.5);
      const originY = height * (pointerRef.current.active ? pointerRef.current.y : 0.5);
      const influenceRadius = Math.min(width, height) * (0.12 + influence / 180);
      const cell = Math.sqrt((width * height) / density) * 0.9;
      const projected = points.map((point) => {
        const baseX = point.x * width; const baseY = point.y * height;
        const dx = baseX - originX; const dy = baseY - originY; const distance = Math.hypot(dx, dy);
        const falloff = pointerRef.current.active ? Math.max(0, 1 - distance / influenceRadius) : 0;
        const push = falloff * (influence / 100) * 54;
        return { x: baseX + (dx / (distance || 1)) * push, y: baseY + (dy / (distance || 1)) * push, z: point.depth, size: cell * point.size * (0.38 + point.depth * 0.6), tone: point.tone };
      });

      context.lineWidth = generator === "woven-lattice" ? 1 : 0.65;
      context.strokeStyle = "rgba(32,33,31,0.2)";
      if (generator === "displacement") {
        for (let index = 0; index < projected.length; index += 1) {
          const point = projected[index]; let nearest = -1; let nearestDistance = cell * 1.7;
          for (let candidate = index + 1; candidate < projected.length; candidate += 1) {
            const other = projected[candidate]; const distance = Math.hypot(point.x - other.x, point.y - other.y);
            if (distance < nearestDistance) { nearest = candidate; nearestDistance = distance; }
          }
          if (nearest >= 0) { context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(projected[nearest].x, projected[nearest].y); context.stroke(); }
        }
      } else if (generator === "orbital-bloom") {
        for (let ring = 1; ring <= 4; ring += 1) {
          context.beginPath(); context.ellipse(width / 2, height / 2, width * ring * 0.075, height * ring * 0.075, 0, 0, Math.PI * 2); context.stroke();
        }
        projected.forEach((point, index) => {
          if (index % 3 !== 0) return;
          context.beginPath(); context.moveTo(width / 2, height / 2); context.lineTo(point.x, point.y); context.stroke();
        });
      } else {
        const columns = Math.ceil(Math.sqrt(density));
        for (let index = 0; index < projected.length; index += 1) {
          const point = projected[index]; const right = projected[index + 1]; const below = projected[index + columns];
          if (right && index % columns !== columns - 1) { context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(right.x, right.y); context.stroke(); }
          if (below) { context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(below.x, below.y); context.stroke(); }
        }
      }

      projected.slice().sort((a, b) => a.z - b.z).forEach((point, index) => {
        const half = point.size * (generator === "orbital-bloom" ? 0.68 : 1);
        const rise = half * (0.42 + point.z * 0.72); const x = point.x; const y = point.y;
        const tone = activePalette.colors[point.tone]; const alpha = 0.25 + point.z * 0.62;
        if (generator === "orbital-bloom") {
          context.save(); context.translate(x, y); context.rotate((index / projected.length) * Math.PI);
          context.beginPath(); context.ellipse(0, 0, half * 0.48, half * 1.5, 0, 0, Math.PI * 2);
          context.fillStyle = tone; context.globalAlpha = 0.48 + point.z * 0.45; context.fill(); context.restore();
        } else if (generator === "woven-lattice") {
          context.save(); context.translate(x, y); context.rotate(Math.PI / 4); context.fillStyle = tone;
          context.globalAlpha = alpha; context.fillRect(-half * 0.45, -half * 0.45, half * 0.9, half * 0.9); context.restore();
        } else {
          polygon(context, [[x, y - rise], [x + half, y], [x, y + rise], [x - half, y]], `rgba(255,253,247,${0.18 + point.z * 0.12})`);
          polygon(context, [[x - half, y], [x, y + rise], [x, y + rise + half * 0.62], [x - half, y + half * 0.62]], `rgba(119,119,111,${alpha * 0.55})`);
          polygon(context, [[x + half, y], [x, y + rise], [x, y + rise + half * 0.62], [x + half, y + half * 0.62]], `rgba(32,33,31,${alpha * 0.7})`);
          polygon(context, [[x, y - rise], [x + half, y], [x, y + rise], [x - half, y]], tone);
          context.globalAlpha = 0.12 + point.z * 0.2; context.strokeStyle = "#fffdf7"; context.stroke(); context.globalAlpha = 1;
        }
      });

      const glow = context.createRadialGradient(originX, originY, 0, originX, originY, influenceRadius);
      glow.addColorStop(0, "rgba(240,91,62,0.13)"); glow.addColorStop(1, "rgba(240,91,62,0)");
      context.fillStyle = glow; context.fillRect(0, 0, width, height);
    };

    drawRef.current = draw; draw();
    const observer = new ResizeObserver(draw); observer.observe(frame);
    return () => { observer.disconnect(); drawRef.current = null; };
  }, [activePalette, density, generator, influence, seed]);

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height, active: true };
    drawRef.current?.(); setStatus("COMPOSITION DISTURBED");
  };

  const handleStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault(); const step = 0.05;
    pointerRef.current = {
      x: Math.min(1, Math.max(0, pointerRef.current.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0))),
      y: Math.min(1, Math.max(0, pointerRef.current.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0))), active: true,
    };
    drawRef.current?.(); setStatus("FIELD DISPLACED");
  };

  const resetPointer = () => { pointerRef.current = { x: 0.5, y: 0.5, active: false }; drawRef.current?.(); setStatus("FIELD AT REST"); };

  return (
    <div className={styles.experience}>
      <div className={styles.stageHeader}><span>EXP. {activeGenerator.number} / {activeGenerator.name.toUpperCase()}</span><span className={styles.live}><i /> LIVE INSTRUMENT</span></div>
      <div className={styles.generatorPicker} role="group" aria-label="Choose a generative instrument">
        {GENERATORS.map((item) => <button key={item.id} type="button" aria-pressed={generator === item.id} onClick={() => { setGenerator(item.id); setStatus(`${item.name.toUpperCase()} LOADED`); }}>
          <span>{item.number}</span><strong>{item.name}</strong><small>{item.note}</small>
        </button>)}
      </div>
      <div className={styles.stage} ref={frameRef} onPointerMove={updatePointer} onPointerLeave={resetPointer} onPointerCancel={resetPointer} onPointerUp={(event) => { if (event.pointerType === "touch") resetPointer(); }} onPointerDown={updatePointer} onKeyDown={handleStageKeyDown} tabIndex={0} role="group" aria-label={`Interactive ${activeGenerator.name}. Move or drag a pointer, or focus the stage and use arrow keys to influence the geometry.`}>
        <div className={styles.staticFallback} aria-hidden="true"><i /><i /><i /><i /></div><canvas ref={canvasRef} aria-hidden="true" />
        <div className={styles.stageOverlay}><span>MOVE THROUGH THE FORM</span><span>SEED / {String(seed).padStart(3, "0")}</span></div><span className={styles.stageCrosshair} aria-hidden="true">+</span>
      </div>
      <div className={styles.stageFooter}><span>{status}</span><span>POINTER / TOUCH / KEYBOARD</span></div>
      <section className={styles.presetStudio} aria-label="Curated starting points">
        <div className={styles.presetHeading}><span>START WITH A GESTURE</span><small>PRESETS ARE STARTING POINTS — KEEP REMIXING</small></div>
        <div className={styles.presetList}>{PLAYGROUND_PRESETS.map((preset) => <button type="button" key={preset.id} onClick={() => { setGenerator(preset.generator); setDensity(preset.density); setInfluence(preset.influence); setPaletteId(preset.palette); setStatus(`${preset.name.toUpperCase()} LOADED`); }}>
          <span>{preset.note}</span><strong>{preset.name}</strong><small>{preset.generator.replace("-", " ").toUpperCase()} / {preset.density} FORMS</small>
        </button>)}</div>
      </section>
      <div className={styles.paletteStudio} aria-label="Color palettes">
        <span>COLOR LANGUAGE</span>{PLAYGROUND_PALETTES.map((item) => <button type="button" key={item.id} aria-pressed={paletteId === item.id} onClick={() => setPaletteId(item.id)}>
          <i>{item.colors.map((color) => <b key={color} style={{ backgroundColor: color }} />)}</i><small>{item.name}</small>
        </button>)}
      </div>
      <div className={styles.controls}>
        <div className={styles.controlIntro}><span>INSTRUMENT PARAMETERS</span><button type="button" onClick={recompose}>RECOMPOSE <b aria-hidden="true">↗</b></button></div>
        <label className={styles.rangeControl}><span><span>DENSITY</span><output>{density}</output></span><input type="range" min="12" max="96" step="4" value={density} onChange={(event) => setDensity(Number(event.target.value))} /></label>
        <label className={styles.rangeControl}><span><span>INFLUENCE</span><output>{influence}%</output></span><input type="range" min="0" max="100" step="5" value={influence} onChange={(event) => setInfluence(Number(event.target.value))} /></label>
        <label className={styles.seedControl}><span>SEED</span><input aria-label="Composition seed" type="number" min="0" max="9999999" value={seed} onChange={(event) => setSeed(Math.min(9999999, Math.max(0, Number(event.target.value) || 0)))} /></label>
        <button className={styles.reset} type="button" onClick={() => { setDensity(64); setInfluence(58); setSeed(27); resetPointer(); }}>RESET PARAMETERS</button>
      </div>
      <section className={styles.recipeStudio} aria-labelledby="recipe-title">
        <div className={styles.recipeHeading}><div><span>YOUR MATERIAL LIBRARY</span><h3 id="recipe-title">Save a <em>recipe.</em></h3></div><p>Keep the rules, not just the result. Recipes stay on this device and can be restored at any time.</p></div>
        <div className={styles.recipeSave}>
          <label><span>NAME THIS STUDY</span><input value={recipeName} maxLength={48} onChange={(event) => setRecipeName(event.target.value)} /></label>
          <button type="button" onClick={saveRecipe}>SAVE RECIPE <b aria-hidden="true">＋</b></button>
        </div>
        <div className={styles.portableActions}>
          <button type="button" onClick={() => {
            const recipe = createPortableRecipe({ id: "export", name: recipeName.trim() || "Untitled study", generator, seed, density, influence, palette: paletteId, createdAt: new Date().toISOString() });
            const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `forma-${generator}-${seed}.json`; anchor.click(); URL.revokeObjectURL(url); setStatus("PORTABLE RECIPE EXPORTED");
          }}>EXPORT .JSON ↗</button>
          <label className={styles.importRecipe}>IMPORT .JSON ↗<input type="file" accept="application/json,.json" onChange={async (event) => {
            const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (!file) return;
            try { const imported = parsePortableRecipe(await file.text()); const recipe: PlaygroundRecipe = { ...imported, id: window.crypto.randomUUID(), createdAt: new Date().toISOString() }; loadRecipe(recipe); setStatus("PORTABLE RECIPE IMPORTED"); }
            catch (error) { setStatus(error instanceof Error ? error.message.toUpperCase() : "RECIPE IMPORT FAILED"); }
          }} /></label>
        </div>
        <div className={styles.recipeList} aria-live="polite">
          {!recipesReady ? <p>Loading your local recipes…</p> : recipes.length === 0 ? <p>No saved recipes yet. Tune an instrument and save your first study.</p> : recipes.map((recipe) => <article key={recipe.id}>
            <button type="button" className={styles.recipeLoad} onClick={() => loadRecipe(recipe)}>
              <span>{GENERATORS.find((item) => item.id === recipe.generator)?.number} / SEED {String(recipe.seed).padStart(3, "0")}</span><strong>{recipe.name}</strong>
              <small>{recipe.generator.replace("-", " ").toUpperCase()} · {recipe.density} FORMS · {recipe.influence}% INFLUENCE</small>
            </button>
            <button type="button" className={styles.recipeDelete} aria-label={`Delete recipe ${recipe.name}`} onClick={() => deleteRecipe(recipe.id)}>×</button>
          </article>)}
        </div>
      </section>
      <div className={styles.outputActions}><span>EXPORT STUDY / {activeGenerator.number} · SEED {seed}</span><button type="button" onClick={continueInSceneStudio}>TAKE INTO SCENE STUDIO <b aria-hidden="true">↗</b></button></div>
      <p className={styles.caption}>{activeGenerator.note} The same seed and settings reproduce the same logical composition. Save a recipe to return to its exact rules, or carry the generated forms into Scene Studio.</p>
    </div>
  );
}
