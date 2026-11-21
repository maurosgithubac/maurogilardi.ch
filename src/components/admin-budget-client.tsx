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
import { squarify, type TreeRect } from "@/lib/treemap";

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
type SubGroup = { name: string; total: number; count: number };
type TileData = { key: string; label: string; total: number; color: string; onClick: () => void; selected: boolean };

const todayIso = () => new Date().toISOString().slice(0, 10);
const parseAmount = (s: string) => Number(String(s).replace(/[’'\s]/g, "").replace(",", "."));
const dmy = (iso: string) => iso.split("-").reverse().join(".");
const chfCount = (n: number) => `CHF ${fmt(n)}`;
const sharePct = (v: number, total: number) => {
  const p = total > 0 ? (v / total) * 100 : 0;
  return p > 0 && p < 1 ? "<1 %" : `${Math.round(p)} %`;
};

/** Exakte Pixelgrenzen: benachbarte Kacheln teilen sich dieselbe Kante, es entstehen keine Lücken oder Überlappungen. */
function geo(r: TreeRect<unknown>) {
  const left = Math.round(r.x);
  const top = Math.round(r.y);
  return { left, top, width: Math.round(r.x + r.w) - left, height: Math.round(r.y + r.h) - top };
}

/* ———————————————————————————————————————————————
 * Eingabeformular: Unterkategorie wählen, Betrag, Beschreibung, Häufigkeit.
 * Wird im Detail links und im Popup „Ausgabe erfassen“ verwendet.
 * ——————————————————————————————————————————————— */
function EntryForm({
  scope,
  catId,
  sub,
  onSub,
  groups,
  onSaved,
  autoFocus = true,
}: {
  scope: BudgetScope;
  catId: string;
  sub: string | null;
  onSub: (s: string | null) => void;
  groups: SubGroup[];
  onSaved: (message: string) => void;
  autoFocus?: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [frequency, setFrequency] = useState<BudgetFrequency>("einmalig");
  const [date, setDate] = useState(todayIso());
  const [endsOn, setEndsOn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);

  const color = categoryColor(catId);
  const suggestions = (SUBCATEGORY_SUGGESTIONS[catId] ?? []).filter((s) => !groups.some((g) => g.name.toLowerCase() === s.toLowerCase()));
  const customSub =
    sub && !groups.some((g) => g.name.toLowerCase() === sub.toLowerCase()) && !suggestions.some((s) => s.toLowerCase() === sub.toLowerCase());
  const isRecurring = frequency !== "einmalig";
  const amountNumber = parseAmount(amount);
  const monthlyShare = frequency === "jaehrlich" && amountNumber > 0 ? amountNumber / 12 : 0;

  useEffect(() => {
    if (!autoFocus) return;
    const t = window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 200);
    return () => window.clearTimeout(t);
  }, [catId, autoFocus]);

  function pick(name: string) {
    onSub(sub !== null && sub.toLowerCase() === name.toLowerCase() ? null : name);
    setNewOpen(false);
    window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 30);
  }

  function confirmNew() {
    const name = newText.trim().slice(0, 80);
    if (!name) return;
    onSub(name);
    setNewText("");
    setNewOpen(false);
    window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 30);
  }

  async function save() {
    setError(null);
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
      onSaved(isRecurring ? "Gespeichert. Läuft jetzt in jedem Monat mit." : "Gespeichert.");
      window.setTimeout(() => amountRef.current?.focus({ preventScroll: true }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bt-entry" style={{ "--c": color } as React.CSSProperties}>
      <div className="bt-field">
        <span className="bt-field-label">Unterkategorie</span>
        <div className="bt-chips">
          {groups.map((g) => {
            const on = sub !== null && sub.toLowerCase() === g.name.toLowerCase();
            return (
              <button key={g.name || "_"} type="button" className={`bt-chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => pick(g.name)}>
                {g.name || "Allgemein"} <b>CHF {fmt(g.total)}</b>
              </button>
            );
          })}
          {suggestions.map((s) => (
            <button key={s} type="button" className={`bt-chip bt-chip--ghost${sub === s ? " is-on" : ""}`} aria-pressed={sub === s} onClick={() => pick(s)}>
              + {s}
            </button>
          ))}
          {customSub ? (
            <button type="button" className="bt-chip is-on" aria-pressed="true" onClick={() => onSub(null)}>
              {sub} <b>neu</b>
            </button>
          ) : null}
          {newOpen ? (
            <span className="bt-newsub">
              <input
                autoFocus
                className="bt-input"
                placeholder="Name der Unterkategorie"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); confirmNew(); }
                  if (e.key === "Escape") { e.stopPropagation(); setNewOpen(false); }
                }}
                aria-label="Neue Unterkategorie"
              />
              <button type="button" className="bt-mini" onClick={confirmNew}>OK</button>
            </span>
          ) : (
            <button type="button" className="bt-chip bt-chip--ghost" onClick={() => setNewOpen(true)}>+ eigene</button>
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
    </div>
  );
}

/* ———————————————————————————————————————————————
 * Seite
 * ——————————————————————————————————————————————— */
export function AdminBudgetClient({ entries, incomeByYear, years, defaultYear }: Props) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [scope, setScope] = useState<BudgetScope>("golf");
  const [month, setMonth] = useState<number | null>(null);

  // Hineingezoomte Kategorie und gewählte Unterkategorie ("" = Allgemein, null = alle)
  const [catId, setCatId] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [zoomTick, setZoomTick] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  // Popup „Ausgabe erfassen“
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCat, setModalCat] = useState<string | null>(null);
  const [modalSub, setModalSub] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

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
  const flow = [...filled].sort((a, b) => catStats[b.id].total - catStats[a.id].total);

  const recurring = expanded.filter((x) => x.entry.frequency !== "einmalig" && x.months.some((v) => v > 0));
  const fixedPerMonth = recurring.reduce((s, x) => s + x.months.reduce((a, b) => a + b, 0) / 12, 0);
  const income = scope === "golf" ? incomeByYear[String(year)] ?? 0 : 0;
  const biggest = flow[0] ?? null;

  /** Unterkategorien einer Kategorie im gewählten Zeitraum */
  function subGroupsFor(id: string | null): SubGroup[] {
    if (!id) return [];
    const map = new Map<string, SubGroup>();
    for (const x of expanded) {
      if (x.entry.category !== id) continue;
      const v = valueOf(x.months);
      if (v <= 0) continue;
      const name = (x.entry.subcategory ?? "").trim();
      const g = map.get(name.toLowerCase()) ?? { name, total: 0, count: 0 };
      g.total += v;
      g.count += 1;
      map.set(name.toLowerCase(), g);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  const selCat = cats.find((c) => c.id === catId) ?? null;
  const subGroups = subGroupsFor(catId);
  const catTotal = catId ? catStats[catId]?.total ?? 0 : 0;
  const listItems = expanded
    .filter((x) => x.entry.category === catId && valueOf(x.months) > 0)
    .filter((x) => (sub === null ? true : (x.entry.subcategory ?? "").trim().toLowerCase() === sub.toLowerCase()))
    .sort((a, b) => b.entry.entry_date.localeCompare(a.entry.entry_date));

  // Karte: Kategorien oder (hineingezoomt) Unterkategorien
  const drill = Boolean(selCat);
  const mapH = drill
    ? Math.max(440, Math.round(Math.min(600, mapW * 0.85)))
    : mapW < 640
      ? Math.round(mapW * 1.05)
      : Math.round(Math.min(580, Math.max(360, mapW * 0.4)));

  const tileSource = drill
    ? subGroups.map((g, i) => {
        const shade = Math.max(60, 100 - i * 9);
        return {
          id: g.name || "_",
          value: g.total,
          data: {
            key: g.name || "_",
            label: g.name || "Allgemein",
            total: g.total,
            color: `color-mix(in srgb, ${categoryColor(catId ?? "")} ${shade}%, #fff)`,
            onClick: () => setSub(sub !== null && sub.toLowerCase() === g.name.toLowerCase() ? null : g.name),
            selected: sub !== null && sub.toLowerCase() === g.name.toLowerCase(),
          } as TileData,
        };
      })
    : filled.map((c) => ({
        id: c.id,
        value: catStats[c.id].total,
        data: {
          key: c.id,
          label: c.label,
          total: catStats[c.id].total,
          color: categoryColor(c.id),
          onClick: () => undefined,
          selected: false,
        } as TileData,
      }));

  const rects = mapW > 0 ? squarify(tileSource, mapW, mapH) : [];
  const mapTotal = tileSource.reduce((s, t) => s + t.value, 0);

  function changeScope(s: BudgetScope) {
    setScope(s);
    setCatId(null);
    setSub(null);
    setModalCat(null);
    setModalSub(null);
  }

  function zoomInto(id: string, rect?: ReturnType<typeof geo>) {
    if (rect && mapW > 0) setOrigin({ x: ((rect.left + rect.width / 2) / mapW) * 100, y: ((rect.top + rect.height / 2) / mapH) * 100 });
    else setOrigin({ x: 50, y: 50 });
    setCatId(id);
    setSub(null);
    setZoomTick((t) => t + 1);
    if (window.innerWidth < 1100) window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  function zoomOut() {
    setCatId(null);
    setSub(null);
    setZoomTick((t) => t + 1);
  }

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2600);
  }

  function onSaved(message: string) {
    showToast(message);
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Diesen Eintrag löschen?")) return;
    const res = await fetch(`/api/admin/budget/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  function openModal() {
    setModalCat(catId);
    setModalSub(catId ? sub : null);
    setModalOpen(true);
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
  const modalGroups = subGroupsFor(modalCat);

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

      {/* Bühne: Heatmap (rechts, wenn hineingezoomt) und Eingabe (links) */}
      <div className={`bt-stage${drill ? " is-drill" : ""}`}>
        <section className="bt-card bt-map-card" aria-labelledby="bt-map-h">
          <div className="bt-card-head">
            <div>
              <h2 id="bt-map-h" className="bt-h2">{selCat ? selCat.label : "Wohin das Geld geht"}</h2>
              <p className="bt-sub">{selCat ? `Unterkategorien · ${periodLabel}` : `Je grösser die Kachel, desto grösser der Anteil · ${periodLabel}`}</p>
            </div>
            {selCat ? (
              <button type="button" className="bt-back" onClick={zoomOut}>‹ Alle Kategorien</button>
            ) : null}
          </div>

          <div
            ref={mapRef}
            className={`bt-map${drill ? " is-drill" : ""} bt-zoom-${zoomTick % 2}`}
            style={{ height: mapTotal > 0 || mapW === 0 ? mapH : undefined, "--ox": `${origin.x}%`, "--oy": `${origin.y}%` } as React.CSSProperties}
          >
            {rects.map((r, i) => {
              const t = r.item.data as TileData;
              const g = geo(r);
              const showName = g.width >= 56 && g.height >= 34;
              const showAmount = g.width >= 92 && g.height >= 56;
              const showShare = g.width >= 110 && g.height >= 84;
              const share = sharePct(t.total, mapTotal);
              return (
                <button
                  key={`${drill ? "s" : "c"}-${t.key}`}
                  type="button"
                  className={`bt-tile${(drill ? t.selected : false) ? " is-on" : ""}`}
                  style={{ ...g, "--c": t.color, "--i": i } as React.CSSProperties}
                  aria-pressed={drill ? t.selected : undefined}
                  aria-label={`${t.label}: CHF ${fmt(t.total)}, ${share}`}
                  title={`${t.label}: CHF ${fmt(t.total)} (${share})`}
                  onClick={() => (drill ? t.onClick() : zoomInto(t.key, g))}
                >
                  {showName ? <span className="bt-tile-name">{t.label}</span> : null}
                  {showAmount ? <span className="bt-tile-amount">CHF {fmt(t.total)}</span> : null}
                  {showShare ? <span className="bt-tile-meta">{share}</span> : null}
                </button>
              );
            })}
            {mapTotal <= 0 && mapW > 0 ? (
              <div className="bt-map-empty">
                <strong>{drill ? "Noch keine Ausgaben in dieser Kategorie." : "Noch keine Ausgaben in dieser Auswahl."}</strong>
                <span>{drill ? "Links Unterkategorie wählen und den ersten Betrag eintragen." : "Mit „Ausgabe erfassen“ unten die erste Ausgabe eintragen."}</span>
              </div>
            ) : null}
          </div>

          {!drill && empty.length > 0 ? (
            <div className="bt-empty-row">
              <span className="bt-empty-label">{grand > 0 ? "Noch ohne Ausgaben" : "Kategorien"}</span>
              <div className="bt-chips">
                {empty.map((c) => (
                  <button key={c.id} type="button" className="bt-chip bt-chip--ghost" style={{ "--c": categoryColor(c.id) } as React.CSSProperties} onClick={() => zoomInto(c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {selCat ? (
          <section ref={detailRef} className="bt-card bt-detail" style={{ "--c": categoryColor(selCat.id) } as React.CSSProperties} aria-labelledby="bt-detail-h">
            <div className="bt-detail-head">
              <span className="bt-detail-dot" aria-hidden="true" />
              <div className="bt-detail-title">
                <h2 id="bt-detail-h" className="bt-h2">{selCat.label}</h2>
                <span className="bt-sub">CHF {fmt(catTotal)} · {periodLabel}</span>
              </div>
              <button type="button" className="bt-close" aria-label="Kategorie schliessen" onClick={zoomOut}>×</button>
            </div>

            <EntryForm key={selCat.id} scope={scope} catId={selCat.id} sub={sub} onSub={setSub} groups={subGroups} onSaved={onSaved} />

            <div className="bt-list-head">
              <h3 className="bt-h3">Verlauf{sub !== null ? ` · ${sub || "Allgemein"}` : ""}</h3>
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
          </section>
        ) : null}
      </div>

      {/* Zusammenfassung unterhalb */}
      <section className="bt-summary" aria-label="Zusammenfassung">
        <div className="bt-card bt-kpi-main">
          <span className="bt-label">Ausgaben {periodLabel}</span>
          <strong className="bt-big"><CountUp value={shownTotal} format={chfCount} /></strong>
          {scope === "golf" ? (
            <span className={`bt-sub ${income - yearTotal >= 0 ? "is-good" : "is-bad"}`}>Ergebnis {year}: CHF {fmt(income - yearTotal)} bei Einnahmen von CHF {fmt(income)}</span>
          ) : (
            <span className="bt-sub">Ø pro Monat: CHF {fmt(yearTotal / 12)}</span>
          )}
        </div>

        <div className="bt-card bt-kpi">
          <span className="bt-label">Fixkosten pro Monat</span>
          <strong className="bt-num"><CountUp value={fixedPerMonth} format={chfCount} /></strong>
          <span className="bt-sub">{recurring.length} Abos und Jahreskosten</span>
        </div>

        <div className="bt-card bt-kpi">
          <span className="bt-label">Grösster Posten</span>
          <strong className="bt-num bt-num--text">{biggest ? biggest.label : "–"}</strong>
          <span className="bt-sub">{biggest && grand > 0 ? `${sharePct(catStats[biggest.id].total, grand)} der Ausgaben` : "Noch nichts erfasst"}</span>
        </div>

        <div className="bt-card bt-flow">
          <h2 className="bt-h2">Verteilung</h2>
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
                    <span className="bt-legend-val">CHF {fmt(catStats[c.id].total)} · {sharePct(catStats[c.id].total, grand)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

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

      {/* Hauptfunktion: immer erreichbar */}
      <button type="button" className="bt-fab" onClick={openModal}>
        <span aria-hidden="true">+</span> Ausgabe erfassen
      </button>

      {toast ? <div className="bt-toast" role="status">{toast}</div> : null}

      {/* Popup: Ausgabe erfassen */}
      {modalOpen ? (
        <div className="bt-overlay" onClick={() => setModalOpen(false)}>
          <div className="bt-modal" role="dialog" aria-modal="true" aria-label="Ausgabe erfassen" onClick={(e) => e.stopPropagation()}>
            <div className="bt-modal-head">
              <div>
                <h2 className="bt-h2">Ausgabe erfassen</h2>
                <p className="bt-sub">{scope === "golf" ? "Golf" : "Privat"} · Kategorie wählen, Betrag eintragen, Enter speichert.</p>
              </div>
              <button type="button" className="bt-close" aria-label="Schliessen" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="bt-field">
              <span className="bt-field-label">Kategorie</span>
              <div className="bt-pickgrid" role="group" aria-label="Kategorie">
                {cats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`bt-pick${modalCat === c.id ? " is-on" : ""}`}
                    style={{ "--c": categoryColor(c.id) } as React.CSSProperties}
                    aria-pressed={modalCat === c.id}
                    onClick={() => { setModalCat(c.id); setModalSub(null); }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {modalCat ? (
              <EntryForm key={modalCat} scope={scope} catId={modalCat} sub={modalSub} onSub={setModalSub} groups={modalGroups} onSaved={onSaved} />
            ) : (
              <p className="bt-sub">Wähle zuerst eine Kategorie.</p>
            )}

            <button type="button" className="bt-done" onClick={() => setModalOpen(false)}>Fertig</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
