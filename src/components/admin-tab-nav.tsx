"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const tabs: { href: string; label: string; match: (path: string) => boolean }[] = [
  { href: "/admin", label: "Übersicht", match: (path) => path === "/admin" },
  { href: "/admin/posts", label: "Beiträge", match: (path) => path.startsWith("/admin/posts") },
  { href: "/admin/sponsors", label: "Partner", match: (path) => path.startsWith("/admin/sponsors") },
  { href: "/admin/goenner", label: "Sponsoring", match: (path) => path.startsWith("/admin/goenner") },
];

export function AdminTabNav() {
  const pathname = usePathname();

  return (
    <section className="admin-top" aria-label="Admin Bereiche">
      <div className="admin-top-inner">
        <p className="admin-top-kicker">Admin</p>
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
    </section>
  );
}
