"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./experiment-index.module.css";

type Category = "ALL" | "FORM" | "TYPE";

const experiments = [
  { id: "displacement-field", number: "001", category: "FORM" as const, title: "Displacement field", note: "A responsive geometry field shaped by your movement.", href: "#displacement-field", status: "LIVE", tone: "lime" },
  { id: "elastic-type", number: "002", category: "TYPE" as const, title: "Elastic matter", note: "Typography stretched between tension and release.", href: "#elastic-type", status: "LIVE", tone: "coral" },
];

const categories: Category[] = ["ALL", "FORM", "TYPE"];

export function ExperimentIndex() {
  const [active, setActive] = useState<Category>("ALL");
  const visible = useMemo(
    () => active === "ALL" ? experiments : experiments.filter((item) => item.category === active),
    [active],
  );

  return (
    <section className={styles.index} aria-labelledby="index-title">
      <div className={styles.indexTop}>
        <div><span>THE INDEX / 02 STUDIES</span><h2 id="index-title">Pick a <em>material.</em></h2></div>
        <p>Different inputs. Different rules. No repeated tricks.</p>
      </div>
      <div className={styles.filters} role="group" aria-label="Filter experiments by material">
        <span>FILTER BY MATERIAL</span>
        <div>
          {categories.map((category) => (
            <button key={category} type="button" aria-pressed={active === category} onClick={() => setActive(category)}>{category}</button>
          ))}
        </div>
      </div>
      <div className={styles.results} aria-live="polite">
        {visible.map((item) => (
          <article className={styles.card} data-tone={item.tone} key={item.id}>
            <div className={styles.cardVisual} aria-hidden="true">
              {item.category === "FORM" ? <div className={styles.formMark}><i /><i /><i /></div> : <div className={styles.typeMark}>Aa</div>}
              <span>{item.number} / {item.category}</span>
            </div>
            <div className={styles.cardCopy}>
              <div><span>{item.status}</span><span>{item.category} STUDY</span></div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <Link href={item.href}>OPEN STUDY <i aria-hidden="true">↗</i></Link>
            </div>
          </article>
        ))}
        {visible.length === 0 && <p className={styles.empty}>No studies in this material yet. Reset the filter to explore the full index.</p>}
      </div>
      <button className={styles.reset} type="button" onClick={() => setActive("ALL")} disabled={active === "ALL"}>RESET INDEX ↺</button>
    </section>
  );
}
