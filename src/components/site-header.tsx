"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { MgLogo } from "@/components/brand/mg-logo";
import { Magnetic } from "@/components/motion/magnetic";
import { MG_EASE } from "@/components/motion/motion-provider";
import { getPgtEventLiveOnDate, livescoringLinkForEvent, pgtSeasonEvents2026 } from "@/content/pgtSeasonEvents";
import { useFocusTrap, useOverlayLock } from "@/lib/ui/use-overlay";

type NavSublink = { href: string; label: string };

type NavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  sublinks?: NavSublink[];
  /** Nur im Mobile-Menü — auf Desktop führt das Logo zur Startseite */
  mobileOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", match: (p) => p === "/", mobileOnly: true },
  { href: "/blog", label: "Blog", match: (p) => p === "/blog" || p.startsWith("/blog/") },
  { href: "/erfolge", label: "Erfolge", match: (p) => p.startsWith("/erfolge") },
  { href: "/sponsoring", label: "Gönner", match: (p) => p.startsWith("/sponsoring") },
  { href: "/partner", label: "Partner", match: (p) => p.startsWith("/partner") },
  {
    href: "/ueber-mich",
    label: "Über mich",
    match: (p) => p.startsWith("/ueber-mich"),
    sublinks: [
      { href: "/ueber-mich", label: "Überblick" },
      { href: "/ueber-mich/sponsoren", label: "Sponsoren" },
      { href: "/ueber-mich/gallerie", label: "Galerie" },
      { href: "/ueber-mich/media", label: "Medien" },
      { href: "/ueber-mich/equipment", label: "Mein Bag" },
      { href: "/ueber-mich/faq", label: "FAQ" },
    ],
  },
];

type Variant = "overlay" | "document";

type Props = {
  /** overlay = transparent über einem dunklen Hero, document = Seiten ohne Hero */
  variant: Variant;
  /** @deprecated Altbestand — der Header ist jetzt immer selbst fixiert */
  inOverlayStack?: boolean;
};

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const noopSubscribe = () => () => {};

export function SiteHeader({ variant }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);

  // Scroll-Zustand als externer Store: kein setState im Effect, Server rendert "oben"
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 32, () => false);

  // Live-Turnier nur im Browser bestimmen (Datum), ID als stabiler Snapshot
  const liveEventId = useSyncExternalStore(noopSubscribe, () => getPgtEventLiveOnDate(new Date())?.id ?? null, () => null);
  const liveEvent = liveEventId ? (pgtSeasonEvents2026.find((ev) => ev.id === liveEventId) ?? null) : null;

  // Menü bei Seitenwechsel schliessen (während des Renderns statt per Effect)
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useOverlayLock(menuOpen);
  // Falle über den ganzen Header, damit auch der Schliessen-Button per Tab erreichbar ist
  useFocusTrap(headerRef, menuOpen, closeMenu);

  const solid = variant === "document" || scrolled || menuOpen;
  const tone = solid ? "light" : "dark";

  return (
    <>
      <a href="#inhalt" className="mg-skip-link">
        Zum Inhalt springen
      </a>
      <header ref={headerRef} className="mg-header" data-solid={solid ? "true" : "false"} data-tone={tone} data-open={menuOpen ? "true" : "false"}>
        <div className="mg-header__bar">
          <Link href="/" className="mg-header__brand" aria-label="Mauro Gilardi — Startseite">
            {/* Kleine Grösse: Monogramm ohne Namenszug (sonst unlesbar), Name als Playfair-Versalien daneben */}
            <MgLogo className="mg-header__logo" withName={false} title="Mauro Gilardi" />
            <span className="mg-header__wordmark" aria-hidden="true">
              Mauro Gilardi
            </span>
          </Link>

          <nav className="mg-header__nav" aria-label="Hauptnavigation">
            <ul className="mg-header__list">
              {NAV.filter((item) => !item.mobileOnly).map((item) => {
                const active = item.match(pathname);
                if (item.sublinks) {
                  return (
                    <li key={item.href} className="mg-header__item mg-header__item--has-sub">
                      <Link
                        href={item.href}
                        className="mg-header__link"
                        data-active={active ? "true" : undefined}
                        aria-current={pathname === item.href ? "page" : undefined}
                      >
                        {item.label}
                        <svg className="mg-header__caret" viewBox="0 0 10 6" aria-hidden="true">
                          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </Link>
                      <div className="mg-header__sub">
                        <ul>
                          {item.sublinks.map((sub) => (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className="mg-header__sublink"
                                aria-current={pathname === sub.href ? "page" : undefined}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={item.href} className="mg-header__item">
                    <Link
                      href={item.href}
                      className="mg-header__link"
                      data-active={active ? "true" : undefined}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mg-header__actions">
            {liveEvent ? (
              <a
                href={livescoringLinkForEvent(liveEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-live-pill"
                aria-label={`Livescoring: ${liveEvent.name}`}
                title={liveEvent.name}
              >
                <span className="mg-live-pill__dot" aria-hidden="true" />
                <span>Live</span>
                <span className="mg-live-pill__event">{liveEvent.name}</span>
              </a>
            ) : null}
            <Magnetic className="mg-header__cta">
              <Link href="/sponsoring" className="mg-btn mg-btn--accent mg-btn--sm">
                Gönner werden
              </Link>
            </Magnetic>
            <button
              type="button"
              className="mg-burger"
              aria-label={menuOpen ? "Navigation schliessen" : "Navigation öffnen"}
              aria-expanded={menuOpen}
              aria-controls="mg-mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              key="mobile-nav"
              id="mg-mobile-nav"
              className="mg-mobile-nav"
              data-theme="dark"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ clipPath: "inset(0 0 100% 0 round 0 0 32px 32px)" }}
              animate={{ clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)" }}
              exit={{ clipPath: "inset(0 0 100% 0 round 0 0 32px 32px)" }}
              transition={{ duration: 0.6, ease: MG_EASE }}
            >
              <motion.ul
                className="mg-mobile-nav__list"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
              >
                {NAV.map((item) => (
                  <motion.li
                    key={item.href}
                    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: MG_EASE } } }}
                  >
                    <Link
                      href={item.href}
                      className="mg-mobile-nav__link"
                      data-active={item.match(pathname) ? "true" : undefined}
                      aria-current={pathname === item.href ? "page" : undefined}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                    {item.sublinks ? (
                      <ul className="mg-mobile-nav__sub">
                        {item.sublinks.slice(1).map((sub) => (
                          <li key={sub.href}>
                            <Link href={sub.href} aria-current={pathname === sub.href ? "page" : undefined} onClick={closeMenu}>
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div
                className="mg-mobile-nav__foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.45 } }}
              >
                <Link href="/sponsoring" className="mg-btn mg-btn--accent mg-btn--lg" onClick={closeMenu}>
                  Gönner werden <span className="mg-btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link href="/#newsletter" className="mg-btn mg-btn--glass mg-btn--lg" onClick={closeMenu}>
                  Newsletter
                </Link>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
      {variant === "document" ? <div className="mg-header-spacer" aria-hidden="true" /> : null}
    </>
  );
}
