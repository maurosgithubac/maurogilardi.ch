"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  GOENNER_SPONSORING_MIN_CHF,
  inquiryTierShort,
  isLiteContactMembership,
  membershipPriceChf,
} from "@/content/goennerMemberships";
import type { GoennerInquiryRow, GoennerInquiryStatus } from "@/types/content";

function chfFmt(n: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);
}

function statusOf(row: GoennerInquiryRow): GoennerInquiryStatus {
  if (row.status === "completed" || row.status === "exited") return row.status;
  return "open";
}

function commentPreview(row: GoennerInquiryRow) {
  const admin = row.admin_note?.trim();
  const msg = row.message?.trim();
  if (admin && msg) return `${admin}\n\n— Formular —\n${msg}`;
  return admin || msg || "Kein Kommentar";
}

function displayName(name: string, max = 16) {
  const trimmed = name.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Filter = "all" | "open" | "paid" | "exited" | "hundert";

type Draft = {
  email: string;
  phone: string;
  amount: string;
  status: GoennerInquiryStatus;
  created: string;
};

function draftFrom(row: GoennerInquiryRow): Draft {
  const amount =
    row.amount_chf != null && row.amount_chf !== undefined
      ? String(row.amount_chf)
      : String(membershipPriceChf(row.membership_id) || "");
  return {
    email: row.email,
    phone: row.phone || "",
    amount,
    status: statusOf(row),
    created: toDateInput(row.created_at),
  };
}

export function AdminGoennerInquiriesClient({ rows }: { rows: GoennerInquiryRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formWarning, setFormWarning] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, draftFrom(r)])),
  );
  const [noteOpenId, setNoteOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const notePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(rows.map((r) => [r.id, draftFrom(r)])));
  }, [rows]);

  useEffect(() => {
    if (!noteOpenId) return;
    function onDoc(e: MouseEvent) {
      if (notePanelRef.current && !notePanelRef.current.contains(e.target as Node)) {
        setNoteOpenId(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [noteOpenId]);

  const openRows = rows.filter((r) => statusOf(r) === "open");
  const paidRows = rows.filter((r) => statusOf(r) === "completed");
  const exitedRows = rows.filter((r) => statusOf(r) === "exited");
  const hundertOpen = openRows.filter((r) => isLiteContactMembership(r.membership_id)).length;
  const totalChf = paidRows.reduce((s, r) => s + (Number(r.amount_chf) || 0), 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        const st = statusOf(row);
        if (filter === "open") return st === "open";
        if (filter === "paid") return st === "completed";
        if (filter === "exited") return st === "exited";
        if (filter === "hundert") return isLiteContactMembership(row.membership_id);
        return true;
      })
      .filter((row) => {
        if (!q) return true;
        const hay = [row.name, row.email, row.phone || "", inquiryTierShort(row.membership_id), row.message || "", row.admin_note || ""]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const order = { open: 0, completed: 1, exited: 2 } as const;
        const diff = order[statusOf(a)] - order[statusOf(b)];
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [rows, filter, query]);

  function setDraft(id: string, partial: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  }

  function isDirty(row: GoennerInquiryRow) {
    const d = drafts[row.id];
    if (!d) return false;
    const base = draftFrom(row);
    return (
      d.email !== base.email ||
      d.phone !== base.phone ||
      d.amount !== base.amount ||
      d.status !== base.status ||
      d.created !== base.created
    );
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setFormError(null);
    setFormWarning(null);
    try {
      const res = await fetch(`/api/admin/goenner-inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Aktion fehlgeschlagen.");
        return false;
      }
      if (data.warning) setFormWarning(data.warning);
      startTransition(() => router.refresh());
      return true;
    } finally {
      setBusyId(null);
    }
  }

  async function saveRow(row: GoennerInquiryRow) {
    const d = drafts[row.id];
    if (!d) return;
    const n = parseFloat(d.amount.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      setFormError("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    if (row.membership_id === "sponsoring" && d.status === "completed" && n < GOENNER_SPONSORING_MIN_CHF) {
      setFormError(`Sponsoring: Betrag muss ≥ ${GOENNER_SPONSORING_MIN_CHF.toLocaleString("de-CH")} CHF sein.`);
      return;
    }
    if (!d.email.trim().includes("@")) {
      setFormError("Gültige E-Mail erforderlich.");
      return;
    }
    if (!d.created) {
      setFormError("Eingangsdatum fehlt.");
      return;
    }

    await patch(row.id, {
      email: d.email.trim(),
      phone: d.phone.trim() || null,
      amount_chf: n,
      status: d.status,
      created_at: d.created,
      clear_amount: d.status === "open" ? false : undefined,
    });
  }

  function openNote(row: GoennerInquiryRow) {
    setNoteOpenId(row.id);
    setNoteDraft(row.admin_note || "");
  }

  async function saveNote(row: GoennerInquiryRow) {
    const ok = await patch(row.id, { admin_note: noteDraft.trim() || null });
    if (ok) setNoteOpenId(null);
  }

  async function deleteRow(row: GoennerInquiryRow) {
    const okConfirm = window.confirm(
      `Anfrage von «${row.name}» wirklich löschen?\n\nDieser Schritt kann nicht rückgängig gemacht werden.`,
    );
    if (!okConfirm) return;

    setBusyId(row.id);
    setFormError(null);
    setFormWarning(null);
    try {
      const res = await fetch(`/api/admin/goenner-inquiries/${row.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Löschen fehlgeschlagen.");
        return;
      }
      if (noteOpenId === row.id) setNoteOpenId(null);
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="mgf-kpi-grid">
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Offen</span>
          <strong>{openRows.length}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">100er offen</span>
          <strong>{hundertOpen}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Bezahlt</span>
          <strong>{paidRows.length}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Ausgetreten</span>
          <strong>{exitedRows.length}</strong>
        </div>
        <div className="mgf-kpi mgf-kpi--accent">
          <span className="mgf-kpi-label">Summe bezahlt</span>
          <strong>{chfFmt(totalChf)}</strong>
        </div>
      </div>

      <div className="mgf-inbox-toolbar">
        <div className="mgf-inbox-filters" role="group" aria-label="Liste filtern">
          {(
            [
              ["open", "Offen"],
              ["paid", "Bezahlt"],
              ["exited", "Ausgetreten"],
              ["hundert", "100er"],
              ["all", "Alle"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`mgf-inbox-filter${filter === id ? " is-active" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="mgf-inbox-search">
          <span className="sr-only">Suchen</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, E-Mail, Telefon…"
          />
        </label>
      </div>

      {formError ? <p className="mgf-banner mgf-banner--warn">{formError}</p> : null}
      {formWarning ? <p className="mgf-banner">{formWarning}</p> : null}

      {visible.length === 0 ? (
        <p className="mgf-muted">Keine Einträge in diesem Filter.</p>
      ) : (
        <div className="mgf-table-wrap mgf-inbox-wrap">
          <table className="mgf-table mgf-inbox-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Stufe</th>
                <th scope="col">E-Mail</th>
                <th scope="col">Telefon</th>
                <th scope="col">Betrag</th>
                <th scope="col">Status</th>
                <th scope="col">Eingang</th>
                <th scope="col">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const busy = busyId === row.id;
                const d = drafts[row.id] ?? draftFrom(row);
                const st = d.status;
                const isHundert = isLiteContactMembership(row.membership_id);
                const dirty = isDirty(row);
                const tip = commentPreview(row);
                const hasComment = Boolean(row.message?.trim() || row.admin_note?.trim());

                return (
                  <tr
                    key={row.id}
                    className={[
                      "mgf-inbox-row",
                      `mgf-inbox-row--${st}`,
                      isHundert ? "mgf-inbox-row--hundert" : "",
                      dirty ? "is-dirty" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <td className="mgf-inbox-name-cell">
                      <button
                        type="button"
                        className={`mgf-inbox-name${hasComment ? " has-note" : ""}`}
                        title={`${row.name}\n\n${tip}`}
                        aria-label={row.name}
                        aria-expanded={noteOpenId === row.id}
                        onClick={() => openNote(row)}
                      >
                        {displayName(row.name)}
                      </button>
                      {noteOpenId === row.id ? (
                        <div className="mgf-inbox-note-pop" ref={notePanelRef} role="dialog" aria-label="Kommentar">
                          {row.message?.trim() ? (
                            <div className="mgf-inbox-note-block">
                              <span className="mgf-inbox-note-label">Formular</span>
                              <p>{row.message.trim()}</p>
                            </div>
                          ) : (
                            <p className="mgf-muted">Kein Formular-Kommentar.</p>
                          )}
                          <label className="mgf-inbox-note-edit">
                            <span className="mgf-inbox-note-label">Dein Kommentar</span>
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              rows={3}
                              disabled={busy}
                              placeholder="Interner Vermerk…"
                            />
                          </label>
                          <div className="mgf-inbox-note-actions">
                            <button
                              type="button"
                              className="mgf-btn mgf-btn--primary mgf-btn--sm"
                              disabled={busy}
                              onClick={() => void saveNote(row)}
                            >
                              Speichern
                            </button>
                            <button
                              type="button"
                              className="mgf-btn mgf-btn--ghost mgf-btn--sm"
                              disabled={busy}
                              onClick={() => setNoteOpenId(null)}
                            >
                              Schliessen
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className={`mgf-tier-chip mgf-tier-chip--${row.membership_id}`}>
                        {inquiryTierShort(row.membership_id)}
                      </span>
                    </td>
                    <td>
                      <input
                        className="mgf-inbox-input"
                        type="email"
                        value={d.email}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { email: e.target.value })}
                        aria-label={`E-Mail ${row.name}`}
                      />
                    </td>
                    <td>
                      <input
                        className="mgf-inbox-input"
                        type="tel"
                        value={d.phone}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { phone: e.target.value })}
                        aria-label={`Telefon ${row.name}`}
                        placeholder="—"
                      />
                    </td>
                    <td>
                      <input
                        className="mgf-inbox-input mgf-inbox-input--amount"
                        type="text"
                        inputMode="decimal"
                        value={d.amount}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { amount: e.target.value })}
                        aria-label={`Betrag ${row.name}`}
                      />
                    </td>
                    <td>
                      <select
                        className={`mgf-inbox-select mgf-inbox-select--${st}`}
                        value={st}
                        disabled={busy}
                        onChange={(e) =>
                          setDraft(row.id, { status: e.target.value as GoennerInquiryStatus })
                        }
                        aria-label={`Status ${row.name}`}
                      >
                        <option value="open">Offen</option>
                        <option value="completed">Bezahlt</option>
                        <option value="exited">Ausgetreten</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="mgf-inbox-input mgf-inbox-input--date"
                        type="date"
                        value={d.created}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { created: e.target.value })}
                        aria-label={`Eingang ${row.name}`}
                      />
                    </td>
                    <td className="mgf-inbox-actions">
                      <button
                        type="button"
                        className="mgf-btn mgf-btn--primary mgf-btn--sm"
                        disabled={busy || !dirty}
                        onClick={() => void saveRow(row)}
                      >
                        {busy ? "…" : "Speichern"}
                      </button>
                      <button
                        type="button"
                        className="mgf-btn mgf-btn--danger mgf-btn--sm mgf-btn--icon"
                        disabled={busy}
                        onClick={() => void deleteRow(row)}
                        title="Löschen"
                        aria-label={`Anfrage von ${row.name} löschen`}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
