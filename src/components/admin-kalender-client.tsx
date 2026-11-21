"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { KalenderEventRow, KalenderKind } from "@/lib/kalender-events";
import { CountUp } from "@/components/admin/ui/count-up";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { IconPlus } from "@/components/admin/admin-icons";

type Form = {
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  country: string;
  kind: KalenderKind;
  info_url: string;
  lat: string;
  lon: string;
};

const EMPTY: Form = {
  name: "",
  start_date: "",
  end_date: "",
  location: "",
  country: "",
  kind: "turnier",
  info_url: "",
  lat: "",
  lon: "",
};

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Filter = "all" | "upcoming" | "past";
type Phase = "live" | "next" | "soon" | "past";

function toForm(row: KalenderEventRow): Form {
  return {
    name: row.name,
    start_date: row.start_date,
    end_date: row.end_date,
    location: row.location,
    country: row.country,
    kind: row.kind,
    info_url: row.info_url ?? "",
    lat: row.lat != null ? String(row.lat) : "",
    lon: row.lon != null ? String(row.lon) : "",
  };
}

function dateCh(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function dayDiff(fromIso: string, toIso: string) {
  const a = parts(fromIso);
  const b = parts(toIso);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
}

function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function dayBlock(row: KalenderEventRow) {
  const s = parts(row.start_date);
  const e = parts(row.end_date);
  if (row.start_date === row.end_date) return { big: String(s.d), small: MONTHS_SHORT[s.m - 1] };
  if (s.m === e.m && s.y === e.y) return { big: `${s.d}–${e.d}`, small: MONTHS_SHORT[s.m - 1] };
  return { big: `${s.d}.${s.m}.`, small: `bis ${e.d}.${e.m}.` };
}

function rangeLabel(row: KalenderEventRow) {
  return row.start_date === row.end_date
    ? dateCh(row.start_date)
    : `${dateCh(row.start_date)} – ${dateCh(row.end_date)}`;
}

export function AdminKalenderClient({ initial, missing = false }: { initial: KalenderEventRow[]; missing?: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [showCoords, setShowCoords] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const t = todayIso();
    setToday(t);
    if (initial.some((r) => r.end_date >= t)) setFilter("upcoming");
    // nur beim ersten Anzeigen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(
    () => [...initial].sort((a, b) => a.start_date.localeCompare(b.start_date) || a.name.localeCompare(b.name, "de-CH")),
    [initial],
  );

  const nextId = useMemo(() => {
    if (!today) return null;
    return rows.find((r) => r.end_date >= today && r.start_date > today)?.id ?? null;
  }, [rows, today]);

  function phaseOf(row: KalenderEventRow): Phase | null {
    if (!today) return null;
    if (row.end_date < today) return "past";
    if (row.start_date <= today) return "live";
    return row.id === nextId ? "next" : "soon";
  }

  const stats = useMemo(() => {
    const upcoming = today ? rows.filter((r) => r.end_date >= today) : rows;
    const countries = new Set(rows.map((r) => r.country.trim()).filter(Boolean));
    const nextRow = rows.find((r) => r.id === nextId);
    return {
      total: rows.length,
      upcoming: upcoming.length,
      turniere: rows.filter((r) => r.kind === "turnier").length,
      camps: rows.filter((r) => r.kind === "camp").length,
      countries: countries.size,
      noCoords: rows.filter((r) => r.lat == null || r.lon == null).length,
      nextRow,
      nextIn: nextRow && today ? dayDiff(today, nextRow.start_date) : null,
    };
  }, [rows, today, nextId]);

  const visible = useMemo(() => {
    if (!today || filter === "all") return rows;
    return filter === "upcoming" ? rows.filter((r) => r.end_date >= today) : rows.filter((r) => r.end_date < today).reverse();
  }, [rows, today, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, KalenderEventRow[]>();
    for (const r of visible) {
      const key = r.start_date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()].map(([key, list]) => {
      const [y, m] = key.split("-").map(Number);
      return { key, label: `${MONTHS[m - 1]} ${y}`, list };
    });
  }, [visible]);

  function openNew() {
    if (formOpen && !editingId) {
      setFormOpen(false);
      return;
    }
    reset();
    setFormOpen(true);
    setMessage(null);
  }

  function startEdit(row: KalenderEventRow) {
    setEditingId(row.id);
    setForm(toForm(row));
    setShowCoords(row.lat != null);
    setMessage(null);
    setFormOpen(true);
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      formRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    }, 30);
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
    setShowCoords(false);
  }

  function closeForm() {
    reset();
    setFormOpen(false);
  }

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(editingId ? `/api/admin/kalender/${editingId}` : "/api/admin/kalender", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; geocoded?: boolean };
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error || "Speichern fehlgeschlagen." });
        return;
      }
      setMessage({
        kind: "ok",
        text: data.geocoded === false
          ? "Gespeichert. Der Ort wurde nicht gefunden: bitte Koordinaten eintragen, damit er auf der Karte erscheint."
          : "Gespeichert. Die Seite /kalender ist aktualisiert.",
      });
      reset();
      setFormOpen(false);
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: "Verbindung fehlgeschlagen." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: KalenderEventRow) {
    if (!window.confirm(`„${row.name}“ wirklich löschen? Das lässt sich nicht rückgängig machen.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/kalender/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage({ kind: "error", text: data.error || "Löschen fehlgeschlagen." });
        return;
      }
      if (editingId === row.id) closeForm();
      setMessage({ kind: "ok", text: "Gelöscht." });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "upcoming", label: "Kommend", count: today ? rows.filter((r) => r.end_date >= today).length : 0 },
    { id: "past", label: "Vergangen", count: today ? rows.filter((r) => r.end_date < today).length : 0 },
    { id: "all", label: "Alle", count: rows.length },
  ];

  return (
    <div className="ap-page ev-page">
      <AdminPageHeader
        eyebrow="Kalender"
        title="Turniere und Termine"
        description="Hier pflegst du die Turniere der Saison. Die Seite /kalender und die Karte aktualisieren sich automatisch."
        actions={
          <button
            type="button"
            className={`ap-btn ${formOpen && !editingId ? "ap-btn--secondary" : "ap-btn--primary"}`}
            aria-expanded={formOpen && !editingId}
            aria-controls="ev-form"
            onClick={openNew}
          >
            {formOpen && !editingId ? null : <IconPlus />}
            {formOpen && !editingId ? "Schliessen" : "Termin hinzufügen"}
          </button>
        }
      />

      {missing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Die Tabelle fehlt noch. In Supabase ausführen: <code>supabase/025_kalender_events.sql</code>
        </p>
      ) : null}
      {message && !formOpen ? (
        <p className={`ap-banner ${message.kind === "error" ? "ap-banner--error" : "ap-banner--ok"}`} role="status">
          {message.text}
        </p>
      ) : null}

      <div className="ev-stats ap-stagger">
        <article className="ev-card ev-next" style={{ "--i": 0 } as React.CSSProperties}>
          <p className="ev-card-label">Als Nächstes</p>
          {stats.nextRow ? (
            <>
              <p className="ev-next-name">{stats.nextRow.name}</p>
              <p className="ev-next-meta">
                {rangeLabel(stats.nextRow)}
                <br />
                {stats.nextRow.location}
                {stats.nextRow.country ? `, ${stats.nextRow.country}` : ""}
              </p>
              {stats.nextIn != null ? (
                <span className="ev-next-pill">
                  {stats.nextIn === 1 ? "Morgen" : `In ${stats.nextIn} Tagen`}
                </span>
              ) : null}
            </>
          ) : (
            <p className="ev-next-meta">{today ? "Kein kommender Termin eingetragen." : " "}</p>
          )}
        </article>

        <article className="ev-card ev-stat" style={{ "--i": 1 } as React.CSSProperties}>
          <p className="ev-card-label">Termine in der Saison</p>
          <p className="ev-big">
            <CountUp value={stats.total} />
          </p>
          <p className="ev-stat-sub">{stats.upcoming} noch offen</p>
        </article>
        <article className="ev-card ev-stat" style={{ "--i": 2 } as React.CSSProperties}>
          <p className="ev-card-label">Turniere und Camps</p>
          <p className="ev-big">
            <CountUp value={stats.turniere} />
            <span className="ev-big-sep">/</span>
            <CountUp value={stats.camps} />
          </p>
          <p className="ev-stat-sub">Turniere / Trainingscamps</p>
        </article>
        <article className="ev-card ev-stat" style={{ "--i": 3 } as React.CSSProperties}>
          <p className="ev-card-label">Länder</p>
          <p className="ev-big">
            <CountUp value={stats.countries} />
          </p>
          <p className="ev-stat-sub">
            {stats.noCoords > 0 ? `${stats.noCoords} ohne Kartenposition` : "Alle auf der Karte"}
          </p>
        </article>
      </div>

      <div className={`ev-layout${formOpen ? " has-form" : ""}`}>
        <div className="ev-main">
          <div className="ev-toolbar">
            <div className="ap-segment" role="group" aria-label="Termine filtern">
              {filters.map((f) => (
                <button key={f.id} type="button" className="ap-segment-btn" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label}
                  <span className="ap-segment-count">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="ev-card ap-empty">
              <p className="ap-empty-title">Noch keine Termine</p>
              <p className="ap-empty-text">Lege den ersten Termin der Saison an. Er erscheint danach auf der Seite /kalender.</p>
              <button type="button" className="ap-btn ap-btn--primary" onClick={openNew}>
                <IconPlus /> Termin hinzufügen
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="ev-card ap-empty">
              <p className="ap-empty-title">{filter === "upcoming" ? "Keine kommenden Termine" : "Keine vergangenen Termine"}</p>
              <p className="ap-empty-text">Wechsle den Filter, um alle Termine zu sehen.</p>
            </div>
          ) : (
            groups.map((group, gi) => (
              <section key={group.key} className="ev-month" aria-label={group.label} style={{ "--i": gi } as React.CSSProperties}>
                <h2 className="ev-month-title">
                  {group.label}
                  <span className="ev-month-count">{group.list.length}</span>
                </h2>
                <ul className="ev-list">
                  {group.list.map((row) => {
                    const phase = phaseOf(row);
                    const block = dayBlock(row);
                    const noCoords = row.lat == null || row.lon == null;
                    return (
                      <li
                        key={row.id}
                        className={`ev-row${editingId === row.id ? " is-editing" : ""}${phase === "past" ? " is-past" : ""}${phase === "live" ? " is-live" : ""}`}
                      >
                        <div className="ev-date" aria-hidden="true">
                          <span className="ev-date-big">{block.big}</span>
                          <span className="ev-date-small">{block.small}</span>
                        </div>
                        <div className="ev-body">
                          <div className="ev-title-line">
                            <strong className="ev-name">{row.name}</strong>
                            <span className={`ev-kind ev-kind--${row.kind}`}>{row.kind === "camp" ? "Camp" : "Turnier"}</span>
                            {phase === "live" ? <span className="ap-pill ap-pill--red">Läuft</span> : null}
                            {phase === "next" ? <span className="ap-pill ap-pill--ink">Als Nächstes</span> : null}
                            {phase === "past" ? <span className="ap-pill ap-pill--muted">Vorbei</span> : null}
                          </div>
                          <p className="ev-meta">
                            <span className="ev-meta-date">{rangeLabel(row)}</span>
                            <span>
                              {row.location}
                              {row.country ? `, ${row.country}` : ""}
                            </span>
                          </p>
                          {noCoords ? <p className="ev-warn">Ohne Koordinaten: erscheint nicht auf der Karte</p> : null}
                        </div>
                        <div className="ev-actions">
                          {row.info_url ? (
                            <a className="ap-btn ap-btn--ghost ap-btn--sm" href={row.info_url} target="_blank" rel="noopener noreferrer">
                              Turnierseite
                            </a>
                          ) : null}
                          <button type="button" className="ap-btn ap-btn--secondary ap-btn--sm" onClick={() => startEdit(row)} disabled={busy}>
                            Bearbeiten
                          </button>
                          <button type="button" className="ap-btn ap-btn--danger-ghost ap-btn--sm" onClick={() => void remove(row)} disabled={busy}>
                            Löschen
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        {formOpen ? (
          <form id="ev-form" ref={formRef} className="ev-card ev-form" onSubmit={onSubmit}>
            <div className="ev-form-head">
              <h2 className="ev-form-title">{editingId ? "Termin bearbeiten" : "Neuer Termin"}</h2>
              <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" onClick={closeForm}>
                Abbrechen
              </button>
            </div>

            <div className="ev-fields">
              <label className="ap-field ev-span-2">
                <span className="ap-label">Turnier- oder Camp-Name</span>
                <input className="ap-input" required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </label>
              <label className="ap-field">
                <span className="ap-label">Von</span>
                <input className="ap-input" type="date" required value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
              </label>
              <label className="ap-field">
                <span className="ap-label">Bis</span>
                <input className="ap-input" type="date" required value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
              </label>
              <label className="ap-field ev-span-2">
                <span className="ap-label">Ort</span>
                <input className="ap-input" required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="z. B. Royal Cape Golf Club, Kapstadt" />
              </label>
              <label className="ap-field">
                <span className="ap-label">Land</span>
                <input className="ap-input" value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="z. B. Südafrika" />
              </label>
              <label className="ap-field">
                <span className="ap-label">Art</span>
                <select className="ap-select" value={form.kind} onChange={(e) => set("kind", e.target.value as KalenderKind)}>
                  <option value="turnier">Turnier</option>
                  <option value="camp">Trainingscamp</option>
                </select>
              </label>
              <label className="ap-field ev-span-2">
                <span className="ap-label">Link zur Turnierseite (optional)</span>
                <input className="ap-input" type="url" value={form.info_url} onChange={(e) => set("info_url", e.target.value)} placeholder="https://…" />
              </label>
            </div>

            <details className="ev-coords" open={showCoords} onToggle={(e) => setShowCoords((e.target as HTMLDetailsElement).open)}>
              <summary>Koordinaten für die Karte</summary>
              <div className="ev-fields">
                <label className="ap-field">
                  <span className="ap-label">Breitengrad</span>
                  <input className="ap-input" inputMode="decimal" value={form.lat} onChange={(e) => set("lat", e.target.value)} />
                </label>
                <label className="ap-field">
                  <span className="ap-label">Längengrad</span>
                  <input className="ap-input" inputMode="decimal" value={form.lon} onChange={(e) => set("lon", e.target.value)} />
                </label>
              </div>
              <p className="ap-hint">Leer lassen: Der Ort wird beim Speichern automatisch gesucht.</p>
            </details>

            {message ? (
              <p className={`ap-banner ${message.kind === "error" ? "ap-banner--error" : "ap-banner--ok"}`} role="status">
                {message.text}
              </p>
            ) : null}

            <div className="ev-form-foot">
              <button type="submit" className={`ap-btn ap-btn--primary${busy ? " is-loading" : ""}`} disabled={busy}>
                {busy ? "Speichere…" : editingId ? "Änderungen speichern" : "Termin hinzufügen"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
