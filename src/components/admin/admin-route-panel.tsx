"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { UpcomingEvent } from "@/lib/kalender-upcoming";

const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${Number(d)}. ${MONTHS_SHORT[Number(m) - 1] ?? ""}`;
}

/** Linie durch die Karte; Marker werden gleichmässig darauf verteilt. */
const ROUTE = "M 70 380 C 250 320, 310 350, 450 275 S 650 250, 770 190 S 970 85, 1150 115";

/** Dezente Höhenlinien als Hintergrund. */
const CONTOURS = Array.from({ length: 11 }, (_, i) => {
  const y = 20 + i * 40;
  const a = (i % 3) * 22;
  const b = (i % 2) * 30;
  return `M -20 ${y} C 200 ${y - 40 + a}, 420 ${y + 50 - b}, 640 ${y} S 1000 ${y - 30 + a}, 1220 ${y + 20}`;
});

type Props = {
  year: number;
  events: UpcomingEvent[];
  paid: number;
  billable: number;
  openSum: number;
  /** Neueste offene Anfrage für die Hinweis-Karte */
  alert: { title: string; meta: string; href: string; fresh: boolean } | null;
};

type Point = { x: number; y: number };

export function AdminRoutePanel({ year, events, paid, billable, openSum, alert }: Props) {
  const lineRef = useRef<SVGPathElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const stops = events.slice(0, 6);
  const next = events[0];
  const pct = billable > 0 ? Math.round((paid / billable) * 100) : 0;

  useEffect(() => {
    const path = lineRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const n = stops.length;
    const next: Point[] = stops.map((_, i) => {
      const f = n === 1 ? 0.5 : 0.1 + (i * 0.8) / (n - 1);
      const p = path.getPointAtLength(total * f);
      return { x: p.x, y: p.y };
    });
    setPoints(next);
    // stops ändert sich nur mit den Terminen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length]);

  return (
    <section className="ov-route" aria-label="Saison-Route">
      <svg className="ov-route-map" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g className="ov-route-blobs">
          <ellipse cx="260" cy="120" rx="170" ry="70" />
          <ellipse cx="880" cy="330" rx="210" ry="64" />
          <ellipse cx="1040" cy="150" rx="120" ry="52" />
        </g>
        <g className="ov-route-contours">
          {CONTOURS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <path ref={lineRef} d={ROUTE} className="ov-route-line" pathLength={1} />
        {points.map((p, i) => (
          <g key={stops[i].id} transform={`translate(${p.x} ${p.y})`}>
            <g className="ov-route-stop" style={{ animationDelay: `${900 + i * 140}ms` }}>
              <circle r="20" className="ov-route-halo" />
              <circle r="14" className="ov-route-dot" />
              <text y="4.5" textAnchor="middle" className="ov-route-num">
                {i + 1}
              </text>
            </g>
          </g>
        ))}
      </svg>

      <div className="ov-route-panel ov-route-panel--left">
        <div className="ov-route-chips">
          <span className="is-on">Saison {year}</span>
          <span>{events.length} Turniere</span>
          <span>{paid} von {billable} bezahlt</span>
        </div>

        <div className="ov-route-stat">
          <span className="ov-route-label">Bis zum nächsten Turnier:</span>
          {next ? (
            <>
              <span className="ov-route-big">
                {next.days}
                <small> {next.days === 1 ? "Tag" : "Tage"}</small>
              </span>
              <span className="ov-route-sub">
                {next.name} · {shortDate(next.start_date)}
              </span>
            </>
          ) : (
            <span className="ov-route-big">–</span>
          )}
        </div>

        <div className="ov-route-stat">
          <span className="ov-route-label">Beiträge bezahlt:</span>
          <span className="ov-route-pct">
            {pct}
            <small>%</small>
          </span>
          <span className="ov-route-bar" role="img" aria-label={`${pct} Prozent bezahlt`}>
            <span style={{ width: `${pct}%` }} />
          </span>
          <span className="ov-route-actions">
            <Link href="/admin/rechnungen" className="is-fill">
              Rechnung
            </Link>
            <Link href="/admin/kalender">Kalender</Link>
          </span>
        </div>
      </div>

      <div className="ov-route-panel ov-route-panel--right">
        <span className="ov-route-label">Hinweise:</span>
        <Link href={alert?.href ?? "/admin/goenner/inbox"} className="ov-route-alert">
          <strong>{alert ? alert.title : "Alles erledigt"}</strong>
          <span>{alert ? alert.meta : openSum > 0 ? `Noch offen: CHF ${Math.round(openSum).toLocaleString("de-CH")}` : "Keine offenen Beiträge oder Anfragen."}</span>
        </Link>
        {alert?.fresh ? <span className="ov-route-new">Neu</span> : null}
      </div>
    </section>
  );
}
