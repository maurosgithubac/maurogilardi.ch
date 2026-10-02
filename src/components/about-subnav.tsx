"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

const LINKS = [
  { href: "/ueber-mich", label: "Überblick" },
  { href: "/ueber-mich/sponsoren", label: "Sponsoren" },
  { href: "/ueber-mich/gallerie", label: "Galerie" },
  { href: "/ueber-mich/media", label: "Medien" },
  { href: "/ueber-mich/equipment", label: "Mein Bag" },
  { href: "/ueber-mich/faq", label: "FAQ" },
] as const;

/** Segment-Navigation mit gleitendem Aktiv-Indikator (shared layout). */
export function AboutSubnav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  // Mobil: aktiven Eintrag in der horizontal scrollbaren Leiste zentrieren (nur die Leiste, nicht die Seite)
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav className="mg-subnav" aria-label="Bereiche: Über mich">
      <ul ref={listRef} className="mg-subnav__list">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link href={href} className="mg-subnav__link" data-active={active ? "true" : undefined} aria-current={active ? "page" : undefined}>
                {active ? (
                  <motion.span layoutId="mg-subnav-pill" className="mg-subnav__pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                ) : null}
                <span className="mg-subnav__label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
