"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MgLogo } from "@/components/brand/mg-logo";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import {
  IconAccount,
  IconCalendar,
  IconClose,
  IconCopy,
  IconExternal,
  IconFlag,
  IconInbox,
  IconOverview,
  IconTrophy,
} from "@/components/admin/admin-icons";
import type { InboxCounts } from "@/lib/admin-inbox";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
  /** Rot = neu/ungelesen, grau = offen */
  badge?: { count: number; tone: "new" | "open" };
};

type Props = {
  children: React.ReactNode;
  /** Zähler für das Eingänge-Badge (vom Server; wird danach regelmässig aktualisiert) */
  inbox?: InboxCounts;
  /** Aktiven Pfad überschreiben (z. B. für Vorschauen); Standard: usePathname() */
  currentPath?: string;
};

const INBOX_POLL_MS = 60_000;

/** Diese Bereiche liegen im Handy-Dock. Alles andere steckt unter „Mehr“. */
const DOCK_HREFS = ["/admin", "/admin/goenner/inbox", "/admin/kalender", "/admin/rechnungen", "/admin/budget"];

function useInboxCounts(initial: InboxCounts | undefined) {
  const [counts, setCounts] = useState(initial);

  useEffect(() => {
    setCounts(initial);
  }, [initial]);

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/admin/goenner-inquiries/seen", { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as InboxCounts;
        if (!cancelled) setCounts(next);
      } catch {
        // Offline o. ä.: alten Stand behalten
      }
    }
    const timer = window.setInterval(refresh, INBOX_POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [initial]);

  return counts;
}

export function AdminShell({ children, inbox, currentPath }: Props) {
  const routerPath = usePathname();
  const path = currentPath ?? routerPath ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const counts = useInboxCounts(inbox);

  useEffect(() => {
    if (!moreOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const inboxBadge: NavItem["badge"] = counts?.unseen
    ? { count: counts.unseen, tone: "new" }
    : counts?.open
      ? { count: counts.open, tone: "open" }
      : undefined;

  const items: NavItem[] = [
    {
      href: "/admin",
      label: "Übersicht",
      icon: <IconOverview />,
      match: (p) => p === "/admin" || (p.startsWith("/admin/goenner") && !p.startsWith("/admin/goenner/inbox")),
    },
    {
      href: "/admin/goenner/inbox",
      label: "Eingänge",
      icon: <IconInbox />,
      match: (p) => p.startsWith("/admin/goenner/inbox"),
      badge: inboxBadge,
    },
    { href: "/admin/preisgelder", label: "Preisgelder", icon: <IconTrophy />, match: (p) => p.startsWith("/admin/preisgelder") },
    { href: "/admin/turnier", label: "Turnier", icon: <IconFlag />, match: (p) => p.startsWith("/admin/turnier") },
    { href: "/admin/kalender", label: "Kalender", icon: <IconCalendar />, match: (p) => p.startsWith("/admin/kalender") },
    { href: "/admin/rechnungen", label: "Rechnungen", icon: <IconCopy />, match: (p) => p.startsWith("/admin/rechnungen") },
    { href: "/admin/budget", label: "Budget", icon: <IconFlag />, match: (p) => p.startsWith("/admin/budget") },
  ];

  const accountItems: NavItem[] = [
    { href: "/admin/settings", label: "Konto", icon: <IconAccount />, match: (p) => p.startsWith("/admin/settings") },
  ];

  const dockItems = items.filter((i) => DOCK_HREFS.includes(i.href));
  const moreItems = [...items.filter((i) => !DOCK_HREFS.includes(i.href)), ...accountItems];
  const moreActive = moreItems.some((i) => i.match(path));

  function renderItem(item: NavItem) {
    const active = item.match(path);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={`ap-nav-item${active ? " is-active" : ""}`}
          aria-current={active ? "page" : undefined}
        >
          <span className="ap-nav-icon">{item.icon}</span>
          <span className="ap-nav-label">{item.label}</span>
          {item.badge ? (
            <span
              className={`ap-nav-badge${item.badge.tone === "open" ? " ap-nav-badge--open" : ""}`}
              aria-label={item.badge.tone === "new" ? `${item.badge.count} neu` : `${item.badge.count} offen`}
              title={item.badge.tone === "new" ? "Neue, noch nicht geöffnete Anfragen" : "Offene Anfragen"}
            >
              {item.badge.count}
            </span>
          ) : null}
        </Link>
      </li>
    );
  }

  return (
    <div className="ap-shell">
      <a href="#ap-main" className="ap-skip">
        Zum Inhalt springen
      </a>

      {/* Seitenleiste (Desktop): schwebende Karte */}
      <aside id="ap-sidebar" className="ap-sidebar" aria-label="Admin Navigation">
        <Link href="/admin" className="ap-brand">
          <MgLogo withName={false} className="ap-brand-mark" title="MG" />
          <span className="ap-brand-text">
            <span className="ap-brand-name">Mauro Gilardi</span>
            <span className="ap-brand-sub">Gönner-Admin</span>
          </span>
        </Link>

        <nav className="ap-nav" aria-label="Bereiche">
          <p className="ap-nav-heading">Verwaltung</p>
          <ul>{items.map(renderItem)}</ul>
          <p className="ap-nav-heading">Einstellungen</p>
          <ul>{accountItems.map(renderItem)}</ul>
        </nav>

        <div className="ap-sidebar-foot">
          <a href="/" className="ap-nav-item ap-nav-item--quiet" target="_blank" rel="noopener noreferrer">
            <span className="ap-nav-icon">
              <IconExternal />
            </span>
            <span className="ap-nav-label">Zur Website</span>
            <span className="sr-only">(öffnet in neuem Tab)</span>
          </a>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Kopfzeile (Handy) */}
      <header className="ap-mobilebar">
        <Link href="/admin" className="ap-mobilebar-brand" aria-label="Admin Übersicht">
          <MgLogo withName={false} className="ap-brand-mark" />
          <span>Gönner-Admin</span>
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="ap-mobilebar-ext" aria-label="Zur Website (öffnet in neuem Tab)">
          <IconExternal size={18} />
        </a>
      </header>

      <main id="ap-main" className="ap-main" tabIndex={-1}>
        <div className="ap-content">{children}</div>
      </main>

      {/* Dock (Handy): schwebende Pille unten */}
      <nav className="ap-dock" aria-label="Schnellnavigation">
        <ul>
          {dockItems.map((item) => {
            const active = item.match(path);
            return (
              <li key={item.href}>
                <Link href={item.href} className={`ap-dock-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                  <span className="ap-dock-icon">
                    {item.icon}
                    {item.badge ? (
                      <span
                        className={`ap-dock-badge${item.badge.tone === "open" ? " ap-dock-badge--open" : ""}`}
                        aria-label={item.badge.tone === "new" ? `${item.badge.count} neu` : `${item.badge.count} offen`}
                      >
                        {item.badge.count}
                      </span>
                    ) : null}
                  </span>
                  <span className="ap-dock-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" className={`ap-dock-item${moreActive && !moreOpen ? " is-active" : ""}`} aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}>
              <span className="ap-dock-icon">
                <span className="ap-dock-dots" aria-hidden="true">•••</span>
              </span>
              <span className="ap-dock-label">Mehr</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mehr-Blatt (Handy) */}
      {moreOpen ? (
        <div className="ap-sheet-wrap" onClick={() => setMoreOpen(false)}>
          <div className="ap-sheet" role="dialog" aria-modal="true" aria-label="Weitere Bereiche" onClick={(e) => e.stopPropagation()}>
            <div className="ap-sheet-head">
              <span className="ap-sheet-title">Weitere Bereiche</span>
              <button type="button" className="ap-sheet-close" aria-label="Schliessen" onClick={() => setMoreOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>
            <ul className="ap-sheet-list">
              {moreItems.map((item) => {
                const active = item.match(path);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`ap-sheet-link${active ? " is-active" : ""}`} onClick={() => setMoreOpen(false)} aria-current={active ? "page" : undefined}>
                      <span className="ap-nav-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="ap-sheet-foot">
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
