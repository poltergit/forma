"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Emblem() {
  const root = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const shape = useMemo(() => {
    const form = new THREE.Shape();
    form.moveTo(-0.48, -0.62);
    form.lineTo(-0.48, 0.62);
    form.lineTo(0.58, 0.62);
    form.lineTo(0.58, 0.39);
    form.lineTo(-0.22, 0.39);
    form.lineTo(-0.22, 0.10);
    form.lineTo(0.34, 0.10);
    form.lineTo(0.34, -0.13);
    form.lineTo(-0.22, -0.13);
    form.lineTo(-0.22, -0.62);
    form.closePath();
    return form;
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!root.current || !orbit.current) return;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, pointer.x * 0.22 + Math.sin(clock.elapsedTime * 0.28) * 0.08, 2.4, delta);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.16 + Math.cos(clock.elapsedTime * 0.22) * 0.05, 2.4, delta);
    orbit.current.rotation.z = clock.elapsedTime * 0.16;
    orbit.current.rotation.x = Math.PI / 2.7 + Math.sin(clock.elapsedTime * 0.18) * 0.12;
  });

  return (
    <group ref={root} rotation={[0.12, -0.28, -0.08]}>
      <mesh position={[0, 0, -0.08]} castShadow>
        <extrudeGeometry args={[shape, { depth: 0.16, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 12 }]} />
        <meshPhysicalMaterial color="#d8ff38" metalness={0.56} roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0.08, -0.015, 0.18]}>
        <boxGeometry args={[0.72, 0.045, 0.035]} />
        <meshStandardMaterial color="#ff5b45" emissive="#ff5b45" emissiveIntensity={0.22} metalness={0.35} roughness={0.24} />
      </mesh>
      <group ref={orbit}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.98, 0.012, 8, 128]} />
          <meshBasicMaterial color="#6855f5" transparent opacity={0.95} />
        </mesh>
        <mesh position={[0.98, 0, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#f1ede3" />
        </mesh>
      </group>
      <mesh rotation={[0.9, 0.2, 0.3]}>
        <torusGeometry args={[1.18, 0.006, 6, 128]} />
        <meshBasicMaterial color="#ff5b45" transparent opacity={0.72} />
      </mesh>
    </group>
  );
}

export function FormaMark3D() {
  return (
    <div style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.4], fov: 34, near: 0.1, far: 20 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 4, 5]} intensity={3.2} color="#f1ede3" />
        <pointLight position={[-3, 1, 2]} intensity={18} distance={8} color="#6855f5" />
        <pointLight position={[2, -2, -1]} intensity={12} distance={7} color="#ff5b45" />
        <Emblem />
      </Canvas>
    </div>
  );
}
