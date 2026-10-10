"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { GOENNER_FINANCE_START_YEAR } from "@/lib/goenner-finance";
import {
  PRIZE_KINDS,
  PRIZE_TOUR_SUGGESTIONS,
  prizeKindOf,
  type PrizeKind,
  type PrizeMoneyRow,
} from "@/lib/prize-money";
import { IconPlus, IconSort, IconTrash, IconTrophy } from "@/components/admin/admin-icons";
import { AdminPageHeader, chf, chfCompact, dateCh } from "@/components/admin/admin-ui";

type Props = {
  rows: PrizeMoneyRow[];
  tableMissing?: boolean;
  loadError?: string;
};

type SortKey = "date" | "tournament" | "kind" | "placement" | "amount";
type SortState = { key: SortKey; dir: "asc" | "desc" };
type YearFilter = number | "all";
type KindFilter = PrizeKind | "all";

function kindLabel(kind: PrizeKind) {
  return PRIZE_KINDS.find((k) => k.id === kind)?.label ?? kind;
}

/** Vor Migration 021 steht «ProAm» noch im Namen — für die Anzeige weglassen */
function displayTournament(row: PrizeMoneyRow) {
  return row.kind ? row.tournament : row.tournament.replace(/\s*pro-?am\s*$/i, "");
}

function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** "1", "T3", "3." → 3 für die Sortierung; ohne Zahl ans Ende */
function placementRank(p: string | null) {
  const m = /\d+/.exec(p || "");
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
}

export function AdminPrizeMoneyClient({ rows, tableMissing, loadError }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<YearFilter>(currentYear);
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "date", dir: "desc" });
  // null = Formular zu, "new" = neues Preisgeld, sonst ID des bearbeiteten Eintrags
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => {
    const set = new Set<number>([currentYear]);
    for (const r of rows) set.add(r.year);
    for (let y = currentYear; y >= GOENNER_FINANCE_START_YEAR; y--) set.add(y);
    return [...set].sort((a, b) => b - a);
  }, [rows, currentYear]);

  const inYear = useMemo(() => (year === "all" ? rows : rows.filter((r) => r.year === year)), [rows, year]);
  const sumOf = (list: PrizeMoneyRow[]) => list.reduce((s, r) => s + Number(r.amount_chf || 0), 0);
  const byKind = Object.fromEntries(
    PRIZE_KINDS.map((k) => {
      const list = inYear.filter((r) => prizeKindOf(r) === k.id);
      return [k.id, { count: list.length, sum: sumOf(list) }];
    }),
  ) as Record<PrizeKind, { count: number; sum: number }>;

  const visible = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const list = kind === "all" ? inYear : inYear.filter((r) => prizeKindOf(r) === kind);
    return [...list].sort((a, b) => {
      let diff = 0;
      if (sort.key === "tournament") diff = displayTournament(a).localeCompare(displayTournament(b), "de-CH");
      else if (sort.key === "kind") diff = prizeKindOf(a).localeCompare(prizeKindOf(b));
      else if (sort.key === "placement") diff = placementRank(a.placement) - placementRank(b.placement);
      else if (sort.key === "amount") diff = Number(a.amount_chf) - Number(b.amount_chf);
      else diff = a.event_date.localeCompare(b.event_date);
      return diff * dir || b.event_date.localeCompare(a.event_date);
    });
  }, [inYear, sort, kind]);

  const total = sumOf(inYear);
  const visibleTotal = sumOf(visible);
  const best = inYear
    .filter((r) => prizeKindOf(r) === "prize")
    .reduce<PrizeMoneyRow | null>((top, r) => (!top || Number(r.amount_chf) > Number(top.amount_chf) ? r : top), null);
  const allTime = sumOf(rows);
  const editRow = editing && editing !== "new" ? rows.find((r) => r.id === editing) : undefined;

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "amount" || key === "date" ? "desc" : "asc" },
    );
  }

  function sortHeader(key: SortKey, label: string, align?: "end") {
    const active = sort.key === key;
    return (
      <th
        scope="col"
        className={align === "end" ? "ap-num" : undefined}
        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      >
        <button type="button" className={`ap-sort${active ? " is-active" : ""}`} onClick={() => toggleSort(key)}>
          {label}
          <IconSort dir={active ? sort.dir : null} />
        </button>
      </th>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(editRow ? `/api/admin/prize-money/${editRow.id}` : "/api/admin/prize-money", {
        method: editRow ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; prize?: PrizeMoneyRow };
      if (!res.ok) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      setEditing(null);
      if (data.prize && year !== "all" && data.prize.year !== year) setYear(data.prize.year);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(row: PrizeMoneyRow) {
    if (
      !window.confirm(
        `${kindLabel(prizeKindOf(row))} «${displayTournament(row)}» vom ${dateCh(row.event_date)} (${chf(Number(row.amount_chf))}) löschen?`,
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prize-money/${row.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Löschen fehlgeschlagen.");
        return;
      }
      if (editing === row.id) setEditing(null);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  const yearLabel = year === "all" ? "alle Jahre" : String(year);

  return (
    <div className="ap-page">
      <AdminPageHeader
        eyebrow="Einnahmen"
        title="Preisgelder"
        description="Preisgelder aus Turnieren. Sie zählen auf der Übersicht zu den Einnahmen der Saison."
        actions={
          <>
            <label className="ap-field-inline">
              <span>Saison</span>
              <select
                className="ap-select"
                value={year}
                onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
                <option value="all">Alle Jahre</option>
              </select>
            </label>
            <button
              type="button"
              className="ap-btn ap-btn--primary"
              disabled={tableMissing}
              aria-expanded={editing === "new"}
              aria-controls="ap-prize-form"
              onClick={() => setEditing((v) => (v === "new" ? null : "new"))}
            >
              {editing === "new" ? null : <IconPlus />}
              {editing === "new" ? "Abbrechen" : "Preisgeld erfassen"}
            </button>
          </>
        }
      />

      {tableMissing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Tabelle fehlt. In Supabase ausführen: <code>supabase/020_admin_inbox_seen_prize_money.sql</code>
        </p>
      ) : null}
      {loadError ? (
        <p className="ap-banner ap-banner--error" role="alert">
          Preisgelder konnten nicht geladen werden: {loadError}
        </p>
      ) : null}

      {editing ? (
        <form id="ap-prize-form" key={editing} className="ap-card ap-form" onSubmit={onSubmit}>
          <div className="ap-card-head">
            <h2 className="ap-h2">{editRow ? `«${displayTournament(editRow)}» bearbeiten` : "Neuer Eintrag"}</h2>
          </div>
          <div className="ap-form-grid ap-form-grid--3">
            <label className="ap-field">
              <span className="ap-label">Art</span>
              <select
                className="ap-select"
                name="kind"
                defaultValue={editRow ? prizeKindOf(editRow) : kind === "proam" ? "proam" : "prize"}
              >
                {PRIZE_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ap-field">
              <span className="ap-label">Turnier</span>
              <input
                className="ap-input"
                name="tournament"
                required
                maxLength={200}
                autoFocus
                defaultValue={editRow ? displayTournament(editRow) : ""}
                placeholder="z. B. Staan Open"
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Tour</span>
              <input
                className="ap-input"
                name="tour"
                maxLength={120}
                list="ap-prize-tours"
                defaultValue={editRow?.tour ?? ""}
                placeholder="optional"
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Datum</span>
              <input
                className="ap-input"
                name="event_date"
                type="date"
                required
                defaultValue={editRow?.event_date ?? todayIso()}
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Rang</span>
              <input
                className="ap-input"
                name="placement"
                maxLength={40}
                defaultValue={editRow?.placement ?? ""}
                placeholder="z. B. 1 oder T5"
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Betrag (CHF)</span>
              <input
                className="ap-input ap-input--num"
                name="amount_chf"
                required
                inputMode="decimal"
                defaultValue={editRow ? String(editRow.amount_chf) : ""}
                placeholder="0.00"
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Notiz</span>
              <input
                className="ap-input"
                name="note"
                maxLength={1000}
                defaultValue={editRow?.note ?? ""}
                placeholder="z. B. Originalbetrag EUR 2’500"
              />
            </label>
          </div>
          <datalist id="ap-prize-tours">
            {PRIZE_TOUR_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <div className="ap-form-actions">
            <button type="button" className="ap-btn ap-btn--ghost" onClick={() => setEditing(null)}>
              Abbrechen
            </button>
            <button type="submit" className="ap-btn ap-btn--primary" disabled={busy}>
              {busy ? "Speichern…" : editRow ? "Änderungen speichern" : "Preisgeld speichern"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="ap-banner ap-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <dl className="ap-statline" aria-label={`Preisgelder ${yearLabel}`}>
        <div>
          <dt>Total {yearLabel}</dt>
          <dd>{chfCompact(total)}</dd>
        </div>
        <div>
          <dt>Preisgelder</dt>
          <dd>
            {chfCompact(byKind.prize.sum)} <span className="ap-dim">· {byKind.prize.count}×</span>
          </dd>
        </div>
        <div>
          <dt>ProAms</dt>
          <dd>
            {chfCompact(byKind.proam.sum)} <span className="ap-dim">· {byKind.proam.count}×</span>
          </dd>
        </div>
        <div>
          <dt>Höchstes Preisgeld</dt>
          <dd>{best ? `${chfCompact(Number(best.amount_chf))} · ${dateCh(best.event_date)}` : "—"}</dd>
        </div>
        {year !== "all" ? (
          <div>
            <dt>Total alle Jahre</dt>
            <dd>{chfCompact(allTime)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="ap-toolbar">
        <div className="ap-segment" role="group" aria-label="Art filtern">
          {(
            [
              ["all", "Alle", inYear.length],
              ...PRIZE_KINDS.map((k) => [k.id, k.plural, byKind[k.id].count] as const),
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              className="ap-segment-btn"
              aria-pressed={kind === id}
              onClick={() => setKind(id)}
            >
              {label}
              <span className="ap-segment-count">{count}</span>
            </button>
          ))}
        </div>
        <label className="ap-field-inline ap-sort-select">
          <span>Sortieren</span>
          <select
            className="ap-select"
            value={`${sort.key}:${sort.dir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [SortKey, "asc" | "desc"];
              setSort({ key, dir });
            }}
          >
            <option value="date:desc">Datum neueste</option>
            <option value="date:asc">Datum älteste</option>
            <option value="amount:desc">Betrag hoch → tief</option>
            <option value="tournament:asc">Turnier A–Z</option>
            <option value="kind:asc">Art</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="ap-card ap-empty">
          <IconTrophy size={20} />
          <p className="ap-empty-title">Noch keine Preisgelder für {yearLabel}</p>
          <p className="ap-muted-sm">Mit «Preisgeld erfassen» das erste Turnier eintragen.</p>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table ap-table--prize">
            <caption className="sr-only">
              Preisgelder {yearLabel}, {visible.length} Einträge
            </caption>
            <thead>
              <tr>
                {sortHeader("date", "Datum")}
                {sortHeader("tournament", "Turnier")}
                {sortHeader("kind", "Art")}
                {sortHeader("placement", "Rang")}
                {sortHeader("amount", "Betrag", "end")}
                <th scope="col" className="ap-col-actions">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className={editing === r.id ? "is-editing" : undefined}>
                  <td data-label="Datum" className="ap-nowrap">
                    {dateCh(r.event_date)}
                  </td>
                  <td className="ap-cell-name" data-label="Turnier">
                    <span className="ap-row-title">{displayTournament(r)}</span>
                    {r.tour && r.tour !== displayTournament(r) ? <span className="ap-row-org">{r.tour}</span> : null}
                    {r.note ? <span className="ap-row-sub">{r.note}</span> : null}
                  </td>
                  <td data-label="Art">
                    <span className={`ap-prize-kind ap-prize-kind--${prizeKindOf(r)}`}>{kindLabel(prizeKindOf(r))}</span>
                  </td>
                  <td data-label="Rang">{r.placement || <span className="ap-dim">—</span>}</td>
                  <td className="ap-num ap-num--strong" data-label="Betrag">
                    {chf(Number(r.amount_chf))}
                  </td>
                  <td className="ap-col-actions">
                    <div className="ap-row-actions">
                      <button
                        type="button"
                        className="ap-btn ap-btn--secondary ap-btn--sm"
                        disabled={busy}
                        onClick={() => setEditing(r.id)}
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        className="ap-icon-btn ap-icon-btn--danger"
                        disabled={busy}
                        onClick={() => void onDelete(r)}
                        title="Löschen"
                        aria-label={`Preisgeld ${r.tournament} löschen`}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={4}>
                  Total {kind === "all" ? "" : `${PRIZE_KINDS.find((k) => k.id === kind)?.plural} `}
                  {yearLabel}
                </th>
                <td className="ap-num ap-num--strong">{chf(visibleTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <p className="ap-footnote">
        Beträge in CHF. Preisgelder in Euro bitte umgerechnet eintragen und den Originalbetrag in der Notiz festhalten.
      </p>
    </div>
  );
}
