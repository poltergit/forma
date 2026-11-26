"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import styles from "./atelier-world.module.css";

export type ForceMode = "orbit" | "fracture" | "resolve";
type Props = { intensity: number; speed: number; density: number; seed: number; reducedMotion: boolean; mode: ForceMode };

const vertexShader = `
uniform float uTime; uniform float uIntensity; uniform float uMode;
varying vec3 vNormal; varying vec3 vPosition; varying vec3 vViewPosition;
void main() {
 vec3 displaced=position; float radius=length(position.xy); float angle=atan(position.y,position.x);
 float orbitForce=sin(angle*3.0-uTime*0.42+radius*2.0)*0.09;
 float fractureNoise=sin(position.x*13.0+position.y*9.0)*cos(position.y*15.0-position.z*8.0);
 float fractureEdge=smoothstep(0.42,0.92,abs(fractureNoise));
 float resolveContour=sin(radius*13.0-uTime*0.18)*0.045;
 float wave=sin(position.y*3.2+uTime*0.34)*0.035;
 if(uMode<0.5){vec3 tangent=vec3(-position.y,position.x,0.0)*orbitForce;displaced+=tangent+normal*(wave+orbitForce*0.42)*uIntensity;}
 else if(uMode<1.5){displaced+=normal*(fractureEdge*0.13+wave*0.4)*uIntensity;displaced+=normalize(position+vec3(0.0001))*fractureEdge*0.035;}
 else{displaced+=normal*(resolveContour+wave*0.25)*uIntensity;displaced-=normalize(position+vec3(0.0001))*resolveContour*0.22;}
 vec4 mvPosition=modelViewMatrix*vec4(displaced,1.0);gl_Position=projectionMatrix*mvPosition;
 vNormal=normalize(normalMatrix*normal);vPosition=displaced;vViewPosition=-mvPosition.xyz;
}
`;
const fragmentShader = `
uniform float uTime; uniform float uSeed; uniform float uMode; uniform vec2 uPointer;
varying vec3 vNormal; varying vec3 vPosition; varying vec3 vViewPosition;
void main(){
 vec2 field=vPosition.xy+uPointer*0.22;float radius=length(field);float angle=atan(field.y,field.x);
 float phase=field.x*2.4+field.y*2.8+uTime*0.3+uSeed*0.013;float wave=0.5+0.5*sin(phase);
 float orbitLines=smoothstep(0.9,0.99,abs(sin(radius*10.0-uTime*0.28+angle*1.5)));
 float crackField=sin(field.x*12.0+sin(field.y*8.0))*cos(field.y*13.0-field.x*4.0);
 float crackLines=smoothstep(0.74,0.96,abs(crackField));
 float contourLines=smoothstep(0.93,0.995,abs(sin(radius*16.0+sin(angle*4.0)*1.8)));
 float fresnel=pow(1.0-max(dot(normalize(vNormal),normalize(vViewPosition)),0.0),2.15);
 vec3 flame=vec3(1.0,0.353,0.235);vec3 ultraviolet=vec3(0.529,0.357,1.0);
 vec3 hyperlime=vec3(0.851,1.0,0.247);vec3 cyan=vec3(0.329,0.949,0.824);vec3 porcelain=vec3(0.957,0.941,0.910);vec3 baseColor;
 if(uMode<0.5){baseColor=mix(ultraviolet,cyan,wave);baseColor=mix(baseColor,hyperlime,orbitLines*0.72);baseColor=mix(baseColor,flame,smoothstep(0.75,1.0,sin(angle*3.0+phase))*0.28);}
 else if(uMode<1.5){baseColor=mix(flame,ultraviolet,wave);baseColor=mix(baseColor,hyperlime,crackLines*0.92);baseColor=mix(baseColor,porcelain,crackLines*0.24);}
 else{baseColor=mix(flame,cyan,smoothstep(0.0,1.0,wave));baseColor=mix(baseColor,porcelain,contourLines*0.72);baseColor=mix(baseColor,hyperlime,smoothstep(0.72,0.98,wave)*0.28);}
 baseColor+=fresnel*0.38*ultraviolet;gl_FragColor=vec4(baseColor,1.0);
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
    shader.uniforms.uMode.value = mode === "orbit" ? 0 : mode === "fracture" ? 1 : 2;
    shader.uniforms.uPointer.value.set(pointer.x, pointer.y);
  });

  return <primitive object={material} attach="material" />;
}

function Afterform({ reducedMotion, mode }: { reducedMotion: boolean; mode: ForceMode }) {
  const trace = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!trace.current || reducedMotion) return;
    trace.current.rotation.y = THREE.MathUtils.damp(trace.current.rotation.y, mode === "orbit" ? Math.sin(clock.elapsedTime * 0.22) * 0.24 : mode === "fracture" ? Math.sin(clock.elapsedTime * 0.31) * 0.08 : 0, 1.8, delta);
    trace.current.rotation.z = THREE.MathUtils.damp(trace.current.rotation.z, mode === "fracture" ? Math.cos(clock.elapsedTime * 0.17) * 0.22 : mode === "resolve" ? 0 : Math.cos(clock.elapsedTime * 0.17) * 0.12, 1.8, delta);
    const targetScale = mode === "fracture" ? 1.3 : mode === "resolve" ? 0.94 : 1.12;
    trace.current.scale.setScalar(THREE.MathUtils.damp(trace.current.scale.x, targetScale, 2.2, delta));
  });

  return (
    <group ref={trace}>
      {mode === "orbit" && <>
        <mesh rotation={[0.42,0.18,-0.12]}><torusKnotGeometry args={[0.9,0.012,180,6,3,4]}/><meshBasicMaterial color="#ff5a3c" transparent opacity={0.72} wireframe/></mesh>
        <mesh rotation={[-0.28,0.56,0.34]} scale={1.08}><torusKnotGeometry args={[0.82,0.009,160,5,2,5]}/><meshBasicMaterial color="#54f2d2" transparent opacity={0.62} wireframe/></mesh>
        <mesh rotation={[Math.PI/2.5,0.3,0.18]}><torusGeometry args={[1.82,0.008,6,180]}/><meshBasicMaterial color="#d9ff3f" transparent opacity={0.7}/></mesh>
      </>}
      {mode === "fracture" && <group rotation={[0.3,0.2,-0.18]}>
        {Array.from({length:12},(_,index)=>{const angle=index/12*Math.PI*2;const radius=1.12+(index%3)*0.12;return <mesh key={index} position={[Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(angle*2)*0.2]} rotation={[angle,angle*0.7,0]}><tetrahedronGeometry args={[0.12+(index%2)*0.06,0]}/><meshBasicMaterial color={index%3===0?"#d9ff3f":index%3===1?"#ff5a3c":"#54f2d2"} wireframe transparent opacity={0.9}/></mesh>;})}
        <mesh rotation={[0.2,0.4,0.1]}><icosahedronGeometry args={[1.55,1]}/><meshBasicMaterial color="#875bff" wireframe transparent opacity={0.24}/></mesh>
      </group>}
      {mode === "resolve" && <>
        {[1.15,1.36,1.57].map((radius,index)=><mesh key={radius} rotation={[Math.PI/2+index*0.08,index*0.16,0]}><torusGeometry args={[radius,0.009,6,180]}/><meshBasicMaterial color={index===1?"#d9ff3f":"#54f2d2"} transparent opacity={0.7-index*0.12}/></mesh>)}
        <mesh rotation={[0.42,0.18,-0.12]}><torusKnotGeometry args={[0.92,0.008,180,6,3,4]}/><meshBasicMaterial color="#f4f0e8" transparent opacity={0.42} wireframe/></mesh>
      </>}
    </group>
  );
}

function Sculpture({ intensity, speed, density, seed, reducedMotion, mode }: Props) {
  const sculpture = useRef<THREE.Group>(null);
  const shards = useMemo(() => Array.from({ length: density }, (_, index) => {
    const angle = index * 2.399963 + seed * 0.013;
    const radius = mode === "fracture" ? 1.58 + (index % 4) * 0.22 : mode === "resolve" ? 0.92 + (index % 4) * 0.09 : 1.35 + (index % 4) * 0.19;
    return { position: [Math.cos(angle) * radius, Math.sin(angle * 1.7) * radius * 0.58, Math.sin(angle) * (mode === "fracture" ? 1.0 : 0.72)] as [number, number, number], rotation: [angle * 0.3, angle, angle * 0.18] as [number, number, number], scale: (mode === "fracture" ? 0.105 : mode === "resolve" ? 0.055 : 0.08) + (index % 5) * 0.02 };
  }), [density, seed, mode]);

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
        <meshPhysicalMaterial color="#875bff" metalness={0.72} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.12} wireframe />
      </mesh>
      <Afterform reducedMotion={reducedMotion} mode={mode} />
      <mesh rotation={[Math.PI / 2.2, 0.4, 0]}>
        <torusGeometry args={[1.55, 0.012, 8, 180]} />
        <meshBasicMaterial color="#100d18" transparent opacity={0.48} />
      </mesh>
      {shards.map((shard, index) => (
        <mesh key={index} position={shard.position} rotation={shard.rotation} scale={shard.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={index % 4 === 0 ? "#ff5a3c" : index % 4 === 1 ? "#875bff" : index % 4 === 2 ? "#d9ff3f" : "#54f2d2"} metalness={0.48} roughness={0.24} clearcoat={0.65} clearcoatRoughness={0.2} />
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
      <pointLight position={[-4, 1, 3]} color="#ff5a3c" intensity={26} distance={12} />
      <pointLight position={[4, -2, -3]} color="#875bff" intensity={20} distance={10} />
      <pointLight position={[0, -4, 2]} color="#54f2d2" intensity={8} distance={9} />
      {!props.reducedMotion && <Sparkles count={Math.min(props.density * 3, 90)} scale={5.6} size={2.1} speed={0.24 * props.speed} opacity={0.58} color="#875bff" />}
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
