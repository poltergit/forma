"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./orbital-experience.module.css";
import type { MaterialMode } from "./atelier-world";

const AtelierWorld = dynamic(() => import("./atelier-world").then((module) => module.AtelierWorld), {
  ssr: false,
  loading: () => <div className={styles.sceneFallback}>PREPARING THE FORM STUDY<span /></div>,
});

gsap.registerPlugin(ScrollTrigger, useGSAP);

const studies = [
  { number: "01", name: "Shape", type: "GENERATIVE GEOMETRY", description: "Build a form from a rule, then bend the rule until something new appears.", href: "/playground", tag: "FORM / MATTER", className: "shape" },
  { number: "02", name: "Time", type: "MOTION SYSTEMS", description: "Give movement a pulse. Tune the tension between anticipation and release.", href: "/motion-lab", tag: "MOTION / RHYTHM", className: "time" },
  { number: "03", name: "Letter", type: "KINETIC TYPOGRAPHY", description: "Treat the alphabet as material: stretch it, interrupt it, make it speak.", href: "/playground#elastic-type", tag: "TYPE / VOICE", className: "letter" },
];

export function AtelierExperience() {
  const [intensity, setIntensity] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(18);
  const [seed, setSeed] = useState(4137);
  const [mode, setMode] = useState<MaterialMode>("flow");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro.fromTo("[data-intro='eyebrow']", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo("[data-intro='title']", { y: 70, opacity: 0, rotate: 2 }, { y: 0, opacity: 1, rotate: 0, duration: 1.15 }, "-=0.35")
      .fromTo("[data-intro='copy']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.55")
      .fromTo("[data-intro='scene']", { scale: 0.82, opacity: 0, rotate: -8 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.25 }, "-=0.9");
    gsap.to("[data-hero-scene]", {
      yPercent: 13,
      rotate: 7,
      scale: 0.9,
      ease: "none",
      scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 1 },
    });
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
      gsap.fromTo(element, { y: 42, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 86%", once: true },
      });
    });
  });

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} data-hero aria-labelledby="home-title">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroMeta}>
          <span data-intro="eyebrow"><i /> AN INDEPENDENT DIGITAL ATELIER</span>
          <span>ISSUE Nº 001 <b>·</b> EST. 2026</span>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.overline}>IDEAS ARE NOT MEANT TO STAY STILL.</p>
          <h1 id="home-title" data-intro="title">FORM IS<br /><em>A VERB.</em></h1>
          <div className={styles.heroBottom} data-intro="copy">
            <p>A creative instrument for shaping the things that don&apos;t exist yet. Make a mark. Bend a system. Find a form you didn&apos;t know you were looking for.</p>
            <Link href="/playground" className={styles.primaryLink}>ENTER THE ATELIER <span>↗</span></Link>
          </div>
        </div>
        <div className={styles.artStage} data-intro="scene">
          <div className={styles.artStageTop}><span>STUDY / 001—A</span><span>FORM IN FLUX</span></div>
          <div className={styles.heroScene} data-hero-scene><AtelierWorld intensity={intensity} speed={speed} density={density} seed={seed} reducedMotion={reducedMotion} mode={mode} /></div>
          <div className={styles.artStageFoot}><span>LIVE GENERATIVE STUDY</span><span>MOVE / ROTATE / RECOMPOSE</span></div>
          <span className={styles.stageCross} aria-hidden="true">✳</span>
        </div>
        <div className={styles.heroIndex}><span>01</span><span>MAKE / UNMAKE / REMAKE</span></div>
        <a href="#manifesto" className={styles.scrollCue}><span>SCROLL TO EXPLORE</span><b>↓</b></a>
      </section>

      <section id="manifesto" className={styles.manifesto}>
        <div className={styles.sectionLabel} data-reveal><span>01 / THE BELIEF</span><span>NOT A TEMPLATE. A TOOL.</span></div>
        <div className={styles.manifestoBody} data-reveal>
          <h2>Good ideas<br />need <em>room</em><br />to misbehave.</h2>
          <div className={styles.manifestoAside}>
            <span className={styles.stamp}>F—FORM / 001</span>
            <p>FORMA is a place to experiment with geometry, motion, type, and digital space. Not to follow a preset. To discover what happens when you change the conditions.</p>
            <p className={styles.smallNote}>A PLAYGROUND FOR THE CURIOUS. A WORKBENCH FOR THE OBSESSIVE.</p>
          </div>
        </div>
        <div className={styles.manifestoRule}><span>OBSERVE</span><i /><span>INTERVENE</span><i /><span>TRANSFORM</span></div>
      </section>

      <section className={styles.studies} aria-labelledby="studies-title">
        <div className={styles.sectionLabel} data-reveal><span>02 / OPEN STUDIES</span><span>SELECT A DIRECTION ↘</span></div>
        <div className={styles.studiesHeading} data-reveal>
          <h2 id="studies-title">Three ways<br />to <em>begin.</em></h2>
          <p>Each study is an invitation, not a finished answer. Enter one, pull it apart, and make it yours.</p>
        </div>
        <div className={styles.studyGrid}>
          {studies.map((study) => (
            <Link key={study.number} href={study.href} className={styles.studyCard} data-study={study.className}>
              <div className={styles.studyArtwork} aria-hidden="true">
                {study.className === "shape" && <><i /><b /><span /></>}
                {study.className === "time" && <><i /><b /><span /></>}
                {study.className === "letter" && <strong>Ag</strong>}
                <small>{study.tag}</small>
              </div>
              <div className={styles.studyMeta}><span>{study.number} / {study.type}</span><span>↗</span></div>
              <h3>{study.name}</h3>
              <p>{study.description}</p>
              <span className={styles.studyEnter}>OPEN STUDY <b>↗</b></span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.liveStudy} aria-labelledby="live-title">
        <div className={styles.liveCopy} data-reveal>
          <div className={styles.sectionLabel}><span>03 / THE INSTRUMENT</span><span>LIVE / LOCAL</span></div>
          <h2 id="live-title">Change the<br /><em>conditions.</em></h2>
          <p>Every form is a consequence of its inputs. Change the energy, rhythm, and number of fragments. The study responds in real time.</p>
          <div className={styles.controls}>
            <label><span>ENERGY <output>{intensity.toFixed(2)}×</output></span><input aria-label="Energy" type="range" min="0.65" max="1.45" step="0.05" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} /></label>
            <label><span>RHYTHM <output>{speed.toFixed(2)}×</output></span><input aria-label="Rhythm" type="range" min="0.3" max="1.8" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
            <label><span>FRAGMENTS <output>{density}</output></span><input aria-label="Fragments" type="range" min="6" max="30" step="2" value={density} onChange={(event) => setDensity(Number(event.target.value))} /></label>
            <div className={styles.modeControl}>
              <span>FIELD BEHAVIOR</span>
              <div role="group" aria-label="Choose material behavior">
                {(["flow", "prism", "signal"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{value.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className={styles.controlFoot}><span>SEED / {String(seed).padStart(5, "0")}</span><button type="button" onClick={() => setSeed((value) => value + 1)}>RECOMPOSE ↗</button></div>
          </div>
          <p className={styles.localNote}>A live local study. Your experiments are not saved.</p>
        </div>
        <div className={styles.liveVisual} aria-hidden="true">
          <div className={styles.liveVisualLabel}>VARIABLE / 03—B</div>
          <AtelierWorld intensity={intensity} speed={speed} density={density} seed={seed} reducedMotion={reducedMotion} mode={mode} />
          <div className={styles.liveVisualFoot}>INPUT → RESPONSE → FORM</div>
        </div>
      </section>

      <section className={styles.invitation}>
        <div className={styles.inviteTop}><span>04 / YOUR TURN</span><span>NO FINAL FORMS</span></div>
        <div className={styles.inviteMain} data-reveal>
          <p>THE NEXT FORM IS YOURS.</p>
          <h2>Make a little<br /><em>beautiful trouble.</em></h2>
          <Link href="/playground" className={styles.inviteLink}>START MAKING <span>↗</span></Link>
        </div>
        <div className={styles.inviteBottom}><span>FORMA® / DIGITAL ATELIER</span><span>MADE TO BE REMADE.</span></div>
      </section>
    </main>
  );
}
