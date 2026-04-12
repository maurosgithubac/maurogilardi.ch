"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  GOENNER_SPONSORING_MIN_CHF,
  inquiryTierLabel,
  membershipPriceChf,
} from "@/content/goennerMemberships";
import type { GoennerInquiryRow } from "@/types/content";

function formatPostalAddress(row: GoennerInquiryRow): string | null {
  const street = row.street?.trim();
  const plz = row.postal_code?.trim();
  const city = row.city?.trim();
  if (street && plz && city) return `${street}, ${plz} ${city}`;
  const parts = [street, plz, city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function chfFmt(n: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);
}

function isDone(row: GoennerInquiryRow) {
  return row.status === "completed";
}

export function AdminGoennerInquiriesClient({ rows }: { rows: GoennerInquiryRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [completeForId, setCompleteForId] = useState<string | null>(null);
  const [amountDraft, setAmountDraft] = useState("");

  const openRows = rows.filter((r) => !isDone(r));
  const doneRows = rows
    .filter(isDone)
    .sort(
      (a, b) =>
        new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime(),
    );
  const totalChf = doneRows.reduce((s, r) => s + (Number(r.amount_chf) || 0), 0);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/goenner-inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Aktion fehlgeschlagen.");
        return;
      }
      setCompleteForId(null);
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  function openCompleteForm(row: GoennerInquiryRow) {
    setCompleteForId(row.id);
    setAmountDraft(String(membershipPriceChf(row.membership_id) || ""));
    setFormError(null);
  }

  function renderCard(row: GoennerInquiryRow, variant: "open" | "completed") {
    const addressLine = formatPostalAddress(row);
    const busy = busyId === row.id;

    return (
      <li key={row.id}>
        <article
          className={`admin-goenner-card${variant === "completed" ? " admin-goenner-card--done" : ""}`}
        >
          <header className="admin-goenner-card-head">
            <div className="admin-goenner-card-title">
              <strong>{row.name}</strong>
              <span className="admin-goenner-tier">{inquiryTierLabel(row.membership_id)}</span>
            </div>
            <div className="admin-goenner-card-meta">
              {variant === "completed" && row.completed_at ? (
                <span className="admin-goenner-done-badge" title="Erledigt am">
                  Erledigt{" "}
                  {new Date(row.completed_at).toLocaleString("de-CH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              ) : null}
              <time dateTime={row.created_at}>
                Eingang:{" "}
                {new Date(row.created_at).toLocaleString("de-CH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
          </header>

          {variant === "completed" && row.amount_chf != null ? (
            <p className="admin-goenner-amount-line">
              <span className="admin-goenner-amount-label">Erfasster Betrag</span>
              <strong className="admin-goenner-amount-value">{chfFmt(Number(row.amount_chf))}</strong>
            </p>
          ) : null}

          <div className="admin-goenner-panels">
            <section className="admin-goenner-panel" aria-label="Kontakt">
              <h3 className="admin-goenner-panel-title">Kontakt</h3>
              <p className="admin-goenner-panel-body">
                <a href={`mailto:${encodeURIComponent(row.email)}`}>{row.email}</a>
                {row.phone ? (
                  <>
                    <br />
                    <a href={`tel:${row.phone.replace(/\s/g, "")}`}>{row.phone}</a>
                  </>
                ) : (
                  <span className="admin-goenner-dash"> · kein Telefon</span>
                )}
              </p>
            </section>

            <section className="admin-goenner-panel" aria-label="Adresse">
              <h3 className="admin-goenner-panel-title">Adresse</h3>
              <p className="admin-goenner-panel-body admin-goenner-panel-body--address">
                {addressLine ?? <span className="admin-muted">— nicht erfasst (ältere Anfrage)</span>}
              </p>
            </section>
          </div>

          {row.message ? (
            <section className="admin-goenner-note" aria-label="Nachricht">
              <h3 className="admin-goenner-panel-title">Nachricht</h3>
              <p className="admin-goenner-message">{row.message}</p>
            </section>
          ) : null}

          {variant === "open" ? (
            <footer className="admin-goenner-actions">
              {completeForId === row.id ? (
                <form
                  className="admin-goenner-complete-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = parseFloat(amountDraft.replace(",", "."));
                    if (!Number.isFinite(n) || n < 0) {
                      setFormError("Bitte einen gültigen Betrag eingeben.");
                      return;
                    }
                    if (row.membership_id === "sponsoring" && n < GOENNER_SPONSORING_MIN_CHF) {
                      setFormError(
                        `Sponsoring: Betrag muss ≥ ${GOENNER_SPONSORING_MIN_CHF.toLocaleString("de-CH")} CHF sein.`,
                      );
                      return;
                    }
                    void patch(row.id, { status: "completed", amount_chf: n });
                  }}
                >
                  <label className="admin-goenner-amount-field">
                    <span>Betrag (CHF)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amountDraft}
                      onChange={(e) => setAmountDraft(e.target.value)}
                      disabled={busy}
                      aria-describedby={`goenner-hint-${row.id}`}
                    />
                  </label>
                  <p id={`goenner-hint-${row.id}`} className="admin-goenner-form-hint">
                    {row.membership_id === "sponsoring"
                      ? `Sponsoring: erfasster Betrag ≥ ${GOENNER_SPONSORING_MIN_CHF.toLocaleString("de-CH")} CHF (Mindestbetrag); bei höherem Paket anpassen.`
                      : "Vorschlag = Listenpreis der Stufe; anpassen falls abweichend."}
                  </p>
                  <div className="admin-goenner-form-buttons">
                    <button type="submit" className="admin-btn" disabled={busy}>
                      {busy ? "Speichern…" : "Als erledigt speichern"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={busy}
                      onClick={() => {
                        setCompleteForId(null);
                        setFormError(null);
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busy}
                  onClick={() => openCompleteForm(row)}
                >
                  Als erledigt markieren
                </button>
              )}
            </footer>
          ) : (
            <footer className="admin-goenner-actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm("Anfrage wieder als offen führen? Betrag und Datum werden gelöscht.")) {
                    return;
                  }
                  void patch(row.id, { status: "open" });
                }}
              >
                {busy ? "…" : "Wieder offen"}
              </button>
            </footer>
          )}
        </article>
      </li>
    );
  }

  return (
    <>
      <div className="admin-inline-kpis">
        <div className="admin-inline-kpi">
          <span className="admin-inline-kpi-label">Offen</span>
          <strong>{openRows.length}</strong>
        </div>
        <div className="admin-inline-kpi">
          <span className="admin-inline-kpi-label">Erledigt</span>
          <strong>{doneRows.length}</strong>
        </div>
        <div className="admin-inline-kpi">
          <span className="admin-inline-kpi-label">Summe erledigt (CHF)</span>
          <strong>{chfFmt(totalChf)}</strong>
        </div>
      </div>

      {formError ? <p className="admin-goenner-api-error">{formError}</p> : null}

      {openRows.length > 0 ? (
        <>
          <h2 className="admin-goenner-section-title">Offene Anfragen</h2>
          <ul className="admin-goenner-list">{openRows.map((row) => renderCard(row, "open"))}</ul>
        </>
      ) : null}

      {doneRows.length > 0 ? (
        <>
          <h2 className="admin-goenner-section-title admin-goenner-section-title--spaced">Erledigt (Archiv)</h2>
          <p className="admin-muted admin-goenner-section-dek">
            Alle erfassten Beträge bleiben in der Datenbank; die Summe oben bezieht sich nur auf erledigte
            Einträge.
          </p>
          <ul className="admin-goenner-list">{doneRows.map((row) => renderCard(row, "completed"))}</ul>
        </>
      ) : null}
    </>
  );
}
