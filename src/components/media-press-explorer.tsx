"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  pressStats,
  type EnrichedPressItem,
  type PressOutlet,
  type PressOutletId,
} from "@/content/media-press";
import { MG_EASE } from "@/components/motion/motion-provider";

type FilterId = "all" | PressOutletId;

const FILTER_ALL: FilterId = "all";

type Props = {
  items: EnrichedPressItem[];
  outlets: PressOutlet[];
};

type YearGroup = {
  key: string;
  label: string;
  items: EnrichedPressItem[];
};

const ease = MG_EASE as unknown as [number, number, number, number];

function groupByYear(items: EnrichedPressItem[]): YearGroup[] {
  const groups: YearGroup[] = [];
  const byKey = new Map<string, YearGroup>();
  for (const item of items) {
    const key = item.sortYear > 0 ? String(item.sortYear) : "ohne";
    let g = byKey.get(key);
    if (!g) {
      g = { key, label: item.sortYear > 0 ? String(item.sortYear) : "Ohne Jahr", items: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

export function MediaPressExplorer({ items, outlets }: Props) {
  const [filter, setFilter] = useState<FilterId>(FILTER_ALL);

  const stats = useMemo(() => pressStats(items), [items]);

  const visible = useMemo(() => {
    if (filter === FILTER_ALL) return items;
    return items.filter((i) => i.outletId === filter);
  }, [items, filter]);

  const groups = useMemo(() => groupByYear(visible), [visible]);

  const countsByOutlet = useMemo(() => {
    const m = new Map<PressOutletId, number>();
    for (const o of outlets) m.set(o.id, 0);
    for (const i of items) m.set(i.outletId, (m.get(i.outletId) ?? 0) + 1);
    return m;
  }, [items, outlets]);

  const chips: { id: FilterId; label: string; count: number; description?: string }[] = [
    { id: FILTER_ALL, label: "Alle", count: items.length },
    ...outlets
      .map((o) => ({ id: o.id as FilterId, label: o.label, count: countsByOutlet.get(o.id) ?? 0, description: o.description }))
      .filter((c) => c.count > 0),
  ];

  const activeLabel = chips.find((c) => c.id === filter)?.label ?? "Alle";

  return (
    <div className="mg-press-explorer">
      <dl className="mg-press-stats" aria-label="Überblick Medien">
        <div className="mg-stat mg-press-stats__item">
          <dt className="mg-stat__label">Einträge</dt>
          <dd className="mg-stat__value mg-press-stats__value">{stats.articleCount}</dd>
        </div>
        <div className="mg-stat mg-press-stats__item">
          <dt className="mg-stat__label">Quellen</dt>
          <dd className="mg-stat__value mg-press-stats__value">{stats.outletCount}</dd>
        </div>
        <div className="mg-stat mg-press-stats__item">
          <dt className="mg-stat__label">Jahre</dt>
          <dd className="mg-stat__value mg-press-stats__value">{stats.yearSpan}</dd>
        </div>
      </dl>

      <div className="mg-press-filter">
        <p className="mg-press-filter__label" id="press-filter-label">
          Nach Quelle filtern
        </p>
        <LayoutGroup id="press-filter">
          <div className="mg-press-filter__scroller">
            <div className="mg-press-filter__chips" role="group" aria-labelledby="press-filter-label">
              {chips.map((c) => {
                const active = filter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="mg-press-chip"
                    data-active={active ? "true" : undefined}
                    aria-pressed={active}
                    title={c.description || undefined}
                    onClick={() => setFilter(c.id)}
                  >
                    {active ? (
                      <motion.span
                        layoutId="mg-press-chip-pill"
                        className="mg-press-chip__pill"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="mg-press-chip__label">{c.label}</span>
                    <span className="mg-press-chip__count">{c.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </LayoutGroup>
        <p className="mg-press-filter__hint" aria-live="polite">
          {visible.length === items.length
            ? `${items.length} Artikel und Profile`
            : `${visible.length} von ${items.length} Einträgen · ${activeLabel}`}
        </p>
      </div>

      <LayoutGroup id="press-list">
        <div className="mg-press-archive">
          <AnimatePresence initial={false} mode="popLayout">
            {groups.map((g) => (
              <motion.section
                key={g.key}
                layout="position"
                className="mg-press-year"
                aria-labelledby={`press-year-${g.key}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease }}
              >
                <h3 id={`press-year-${g.key}`} className="mg-press-year__label">
                  <span className="mg-press-year__num">{g.label}</span>
                  <span className="mg-press-year__count">
                    {g.items.length} {g.items.length === 1 ? "Eintrag" : "Einträge"}
                  </span>
                </h3>
                <ul className="mg-press-list">
                  <AnimatePresence initial={false} mode="popLayout">
                    {g.items.map((item) => (
                      <motion.li
                        key={item.href}
                        layout="position"
                        className="mg-press-list__item"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.18 } }}
                        transition={{ duration: 0.45, ease }}
                      >
                        <a
                          href={item.href}
                          className="mg-press-row"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="mg-press-row__meta">
                            <span className="mg-press-row__outlet">{item.outletLabel}</span>
                            {item.period && item.period !== String(item.sortYear) ? (
                              <span className="mg-press-row__period">{item.period}</span>
                            ) : null}
                          </span>
                          <span className="mg-press-row__main">
                            <span className="mg-press-row__title">{item.title}</span>
                            {item.dek ? <span className="mg-press-row__dek">{item.dek}</span> : null}
                          </span>
                          <span className="mg-press-row__icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M7 17L17 7M17 7H9M17 7V15"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="mg-sr-only"> (öffnet in neuem Fenster)</span>
                        </a>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
