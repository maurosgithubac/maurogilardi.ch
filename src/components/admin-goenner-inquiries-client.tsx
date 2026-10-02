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
import { IconNote, IconSearch, IconTrash } from "@/components/admin/admin-icons";
import { TierTag } from "@/components/admin/admin-ui";

function chfFmt(n: number) {
  // Node-ICU (') und Browser (’) unterscheiden sich — vereinheitlichen gegen Hydration-Fehler
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n).replace(/['‘’]/g, "’");
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

  const counts: Record<Filter, number> = {
    open: openRows.length,
    paid: paidRows.length,
    exited: exitedRows.length,
    hundert: rows.filter((r) => isLiteContactMembership(r.membership_id)).length,
    all: rows.length,
  };

  return (
    <>
      <dl className="ap-statline" aria-label="Eingänge in Zahlen">
        <div className={openRows.length > 0 ? "is-alert" : undefined}>
          <dt>Offen</dt>
          <dd>{openRows.length}</dd>
        </div>
        <div>
          <dt>100er offen</dt>
          <dd>{hundertOpen}</dd>
        </div>
        <div>
          <dt>Bezahlt</dt>
          <dd>{paidRows.length}</dd>
        </div>
        <div>
          <dt>Ausgetreten</dt>
          <dd>{exitedRows.length}</dd>
        </div>
        <div>
          <dt>Summe bezahlt</dt>
          <dd>{chfFmt(totalChf)}</dd>
        </div>
      </dl>

      <div className="ap-toolbar" role="search">
        <div className="ap-segment" role="group" aria-label="Liste filtern">
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
              className="ap-segment-btn"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
              <span className="ap-segment-count">{counts[id]}</span>
            </button>
          ))}
        </div>
        <label className="ap-search">
          <IconSearch />
          <span className="sr-only">Eingänge suchen</span>
          <input
            type="search"
            className="ap-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, E-Mail, Telefon…"
          />
        </label>
      </div>

      {formError ? (
        <p className="ap-banner ap-banner--error" role="alert">
          {formError}
        </p>
      ) : null}
      {formWarning ? (
        <p className="ap-banner ap-banner--warn" role="status">
          {formWarning}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="ap-card ap-empty">
          <p className="ap-empty-title">Keine Einträge in diesem Filter</p>
          <p className="ap-muted-sm">Anderen Filter wählen oder Suche leeren.</p>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table ap-table--inbox">
            <caption className="sr-only">Eingänge, {visible.length} Einträge</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Stufe</th>
                <th scope="col">E-Mail</th>
                <th scope="col">Telefon</th>
                <th scope="col" className="ap-num">
                  Betrag CHF
                </th>
                <th scope="col">Status</th>
                <th scope="col">Eingang</th>
                <th scope="col" className="ap-col-actions">
                  <span className="sr-only">Aktionen</span>
                </th>
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
                    className={["ap-inbox-row", `is-${st}`, isHundert ? "is-hundert" : "", dirty ? "is-dirty" : ""]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <td className="ap-cell-name">
                      <button
                        type="button"
                        className="ap-inbox-name"
                        title={`${row.name}\n\n${tip}`}
                        aria-label={`${row.name} – Kommentar ${hasComment ? "anzeigen" : "hinzufügen"}`}
                        aria-expanded={noteOpenId === row.id}
                        onClick={() => openNote(row)}
                      >
                        <span>{displayName(row.name, 26)}</span>
                        {hasComment ? (
                          <span className="ap-note-flag" aria-hidden="true">
                            <IconNote size={13} />
                          </span>
                        ) : null}
                      </button>
                      {dirty ? <span className="ap-dirty-hint">Ungespeichert</span> : null}
                      {noteOpenId === row.id ? (
                        <div className="ap-popover" ref={notePanelRef} role="dialog" aria-label={`Kommentar ${row.name}`}>
                          {row.message?.trim() ? (
                            <div className="ap-popover-block">
                              <span className="ap-label">Formular</span>
                              <p>{row.message.trim()}</p>
                            </div>
                          ) : (
                            <p className="ap-muted-sm">Kein Formular-Kommentar.</p>
                          )}
                          <label className="ap-field">
                            <span className="ap-label">Dein Kommentar</span>
                            <textarea
                              className="ap-input ap-textarea"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              rows={3}
                              disabled={busy}
                              placeholder="Interner Vermerk…"
                            />
                          </label>
                          <div className="ap-form-actions">
                            <button
                              type="button"
                              className="ap-btn ap-btn--ghost ap-btn--sm"
                              disabled={busy}
                              onClick={() => setNoteOpenId(null)}
                            >
                              Schliessen
                            </button>
                            <button
                              type="button"
                              className="ap-btn ap-btn--primary ap-btn--sm"
                              disabled={busy}
                              onClick={() => void saveNote(row)}
                            >
                              Speichern
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td data-label="Stufe">
                      <TierTag id={row.membership_id}>{inquiryTierShort(row.membership_id)}</TierTag>
                    </td>
                    <td data-label="E-Mail">
                      <input
                        className="ap-cell-input"
                        type="email"
                        value={d.email}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { email: e.target.value })}
                        aria-label={`E-Mail ${row.name}`}
                      />
                    </td>
                    <td data-label="Telefon">
                      <input
                        className="ap-cell-input"
                        type="tel"
                        value={d.phone}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { phone: e.target.value })}
                        aria-label={`Telefon ${row.name}`}
                        placeholder="—"
                      />
                    </td>
                    <td data-label="Betrag CHF">
                      <input
                        className="ap-cell-input ap-cell-input--num"
                        type="text"
                        inputMode="decimal"
                        value={d.amount}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { amount: e.target.value })}
                        aria-label={`Betrag ${row.name}`}
                      />
                    </td>
                    <td data-label="Status">
                      <select
                        className={`ap-status-select is-${st}`}
                        value={st}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { status: e.target.value as GoennerInquiryStatus })}
                        aria-label={`Status ${row.name}`}
                      >
                        <option value="open">○ Offen</option>
                        <option value="completed">✓ Bezahlt</option>
                        <option value="exited">– Ausgetreten</option>
                      </select>
                    </td>
                    <td data-label="Eingang">
                      <input
                        className="ap-cell-input ap-cell-input--date"
                        type="date"
                        value={d.created}
                        disabled={busy}
                        onChange={(e) => setDraft(row.id, { created: e.target.value })}
                        aria-label={`Eingang ${row.name}`}
                      />
                    </td>
                    <td className="ap-col-actions">
                      <div className="ap-row-actions">
                        <button
                          type="button"
                          className="ap-btn ap-btn--primary ap-btn--sm"
                          disabled={busy || !dirty}
                          onClick={() => void saveRow(row)}
                        >
                          {busy ? "…" : "Speichern"}
                        </button>
                        <button
                          type="button"
                          className="ap-icon-btn ap-icon-btn--danger"
                          disabled={busy}
                          onClick={() => void deleteRow(row)}
                          title="Löschen"
                          aria-label={`Anfrage von ${row.name} löschen`}
                        >
                          <IconTrash />
                        </button>
                      </div>
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
