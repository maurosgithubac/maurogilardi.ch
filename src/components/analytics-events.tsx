"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { pushAnalytics } from "@/lib/consent";

/**
 * Cookiefreie Ereignis-Messung (Vercel Analytics): Klicks auf Elemente mit
 * `data-track="ereignis"` werden gezählt, optional mit `data-track-label`.
 * So brauchen Server-Komponenten kein eigenes JavaScript — nur ein Attribut.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const name = el.dataset.track;
      if (!name) return;
      const label = el.dataset.trackLabel;
      track(name, { path: window.location.pathname, ...(label ? { label } : {}) });
      pushAnalytics(name, { path: window.location.pathname, label });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

/** Für Ereignisse ohne Klick (z. B. erfolgreich gesendete Formulare) */
export function trackEvent(name: string, props?: Record<string, string | number>) {
  try {
    track(name, props);
  } catch {
    /* Analytics nicht verfügbar — still ignorieren */
  }
  // Erfolgreich abgesendete Anfragen (generate_lead) nur mit Einwilligung an den Tag Manager
  pushAnalytics(name, props);
}
