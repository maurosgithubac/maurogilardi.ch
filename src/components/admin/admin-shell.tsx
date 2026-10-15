"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MgLogo } from "@/components/brand/mg-logo";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import {
  IconAccount,
  IconClose,
  IconExternal,
  IconFlag,
  IconInbox,
  IconMenu,
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
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const counts = useInboxCounts(inbox);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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
    {
      href: "/admin/preisgelder",
      label: "Preisgelder",
      icon: <IconTrophy />,
      match: (p) => p.startsWith("/admin/preisgelder"),
    },
    {
      href: "/admin/turnier",
      label: "Turnier",
      icon: <IconFlag />,
      match: (p) => p.startsWith("/admin/turnier"),
    },
  ];

  const accountItems: NavItem[] = [
    { href: "/admin/settings", label: "Konto", icon: <IconAccount />, match: (p) => p.startsWith("/admin/settings") },
  ];

  function renderItem(item: NavItem) {
    const active = item.match(path);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={`ap-nav-item${active ? " is-active" : ""}`}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
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
    <div className={`ap-shell${open ? " is-menu-open" : ""}`}>
      <a href="#ap-main" className="ap-skip">
        Zum Inhalt springen
      </a>

      <header className="ap-topbar">
        <Link href="/admin" className="ap-brand ap-brand--compact" aria-label="Admin Übersicht">
          <MgLogo withName={false} className="ap-brand-mark" />
          <span className="ap-brand-name">Gönner-Admin</span>
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="ap-icon-btn ap-menu-toggle"
          aria-expanded={open}
          aria-controls="ap-sidebar"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose size={18} /> : <IconMenu size={18} />}
          <span className="sr-only">{open ? "Menü schliessen" : "Menü öffnen"}</span>
          {!open && counts?.unseen ? (
            <span className="ap-menu-dot">
              <span className="sr-only">, {counts.unseen} neue Anfragen</span>
            </span>
          ) : null}
        </button>
      </header>

      <aside id="ap-sidebar" className="ap-sidebar" aria-label="Admin Navigation">
        <Link href="/admin" className="ap-brand" onClick={() => setOpen(false)}>
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

      <div className="ap-scrim" aria-hidden="true" onClick={() => setOpen(false)} />

      <main id="ap-main" className="ap-main" tabIndex={-1}>
        <div className="ap-content">{children}</div>
      </main>
    </div>
  );
}
