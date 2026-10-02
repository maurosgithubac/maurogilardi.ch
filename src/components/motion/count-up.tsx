"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  from?: number;
  /** Text vor/nach der Zahl, z. B. "." für Ränge */
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

/** Eigene Formatierung: Node und Browser liefern für de-CH unterschiedliche Apostrophe (Hydration-Fehler). */
function format(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

/** Zählt beim ersten Sichtbarwerden hoch. Server-HTML enthält bereits den Endwert (SEO, no-JS). */
export function CountUp({ to, from = 0, prefix = "", suffix = "", duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);
  const started = useRef(false);

  // Nach der Hydration auf den Startwert setzen, solange die Zahl noch nicht sichtbar ist
  useEffect(() => {
    if (!reduce && !started.current && !inView) setValue(from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(value)}
      {suffix}
    </span>
  );
}
