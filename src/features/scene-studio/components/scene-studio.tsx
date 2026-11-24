"use client";

import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox, TransformControls } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRef } from "react";
import type { Mesh } from "three";
import styles from "./scene-studio.module.css";

type ShapeKind = "box" | "sphere" | "torus";
type SceneObject = { id: number; name: string; kind: ShapeKind; color: string; position: [number, number, number]; rotation: [number, number, number]; scale: number; visible: boolean };
type TransformTool = "select" | "move" | "rotate" | "scale";

const initialObjects: SceneObject[] = [
  { id: 1, name: "Signal / cube", kind: "box", color: "#f05b3e", position: [-1.05, 0.1, 0], rotation: [0, 0, -0.12], scale: 1, visible: true },
  { id: 2, name: "Orbit / ring", kind: "torus", color: "#243bd6", position: [0.95, 0.35, -0.2], rotation: [0.35, 0.2, 0], scale: 0.9, visible: true },
  { id: 3, name: "Core / sphere", kind: "sphere", color: "#c6d83b", position: [0.05, -0.85, 0.55], rotation: [0, 0, 0], scale: 0.72, visible: true },
];

function ObjectMesh({ item, selected, tool, onSelect, onTransform }: { item: SceneObject; selected: boolean; tool: TransformTool; onSelect: () => void; onTransform: (transform: Pick<SceneObject, "position" | "rotation" | "scale">) => void }) {
  const meshRef = useRef<Mesh>(null);
  const material = { color: item.color, roughness: 0.28, metalness: 0.12 };
  let geometry: ReactNode;
  if (item.kind === "box") geometry = <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.12} smoothness={4}><meshStandardMaterial {...material} /></RoundedBox>;
  else if (item.kind === "sphere") geometry = <sphereGeometry args={[0.68, 64, 48]} />;
  else geometry = <torusGeometry args={[0.62, 0.19, 24, 80]} />;
  const mesh = (
    <mesh ref={meshRef} position={item.position} rotation={item.rotation} scale={item.scale} visible={item.visible} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      {geometry}
      {item.kind !== "box" && <meshStandardMaterial {...material} />}
      {selected && <mesh scale={1.035}><sphereGeometry args={[item.kind === "sphere" ? 0.69 : 0.82, 24, 24]} /><meshBasicMaterial color="#20211f" wireframe transparent opacity={0.18} /></mesh>}
    </mesh>
  );
  if (selected && tool !== "select") {
    const mode = tool === "move" ? "translate" : tool;
    return <TransformControls mode={mode} onMouseUp={() => {
      const target = meshRef.current;
      if (target) onTransform({
        position: [Number(target.position.x.toFixed(3)), Number(target.position.y.toFixed(3)), Number(target.position.z.toFixed(3))],
        rotation: [Number(target.rotation.x.toFixed(3)), Number(target.rotation.y.toFixed(3)), Number(target.rotation.z.toFixed(3))],
        scale: Number(((target.scale.x + target.scale.y + target.scale.z) / 3).toFixed(3)),
      });
    }}>{mesh}</TransformControls>;
  }
  return mesh;
}

function SceneCanvas({ objects, selectedId, tool, onSelect, onTransform }: { objects: SceneObject[]; selectedId: number; tool: TransformTool; onSelect: (id: number) => void; onTransform: (id: number, transform: Pick<SceneObject, "position" | "rotation" | "scale">) => void }) {
  return (
    <Canvas camera={{ position: [4.3, 3.1, 6.4], fov: 38 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["#e9e6dd"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 4]} intensity={2.3} />
      <pointLight position={[-4, 1, -3]} intensity={55} color="#f05b3e" distance={10} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        {objects.map((item) => <ObjectMesh key={item.id} item={item} selected={item.id === selectedId} tool={tool} onSelect={() => onSelect(item.id)} onTransform={(transform) => onTransform(item.id, transform)} />)}
        <ContactShadows position={[0, -1.7, 0]} opacity={0.28} scale={10} blur={2.5} far={4} />
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.5} maxDistance={11} />
    </Canvas>
  );
}

export function SceneStudio() {
  const [objects, setObjects] = useState(initialObjects);
  const [selectedId, setSelectedId] = useState(1);
  const [activeTool, setActiveTool] = useState<"select" | "move" | "rotate" | "scale">("select");
  const [sceneName, setSceneName] = useState("Untitled composition");
  const [saved, setSaved] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"hierarchy" | "inspector" | null>(null);
  const selected = useMemo(() => objects.find((item) => item.id === selectedId) ?? objects[0], [objects, selectedId]);

  const updateSelected = (patch: Partial<SceneObject>) => {
    setObjects((current) => current.map((item) => item.id === selectedId ? { ...item, ...patch } : item));
    setSaved(false);
  };
  const addObject = (kind: ShapeKind) => {
    const id = Math.max(0, ...objects.map((item) => item.id)) + 1;
    const labels: Record<ShapeKind, string> = { box: "Block", sphere: "Orb", torus: "Loop" };
    setObjects((current) => [...current, { id, name: `${labels[kind]} / ${String(id).padStart(2, "0")}`, kind, color: kind === "box" ? "#f05b3e" : kind === "sphere" ? "#243bd6" : "#c6d83b", position: [((id % 3) - 1) * 0.65, 0, -0.6], rotation: [0, 0, 0], scale: 0.8, visible: true }]);
    setSelectedId(id);
    setSaved(false);
  };
  const removeSelected = () => {
    if (objects.length <= 1) return;
    const next = objects.filter((item) => item.id !== selectedId);
    setObjects(next);
    setSelectedId(next[0].id);
    setSaved(false);
  };

  return (
    <main className={styles.studio}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/" aria-label="FORMA home"><span className={styles.brandMark}>F</span> FORMA <span className={styles.slash}>/</span> SCENE STUDIO</Link>
        <div className={styles.document}>
          <span className={styles.liveDot} />
          <input aria-label="Scene name" value={sceneName} onChange={(event) => { setSceneName(event.target.value); setSaved(false); }} />
          <span className={styles.saveState}>{saved ? "SAVED LOCALLY" : "LOCAL SESSION"}</span>
        </div>
        <div className={styles.topActions}>
          <button className={styles.quietButton} onClick={() => { setObjects(initialObjects); setSelectedId(1); setSaved(false); }}>RESET</button>
          <button className={styles.publishButton} onClick={() => setSaved(true)}>SAVE STUDY <span>↗</span></button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={`${styles.leftPanel} ${mobilePanel === "hierarchy" ? styles.mobilePanelOpen : ""}`}>
          <div className={styles.panelHeading}><span>01 / HIERARCHY</span><span>{String(objects.length).padStart(2, "0")} OBJECTS</span></div>
          <div className={styles.addTools}>
            <button onClick={() => addObject("box")}><b>＋</b> BLOCK</button>
            <button onClick={() => addObject("sphere")}><b>＋</b> ORB</button>
            <button onClick={() => addObject("torus")}><b>＋</b> LOOP</button>
          </div>
          <div className={styles.objectList}>
            {objects.map((item, index) => (
              <div className={`${styles.objectRow} ${item.id === selectedId ? styles.selectedRow : ""}`} key={item.id}>
                <button className={styles.objectSelect} onClick={() => setSelectedId(item.id)}>
                  <span className={styles.objectIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.objectGlyph}>{item.kind === "box" ? "◇" : item.kind === "sphere" ? "●" : "◎"}</span>
                  <span>{item.name}</span>
                </button>
                <button className={styles.visibility} aria-label={item.visible ? `Hide ${item.name}` : `Show ${item.name}`} aria-pressed={item.visible} onClick={() => { setObjects((current) => current.map((object) => object.id === item.id ? { ...object, visible: !object.visible } : object)); setSaved(false); }}>{item.visible ? "◉" : "○"}</button>
              </div>
            ))}
          </div>
          <div className={styles.panelFoot}><span>SCENE GRAPH</span><span>● LIVE</span></div>
        </aside>

        <section className={styles.stageColumn} aria-label="3D scene editor">
          <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
              {(["select", "move", "rotate", "scale"] as const).map((tool) => <button key={tool} className={activeTool === tool ? styles.activeTool : ""} aria-pressed={activeTool === tool} onClick={() => setActiveTool(tool)} title={tool}>{tool === "select" ? "↖" : tool === "move" ? "✣" : tool === "rotate" ? "⟳" : "↗"}<span>{tool.toUpperCase()}</span></button>)}
            </div>
            <span className={styles.viewportLabel}>PERSPECTIVE / REALTIME</span>
            <span className={styles.viewportMeta}>X · Y · Z</span>
          </div>
          <div className={styles.canvasFrame}>
            <div className={styles.canvasStamp}><span>FORMA / LAB 001</span><span>24° 08′ N — 3D SPACE</span></div>
            <div className={styles.canvasGrid} aria-hidden="true" />
            <div className={styles.canvas}><SceneCanvas objects={objects} selectedId={selected?.id ?? -1} tool={activeTool} onSelect={setSelectedId} onTransform={(id, transform) => { setObjects((current) => current.map((item) => item.id === id ? { ...item, ...transform } : item)); setSaved(false); }} /></div>
            <div className={styles.canvasHint}>DRAG TO ORBIT <i /> SCROLL TO ZOOM <i /> SELECT TO INSPECT</div>
            <div className={styles.axisWidget}><span>X</span><span>Y</span><span>Z</span></div>
          </div>
          <div className={styles.statusbar}><span><i /> ENGINE READY</span><span>WEBGL / THREE.JS</span><span>{objects.filter((item) => item.visible).length} VISIBLE OBJECTS</span><span>100% VIEW</span></div>
        </section>

        <aside className={`${styles.rightPanel} ${mobilePanel === "inspector" ? styles.mobilePanelOpen : ""}`}>
          <div className={styles.panelHeading}><span>02 / INSPECTOR</span><span>PROPERTIES</span></div>
          {selected ? <div className={styles.inspector}>
            <div className={styles.selectionIntro}><span>ACTIVE OBJECT / {String(selected.id).padStart(3, "0")}</span><strong>{selected.name}</strong><small>{selected.kind.toUpperCase()} · MESH STANDARD</small></div>
            <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>TRANSFORM <span>⌄</span></div>
              <div className={styles.axisFields}>
                {(["x", "y", "z"] as const).map((axis, index) => <label key={axis}><span>{axis.toUpperCase()}</span><input type="number" step="0.1" value={selected.position[index]} onChange={(event) => { const position: [number, number, number] = [...selected.position]; position[index] = Number(event.target.value); updateSelected({ position }); }} /></label>)}
              </div>
              <label className={styles.rangeField}><span>UNIFORM SCALE <b>{selected.scale.toFixed(2)}</b></span><input type="range" min="0.25" max="1.8" step="0.05" value={selected.scale} onChange={(event) => updateSelected({ scale: Number(event.target.value) })} /></label>
            </section>
            <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>SURFACE <span>⌄</span></div>
              <label className={styles.colorField}><span>BASE COLOR</span><input type="color" value={selected.color} onChange={(event) => updateSelected({ color: event.target.value })} /><code>{selected.color.toUpperCase()}</code></label>
              <div className={styles.swatches}>{["#f05b3e", "#243bd6", "#c6d83b", "#20211f", "#f4f1e8"].map((color) => <button key={color} style={{ backgroundColor: color }} aria-label={`Set color ${color}`} onClick={() => updateSelected({ color })} />)}</div>
            </section>
            <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>OBJECT <span>⌄</span></div>
              <label className={styles.nameField}><span>NAME</span><input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} /></label>
              <button className={styles.deleteButton} onClick={removeSelected} disabled={objects.length <= 1}>− REMOVE OBJECT</button>
            </section>
          </div> : <p className={styles.emptyState}>Select an object in the scene to inspect its form.</p>}
          <div className={styles.inspectorFoot}><span>FORM IS A VERB.</span><span>V. 01.0</span></div>
        </aside>
      </div>
      {mobilePanel && <button className={styles.mobileBackdrop} aria-label="Close editor panel" onClick={() => setMobilePanel(null)} />}
      <footer className={styles.mobileBar}><button aria-pressed={mobilePanel === "hierarchy"} onClick={() => setMobilePanel(mobilePanel === "hierarchy" ? null : "hierarchy")}>☷ <span>OBJECTS</span></button><span>SCENE / 001</span><button aria-pressed={mobilePanel === "inspector"} onClick={() => setMobilePanel(mobilePanel === "inspector" ? null : "inspector")}>◫ <span>INSPECT</span></button></footer>
    </main>
  );
}
