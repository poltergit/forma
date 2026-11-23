"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./orbital-experience.module.css";

type SpecimenId = "form" | "motion" | "type" | "space" | "field";
type MutableValue = { value: number };
type PointerValue = { x: number; y: number };

const OrbitalWorld = dynamic(
  () => import("./orbital-world").then((module) => module.OrbitalWorld),
  {
    ssr: false,
    loading: () => <div className={styles.fallback}><span>FORM ENGINE / INITIALIZING</span><i /></div>,
  },
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

const territories: Array<{
  id: SpecimenId;
  number: string;
  name: string;
  descriptor: string;
  description: string;
  href: string | null;
  action: string;
}> = [
  { id: "form", number: "01", name: "Form", descriptor: "MATTER / GEOMETRY", description: "Parametric objects, displacement, material, and the rules that give a shape its character.", href: "/playground", action: "ENTER PLAYGROUND" },
  { id: "motion", number: "02", name: "Motion", descriptor: "TIME / FORCE", description: "Trajectories, easing, rhythm, and the feeling hidden inside a transformation.", href: "/motion-lab", action: "ENTER MOTION LAB" },
  { id: "type", number: "03", name: "Type", descriptor: "GLYPH / TENSION", description: "Letters become matter. Spacing, distortion, and composition become instruments.", href: "/playground#elastic-type", action: "EXPLORE TYPE STUDY" },
  { id: "space", number: "04", name: "Space", descriptor: "DEPTH / PERSPECTIVE", description: "Frames, cameras, volumes, and scenes that can be assembled and reshaped.", href: null, action: "IN DEVELOPMENT" },
  { id: "field", number: "05", name: "Field", descriptor: "SEED / VARIATION", description: "A system of parts responding to a seed, a force, and a set of constraints.", href: "/playground#displacement-field", action: "EXPLORE THE FIELD" },
];

const chapters = [
  { id: "ignite", number: "01", label: "IGNITE" },
  { id: "the-idea", number: "02", label: "DISTURB" },
  { id: "disciplines", number: "03", label: "COMPOSE" },
  { id: "direct", number: "04", label: "DIRECT" },
  { id: "build", number: "05", label: "BUILD" },
] as const;

export function OrbitalExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const progress = useRef<MutableValue>({ value: 0 });
  const pointer = useRef<PointerValue>({ x: 0, y: 0 });
  const [selected, setSelected] = useState<SpecimenId>("form");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);
  const [intensity, setIntensity] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(14);
  const [seed, setSeed] = useState(4137);
  const active = territories.find((item) => item.id === selected) ?? territories[0];

  useGSAP(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion) {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(".heroEyebrow", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 })
        .fromTo(".heroTitle", { opacity: 0, y: 52, rotateX: -12 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.15 }, "-=0.38")
        .fromTo(".orbitLegend", { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.8 }, "-=0.55")
        .fromTo(".heroFooter", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.45");

      gsap.to(progress.current, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      root.querySelectorAll<HTMLElement>("[data-chapter-copy]").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0.38, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element.closest("section"),
              start: "top 74%",
              end: "top 38%",
              scrub: 0.65,
            },
          },
        );
      });
    }
  }, { scope: rootRef });

  function updatePointer(event: PointerEvent<HTMLElement>) {
    pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function resetPointer() {
    pointer.current.x = 0;
    pointer.current.y = 0;
  }

  function recompose() {
    setSeed((value) => value + 1);
  }

  return (
    <main
      id="main-content"
      ref={rootRef}
      className={styles.world}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
      onPointerUp={(event) => { if (event.pointerType === "touch") resetPointer(); }}
    >
      <div className={styles.stickyStage} aria-hidden="true">
        <div className={styles.stageAtmosphere} />
        <OrbitalWorld
          progress={progress}
          pointer={pointer}
          selected={selected}
          onSelect={setSelected}
          intensity={intensity}
          speed={speed}
          density={density}
          seed={seed}
          reducedMotion={reducedMotion}
        />
        <div className={styles.centralIdentity}>
          <span className={styles.identityIndex}>GENERATIVE SYSTEM / 001</span>
          <span className={styles.wordmark}>FORMA<span>®</span></span>
          <span className={styles.identityTag}>WHERE FORM MEETS FUNCTION</span>
        </div>
        <div className={styles.orbitCaption} aria-hidden="true">
          <span>THE FORM ENGINE</span><span data-testid="orbital-seed">SEED / {String(seed).padStart(5, "0")}</span>
        </div>
      </div>

      <section id="ignite" className={`${styles.chapter} ${styles.ignite}`} aria-labelledby="ignite-title">
        <div className={styles.heroTop}>
          <p className={`heroEyebrow ${styles.eyebrow}`}><i /> AN INTERACTIVE DIGITAL UNIVERSE</p>
          <span className={styles.heroSerial}>F—001 / A WORLD OF FORM</span>
        </div>
        <div className={styles.heroHeadline}>
          <h1 id="ignite-title" className={`heroTitle ${styles.heroTitle}`}>
            <span>MAKE FORM</span>
            <span><em>MOVE.</em></span>
          </h1>
          <p className={styles.heroSubline}>A living system of ideas, matter, and motion.</p>
        </div>

        <div className={`orbitLegend ${styles.orbitLegend}`}>
          <span className={styles.legendTitle}>SPECIMENS IN ORBIT</span>
          <div>
            {territories.map((item) => (
              <button
                key={item.id}
                type="button"
                className={selected === item.id ? styles.legendActive : ""}
                aria-pressed={selected === item.id}
                onClick={() => setSelected(item.id)}
              >
                <i aria-hidden="true" />{item.name}<small>{item.number}</small>
              </button>
            ))}
          </div>
          <div className={styles.selectedDetail} aria-live="polite" aria-atomic="true">
            <span>{active.descriptor}</span>
            <strong>{active.name}</strong>
            <p>{active.description}</p>
            {active.href ? (
              <Link href={active.href}>EXPLORE {active.name.toUpperCase()} <i aria-hidden="true">↗</i></Link>
            ) : (
              <span className={styles.inDevelopment}>IN DEVELOPMENT</span>
            )}
          </div>
        </div>

        <div className={`heroFooter ${styles.heroFooter}`}>
          <span>POINTER / TOUCH TO DISTURB THE FIELD</span>
          <button type="button" onClick={recompose}>RECOMPOSE <b aria-hidden="true">↗</b></button>
          <a href="#the-idea">SCROLL TO ENTER <span aria-hidden="true">↓</span></a>
        </div>
        <span className={styles.sideAnnotation}>ORBITAL STUDY / 4137</span>
      </section>

      <section id="the-idea" className={`${styles.chapter} ${styles.disturb}`} aria-labelledby="disturb-title">
        <div className={`${styles.chapterCopy} ${styles.disturbCopy}`} data-chapter-copy>
          <span className={styles.chapterKicker}>02 / DISTURB THE EXPECTED</span>
          <h2 id="disturb-title">Form is not<br /><em>a final state.</em></h2>
          <p>It is a set of possibilities. Pull a system out of alignment. Change its rules. Give an idea a new dimension. FORMA is where those possibilities become something you can feel.</p>
          <a href="#disciplines" className={styles.textLink}>EXPLORE THE TERRITORIES <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.aperture} aria-hidden="true"><i /><i /><i /></div>
        <span className={styles.chapterAside}>THERE IS ALWAYS ANOTHER WAY TO SHAPE IT.</span>
      </section>

      <section id="disciplines" className={`${styles.chapter} ${styles.compose}`} aria-labelledby="compose-title">
        <div className={`${styles.chapterCopy} ${styles.composeCopy}`} data-chapter-copy>
          <span className={styles.chapterKicker}>03 / COMPOSE A NEW REALITY</span>
          <h2 id="compose-title">Five forces.<br /><em>One universe.</em></h2>
          <p>Every specimen belongs to a different creative territory. Select one in the orbit, then enter the tools that let you reshape it.</p>
        </div>
        <div className={styles.territoryField}>
          <span className={styles.fieldIndex}>THE CREATIVE TERRITORIES / 05</span>
          {territories.map((item, index) => (
            <article key={item.id} className={`${styles.territory} ${styles[`territory${index + 1}`]}`}>
              <button type="button" onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
                <span>{item.number} / {item.descriptor}</span>
                <strong>{item.name}</strong>
                <i aria-hidden="true">↗</i>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="direct" className={`${styles.chapter} ${styles.direct}`} aria-labelledby="direct-title">
        <div className={`${styles.chapterCopy} ${styles.directCopy}`} data-chapter-copy>
          <span className={styles.chapterKicker}>04 / DIRECT THE SYSTEM</span>
          <h2 id="direct-title">Don&apos;t just watch.<br /><em>Change the rules.</em></h2>
          <p>The orbit is a live generative composition. Change its energy, pace, and field density. Recompose to create a different arrangement from a new seed.</p>
        </div>
        <div className={styles.instrument}>
          <div className={styles.instrumentHead}><span>ORBITAL PARAMETERS</span><span>LIVE / LOCAL</span></div>
          <label>
            <span>ENERGY <output>{intensity.toFixed(2)}×</output></span>
            <input aria-label="Orbit energy" type="range" min="0.55" max="1.5" step="0.05" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} />
          </label>
          <label>
            <span>ORBIT SPEED <output>{speed.toFixed(2)}×</output></span>
            <input aria-label="Orbit speed" type="range" min="0.35" max="1.8" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </label>
          <label>
            <span>FIELD DENSITY <output>{density}</output></span>
            <input aria-label="Field density" type="range" min="6" max="28" step="2" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
          </label>
          <div className={styles.instrumentFoot}><span>SEED / {String(seed).padStart(5, "0")}</span><button type="button" onClick={recompose}>GENERATE NEW FORM ↗</button></div>
          <p className={styles.parameterNote}>Parameters change the orbital composition. This local study is not yet a saved artifact.</p>
        </div>
      </section>

      <section id="build" className={`${styles.chapter} ${styles.build}`} aria-labelledby="build-title">
        <div className={`${styles.chapterCopy} ${styles.buildCopy}`} data-chapter-copy>
          <span className={styles.chapterKicker}>05 / ENTER THE PLAYGROUND</span>
          <h2 id="build-title">Make something<br /><em>unexpected.</em></h2>
          <p>The universe is only the beginning. Step inside the experiments, change the parameters, and make a form that belongs to you.</p>
          <div className={styles.buildLinks}>
            <Link href="/playground">ENTER PLAYGROUND <span aria-hidden="true">↗</span></Link>
            <Link href="/motion-lab">EXPLORE MOTION LAB <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <span className={styles.buildMark}>F<span>∞</span></span>
        <span className={styles.chapterAside}>FORM IS NEVER FINAL.</span>
      </section>

      <nav className={styles.chapterNav} aria-label="Experience chapters">
        {chapters.map((item) => (
          <a key={item.id} href={`#${item.id}`} aria-label={`${item.number} ${item.label}`} title={item.label}>
            <span>{item.number}</span>
          </a>
        ))}
      </nav>

      <div className={styles.mobileTerritories} aria-label="Explore FORMA territories">
        {territories.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
            {item.name}
          </button>
        ))}
      </div>
    </main>
  );
}
