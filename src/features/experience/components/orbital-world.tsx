"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import styles from "./orbital-world.module.css";

type MutableValue = { value: number };
type PointerValue = { x: number; y: number };
type RefValue<T> = { current: T };
type SpecimenId = "form" | "motion" | "type" | "space" | "field";

type OrbitalWorldProps = {
  progress: RefValue<MutableValue>;
  pointer: RefValue<PointerValue>;
  selected: SpecimenId;
  onSelect: (id: SpecimenId) => void;
  intensity: number;
  speed: number;
  density: number;
  seed: number;
  reducedMotion: boolean;
};

const specimens: Array<{
  id: SpecimenId;
  radius: number;
  height: number;
  depth: number;
  speed: number;
  phase: number;
  color: string;
}> = [
  { id: "form", radius: 3.1, height: 1.72, depth: 0.22, speed: 0.32, phase: 0.2, color: "#C7F36B" },
  { id: "motion", radius: 4.12, height: 2.32, depth: 0.56, speed: -0.22, phase: 2.1, color: "#647BFF" },
  { id: "type", radius: 4.72, height: 1.35, depth: 0.18, speed: 0.16, phase: 4.4, color: "#FF765E" },
  { id: "space", radius: 3.8, height: 2.76, depth: 0.82, speed: -0.27, phase: 1.25, color: "#F2F0EA" },
  { id: "field", radius: 5.15, height: 2.02, depth: 0.42, speed: 0.12, phase: 3.45, color: "#A9F5D0" },
];

function GlyphForm({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.16, 0.22, 0]}><boxGeometry args={[0.18, 1.04, 0.12]} /><meshStandardMaterial color={color} metalness={0.55} roughness={0.28} /></mesh>
      <mesh position={[0.18, 0.64, 0]}><boxGeometry args={[0.72, 0.16, 0.12]} /><meshStandardMaterial color={color} metalness={0.55} roughness={0.28} /></mesh>
      <mesh position={[0.08, 0.18, 0]}><boxGeometry args={[0.52, 0.15, 0.12]} /><meshStandardMaterial color={color} metalness={0.55} roughness={0.28} /></mesh>
    </group>
  );
}

function FrameForm({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.52, 0]}><boxGeometry args={[1.2, 0.045, 0.045]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} /></mesh>
      <mesh position={[0, -0.52, 0]}><boxGeometry args={[1.2, 0.045, 0.045]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} /></mesh>
      <mesh position={[-0.58, 0, 0]}><boxGeometry args={[0.045, 1.08, 0.045]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} /></mesh>
      <mesh position={[0.58, 0, 0]}><boxGeometry args={[0.045, 1.08, 0.045]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} /></mesh>
      <mesh position={[0, 0, -0.3]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.68, 0.012, 6, 4]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function FieldForm({ color, density }: { color: string; density: number }) {
  const points = useMemo(
    () => Array.from({ length: density }, (_, index) => {
      const angle = index * 2.399963;
      const radius = 0.18 + (index % 5) * 0.105;
      return [Math.cos(angle) * radius, Math.sin(angle * 1.17) * radius, Math.sin(angle) * 0.25] as const;
    }),
    [density],
  );

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point} scale={0.035 + (index % 4) * 0.012}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function Specimen({
  item,
  index,
  progress,
  selected,
  intensity,
  speed,
  density,
  seed,
  reducedMotion,
  onSelect,
}: {
  item: (typeof specimens)[number];
  index: number;
  progress: RefValue<MutableValue>;
  selected: boolean;
  intensity: number;
  speed: number;
  density: number;
  seed: number;
  reducedMotion: boolean;
  onSelect: (id: SpecimenId) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const materialColor = item.color;
  const seededPhase = ((seed * 0.017 + index * 2.399963) % 360) * (Math.PI / 180);
  const initialAngle = item.phase + seededPhase;
  const initialRadius = item.radius * (0.84 + intensity * 0.16);
  const initialPosition: [number, number, number] = [
    Math.cos(initialAngle) * initialRadius,
    Math.sin(initialAngle * 0.76 + index) * item.height * (0.78 + intensity * 0.08),
    Math.sin(initialAngle) * item.depth + Math.cos(initialAngle * 0.5) * 0.22,
  ];

  useFrame(({ clock }, delta) => {
    const node = group.current;
    if (!node) return;

    // Keep a deliberately composed, spatially separated arrangement when motion is
    // reduced. The previous early return left every specimen at the world origin.
    if (reducedMotion) return;

    const scroll = progress.current.value;
    const time = clock.elapsedTime * item.speed * speed + item.phase + seededPhase + scroll * Math.PI * (0.7 + index * 0.12);
    const radius = item.radius * (0.84 + intensity * 0.16) + Math.sin(scroll * Math.PI * 2 + item.phase) * 0.18;
    node.position.set(
      Math.cos(time) * radius,
      Math.sin(time * 0.76 + index) * item.height * (0.78 + intensity * 0.08),
      Math.sin(time) * item.depth + Math.cos(time * 0.5) * 0.22,
    );
    node.rotation.x += delta * (0.18 + index * 0.045);
    node.rotation.y += delta * (0.28 + index * 0.035);
    const targetScale = selected ? 1.42 : 1;
    const nextScale = THREE.MathUtils.damp(node.scale.x, targetScale, selected ? 8 : 4, delta);
    node.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={group}
      position={initialPosition}
      rotation={[index * 0.13, index * 0.27, index * 0.08]}
      scale={selected ? 1.42 : 1}
      onClick={(event) => { event.stopPropagation(); onSelect(item.id); }}
      onPointerOver={(event) => event.stopPropagation()}
    >
      {item.id === "form" && (
        <mesh>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color={materialColor} metalness={0.72} roughness={0.2} wireframe />
        </mesh>
      )}
      {item.id === "motion" && (
        <mesh>
          <torusKnotGeometry args={[0.37, 0.105, 96, 12, 2, 5]} />
          <meshStandardMaterial color={materialColor} metalness={0.56} roughness={0.24} emissive={materialColor} emissiveIntensity={0.12} />
        </mesh>
      )}
      {item.id === "type" && <GlyphForm color={materialColor} />}
      {item.id === "space" && <FrameForm color={materialColor} />}
      {item.id === "field" && <FieldForm color={materialColor} density={density} />}
      <mesh scale={selected ? 1.08 : 0.94}>
        <sphereGeometry args={[0.68, 12, 12]} />
        <meshBasicMaterial color={materialColor} transparent opacity={selected ? 0.1 : 0.035} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Core({ progress, intensity, reducedMotion }: { progress: RefValue<MutableValue>; intensity: number; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reducedMotion || !root.current) return;
    root.current.rotation.y = clock.elapsedTime * 0.12 + progress.current.value * Math.PI * 0.8;
    root.current.rotation.x = Math.sin(clock.elapsedTime * 0.16) * 0.08;
    const scale = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.018 * intensity;
    root.current.scale.setScalar(scale);
  });

  return (
    <group ref={root}>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.92, 1]} />
        <meshStandardMaterial color="#F2F0EA" metalness={0.78} roughness={0.2} wireframe />
      </mesh>
      <mesh rotation={[0.2, 0.45, 0.1]}>
        <icosahedronGeometry args={[0.58, 1]} />
        <meshPhysicalMaterial color="#C7F36B" metalness={0.45} roughness={0.24} clearcoat={0.85} clearcoatRoughness={0.16} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.22, 0.009, 8, 140]} />
        <meshBasicMaterial color="#647BFF" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[0.4, 0.2, Math.PI / 2.8]}>
        <torusGeometry args={[1.48, 0.006, 8, 140]} />
        <meshBasicMaterial color="#FF765E" transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

function WorldScene(props: OrbitalWorldProps) {
  const world = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (props.reducedMotion || !world.current) return;
    const targetX = props.pointer.current.y * 0.16;
    const targetY = props.pointer.current.x * 0.2 + props.progress.current.value * 0.2;
    world.current.rotation.x = THREE.MathUtils.damp(world.current.rotation.x, targetX, 3.2, delta);
    world.current.rotation.y = THREE.MathUtils.damp(world.current.rotation.y, targetY, 3.2, delta);
  });

  return (
    <>
      <ambientLight intensity={0.62} />
      <pointLight position={[0, 4, 5]} intensity={36} color="#C7F36B" distance={15} />
      <pointLight position={[-5, -2, 1]} intensity={18} color="#647BFF" distance={12} />
      <pointLight position={[4, 1, -4]} intensity={24} color="#FF765E" distance={13} />
      <fog attach="fog" args={["#111214", 11, 23]} />
      <group ref={world}>
        <Core progress={props.progress} intensity={props.intensity} reducedMotion={props.reducedMotion} />
        {specimens.map((item, index) => (
          <Specimen
            key={item.id}
            item={item}
            index={index}
            progress={props.progress}
            selected={props.selected === item.id}
            intensity={props.intensity}
            speed={props.speed}
            density={props.density}
            seed={props.seed}
            reducedMotion={props.reducedMotion}
            onSelect={props.onSelect}
          />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.8, 0]}>
          <planeGeometry args={[80, 80, 1, 1]} />
          <meshStandardMaterial color="#111214" roughness={0.84} metalness={0.16} />
        </mesh>
        <gridHelper args={[24, 48, "#313A30", "#202722"]} position={[0, -3.78, 0]} />
      </group>
    </>
  );
}

export function OrbitalWorld(props: OrbitalWorldProps) {
  return (
    <Canvas
      frameloop={props.reducedMotion ? "demand" : "always"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 12.5], fov: 38, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={
        <div className={styles.staticFallback} role="img" aria-label="Static preview of the FORMA orbital identity">
          <div className={styles.staticOrbit} />
          <div className={styles.staticOrbitAlt} />
          <div className={styles.staticCore}><span>FORMA</span></div>
          <i className={styles.staticForm} />
          <i className={styles.staticMotion} />
          <i className={styles.staticType} />
          <i className={styles.staticSpace} />
          <i className={styles.staticField} />
        </div>
      }
    >
      <WorldScene {...props} />
    </Canvas>
  );
}
