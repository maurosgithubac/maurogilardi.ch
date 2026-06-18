"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mg-cookie-consent";

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [pathname]);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible || pathname.startsWith("/admin")) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent-inner">
        <p id="cookie-consent-title" className="cookie-consent-text">
          Diese Website verwendet technisch notwendige Cookies und speichert deine Auswahl lokal. Details in der{" "}
          <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
        <div className="cookie-consent-actions">
          <button type="button" className="cookie-consent-btn" onClick={accept}>
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
