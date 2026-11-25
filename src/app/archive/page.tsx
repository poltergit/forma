import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { ArchiveImprints } from "@/features/archive/components/archive-imprints";

export const metadata: Metadata = {
  title: "The Archive",
  description: "A living index of FORMA studies, systems, and artifacts — collected while they are still becoming.",
};

const specimens = [
  { id: "001", kind: "FIELD STUDY", title: "Displacement Field", note: "Geometry responds to a shifting center of gravity.", room: "THE OPEN FIELD", href: "/playground#displacement-field", tone: "field", status: "INTERACTIVE" },
  { id: "002", kind: "MOTION SCORE", title: "A Study in Momentum", note: "A small movement, tuned through time, force, and rhythm.", room: "THE FORCE ROOM", href: "/motion-lab", tone: "force", status: "GENERATIVE" },
  { id: "003", kind: "SPATIAL COMPOSITION", title: "Matter / Arrangement", note: "Objects, light, and material become a composed scene.", room: "THE WORKBENCH", href: "/scene-studio", tone: "matter", status: "COMPOSABLE" },
];

export default function ArchivePage() {
  return (
    <main id="main-content" className={styles.archive}>
      <header className={styles.header}>
        <div className={styles.meta}><span>ROOM 04 / THE ARCHIVE</span><span>AN INDEX OF THINGS IN FLUX</span></div>
        <div className={styles.heading}>
          <div><span className={styles.kicker}>COLLECTED, NOT CONCLUDED</span><h1>Nothing stays<br /><em>still.</em></h1></div>
          <p>A living record of forms, forces, experiments, and unfinished thoughts. Not a trophy shelf. A place to notice what changed, what remains, and what might happen next.</p>
        </div>
        <div className={styles.headerFoot}><span>FORMA / MATTER IN MOTION</span><span>INDEX 001—∞</span></div>
      </header>

      <section className={styles.archiveIntro} aria-label="Archive introduction">
        <span>THE COLLECTION / 2026—∞</span>
        <p>Every study leaves a trace.<br /><em>These are a few of ours.</em></p>
        <span className={styles.archiveMark} aria-hidden="true">✳</span>
      </section>

      <section className={styles.specimens} aria-labelledby="specimens-title">
        <div className={styles.sectionHead}><span>01 / SELECTED SPECIMENS</span><h2 id="specimens-title">Open records<span>↘</span></h2><p>Each entry leads back to the room where it can be explored, altered, or made again.</p></div>
        <div className={styles.specimenList}>
          {specimens.map((specimen) => (
            <Link className={styles.specimen} href={specimen.href} data-tone={specimen.tone} key={specimen.id}>
              <div className={styles.specimenIndex}><span>{specimen.id}</span><small>{specimen.kind}</small></div>
              <div className={styles.specimenVisual} aria-hidden="true"><i /><i /><i /><b>{specimen.id}</b></div>
              <div className={styles.specimenCopy}><span>{specimen.room}</span><h3>{specimen.title}</h3><p>{specimen.note}</p><small>{specimen.status}</small></div>
              <span className={styles.specimenArrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <ArchiveImprints />

      <section className={styles.marginNotes} aria-labelledby="notes-title">
        <div className={styles.notesMeta}><span>02 / MARGIN NOTES</span><span>THINGS WE KEEP LEARNING</span></div>
        <h2 id="notes-title">A form is<br /><em>a question.</em></h2>
        <div className={styles.notesGrid}>
          <article><span>NOTE / 01</span><h3>Material has memory.</h3><p>Every surface, color, and contour carries the trace of a decision. Keep those traces visible.</p></article>
          <article><span>NOTE / 02</span><h3>Systems should bend.</h3><p>Rules make a field legible. Breaking, stretching, and recombining them makes it alive.</p></article>
          <article><span>NOTE / 03</span><h3>Finish is a moment.</h3><p>An artifact is not the end of an idea. It is one state in a longer becoming.</p></article>
        </div>
      </section>

      <footer className={styles.colophon}><span>THE ARCHIVE IS OPEN-ENDED.</span><p>Make a mark.<br /><em>Leave a trace.</em></p><Link href="/playground">RETURN TO THE OPEN FIELD <b>↗</b></Link></footer>
    </main>
  );
}
