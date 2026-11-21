"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
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

const FREQS: { id: BudgetFrequency; label: string; icon: string }[] = [
  { id: "einmalig", label: "Einmal", icon: "1×" },
  { id: "monatlich", label: "Jeden Monat", icon: "🔁" },
  { id: "jaehrlich", label: "Jedes Jahr", icon: "📅" },
];

type Props = {
  entries: BudgetEntryRow[];
  incomeByYear: Record<string, number>;
  years: number[];
  defaultYear: number;
};

type ImportRow = { date: string; label: string; amount: number; include: boolean; scope: BudgetScope; category: string; frequency: BudgetFrequency };

const todayIso = () => new Date().toISOString().slice(0, 10);
const parseAmount = (s: string) => Number(String(s).replace(/[’'\s]/g, "").replace(",", "."));
const dmy = (iso: string) => iso.split("-").reverse().join(".");

export function AdminBudgetClient({ entries, incomeByYear, years, defaultYear }: Props) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [scope, setScope] = useState<BudgetScope>("golf");
  const [month, setMonth] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Formular
  const [sheetOpen, setSheetOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<string>("");
  const [catTouched, setCatTouched] = useState(false);
  const [frequency, setFrequency] = useState<BudgetFrequency>("einmalig");
  const [freqTouched, setFreqTouched] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [endsOn, setEndsOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Import
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const cats = categoriesFor(scope);
  const scopeEntries = useMemo(() => entries.filter((e) => e.scope === scope), [entries, scope]);
  const expanded = useMemo(() => monthlyAmounts(scopeEntries, year), [scopeEntries, year]);

  // Wert eines Eintrags: ganzes Jahr oder ausgewählter Monat
  const valueOf = (months: number[]) => (month === null ? months.reduce((s, v) => s + v, 0) : months[month]);

  const monthTotals = useMemo(() => Array.from({ length: 12 }, (_, m) => expanded.reduce((s, x) => s + x.months[m], 0)), [expanded]);
  const yearSpent = monthTotals.reduce((s, v) => s + v, 0);
  const shownSpent = month === null ? yearSpent : monthTotals[month];
  const maxMonth = Math.max(1, ...monthTotals);

  const catSums = useMemo(() => {
    const map: Record<string, number> = {};
    for (const x of expanded) {
      const v = month === null ? x.months.reduce((s, n) => s + n, 0) : x.months[month];
      if (v > 0) map[x.entry.category] = (map[x.entry.category] ?? 0) + v;
    }
    return map;
  }, [expanded, month]);
  const maxCat = Math.max(1, ...Object.values(catSums));

  const recurring = expanded.filter((x) => x.entry.frequency !== "einmalig" && x.months.some((v) => v > 0));
  const fixedPerMonth = recurring.reduce((s, x) => s + x.months.reduce((a, b) => a + b, 0) / 12, 0);

  const income = scope === "golf" ? incomeByYear[String(year)] ?? 0 : 0;

  const listItems = expanded
    .filter((x) => valueOf(x.months) > 0 && (catFilter === null || x.entry.category === catFilter))
    .sort((a, b) => b.entry.entry_date.localeCompare(a.entry.entry_date));
  const visibleItems = showAll ? listItems : listItems.slice(0, 12);

  const isRecurring = frequency !== "einmalig";
  const amountNumber = parseAmount(amount);
  const monthlyShare = frequency === "jaehrlich" && amountNumber > 0 ? amountNumber / 12 : 0;

  function changeScope(s: BudgetScope) {
    setScope(s);
    setCatFilter(null);
    setCategory("");
    setCatTouched(false);
  }

  function closeSheet() {
    setSheetOpen(false);
    setError(null);
  }

  function onNoteChange(text: string) {
    setNote(text);
    if (!catTouched) {
      const lower = text.toLowerCase();
      const hit = cats.find((c) => c.keywords.some((k) => lower.includes(k)));
      if (hit) setCategory(hit.id);
    }
    if (!freqTouched) {
      const f = suggestFrequency(text);
      if (f !== "einmalig") setFrequency(f);
    }
  }

  function resetForm() {
    setAmount("");
    setNote("");
    setCategory("");
    setCatTouched(false);
    setFrequency("einmalig");
    setFreqTouched(false);
    setDate(todayIso());
    setEndsOn("");
  }

  async function save() {
    setError(null);
    if (!(amountNumber > 0)) return setError("Bitte einen Betrag eingeben.");
    if (!category) return setError("Bitte eine Kategorie wählen.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          category,
          amount_chf: amountNumber,
          entry_date: date,
          label: note,
          frequency,
          ends_on: isRecurring ? endsOn : "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen.");
      resetForm();
      setSheetOpen(false);
      setToast(isRecurring ? "Gespeichert. Läuft ab jetzt in jedem Monat mit." : "Gespeichert.");
      setTimeout(() => setToast(null), 2600);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern.");
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
    if (rows.length === 0) return setToast("Keine Buchungen in der Datei gefunden.");
    setImportRows(
      rows.map((r) => ({
        ...r,
        include: true,
        scope: "golf" as BudgetScope,
        category: suggestCategory(r.label, "golf"),
        frequency: suggestFrequency(r.label),
      })),
    );
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
      setToast(`${data.saved} Buchungen gespeichert.`);
      setTimeout(() => setToast(null), 2600);
      router.refresh();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Fehler beim Import.");
    } finally {
      setBusy(false);
    }
  }

  const headLabel = month === null ? `Ausgaben ${year}` : `Ausgaben ${MONTHS[month]} ${year}`;

  return (
    <div className="bx">
      {/* Kopf: Jahr und Bereich */}
      <div className="bx-top">
        <div className="bx-seg" role="group" aria-label="Jahr">
          {years.map((y) => (
            <button key={y} type="button" className={y === year ? "is-on" : ""} aria-pressed={y === year} onClick={() => { setYear(y); setMonth(null); }}>
              {y}
            </button>
          ))}
        </div>
        <div className="bx-seg" role="tablist" aria-label="Bereich">
          <button type="button" role="tab" aria-selected={scope === "golf"} className={scope === "golf" ? "is-on" : ""} onClick={() => changeScope("golf")}>
            ⛳ Golf
          </button>
          <button type="button" role="tab" aria-selected={scope === "privat"} className={scope === "privat" ? "is-on" : ""} onClick={() => changeScope("privat")}>
            🏠 Privat
          </button>
        </div>
      </div>

      {/* Hero: Summen und Monatsbalken */}
      <section className="bx-hero" aria-label="Übersicht">
        <div className="bx-hero-main">
          <span className="bx-label">{headLabel}</span>
          <strong className="bx-big">CHF {fmt(shownSpent)}</strong>
          {scope === "golf" ? (
            <span className="bx-sub">
              Einnahmen CHF {fmt(income)} · <span className={income - yearSpent >= 0 ? "is-good" : "is-bad"}>Ergebnis CHF {fmt(income - yearSpent)}</span>
            </span>
          ) : (
            <span className="bx-sub">Fixkosten ca. CHF {fmt(fixedPerMonth)} pro Monat</span>
          )}
        </div>

        <div className="bx-bars" role="group" aria-label="Monate wählen">
          {monthTotals.map((v, m) => (
            <button
              key={m}
              type="button"
              className={`bx-bar${month === m ? " is-on" : ""}`}
              aria-pressed={month === m}
              aria-label={`${MONTHS[m]}: CHF ${fmt(v)}`}
              onClick={() => setMonth(month === m ? null : m)}
            >
              <span className="bx-bar-fill" style={{ height: `${Math.max(4, (v / maxMonth) * 100)}%` }} />
              <span className="bx-bar-label">{MONTHS[m].slice(0, 1)}</span>
            </button>
          ))}
        </div>
        <p className="bx-hint">{month === null ? "Tippe auf einen Monat, um nur diesen zu sehen." : `${MONTHS[month]} ausgewählt. Nochmals tippen zeigt wieder das ganze Jahr.`}</p>
      </section>

      {/* Kategorien */}
      <section className="bx-card" aria-labelledby="bx-cat-h">
        <div className="bx-card-head">
          <h2 id="bx-cat-h">Kategorien</h2>
          {catFilter ? <button type="button" className="bx-link" onClick={() => setCatFilter(null)}>Alle zeigen</button> : null}
        </div>
        <ul className="bx-cats">
          {cats
            .filter((c) => (catSums[c.id] ?? 0) > 0)
            .sort((a, b) => (catSums[b.id] ?? 0) - (catSums[a.id] ?? 0))
            .map((c) => {
              const v = catSums[c.id] ?? 0;
              return (
                <li key={c.id}>
                  <button type="button" className={`bx-cat${catFilter === c.id ? " is-on" : ""}`} aria-pressed={catFilter === c.id} onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}>
                    <span className="bx-cat-icon" aria-hidden="true">{c.icon}</span>
                    <span className="bx-cat-main">
                      <span className="bx-cat-row"><strong>{c.label}</strong><span>CHF {fmt(v)}</span></span>
                      <span className="bx-meter"><span style={{ width: `${(v / maxCat) * 100}%` }} /></span>
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>
        {Object.keys(catSums).length === 0 ? <p className="bx-empty">Noch keine Ausgaben in dieser Auswahl.</p> : null}
      </section>

      {/* Abos */}
      {recurring.length > 0 ? (
        <section className="bx-card" aria-labelledby="bx-rec-h">
          <div className="bx-card-head">
            <h2 id="bx-rec-h">Abos & Fixkosten</h2>
            <span className="bx-pill">ca. CHF {fmt(fixedPerMonth)} / Monat</span>
          </div>
          <ul className="bx-list">
            {recurring.map(({ entry: e }) => {
              const c = cats.find((x) => x.id === e.category);
              const monthly = e.frequency === "monatlich" ? Number(e.amount_chf) : Number(e.amount_chf) / 12;
              return (
                <li key={e.id} className="bx-item">
                  <span className="bx-item-icon" aria-hidden="true">{c?.icon ?? "📦"}</span>
                  <span className="bx-item-main">
                    <strong>{e.label || c?.label || e.category}</strong>
                    <span>
                      {e.frequency === "monatlich" ? "jeden Monat" : "jährlich, auf 12 Monate verteilt"}
                      {e.ends_on ? ` · bis ${dmy(e.ends_on)}` : ""}
                    </span>
                  </span>
                  <span className="bx-item-amount">
                    CHF {fmt(Number(e.amount_chf))}
                    <small>{e.frequency === "jaehrlich" ? `≈ ${fmt(monthly)} / Mt.` : "/ Monat"}</small>
                  </span>
                  <button type="button" className="bx-del" aria-label="Löschen" onClick={() => void remove(e.id)}>×</button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Buchungen */}
      <section className="bx-card" aria-labelledby="bx-list-h">
        <div className="bx-card-head">
          <h2 id="bx-list-h">Buchungen</h2>
          <span className="bx-pill">{listItems.length}</span>
        </div>
        {listItems.length === 0 ? (
          <p className="bx-empty">Noch nichts erfasst. Tippe unten auf „+ Ausgabe“.</p>
        ) : (
          <>
            <ul className="bx-list">
              {visibleItems.map(({ entry: e, months }) => {
                const c = cats.find((x) => x.id === e.category);
                const v = valueOf(months);
                return (
                  <li key={e.id} className="bx-item">
                    <span className="bx-item-icon" aria-hidden="true">{c?.icon ?? "📦"}</span>
                    <span className="bx-item-main">
                      <strong>{e.label || c?.label || e.category}</strong>
                      <span>
                        {dmy(e.entry_date)} · {c?.label ?? e.category}
                        {e.frequency !== "einmalig" ? ` · ${e.frequency === "monatlich" ? "monatlich" : "jährlich"}` : ""}
                      </span>
                    </span>
                    <span className="bx-item-amount">CHF {fmt(v)}</span>
                    <button type="button" className="bx-del" aria-label="Löschen" onClick={() => void remove(e.id)}>×</button>
                  </li>
                );
              })}
            </ul>
            {listItems.length > 12 ? (
              <button type="button" className="bx-more" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Weniger anzeigen" : `Alle ${listItems.length} anzeigen`}
              </button>
            ) : null}
          </>
        )}
      </section>

      {/* Bank-Import, versteckt */}
      <details className="bx-card bx-import">
        <summary>Bank-Export importieren (CSV)</summary>
        <div className="bx-import-body">
          <p className="bx-hint">Lade den CSV-Export deiner Bank hoch. Du prüfst die Zeilen und speicherst sie gesammelt.</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="bx-file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
          {importRows.length > 0 ? (
            <>
              <ul className="bx-imp">
                {importRows.map((r, i) => (
                  <li key={i} className={`bx-imp-row${r.include ? "" : " is-off"}`}>
                    <input type="checkbox" checked={r.include} onChange={(e) => updateImport(i, { include: e.target.checked })} aria-label="Übernehmen" />
                    <span className="bx-imp-main">
                      <strong>{r.label || "Buchung"}</strong>
                      <span>{dmy(r.date)} · CHF {fmt(r.amount)}</span>
                    </span>
                    <select className="ap-select" value={r.scope} aria-label="Bereich" onChange={(e) => updateImport(i, { scope: e.target.value as BudgetScope })}>
                      <option value="golf">Golf</option>
                      <option value="privat">Privat</option>
                    </select>
                    <select className="ap-select" value={r.category} aria-label="Kategorie" onChange={(e) => updateImport(i, { category: e.target.value })}>
                      {categoriesFor(r.scope).map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                    <select className="ap-select" value={r.frequency} aria-label="Häufigkeit" onChange={(e) => updateImport(i, { frequency: e.target.value as BudgetFrequency })}>
                      {FREQS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
              <button type="button" className="ap-btn ap-btn--primary" disabled={busy} onClick={() => void saveImport()}>
                {busy ? "Speichere…" : `${importRows.filter((r) => r.include).length} Buchungen speichern`}
              </button>
            </>
          ) : null}
        </div>
      </details>

      {/* Schwebende Aktion */}
      <button type="button" className="bx-fab" onClick={() => { setError(null); setSheetOpen(true); }}>
        <span aria-hidden="true">+</span> Ausgabe
      </button>

      {toast ? <div className="bx-toast" role="status">{toast}</div> : null}

      {/* Erfassen als Sheet */}
      {sheetOpen ? (
        <div className="bx-overlay" onClick={closeSheet}>
          <div className="bx-sheet" role="dialog" aria-modal="true" aria-label="Ausgabe erfassen" onClick={(e) => e.stopPropagation()}>
            <div className="bx-sheet-head">
              <span className="bx-label">Neue Ausgabe · {scope === "golf" ? "⛳ Golf" : "🏠 Privat"}</span>
              <button type="button" className="bx-del" aria-label="Schliessen" onClick={closeSheet}>×</button>
            </div>

            <label className="bx-amount">
              <span>CHF</span>
              <input inputMode="decimal" placeholder="0.00" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Betrag in CHF" />
            </label>
            {monthlyShare > 0 ? (
              <p className="bx-hint">Wird auf alle 12 Monate verteilt: CHF {fmt(monthlyShare)} pro Monat.</p>
            ) : null}

            <div className="bx-field">
              <span className="bx-field-label">Wie oft?</span>
              <div className="bx-freq" role="group" aria-label="Häufigkeit">
                {FREQS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={frequency === f.id ? "is-on" : ""}
                    aria-pressed={frequency === f.id}
                    onClick={() => { setFrequency(f.id); setFreqTouched(true); }}
                  >
                    <span aria-hidden="true">{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bx-field">
              <span className="bx-field-label">Kategorie</span>
              <div className="bx-tiles" role="group" aria-label="Kategorie">
                {cats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`bx-tile${category === c.id ? " is-on" : ""}`}
                    aria-pressed={category === c.id}
                    onClick={() => { setCategory(c.id); setCatTouched(true); }}
                  >
                    <span aria-hidden="true">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="bx-field">
              <span className="bx-field-label">Notiz (optional)</span>
              <input className="ap-input" placeholder="z. B. Salt Abo, Turnier, Flug" value={note} onChange={(e) => onNoteChange(e.target.value)} />
            </label>

            <div className="bx-form-row">
              <label className="bx-field">
                <span className="bx-field-label">{isRecurring ? "Ab" : "Datum"}</span>
                <input className="ap-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              {isRecurring ? (
                <label className="bx-field">
                  <span className="bx-field-label">Endet (optional)</span>
                  <input className="ap-input" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
                </label>
              ) : null}
            </div>

            {error ? <p className="ap-banner ap-banner--warn" role="alert">{error}</p> : null}

            <button type="button" className="bx-save" disabled={busy} onClick={() => void save()}>
              {busy ? "Speichere…" : "Speichern"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
