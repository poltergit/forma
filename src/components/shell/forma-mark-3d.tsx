"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Emblem() {
  const root = useRef<THREE.Group>(null);
  const orbitA = useRef<THREE.Group>(null);
  const orbitB = useRef<THREE.Group>(null);
  const shards = useMemo(() => Array.from({ length: 9 }, (_, index) => {
    const angle = (index / 9) * Math.PI * 2;
    const radius = 1.48 + (index % 3) * 0.12;
    return { position: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, Math.sin(angle * 1.7) * 0.28] as [number, number, number], rotation: [angle, angle * 0.6, angle * 0.3] as [number, number, number], scale: 0.035 + (index % 3) * 0.012 };
  }), []);
  const glyph = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.48, -0.62); shape.lineTo(-0.48, 0.62); shape.lineTo(0.58, 0.62);
    shape.lineTo(0.58, 0.39); shape.lineTo(-0.22, 0.39); shape.lineTo(-0.22, 0.10);
    shape.lineTo(0.34, 0.10); shape.lineTo(0.34, -0.13); shape.lineTo(-0.22, -0.13);
    shape.lineTo(-0.22, -0.62); shape.closePath();
    return shape;
  }, []);
  const slash = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.49, -0.61); shape.lineTo(-0.39, -0.61); shape.lineTo(0.57, 0.61); shape.lineTo(0.47, 0.61); shape.closePath();
    return shape;
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!root.current || !orbitA.current || !orbitB.current) return;
    const t = clock.elapsedTime;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, pointer.x * 0.3 + Math.sin(t * 0.34) * 0.12, 2.6, delta);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.22 + Math.cos(t * 0.27) * 0.08, 2.6, delta);
    root.current.rotation.z = Math.sin(t * 0.19) * 0.06;
    root.current.scale.setScalar(1 + Math.sin(t * 1.05) * 0.018);
    orbitA.current.rotation.set(Math.PI / 2.7 + Math.sin(t * 0.2) * 0.15, t * 0.12, t * 0.2);
    orbitB.current.rotation.set(0.7 + Math.cos(t * 0.16) * 0.12, -t * 0.1, -t * 0.16);
  });

  return (
    <group ref={root} rotation={[0.12, -0.28, -0.08]}>
      <mesh position={[0, 0, -0.08]} castShadow>
        <extrudeGeometry args={[glyph, { depth: 0.22, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.045, bevelThickness: 0.04, curveSegments: 16 }]} />
        <meshPhysicalMaterial color="#D9FF3F" emissive="#D9FF3F" emissiveIntensity={0.08} metalness={0.72} roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.19]}>
        <extrudeGeometry args={[slash, { depth: 0.06, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.016, bevelThickness: 0.016 }]} />
        <meshPhysicalMaterial color="#54F2D2" emissive="#54F2D2" emissiveIntensity={0.1} metalness={0.62} roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh position={[0.08, -0.015, 0.26]}>
        <boxGeometry args={[0.72, 0.052, 0.04]} />
        <meshPhysicalMaterial color="#FF5A3C" emissive="#FF5A3C" emissiveIntensity={0.42} metalness={0.55} roughness={0.2} clearcoat={0.8} />
      </mesh>
      <mesh rotation={[0.48, 0.2, 0.34]}>
        <torusKnotGeometry args={[1.02, 0.009, 240, 8, 3, 5]} />
        <meshBasicMaterial color="#875BFF" transparent opacity={0.8} wireframe />
      </mesh>
      <group ref={orbitA}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.22, 0.014, 10, 160]} /><meshBasicMaterial color="#875BFF" transparent opacity={0.95} /></mesh>
        <mesh position={[1.22, 0, 0]}><icosahedronGeometry args={[0.075, 1]} /><meshPhysicalMaterial color="#F4F0E8" emissive="#54F2D2" emissiveIntensity={0.22} metalness={0.35} roughness={0.16} /></mesh>
      </group>
      <group ref={orbitB}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.43, 0.008, 8, 160]} /><meshBasicMaterial color="#54F2D2" transparent opacity={0.8} /></mesh>
        <mesh position={[1.43, 0, 0]}><sphereGeometry args={[0.05, 18, 18]} /><meshBasicMaterial color="#FF5A3C" /></mesh>
      </group>
      {shards.map((shard, index) => <mesh key={index} position={shard.position} rotation={shard.rotation} scale={shard.scale}><octahedronGeometry args={[1, 0]} /><meshBasicMaterial color={index % 3 === 0 ? "#D9FF3F" : index % 3 === 1 ? "#FF5A3C" : "#54F2D2"} /></mesh>)}
    </group>
  );
}

export function FormaMark3D() {
  return (
    <div style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <Canvas frameloop="always" dpr={[1, 1.4]} camera={{ position: [0, 0, 4.9], fov: 34, near: 0.1, far: 20 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={3.8} color="#F4F0E8" />
        <pointLight position={[-3, 1, 2]} intensity={24} distance={9} color="#875BFF" />
        <pointLight position={[2, -2, -1]} intensity={18} distance={8} color="#FF5A3C" />
        <pointLight position={[0, 2, 3]} intensity={12} distance={7} color="#54F2D2" />
        <Emblem />
      </Canvas>
    </div>
  );
}
