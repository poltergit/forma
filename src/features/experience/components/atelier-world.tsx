"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";\nimport { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import styles from "./atelier-world.module.css";

type Props = { intensity: number; speed: number; density: number; seed: number; reducedMotion: boolean };

function Sculpture({ intensity, speed, density, seed, reducedMotion }: Props) {
  const sculpture = useRef<THREE.Group>(null);
  const shards = useMemo(() => Array.from({ length: density }, (_, index) => {
    const angle = index * 2.399963 + seed * 0.013;
    const radius = 1.35 + (index % 4) * 0.19;
    return { position: [Math.cos(angle) * radius, Math.sin(angle * 1.7) * radius * 0.58, Math.sin(angle) * 0.72] as [number, number, number], rotation: [angle * 0.3, angle, angle * 0.18] as [number, number, number], scale: 0.08 + (index % 5) * 0.025 };
  }), [density, seed]);

  useFrame(({ clock }, delta) => {
    if (!sculpture.current || reducedMotion) return;
    sculpture.current.rotation.y = clock.elapsedTime * 0.12 * speed;
    sculpture.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.08;
    sculpture.current.position.y = Math.sin(clock.elapsedTime * 0.45 * speed) * 0.08;
    const next = THREE.MathUtils.damp(sculpture.current.scale.x, intensity, 3, delta);
    sculpture.current.scale.setScalar(next);
  });

  return (
    <Float speed={1.25 * speed} rotationIntensity={0.2} floatIntensity={0.32}>\n    <group ref={sculpture}>
      <mesh rotation={[0.4, 0.2, 0.1]}>
        <torusKnotGeometry args={[0.78, 0.23, 220, 24, 2, 5]} />
        <meshPhysicalMaterial color="#f05b3e" metalness={0.34} roughness={0.2} clearcoat={1} clearcoatRoughness={0.16} />
      </mesh>
      <mesh rotation={[0.8, 0.3, 0.6]} scale={0.72}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#243bd6" metalness={0.78} roughness={0.24} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0.4, 0]}>
        <torusGeometry args={[1.55, 0.012, 8, 180]} />
        <meshBasicMaterial color="#20211f" transparent opacity={0.48} />
      </mesh>
      {shards.map((shard, index) => (
        <mesh key={index} position={shard.position} rotation={shard.rotation} scale={shard.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 3 === 0 ? "#f05b3e" : index % 3 === 1 ? "#243bd6" : "#c6d83b"} metalness={0.42} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Scene(props: Props) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }, delta) => {
    if (!group.current || props.reducedMotion) return;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.12, 2.5, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -pointer.x * 0.08, 2.5, delta);
  });
  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 5, 6]} intensity={3.2} />
      <pointLight position={[-4, 1, 3]} color="#f05b3e" intensity={24} distance={12} />
      <pointLight position={[4, -2, -3]} color="#243bd6" intensity={18} distance={10} />\n      <Sparkles count={72} scale={5.6} size={2.1} speed={0.24 * props.speed} opacity={0.58} color="#243bd6" />
      <group ref={group}><Sculpture {...props} /></group>
    </>
  );
}

export function AtelierWorld(props: Props) {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas frameloop={props.reducedMotion ? "demand" : "always"} dpr={[1, 1.5]} camera={{ position: [0, 0, 6.8], fov: 38, near: 0.1, far: 40 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} fallback={<div className={styles.fallback} role="img" aria-label="Abstract sculptural form in coral, blue and chartreuse"><span>F</span></div>}>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
