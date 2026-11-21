"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { KalenderEventRow, KalenderKind } from "@/lib/kalender-events";

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

function rangeLabel(row: KalenderEventRow) {
  return row.start_date === row.end_date
    ? dateCh(row.start_date)
    : `${dateCh(row.start_date)} – ${dateCh(row.end_date)}`;
}

export function AdminKalenderClient({ initial }: { initial: KalenderEventRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [showCoords, setShowCoords] = useState(false);

  function startEdit(row: KalenderEventRow) {
    setEditingId(row.id);
    setForm(toForm(row));
    setShowCoords(row.lat != null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
    setShowCoords(false);
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
      if (editingId === row.id) reset();
      setMessage({ kind: "ok", text: "Gelöscht." });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ap-kal">
      <form className="ap-card ap-kal-form" onSubmit={onSubmit}>
        <div className="ap-card-head">
          <h2 className="ap-h2">{editingId ? "Termin bearbeiten" : "Neuer Termin"}</h2>
          {editingId ? (
            <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" onClick={reset}>
              Abbrechen
            </button>
          ) : null}
        </div>

        <div className="ap-form-grid">
          <label className="ap-field ap-field--wide">
            <span>Turnier- oder Camp-Name</span>
            <input className="ap-input" required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="ap-field">
            <span>Von</span>
            <input className="ap-input" type="date" required value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </label>
          <label className="ap-field">
            <span>Bis</span>
            <input className="ap-input" type="date" required value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </label>
          <label className="ap-field">
            <span>Ort</span>
            <input className="ap-input" required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="z. B. Royal Cape Golf Club, Kapstadt" />
          </label>
          <label className="ap-field">
            <span>Land</span>
            <input className="ap-input" value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="z. B. Südafrika" />
          </label>
          <label className="ap-field">
            <span>Art</span>
            <select className="ap-select" value={form.kind} onChange={(e) => set("kind", e.target.value as KalenderKind)}>
              <option value="turnier">Turnier</option>
              <option value="camp">Trainingscamp</option>
            </select>
          </label>
          <label className="ap-field ap-field--wide">
            <span>Link zur Turnierseite (optional)</span>
            <input className="ap-input" type="url" value={form.info_url} onChange={(e) => set("info_url", e.target.value)} placeholder="https://…" />
          </label>
        </div>

        <details className="ap-kal-coords" open={showCoords} onToggle={(e) => setShowCoords((e.target as HTMLDetailsElement).open)}>
          <summary>Koordinaten für die Karte (automatisch, nur bei Bedarf anpassen)</summary>
          <div className="ap-form-grid">
            <label className="ap-field">
              <span>Breitengrad</span>
              <input className="ap-input" inputMode="decimal" value={form.lat} onChange={(e) => set("lat", e.target.value)} />
            </label>
            <label className="ap-field">
              <span>Längengrad</span>
              <input className="ap-input" inputMode="decimal" value={form.lon} onChange={(e) => set("lon", e.target.value)} />
            </label>
          </div>
          <p className="ap-kal-hint">Leer lassen: Der Ort wird beim Speichern automatisch gesucht.</p>
        </details>

        {message ? (
          <p className={`ap-banner ${message.kind === "error" ? "ap-banner--warn" : ""}`} role="status">
            {message.text}
          </p>
        ) : null}

        <div className="ap-form-actions">
          <button type="submit" className="ap-btn ap-btn--primary" disabled={busy}>
            {busy ? "Speichere…" : editingId ? "Änderungen speichern" : "Termin hinzufügen"}
          </button>
        </div>
      </form>

      <section className="ap-card" aria-labelledby="kal-list">
        <div className="ap-card-head">
          <h2 id="kal-list" className="ap-h2">Alle Termine</h2>
          <span className="ap-count">{initial.length}</span>
        </div>
        {initial.length === 0 ? (
          <p className="ap-empty-inline">Noch keine Termine. Oben den ersten Termin anlegen.</p>
        ) : (
          <ul className="ap-kal-list">
            {initial.map((row) => (
              <li key={row.id} className={`ap-kal-item${editingId === row.id ? " is-editing" : ""}`}>
                <div className="ap-kal-main">
                  <span className={`ap-kal-kind ap-kal-kind--${row.kind}`}>{row.kind === "camp" ? "Camp" : "Turnier"}</span>
                  <strong className="ap-kal-name">{row.name}</strong>
                  <span className="ap-kal-meta">
                    {rangeLabel(row)} · {row.location}
                    {row.country ? `, ${row.country}` : ""}
                  </span>
                  {row.lat == null || row.lon == null ? (
                    <span className="ap-kal-warn">Ohne Koordinaten: erscheint nicht auf der Karte</span>
                  ) : null}
                </div>
                <div className="ap-kal-actions">
                  <button type="button" className="ap-btn ap-btn--secondary ap-btn--sm" onClick={() => startEdit(row)} disabled={busy}>
                    Bearbeiten
                  </button>
                  <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" onClick={() => void remove(row)} disabled={busy}>
                    Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
