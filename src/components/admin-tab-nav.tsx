"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const tabs: { href: string; label: string; match: (path: string) => boolean }[] = [
  { href: "/admin", label: "Übersicht", match: (path) => path === "/admin" },
  {
    href: "/admin/goenner",
    label: "Gönner",
    match: (path) => path.startsWith("/admin/goenner") && !path.startsWith("/admin/goenner/inbox"),
  },
  {
    href: "/admin/goenner/inbox",
    label: "Eingänge",
    match: (path) => path.startsWith("/admin/goenner/inbox"),
  },
  {
    href: "/admin/settings",
    label: "Konto",
    match: (path) => path.startsWith("/admin/settings"),
  },
];

export function AdminTabNav() {
  const pathname = usePathname();

  return (
    <section className="mgf-top" aria-label="Admin Bereiche">
      <div className="mgf-top-inner">
        <div className="mgf-brand">
          <span className="mgf-brand-mark">MG</span>
          <div>
            <p className="mgf-brand-kicker">Finance</p>
            <p className="mgf-brand-title">Gönner Platform</p>
          </div>
        </div>
        <nav className="mgf-tabs" aria-label="Admin Navigation">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`mgf-tab${tab.match(pathname) ? " is-active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <AdminLogoutButton />
      </div>
    </section>
  );
}
