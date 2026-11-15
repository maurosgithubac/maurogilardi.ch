"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { readConsent, subscribeConsent, writeConsent } from "@/lib/consent";

/**
 * Hinweis mit echter Wahl: notwendige Cookies oder Analyse. Erscheint, bis eine Wahl getroffen ist.
 * Die Wahl ist jederzeit änderbar: Im Datenschutz steht, wie.
 */
export function CookieConsentBanner() {
  const pathname = usePathname();
  // Server rendert ohne Hinweis, damit kein Flackern entsteht
  const decided = useSyncExternalStore(subscribeConsent, () => readConsent() !== null, () => true);

  if (decided || pathname.startsWith("/admin")) return null;

  return (
    <aside className="mg-cookie" aria-label="Hinweis zu Cookies">
      <p>
        Ich nutze Analyse-Cookies (Google Tag Manager und Google Analytics), nur mit deiner Zustimmung.{" "}
        <Link href="/datenschutz">Datenschutz</Link>
      </p>
      <div className="mg-cookie__actions">
        <button type="button" className="mg-btn mg-btn--light mg-btn--sm" onClick={() => writeConsent("denied")}>
          Nur notwendige
        </button>
        <button type="button" className="mg-btn mg-btn--primary mg-btn--sm" onClick={() => writeConsent("granted")}>
          Analyse erlauben
        </button>
      </div>
    </aside>
  );
}
