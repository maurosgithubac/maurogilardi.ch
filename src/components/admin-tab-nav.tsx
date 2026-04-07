"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const tabs: { href: string; label: string; match: (path: string) => boolean }[] = [
  { href: "/admin", label: "Übersicht", match: (path) => path === "/admin" },
  { href: "/admin/posts", label: "Beiträge", match: (path) => path.startsWith("/admin/posts") },
  { href: "/admin/sponsors", label: "Partner", match: (path) => path.startsWith("/admin/sponsors") },
  { href: "/admin/goenner", label: "Gönner", match: (path) => path.startsWith("/admin/goenner") },
];

export function AdminTabNav() {
  const pathname = usePathname();

  return (
    <header className="admin-top">
      <div className="admin-top-inner">
        <Link href="/admin" className="admin-brand-lockup">
          <Image
            src="/brand-assets/logos/Logo_negativ.svg"
            alt="Mauro Gilardi"
            width={120}
            height={28}
            className="admin-brand-logo"
          />
          <span className="admin-brand-text">
            <span className="admin-brand-name">Mauro Gilardi</span>
            <span className="admin-brand-sub">maurogilardi.ch</span>
          </span>
          <span className="admin-brand-badge">Admin</span>
        </Link>
        <nav className="admin-tabs" aria-label="Admin Navigation">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`admin-tab${tab.match(pathname) ? " admin-tab--active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <AdminLogoutButton />
      </div>
    </header>
  );
}
