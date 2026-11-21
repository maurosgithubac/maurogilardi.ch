"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FREQUENCY_LABEL,
  categoriesFor,
  fmt,
  monthlyAmounts,
  parseBankCsv,
  suggestCategory,
  suggestFrequency,
  type BudgetEntryRow,
  type BudgetFrequency,
  type BudgetScope,
} from "@/lib/budget";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Props = {
  entries: BudgetEntryRow[];
  incomeByYear: Record<string, number>;
  years: number[];
  defaultYear: number;
};

type ImportRow = { date: string; label: string; amount: number; include: boolean; scope: BudgetScope; category: string; frequency: BudgetFrequency };

const todayIso = () => new Date().toISOString().slice(0, 10);

export function AdminBudgetClient({ entries, incomeByYear, years, defaultYear }: Props) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [scope, setScope] = useState<BudgetScope>("golf");
  const [category, setCategory] = useState<string>("");
  const [frequency, setFrequency] = useState<BudgetFrequency>("einmalig");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [endsOn, setEndsOn] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const cats = categoriesFor(scope);
  const scopeEntries = useMemo(() => entries.filter((e) => e.scope === scope), [entries, scope]);
  const expanded = useMemo(() => monthlyAmounts(scopeEntries, year), [scopeEntries, year]);

  // Summe je Kategorie und Monat
  const grid = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const c of cats) map[c.id] = Array(12).fill(0);
    for (const { entry, months } of expanded) {
      if (!map[entry.category]) continue;
      months.forEach((v, m) => (map[entry.category][m] += v));
    }
    return map;
  }, [expanded, cats]);

  const monthTotals = useMemo(() => Array.from({ length: 12 }, (_, m) => expanded.reduce((s, x) => s + x.months[m], 0)), [expanded]);
  const spent = monthTotals.reduce((s, v) => s + v, 0);
  const maxCell = Math.max(1, ...Object.values(grid).flat());
  const catTotal = (id: string) => (grid[id] ?? []).reduce((s, v) => s + v, 0);
  const income = scope === "golf" ? incomeByYear[String(year)] ?? 0 : 0;
  const recurring = scopeEntries.filter((e) => e.frequency !== "einmalig" && (!e.ends_on || e.ends_on.slice(0, 4) >= String(year)));
  const monthlyRun = recurring.reduce((s, e) => s + (e.frequency === "monatlich" ? Number(e.amount_chf) : Number(e.amount_chf) / 12), 0);

  const isRecurring = frequency !== "einmalig";

  async function save() {
    if (!category) return setMessage({ kind: "error", text: "Bitte zuerst eine Kategorie wählen." });
    const value = Number(String(amount).replace(/[’'\s]/g, "").replace(",", "."));
    if (!value || value <= 0) return setMessage({ kind: "error", text: "Bitte einen Betrag eingeben." });
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, category, amount_chf: value, entry_date: date, label, frequency, ends_on: isRecurring ? endsOn : "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen.");
      setAmount("");
      setLabel("");
      setEndsOn("");
      setMessage({ kind: "ok", text: isRecurring ? "Wiederkehrende Kosten gespeichert." : "Gespeichert." });
      router.refresh();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Fehler." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Diesen Eintrag löschen?")) return;
    const res = await fetch(`/api/admin/budget/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  async function onFile(file: File) {
    const rows = parseBankCsv(await file.text());
    if (rows.length === 0) return setMessage({ kind: "error", text: "Keine Buchungen in der Datei gefunden." });
    setImportRows(
      rows.map((r) => ({
        ...r,
        include: true,
        scope: "golf",
        category: suggestCategory(r.label, "golf"),
        frequency: suggestFrequency(r.label),
      })),
    );
    setMessage({ kind: "ok", text: `${rows.length} Buchungen gefunden. Prüfe Bereich, Kategorie und Häufigkeit, dann speichern.` });
  }

  function updateImport(i: number, patch: Partial<ImportRow>) {
    setImportRows((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        const next = { ...r, ...patch };
        if (patch.scope && patch.scope !== r.scope) next.category = suggestCategory(r.label, patch.scope);
        return next;
      }),
    );
  }

  async function saveImport() {
    const rows = importRows.filter((r) => r.include);
    if (rows.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/budget/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: rows.map((r) => ({ scope: r.scope, category: r.category, amount_chf: r.amount, entry_date: r.date, label: r.label, frequency: r.frequency })) }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; saved?: number };
      if (!res.ok) throw new Error(data.error ?? "Import fehlgeschlagen.");
      setImportRows([]);
      if (fileRef.current) fileRef.current.value = "";
      setMessage({ kind: "ok", text: `${data.saved} Buchungen gespeichert.` });
      router.refresh();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Fehler." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bd">
      <div className="bd-top">
        <div className="bd-years" role="group" aria-label="Jahr">
          {years.map((y) => (
            <button key={y} type="button" className={`bd-chip${y === year ? " is-on" : ""}`} aria-pressed={y === year} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
        <div className="bd-scope" role="tablist" aria-label="Bereich">
          <button type="button" role="tab" aria-selected={scope === "golf"} className={`bd-scope-btn${scope === "golf" ? " is-on" : ""}`} onClick={() => { setScope("golf"); setCategory(""); }}>
            ⛳ Golf
          </button>
          <button type="button" role="tab" aria-selected={scope === "privat"} className={`bd-scope-btn${scope === "privat" ? " is-on" : ""}`} onClick={() => { setScope("privat"); setCategory(""); }}>
            🏠 Privat
          </button>
        </div>
      </div>

      <section className="bd-summary" aria-label="Übersicht">
        {scope === "golf" ? (
          <>
            <div className="bd-kpi"><span>Einnahmen {year}</span><strong>CHF {fmt(income)}</strong></div>
            <div className="bd-kpi"><span>Ausgaben {year}</span><strong>CHF {fmt(spent)}</strong></div>
            <div className={`bd-kpi ${income - spent >= 0 ? "is-good" : "is-bad"}`}><span>Ergebnis</span><strong>CHF {fmt(income - spent)}</strong></div>
          </>
        ) : (
          <>
            <div className="bd-kpi"><span>Ausgaben {year}</span><strong>CHF {fmt(spent)}</strong></div>
            <div className="bd-kpi"><span>Pro Monat (Ø)</span><strong>CHF {fmt(spent / 12)}</strong></div>
            <div className="bd-kpi"><span>Wiederkehrend / Monat</span><strong>CHF {fmt(monthlyRun)}</strong></div>
          </>
        )}
      </section>

      <section className="ap-card bd-add" aria-labelledby="bd-add-h">
        <h2 id="bd-add-h" className="ap-h2">Ausgabe hinzufügen</h2>

        <div className="bd-freq" role="group" aria-label="Häufigkeit">
          {(Object.keys(FREQUENCY_LABEL) as BudgetFrequency[]).map((f) => (
            <button key={f} type="button" className={`bd-freq-btn${frequency === f ? " is-on" : ""}`} aria-pressed={frequency === f} onClick={() => setFrequency(f)}>
              {f === "einmalig" ? "1× einmalig" : f === "monatlich" ? "🔁 jeden Monat" : "📅 jährlich"}
            </button>
          ))}
        </div>

        <div className="bd-cats" role="group" aria-label="Kategorie wählen">
          {cats.map((c) => (
            <button key={c.id} type="button" className={`bd-cat${category === c.id ? " is-on" : ""}`} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
              <span className="bd-cat-icon" aria-hidden="true">{c.icon}</span>
              <span className="bd-cat-label">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="bd-form">
          <label className="ap-field">
            <span>{frequency === "einmalig" ? "Betrag (CHF)" : frequency === "monatlich" ? "Betrag pro Monat (CHF)" : "Jahresbetrag (CHF)"}</span>
            <input className="ap-input bd-big" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="ap-field">
            <span>{isRecurring ? "Ab Datum" : "Datum"}</span>
            <input className="ap-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          {isRecurring ? (
            <label className="ap-field">
              <span>Endet am (optional)</span>
              <input className="ap-input" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
            </label>
          ) : null}
          <label className="ap-field bd-wide">
            <span>Notiz (optional)</span>
            <input className="ap-input" placeholder="z. B. Salt Abo, Turnier Südafrika, Flug" value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
        </div>
        {frequency === "jaehrlich" ? <p className="bd-hint">Jahresbetrag wird gleichmässig auf alle 12 Monate verteilt (CHF {amount ? fmt(Number(amount.replace(/[’'\s]/g, "").replace(",", ".")) / 12) : "0.00"} pro Monat).</p> : null}
        {frequency === "monatlich" ? <p className="bd-hint">Dieser Betrag wird in jedem Monat ab dem Startdatum berücksichtigt.</p> : null}

        <button type="button" className="ap-btn ap-btn--primary bd-save" disabled={busy} onClick={() => void save()}>
          {busy ? "Speichere…" : "Speichern"}
        </button>
        {message ? <p className={`ap-banner ${message.kind === "error" ? "ap-banner--warn" : ""}`} role="status">{message.text}</p> : null}
      </section>

      <section className="ap-card" aria-labelledby="bd-heat-h">
        <h2 id="bd-heat-h" className="ap-h2">Wo das Geld hingeht · {year}</h2>
        <div className="bd-heat" role="table" aria-label="Heatmap der Ausgaben">
          <div className="bd-heat-row bd-heat-head" role="row">
            <span role="columnheader">Kategorie</span>
            {MONTHS.map((m) => <span key={m} role="columnheader">{m}</span>)}
            <span role="columnheader">Summe</span>
          </div>
          {cats.map((c) => (
            <div className="bd-heat-row" role="row" key={c.id}>
              <span role="rowheader" className="bd-heat-name">{c.icon} {c.label}</span>
              {(grid[c.id] ?? []).map((v, i) => (
                <span
                  key={i}
                  role="cell"
                  className="bd-cell"
                  title={`${MONTHS[i]}: CHF ${fmt(v)}`}
                  style={{ background: v > 0 ? `rgba(215, 25, 32, ${0.12 + 0.78 * (v / maxCell)})` : undefined, color: v / maxCell > 0.55 ? "#fff" : undefined }}
                >
                  {v > 0 ? Math.round(v) : ""}
                </span>
              ))}
              <span role="cell" className="bd-cell bd-cell--sum">{catTotal(c.id) > 0 ? fmt(catTotal(c.id)) : "—"}</span>
            </div>
          ))}
          <div className="bd-heat-row bd-heat-total" role="row">
            <span role="rowheader" className="bd-heat-name">Total pro Monat</span>
            {monthTotals.map((v, i) => <span key={i} role="cell" className="bd-cell bd-cell--total">{v > 0 ? Math.round(v) : ""}</span>)}
            <span role="cell" className="bd-cell bd-cell--sum">{fmt(spent)}</span>
          </div>
        </div>
      </section>

      <section className="ap-card" aria-labelledby="bd-rec-h">
        <h2 id="bd-rec-h" className="ap-h2">Abos & wiederkehrende Kosten</h2>
        {recurring.length === 0 ? (
          <p className="ap-empty-inline">Noch keine. Oben „🔁 jeden Monat“ oder „📅 jährlich“ wählen.</p>
        ) : (
          <ul className="bd-list">
            {recurring.map((e) => {
              const c = cats.find((x) => x.id === e.category);
              return (
                <li key={e.id} className="bd-item">
                  <span className="bd-item-icon" aria-hidden="true">{c?.icon ?? "📦"}</span>
                  <span className="bd-item-main">
                    <strong>{e.label || c?.label || e.category}</strong>
                    <span>{e.frequency === "monatlich" ? "jeden Monat" : "jährlich, auf 12 Monate verteilt"}{e.ends_on ? ` · bis ${e.ends_on.split("-").reverse().join(".")}` : ""}</span>
                  </span>
                  <span className="bd-item-amount">CHF {fmt(Number(e.amount_chf))}{e.frequency === "jaehrlich" ? " / Jahr" : " / Monat"}</span>
                  <button type="button" className="ap-icon-btn" aria-label="Löschen" onClick={() => void remove(e.id)}>×</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="ap-card" aria-labelledby="bd-list-h">
        <h2 id="bd-list-h" className="ap-h2">Einmalige Ausgaben {year}</h2>
        {(() => {
          const once = scopeEntries.filter((e) => e.frequency === "einmalig" && e.entry_date.startsWith(String(year)));
          if (once.length === 0) return <p className="ap-empty-inline">Noch keine einmaligen Ausgaben in diesem Jahr.</p>;
          return (
            <ul className="bd-list">
              {[...once].sort((a, b) => b.entry_date.localeCompare(a.entry_date)).map((e) => {
                const c = cats.find((x) => x.id === e.category);
                return (
                  <li key={e.id} className="bd-item">
                    <span className="bd-item-icon" aria-hidden="true">{c?.icon ?? "📦"}</span>
                    <span className="bd-item-main">
                      <strong>{c?.label ?? e.category}</strong>
                      <span>{e.label || "—"} · {e.entry_date.split("-").reverse().join(".")}</span>
                    </span>
                    <span className="bd-item-amount">CHF {fmt(Number(e.amount_chf))}</span>
                    <button type="button" className="ap-icon-btn" aria-label="Löschen" onClick={() => void remove(e.id)}>×</button>
                  </li>
                );
              })}
            </ul>
          );
        })()}
      </section>

      <section className="ap-card" aria-labelledby="bd-imp-h">
        <h2 id="bd-imp-h" className="ap-h2">Bank-Export importieren (CSV)</h2>
        <p className="bd-hint">Lade den CSV-Export deiner Bank hoch. Die Buchungen erscheinen unten, du prüfst Bereich, Kategorie und Häufigkeit und speicherst.</p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="bd-file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
        {importRows.length > 0 ? (
          <>
            <ul className="bd-import">
              {importRows.map((r, i) => (
                <li key={i} className={`bd-imp-row${r.include ? "" : " is-off"}`}>
                  <input type="checkbox" checked={r.include} onChange={(e) => updateImport(i, { include: e.target.checked })} aria-label="Übernehmen" />
                  <span className="bd-imp-main">
                    <strong>{r.label || "Buchung"}</strong>
                    <span>{r.date.split("-").reverse().join(".")} · CHF {fmt(r.amount)}</span>
                  </span>
                  <select className="ap-select" value={r.scope} aria-label="Bereich" onChange={(e) => updateImport(i, { scope: e.target.value as BudgetScope })}>
                    <option value="golf">Golf</option>
                    <option value="privat">Privat</option>
                  </select>
                  <select className="ap-select" value={r.category} aria-label="Kategorie" onChange={(e) => updateImport(i, { category: e.target.value })}>
                    {categoriesFor(r.scope).map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <select className="ap-select" value={r.frequency} aria-label="Häufigkeit" onChange={(e) => updateImport(i, { frequency: e.target.value as BudgetFrequency })}>
                    <option value="einmalig">Einmalig</option>
                    <option value="monatlich">Monatlich</option>
                    <option value="jaehrlich">Jährlich</option>
                  </select>
                </li>
              ))}
            </ul>
            <button type="button" className="ap-btn ap-btn--primary" disabled={busy} onClick={() => void saveImport()}>
              {busy ? "Speichere…" : `${importRows.filter((r) => r.include).length} Buchungen speichern`}
            </button>
          </>
        ) : null}
      </section>
    </div>
  );
}
