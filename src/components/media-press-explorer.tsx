"use client";

import { useMemo, useState } from "react";
import {
  pressStats,
  type EnrichedPressItem,
  type PressOutlet,
  type PressOutletId,
} from "@/content/media-press";

type FilterId = "all" | PressOutletId;

const FILTER_ALL: FilterId = "all";

type Props = {
  items: EnrichedPressItem[];
  outlets: PressOutlet[];
};

export function MediaPressExplorer({ items, outlets }: Props) {
  const [filter, setFilter] = useState<FilterId>(FILTER_ALL);

  const stats = useMemo(() => pressStats(items), [items]);

  const visible = useMemo(() => {
    if (filter === FILTER_ALL) return items;
    return items.filter((i) => i.outletId === filter);
  }, [items, filter]);

  const countsByOutlet = useMemo(() => {
    const m = new Map<PressOutletId, number>();
    for (const o of outlets) m.set(o.id, 0);
    for (const i of items) {
      m.set(i.outletId, (m.get(i.outletId) ?? 0) + 1);
    }
    return m;
  }, [items, outlets]);

  return (
    <>
      <div className="about-media-stats" aria-label="Überblick Medien">
        <div className="about-media-stat">
          <span className="about-media-stat-value">{stats.articleCount}</span>
          <span className="about-media-stat-label">Einträge</span>
        </div>
        <div className="about-media-stat">
          <span className="about-media-stat-value">{stats.outletCount}</span>
          <span className="about-media-stat-label">Quellen</span>
        </div>
        <div className="about-media-stat">
          <span className="about-media-stat-value">{stats.yearSpan}</span>
          <span className="about-media-stat-label">Jahre</span>
        </div>
      </div>

      <div className="about-media-filters" role="group" aria-label="Nach Quelle filtern">
        <button
          type="button"
          className={`about-media-filter${filter === FILTER_ALL ? " about-media-filter--active" : ""}`}
          onClick={() => setFilter(FILTER_ALL)}
          aria-pressed={filter === FILTER_ALL}
        >
          Alle
          <span className="about-media-filter-count">{items.length}</span>
        </button>
        {outlets.map((o) => {
          const n = countsByOutlet.get(o.id) ?? 0;
          if (n === 0) return null;
          const active = filter === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`about-media-filter${active ? " about-media-filter--active" : ""}`}
              onClick={() => setFilter(o.id)}
              aria-pressed={active}
            >
              {o.label}
              <span className="about-media-filter-count">{n}</span>
            </button>
          );
        })}
      </div>

      <p className="about-media-filter-hint" aria-live="polite">
        {visible.length === items.length
          ? `${items.length} Artikel und Profile`
          : `${visible.length} von ${items.length} Einträgen`}
      </p>

      <ul className="about-media-grid" aria-label="Gefilterte Medienlinks">
        {visible.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="about-media-tile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="about-media-tile-top">
                <span className="about-media-tile-badge">{item.outletLabel}</span>
                {item.period ? (
                  <span className="about-media-tile-year">{item.period}</span>
                ) : null}
              </span>
              <span className="about-media-tile-title">{item.title}</span>
              {item.dek ? <span className="about-media-tile-dek">{item.dek}</span> : null}
              <span className="about-media-tile-footer">
                <span className="about-media-tile-cta">Zum Artikel</span>
                <svg
                  className="about-media-tile-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M7 17L17 7M17 7H9M17 7V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
