"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import styles from "./spatial-transition.module.css";

type TransitionContextValue = { navigate: (href: string) => void };
const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useSpatialNavigation() {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useSpatialNavigation must be used inside SpatialTransitionProvider");
  return context;
}

export function SpatialTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const busy = useRef(false);
  const overlay = useRef<HTMLDivElement>(null);
  const pendingPath = useRef<string | null>(null);

  const navigate = useCallback((href: string) => {
    const target = new URL(href, window.location.href);
    if (target.origin !== window.location.origin || target.pathname === window.location.pathname) {
      router.push(href);
      return;
    }
    if (busy.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    busy.current = true;
    pendingPath.current = target.pathname;
    setActive(true);

    requestAnimationFrame(() => {
      if (!overlay.current) {
        router.push(href);
        return;
      }
      gsap.fromTo(
        overlay.current,
        { scaleY: 0, transformOrigin: "bottom center" },
        {
          scaleY: 1,
          duration: 0.62,
          ease: "power4.inOut",
          onComplete: () => router.push(href),
        },
      );
    });
  }, [router]);

  useEffect(() => {
    if (!active || !overlay.current) return;
    if (pendingPath.current && pathname !== pendingPath.current) return;

    gsap.to(overlay.current, {
      scaleY: 0,
      transformOrigin: "top center",
      duration: 0.72,
      delay: 0.04,
      ease: "power4.inOut",
      onComplete: () => {
        setActive(false);
        busy.current = false;
        pendingPath.current = null;
      },
    });
  }, [pathname, active]);

  useEffect(() => () => {
    gsap.killTweensOf(overlay.current);
  }, []);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      {active && (
        <div ref={overlay} className={styles.overlay} aria-hidden="true">
          <span className={styles.index}>FORM / SHIFT</span>
          <div className={styles.brandCore}><svg className={styles.brandMark} viewBox="0 0 240 240"><circle className={styles.markOrbit} cx="120" cy="120" r="101" /><circle className={styles.markOrbitAlt} cx="120" cy="120" r="76" /><path d="M72 190V50h112M72 112h82M72 190l82-140" /><path className={styles.markCut} d="M91 119h58" /><circle className={styles.markCoreDot} cx="120" cy="120" r="8" /></svg><span className={styles.wordmark}>FORMA</span></div>
          <span className={styles.caption}>A NEW SPACE TO MAKE</span>
        </div>
      )}
    </TransitionContext.Provider>
  );
}
