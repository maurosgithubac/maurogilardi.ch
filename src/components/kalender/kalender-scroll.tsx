"use client";

import { useEffect } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/**
 * Scroll-Effekte für /kalender:
 * - Fortschrittsbalken oben, der die Saison abbildet
 * - Karten und Monate gleiten beim Erscheinen sanft ins Bild
 * - Die Karte in der Bildmitte wählt den Turnier-Ort auf dem Globus aus
 * Ohne JavaScript oder bei „reduzierter Bewegung“ bleibt alles sichtbar.
 */
export function KalenderScrollFx({ onActive }: { onActive: (id: string) => void }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      revealEls.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // Die Karte, die genau in der Mitte des Bildschirms liegt, bestimmt den Globus.
    const focusObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.id;
            if (id) onActive(id);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    document.querySelectorAll<HTMLElement>("[data-id][data-focus]").forEach((el) => focusObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      focusObserver.disconnect();
    };
  }, [onActive]);

  return <motion.div className="kal-progress" aria-hidden="true" style={{ scaleX }} />;
}
