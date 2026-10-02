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
