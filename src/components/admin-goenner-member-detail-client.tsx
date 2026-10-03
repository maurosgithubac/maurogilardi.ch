"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import {
  adminMembershipOptions,
  contributionTypeLabel,
  contributionTypeOptions,
  inquiryTierShort,
  memberCategoryLabel,
  memberCategoryOptions,
  type ContributionType,
  type MemberCategory,
} from "@/content/goennerMemberships";
import {
  GOENNER_FINANCE_START_YEAR,
  expectedAnnualChf,
  formatDateCh,
  sumPaymentsForYear,
  sumPaymentsTotal,
  type GoennerMemberRow,
  type GoennerPaymentMethod,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";
import { IconArrowLeft, IconFile, IconTrash } from "@/components/admin/admin-icons";
import { ContributionTag, StatusBadge, TierTag, categoryOf, chf, chfCompact, dateCh } from "@/components/admin/admin-ui";

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

const methodLabel = (id: string) => METHODS.find((m) => m.id === id)?.label ?? id;

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
  const expected = expectedAnnualChf(member);
  const paidThisYear = payments.some((p) => p.year === year);
  const billable = expected > 0;
  const cat = categoryOf(member);

  // Zeitleiste 2022 … heute: bezahlt / offen pro Jahr
  const timeline = useMemo(() => {
    const map = new Map<number, { sum: number; count: number }>();
    for (const p of payments) {
      if (p.year < GOENNER_FINANCE_START_YEAR) continue;
      const prev = map.get(p.year) || { sum: 0, count: 0 };
      map.set(p.year, { sum: prev.sum + Number(p.amount_chf), count: prev.count + 1 });
    }
    const list: { year: number; sum: number; count: number }[] = [];
    for (let y = GOENNER_FINANCE_START_YEAR; y <= year; y++) {
      const v = map.get(y);
      list.push({ year: y, sum: v?.sum ?? 0, count: v?.count ?? 0 });
    }
    return list;
  }, [payments, year]);
  const paidYears = timeline.filter((t) => t.count > 0).length;

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

  const set = <K extends keyof GoennerMemberRow>(key: K, value: GoennerMemberRow[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="ap-page">
      <nav aria-label="Brotkrumen" className="ap-crumbs">
        <Link href="/admin/goenner" className="ap-back">
          <IconArrowLeft size={14} />
          Alle Gönner
        </Link>
      </nav>

      <header className="ap-detail-head">
        <div className="ap-detail-id">
          <span className="ap-avatar" aria-hidden="true">
            {member.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase())
              .join("")}
          </span>
          <div>
            <h1 className="ap-h1">{member.name}</h1>
            {member.organization ? <p className="ap-detail-org">{member.organization}</p> : null}
            <div className="ap-detail-meta">
              <span className={`ap-cat ap-cat--${cat} ap-cat--inline`}>{memberCategoryLabel(cat)}</span>
              <TierTag id={member.membership_id}>{inquiryTierShort(member.membership_id)}</TierTag>
              <ContributionTag id={member.contribution_type}>{contributionTypeLabel(member.contribution_type)}</ContributionTag>
              {billable ? <span className="ap-num">{chf(expected)} / Jahr</span> : null}
              {paidThisYear ? (
                <StatusBadge state="paid">Bezahlt {year}</StatusBadge>
              ) : !billable ? (
                <StatusBadge state="none">{member.contribution_type === "material" ? "Sachleistung" : "Ohne fixen Betrag"}</StatusBadge>
              ) : member.active ? (
                <StatusBadge state="open">Offen {year}</StatusBadge>
              ) : null}
              {!member.active ? <span className="ap-tag-muted">inaktiv</span> : null}
              {member.member_since ? <span className="ap-tag-muted">Mitglied seit {formatDateCh(member.member_since)}</span> : null}
            </div>
          </div>
        </div>
        <div className="ap-page-actions">
          <button
            type="button"
            className="ap-btn ap-btn--secondary"
            disabled={invoiceBusy || !lastPayment}
            onClick={() => void downloadInvoice()}
            title={lastPayment ? `Rechnung über ${chf(Number(lastPayment.amount_chf))}` : "Zuerst Zahlung erfassen"}
          >
            <IconFile />
            {invoiceBusy ? "Erstelle…" : "Rechnung (Word)"}
          </button>
        </div>
      </header>

      <p className="ap-muted-sm ap-detail-note">
        {lastPayment
          ? `Rechnung basiert auf der letzten Einzahlung vom ${dateCh(lastPayment.paid_on)} (${chf(Number(lastPayment.amount_chf))}).`
          : "Für die Rechnung brauchst du mindestens eine erfasste Zahlung."}
      </p>

      <dl className="ap-facts">
        <div>
          <dt>{year}</dt>
          <dd>{chfCompact(yearTotal)}</dd>
        </div>
        <div>
          <dt>Vorjahr ({lastYear})</dt>
          <dd>{chfCompact(lastYearTotal)}</dd>
        </div>
        <div>
          <dt>Total seit {GOENNER_FINANCE_START_YEAR}</dt>
          <dd>{chfCompact(total)}</dd>
        </div>
        <div>
          <dt>Letzte Zahlung</dt>
          <dd>{lastPayment ? dateCh(lastPayment.paid_on) : "—"}</dd>
        </div>
      </dl>

      {error ? (
        <p className="ap-banner ap-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="ap-card" aria-labelledby="history-heading">
        <div className="ap-card-head">
          <h2 id="history-heading" className="ap-h2">
            Zahlungshistorie
          </h2>
          <span className="ap-card-sub">
            {paidYears} von {timeline.length} Jahren bezahlt
          </span>
        </div>
        <ol className="ap-timeline">
          {timeline.map((t) => {
            const state = t.count > 0 ? "paid" : t.year === year && member.active && billable ? "open" : "none";
            return (
              <li key={t.year} className={`ap-timeline-item is-${state}`}>
                <span className="ap-timeline-year">{t.year}</span>
                <span className="ap-timeline-dot" aria-hidden="true" />
                <StatusBadge state={state}>
                  {state === "paid" ? "Bezahlt" : state === "open" ? "Offen" : "Keine Zahlung"}
                </StatusBadge>
                <span className="ap-timeline-amount">{t.count > 0 ? chf(t.sum) : "—"}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="ap-detail-grid">
        <form className="ap-card ap-form" onSubmit={saveMember} aria-labelledby="master-heading">
          <div className="ap-card-head">
            <h2 id="master-heading" className="ap-h2">
              Stammdaten
            </h2>
          </div>

          <fieldset className="ap-fieldset">
            <legend>Zuordnung</legend>
            <div className="ap-form-grid">
              <label className="ap-field">
                <span className="ap-label">Kategorie</span>
                <select
                  className="ap-select"
                  value={draft.category || "goenner"}
                  onChange={(e) => set("category", e.target.value as MemberCategory)}
                >
                  {memberCategoryOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ap-field">
                <span className="ap-label">Art der Leistung</span>
                <select
                  className="ap-select"
                  value={draft.contribution_type || "geld"}
                  onChange={(e) => set("contribution_type", e.target.value as ContributionType)}
                >
                  {contributionTypeOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ap-field ap-span-2">
                <span className="ap-label">Organisation</span>
                <input
                  className="ap-input"
                  value={draft.organization || ""}
                  placeholder="Firma, Verband (optional)"
                  onChange={(e) => set("organization", e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Kontakt</legend>
            <div className="ap-form-grid">
              <label className="ap-field ap-span-2">
                <span className="ap-label">Name / Kontaktperson</span>
                <input className="ap-input" value={draft.name} onChange={(e) => set("name", e.target.value)} required />
              </label>
              <label className="ap-field">
                <span className="ap-label">E-Mail</span>
                <input
                  className="ap-input"
                  type="email"
                  value={draft.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </label>
              <label className="ap-field">
                <span className="ap-label">Telefon</span>
                <input
                  className="ap-input"
                  type="tel"
                  value={draft.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Adresse</legend>
            <div className="ap-form-grid ap-form-grid--addr">
              <label className="ap-field ap-span-all">
                <span className="ap-label">Strasse</span>
                <input className="ap-input" value={draft.street || ""} onChange={(e) => set("street", e.target.value)} />
              </label>
              <label className="ap-field">
                <span className="ap-label">PLZ</span>
                <input
                  className="ap-input"
                  value={draft.postal_code || ""}
                  onChange={(e) => set("postal_code", e.target.value)}
                />
              </label>
              <label className="ap-field">
                <span className="ap-label">Ort</span>
                <input className="ap-input" value={draft.city || ""} onChange={(e) => set("city", e.target.value)} />
              </label>
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Beitrag</legend>
            <div className="ap-form-grid">
              <label className="ap-field">
                <span className="ap-label">Stufe</span>
                <select
                  className="ap-select"
                  value={draft.membership_id}
                  onChange={(e) => set("membership_id", e.target.value)}
                >
                  {adminMembershipOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ap-field">
                <span className="ap-label">Jahresbetrag (CHF)</span>
                <input
                  className="ap-input ap-input--num"
                  inputMode="decimal"
                  placeholder="leer = Listenpreis / kein Betrag"
                  value={draft.annual_amount_chf ?? ""}
                  onChange={(e) =>
                    set(
                      "annual_amount_chf",
                      e.target.value === "" ? null : Number(e.target.value.replace(",", ".")),
                    )
                  }
                />
              </label>
              <label className="ap-field">
                <span className="ap-label">Mitglied seit</span>
                <input
                  className="ap-input"
                  type="date"
                  value={draft.member_since ?? ""}
                  onChange={(e) => set("member_since", e.target.value || null)}
                />
              </label>
              <label className="ap-switch ap-span-2">
                <input type="checkbox" checked={draft.active} onChange={(e) => set("active", e.target.checked)} />
                <span>Aktiv — erscheint in Soll und offenen Beiträgen</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Notizen</legend>
            <label className="ap-field">
              <span className="sr-only">Notizen</span>
              <textarea
                className="ap-input ap-textarea"
                rows={3}
                value={draft.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
          </fieldset>

          <div className="ap-form-actions">
            <button type="submit" className="ap-btn ap-btn--primary" disabled={busy}>
              {busy ? "Speichern…" : "Stammdaten speichern"}
            </button>
          </div>
        </form>

        <form className="ap-card ap-form ap-card--sticky" onSubmit={addPayment} aria-labelledby="pay-heading">
          <div className="ap-card-head">
            <h2 id="pay-heading" className="ap-h2">
              Zahlung erfassen
            </h2>
          </div>
          <div className="ap-form-grid">
            <label className="ap-field">
              <span className="ap-label">Betrag (CHF)</span>
              <input
                className="ap-input ap-input--num"
                name="amount_chf"
                required
                inputMode="decimal"
                placeholder={expected ? String(expected) : "Betrag"}
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Datum</span>
              <input
                className="ap-input"
                name="paid_on"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label className="ap-field">
              <span className="ap-label">Methode</span>
              <select className="ap-select" name="method" defaultValue="twint">
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ap-field">
              <span className="ap-label">Stufe (Zahlung)</span>
              <select className="ap-select" name="membership_id" defaultValue={member.membership_id}>
                {adminMembershipOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="ap-field ap-span-2">
              <span className="ap-label">Notiz</span>
              <input className="ap-input" name="note" maxLength={400} />
            </label>
          </div>
          <div className="ap-form-actions">
            <button type="submit" className="ap-btn ap-btn--accent" disabled={busy}>
              {busy ? "Speichern…" : "Zahlung hinzufügen"}
            </button>
          </div>
        </form>
      </div>

      <section className="ap-card ap-card--flush" aria-labelledby="payments-heading">
        <div className="ap-card-head">
          <h2 id="payments-heading" className="ap-h2">
            Zahlungen
          </h2>
          <span className="ap-count">{payments.length}</span>
        </div>
        <div className="ap-table-wrap">
          <table className="ap-table ap-table--payments">
            <thead>
              <tr>
                <th scope="col">Datum</th>
                <th scope="col" className="ap-num">
                  Betrag
                </th>
                <th scope="col">Methode</th>
                <th scope="col">Stufe</th>
                <th scope="col">Notiz</th>
                <th scope="col" className="ap-col-actions">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr className="ap-empty-row">
                  <td colSpan={6}>
                    <div className="ap-empty">
                      <p className="ap-empty-title">Noch keine Zahlungen</p>
                      <p className="ap-muted-sm">
                        Historische Beträge ab {GOENNER_FINANCE_START_YEAR} über «Zahlung erfassen» nachtragen.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td className="ap-cell-name">
                      <span className="ap-row-title ap-num">{dateCh(p.paid_on)}</span>
                    </td>
                    <td className="ap-num ap-num--strong" data-label="Betrag">
                      {chf(Number(p.amount_chf))}
                    </td>
                    <td data-label="Methode">{methodLabel(p.method)}</td>
                    <td data-label="Stufe">
                      {p.membership_id ? (
                        <TierTag id={p.membership_id}>{inquiryTierShort(p.membership_id)}</TierTag>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td data-label="Notiz" className="ap-cell-note">
                      {p.note || "—"}
                    </td>
                    <td className="ap-col-actions">
                      <button
                        type="button"
                        className="ap-icon-btn ap-icon-btn--danger"
                        disabled={busy}
                        onClick={() => void deletePayment(p.id)}
                        aria-label={`Zahlung vom ${dateCh(p.paid_on)} löschen`}
                        title="Zahlung löschen"
                      >
                        <IconTrash />
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
