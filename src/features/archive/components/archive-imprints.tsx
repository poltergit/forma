"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readArchiveImprints, type ArchiveImprint } from "@/features/atelier/atelier-bridge";
import styles from "./archive-imprints.module.css";
import { RoomManifest } from "@/components/shell/room-manifest";

export function ArchiveImprints() {
  const [imprints, setImprints] = useState<ArchiveImprint[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => { setImprints(readArchiveImprints()); setReady(true); };
    const timeout = window.setTimeout(refresh, 0);
    window.addEventListener("forma:archive-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("forma:archive-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <section className={styles.collection} aria-labelledby="imprints-title">
      <RoomManifest variant="index" number="04" room="THE SPECIMEN INDEX" title="Keep the evidence." description="A study is more than its final image. Return to the parameters, decisions, and traces that explain how a form came to be." principle="The archive preserves the thinking behind the object. Memory is part of the material; a saved trace makes experimentation cumulative." notation="TRACE + NOTATION / MEMORY OF PROCESS" />
      <div className={styles.heading}>
        <span>02 / YOUR IMPRINTS</span>
        <h2 id="imprints-title">Marks you <em>left.</em></h2>
        <p>Studies preserved on this device. Reopen a specimen to return to its original parameters.</p>
      </div>
      {!ready ? <p className={styles.empty}>READING THE LOCAL COLLECTION…</p> : imprints.length === 0 ? (
        <div className={styles.empty}><span>NO TRACES YET / 000</span><p>The archive is waiting for its first mark. Leave a trace from the Open Field or the Force Room.</p><Link href="/playground">MAKE THE FIRST MARK ↗</Link></div>
      ) : (
        <div className={styles.list}>
          {imprints.map((item, index) => (
            <article className={styles.item} key={item.id}>
              <span className={styles.number}>{String(index + 1).padStart(3, "0")}</span>
              <div className={styles.copy}><span>{item.room} / {new Date(item.createdAt).toLocaleDateString()}</span><h3>{item.title}</h3><p>{item.detail}</p></div>
              <Link href={item.href}>REOPEN <b>↗</b></Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
