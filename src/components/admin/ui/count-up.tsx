"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  /** Formatiert den Zwischenwert, z. B. chfCompact. Standard: ganze Zahl mit Tausendertrennung. */
  format?: (n: number) => string;
  /** Dauer in Millisekunden */
  duration?: number;
};

/**
 * Zählt eine Kennzahl beim ersten Anzeigen und bei Wertwechsel hoch.
 * Der Server und der erste Render zeigen immer den Endwert (kein Hydration-Fehler, kein Layout-Sprung).
 * Bei prefers-reduced-motion wird nicht animiert.
 */
export function CountUp({ value, format, duration = 900 }: Props) {
  const [shown, setShown] = useState(value);
  const from = useRef<number | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = from.current ?? 0;
    from.current = value;
    if (reduce || start === value || !Number.isFinite(value)) {
      setShown(value);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(start + (value - start) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setShown(value);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  const text = format ? format(shown) : Math.round(shown).toLocaleString("de-CH");
  return <span className="ap-countup">{text}</span>;
}
