"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV: {
  href: string;
  label: string;
  match: (path: string) => boolean;
}[] = [
  { href: "/", label: "Home", match: (p) => p === "/" },
  { href: "/blog", label: "Blog", match: (p) => p === "/blog" || p.startsWith("/blog/") },
  { href: "/goenner", label: "Gönner", match: (p) => p.startsWith("/goenner") },
  { href: "/ueber-mich", label: "Über mich", match: (p) => p.startsWith("/ueber-mich") },
];

type Variant = "overlay" | "document";

type Props = {
  variant: Variant;
  /** Overlay-Header in einem festen Stack (z. B. mit Livescoring-Leiste darunter). */
  inOverlayStack?: boolean;
};

export function SiteHeader({ variant, inOverlayStack }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "overlay") return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const headerClass =
    variant === "overlay"
      ? `site-header site-header--overlay${inOverlayStack ? " site-header--overlay-in-stack" : ""}${scrolled ? " site-header--overlay-solid" : ""}`
      : "site-header site-header--document";

  return (
    <header className={headerClass}>
      <Link href="/" className="site-header-brand">
        <span className="site-header-brand-mark">
          <Image
            src="/brand-assets/logos/Logo_negativ.svg"
            alt="Mauro Gilardi"
            width={180}
            height={44}
            className="site-header-logo"
            priority={variant === "overlay"}
          />
        </span>
      </Link>
      <button
        type="button"
        className={`site-header-menu-toggle${mobileMenuOpen ? " is-open" : ""}`}
        aria-label={mobileMenuOpen ? "Navigation schließen" : "Navigation öffnen"}
        aria-expanded={mobileMenuOpen}
        aria-controls="site-header-nav"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        id="site-header-nav"
        className={`site-header-nav${mobileMenuOpen ? " site-header-nav--open" : ""}`}
        aria-label="Hauptnavigation"
      >
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "site-header-nav-link site-header-nav-link--active" : "site-header-nav-link"}
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
        {pathname === "/" ? (
          <a href="#newsletter" className="site-header-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Newsletter
          </a>
        ) : (
          <a href="/#newsletter" className="site-header-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Newsletter
          </a>
        )}
        <Link
          href="/goenner#goenner-form-title"
          className="site-header-nav-link site-header-nav-link--cta"
          onClick={() => setMobileMenuOpen(false)}
        >
          Gönner Formular
        </Link>
      </nav>
      {mobileMenuOpen ? <button type="button" className="site-header-nav-backdrop" aria-hidden onClick={() => setMobileMenuOpen(false)} /> : null}
    </header>
  );
}
