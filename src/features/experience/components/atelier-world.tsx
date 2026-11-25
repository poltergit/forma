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
  float warp = sin(position.x * 2.1 + position.y * 3.4 + uTime * 0.24) * 0.08;
  float waveA = sin(position.y * (3.2 + uMode * 1.4) + uTime * 0.55 + warp) * 0.052;
  float waveB = cos(position.x * (4.0 + uMode * 1.8) - uTime * 0.38 + warp) * 0.038;
  float crease = sin((position.x + position.y) * 7.0 + uTime * 0.18) * 0.012;
  displaced += normal * (waveA + waveB + crease) * uIntensity;
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
  vec2 field = vPosition.xy + uPointer * 0.22;
  float warp = sin(field.x * 3.1 + sin(field.y * 2.4 + uTime * 0.16)) * 0.42;
  float phase = field.x * (2.4 + uMode * 1.6) + field.y * 2.8 + uTime * 0.42 + uSeed * 0.013 + warp;
  float wave = 0.5 + 0.5 * sin(phase);
  float bands = sin(field.y * (7.0 + uMode * 5.0) + field.x * 4.0 + uTime * 0.55 + warp);
  float filament = smoothstep(0.72, 0.98, abs(bands));
  float contour = smoothstep(0.91, 0.995, abs(sin(phase * 1.7 + bands * 0.8)));
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.15);

  vec3 coral = vec3(1.0, 0.357, 0.271);
  vec3 iris = vec3(0.408, 0.333, 0.961);
  vec3 acid = vec3(0.847, 1.0, 0.220);
  vec3 mint = vec3(0.659, 0.898, 0.831);
  vec3 bone = vec3(0.945, 0.929, 0.890);
  vec3 baseColor = mix(coral, iris, wave);

  if (uMode > 0.5 && uMode < 1.5) {
    baseColor = mix(iris, acid, smoothstep(0.12, 0.9, wave));
    baseColor = mix(baseColor, coral, filament * 0.34);
  } else if (uMode > 1.5) {
    float signal = step(0.0, sin(phase * 2.1 + bands));
    baseColor = mix(coral, acid, signal);
    baseColor = mix(baseColor, iris, fresnel * 0.8);
  } else {
    baseColor = mix(baseColor, acid, smoothstep(0.66, 0.98, bands) * 0.5);
  }

  baseColor = mix(baseColor, mint, smoothstep(0.58, 0.98, wave + bands * 0.16) * 0.34);
  baseColor = mix(baseColor, bone, contour * 0.58);
  baseColor += filament * 0.2 * acid;
  baseColor += fresnel * 0.42 * iris;
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

function Afterform({ reducedMotion }: { reducedMotion: boolean }) {
  const trace = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!trace.current || reducedMotion) return;
    trace.current.rotation.y = THREE.MathUtils.damp(trace.current.rotation.y, Math.sin(clock.elapsedTime * 0.22) * 0.24, 1.8, delta);
    trace.current.rotation.z = THREE.MathUtils.damp(trace.current.rotation.z, Math.cos(clock.elapsedTime * 0.17) * 0.18, 1.8, delta);
  });

  return (
    <group ref={trace} scale={1.16}>
      <mesh rotation={[0.42, 0.18, -0.12]}>
        <torusKnotGeometry args={[0.9, 0.012, 180, 6, 3, 4]} />
        <meshBasicMaterial color="#ff5b45" transparent opacity={0.72} wireframe />
      </mesh>
      <mesh rotation={[-0.28, 0.56, 0.34]} scale={1.08}>
        <torusKnotGeometry args={[0.82, 0.009, 160, 5, 2, 5]} />
        <meshBasicMaterial color="#a8e5d2" transparent opacity={0.62} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.3, 0.18]}>
        <torusGeometry args={[1.82, 0.008, 6, 180]} />
        <meshBasicMaterial color="#d8ff38" transparent opacity={0.7} />
      </mesh>
    </group>
  );
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
        <meshPhysicalMaterial color="#6855f5" metalness={0.72} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.12} wireframe />
      </mesh>
      <Afterform reducedMotion={reducedMotion} />
      <mesh rotation={[Math.PI / 2.2, 0.4, 0]}>
        <torusGeometry args={[1.55, 0.012, 8, 180]} />
        <meshBasicMaterial color="#20211f" transparent opacity={0.48} />
      </mesh>
      {shards.map((shard, index) => (
        <mesh key={index} position={shard.position} rotation={shard.rotation} scale={shard.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={index % 4 === 0 ? "#ff5b45" : index % 4 === 1 ? "#6855f5" : index % 4 === 2 ? "#d8ff38" : "#a8e5d2"} metalness={0.48} roughness={0.24} clearcoat={0.65} clearcoatRoughness={0.2} />
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
      <pointLight position={[-4, 1, 3]} color="#ff5b45" intensity={26} distance={12} />
      <pointLight position={[4, -2, -3]} color="#6855f5" intensity={20} distance={10} />
      <pointLight position={[0, -4, 2]} color="#a8e5d2" intensity={8} distance={9} />
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
