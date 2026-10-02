"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export type FaqTopic = {
  id: string;
  title: string;
  count: number;
};

type Props = {
  topics: FaqTopic[];
};

/** Themen-Sprungnavigation mit Scroll-Spy (aktives Thema bekommt die Pille). */
export function FaqTopicNav({ topics }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = topics
      .map((topic) => document.getElementById(`faq-${topic.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace(/^faq-/, "");
          if (entry.isIntersecting) visible.set(id, entry.boundingClientRect.top);
          else visible.delete(id);
        }
        // Oberstes sichtbares Thema gewinnt
        const first = topics.find((topic) => visible.has(topic.id));
        if (first) setActive(first.id);
        // Wieder oberhalb des ersten Themas → erstes Thema aktiv statt des zuletzt gesehenen
        else if (targets[0].getBoundingClientRect().top > window.innerHeight * 0.3) setActive(topics[0]?.id ?? null);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [topics]);

  return (
    <nav className="mg-faq-nav" aria-label="Sprung zu FAQ-Themen">
      <p className="mg-faq-nav__label">Themen</p>
      <ul className="mg-faq-nav__list">
        {topics.map((topic) => {
          const isActive = active === topic.id;
          return (
            <li key={topic.id}>
              <a
                href={`#faq-${topic.id}`}
                className="mg-faq-nav__link"
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActive(topic.id)}
              >
                {isActive ? (
                  <motion.span
                    layoutId="mg-faq-nav-pill"
                    className="mg-faq-nav__pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="mg-faq-nav__title">{topic.title}</span>
                <span className="mg-faq-nav__count">{topic.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
