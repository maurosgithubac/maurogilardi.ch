"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CountUp } from "@/components/admin/ui/count-up";
import {
  SUBCATEGORY_SUGGESTIONS,
  categoriesFor,
  categoryColor,
  fmt,
  monthlyAmounts,
  parseBankCsv,
  suggestCategory,
  suggestFrequency,
  type BudgetEntryRow,
  type BudgetFrequency,
  type BudgetScope,
} from "@/lib/budget";
import { squarify } from "@/lib/treemap";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

const FREQS: { id: BudgetFrequency; label: string }[] = [
  { id: "einmalig", label: "Einmal" },
  { id: "monatlich", label: "Jeden Monat" },
  { id: "jaehrlich", label: "Jedes Jahr" },
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
const chfCount = (n: number) => `CHF ${fmt(n)}`;

export function AdminBudgetClient({ entries, incomeByYear, years, defaultYear }: Props) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [scope, setScope] = useState<BudgetScope>("golf");
  const [month, setMonth] = useState<number | null>(null);

  // Auswahl: Hauptkategorie und Unterkategorie ("" = ohne Unterkategorie, null = keine Auswahl)
  const [catId, setCatId] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [newSubText, setNewSubText] = useState("");

  // Formular
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [frequency, setFrequency] = useState<BudgetFrequency>("einmalig");
  const [date, setDate] = useState(todayIso());
  const [endsOn, setEndsOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Import
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Treemap-Grösse
  const mapRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [mapW, setMapW] = useState(0);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const read = () => setMapW(el.clientWidth);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cats = categoriesFor(scope);
  const scopeEntries = useMemo(() => entries.filter((e) => e.scope === scope), [entries, scope]);
  const expanded = useMemo(() => monthlyAmounts(scopeEntries, year), [scopeEntries, year]);

  const valueOf = (months: number[]) => (month === null ? months.reduce((s, v) => s + v, 0) : months[month]);

  const monthTotals = useMemo(() => Array.from({ length: 12 }, (_, m) => expanded.reduce((s, x) => s + x.months[m], 0)), [expanded]);
  const yearTotal = monthTotals.reduce((s, v) => s + v, 0);
  const shownTotal = month === null ? yearTotal : monthTotals[month];

  const catStats = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const x of expanded) {
      const v = month === null ? x.months.reduce((s, n) => s + n, 0) : x.months[month];
      if (v <= 0) continue;
      const c = (map[x.entry.category] ??= { total: 0, count: 0 });
      c.total += v;
      c.count += 1;
    }
    return map;
  }, [expanded, month]);

  const filled = cats.filter((c) => (catStats[c.id]?.total ?? 0) > 0);
  const empty = cats.filter((c) => (catStats[c.id]?.total ?? 0) <= 0);
  const grand = filled.reduce((s, c) => s + catStats[c.id].total, 0);

  const mapH = mapW < 640 ? Math.round(mapW * 1.05) : Math.round(Math.min(520, Math.max(340, mapW * 0.4)));
  const rects = useMemo(
    () =>
      mapW > 0 && grand > 0
        ? squarify(
            filled.map((c) => ({ id: c.id, value: Math.max(catStats[c.id].total, grand * 0.035), data: c })),
            mapW,
            mapH,
          )
        : [],
    // filled hängt von cats und catStats ab
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapW, mapH, grand, catStats, cats],
  );

  const recurring = expanded.filter((x) => x.entry.frequency !== "einmalig" && x.months.some((v) => v > 0));
  const fixedPerMonth = recurring.reduce((s, x) => s + x.months.reduce((a, b) => a + b, 0) / 12, 0);
  const income = scope === "golf" ? incomeByYear[String(year)] ?? 0 : 0;
  const biggest = filled.length ? [...filled].sort((a, b) => catStats[b.id].total - catStats[a.id].total)[0] : null;
  const flow = [...filled].sort((a, b) => catStats[b.id].total - catStats[a.id].total);

  // Auswahl-Details
  const selCat = cats.find((c) => c.id === catId) ?? null;
  const catItems = useMemo(
    () => (catId ? expanded.filter((x) => x.entry.category === catId && valueOf(x.months) > 0) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expanded, catId, month],
  );
  const subGroups = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const x of catItems) {
      const name = (x.entry.subcategory ?? "").trim();
      const g = map.get(name.toLowerCase()) ?? { name, total: 0, count: 0 };
      g.total += valueOf(x.months);
      g.count += 1;
      map.set(name.toLowerCase(), g);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catItems, month]);
  const suggestions = (catId ? SUBCATEGORY_SUGGESTIONS[catId] ?? [] : []).filter((s) => !subGroups.some((g) => g.name.toLowerCase() === s.toLowerCase()));
  const customSub = sub && sub !== "" && !subGroups.some((g) => g.name.toLowerCase() === sub.toLowerCase()) && !suggestions.some((s) => s.toLowerCase() === sub.toLowerCase());
  const listItems = catItems
    .filter((x) => (sub === null ? true : (x.entry.subcategory ?? "").trim().toLowerCase() === sub.toLowerCase()))
    .sort((a, b) => b.entry.entry_date.localeCompare(a.entry.entry_date));

  const isRecurring = frequency !== "einmalig";
  const amountNumber = parseAmount(amount);
  const monthlyShare = frequency === "jaehrlich" && amountNumber > 0 ? amountNumber / 12 : 0;

  function changeScope(s: BudgetScope) {
    setScope(s);
    setCatId(null);
    setSub(null);
    setNewSubOpen(false);
  }

  function pickCategory(id: string) {
    if (catId === id) {
      setCatId(null);
      setSub(null);
      return;
    }
    setCatId(id);
    setSub(null);
    setNewSubOpen(false);
    setError(null);
  }

  // Beim Wählen einer Kategorie ins Detail scrollen (Handy) und das Betragsfeld bereitmachen
  useEffect(() => {
    if (!catId) return;
    if (window.innerWidth < 1100) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 220);
    return () => window.clearTimeout(t);
  }, [catId]);

  function pickSub(name: string) {
    setSub(sub === name ? null : name);
    setNewSubOpen(false);
    window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 30);
  }

  function confirmNewSub() {
    const name = newSubText.trim().slice(0, 80);
    if (!name) return;
    setSub(name);
    setNewSubText("");
    setNewSubOpen(false);
    window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 30);
  }

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2600);
  }

  async function save() {
    setError(null);
    if (!catId) return setError("Bitte zuerst eine Kategorie wählen.");
    if (!(amountNumber > 0)) return setError("Bitte einen Betrag eingeben.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          category: catId,
          subcategory: sub ?? "",
          amount_chf: amountNumber,
          entry_date: date,
          label: desc,
          frequency,
          ends_on: isRecurring ? endsOn : "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg = data.error ?? "Speichern fehlgeschlagen.";
        throw new Error(/subcategory/i.test(msg) ? "Unterkategorien brauchen noch die Datenbank-Erweiterung: supabase/029_budget_subcategories.sql ausführen." : msg);
      }
      setAmount("");
      setDesc("");
      setEndsOn("");
      showToast(isRecurring ? "Gespeichert. Läuft jetzt in jedem Monat mit." : "Gespeichert.");
      router.refresh();
      window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 50);
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
    if (rows.length === 0) return showToast("Keine Buchungen in der Datei gefunden.");
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
      showToast(`${data.saved} Buchungen gespeichert.`);
      router.refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Fehler beim Import.");
    } finally {
      setBusy(false);
    }
  }

  const periodLabel = month === null ? `${year}` : `${MONTHS[month]} ${year}`;

  return (
    <div className="bt">
      {/* Steuerung: Jahr, Monat, Bereich */}
      <div className="bt-controls">
        <div className="bt-years" role="group" aria-label="Jahr">
          {years.map((y) => (
            <button key={y} type="button" className={`bt-year${y === year ? " is-on" : ""}`} aria-pressed={y === year} onClick={() => { setYear(y); setMonth(null); }}>
              <strong>{y}</strong>
              <span>{y === defaultYear ? "dieses Jahr" : y > defaultYear ? "Planung" : "Vorjahr"}</span>
            </button>
          ))}
        </div>
        <div className="bt-seg" role="tablist" aria-label="Bereich">
          <button type="button" role="tab" aria-selected={scope === "golf"} className={scope === "golf" ? "is-on" : ""} onClick={() => changeScope("golf")}>Golf</button>
          <button type="button" role="tab" aria-selected={scope === "privat"} className={scope === "privat" ? "is-on" : ""} onClick={() => changeScope("privat")}>Privat</button>
        </div>
      </div>

      <div className="bt-months" role="group" aria-label="Monat">
        <button type="button" className={month === null ? "is-on" : ""} aria-pressed={month === null} onClick={() => setMonth(null)}>Ganzes Jahr</button>
        {MONTHS.map((m, i) => (
          <button key={m} type="button" className={month === i ? "is-on" : ""} aria-pressed={month === i} onClick={() => setMonth(month === i ? null : i)} title={`CHF ${fmt(monthTotals[i])}`}>
            {m}
          </button>
        ))}
      </div>

      <div className="bt-grid">
        {/* Heatmap */}
        <section className="bt-card bt-map-card" aria-labelledby="bt-map-h">
          <div className="bt-card-head">
            <div>
              <h2 id="bt-map-h" className="bt-h2">Wohin das Geld geht</h2>
              <p className="bt-sub">Je grösser die Kachel, desto mehr Ausgaben. Kachel antippen, um Unterkategorien und Beträge zu erfassen.</p>
            </div>
            <span className="bt-pill">{periodLabel}</span>
          </div>

          <div ref={mapRef} className="bt-map" style={{ height: grand > 0 ? mapH : undefined }}>
            {rects.map((r, i) => {
              const c = r.item.data;
              const st = catStats[c.id];
              const share = Math.round((st.total / grand) * 100);
              const small = r.w < 150 || r.h < 96;
              const tiny = r.w < 92 || r.h < 62;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`bt-tile${catId === c.id ? " is-on" : ""}${small ? " is-small" : ""}${tiny ? " is-tiny" : ""}`}
                  style={{ left: r.x, top: r.y, width: r.w, height: r.h, "--c": categoryColor(c.id), "--i": i } as React.CSSProperties}
                  aria-pressed={catId === c.id}
                  aria-label={`${c.label}: CHF ${fmt(st.total)}, ${share} Prozent`}
                  title={`${c.label}: CHF ${fmt(st.total)}`}
                  onClick={() => pickCategory(c.id)}
                >
                  <span className="bt-tile-name">{c.label}</span>
                  <span className="bt-tile-amount">CHF {fmt(st.total)}</span>
                  <span className="bt-tile-meta">{share} % · {st.count} {st.count === 1 ? "Posten" : "Posten"}</span>
                </button>
              );
            })}
            {grand <= 0 ? (
              <div className="bt-map-empty">
                <strong>Noch keine Ausgaben in dieser Auswahl.</strong>
                <span>Wähle unten eine Kategorie und erfasse die erste Ausgabe.</span>
              </div>
            ) : null}
          </div>

          {empty.length > 0 ? (
            <div className="bt-empty-row">
              <span className="bt-empty-label">{grand > 0 ? "Noch leer" : "Kategorie wählen"}</span>
              <div className="bt-chips">
                {empty.map((c) => (
                  <button key={c.id} type="button" className={`bt-chip bt-chip--ghost${catId === c.id ? " is-on" : ""}`} style={{ "--c": categoryColor(c.id) } as React.CSSProperties} aria-pressed={catId === c.id} onClick={() => pickCategory(c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* Auswertungen */}
        <aside className="bt-side" aria-label="Auswertung">
          <section className="bt-card bt-kpi-main">
            <span className="bt-label">Ausgaben {periodLabel}</span>
            <strong className="bt-big"><CountUp value={shownTotal} format={chfCount} /></strong>
            {scope === "golf" ? (
              <span className={`bt-sub ${income - yearTotal >= 0 ? "is-good" : "is-bad"}`}>Ergebnis {year}: CHF {fmt(income - yearTotal)} bei Einnahmen von CHF {fmt(income)}</span>
            ) : (
              <span className="bt-sub">Ø pro Monat: CHF {fmt(yearTotal / 12)}</span>
            )}
          </section>

          <div className="bt-kpi-row">
            <section className="bt-card bt-kpi">
              <span className="bt-label">Fixkosten pro Monat</span>
              <strong className="bt-num"><CountUp value={fixedPerMonth} format={chfCount} /></strong>
              <span className="bt-sub">{recurring.length} Abos und Jahreskosten</span>
            </section>
            <section className="bt-card bt-kpi">
              <span className="bt-label">Grösster Posten</span>
              <strong className="bt-num bt-num--text">{biggest ? biggest.label : "–"}</strong>
              <span className="bt-sub">{biggest && grand > 0 ? `${Math.round((catStats[biggest.id].total / grand) * 100)} % der Ausgaben` : "Noch nichts erfasst"}</span>
            </section>
          </div>

          <section className="bt-card bt-flow" aria-labelledby="bt-flow-h">
            <h2 id="bt-flow-h" className="bt-h2">Verteilung</h2>
            {flow.length === 0 ? (
              <p className="bt-sub">Sobald Ausgaben erfasst sind, siehst du hier die Anteile.</p>
            ) : (
              <>
                <div className="bt-stack" role="img" aria-label="Anteile der Kategorien">
                  {flow.map((c) => (
                    <span key={c.id} style={{ flexGrow: catStats[c.id].total, background: categoryColor(c.id) }} title={`${c.label}: CHF ${fmt(catStats[c.id].total)}`} />
                  ))}
                </div>
                <ul className="bt-legend">
                  {flow.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <span className="bt-dot" style={{ background: categoryColor(c.id) }} />
                      <span className="bt-legend-name">{c.label}</span>
                      <span className="bt-legend-val">CHF {fmt(catStats[c.id].total)} · {Math.round((catStats[c.id].total / grand) * 100)} %</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </aside>

        {/* Detail der gewählten Kategorie */}
        <section ref={detailRef} className={`bt-card bt-detail${selCat ? " is-open" : ""}`} style={{ "--c": selCat ? categoryColor(selCat.id) : "#6b7077" } as React.CSSProperties} aria-labelledby="bt-detail-h">
          {!selCat ? (
            <div className="bt-detail-empty">
              <h2 id="bt-detail-h" className="bt-h2">Ausgabe erfassen</h2>
              <p className="bt-sub">Tippe oben auf eine Kachel. Dann wählst du eine Unterkategorie oder legst eine neue an, gibst Betrag und Beschreibung ein und speicherst mit Enter.</p>
            </div>
          ) : (
            <>
              <div className="bt-detail-head">
                <span className="bt-detail-dot" aria-hidden="true" />
                <div className="bt-detail-title">
                  <h2 id="bt-detail-h" className="bt-h2">{selCat.label}</h2>
                  <span className="bt-sub">CHF {fmt(catStats[selCat.id]?.total ?? 0)} in {periodLabel} · {catStats[selCat.id]?.count ?? 0} Posten</span>
                </div>
                <button type="button" className="bt-close" aria-label="Kategorie schliessen" onClick={() => pickCategory(selCat.id)}>×</button>
              </div>

              <div className="bt-field">
                <span className="bt-field-label">Unterkategorie</span>
                <div className="bt-chips">
                  {subGroups.map((g) => (
                    <button key={g.name || "_"} type="button" className={`bt-chip${sub !== null && sub.toLowerCase() === g.name.toLowerCase() ? " is-on" : ""}`} aria-pressed={sub !== null && sub.toLowerCase() === g.name.toLowerCase()} onClick={() => pickSub(g.name)}>
                      {g.name || "Allgemein"} <b>CHF {fmt(g.total)}</b>
                    </button>
                  ))}
                  {suggestions.map((s) => (
                    <button key={s} type="button" className={`bt-chip bt-chip--ghost${sub === s ? " is-on" : ""}`} aria-pressed={sub === s} onClick={() => pickSub(s)}>
                      + {s}
                    </button>
                  ))}
                  {customSub ? (
                    <button type="button" className="bt-chip is-on" aria-pressed="true" onClick={() => setSub(null)}>
                      {sub} <b>neu</b>
                    </button>
                  ) : null}
                  {newSubOpen ? (
                    <span className="bt-newsub">
                      <input
                        autoFocus
                        className="bt-input"
                        placeholder="Name der Unterkategorie"
                        value={newSubText}
                        onChange={(e) => setNewSubText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); confirmNewSub(); }
                          if (e.key === "Escape") setNewSubOpen(false);
                        }}
                        aria-label="Neue Unterkategorie"
                      />
                      <button type="button" className="bt-mini" onClick={confirmNewSub}>OK</button>
                    </span>
                  ) : (
                    <button type="button" className="bt-chip bt-chip--ghost" onClick={() => setNewSubOpen(true)}>+ eigene</button>
                  )}
                </div>
              </div>

              <div className="bt-form">
                <label className="bt-amount">
                  <span>CHF</span>
                  <input
                    ref={amountRef}
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void save(); } }}
                    aria-label="Betrag in CHF"
                  />
                </label>
                <label className="bt-field bt-field--grow">
                  <span className="bt-field-label">Beschreibung (optional)</span>
                  <input
                    className="bt-input"
                    placeholder={sub ? `z. B. ${sub}` : "z. B. Salt Abo, Flug nach Durban"}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void save(); } }}
                  />
                </label>
                <button type="button" className="bt-save" disabled={busy} onClick={() => void save()}>
                  {busy ? "Speichere…" : "Speichern"}
                </button>
              </div>

              <div className="bt-form-row">
                <div className="bt-freq" role="group" aria-label="Häufigkeit">
                  {FREQS.map((f) => (
                    <button key={f.id} type="button" className={frequency === f.id ? "is-on" : ""} aria-pressed={frequency === f.id} onClick={() => setFrequency(f.id)}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <label className="bt-date">
                  <span>{isRecurring ? "Ab" : "Datum"}</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                {isRecurring ? (
                  <label className="bt-date">
                    <span>Endet (optional)</span>
                    <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
                  </label>
                ) : null}
              </div>
              {monthlyShare > 0 ? <p className="bt-sub">Wird auf alle 12 Monate verteilt: CHF {fmt(monthlyShare)} pro Monat.</p> : null}
              {error ? <p className="bt-error" role="alert">{error}</p> : null}

              <div className="bt-list-head">
                <h3 className="bt-h3">Einträge{sub !== null ? ` · ${sub || "Allgemein"}` : ""}</h3>
                <span className="bt-pill">{listItems.length}</span>
              </div>
              {listItems.length === 0 ? (
                <p className="bt-sub">Noch nichts in dieser Auswahl.</p>
              ) : (
                <ul className="bt-list">
                  {listItems.map(({ entry: e, months }) => (
                    <li key={e.id} className="bt-item">
                      <span className="bt-item-main">
                        <strong>{e.label || (e.subcategory ? e.subcategory : selCat.label)}</strong>
                        <span>
                          {dmy(e.entry_date)}
                          {e.subcategory ? ` · ${e.subcategory}` : ""}
                          {e.frequency !== "einmalig" ? ` · ${e.frequency === "monatlich" ? "monatlich" : "jährlich, auf 12 Monate verteilt"}` : ""}
                          {e.ends_on ? ` · bis ${dmy(e.ends_on)}` : ""}
                        </span>
                      </span>
                      <span className="bt-item-amount">CHF {fmt(valueOf(months))}</span>
                      <button type="button" className="bt-close" aria-label="Löschen" onClick={() => void remove(e.id)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      {/* Bank-Import */}
      <details className="bt-card bt-import">
        <summary>Bank-Export importieren (CSV)</summary>
        <div className="bt-import-body">
          <p className="bt-sub">Lade den CSV-Export deiner Bank hoch. Du prüfst Bereich, Kategorie und Häufigkeit und speicherst alles gesammelt.</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
          {importRows.length > 0 ? (
            <>
              <ul className="bt-imp">
                {importRows.map((r, i) => (
                  <li key={i} className={`bt-imp-row${r.include ? "" : " is-off"}`}>
                    <input type="checkbox" checked={r.include} onChange={(e) => updateImport(i, { include: e.target.checked })} aria-label="Übernehmen" />
                    <span className="bt-imp-main"><strong>{r.label || "Buchung"}</strong><span>{dmy(r.date)} · CHF {fmt(r.amount)}</span></span>
                    <select className="bt-select" value={r.scope} aria-label="Bereich" onChange={(e) => updateImport(i, { scope: e.target.value as BudgetScope })}>
                      <option value="golf">Golf</option>
                      <option value="privat">Privat</option>
                    </select>
                    <select className="bt-select" value={r.category} aria-label="Kategorie" onChange={(e) => updateImport(i, { category: e.target.value })}>
                      {categoriesFor(r.scope).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <select className="bt-select" value={r.frequency} aria-label="Häufigkeit" onChange={(e) => updateImport(i, { frequency: e.target.value as BudgetFrequency })}>
                      {FREQS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
              <button type="button" className="bt-save" disabled={busy} onClick={() => void saveImport()}>
                {busy ? "Speichere…" : `${importRows.filter((r) => r.include).length} Buchungen speichern`}
              </button>
            </>
          ) : null}
        </div>
      </details>

      {toast ? <div className="bt-toast" role="status">{toast}</div> : null}
    </div>
  );
}
