"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/ueber-mich", label: "Überblick" },
  { href: "/ueber-mich/sponsoren", label: "Sponsoren" },
  { href: "/ueber-mich/gallerie", label: "Galerie" },
  { href: "/ueber-mich/media", label: "Medien" },
  { href: "/ueber-mich/equipment", label: "Mein Bag" },
] as const;

export function AboutSubnav() {
  const pathname = usePathname();

  return (
    <nav className="about-subnav" aria-label="Bereiche: Über mich">
      <div className="about-subnav-inner">
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
      </div>
    </nav>
  );
}
