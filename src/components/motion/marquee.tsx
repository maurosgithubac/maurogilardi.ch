"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Grundgeschwindigkeit in % der Spurbreite pro Sekunde */
  speed?: number;
  /** -1 = nach links, 1 = nach rechts */
  direction?: 1 | -1;
  /** Beim Scrollen beschleunigen (Velocity-Boost) */
  scrollBoost?: boolean;
  "aria-label"?: string;
};

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * Endloses Laufband. Die Kinder werden einmal zugänglich gerendert, die Kopie ist
 * aria-hidden und nicht fokussierbar. Pausiert bei Hover und Tastaturfokus.
 * Bei "Bewegung reduzieren" steht es still und ist horizontal scrollbar.
 */
export function Marquee({ children, className, speed = 2.2, direction = -1, scrollBoost = true, ...rest }: Props) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const [paused, setPaused] = useState(false);
  const dir = useRef<number>(direction);

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || paused) return;
    const b = scrollBoost ? boost.get() : 0;
    // Beim Hochscrollen kehrt das Band um, beim Runterscrollen läuft es in Grundrichtung
    if (b < 0) dir.current = -direction;
    else if (b > 0) dir.current = direction;
    const move = dir.current * speed * (delta / 1000) * (1 + Math.abs(b));
    baseX.set(baseX.get() + move);
  });

  return (
    <div
      className={`mg-marquee${reduce ? " mg-marquee--static" : ""}${className ? ` ${className}` : ""}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role={rest["aria-label"] ? "region" : undefined}
      aria-label={rest["aria-label"]}
    >
      <motion.div className="mg-marquee__track" style={reduce ? undefined : { x }}>
        <div className="mg-marquee__group">{children}</div>
        {reduce ? null : (
          <div className="mg-marquee__group" aria-hidden="true" inert>
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}
