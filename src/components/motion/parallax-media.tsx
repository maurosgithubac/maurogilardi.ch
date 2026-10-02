"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Maximale Verschiebung nach unten in % (Bild läuft langsamer als die Seite) */
  shift?: number;
  /** Zoom am Ende des Scrollbereichs */
  zoom?: number;
};

/**
 * Hero-Parallax: das Bild zoomt und wandert leicht, während der Abschnitt aus dem Bild scrollt.
 * Nur transform → kein Layout-Shift, LCP-Bild bleibt unverändert sichtbar.
 */
export function ParallaxMedia({ children, className, shift = 14, zoom = 1.12 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${shift}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, zoom]);

  return (
    <div ref={ref} className={className}>
      <motion.div className="mg-parallax-layer" style={reduce ? undefined : { y, scale }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Inhalt, der beim Hinausscrollen nach oben gleitet und ausblendet. */
export function ScrollFadeOut({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Erst ausblenden, wenn der Inhalt den oberen Rand erreicht — beim Laden immer voll sichtbar
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { opacity, y }}>
      {children}
    </motion.div>
  );
}

/** Element, das sich im Viewport leicht gegenläufig bewegt (Bilder in Story-Sektionen). */
export function ParallaxFloat({ children, className, distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
