"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Zentrale Motion-Einstellungen: respektiert "Bewegung reduzieren" global, gemeinsame Easing-Kurve. */
export const MG_EASE = [0.16, 1, 0.3, 1] as const;
export const MG_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.8 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.7, ease: MG_EASE }}>
      {children}
    </MotionConfig>
  );
}
