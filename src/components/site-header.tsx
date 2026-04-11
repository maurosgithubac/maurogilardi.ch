"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavSublink = { href: string; label: string };

type NavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  sublinks?: NavSublink[];
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", match: (p) => p === "/" },
  { href: "/blog", label: "Blog", match: (p) => p === "/blog" || p.startsWith("/blog/") },
  { href: "/erfolge", label: "Erfolge", match: (p) => p.startsWith("/erfolge") },
  { href: "/goenner", label: "Gönner", match: (p) => p.startsWith("/goenner") },
  {
    href: "/ueber-mich",
    label: "Über mich",
    match: (p) => p.startsWith("/ueber-mich"),
    sublinks: [
      { href: "/ueber-mich/sponsoren", label: "Partner" },
      { href: "/ueber-mich/equipment", label: "Mein Bag" },
    ],
  },
];

const ABOUT_SUB_ID = "site-header-about-sub";

type Variant = "overlay" | "document";

type Props = {
  variant: Variant;
  inOverlayStack?: boolean;
};

export function SiteHeader({ variant, inOverlayStack }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutMobileOpen, setAboutMobileOpen] = useState(false);

  useEffect(() => {
    if (variant !== "overlay") return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setAboutMobileOpen(false);
      return;
    }
    if (pathname.startsWith("/ueber-mich/")) {
      setAboutMobileOpen(true);
    }
  }, [mobileMenuOpen, pathname]);

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
          const sublinks = item.sublinks;

          if (sublinks?.length) {
            return (
              <div
                key={item.href}
                className={`site-header-nav-dropdown${aboutMobileOpen ? " site-header-nav-dropdown--mobile-open" : ""}`}
              >
                <div className="site-header-nav-dropdown-trigger">
                  <Link
                    href={item.href}
                    className={active ? "site-header-nav-link site-header-nav-link--active" : "site-header-nav-link"}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="site-header-nav-dropdown-caret"
                    aria-expanded={aboutMobileOpen}
                    aria-controls={ABOUT_SUB_ID}
                    aria-label="Unterseiten zu Über mich anzeigen"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAboutMobileOpen((v) => !v);
                    }}
                  >
                    <span className="site-header-nav-dropdown-caret-icon" aria-hidden />
                  </button>
                </div>
                <div id={ABOUT_SUB_ID} className="site-header-nav-dropdown-panel" role="menu">
                  {sublinks.map((sub) => {
                    const subActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        role="menuitem"
                        className={
                          subActive
                            ? "site-header-nav-dropdown-item site-header-nav-dropdown-item--active"
                            : "site-header-nav-dropdown-item"
                        }
                        aria-current={subActive ? "page" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

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
