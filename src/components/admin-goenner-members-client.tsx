"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminMembershipOptions, inquiryTierLabel } from "@/content/goennerMemberships";
import {
  GOENNER_FINANCE_START_YEAR,
  chfFmt,
  expectedAnnualChf,
  paidOnForYear,
  paymentsInYear,
  withMemberTotals,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  schemaMissing?: boolean;
};

type StatusFilter = "all" | "open" | "paid";

export function AdminGoennerMembersClient({ members, payments, schemaMissing }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Jahre nur bis zum laufenden Jahr — ein neues Jahr erscheint automatisch ab dem 1. Januar
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= GOENNER_FINANCE_START_YEAR; y--) list.push(y);
    return list;
  }, [currentYear]);

  const enriched = useMemo(
    () =>
      members
        .map((m) => {
          const inYear = paymentsInYear(payments, m.id, year);
          return {
            ...withMemberTotals(m, payments),
            expected: expectedAnnualChf(m),
            paidInYear: inYear.reduce((s, p) => s + Number(p.amount_chf || 0), 0),
            isPaid: inYear.length > 0,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "de-CH")),
    [members, payments, year],
  );

  const visible = enriched.filter((m) => {
    if (onlyActive && !m.active) return false;
    if (status === "open" && m.isPaid) return false;
    if (status === "paid" && !m.isPaid) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.email || "", m.phone || "", m.city || "", inquiryTierLabel(m.membership_id)]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const activeRows = enriched.filter((m) => m.active);
  const soll = activeRows.reduce((s, m) => s + m.expected, 0);
  const ist = enriched.reduce((s, m) => s + m.paidInYear, 0);
  const paidCount = activeRows.filter((m) => m.isPaid).length;

  async function markPaid(member: (typeof enriched)[number]) {
    if (
      !window.confirm(
        `«${member.name}» für ${year} als bezahlt erfassen (${chfFmt(member.expected)})?\nEs wird keine E-Mail versendet.`,
      )
    )
      return;
    setBusyId(member.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/goenner-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          amount_chf: member.expected,
          paid_on: paidOnForYear(year),
          membership_id: member.membership_id,
          method: "other",
          note: `Jahresbeitrag ${year}`,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  async function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/goenner-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          membership_id: fd.get("membership_id"),
          annual_amount_chf: fd.get("annual_amount_chf"),
          notes: fd.get("notes"),
        }),
      });
      const data = (await res.json()) as { error?: string; member?: GoennerMemberRow };
      if (!res.ok) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      setShowAdd(false);
      if (data.member) {
        startTransition(() => router.push(`/admin/goenner/${data.member!.id}`));
      } else {
        startTransition(() => router.refresh());
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`«${name}» und alle Zahlungen löschen?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/goenner-members/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Löschen fehlgeschlagen.");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  if (schemaMissing) {
    return (
      <p className="mgf-banner mgf-banner--warn">
        Ledger-Tabellen fehlen. In Supabase ausführen: <code>supabase/010_goenner_finance.sql</code>
      </p>
    );
  }

  return (
    <div className="mgf-stack">
      <div className="mgf-toolbar">
        <label className="mgf-check">
          Jahr
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="mgf-search">
          <span className="sr-only">Suchen</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, E-Mail, Telefon, Ort…"
          />
        </label>
        <label className="mgf-check">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">Alle</option>
            <option value="open">Offen</option>
            <option value="paid">Bezahlt</option>
          </select>
        </label>
        <label className="mgf-check">
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Nur aktiv
        </label>
        <a
          className="mgf-btn mgf-btn--ghost"
          href={`/api/admin/goenner-report?year=${currentYear - 1}`}
          title={`Stand 31.12.${currentYear - 1} als CSV (Excel)`}
        >
          Jahresreport {currentYear - 1}
        </a>
        {year !== currentYear - 1 ? (
          <a className="mgf-btn mgf-btn--ghost" href={`/api/admin/goenner-report?year=${year}`}>
            Report {year}
          </a>
        ) : null}
        <button type="button" className="mgf-btn mgf-btn--primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Abbrechen" : "Gönner hinzufügen"}
        </button>
      </div>

      <p className="mgf-banner">
        {year}: <strong>{paidCount}</strong> von {activeRows.length} aktiven Gönnern bezahlt · Soll {chfFmt(soll)} ·
        Eingegangen {chfFmt(ist)} · Offen {chfFmt(Math.max(soll - ist, 0))}. Rechnungen und E-Mails löst du selbst aus
        — diese Liste versendet nichts.
      </p>

      {error ? <p className="mgf-banner mgf-banner--error">{error}</p> : null}

      {showAdd ? (
        <form className="mgf-panel mgf-form" onSubmit={onAdd}>
          <h2 className="mgf-panel-title">Neuer Gönner</h2>
          <div className="mgf-form-grid">
            <label>
              Name
              <input name="name" required maxLength={200} />
            </label>
            <label>
              E-Mail
              <input name="email" type="email" />
            </label>
            <label>
              Telefon
              <input name="phone" type="tel" />
            </label>
            <label>
              Stufe
              <select name="membership_id" defaultValue="birdie">
                {adminMembershipOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Jahresbetrag (CHF)
              <input name="annual_amount_chf" inputMode="decimal" placeholder="leer = Listenpreis" />
            </label>
            <label>
              Notiz
              <input name="notes" maxLength={500} />
            </label>
          </div>
          <button type="submit" className="mgf-btn mgf-btn--primary" disabled={busy}>
            {busy ? "Speichern…" : "Anlegen & öffnen"}
          </button>
        </form>
      ) : null}

      <div className="mgf-table-wrap">
        <table className="mgf-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stufe</th>
              <th>Jahresbetrag</th>
              <th>Status {year}</th>
              <th>Kontakt</th>
              <th>Total ab 2022</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="mgf-empty-cell">
                  Keine Gönner für diese Auswahl.
                </td>
              </tr>
            ) : (
              visible.map((m) => (
                <tr key={m.id} className={m.active ? undefined : "is-inactive"}>
                  <td>
                    <Link href={`/admin/goenner/${m.id}`} className="mgf-name-link">
                      {m.name}
                    </Link>
                    {!m.active ? <span className="mgf-pill mgf-pill--muted">inaktiv</span> : null}
                  </td>
                  <td>
                    <span className="mgf-pill">{inquiryTierLabel(m.membership_id)}</span>
                  </td>
                  <td className="mgf-num">{chfFmt(m.expected)}</td>
                  <td>
                    {m.isPaid ? (
                      <span className="mgf-pill">bezahlt · {chfFmt(m.paidInYear)}</span>
                    ) : (
                      <span className="mgf-pill mgf-pill--muted">offen</span>
                    )}
                  </td>
                  <td className="mgf-contact">
                    {m.email ? <a href={`mailto:${m.email}`}>{m.email}</a> : <span>—</span>}
                    {m.phone ? (
                      <>
                        <br />
                        <a href={`tel:${m.phone.replace(/\s/g, "")}`}>{m.phone}</a>
                      </>
                    ) : null}
                  </td>
                  <td className="mgf-num mgf-num--strong">{chfFmt(m.total_chf)}</td>
                  <td>
                    <div className="mgf-row-actions">
                      {!m.isPaid && m.active ? (
                        <button
                          type="button"
                          className="mgf-btn mgf-btn--primary mgf-btn--sm"
                          disabled={busyId === m.id}
                          onClick={() => void markPaid(m)}
                        >
                          {busyId === m.id ? "…" : `Bezahlt ${year}`}
                        </button>
                      ) : null}
                      <Link href={`/admin/goenner/${m.id}`} className="mgf-btn mgf-btn--ghost mgf-btn--sm">
                        Öffnen
                      </Link>
                      <button
                        type="button"
                        className="mgf-btn mgf-btn--danger mgf-btn--sm"
                        disabled={busy}
                        onClick={() => void onDelete(m.id, m.name)}
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
