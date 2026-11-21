"use client";

import { useId, useState } from "react";

/** Kleine SVG-Diagramme für das Dashboard. Keine Abhängigkeiten, Animation per CSS. */

const W = 640;

function axis(n: number) {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : `${Math.round(n)}`;
}

function smooth(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

type AreaProps = {
  /** Kumulierte Monatswerte (bis `through` gezeichnet) */
  values: number[];
  /** Vorjahr, gestrichelt */
  compare?: number[];
  /** Zweite Linie, z. B. Ausgaben */
  ghost?: number[];
  labels: string[];
  through: number;
  format: (n: number) => string;
  height?: number;
  compact?: boolean;
};

export function AreaChart({ values, compare, ghost, labels, through, format, height = 240, compact = false }: AreaProps) {
  const W = 900;
  const uid = useId().replace(/:/g, "");
  const padL = compact ? 6 : 46;
  const padR = 14;
  const padT = compact ? 10 : 34;
  const padB = compact ? 6 : 26;
  const h = height;
  const all = [...values.slice(0, through), ...(compare ?? []), ...(ghost ?? [])];
  const max = Math.max(1, ...all) * 1.08;
  const x = (i: number) => padL + (i * (W - padL - padR)) / 11;
  const y = (v: number) => padT + (1 - v / max) * (h - padT - padB);

  const cur = values.slice(0, through).map((v, i) => ({ x: x(i), y: y(v) }));
  const line = smooth(cur);
  const area = cur.length ? `${line} L ${cur[cur.length - 1].x} ${h - padB} L ${cur[0].x} ${h - padB} Z` : "";
  const prev = compare ? smooth(compare.map((v, i) => ({ x: x(i), y: y(v) }))) : "";
  const gh = ghost ? smooth(ghost.slice(0, through).map((v, i) => ({ x: x(i), y: y(v) }))) : "";
  const last = cur[cur.length - 1];
  const ticks = compact ? [] : [0, 0.25, 0.5, 0.75, 1];
  const chipText = values[through - 1] !== undefined ? format(values[through - 1]) : "";
  const chipW = Math.max(60, chipText.length * 8 + 22);
  const [hover, setHover] = useState<number | null>(null);
  const step = (W - padL - padR) / 11;
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    setHover(Math.max(0, Math.min(11, Math.round((vx - padL) / step))));
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setHover((h0) => Math.min(11, (h0 ?? -1) + 1));
    else if (e.key === "ArrowLeft") setHover((h0) => Math.max(0, (h0 ?? 12) - 1));
    else if (e.key === "Escape") setHover(null);
  };
  const hv = compact ? null : hover;
  const hasCur = hv !== null && hv < through && values[hv] !== undefined;

  return (
    <div
      className={`dc-wrap${hv !== null ? " is-hover" : ""}`}
      onPointerMove={compact ? undefined : onMove}
      onPointerLeave={() => setHover(null)}
      onKeyDown={compact ? undefined : onKey}
      onBlur={() => setHover(null)}
      tabIndex={compact ? undefined : 0}
      aria-label={compact ? undefined : "Verlauf, mit Pfeiltasten durch die Monate"}
    >
    <svg className="dc-area" viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Verlauf">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ap-red)" stopOpacity="0.34" />
          <stop offset="1" stopColor="var(--ap-red)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const gy = padT + t * (h - padT - padB);
        return (
          <g key={t} className="dc-grid">
            <line x1={padL} x2={W - padR} y1={gy} y2={gy} />
            {!compact ? (
              <text x={padL - 8} y={gy + 4} textAnchor="end">
                {axis(max * (1 - t))}
              </text>
            ) : null}
          </g>
        );
      })}
      {!compact
        ? labels.map((l, i) => (
            <text key={i} x={x(i)} y={h - 6} textAnchor="middle" className="dc-xlabel">
              {l}
            </text>
          ))
        : null}
      {area ? <path d={area} fill={`url(#g${uid})`} className="dc-area-fill" /> : null}
      {prev ? <path d={prev} className="dc-compare" /> : null}
      {gh ? <path d={gh} className="dc-ghost" /> : null}
      {line ? <path d={line} className="dc-line" pathLength={1} /> : null}
      {hv !== null ? (
        <g className="dc-cursor" pointerEvents="none">
          <line x1={x(hv)} x2={x(hv)} y1={padT} y2={h - padB} />
          {hasCur ? <circle cx={x(hv)} cy={y(values[hv])} r="5.5" className="dc-cursor-dot" /> : null}
          {compare && compare[hv] !== undefined ? <circle cx={x(hv)} cy={y(compare[hv])} r="4" className="dc-cursor-dot dc-cursor-dot--prev" /> : null}
        </g>
      ) : null}
      {last ? (
        <g className="dc-end">
          <circle cx={last.x} cy={last.y} r="9" className="dc-end-halo" />
          <circle cx={last.x} cy={last.y} r="5" className="dc-end-dot" />
          {!compact ? (
            <g transform={`translate(${Math.min(last.x - chipW / 2, W - chipW - 4)} ${Math.max(2, last.y - 36)})`}>
              <rect width={chipW} height="24" rx="12" className="dc-chip" />
              <text x={chipW / 2} y="16" textAnchor="middle" className="dc-chip-text">
                {chipText}
              </text>
            </g>
          ) : null}
        </g>
      ) : null}
    </svg>
    {hv !== null ? (
      <div className={`dc-tip${hv > 7 ? " is-left" : ""}`} style={{ left: `${(x(hv) / W) * 100}%` }} role="status">
        <span className="dc-tip-title">{labels[hv]}</span>
        {hasCur ? (
          <span className="dc-tip-row"><i className="dot is-red" />Einnahmen<b>{format(values[hv])}</b></span>
        ) : null}
        {compare && compare[hv] !== undefined ? (
          <span className="dc-tip-row"><i className="dot is-dash" />Vorjahr<b>{format(compare[hv])}</b></span>
        ) : null}
        {ghost && hv < through && ghost[hv] !== undefined ? (
          <span className="dc-tip-row"><i className="dot is-ink" />Ausgaben<b>{format(ghost[hv])}</b></span>
        ) : null}
      </div>
    ) : null}
    </div>
  );
}

type RingSegment = { value: number; className: string };

/** Ring mit einem oder mehreren Abschnitten; Mitte frei für Text. */
export function Ring({ segments, size = 150, stroke = 16, children }: { segments: RingSegment[]; size?: number; stroke?: number; children?: React.ReactNode }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = 50 - stroke / 2 - 1;
  let offset = 0;
  return (
    <div className="dc-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" role="img" aria-label="Anteil">
        <circle cx="50" cy="50" r={r} className="dc-ring-track" strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const len = (s.value / total) * 100;
          const el = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              pathLength={100}
              fill="none"
              strokeWidth={stroke}
              className={`dc-ring-seg ${s.className}`}
              strokeDasharray={`${Math.max(0, len - 0.8)} ${100 - Math.max(0, len - 0.8)}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="dc-ring-center">{children}</div>
    </div>
  );
}

/** Halbkreis-Tacho (0 bis 100). */
export function Gauge({ value, children }: { value: number; children?: React.ReactNode }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="dc-gauge">
      <svg viewBox="0 0 120 70" role="img" aria-label={`${Math.round(v)} Prozent`}>
        <path d="M 10 62 A 50 50 0 0 1 110 62" className="dc-gauge-track" pathLength={100} />
        <path d="M 10 62 A 50 50 0 0 1 110 62" className="dc-gauge-fill" pathLength={100} strokeDasharray={`${v} ${100 - v}`} />
      </svg>
      <div className="dc-gauge-center">{children}</div>
    </div>
  );
}

type BarsProps = {
  values: number[];
  labels: string[];
  highlight?: number;
  format: (n: number) => string;
  height?: number;
};

/** Säulen pro Monat. */
export function Bars({ values, labels, highlight, format, height = 220 }: BarsProps) {
  const padL = 8;
  const padB = 24;
  const padT = 20;
  const max = Math.max(1, ...values) * 1.08;
  const bw = (W - padL * 2) / values.length;
  const inner = height - padT - padB;
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="dc-wrap" onPointerLeave={() => setHover(null)}>
    <svg className="dc-bars" viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Säulendiagramm">
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={padL} x2={W - padL} y1={padT + t * inner} y2={padT + t * inner} className="dc-grid-line" />
      ))}
      {values.map((v, i) => {
        const bh = (v / max) * inner;
        const bx = padL + i * bw + bw * 0.22;
        return (
          <g key={i} onPointerEnter={() => setHover(i)}>
            <rect x={padL + i * bw} y={0} width={bw} height={height} fill="transparent" />
            <rect
              x={bx}
              y={padT + inner - Math.max(v > 0 ? 3 : 0, bh)}
              width={bw * 0.56}
              height={Math.max(v > 0 ? 3 : 0, bh)}
              rx="5"
              className={`dc-bar${highlight === i ? " is-on" : ""}${hover === i ? " is-hover" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}
            />
            <text x={bx + (bw * 0.56) / 2} y={height - 6} textAnchor="middle" className="dc-xlabel">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
    {hover !== null ? (
      <div
        className={`dc-tip dc-tip--bar${hover > 7 ? " is-left" : ""}`}
        style={{ left: `${((padL + hover * bw + bw / 2) / W) * 100}%`, top: 0 }}
        role="status"
      >
        <span className="dc-tip-title">{labels[hover]}</span>
        <span className="dc-tip-row">Ausgaben<b>{format(values[hover])}</b></span>
      </div>
    ) : null}
    </div>
  );
}
