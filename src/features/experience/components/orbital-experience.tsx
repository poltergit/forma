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
  loading: () => <div className={styles.sceneFallback}>FORMING THE SPECIMEN<span /></div>,
});

gsap.registerPlugin(ScrollTrigger, useGSAP);

const studies = [
  { number: "01", name: "Matter studies", title: "Give an idea a body.", type: "GENERATIVE GEOMETRY", description: "Build a form from a rule. Bend the rule. Keep the beautiful accidents.", href: "/playground", tag: "MATTER / 001", className: "matter" },
  { number: "02", name: "Force studies", title: "Make time tangible.", type: "MOTION SYSTEMS", description: "Shape the pull, push, rhythm, and release that make movement feel alive.", href: "/motion-lab", tag: "FORCE / 002", className: "force" },
  { number: "03", name: "Type studies", title: "Let letters misbehave.", type: "KINETIC TYPOGRAPHY", description: "Treat language as material. Stretch it, interrupt it, give it dimension.", href: "/playground#elastic-type", tag: "NOTATION / 003", className: "notation" },
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
    intro.fromTo("[data-intro='index']", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 })
      .fromTo("[data-intro='headline'] > *", { yPercent: 115, rotate: 3, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.05, stagger: 0.12 }, "-=0.25")
      .fromTo("[data-intro='copy']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.55")
      .fromTo("[data-intro='specimen']", { scale: 0.78, rotate: -8, opacity: 0 }, { scale: 1, rotate: 1.4, opacity: 1, duration: 1.35 }, "-=1")
      .fromTo(`.${styles.specimenAnnotation}, .${styles.specimenLegend}`, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 }, "-=0.6")
      .fromTo(`.${styles.materialDock}`, { y: 18, opacity: 0, rotate: -3 }, { y: 0, opacity: 1, rotate: 0, duration: 0.65 }, "-=0.35")
      .fromTo(`.${styles.heroFoot}`, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, "-=0.2");

    gsap.to("[data-specimen]", {
      yPercent: 12,
      rotateX: -7,
      rotateY: 5,
      rotate: 5,
      scale: 0.92,
      transformPerspective: 1100,
      ease: "none",
      scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 1 },
    });
    gsap.to(`.${styles.heroGrid}`, {
      yPercent: 18,
      opacity: 0.12,
      ease: "none",
      scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 1.2 },
    });
    gsap.to(`.${styles.heroSideNote}`, {
      yPercent: 55,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 1 },
    });

    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
      gsap.fromTo(element, { y: 34, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
      });
    });

    gsap.utils.toArray<HTMLElement>(`.${styles.studyArtwork}`).forEach((artwork, index) => {
      gsap.fromTo(artwork, { y: 42, rotateX: index % 2 ? -14 : 14, rotateY: index % 2 ? 9 : -9, rotate: index % 2 ? 3 : -3, scale: 0.88, transformPerspective: 900 }, {
        y: 0, rotateX: 0, rotateY: 0, rotate: 0, scale: 1, duration: 1.15, ease: "power3.out",
        scrollTrigger: { trigger: artwork, start: "top 90%", once: true },
      });
    });

    gsap.fromTo(`.${styles.instrumentStage}`, { clipPath: "inset(8% 8% 8% 8%)", opacity: 0.6 }, {
      clipPath: "inset(0% 0% 0% 0%)",
      opacity: 1,
      duration: 1.15,
      ease: "power3.out",
      scrollTrigger: { trigger: `.${styles.instrumentStage}`, start: "top 82%", once: true },
    });

    // A restrained pointer-driven shift gives the specimen a sense of depth
    // without taking control away from the interactive Three.js scene.
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const specimen = document.querySelector<HTMLElement>(`.${styles.specimenCanvas}`);
    if (!hero || !specimen || window.matchMedia("(hover: none)").matches) return;

    const moveX = gsap.quickTo(specimen, "x", { duration: 0.9, ease: "power3.out" });
    const moveY = gsap.quickTo(specimen, "y", { duration: 0.9, ease: "power3.out" });
    const tiltX = gsap.quickTo(specimen, "rotateX", { duration: 1.1, ease: "power3.out" });
    const tiltY = gsap.quickTo(specimen, "rotateY", { duration: 1.1, ease: "power3.out" });

    const onPointerMove = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveX(x * 18);
      moveY(y * 14);
      tiltX(y * -5);
      tiltY(x * 7);
    };
    const onPointerLeave = () => {
      moveX(0);
      moveY(0);
      tiltX(0);
      tiltY(0);
    };

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    return () => {
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
    };
  });

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} data-hero aria-labelledby="home-title">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroIndex} data-intro="index">
          <span><i /> INDEPENDENT DIGITAL ATELIER</span>
          <span>ISSUE 001 <b>—</b> MATTER IN MOTION</span>
        </div>

        <div className={styles.heroComposition}>
          <div className={styles.heroCopy}>
            <p className={styles.overline}>A WORLD IN THE MAKING <span>✳</span></p>
            <h1 id="home-title" data-intro="headline">
              <span>NOTHING</span>
              <span>STAYS <em>STILL.</em></span>
            </h1>
            <div className={styles.heroDescription} data-intro="copy">
              <p>Ideas are matter waiting for a force. Give them shape, disturb the surface, and see what they become.</p>
              <Link href="/playground" className={styles.enterLink}>ENTER THE ATELIER <span>↗</span></Link>
            </div>
          </div>

          <div className={styles.specimenStage} data-intro="specimen">
            <div className={styles.specimenField} data-specimen>
              <div className={styles.fieldAxis} aria-hidden="true"><i /><i /><i /></div>
              <div className={styles.afterform} aria-hidden="true"><i /><i /><i /></div>
              <div className={styles.specimenCanvas}>
                <AtelierWorld intensity={intensity} speed={speed} density={density} seed={seed} reducedMotion={reducedMotion} mode={mode} />
              </div>
              <span className={styles.specimenMark} aria-hidden="true">✳</span>
              <span className={styles.specimenCoordinate}>X 04.13 / Y 08.26 / Z ∞</span>
            </div>
            <div className={styles.specimenAnnotation}><span>SPECIMEN Nº 001</span><b>FORM / IN FLUX</b></div>
            <div className={styles.specimenLegend}><span>LIVE GENERATIVE OBJECT</span><span>DRAG TO DISTURB ↗</span></div>
            <div className={styles.materialDock} role="group" aria-label="Change the live specimen material behavior">
              <span>FORCE FIELD</span>
              {([
                ["flow", "FLOW", "Liquid movement"],
                ["prism", "PRISM", "Refracted geometry"],
                ["signal", "SIGNAL", "Kinetic signal"],
              ] as const).map(([value, label, description]) => (
                <button key={value} type="button" aria-label={description} aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroFoot}>
          <span>01 / THE FIRST IMPRESSION</span>
          <a href="#belief">SCROLL TO DISCOVER <b>↓</b></a>
          <span>FORM IS A VERB.</span>
        </div>
        <div className={styles.heroSideNote} aria-hidden="true">PULL / PUSH / BEND / REPEAT / RESOLVE</div>
      </section>

      <div className={styles.processStrip} aria-label="The FORMA process">
        <div className={styles.processTrack}>
          <span>GIVE IT MATTER</span><i>✳</i><span>APPLY A FORCE</span><i>↗</i><span>LEAVE A TRACE</span><i>✳</i><span>BEGIN AGAIN</span><i>↗</i>
        </div>
      </div>

      <section id="belief" className={styles.belief}>
        <div className={styles.sectionIndex} data-reveal><span>01 / THE BELIEF</span><span>NOT A TEMPLATE. A LIVING SYSTEM.</span></div>
        <div className={styles.beliefLayout}>
          <div className={styles.beliefHeadline} data-reveal>
            <p className={styles.microLabel}>EVERY FORM HAS A BEFORE.</p>
            <h2>Nothing is<br />finished.<br /><em>Everything</em><br /><em>is becoming.</em></h2>
          </div>
          <div className={styles.beliefAside} data-reveal>
            <div className={styles.afterformStamp}><span>AFTERFORM</span><b>↗</b></div>
            <p className={styles.beliefLead}>A form is never just an object. It is the temporary result of pressure, rhythm, repetition, collision, and time.</p>
            <p>FORMA is a digital atelier for exploring those conditions. A place to make, unmake, and remake through geometry, motion, typography, and digital space.</p>
            <div className={styles.primitiveList}>
              <span><b>01</b> MATTER <small>THE SPECIMEN</small></span>
              <span><b>02</b> FORCE <small>THE CONDITION</small></span>
              <span><b>03</b> TRACE <small>THE EVIDENCE</small></span>
              <span><b>04</b> NOTATION <small>THE INTENTION</small></span>
            </div>
          </div>
        </div>
        <div className={styles.beliefFoot}><span>OBSERVE</span><i /><span>INTERVENE</span><i /><span>TRANSFORM</span><i /><span>REPEAT</span></div>
      </section>

      <section className={styles.studies} aria-labelledby="studies-title">
        <div className={styles.sectionIndex} data-reveal><span>02 / OPEN STUDIES</span><span>CHOOSE YOUR MATERIAL ↘</span></div>
        <div className={styles.studiesIntro} data-reveal>
          <h2 id="studies-title">Start with<br /><em>a disturbance.</em></h2>
          <p>Three doors into the atelier. Each one is a different way to question the conditions that shape an idea.</p>
        </div>
        <div className={styles.studyList}>
          {studies.map((study) => (
            <Link key={study.number} href={study.href} className={styles.studyRow} data-study={study.className}>
              <div className={styles.studyIndex}><span>{study.number}</span><small>{study.type}</small></div>
              <div className={styles.studyArtwork} aria-hidden="true">
                {study.className === "matter" && <><i /><b /><span /></>}
                {study.className === "force" && <><i /><b /><span /></>}
                {study.className === "notation" && <><strong>Ag</strong><i /><b /></>}
                <small>{study.tag}</small>
              </div>
              <div className={styles.studyText}><p>{study.name}</p><h3>{study.title}</h3><span>{study.description}</span></div>
              <span className={styles.studyArrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.instrument} aria-labelledby="instrument-title">
        <div className={styles.instrumentHeader} data-reveal><span>03 / THE INSTRUMENT</span><span>INPUT → RESPONSE → FORM</span></div>
        <div className={styles.instrumentLayout}>
          <div className={styles.instrumentCopy} data-reveal>
            <p className={styles.microLabel}>A SMALL EXPERIMENT IN BECOMING</p>
            <h2 id="instrument-title">Change the<br /><em>conditions.</em></h2>
            <p className={styles.instrumentDescription}>Every form is a consequence of its inputs. Change the energy, rhythm, and fragments. The specimen responds in real time.</p>
            <div className={styles.controls}>
              <label><span>ENERGY <output>{intensity.toFixed(2)}×</output></span><input aria-label="Energy" type="range" min="0.65" max="1.45" step="0.05" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} /></label>
              <label><span>RHYTHM <output>{speed.toFixed(2)}×</output></span><input aria-label="Rhythm" type="range" min="0.3" max="1.8" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
              <label><span>FRAGMENTS <output>{density}</output></span><input aria-label="Fragments" type="range" min="6" max="30" step="2" value={density} onChange={(event) => setDensity(Number(event.target.value))} /></label>
              <div className={styles.instrumentModes}><span>FIELD BEHAVIOR</span><div role="group" aria-label="Choose material behavior">
                {(["flow", "prism", "signal"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{value.toUpperCase()}</button>)}
              </div></div>
              <div className={styles.instrumentAction}><span>SEED / {String(seed).padStart(5, "0")}</span><button type="button" onClick={() => setSeed((value) => value + 1)}>RECOMPOSE ↗</button></div>
            </div>
            <p className={styles.localNote}>LOCAL STUDY / YOUR EXPERIMENT IS NOT SAVED</p>
          </div>
          <div className={styles.instrumentStage}>
            <div className={styles.instrumentStageTop}><span>VARIABLE / 03—B</span><span>LIVE SPECIMEN</span></div>
            <AtelierWorld intensity={intensity} speed={speed} density={density} seed={seed} reducedMotion={reducedMotion} mode={mode} />
            <div className={styles.instrumentStageBottom}><span>MATTER × FORCE</span><span>SEED {seed}</span></div>
          </div>
        </div>
      </section>

      <section className={styles.invitation}>
        <div className={styles.invitationTop}><span>04 / YOUR TURN</span><span>NO FINAL FORMS</span></div>
        <div className={styles.invitationMain} data-reveal>
          <p>THE NEXT FORM IS YOURS.</p>
          <h2>Make a little<br /><em>beautiful trouble.</em></h2>
          <Link href="/playground" className={styles.invitationLink}>START MAKING <span>↗</span></Link>
        </div>
        <div className={styles.invitationBottom}><span>FORMA® / DIGITAL ATELIER</span><span>MADE TO BE REMADE.</span><span>MMXXVI</span></div>
      </section>
    </main>
  );
}
