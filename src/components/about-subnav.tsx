"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/ueber-mich", label: "Überblick" },
  { href: "/ueber-mich/sponsoren", label: "Sponsoren & Partner" },
  { href: "/ueber-mich/equipment", label: "Equipment" },
] as const;

export function AboutSubnav() {
  const pathname = usePathname();

  return (
    <nav className="about-subnav" aria-label="Unterseiten Über mich">
      <ul className="about-subnav-list">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={active ? "about-subnav-link about-subnav-link--active" : "about-subnav-link"}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
