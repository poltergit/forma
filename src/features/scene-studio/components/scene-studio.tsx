"use client";

import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Environment, OrbitControls, RoundedBox, Text, Text3D, TransformControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useRef } from "react";
import { ACESFilmicToneMapping, LinearToneMapping, NeutralToneMapping, NoToneMapping, OrthographicCamera, Vector2, type Group } from "three";
import helvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { useThree } from "@react-three/fiber";
import styles from "./scene-studio.module.css";
import { RoomManifest } from "@/components/shell/room-manifest";
import { parseSceneDocument, readSceneLibrary, SCENE_STORAGE_KEY } from "../scene-document";
import type { SceneDocument } from "../scene-document";
import { deleteCloudComposition, getSceneCloudSession, loadCloudCompositions, saveCloudComposition, signOutCloudSession } from "../scene-cloud";
import { PLAYGROUND_SCENE_HANDOFF_KEY } from "@/features/playground/playground-scene";
import { applySceneMaterialPreset, SCENE_MATERIAL_PRESETS, type SceneMaterialId } from "../scene-materials";
import { DEFAULT_SCENE_LIGHTING, normalizeSceneLighting, SCENE_ENVIRONMENTS, SCENE_LIGHTING_PRESETS, type SceneLightingDocument } from "../scene-lighting";
import { DEFAULT_SCENE_RENDER, normalizeSceneRender, SCENE_RENDER_QUALITY, type SceneRenderDocument } from "../scene-render";

type ShapeKind = "box" | "sphere" | "torus" | "text";
type SceneObject = { id: number; name: string; kind: ShapeKind; color: string; text?: string; fontSize?: number; letterSpacing?: number; typographyStyle?: "flat" | "extruded" | "inflated"; extrusion?: number; bevel?: number; roughness: number; metalness: number; emissive: string; transmission: number; thickness: number; ior: number; clearcoat: number; clearcoatRoughness: number; opacity: number; position: [number, number, number]; rotation: [number, number, number]; scale: number; visible: boolean };
type CameraView = "perspective" | "front" | "top" | "side";
type TransformTool = "select" | "move" | "rotate" | "scale";

type EditorSnapshot = { objects: SceneDocument["objects"]; camera: CameraView; name: string; lighting: SceneLightingDocument; render: SceneRenderDocument };
type SceneVersion = EditorSnapshot & { id: string; createdAt: string };

function makeThumbnail(objects: SceneDocument["objects"]) {
  const visible = objects.filter((item) => item.visible).slice(0, 8);
  const marks = visible.map((item, index) => {
    const x = 42 + (index % 4) * 52 + item.position[0] * 7;
    const y = 42 + Math.floor(index / 4) * 48 - item.position[1] * 7;
    const size = Math.max(9, Math.min(25, 15 * item.scale));
    if (item.kind === "text") { const label = (item.text ?? "TYPE").slice(0, 12).replace(/[&<>"]/g, ""); return `<text x="${x}" y="${y}" fill="${item.color}" font-size="${Math.max(10, size)}" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle">${label}</text>`; }
    if (item.kind === "sphere") return `<circle cx="${x}" cy="${y}" r="${size}" fill="${item.color}" />`;
    if (item.kind === "torus") return `<circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${item.color}" stroke-width="8" />`;
    return `<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" rx="5" fill="${item.color}" transform="rotate(-12 ${x} ${y})" />`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 132"><rect width="240" height="132" fill="#f1ede3"/><path d="M0 44H240M0 88H240M60 0V132M120 0V132M180 0V132" stroke="#17151d" stroke-opacity=".07"/>${marks}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const cameraViews: Record<CameraView, [number, number, number]> = {
  perspective: [4.3, 3.1, 6.4],
  front: [0, 0.2, 8],
  top: [0, 8, 0.001],
  side: [8, 0.2, 0],
};

function CameraRig({ view, projection }: { view: CameraView; projection: SceneRenderDocument["projection"] }) {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    camera.position.set(...cameraViews[view]);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    if (camera instanceof OrthographicCamera) {
      // R3F exposes the live camera as a readonly hook value; camera configuration belongs in this effect.
      // eslint-disable-next-line react-hooks/immutability
      camera.zoom = 68;
    }
    camera.updateProjectionMatrix();
  }, [camera, view, projection]);
  return null;
}

const initialObjects: SceneObject[] = [
  { id: 1, name: "Signal / cube", kind: "box", color: "#ff5b45", roughness: 0.28, metalness: 0.12, emissive: "#000000", transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1, position: [-1.05, 0.1, 0], rotation: [0, 0, -0.12], scale: 1, visible: true },
  { id: 2, name: "Orbit / ring", kind: "torus", color: "#6855f5", roughness: 0.28, metalness: 0.12, emissive: "#000000", transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1, position: [0.95, 0.35, -0.2], rotation: [0.35, 0.2, 0], scale: 0.9, visible: true },
  { id: 3, name: "Core / sphere", kind: "sphere", color: "#d8ff38", roughness: 0.28, metalness: 0.12, emissive: "#000000", transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1, position: [0.05, -0.85, 0.55], rotation: [0, 0, 0], scale: 0.72, visible: true },
];

function ObjectMesh({ item, selected, tool, onSelect, onTransform }: { item: SceneObject; selected: boolean; tool: TransformTool; onSelect: () => void; onTransform: (transform: Pick<SceneObject, "position" | "rotation" | "scale">) => void }) {
  const groupRef = useRef<Group>(null);
  const material = { color: item.color, roughness: item.roughness, metalness: item.metalness, emissive: item.emissive, emissiveIntensity: item.emissive === "#000000" ? 0 : 0.65, transmission: item.transmission, thickness: item.thickness, ior: item.ior, clearcoat: item.clearcoat, clearcoatRoughness: item.clearcoatRoughness, transparent: item.transmission > 0 || item.opacity < 1, opacity: item.opacity, envMapIntensity: 1.35 };
  const handleTransform = () => {
    const target = groupRef.current;
    if (target) onTransform({
      position: [Number(target.position.x.toFixed(3)), Number(target.position.y.toFixed(3)), Number(target.position.z.toFixed(3))],
      rotation: [Number(target.rotation.x.toFixed(3)), Number(target.rotation.y.toFixed(3)), Number(target.rotation.z.toFixed(3))],
      scale: Number(((target.scale.x + target.scale.y + target.scale.z) / 3).toFixed(3)),
    });
  };
  let geometry: ReactNode;
  if (item.kind === "box") geometry = <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.12} smoothness={4}><meshPhysicalMaterial {...material} /></RoundedBox>;
  else if (item.kind === "sphere") geometry = <sphereGeometry args={[0.68, 64, 48]} />;
  else geometry = <torusGeometry args={[0.62, 0.19, 24, 80]} />;
  const form = item.kind === "text" ? (
    item.typographyStyle === "flat" || !item.typographyStyle ? (
      <Text
        color={item.color}
        fontSize={item.fontSize ?? 0.72}
        letterSpacing={item.letterSpacing ?? 0.015}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={5}
        outlineWidth={selected ? 0.012 : 0}
        outlineColor="#090810"
        onClick={(event) => { event.stopPropagation(); onSelect(); }}
      >
        {item.text ?? "FORMA"}
      </Text>
    ) : (
      <Center>
        <Text3D
          font={helvetikerBold}
          size={item.fontSize ?? 0.72}
          height={item.typographyStyle === "inflated" ? Math.max(0.12, item.extrusion ?? 0.24) : item.extrusion ?? 0.18}
          curveSegments={12}
          bevelEnabled
          bevelSegments={5}
          bevelSize={item.typographyStyle === "inflated" ? Math.max(0.055, item.bevel ?? 0.09) : item.bevel ?? 0.025}
          bevelThickness={item.typographyStyle === "inflated" ? Math.max(0.055, item.bevel ?? 0.09) : item.bevel ?? 0.025}
          onClick={(event) => { event.stopPropagation(); onSelect(); }}
        >
          <meshPhysicalMaterial {...material} />
          {item.text ?? "FORMA"}
        </Text3D>
      </Center>
    )
  ) : (
    <mesh onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      {geometry}
      {item.kind !== "box" && <meshPhysicalMaterial {...material} />}
      {selected && <mesh scale={1.035}><sphereGeometry args={[item.kind === "sphere" ? 0.69 : 0.82, 24, 24]} /><meshBasicMaterial color="#F5F1E8" wireframe transparent opacity={0.22} /></mesh>}
    </mesh>
  );
  const group = <group ref={groupRef} position={item.position} rotation={item.rotation} scale={item.scale} visible={item.visible}>{form}</group>;
  if (selected && tool !== "select") {
    const mode = tool === "move" ? "translate" : tool;
    return <TransformControls mode={mode} onMouseUp={handleTransform}>{group}</TransformControls>;
  }
  return group;
}

const chromaticShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv; void main(){ vec2 shift=vec2(amount,0.0); vec4 color; color.r=texture2D(tDiffuse,vUv+shift).r; color.g=texture2D(tDiffuse,vUv).g; color.b=texture2D(tDiffuse,vUv-shift).b; color.a=texture2D(tDiffuse,vUv).a; gl_FragColor=color; }`,
};
const vignetteShader = {
  uniforms: { tDiffuse: { value: null }, strength: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float strength; varying vec2 vUv; void main(){ vec4 color=texture2D(tDiffuse,vUv); vec2 uv=(vUv-0.5)*0.9; float vignette=1.0-smoothstep(0.18,0.82,dot(uv,uv)*1.45); color.rgb*=mix(1.0,vignette,strength); gl_FragColor=color; }`,
};

function SceneRenderPipeline({ settings }: { settings: SceneRenderDocument }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  // This effect intentionally configures the Three.js renderer as an imperative WebGL side effect.
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composerRef.current = composer;
    // Three.js renderer tone mapping is intentionally configured at the WebGL boundary.
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = settings.toneMapping === "linear" ? LinearToneMapping
      : settings.toneMapping === "neutral" ? NeutralToneMapping
      : settings.toneMapping === "none" ? NoToneMapping : ACESFilmicToneMapping;
    gl.toneMappingExposure = 1;
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), settings.bloom, 0.42, 0.82);
    bloom.enabled = settings.bloom > 0;
    composer.addPass(bloom);
    const depth = new BokehPass(scene, camera, { focus: settings.focusDistance, aperture: settings.aperture, maxblur: 0.012 });
    depth.enabled = settings.aperture > 0;
    composer.addPass(depth);
    const vignette = new ShaderPass(vignetteShader);
    vignette.uniforms.strength.value = settings.vignette;
    vignette.enabled = settings.vignette > 0;
    composer.addPass(vignette);
    const chromatic = new ShaderPass(chromaticShader);
    chromatic.uniforms.amount.value = settings.chromaticAberration;
    chromatic.enabled = settings.chromaticAberration > 0;
    composer.addPass(chromatic);
    composer.addPass(new OutputPass());
    composer.setSize(size.width, size.height);
    return () => {
      composer.dispose();
      if (composerRef.current === composer) composerRef.current = null;
    };
  }, [camera, gl, scene, settings, size.height, size.width]);
  useFrame((_, delta) => composerRef.current?.render(delta), 1);
  return null;
}

function SceneCanvas({ objects, selectedId, tool, view, lighting, render, onSelect, onTransform }: { objects: SceneObject[]; selectedId: number; tool: TransformTool; view: CameraView; lighting: SceneLightingDocument; render: SceneRenderDocument; onSelect: (id: number) => void; onTransform: (id: number, transform: Pick<SceneObject, "position" | "rotation" | "scale">) => void }) {
  return (
    <Canvas key={render.projection} orthographic={render.projection === "orthographic"} camera={render.projection === "orthographic" ? { position: cameraViews.perspective, zoom: 85 } : { position: cameraViews.perspective, fov: 38 }} dpr={render.quality === "draft" ? 1 : render.quality === "studio" ? 1.5 : 2} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
      <color attach="background" args={["#17151d"]} />
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight position={lighting.key.position} intensity={lighting.key.intensity} color={lighting.key.color} castShadow />
      <directionalLight position={lighting.fill.position} intensity={lighting.fill.intensity} color={lighting.fill.color} />
      <directionalLight position={lighting.rim.position} intensity={lighting.rim.intensity} color={lighting.rim.color} />
      <Suspense fallback={null}>
        <CameraRig view={view} projection={render.projection} />
        <SceneRenderPipeline settings={render} />
        <Environment preset={lighting.environment} environmentIntensity={lighting.environmentIntensity} />
        {objects.map((item) => <ObjectMesh key={item.id} item={item} selected={item.id === selectedId} tool={tool} onSelect={() => onSelect(item.id)} onTransform={(transform) => onTransform(item.id, transform)} />)}
        {lighting.shadows && <ContactShadows position={[0, -1.7, 0]} opacity={lighting.shadowOpacity} scale={10} blur={lighting.shadowBlur} far={4} />}
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={2.2} maxDistance={18} />
    </Canvas>
  );
}

export function SceneStudio() {
  const [objects, setObjects] = useState(initialObjects);
  const [lighting, setLighting] = useState<SceneLightingDocument>(DEFAULT_SCENE_LIGHTING);
  const [renderSettings, setRenderSettings] = useState<SceneRenderDocument>(DEFAULT_SCENE_RENDER);
  const [compositions, setCompositions] = useState<SceneDocument[]>([]);
  const [activeCompositionId, setActiveCompositionId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("LOADING LIBRARY");
  const [cloudUserId, setCloudUserId] = useState<string | null>(null);
  const [cloudMode, setCloudMode] = useState<"unconfigured" | "signed-out" | "ready" | "error">("unconfigured");
  const [storageKey, setStorageKey] = useState(SCENE_STORAGE_KEY);
  const cloudRevisions = useRef(new Map<string, number>());
  const history = useRef<{ past: EditorSnapshot[]; future: EditorSnapshot[] }>({ past: [], future: [] });
  const variationCounter = useRef(0);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [versions, setVersions] = useState<SceneVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const versionStorageKey = (id: string) => `forma:scene-studio:versions:v1:${id}`;
  const snapshot = (): EditorSnapshot => ({ objects: structuredClone(objects), camera: cameraView, name: sceneName, lighting: structuredClone(lighting), render: structuredClone(renderSettings) });
  const recordHistory = () => {
    history.current.past = [...history.current.past.slice(-49), snapshot()];
    history.current.future = [];
    setHistoryState({ canUndo: true, canRedo: false });
  };
  const refreshHistoryState = () => setHistoryState({ canUndo: history.current.past.length > 0, canRedo: history.current.future.length > 0 });
  const applySnapshot = (entry: EditorSnapshot) => {
    setObjects(structuredClone(entry.objects));
    setCameraView(entry.camera);
    setSceneName(entry.name);
    setLighting(normalizeSceneLighting(entry.lighting));
    setRenderSettings(normalizeSceneRender(entry.render));
    setSelectedId(entry.objects[0]?.id ?? 1);
  };
  const undo = () => {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(snapshot());
    applySnapshot(previous);
    refreshHistoryState();
    setSaveStatus("UNDO");
  };
  const redo = () => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(snapshot());
    applySnapshot(next);
    refreshHistoryState();
    setSaveStatus("REDO");
  };
  const [selectedId, setSelectedId] = useState(1);
  const [activeTool, setActiveTool] = useState<"select" | "move" | "rotate" | "scale">("select");
  const [cameraView, setCameraView] = useState<CameraView>("perspective");
  const [sceneName, setSceneName] = useState("Untitled composition");
  const [mobilePanel, setMobilePanel] = useState<"hierarchy" | "inspector" | null>(null);
  const selected = useMemo(() => objects.find((item) => item.id === selectedId) ?? objects[0], [objects, selectedId]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  useEffect(() => {
    if (!activeCompositionId) return;
    const timeout = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(versionStorageKey(activeCompositionId));
        setVersions(stored ? JSON.parse(stored) as SceneVersion[] : []);
      } catch {
        setVersions([]);
      }
      setShowVersions(false);
      history.current = { past: [], future: [] };
      setHistoryState({ canUndo: false, canRedo: false });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [activeCompositionId]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      void (async () => {
        let activeStorageKey = SCENE_STORAGE_KEY;
        let library = readSceneLibrary(window.localStorage.getItem(activeStorageKey));
        let status = "LOCAL LIBRARY RESTORED";
        try {
          const session = await getSceneCloudSession();
          setCloudMode(session.status);
          if (session.status === "ready") {
            activeStorageKey = `${SCENE_STORAGE_KEY}:${session.userId}`;
            library = readSceneLibrary(window.localStorage.getItem(activeStorageKey));
            setCloudUserId(session.userId);
            const cloudLibrary = await loadCloudCompositions();
            const cloudById = new Map(cloudLibrary.map((item) => [item.id, item]));
            for (const cloudScene of cloudLibrary) {
              if (typeof cloudScene.revision === "number") cloudRevisions.current.set(cloudScene.id, cloudScene.revision);
            }
            const merged = new Map(cloudLibrary.map((item) => [item.id, item]));
            for (const localScene of library) {
              const cloudScene = cloudById.get(localScene.id);
              if (!cloudScene) {
                const saved = await saveCloudComposition(localScene);
                merged.set(saved.id, saved);
                if (typeof saved.revision === "number") cloudRevisions.current.set(saved.id, saved.revision);
              } else {
                const localDiffers = localScene.name !== cloudScene.name
                  || localScene.camera !== cloudScene.camera
                  || JSON.stringify(localScene.objects) !== JSON.stringify(cloudScene.objects)
                  || JSON.stringify(normalizeSceneLighting(localScene.lighting)) !== JSON.stringify(normalizeSceneLighting(cloudScene.lighting))
                   || JSON.stringify(normalizeSceneRender(localScene.render)) !== JSON.stringify(normalizeSceneRender(cloudScene.render));
                const sameRevision = localScene.revision === cloudScene.revision;
                const legacyLocalIsNewer = localScene.revision === undefined && localScene.updatedAt > cloudScene.updatedAt;
                if (localDiffers && (sameRevision || legacyLocalIsNewer)) {
                  const saved = await saveCloudComposition({ ...localScene, revision: cloudScene.revision });
                  merged.set(saved.id, saved);
                  if (typeof saved.revision === "number") cloudRevisions.current.set(saved.id, saved.revision);
                }
              }
            }
            library = [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 100);
            status = "CLOUD LIBRARY SYNCED";
          } else if (session.status === "signed-out") {
            status = "LOCAL SAVED · SIGN IN TO SYNC";
          } else {
            status = "LOCAL SAVED · CLOUD NOT CONFIGURED";
          }
        } catch {
          setCloudMode("error");
          status = "LOCAL SAVED · CLOUD SYNC ERROR";
        }

        if (!active) return;
        const incomingPlaygroundScene = window.localStorage.getItem(PLAYGROUND_SCENE_HANDOFF_KEY);
        if (incomingPlaygroundScene) {
          try {
            const imported = parseSceneDocument(JSON.parse(incomingPlaygroundScene));
            const generated: SceneDocument = { ...imported, id: window.crypto.randomUUID(), updatedAt: new Date().toISOString() };
            library = [generated, ...library].slice(0, 100);
            status = "PLAYGROUND STUDY RECEIVED";
          } catch {
            status = "PLAYGROUND IMPORT INVALID · LOCAL LIBRARY RESTORED";
          } finally {
            window.localStorage.removeItem(PLAYGROUND_SCENE_HANDOFF_KEY);
          }
        }

        if (!library.length) {
          const id = window.crypto.randomUUID();
          const starter: SceneDocument = { id, name: "Untitled composition", camera: "perspective", objects: initialObjects, updatedAt: new Date().toISOString() };
          library = [starter];
        }
        library.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setStorageKey(activeStorageKey);
        try {
          const archived = window.localStorage.getItem(`${activeStorageKey}:archived`);
          setArchivedIds(archived ? JSON.parse(archived) as string[] : []);
        } catch {
          setArchivedIds([]);
        }

        setCompositions(library);
        const latest = library[0];
        setActiveCompositionId(latest.id);
        setSceneName(latest.name);
        setObjects(latest.objects);
        setCameraView(latest.camera);
        setLighting(normalizeSceneLighting(latest.lighting));
        setRenderSettings(normalizeSceneRender(latest.render));
        setSelectedId(latest.objects[0]?.id ?? 1);
        window.localStorage.setItem(activeStorageKey, JSON.stringify(library));
        setSaveStatus(status);
        setHydrated(true);
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !activeCompositionId) return;
    const timeout = window.setTimeout(() => {
      const document: SceneDocument = {
        id: activeCompositionId,
        name: sceneName.trim().slice(0, 80) || "Untitled composition",
        camera: cameraView,
        objects,
        lighting,
        render: renderSettings,
        updatedAt: new Date().toISOString(),
        revision: cloudRevisions.current.get(activeCompositionId),
      };
      const current = readSceneLibrary(window.localStorage.getItem(storageKey));
      const next = [document, ...current.filter((item) => item.id !== activeCompositionId)]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 100);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setCompositions(next);
      if (!cloudUserId) {
        setSaveStatus(cloudMode === "unconfigured" ? "LOCAL SAVED · CLOUD NOT CONFIGURED" : "LOCAL SAVED · SIGN IN TO SYNC");
        return;
      }
      setSaveStatus("SYNCING TO CLOUD");
      void saveCloudComposition(document).then((saved) => {
        if (typeof saved.revision === "number") cloudRevisions.current.set(saved.id, saved.revision);
        const updated = readSceneLibrary(window.localStorage.getItem(storageKey))
          .map((item) => item.id === saved.id ? saved : item);
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
        setCompositions(updated);
        setSaveStatus("CLOUD SYNCED");
      }).catch((error: unknown) => {
        if (error instanceof Error && error.message.includes("REVISION_CONFLICT")) {
          const conflictCopy: SceneDocument = {
            ...document,
            id: window.crypto.randomUUID(),
            name: `${document.name.slice(0, 58)} — Conflict copy`,
            revision: undefined,
            updatedAt: new Date().toISOString(),
          };
          const savedLibrary = readSceneLibrary(window.localStorage.getItem(storageKey));
          const withCopy = [conflictCopy, ...savedLibrary].slice(0, 100);
          window.localStorage.setItem(storageKey, JSON.stringify(withCopy));
          setCompositions(withCopy);
          setActiveCompositionId(conflictCopy.id);
          setSceneName(conflictCopy.name);
          setObjects(conflictCopy.objects);
          setCameraView(conflictCopy.camera);
          setLighting(normalizeSceneLighting(conflictCopy.lighting));
          setRenderSettings(normalizeSceneRender(conflictCopy.render));
          setSaveStatus("CONFLICT COPY CREATED · SAVING");
          return;
        }
        setSaveStatus("LOCAL SAVED · CLOUD SYNC ERROR");
      });
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [activeCompositionId, cameraView, cloudMode, cloudUserId, hydrated, lighting, objects, renderSettings, sceneName, storageKey]);

  const openComposition = (id: string) => {
    history.current = { past: [], future: [] };
    setHistoryState({ canUndo: false, canRedo: false });
    const document = compositions.find((item) => item.id === id);
    if (!document) return;
    setActiveCompositionId(document.id);
    setSceneName(document.name);
    setObjects(document.objects);
    setCameraView(document.camera);
        setLighting(normalizeSceneLighting(document.lighting));
    setRenderSettings(normalizeSceneRender(document.render));
    setSelectedId(document.objects[0]?.id ?? 1);
    setSaveStatus("OPENING COMPOSITION");
  };

  const createComposition = () => {
    history.current = { past: [], future: [] };
    setHistoryState({ canUndo: false, canRedo: false });
    const id = window.crypto.randomUUID();
    const document: SceneDocument = { id, name: "Untitled composition", camera: "perspective", objects: initialObjects.map((item) => ({ ...item, position: [...item.position] as [number, number, number], rotation: [...item.rotation] as [number, number, number] })), updatedAt: new Date().toISOString() };
    const next = [document, ...compositions];
    setCompositions(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setActiveCompositionId(id);
    setSceneName(document.name);
    setObjects(document.objects);
    setCameraView(document.camera);
    setLighting(DEFAULT_SCENE_LIGHTING);
    setRenderSettings(DEFAULT_SCENE_RENDER);
    setSelectedId(1);
    
    setSaveStatus("NEW COMPOSITION");
  };

  const importComposition = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = parseSceneDocument(JSON.parse(await file.text()));
      const document: SceneDocument = { ...imported, id: window.crypto.randomUUID(), updatedAt: new Date().toISOString() };
      const next = [document, ...compositions].slice(0, 100);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setCompositions(next);
      setActiveCompositionId(document.id);
      setSceneName(document.name);
      setObjects(document.objects);
      setCameraView(document.camera);
      setRenderSettings(normalizeSceneRender(document.render));
      setSelectedId(document.objects[0]?.id ?? 1);
      
      setSaveStatus("JSON IMPORTED");
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message.toUpperCase() : "IMPORT FAILED");
    }
  };

  const generateVariation = (mode: "orbit" | "scatter" | "stack" | "tension" = "orbit") => {
    if (objects.length === 0) return;
    recordHistory();
    const palette = ["#ff5b45", "#6855f5", "#d8ff38", "#17151d", "#a8e5d2", "#f1ede3"];
    const variation = variationCounter.current++;
    const randomFor = (salt: number) => {
      const value = Math.sin((variation + 1) * 127.1 + (salt + 1) * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    const phase = randomFor(0) * Math.PI * 2;
    const next = objects.map((item, index) => {
      const angle = phase + index * 2.399963;
      const spread = 0.65 + randomFor(index + 2) * 0.9;
      const side = index % 2 === 0 ? -1 : 1;
      const position: [number, number, number] = mode === "scatter"
        ? [(randomFor(index + 10) - 0.5) * 4.1, (randomFor(index + 11) - 0.5) * 3.1, (randomFor(index + 12) - 0.5) * 2.2]
        : mode === "stack"
          ? [(randomFor(index + 13) - 0.5) * 0.65, (index - (objects.length - 1) / 2) * 0.72, (randomFor(index + 14) - 0.5) * 0.55]
          : mode === "tension"
            ? [side * (0.55 + index * 0.38), Math.sin(angle) * 0.42 + (randomFor(index + 15) - 0.5) * 0.35, Math.cos(angle) * 0.72]
            : [Math.cos(angle) * spread, Math.sin(angle) * spread * 0.78, (randomFor(index + 16) - 0.5) * 1.5];
      return {
        ...item,
        position,
        rotation: [
          (randomFor(index + 20) - 0.5) * Math.PI,
          (randomFor(index + 21) - 0.5) * Math.PI,
          (randomFor(index + 22) - 0.5) * Math.PI,
        ] as [number, number, number],
        scale: Math.max(0.35, Math.min(1.55, item.scale * (0.78 + randomFor(index + 23) * 0.48))),
        color: palette[Math.floor(randomFor(index + 24) * palette.length)],
      };
    });
    setObjects(next);
    setSelectedId(next[0].id);
    setSaveStatus(`${mode.toUpperCase()} STUDY GENERATED · UNDO TO RETURN`);
  };

  const deleteComposition = () => {
    history.current = { past: [], future: [] };
    setHistoryState({ canUndo: false, canRedo: false });
    if (compositions.length <= 1) return;
    const deletedId = activeCompositionId;
    const next = compositions.filter((item) => item.id !== deletedId);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setCompositions(next);
    setActiveCompositionId(next[0].id);
    setSceneName(next[0].name);
    setObjects(next[0].objects);
    setCameraView(next[0].camera);
    setLighting(normalizeSceneLighting(next[0].lighting));
    setRenderSettings(normalizeSceneRender(next[0].render));
    setSelectedId(next[0].objects[0]?.id ?? 1);
    cloudRevisions.current.delete(deletedId);
    void deleteCloudComposition(deletedId).catch(() => setSaveStatus("LOCAL DELETE · CLOUD DELETE FAILED"));
  };

  const signOut = async () => {
    history.current = { past: [], future: [] };
    try {
      await signOutCloudSession();
      window.location.reload();
    } catch {
      setSaveStatus("SIGN OUT FAILED");
    }
  };

  const setProjection = (projection: SceneRenderDocument["projection"]) => {
    recordHistory();
    setRenderSettings((current) => ({ ...current, projection }));
  };

  const exportRender = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(`.${styles.canvas} canvas`);
    if (!canvas) { setSaveStatus("RENDER CANVAS NOT READY"); return; }
    canvas.toBlob((blob) => {
      if (!blob) { setSaveStatus("PNG EXPORT FAILED"); return; }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sceneName.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "forma-render"}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setSaveStatus("PNG RENDER EXPORTED");
    }, "image/png");
  };

  const exportScene = () => {
    setSaveStatus("JSON EXPORTED");
    const payload = { format: "forma-scene", version: 1, name: sceneName, camera: cameraView, objects, lighting, render: renderSettings, exportedAt: new Date().toISOString() };
    const file = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sceneName.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "forma-scene"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaveStatus("JSON EXPORTED");
  };

  const updateSelected = (patch: Partial<SceneObject>) => {
    recordHistory();
    setObjects((current) => current.map((item) => item.id === selectedId ? { ...item, ...patch } : item));
    
  };
  const addObject = (kind: ShapeKind) => {
    recordHistory();
    const id = Math.max(0, ...objects.map((item) => item.id)) + 1;
    const labels: Record<ShapeKind, string> = { box: "Block", sphere: "Orb", torus: "Loop", text: "Type" };
    setObjects((current) => [...current, { id, name: `${labels[kind]} / ${String(id).padStart(2, "0")}`, kind, color: kind === "box" ? "#ff765e" : kind === "sphere" ? "#a48bff" : kind === "torus" ? "#d7f36a" : "#F5F1E8", ...(kind === "text" ? { text: "FORMA", fontSize: 0.72, letterSpacing: 0.015, typographyStyle: "inflated" as const, extrusion: 0.24, bevel: 0.09 } : {}), roughness: 0.28, metalness: 0.12, emissive: "#000000", transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1, position: [((id % 3) - 1) * 0.65, 0, -0.6], rotation: [0, 0, 0], scale: 0.8, visible: true }]);
    setSelectedId(id);
    
  };
  const toggleArchiveComposition = () => {
    if (!activeCompositionId) return;
    const next = archivedIds.includes(activeCompositionId)
      ? archivedIds.filter((id) => id !== activeCompositionId)
      : [...archivedIds, activeCompositionId];
    window.localStorage.setItem(`${storageKey}:archived`, JSON.stringify(next));
    setArchivedIds(next);
    setSaveStatus(next.includes(activeCompositionId) ? "COMPOSITION ARCHIVED" : "COMPOSITION RESTORED");
  };

  const duplicateComposition = () => {    const source = compositions.find((item) => item.id === activeCompositionId);
    if (!source) return;
    const copy: SceneDocument = { ...structuredClone(source), id: window.crypto.randomUUID(), name: `${source.name.slice(0, 68)} copy`, updatedAt: new Date().toISOString(), revision: undefined };
    const next = [copy, ...compositions].slice(0, 100);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setCompositions(next);
    setActiveCompositionId(copy.id);
    setSceneName(copy.name);
    setObjects(copy.objects);
    setCameraView(copy.camera);
    setLighting(normalizeSceneLighting(copy.lighting));
    setRenderSettings(normalizeSceneRender(copy.render));
    setSelectedId(copy.objects[0]?.id ?? 1);
    setSaveStatus("COMPOSITION DUPLICATED");
  };

  const saveVersion = () => {
    if (!activeCompositionId) return;
    const entry: SceneVersion = { ...snapshot(), id: window.crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [entry, ...versions].slice(0, 30);
    window.localStorage.setItem(versionStorageKey(activeCompositionId), JSON.stringify(next));
    setVersions(next);
    setShowVersions(true);
    setSaveStatus("VERSION SAVED");
  };

  const restoreVersion = (version: SceneVersion) => {
    recordHistory();
    applySnapshot(version);
    setShowVersions(false);
    setSaveStatus("VERSION RESTORED");
  };

  const removeSelected = () => {
    recordHistory();
    if (objects.length <= 1) return;
    const next = objects.filter((item) => item.id !== selectedId);
    setObjects(next);
    setSelectedId(next[0].id);
    
  };

  return (
    <main className={styles.studio}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/" aria-label="FORMA home"><span className={styles.brandMark}>F</span> FORMA <span className={styles.slash}>/</span> SCENE STUDIO</Link>
        <div className={styles.document}>
          <span className={styles.liveDot} />
          <input aria-label="Scene name" value={sceneName} onChange={(event) => { setSceneName(event.target.value); }} />
          <span className={styles.saveState}>{saveStatus}</span>
        </div>
        <div className={styles.libraryControls}>
          <select aria-label="Open composition" value={activeCompositionId} onChange={(event) => openComposition(event.target.value)}>
            {compositions.map((composition) => <option key={composition.id} value={composition.id}>{composition.name}</option>)}
          </select>
          <button className={styles.quietButton} onClick={createComposition}>＋ NEW</button>
          <button className={styles.quietButton} onClick={duplicateComposition}>DUPLICATE</button>
          <label className={styles.importButton}>IMPORT JSON<input aria-label="Import FORMA JSON" type="file" accept="application/json,.json" onChange={importComposition} /></label>
          <button className={styles.quietButton} onClick={deleteComposition} disabled={compositions.length <= 1}>DELETE</button>
          {cloudUserId ? <button className={styles.accountLink} onClick={signOut}>SIGN OUT</button> : <Link className={styles.accountLink} href="/sign-in">SIGN IN ↗</Link>}
        </div>
        <div className={styles.topActions}>
          <button className={styles.quietButton} onClick={() => { recordHistory(); setObjects(initialObjects); setSelectedId(1); }}>RESET</button>
          <button className={styles.quietButton} onClick={saveVersion}>SAVE VERSION</button><button className={styles.quietButton} onClick={exportRender}>EXPORT PNG</button><button className={styles.publishButton} onClick={exportScene}>EXPORT JSON <span>↗</span></button>
        </div>
      </header>

      <div className={styles.studioManifest}><RoomManifest variant="workbench" number="03" room="THE WORKBENCH" title="Shape the conditions." description="Build a scene by directing its material, light, camera, and space. The specimen stays central; the instruments exist to make its character intentional." principle="A material is a decision. Light reveals its behavior, the camera defines its meaning, and composition turns objects into a point of view." notation="MATTER + NOTATION / CONTROL THE SPECIMEN" /></div>

      <details className={styles.projectLibrary}>
        <summary><span>PROJECT LIBRARY</span><span>{String(compositions.length).padStart(2, "0")} COMPOSITIONS</span></summary>
        <div className={styles.projectLibraryActions}>
          <button onClick={() => setShowArchived((value) => !value)} aria-pressed={showArchived}>{showArchived ? "SHOW ACTIVE" : "SHOW ARCHIVED"} ({archivedIds.length})</button>
          <button onClick={toggleArchiveComposition}>{archivedIds.includes(activeCompositionId) ? "RESTORE CURRENT" : "ARCHIVE CURRENT"}</button>
        </div>
        <div className={styles.projectGrid}>
          {compositions.filter((composition) => archivedIds.includes(composition.id) === showArchived).map((composition) => <button key={composition.id} className={`${styles.projectCard} ${composition.id === activeCompositionId ? styles.projectCardActive : ""}`} onClick={() => openComposition(composition.id)}>
            <span className={styles.projectThumbnail} style={{ backgroundImage: `url("${makeThumbnail(composition.objects)}")` }} />
            <strong>{composition.name}</strong>
            <small>{archivedIds.includes(composition.id) ? "ARCHIVED · " : ""}{composition.objects.length} OBJECTS · {new Date(composition.updatedAt).toLocaleDateString()}</small>
          </button>)}
        </div>
      </details>
      <div className={styles.workspace}>
        <aside className={`${styles.leftPanel} ${mobilePanel === "hierarchy" ? styles.mobilePanelOpen : ""}`}>
          <div className={styles.panelHeading}><span>01 / HIERARCHY</span><span>{String(objects.length).padStart(2, "0")} OBJECTS</span></div>
          <div className={styles.addTools}>
            <button onClick={() => addObject("box")}><b>＋</b> BLOCK</button>
            <button onClick={() => addObject("sphere")}><b>＋</b> ORB</button>
            <button onClick={() => addObject("torus")}><b>＋</b> LOOP</button>
            <button onClick={() => addObject("text")}><b>Aa</b> TYPE</button>
          </div>
          <div className={styles.objectList}>
            {objects.map((item, index) => (
              <div className={`${styles.objectRow} ${item.id === selectedId ? styles.selectedRow : ""}`} key={item.id}>
                <button className={styles.objectSelect} onClick={() => setSelectedId(item.id)}>
                  <span className={styles.objectIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.objectGlyph}>{item.kind === "box" ? "◇" : item.kind === "sphere" ? "●" : item.kind === "torus" ? "◎" : "Aa"}</span>
                  <span>{item.name}</span>
                </button>
                <button className={styles.visibility} aria-label={item.visible ? `Hide ${item.name}` : `Show ${item.name}`} aria-pressed={item.visible} onClick={() => { recordHistory(); setObjects((current) => current.map((object) => object.id === item.id ? { ...object, visible: !object.visible } : object)); }}>{item.visible ? "◉" : "○"}</button>
              </div>
            ))}
          </div>
          <div className={styles.panelFoot}><span>SCENE GRAPH</span><span>● LIVE</span></div>
        </aside>

        <section className={styles.stageColumn} aria-label="3D scene editor">
          <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
              <button className={styles.quietButton} onClick={undo} disabled={!historyState.canUndo} title="Undo (⌘/Ctrl + Z)">↶</button>
              <button className={styles.quietButton} onClick={redo} disabled={!historyState.canRedo} title="Redo (⌘/Ctrl + Shift + Z)">↷</button>
              {(["select", "move", "rotate", "scale"] as const).map((tool) => <button key={tool} className={activeTool === tool ? styles.activeTool : ""} aria-pressed={activeTool === tool} onClick={() => setActiveTool(tool)} title={tool}>{tool === "select" ? "↖" : tool === "move" ? "✣" : tool === "rotate" ? "⟳" : "↗"}<span>{tool.toUpperCase()}</span></button>)}
            </div>
            <div className={styles.compositionModes} role="group" aria-label="Generate a composition system">
              <button type="button" onClick={() => generateVariation("orbit")} title="Arrange forms around a shared center">ORBIT</button>
              <button type="button" onClick={() => generateVariation("scatter")} title="Release forms into a loose field">SCATTER</button>
              <button type="button" onClick={() => generateVariation("stack")} title="Build a vertical sculptural stack">STACK</button>
              <button type="button" onClick={() => generateVariation("tension")} title="Pull forms into opposing forces">TENSION</button>
            </div>
            <button className={styles.recomposeButton} onClick={() => generateVariation("orbit")} title="Generate a new orbital arrangement from the current objects. Undo to restore the previous composition.">
              <span>✳</span> RECOMPOSE <i>↗</i>
            </button>
            <div className={styles.cameraPresets}>
              <button className={renderSettings.projection === "perspective" ? styles.activeCamera : ""} aria-pressed={renderSettings.projection === "perspective"} onClick={() => setProjection("perspective")}>PERSPECTIVE</button>
              <button className={renderSettings.projection === "orthographic" ? styles.activeCamera : ""} aria-pressed={renderSettings.projection === "orthographic"} onClick={() => setProjection("orthographic")}>ORTHO</button>
              {(["front", "top", "side"] as const).map((view) => <button key={view} className={cameraView === view ? styles.activeCamera : ""} aria-pressed={cameraView === view} onClick={() => { recordHistory(); setCameraView(view); }}>{view.toUpperCase()}</button>)}
            </div>
            <span className={styles.viewportMeta}>X · Y · Z</span>
          </div>
          <div className={styles.canvasFrame}>
            <div className={styles.canvasStamp}><span>FORMA / LAB 001</span><span>24° 08′ N — 3D SPACE</span></div>
            <div className={styles.compositionSignature} aria-label={`Composition signature: ${objects.filter((item) => item.visible).length} visible forms and their material colors`}>
              <div><span>COMPOSITION / DNA</span><b>{String(objects.filter((item) => item.visible).length).padStart(2, "0")} FORMS</b></div>
              <div className={styles.signatureForms}>
                {objects.filter((item) => item.visible).slice(0, 6).map((item) => (
                  <span key={item.id} title={item.name}>
                    <i style={{ backgroundColor: item.color }} />
                    <b>{item.kind === "box" ? "◇" : item.kind === "sphere" ? "●" : item.kind === "torus" ? "◎" : "Aa"}</b>
                  </span>
                ))}
                {objects.filter((item) => item.visible).length > 6 && <small>+{objects.filter((item) => item.visible).length - 6}</small>}
              </div>
              <small>LIVE FORM PALETTE</small>
            </div>
            <div className={styles.canvasGrid} aria-hidden="true" />
            <div className={styles.canvas}><SceneCanvas objects={objects} selectedId={selected?.id ?? -1} tool={activeTool} view={cameraView} lighting={lighting} render={renderSettings} onSelect={setSelectedId} onTransform={(id, transform) => { recordHistory(); setObjects((current) => current.map((item) => item.id === id ? { ...item, ...transform } : item)); }} /></div>
            <div className={styles.canvasHint}>DRAG TO ORBIT <i /> SCROLL TO ZOOM <i /> SELECT TO INSPECT</div>
            <div className={styles.axisWidget}><span>X</span><span>Y</span><span>Z</span></div>
          </div>
          <div className={styles.statusbar}><span><i /> ENGINE READY</span><span>WEBGL / THREE.JS</span><span>{objects.filter((item) => item.visible).length} VISIBLE OBJECTS</span><span>100% VIEW</span></div>
        </section>

        <aside className={`${styles.rightPanel} ${mobilePanel === "inspector" ? styles.mobilePanelOpen : ""}`}>
          <div className={styles.panelHeading}><span>02 / INSPECTOR</span><span>PROPERTIES</span></div>
          {selected ? <div className={styles.inspector}>
            <div className={styles.selectionIntro}><span>ACTIVE OBJECT / {String(selected.id).padStart(3, "0")}</span><strong>{selected.name}</strong><small>{selected.kind === "text" ? "TYPOGRAPHIC MATTER" : `${selected.kind.toUpperCase()} · MESH STANDARD`}</small></div>
            <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>TRANSFORM <span>⌄</span></div>
              <div className={styles.axisFields}>
                {(["x", "y", "z"] as const).map((axis, index) => <label key={axis}><span>{axis.toUpperCase()}</span><input type="number" step="0.1" value={selected.position[index]} onChange={(event) => { const position: [number, number, number] = [...selected.position]; position[index] = Number(event.target.value); updateSelected({ position }); }} /></label>)}
              </div>
              <div className={styles.propertyTitle} style={{ marginTop: "1rem" }}>ROTATION / DEG</div>
              <div className={styles.axisFields}>
                {(["x", "y", "z"] as const).map((axis, index) => <label key={axis}><span>{axis.toUpperCase()}</span><input type="number" step="5" value={Math.round(selected.rotation[index] * 180 / Math.PI)} onChange={(event) => { const rotation: [number, number, number] = [...selected.rotation]; rotation[index] = Number(event.target.value) * Math.PI / 180; updateSelected({ rotation }); }} /></label>)}
              </div>
              <label className={styles.rangeField}><span>UNIFORM SCALE <b>{selected.scale.toFixed(2)}</b></span><input type="range" min="0.25" max="1.8" step="0.05" value={selected.scale} onChange={(event) => updateSelected({ scale: Number(event.target.value) })} /></label>
            </section>
            {selected.kind === "text" && <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>TYPE COMPOSITION <span>LETTERFORM / MATTER</span></div>
              <label className={styles.typeField}><span>CONTENT</span><textarea maxLength={500} rows={4} value={selected.text ?? ""} onChange={(event) => updateSelected({ text: event.target.value })} /></label>
              <label className={styles.rangeField}><span>TYPE SIZE <b>{(selected.fontSize ?? 0.72).toFixed(2)}</b></span><input type="range" min="0.15" max="2" step="0.01" value={selected.fontSize ?? 0.72} onChange={(event) => updateSelected({ fontSize: Number(event.target.value) })} /></label>
              <label className={styles.typeField}><span>FORM TREATMENT</span><select value={selected.typographyStyle ?? "flat"} onChange={(event) => updateSelected({ typographyStyle: event.target.value as "flat" | "extruded" | "inflated" })}><option value="flat">Flat / editorial</option><option value="extruded">Extruded / solid</option><option value="inflated">Inflated / soft sculpture</option></select></label>{selected.typographyStyle !== "flat" && <><label className={styles.rangeField}><span>DEPTH <b>{(selected.extrusion ?? 0.18).toFixed(2)}</b></span><input type="range" min="0.04" max="0.8" step="0.01" value={selected.extrusion ?? 0.18} onChange={(event) => updateSelected({ extrusion: Number(event.target.value) })} /></label><label className={styles.rangeField}><span>BEVEL / ROUNDNESS <b>{(selected.bevel ?? 0.04).toFixed(2)}</b></span><input type="range" min="0.005" max="0.2" step="0.005" value={selected.bevel ?? 0.04} onChange={(event) => updateSelected({ bevel: Number(event.target.value) })} /></label></>}<label className={styles.rangeField}><span>LETTER SPACING <b>{(selected.letterSpacing ?? 0.015).toFixed(3)}</b></span><input type="range" min="-0.1" max="0.25" step="0.001" value={selected.letterSpacing ?? 0.015} onChange={(event) => updateSelected({ letterSpacing: Number(event.target.value) })} /></label>
            </section>}
            <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>SURFACE <span>⌄</span></div>
              <label className={styles.colorField}><span>BASE COLOR</span><input type="color" value={selected.color} onChange={(event) => updateSelected({ color: event.target.value })} /><code>{selected.color.toUpperCase()}</code></label>
              <div className={styles.swatches}>{["#ff5b45", "#6855f5", "#d8ff38", "#17151d", "#f1ede3"].map((color) => <button key={color} style={{ backgroundColor: color }} aria-label={`Set color ${color}`} onClick={() => updateSelected({ color })} />)}</div>
            </section>
            {selected.kind !== "text" && <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>MATERIAL LAB <span>PHYSICAL / PBR</span></div>
              <div className={styles.materialPresets} role="group" aria-label="Physical material presets">{SCENE_MATERIAL_PRESETS.map((preset) => <button key={preset.id} type="button" onClick={() => updateSelected(applySceneMaterialPreset(selected, preset.id as SceneMaterialId))}><strong>{preset.name}</strong><small>{preset.descriptor}</small></button>)}</div>
              <label className={styles.rangeField}><span>ROUGHNESS <b>{selected.roughness.toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={selected.roughness} onChange={(event) => updateSelected({ roughness: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>METALNESS <b>{selected.metalness.toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={selected.metalness} onChange={(event) => updateSelected({ metalness: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>TRANSMISSION <b>{selected.transmission.toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={selected.transmission} onChange={(event) => updateSelected({ transmission: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>THICKNESS <b>{selected.thickness.toFixed(2)}</b></span><input type="range" min="0" max="5" step="0.05" value={selected.thickness} onChange={(event) => updateSelected({ thickness: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>INDEX OF REFRACTION <b>{selected.ior.toFixed(2)}</b></span><input type="range" min="1" max="2.33" step="0.01" value={selected.ior} onChange={(event) => updateSelected({ ior: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>CLEARCOAT <b>{selected.clearcoat.toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={selected.clearcoat} onChange={(event) => updateSelected({ clearcoat: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>COAT ROUGHNESS <b>{selected.clearcoatRoughness.toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={selected.clearcoatRoughness} onChange={(event) => updateSelected({ clearcoatRoughness: Number(event.target.value) })} /></label>
              <label className={styles.rangeField}><span>OPACITY <b>{selected.opacity.toFixed(2)}</b></span><input type="range" min="0.15" max="1" step="0.01" value={selected.opacity} onChange={(event) => updateSelected({ opacity: Number(event.target.value) })} /></label>
              <label className={styles.colorField} style={{ marginTop: "1rem" }}><span>EMISSION</span><input type="color" value={selected.emissive} onChange={(event) => updateSelected({ emissive: event.target.value })} /><code>{selected.emissive.toUpperCase()}</code></label>
              <button className={styles.resetMaterial} onClick={() => updateSelected({ roughness: 0.28, metalness: 0.12, emissive: "#000000", transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0, clearcoatRoughness: 0, opacity: 1 })}>RESET MATERIAL</button>
            </section>}
            <section className={styles.propertySection}>
              <section className={styles.propertySection}>
              <div className={styles.propertyTitle}>CAMERA & RENDER <span>OPTICS / OUTPUT</span></div>
              <div className={styles.renderQuality} role="group" aria-label="Render quality">{SCENE_RENDER_QUALITY.map((quality) => <button key={quality.id} type="button" aria-pressed={renderSettings.quality === quality.id} className={renderSettings.quality === quality.id ? styles.renderQualityActive : ""} onClick={() => { recordHistory(); setRenderSettings(current => ({ ...current, quality: quality.id })); }}><strong>{quality.name}</strong><small>{quality.detail}</small></button>)}</div>
              <label className={styles.selectField}><span>TONE MAPPING</span><select value={renderSettings.toneMapping} onChange={event => setRenderSettings(current => ({ ...current, toneMapping: event.target.value as SceneRenderDocument["toneMapping"] }))}><option value="aces">ACES FILMIC</option><option value="neutral">NEUTRAL</option><option value="linear">LINEAR</option><option value="none">NONE</option></select></label>
              <label className={styles.rangeField}><span>FOCUS DISTANCE <b>{renderSettings.focusDistance.toFixed(1)}</b></span><input type="range" min="0.5" max="20" step="0.1" value={renderSettings.focusDistance} onChange={event => setRenderSettings(current => ({ ...current, focusDistance: Number(event.target.value) }))}/></label>
              <label className={styles.rangeField}><span>DEPTH OF FIELD <b>{(renderSettings.aperture * 100000).toFixed(1)}</b></span><input type="range" min="0" max="0.0002" step="0.000005" value={renderSettings.aperture} onChange={event => setRenderSettings(current => ({ ...current, aperture: Number(event.target.value) }))}/></label>
              <label className={styles.rangeField}><span>BLOOM <b>{renderSettings.bloom.toFixed(2)}</b></span><input type="range" min="0" max="2" step="0.01" value={renderSettings.bloom} onChange={event => setRenderSettings(current => ({ ...current, bloom: Number(event.target.value) }))}/></label>
              <label className={styles.rangeField}><span>VIGNETTE <b>{renderSettings.vignette.toFixed(2)}</b></span><input type="range" min="0" max="1" step="0.01" value={renderSettings.vignette} onChange={event => setRenderSettings(current => ({ ...current, vignette: Number(event.target.value) }))}/></label>
              <label className={styles.rangeField}><span>CHROMATIC ABERRATION <b>{renderSettings.chromaticAberration.toFixed(3)}</b></span><input type="range" min="0" max="0.012" step="0.0002" value={renderSettings.chromaticAberration} onChange={event => setRenderSettings(current => ({ ...current, chromaticAberration: Number(event.target.value) }))}/></label>
            </section>
            <section className={styles.propertySection}>
<div className={styles.propertyTitle}>STUDIO LIGHTING <span>3-POINT RIG</span></div>
<div className={styles.lightingPresets} role="group" aria-label="Lighting presets">{SCENE_LIGHTING_PRESETS.map((preset)=><button key={preset.id} type="button" aria-pressed={lighting.preset===preset.id} className={lighting.preset===preset.id?styles.lightingPresetActive:""} onClick={()=>{recordHistory();setLighting(structuredClone(preset.lighting));}}><strong>{preset.name}</strong><small>{preset.description}</small></button>)}</div>
<label className={styles.selectField}><span>ENVIRONMENT / HDRI</span><select value={lighting.environment} onChange={event=>setLighting(current=>({...current,environment:event.target.value as SceneLightingDocument["environment"]}))}>{SCENE_ENVIRONMENTS.map(environment=><option key={environment} value={environment}>{environment.toUpperCase()}</option>)}</select></label>
<label className={styles.rangeField}><span>ENVIRONMENT INTENSITY <b>{lighting.environmentIntensity.toFixed(2)}</b></span><input type="range" min="0" max="3" step=".05" value={lighting.environmentIntensity} onChange={event=>setLighting(current=>({...current,environmentIntensity:Number(event.target.value)}))}/></label>
<label className={styles.rangeField}><span>AMBIENT FILL <b>{lighting.ambientIntensity.toFixed(2)}</b></span><input type="range" min="0" max="3" step=".05" value={lighting.ambientIntensity} onChange={event=>setLighting(current=>({...current,ambientIntensity:Number(event.target.value)}))}/></label>
{(["key","fill","rim"] as const).map(name=><div className={styles.lightControl} key={name}><div className={styles.lightControlHead}><strong>{name.toUpperCase()} LIGHT</strong></div><label className={styles.colorField}><span>COLOR</span><input type="color" value={lighting[name].color} onChange={event=>setLighting(current=>({...current,[name]:{...current[name],color:event.target.value}}))}/></label><label className={styles.rangeField}><span>INTENSITY <b>{lighting[name].intensity.toFixed(2)}</b></span><input type="range" min="0" max="8" step=".05" value={lighting[name].intensity} onChange={event=>setLighting(current=>({...current,[name]:{...current[name],intensity:Number(event.target.value)}}))}/></label>{(["x","y","z"] as const).map((axis,index)=><label className={styles.rangeField} key={axis}><span>POSITION {axis.toUpperCase()} <b>{lighting[name].position[index].toFixed(1)}</b></span><input type="range" min="-10" max="10" step=".5" value={lighting[name].position[index]} onChange={event=>setLighting(current=>({...current,[name]:{...current[name],position:current[name].position.map((part,i)=>i===index?Number(event.target.value):part) as [number,number,number]}}))}/></label>)}</div>)}
<label className={styles.toggleField}><input type="checkbox" checked={lighting.shadows} onChange={event=>setLighting(current=>({...current,shadows:event.target.checked}))}/><span>CONTACT SHADOWS</span></label>
<label className={styles.rangeField}><span>SHADOW OPACITY <b>{lighting.shadowOpacity.toFixed(2)}</b></span><input type="range" min="0" max="1" step=".01" value={lighting.shadowOpacity} onChange={event=>setLighting(current=>({...current,shadowOpacity:Number(event.target.value)}))}/></label>
<label className={styles.rangeField}><span>SHADOW SOFTNESS <b>{lighting.shadowBlur.toFixed(1)}</b></span><input type="range" min="0" max="6" step=".1" value={lighting.shadowBlur} onChange={event=>setLighting(current=>({...current,shadowBlur:Number(event.target.value)}))}/></label>
</section>
<div className={styles.propertyTitle}>OBJECT <span>⌄</span></div>
              <label className={styles.nameField}><span>NAME</span><input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} /></label>
              <button className={styles.deleteButton} onClick={removeSelected} disabled={objects.length <= 1}>− REMOVE OBJECT</button>
            </section>
          </div> : <p className={styles.emptyState}>Select an object in the scene to inspect its form.</p>}
          <div className={styles.inspectorFoot}><span>FORM IS A VERB.</span><span>V. 01.0</span></div>
        </aside>
      </div>
      <section className={styles.versionShelf} aria-label="Scene version history">
        <button className={styles.versionToggle} onClick={() => setShowVersions((value) => !value)} aria-expanded={showVersions}>
          <span>VERSION HISTORY</span><span>{String(versions.length).padStart(2, "0")} SAVED SNAPSHOTS</span><b>{showVersions ? "−" : "+"}</b>
        </button>
        {showVersions && <div className={styles.versionList}>
          {versions.length ? versions.map((version) => <article className={styles.versionItem} key={version.id}>
            <div><strong>{version.name}</strong><small>{new Date(version.createdAt).toLocaleString()} · {version.objects.length} OBJECTS</small></div>
            <button onClick={() => restoreVersion(version)}>RESTORE ↗</button>
          </article>) : <p>No saved versions yet. Save a snapshot before making a big change.</p>}
        </div>}
      </section>
      {mobilePanel && <button className={styles.mobileBackdrop} aria-label="Close editor panel" onClick={() => setMobilePanel(null)} />}
      <footer className={styles.mobileBar}><button aria-pressed={mobilePanel === "hierarchy"} onClick={() => setMobilePanel(mobilePanel === "hierarchy" ? null : "hierarchy")}>☷ <span>OBJECTS</span></button><span>SCENE / {String(compositions.length).padStart(2, "0")}</span><button aria-pressed={mobilePanel === "inspector"} onClick={() => setMobilePanel(mobilePanel === "inspector" ? null : "inspector")}>◫ <span>INSPECT</span></button></footer>
    </main>
  );
}
