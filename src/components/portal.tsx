"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Rendert Overlays direkt in <body>. Nötig, weil animierte Vorfahren (transform)
 * einen eigenen Stacking-Kontext bilden — `position: fixed` würde sonst am Container kleben.
 */
export function Portal({ children }: { children: ReactNode }) {
  // true im Browser, false beim Server-Rendern — ohne setState im Effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}
