"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readArchiveImprints, type ArchiveImprint } from "@/features/atelier/atelier-bridge";
import styles from "./archive-imprints.module.css";

export function ArchiveImprints() {
  const [imprints, setImprints] = useState<ArchiveImprint[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => { setImprints(readArchiveImprints()); setReady(true); };
    refresh();
    window.addEventListener("forma:archive-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("forma:archive-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <section className={styles.collection} aria-labelledby="imprints-title">
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
