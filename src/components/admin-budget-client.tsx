"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoriesFor, fmt, parseBankCsv, suggestCategory, type BudgetEntryRow, type BudgetScope } from "@/lib/budget";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Props = {
  entries: BudgetEntryRow[];
  incomeByYear: Record<string, number>;
  years: number[];
  defaultYear: number;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export function AdminBudgetClient({ entries, incomeByYear, years, defaultYear }: Props) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [scope, setScope] = useState<BudgetScope>("golf");
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [importRows, setImportRows] = useState<{ date: string; label: string; amount: number; include: boolean; scope: BudgetScope; category: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const cats = categoriesFor(scope);
  const yearEntries = useMemo(
    () => entries.filter((e) => e.entry_date.startsWith(String(year)) && e.scope === scope),
    [entries, year, scope],
  );
  const spent = yearEntries.reduce((s, e) => s + Number(e.amount_chf), 0);
  const income = scope === "golf" ? incomeByYear[String(year)] ?? 0 : 0;

  // Heatmap: Kategorie x Monat
  const grid = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const c of cats) map[c.id] = Array(12).fill(0);
    for (const e of yearEntries) {
      const m = Number(e.entry_date.slice(5, 7)) - 1;
      if (map[e.category] && m >= 0 && m < 12) map[e.category][m] += Number(e.amount_chf);
    }
    return map;
  }, [yearEntries, cats]);
  const maxCell = Math.max(1, ...Object.values(grid).flat());
  const catTotal = (id: string) => (grid[id] ?? []).reduce((s, v) => s + v, 0);

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
        body: JSON.stringify({ scope, category, amount_chf: value, entry_date: date, label }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen.");
      setAmount("");
      setLabel("");
      setMessage({ kind: "ok", text: "Gespeichert." });
      router.refresh();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Fehler." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Diese Ausgabe löschen?")) return;
    const res = await fetch(`/api/admin/budget/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  async function onFile(file: File) {
    const text = await file.text();
    const rows = parseBankCsv(text);
    if (rows.length === 0) return setMessage({ kind: "error", text: "Keine Buchungen in der Datei gefunden." });
    setImportRows(rows.map((r) => ({ ...r, include: true, scope: "golf", category: suggestCategory(r.label, "golf") })));
    setMessage({ kind: "ok", text: `${rows.length} Buchungen gefunden. Prüfe Kategorie und Bereich, dann speichern.` });
  }

  function updateImport(i: number, patch: Partial<(typeof importRows)[number]>) {
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
        body: JSON.stringify({ rows: rows.map((r) => ({ scope: r.scope, category: r.category, amount_chf: r.amount, entry_date: r.date, label: r.label })) }),
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
            <div className="bd-kpi"><span>Einnahmen</span><strong>CHF {fmt(income)}</strong></div>
            <div className="bd-kpi"><span>Ausgaben</span><strong>CHF {fmt(spent)}</strong></div>
            <div className={`bd-kpi ${income - spent >= 0 ? "is-good" : "is-bad"}`}><span>Ergebnis</span><strong>CHF {fmt(income - spent)}</strong></div>
          </>
        ) : (
          <>
            <div className="bd-kpi"><span>Ausgaben {year}</span><strong>CHF {fmt(spent)}</strong></div>
            <div className="bd-kpi"><span>Pro Monat (Ø)</span><strong>CHF {fmt(spent / 12)}</strong></div>
            <div className="bd-kpi"><span>Buchungen</span><strong>{yearEntries.length}</strong></div>
          </>
        )}
      </section>

      <section className="ap-card bd-add" aria-labelledby="bd-add-h">
        <h2 id="bd-add-h" className="ap-h2">Ausgabe hinzufügen</h2>
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
            <span>Betrag (CHF)</span>
            <input className="ap-input bd-big" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="ap-field">
            <span>Datum</span>
            <input className="ap-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="ap-field bd-wide">
            <span>Notiz (optional)</span>
            <input className="ap-input" placeholder="z. B. Turnier Südafrika, Flug" value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
        </div>
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
        </div>
      </section>

      <section className="ap-card" aria-labelledby="bd-list-h">
        <h2 id="bd-list-h" className="ap-h2">Buchungen {year}</h2>
        {yearEntries.length === 0 ? (
          <p className="ap-empty-inline">Noch keine Ausgaben in diesem Bereich.</p>
        ) : (
          <ul className="bd-list">
            {[...yearEntries].sort((a, b) => b.entry_date.localeCompare(a.entry_date)).map((e) => {
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
        )}
      </section>

      <section className="ap-card" aria-labelledby="bd-imp-h">
        <h2 id="bd-imp-h" className="ap-h2">Bank-Export importieren (CSV)</h2>
        <p className="bd-hint">Lade den CSV-Export deiner Bank hoch. Die Buchungen erscheinen unten, du prüfst Kategorie und Bereich und speicherst.</p>
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
