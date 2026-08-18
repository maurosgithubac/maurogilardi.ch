"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { goennerMembershipTiers, inquiryTierLabel } from "@/content/goennerMemberships";
import {
  GOENNER_FINANCE_START_YEAR,
  chfFmt,
  sumPaymentsForYear,
  sumPaymentsTotal,
  type GoennerMemberRow,
  type GoennerPaymentMethod,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";

type Props = {
  member: GoennerMemberRow;
  payments: GoennerPaymentRow[];
};

const METHODS: { id: GoennerPaymentMethod; label: string }[] = [
  { id: "twint", label: "TWINT" },
  { id: "bank", label: "Bank" },
  { id: "cash", label: "Bar" },
  { id: "other", label: "Andere" },
];

export function AdminGoennerMemberDetailClient({ member, payments }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(member);
  const [invoiceBusy, setInvoiceBusy] = useState(false);

  const year = new Date().getFullYear();
  const lastYear = year - 1;
  const total = sumPaymentsTotal(payments);
  const yearTotal = sumPaymentsForYear(payments, year);
  const lastYearTotal = sumPaymentsForYear(payments, lastYear);
  const lastPayment = payments[0] ?? null;

  const byYear = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of payments) {
      if (p.year < GOENNER_FINANCE_START_YEAR) continue;
      map.set(p.year, (map.get(p.year) || 0) + Number(p.amount_chf));
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [payments]);

  async function saveMember(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/goenner-members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Speichern fehlgeschlagen.");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function addPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/goenner-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          amount_chf: fd.get("amount_chf"),
          paid_on: fd.get("paid_on"),
          membership_id: fd.get("membership_id") || member.membership_id,
          method: fd.get("method"),
          note: fd.get("note"),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Zahlung speichern fehlgeschlagen.");
        return;
      }
      event.currentTarget.reset();
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function deletePayment(id: string) {
    if (!window.confirm("Diese Zahlung löschen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/goenner-payments/${id}`, { method: "DELETE" });
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

  async function downloadInvoice() {
    if (!lastPayment) {
      setError("Keine Zahlung vorhanden — zuerst eine Einzahlung erfassen.");
      return;
    }
    setInvoiceBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/goenner-members/${member.id}/invoice`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Rechnung konnte nicht erstellt werden.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] || `Rechnung_${member.name}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download fehlgeschlagen.");
    } finally {
      setInvoiceBusy(false);
    }
  }

  return (
    <div className="mgf-stack">
      <div className="mgf-detail-head">
        <Link href="/admin/goenner" className="mgf-back">
          ← Alle Gönner
        </Link>
        <div className="mgf-detail-title-row">
          <div>
            <h1 className="mgf-h1">{member.name}</h1>
            <p className="mgf-lead">{inquiryTierLabel(member.membership_id)}</p>
          </div>
          <button
            type="button"
            className="mgf-btn mgf-btn--primary"
            disabled={invoiceBusy || !lastPayment}
            onClick={() => void downloadInvoice()}
            title={lastPayment ? `Rechnung über ${chfFmt(Number(lastPayment.amount_chf))}` : "Zuerst Zahlung erfassen"}
          >
            {invoiceBusy ? "Erstelle…" : "Rechnung (Word)"}
          </button>
        </div>
        {lastPayment ? (
          <p className="mgf-muted">
            Beleg basiert auf der letzten Einzahlung vom {lastPayment.paid_on} (
            {chfFmt(Number(lastPayment.amount_chf))}).
          </p>
        ) : (
          <p className="mgf-muted">Für die Rechnung brauchst du mindestens eine erfasste Zahlung.</p>
        )}
      </div>

      <div className="mgf-kpi-grid">
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">{year}</span>
          <strong>{chfFmt(yearTotal)}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Letztes Jahr ({lastYear})</span>
          <strong>{chfFmt(lastYearTotal)}</strong>
        </div>
        <div className="mgf-kpi mgf-kpi--accent">
          <span className="mgf-kpi-label">Total seit {GOENNER_FINANCE_START_YEAR}</span>
          <strong>{chfFmt(total)}</strong>
        </div>
      </div>

      {error ? <p className="mgf-banner mgf-banner--error">{error}</p> : null}

      <div className="mgf-split">
        <form className="mgf-panel mgf-form" onSubmit={saveMember}>
          <h2 className="mgf-panel-title">Stammdaten</h2>
          <div className="mgf-form-grid">
            <label>
              Name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </label>
            <label>
              Stufe
              <select
                value={draft.membership_id}
                onChange={(e) => setDraft({ ...draft, membership_id: e.target.value })}
              >
                {goennerMembershipTiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              E-Mail
              <input
                type="email"
                value={draft.email || ""}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              Telefon
              <input
                type="tel"
                value={draft.phone || ""}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
            <label className="mgf-span-2">
              Strasse
              <input
                value={draft.street || ""}
                onChange={(e) => setDraft({ ...draft, street: e.target.value })}
              />
            </label>
            <label>
              PLZ
              <input
                value={draft.postal_code || ""}
                onChange={(e) => setDraft({ ...draft, postal_code: e.target.value })}
              />
            </label>
            <label>
              Ort
              <input value={draft.city || ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </label>
            <label className="mgf-span-2">
              Notizen
              <textarea
                rows={3}
                value={draft.notes || ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>
            <label className="mgf-check mgf-span-2">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              Aktiv
            </label>
          </div>
          <button type="submit" className="mgf-btn mgf-btn--primary" disabled={busy}>
            {busy ? "…" : "Stammdaten speichern"}
          </button>
        </form>

        <form className="mgf-panel mgf-form" onSubmit={addPayment}>
          <h2 className="mgf-panel-title">Zahlung erfassen</h2>
          <div className="mgf-form-grid">
            <label>
              Betrag (CHF)
              <input name="amount_chf" required inputMode="decimal" placeholder="100" />
            </label>
            <label>
              Datum
              <input name="paid_on" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
            <label>
              Methode
              <select name="method" defaultValue="twint">
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Stufe (Zahlung)
              <select name="membership_id" defaultValue={member.membership_id}>
                {goennerMembershipTiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="mgf-span-2">
              Notiz
              <input name="note" maxLength={400} />
            </label>
          </div>
          <button type="submit" className="mgf-btn mgf-btn--primary" disabled={busy}>
            {busy ? "…" : "Zahlung hinzufügen"}
          </button>
        </form>
      </div>

      <section className="mgf-panel">
        <h2 className="mgf-panel-title">Jahresübersicht</h2>
        {byYear.length === 0 ? (
          <p className="mgf-muted">Noch keine Zahlungen seit {GOENNER_FINANCE_START_YEAR}.</p>
        ) : (
          <ul className="mgf-year-list">
            {byYear.map(([y, sum]) => (
              <li key={y}>
                <span>{y}</span>
                <strong>{chfFmt(sum)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mgf-panel">
        <h2 className="mgf-panel-title">Zahlungen</h2>
        <div className="mgf-table-wrap">
          <table className="mgf-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Betrag</th>
                <th>Methode</th>
                <th>Stufe</th>
                <th>Notiz</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="mgf-empty-cell">
                    Keine Zahlungen — historische Beträge ab {GOENNER_FINANCE_START_YEAR} hier erfassen.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.paid_on}</td>
                    <td className="mgf-num mgf-num--strong">{chfFmt(Number(p.amount_chf))}</td>
                    <td>{p.method}</td>
                    <td>{p.membership_id ? inquiryTierLabel(p.membership_id) : "—"}</td>
                    <td>{p.note || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="mgf-btn mgf-btn--danger mgf-btn--sm"
                        disabled={busy}
                        onClick={() => void deletePayment(p.id)}
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
