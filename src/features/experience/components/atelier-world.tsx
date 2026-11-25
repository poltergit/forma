"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import styles from "./atelier-world.module.css";

export type MaterialMode = "flow" | "prism" | "signal";
type Props = { intensity: number; speed: number; density: number; seed: number; reducedMotion: boolean; mode: MaterialMode };

const vertexShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uMode;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main() {
  vec3 displaced = position;
  float waveA = sin(position.y * (3.2 + uMode * 1.4) + uTime * 0.55) * 0.035;
  float waveB = cos(position.x * (4.0 + uMode * 1.8) - uTime * 0.38) * 0.026;
  displaced += normal * (waveA + waveB) * uIntensity;
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vNormal = normalize(normalMatrix * normal);
  vPosition = displaced;
  vViewPosition = -mvPosition.xyz;
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uSeed;
uniform float uMode;
uniform vec2 uPointer;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main() {
  float phase = vPosition.x * (2.4 + uMode * 1.6) + vPosition.y * 2.8 + uTime * 0.42 + uSeed * 0.013 + uPointer.x * 0.75;
  float wave = 0.5 + 0.5 * sin(phase);
  float bands = sin(vPosition.y * (7.0 + uMode * 5.0) + vPosition.x * 4.0 + uTime * 0.55);
  float filament = smoothstep(0.76, 0.98, abs(bands));
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.15);

  vec3 coral = vec3(1.0, 0.357, 0.271);
  vec3 blue = vec3(0.408, 0.333, 0.961);
  vec3 acid = vec3(0.847, 1.0, 0.220);
  vec3 baseColor = mix(coral, blue, wave);

  if (uMode > 0.5 && uMode < 1.5) {
    baseColor = mix(blue, acid, smoothstep(0.12, 0.9, wave));
    baseColor = mix(baseColor, coral, filament * 0.34);
  } else if (uMode > 1.5) {
    float signal = step(0.0, sin(phase * 2.1 + bands));
    baseColor = mix(coral, acid, signal);
    baseColor = mix(baseColor, blue, fresnel * 0.8);
  } else {
    baseColor = mix(baseColor, acid, smoothstep(0.66, 0.98, bands) * 0.5);
  }

  baseColor += filament * 0.16 * acid;
  baseColor += fresnel * 0.52 * blue;
  gl_FragColor = vec4(baseColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function LivingSurface({ intensity, seed, reducedMotion, mode }: Pick<Props, "intensity" | "seed" | "reducedMotion" | "mode">) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uSeed: { value: 0 },
      uMode: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  }), []);
  const materialRef = useRef(material);

  useFrame(({ clock, pointer }) => {
    const shader = materialRef.current;
    shader.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
    shader.uniforms.uIntensity.value = intensity;
    shader.uniforms.uSeed.value = seed;
    shader.uniforms.uMode.value = mode === "flow" ? 0 : mode === "prism" ? 1 : 2;
    shader.uniforms.uPointer.value.set(pointer.x, pointer.y);
  });

  return <primitive object={material} attach="material" />;
}

function Sculpture({ intensity, speed, density, seed, reducedMotion, mode }: Props) {
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
    <group ref={sculpture}>
      <mesh rotation={[0.4, 0.2, 0.1]}>
        <torusKnotGeometry args={[0.78, 0.23, 220, 24, 2, 5]} />
        <LivingSurface intensity={intensity} seed={seed} reducedMotion={reducedMotion} mode={mode} />
      </mesh>
      <mesh rotation={[0.8, 0.3, 0.6]} scale={0.72}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#6855f5" metalness={0.78} roughness={0.24} wireframe />
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
      <pointLight position={[-4, 1, 3]} color="#ff5b45" intensity={24} distance={12} />
      <pointLight position={[4, -2, -3]} color="#6855f5" intensity={18} distance={10} />
      {!props.reducedMotion && <Sparkles count={Math.min(props.density * 3, 90)} scale={5.6} size={2.1} speed={0.24 * props.speed} opacity={0.58} color="#6855f5" />}
      <group ref={group}><Sculpture {...props} /></group>
    </>
  );
}

export function AtelierWorld(props: Props) {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas frameloop={props.reducedMotion ? "demand" : "always"} dpr={[1, 1.25]} camera={{ position: [0, 0, 6.8], fov: 38, near: 0.1, far: 40 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} fallback={<div className={styles.fallback} role="img" aria-label="Abstract sculptural form in coral, blue and chartreuse"><span>F</span></div>}>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
