/**
 * Kleine, zustandslose Bausteine des Admin-Portals (Server- und Client-tauglich).
 */
import { IconCheck, IconClock, IconMinus } from "@/components/admin/admin-icons";

/** Tausendertrennzeichen vereinheitlichen: Node-ICU liefert ' , Browser ’ — sonst Hydration-Fehler. */
function normalizeGrouping(s: string) {
  return s.replace(/['‘’]/g, "’");
}

/** CHF mit Rappen (Tabellen), identisch auf Server und Client. */
export function chf(n: number) {
  return normalizeGrouping(
    new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n),
  );
}

/** CHF ohne Rappen, wenn ganzzahlig — für Kennzahlen (Tabellen nutzen chfFmt mit 2 Stellen). */
export function chfCompact(n: number) {
  const whole = Math.abs(n % 1) < 0.005;
  return normalizeGrouping(
    new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n),
  );
}

/** ISO-Datum (YYYY-MM-DD oder Timestamp) → 12.03.2025 */
export function dateCh(value: string | null | undefined) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  return value;
}

type HeaderProps = {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export function AdminPageHeader({ title, eyebrow, description, actions }: HeaderProps) {
  return (
    <header className="ap-page-head">
      <div className="ap-page-head-text">
        {eyebrow ? <p className="ap-eyebrow">{eyebrow}</p> : null}
        <h1 className="ap-h1">{title}</h1>
        {description ? <p className="ap-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="ap-page-actions">{actions}</div> : null}
    </header>
  );
}

export type PayState = "paid" | "open" | "none";

/** Status-Badge: Farbe + Icon + Text (nie nur Farbe). */
export function StatusBadge({ state, children }: { state: PayState; children: React.ReactNode }) {
  return (
    <span className={`ap-status ap-status--${state}`}>
      {state === "paid" ? <IconCheck size={13} /> : state === "open" ? <IconClock size={13} /> : <IconMinus size={13} />}
      <span>{children}</span>
    </span>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="ap-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} von ${max} (${pct} %)`}
    >
      <span className="ap-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TierTag({ id, children }: { id: string; children: React.ReactNode }) {
  return <span className={`ap-tier ap-tier--${id}`}>{children}</span>;
}

/* ——— Gönner / Sponsoren / Partner ——— */

export type CategoryId = "goenner" | "sponsor" | "partner";
export type CategoryFilter = "all" | CategoryId;

export const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "goenner", label: "Gönner" },
  { id: "sponsor", label: "Sponsoren" },
  { id: "partner", label: "Partner" },
];

/** Kategorie eines Eintrags (null/leer = Gönner) */
export function categoryOf(m: { category?: string | null }): CategoryId {
  return m.category === "sponsor" || m.category === "partner" ? m.category : "goenner";
}

/** Bereichs-Tabs «Alle · Gönner · Sponsoren · Partner» mit Zählern */
export function CategoryTabs({
  value,
  counts,
  onChange,
}: {
  value: CategoryFilter;
  counts: Record<CategoryFilter, number>;
  onChange: (id: CategoryFilter) => void;
}) {
  return (
    <div className="ap-tabs" role="group" aria-label="Bereich wählen">
      {CATEGORY_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className="ap-tab"
          aria-pressed={value === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          <span className="ap-tab-count">{counts[t.id]}</span>
        </button>
      ))}
    </div>
  );
}

/** Art der Leistung als dezentes Label */
export function ContributionTag({ id, children }: { id: string | null | undefined; children: React.ReactNode }) {
  return <span className={`ap-contrib ap-contrib--${id || "geld"}`}>{children}</span>;
}
