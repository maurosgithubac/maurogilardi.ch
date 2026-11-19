"use client";

import { resetConsent } from "@/lib/consent";
import "@/styles/consent.css";

/** Setzt die Cookie-Wahl zurück. Nach dem Neuladen erscheint der Hinweis wieder. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="mg-consent-reset"
      onClick={() => {
        resetConsent();
        window.location.reload();
      }}
    >
      Cookie-Einstellungen
    </button>
  );
}
