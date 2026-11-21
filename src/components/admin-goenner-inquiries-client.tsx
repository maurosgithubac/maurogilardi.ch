"use client";

import { AdminRechnungDialog, artLabelOf } from "@/components/admin-rechnung-dialog";
import { openInvoiceMail, seasonOptions } from "@/lib/admin-invoice-mail";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  GOENNER_SPONSORING_MIN_CHF,
  inquiryTierShort,
  isLiteContactMembership,
  membershipPriceChf,
} from "@/content/goennerMemberships";
import type { GoennerInquiryRow, GoennerInquiryStatus } from "@/types/content";
import { isNewInquiry } from "@/lib/admin-inbox";
import { IconCheck, IconDownload, IconMail, IconNote, IconSearch, IconSort, IconTrash } from "@/components/admin/admin-icons";
import { AdminRowMenu } from "@/components/admin/admin-row-menu";
import { TierTag, chfCompact } from "@/components/admin/admin-ui";
import { CountUp } from "@/components/admin/ui/count-up";
import { sendStandardMail, type StandardMailType } from "@/lib/admin-send-mail";

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

export type InboxFilter = "new" | "all" | "open" | "paid" | "exited" | "hundert";
type Filter = InboxFilter;

type SortKey = "name" | "tier" | "amount" | "status" | "created";
type SortState = { key: SortKey; dir: "asc" | "desc" } | null;

const STATUS_ORDER = { open: 0, completed: 1, exited: 2 } as const;

type Draft = {
  email: string;
  phone: string;
  amount: string;
  status: GoennerInquiryStatus;
  created: string;
};

function amountOf(row: GoennerInquiryRow) {
  return row.amount_chf != null ? Number(row.amount_chf) : membershipPriceChf(row.membership_id);
}

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

export function AdminGoennerInquiriesClient({
  rows,
  initialFilter,
}: {
  rows: GoennerInquiryRow[];
  initialFilter?: InboxFilter;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rechnungFor, setRechnungFor] = useState<GoennerInquiryRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formWarning, setFormWarning] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);
  const newRows = rows.filter(isNewInquiry);
  const [filter, setFilter] = useState<Filter>(initialFilter ?? (newRows.length > 0 ? "new" : "open"));
  const [query, setQuery] = useState("");
  // null = Standard: neue zuerst, dann offen → bezahlt → ausgetreten, jeweils neueste oben
  const [sort, setSort] = useState<SortState>(null);
  const [markingAll, setMarkingAll] = useState(false);
  // Im Filter «Neu» bleiben Zeilen sichtbar, die erst in dieser Sitzung gelesen wurden
  const [seenNow, setSeenNow] = useState<ReadonlySet<string>>(() => new Set());

  function markSeen(row: GoennerInquiryRow) {
    setSeenNow((prev) => new Set(prev).add(row.id));
    void patch(row.id, { seen: true });
  }
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
        if (filter === "new") return isNewInquiry(row) || seenNow.has(row.id);
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
        const newest = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (!sort) {
          const fresh = Number(isNewInquiry(b)) - Number(isNewInquiry(a));
          return fresh || STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)] || newest;
        }
        let diff = 0;
        if (sort.key === "name") diff = a.name.localeCompare(b.name, "de-CH");
        else if (sort.key === "tier") diff = inquiryTierShort(a.membership_id).localeCompare(inquiryTierShort(b.membership_id), "de-CH");
        else if (sort.key === "amount") diff = amountOf(a) - amountOf(b);
        else if (sort.key === "status") diff = STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)];
        else diff = -newest;
        return (sort.dir === "asc" ? diff : -diff) || newest;
      });
  }, [rows, filter, query, sort, seenNow]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "amount" || key === "created" ? "desc" : "asc" },
    );
  }

  function sortHeader(key: SortKey, label: string, align?: "end") {
    const active = sort?.key === key;
    return (
      <div className={`ib-hc${align === "end" ? " is-end" : ""}`}>
        <button
          type="button"
          className={`ap-sort${active ? " is-active" : ""}`}
          aria-pressed={active}
          onClick={() => toggleSort(key)}
        >
          {label}
          <IconSort dir={active ? sort.dir : null} />
        </button>
      </div>
    );
  }

  async function markAllSeen() {
    setMarkingAll(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/goenner-inquiries/seen", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(data.error || "Aktion fehlgeschlagen.");
        return;
      }
      if (filter === "new") setFilter("open");
      startTransition(() => router.refresh());
    } finally {
      setMarkingAll(false);
    }
  }

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
    if (isNewInquiry(row)) markSeen(row);
  }

  async function saveNote(row: GoennerInquiryRow) {
    const ok = await patch(row.id, { admin_note: noteDraft.trim() || null });
    if (ok) setNoteOpenId(null);
  }

  async function sendMail(row: GoennerInquiryRow, type: StandardMailType) {
    setFormError(null);
    setFormWarning(null);
    setFormOk(null);
    setBusyId(row.id);
    try {
      const msg = await sendStandardMail({ source: "inquiry", id: row.id, type, name: row.name, email: row.email });
      if (msg) {
        setFormOk(msg);
        if (isNewInquiry(row)) markSeen(row);
        startTransition(() => router.refresh());
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Mail konnte nicht gesendet werden.");
    } finally {
      setBusyId(null);
    }
  }

  /** Lädt eine .eml mit Dankesnachricht und Rechnung; Outlook öffnet sie als Entwurf. */
  async function openOutlookDraft(row: GoennerInquiryRow, type: "invoice" | "twint" = "invoice", season: number = new Date().getFullYear(), status: "neu" | "bestand" = "neu") {
    if (type === "invoice") {
      setFormError(null);
      setFormWarning(null);
      setFormOk(null);
      setBusyId(row.id);
      try {
        await openInvoiceMail({
          mailUrl: `/api/admin/goenner-inquiries/${row.id}/invoice-eml?year=${season}&status=${status}`,
        });
        setFormOk(`Mail-Entwurf für ${row.name} heruntergeladen. Mit Doppelklick öffnen, prüfen, senden.`);
      } catch (e) {
        setFormError(e instanceof Error ? e.message : "Mail-Entwurf konnte nicht erstellt werden.");
      } finally {
        setBusyId(null);
      }
      return;
    }
    setFormError(null);
    setFormWarning(null);
    setFormOk(null);
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/goenner-inquiries/${row.id}/invoice-eml${type === "twint" ? "?type=twint" : ""}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(typeof data.error === "string" ? data.error : "Outlook-Entwurf konnte nicht erstellt werden.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type === "twint" ? "TWINT" : "Entwurf"}-${row.invoice_number ?? row.id}.eml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFormOk(`Outlook-Entwurf ${row.invoice_number} erstellt. Datei öffnen, anpassen, senden.`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Outlook-Entwurf konnte nicht erstellt werden.");
    } finally {
      setBusyId(null);
    }
  }

  async function downloadInvoicePdf(row: GoennerInquiryRow) {
    setFormError(null);
    setFormWarning(null);
    setFormOk(null);
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/goenner-inquiries/${row.id}/invoice-pdf`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(typeof data.error === "string" ? data.error : "PDF-Rechnung konnte nicht erstellt werden.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rechnung-${row.invoice_number ?? row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFormOk(`PDF-Rechnung ${row.invoice_number} heruntergeladen.`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "PDF-Rechnung konnte nicht erstellt werden.");
    } finally {
      setBusyId(null);
    }
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
    new: newRows.length,
    open: openRows.length,
    paid: paidRows.length,
    exited: exitedRows.length,
    hundert: rows.filter((r) => isLiteContactMembership(r.membership_id)).length,
    all: rows.length,
  };

  const kpiFilters: { id: Filter; label: string; value: number; tone?: string }[] = [
    { id: "new", label: "Neu", value: newRows.length, tone: newRows.length > 0 ? "red" : undefined },
    { id: "open", label: "Offen", value: openRows.length, tone: openRows.length > 0 ? "warn" : undefined },
    { id: "paid", label: "Bezahlt", value: paidRows.length },
    { id: "exited", label: "Ausgetreten", value: exitedRows.length },
  ];

  const emptyCopy = query.trim()
    ? { title: "Nichts gefunden", text: `Keine Anfrage passt zu «${query.trim()}» in diesem Filter.` }
    : filter === "new"
      ? { title: "Alles gelesen", text: "Es gibt keine neuen Anfragen. Neue Formular-Anfragen erscheinen hier." }
      : filter === "open"
        ? { title: "Keine offenen Anfragen", text: "Alle Anfragen sind bezahlt oder ausgetreten." }
        : { title: "Keine Einträge in diesem Filter", text: "Wähle einen anderen Filter oder leere die Suche." };

  return (
    <div className="ib-wrap">
      <AdminRechnungDialog
        open={rechnungFor !== null}
        name={rechnungFor?.name ?? ""}
        artLabel={rechnungFor ? artLabelOf(rechnungFor) : ""}
        busy={busyId !== null}
        onClose={() => setRechnungFor(null)}
        onConfirm={({ status, season }) => {
          const q = rechnungFor;
          setRechnungFor(null);
          if (q) void openOutlookDraft(q, "invoice", season, status);
        }}
      />

      <div className="ib-kpis ap-stagger" role="group" aria-label="Eingänge in Zahlen">
        <div className="ib-kpi ib-kpi--hero">
          <span className="ib-kpi-label">Summe bezahlt</span>
          <strong className="ib-kpi-num">
            <CountUp value={totalChf} format={(n) => chfCompact(n === totalChf ? n : Math.round(n))} />
          </strong>
          <span className="ib-kpi-sub">
            aus {paidRows.length} {paidRows.length === 1 ? "Anfrage" : "Anfragen"}
          </span>
        </div>
        {kpiFilters.map((k) => (
          <button
            key={k.id}
            type="button"
            className={`ib-kpi ib-kpi--btn${k.tone ? ` is-${k.tone}` : ""}`}
            aria-pressed={filter === k.id}
            onClick={() => setFilter(k.id)}
          >
            <span className="ib-kpi-label">{k.label}</span>
            <strong className="ib-kpi-num">
              <CountUp value={k.value} />
            </strong>
            <span className="ib-kpi-sub">Liste zeigen</span>
          </button>
        ))}
        <div className="ib-kpi">
          <span className="ib-kpi-label">100er offen</span>
          <strong className="ib-kpi-num">
            <CountUp value={hundertOpen} />
          </strong>
          <span className="ib-kpi-sub">nur Kontakt</span>
        </div>
      </div>

      <div className="ib-toolbar" role="search">
        <div className="ap-segment" role="group" aria-label="Liste filtern">
          {(
            [
              ["new", "Neu"],
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
        <label className="ap-search ib-search">
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
        <label className="ap-field-inline ap-sort-select ib-sort">
          <span>Sortieren</span>
          <select
            className="ap-select"
            value={sort ? `${sort.key}:${sort.dir}` : "default"}
            onChange={(e) => {
              if (e.target.value === "default") return setSort(null);
              const [key, dir] = e.target.value.split(":") as [SortKey, "asc" | "desc"];
              setSort({ key, dir });
            }}
          >
            <option value="default">Neue &amp; offene zuerst</option>
            <option value="created:desc">Eingang neueste</option>
            <option value="created:asc">Eingang älteste</option>
            <option value="name:asc">Name A–Z</option>
            <option value="amount:desc">Betrag hoch → tief</option>
            <option value="tier:asc">Stufe</option>
            <option value="status:asc">Status</option>
          </select>
        </label>
        {newRows.length > 0 ? (
          <button
            type="button"
            className={`ap-btn ap-btn--secondary ap-btn--sm${markingAll ? " is-loading" : ""}`}
            disabled={markingAll}
            onClick={() => void markAllSeen()}
          >
            <IconCheck size={14} />
            Alle als gelesen markieren
          </button>
        ) : null}
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
      {formOk ? (
        <p className="ap-banner ap-banner--ok" role="status">
          {formOk}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="ap-card ap-empty">
          <p className="ap-empty-title">{emptyCopy.title}</p>
          <p className="ap-empty-text">{emptyCopy.text}</p>
          {filter !== "all" || query ? (
            <button
              type="button"
              className="ap-btn ap-btn--secondary ap-btn--sm"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
            >
              Alle {rows.length} anzeigen
            </button>
          ) : null}
        </div>
      ) : (
        <div className="ib-board">
          <div className="ib-head" aria-hidden={false}>
            {sortHeader("name", "Name")}
            <span>E-Mail</span>
            <span>Telefon</span>
            {sortHeader("amount", "Betrag CHF", "end")}
            {sortHeader("status", "Status")}
            {sortHeader("created", "Eingang")}
            <span className="ib-head-act">
              <span className="sr-only">Aktionen</span>
            </span>
          </div>
          <ul className="ib-list ap-stagger" aria-label={`Eingänge, ${visible.length} Einträge`}>
            {visible.map((row) => {
              const busy = busyId === row.id;
              const d = drafts[row.id] ?? draftFrom(row);
              const st = d.status;
              const isHundert = isLiteContactMembership(row.membership_id);
              const dirty = isDirty(row);
              const tip = commentPreview(row);
              const hasComment = Boolean(row.message?.trim() || row.admin_note?.trim());
              const fresh = isNewInquiry(row);

              return (
                <li
                  key={row.id}
                  className={["ib-row", `is-${st}`, fresh ? "is-new" : "", isHundert ? "is-hundert" : "", dirty ? "is-dirty" : "", busy ? "is-busy" : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="ib-id">
                    <div className="ib-id-line">
                      {fresh ? (
                        <button
                          type="button"
                          className="ib-new"
                          disabled={busy}
                          onClick={() => markSeen(row)}
                          title="Als gelesen markieren"
                        >
                          Neu
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="ib-name"
                        title={`${row.name}\n\n${tip}`}
                        aria-label={`${row.name} – Kommentar ${hasComment ? "anzeigen" : "hinzufügen"}`}
                        aria-expanded={noteOpenId === row.id}
                        onClick={() => openNote(row)}
                      >
                        <span>{displayName(row.name, 26)}</span>
                        <span className={`ib-note-flag${hasComment ? " has" : ""}`} aria-hidden="true">
                          <IconNote size={13} />
                        </span>
                      </button>
                    </div>
                    <div className="ib-id-meta">
                      <TierTag id={row.membership_id}>{inquiryTierShort(row.membership_id)}</TierTag>
                      {dirty ? <span className="ib-dirty">Ungespeichert</span> : null}
                    </div>
                    {noteOpenId === row.id ? (
                      <div className="ib-pop" ref={notePanelRef} role="dialog" aria-label={`Kommentar ${row.name}`}>
                        {row.message?.trim() ? (
                          <div className="ib-pop-block">
                            <span className="ap-label">Formular</span>
                            <p>{row.message.trim()}</p>
                          </div>
                        ) : (
                          <p className="ib-pop-empty">Kein Formular-Kommentar.</p>
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
                            autoFocus
                          />
                        </label>
                        <div className="ib-pop-actions">
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
                  </div>
                  <div className="ib-f ib-f--email" data-label="E-Mail">
                    <input
                      className="ap-cell-input"
                      type="email"
                      value={d.email}
                      disabled={busy}
                      onChange={(e) => setDraft(row.id, { email: e.target.value })}
                      aria-label={`E-Mail ${row.name}`}
                    />
                  </div>
                  <div className="ib-f ib-f--phone" data-label="Telefon">
                    <input
                      className="ap-cell-input"
                      type="tel"
                      value={d.phone}
                      disabled={busy}
                      onChange={(e) => setDraft(row.id, { phone: e.target.value })}
                      aria-label={`Telefon ${row.name}`}
                      placeholder="—"
                    />
                  </div>
                  <div className="ib-f ib-f--amount" data-label="Betrag CHF">
                    <input
                      className="ap-cell-input ap-cell-input--num"
                      type="text"
                      inputMode="decimal"
                      value={d.amount}
                      disabled={busy}
                      onChange={(e) => setDraft(row.id, { amount: e.target.value })}
                      aria-label={`Betrag ${row.name}`}
                    />
                  </div>
                  <div className="ib-f ib-f--status" data-label="Status">
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
                  </div>
                  <div className="ib-f ib-f--date" data-label="Eingang">
                    <input
                      className="ap-cell-input ap-cell-input--date"
                      type="date"
                      value={d.created}
                      disabled={busy}
                      onChange={(e) => setDraft(row.id, { created: e.target.value })}
                      aria-label={`Eingang ${row.name}`}
                    />
                  </div>
                  <div className="ib-act">
                    <button
                      type="button"
                      className={`ap-btn ap-btn--primary ap-btn--sm${busy ? " is-loading" : ""}`}
                      disabled={busy || !dirty}
                      onClick={() => void saveRow(row)}
                    >
                      Speichern
                    </button>
                    <AdminRowMenu
                      label={`Aktionen für ${row.name}`}
                      items={[
                        ...(row.membership_id !== "sponsoring"
                          ? (["twint"] as const).map((type) => ({
                              kind: "action" as const,
                              label: "TWINT-Entwurf",
                              icon: <IconMail size={14} />,
                              disabled: busy,
                              onSelect: () => void openOutlookDraft(row, type),
                            }))
                          : []),
                        ...(row.payment_method === "rechnung" && row.invoice_number
                          ? [
                              {
                                kind: "action" as const,
                                label: "Rechnung (Mail-Entwurf)",
                                icon: <IconMail size={14} />,
                                disabled: busy,
                                onSelect: () => setRechnungFor(row),
                              },
                            ]
                          : []),
                        {
                          kind: "action",
                          label: "Löschen…",
                          danger: true,
                          disabled: busy,
                          icon: <IconTrash size={14} />,
                          onSelect: () => void deleteRow(row),
                        },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
