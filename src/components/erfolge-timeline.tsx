"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

export type ErfolgeTimelinePhase = "Foundation" | "Development" | "Professional";

export type ErfolgeTimelineEntry = {
  year: string;
  title: string;
  phase: ErfolgeTimelinePhase;
  details: string[];
};

function measureCardHeights(items: HTMLLIElement[]): number[] {
  return items.map((li) => {
    const card = li.querySelector<HTMLElement>(".erfolge-timeline-card");
    if (!card) return 0;
    const r = card.getBoundingClientRect();
    return Math.round(r.height * 1000) / 1000;
  });
}

/** Muss zur CSS-@container-Regel `erfolge-tl (max-width: …)` passen: darunter eine Spalte, kein Stagger. */
const TWO_COL_MIN_WIDTH_PX = 680;

/** Zusätzlicher vertikaler Abstand pro Schritt (neben „halbe Höhe des Vorgängers“). */
const STAGGER_STEP_EXTRA_PX = 22;

/** Nächster Eintrag beginnt auf der anderen Seite auf halber Höhe des Vorgängers (Ketten-Offset). */
function computeStaggerMargins(heights: number[]): number[] {
  const n = heights.length;
  if (n === 0) return [];
  const desiredTop = new Array<number>(n);
  desiredTop[0] = 0;
  for (let i = 1; i < n; i++) {
    desiredTop[i] = desiredTop[i - 1] + heights[i - 1] / 2 + STAGGER_STEP_EXTRA_PX;
  }

  const m = new Array<number>(n).fill(0);
  let rowTop = 0;

  for (let r = 0; 2 * r < n; r++) {
    const i0 = 2 * r;
    const i1 = 2 * r + 1;
    m[i0] = desiredTop[i0] - rowTop;
    let rowSpan: number;
    if (i1 < n) {
      m[i1] = desiredTop[i1] - rowTop;
      rowSpan = Math.max(m[i0] + heights[i0], m[i1] + heights[i1]);
    } else {
      rowSpan = m[i0] + heights[i0];
    }
    rowTop += rowSpan;
  }

  return m;
}

type Props = {
  entries: ErfolgeTimelineEntry[];
  phaseLabel: Record<ErfolgeTimelinePhase, string>;
};

export function ErfolgeTimeline({ entries, phaseLabel }: Props) {
  const rootRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [margins, setMargins] = useState<number[] | null>(null);

  const layout = useCallback(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;

    if (root.clientWidth < TWO_COL_MIN_WIDTH_PX) {
      setMargins(null);
      return;
    }

    const items = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (items.length !== entries.length) return;

    const heights = measureCardHeights(items);
    if (heights.some((h) => h <= 0)) return;

    setMargins(computeStaggerMargins(heights));
  }, [entries.length]);

  useLayoutEffect(() => {
    layout();
    const root = rootRef.current;
    if (!root) return;

    const ro = new ResizeObserver(() => layout());
    ro.observe(root);
    itemRefs.current.forEach((li) => {
      if (li) ro.observe(li);
    });

    return () => {
      ro.disconnect();
    };
  }, [layout, entries]);

  return (
    <ol
      ref={rootRef}
      className={`erfolge-timeline${margins ? " erfolge-timeline--stagger" : ""}`}
      aria-label="Werdegang als Zeitstrahl"
    >
      {entries.map((entry, i) => (
        <li
          key={entry.year}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="erfolge-timeline-item"
          style={
            margins
              ? {
                  marginTop: `${margins[i]}px`,
                }
              : undefined
          }
        >
          <article className="erfolge-timeline-card">
            <p className="erfolge-timeline-year">{entry.year}</p>
            <p className="erfolge-timeline-phase">{phaseLabel[entry.phase]}</p>
            <h3>{entry.title}</h3>
            <ul className="erfolge-timeline-points">
              {entry.details.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}
