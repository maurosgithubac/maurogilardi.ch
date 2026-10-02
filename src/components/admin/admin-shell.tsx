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
  IconInbox,
  IconMenu,
  IconOverview,
  IconUsers,
} from "@/components/admin/admin-icons";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
  badge?: number;
};

type Props = {
  children: React.ReactNode;
  /** Anzahl offener Eingänge für das Badge (optional — wird nur gezeigt, wenn übergeben) */
  inboxCount?: number;
  /** Aktiven Pfad überschreiben (z. B. für Vorschauen); Standard: usePathname() */
  currentPath?: string;
};

export function AdminShell({ children, inboxCount, currentPath }: Props) {
  const routerPath = usePathname();
  const path = currentPath ?? routerPath ?? "";
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

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

  const items: NavItem[] = [
    { href: "/admin", label: "Übersicht", icon: <IconOverview />, match: (p) => p === "/admin" },
    {
      href: "/admin/goenner",
      label: "Gönner & Partner",
      icon: <IconUsers />,
      match: (p) => p.startsWith("/admin/goenner") && !p.startsWith("/admin/goenner/inbox"),
    },
    {
      href: "/admin/goenner/inbox",
      label: "Eingänge",
      icon: <IconInbox />,
      match: (p) => p.startsWith("/admin/goenner/inbox"),
      badge: inboxCount,
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
            <span className="ap-nav-badge" aria-label={`${item.badge} offen`}>
              {item.badge}
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
