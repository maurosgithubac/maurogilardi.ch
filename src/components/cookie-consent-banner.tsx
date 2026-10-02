"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mg-cookie-consent";
const CHANGE_EVENT = "mg-cookie-consent-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Fallback, falls localStorage blockiert ist (privater Modus): Bestätigung im Speicher halten
let acceptedInMemory = false;

function readAccepted(): boolean {
  if (acceptedInMemory) return true;
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  // Gespeicherte Auswahl als externer Store; Server rendert "bereits bestätigt" (kein Flackern, kein Hydration-Fehler)
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);
  const visible = !accepted;

  function accept() {
    acceptedInMemory = true;
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  if (!visible || pathname.startsWith("/admin")) return null;

  // Kompakter Hinweis statt Banner: nur technisch notwendige Cookies, blockiert keine Inhalte
  return (
    <aside className="mg-cookie" aria-label="Hinweis zu Cookies">
      <p>
        Nur technisch notwendige Cookies. <Link href="/datenschutz">Datenschutz</Link>
      </p>
      <button type="button" className="mg-btn mg-btn--light mg-btn--sm" onClick={accept}>
        Ok
      </button>
    </aside>
  );
}
