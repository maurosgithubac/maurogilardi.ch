/**
 * Einwilligung für Analyse-Cookies (Google Tag Manager / Google Analytics).
 * Standard ist „verweigert“, bis der Besucher aktiv zustimmt (Consent Mode v2).
 */

export const GTM_ID = "GTM-K93FFR45";

export const CONSENT_KEY = "mg-consent-v2";
export const CONSENT_EVENT = "mg-consent-change";

export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* Speicher blockiert: Auswahl gilt nur für diesen Besuch */
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Ereignis nur ins dataLayer, wenn Analyse erlaubt ist. Vorher nichts senden. */
export function pushAnalytics(event: string, props?: Record<string, string | number | undefined>) {
  if (readConsent() !== "granted") return;
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...props });
}
