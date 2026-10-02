"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** Inhaltsverzeichnis mit Scroll-Spy: der aktuelle Abschnitt bekommt die gleitende Markierung. */
export function BlogToc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? null);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="mg-toc" aria-label="Inhalt dieses Beitrags">
      <p className="mg-label">Inhalt</p>
      <ol className="mg-toc__list">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a href={`#${item.id}`} className="mg-toc__link" data-active={isActive ? "true" : undefined} aria-current={isActive ? "location" : undefined}>
                {isActive ? <motion.span layoutId="mg-toc-marker" className="mg-toc__marker" transition={{ type: "spring", stiffness: 380, damping: 32 }} /> : null}
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
