"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { goennerMembershipTiers, inquiryTierLabel } from "@/content/goennerMemberships";
import {
  chfFmt,
  withMemberTotals,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  schemaMissing?: boolean;
};

export function AdminGoennerMembersClient({ members, payments, schemaMissing }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enriched = useMemo(
    () => members.map((m) => withMemberTotals(m, payments)).sort((a, b) => a.name.localeCompare(b.name, "de-CH")),
    [members, payments],
  );

  const visible = enriched.filter((m) => {
    if (onlyActive && !m.active) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.name, m.email || "", m.phone || "", inquiryTierLabel(m.membership_id)]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const year = new Date().getFullYear();

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
        <label className="mgf-search">
          <span className="sr-only">Suchen</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, E-Mail, Telefon…"
          />
        </label>
        <label className="mgf-check">
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Nur aktiv
        </label>
        <button type="button" className="mgf-btn mgf-btn--primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Abbrechen" : "Gönner hinzufügen"}
        </button>
      </div>

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
                {goennerMembershipTiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="mgf-span-2">
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
              <th>Kontakt</th>
              <th>{year}</th>
              <th>{year - 1}</th>
              <th>Total ab 2022</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="mgf-empty-cell">
                  Noch keine Gönner — füge Personen hinzu oder markiere Eingänge als bezahlt.
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
                  <td className="mgf-contact">
                    {m.email ? <a href={`mailto:${m.email}`}>{m.email}</a> : <span>—</span>}
                    {m.phone ? (
                      <>
                        <br />
                        <a href={`tel:${m.phone.replace(/\s/g, "")}`}>{m.phone}</a>
                      </>
                    ) : null}
                  </td>
                  <td className="mgf-num">{chfFmt(m.year_chf)}</td>
                  <td className="mgf-num">{chfFmt(m.last_year_chf)}</td>
                  <td className="mgf-num mgf-num--strong">{chfFmt(m.total_chf)}</td>
                  <td>
                    <div className="mgf-row-actions">
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
