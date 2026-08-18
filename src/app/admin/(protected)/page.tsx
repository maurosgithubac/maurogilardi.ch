import Link from "next/link";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import {
  GOENNER_FINANCE_START_YEAR,
  chfFmt,
  withMemberTotals,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";
import type { GoennerInquiryRow } from "@/types/content";

export default async function AdminFinanceHomePage() {
  const supabase = await createSupabaseUserServerClient();
  const year = new Date().getFullYear();

  const [membersRes, paymentsRes, inquiriesRes] = await Promise.all([
    supabase.from("goenner_members").select("*"),
    supabase.from("goenner_payments").select("*"),
    supabase.from("goenner_inquiries").select("*").eq("status", "open").order("created_at", { ascending: false }),
  ]);

  const schemaMissing =
    Boolean(membersRes.error?.message?.includes("does not exist")) ||
    Boolean(paymentsRes.error?.message?.includes("schema cache"));

  const members = (membersRes.data as GoennerMemberRow[]) ?? [];
  const payments = (paymentsRes.data as GoennerPaymentRow[]) ?? [];
  const openInquiries = (inquiriesRes.data as GoennerInquiryRow[]) ?? [];

  const enriched = members.map((m) => withMemberTotals(m, payments));
  const yearSum = payments.filter((p) => p.year === year).reduce((s, p) => s + Number(p.amount_chf), 0);
  const lastYearSum = payments.filter((p) => p.year === year - 1).reduce((s, p) => s + Number(p.amount_chf), 0);
  const totalSum = payments
    .filter((p) => p.year >= GOENNER_FINANCE_START_YEAR)
    .reduce((s, p) => s + Number(p.amount_chf), 0);
  const top = [...enriched].sort((a, b) => b.total_chf - a.total_chf).slice(0, 5);

  return (
    <div className="mgf-page">
      <header className="mgf-page-head">
        <p className="mgf-kicker">MG Finance</p>
        <h1 className="mgf-h1">Übersicht</h1>
        <p className="mgf-lead">
          Professionelle Verwaltung aller Gönner und Zahlungen — von {GOENNER_FINANCE_START_YEAR} bis heute.
        </p>
      </header>

      {schemaMissing ? (
        <p className="mgf-banner mgf-banner--warn">
          Bitte in Supabase ausführen: <code>supabase/010_goenner_finance.sql</code> (und bei Bedarf{" "}
          <code>009_goenner_inquiries_membership_hundert.sql</code>).
        </p>
      ) : null}

      <div className="mgf-kpi-grid">
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Einnahmen {year}</span>
          <strong>{chfFmt(yearSum)}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Einnahmen {year - 1}</span>
          <strong>{chfFmt(lastYearSum)}</strong>
        </div>
        <div className="mgf-kpi mgf-kpi--accent">
          <span className="mgf-kpi-label">Total seit {GOENNER_FINANCE_START_YEAR}</span>
          <strong>{chfFmt(totalSum)}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Aktive Gönner</span>
          <strong>{members.filter((m) => m.active).length}</strong>
        </div>
        <div className="mgf-kpi">
          <span className="mgf-kpi-label">Offene Eingänge</span>
          <strong>{openInquiries.length}</strong>
        </div>
      </div>

      <div className="mgf-home-actions">
        <Link href="/admin/goenner" className="mgf-btn mgf-btn--primary">
          Gönner verwalten
        </Link>
        <Link href="/admin/goenner/inbox" className="mgf-btn mgf-btn--ghost">
          Eingänge ({openInquiries.length})
        </Link>
      </div>

      <section className="mgf-panel">
        <div className="mgf-panel-head">
          <h2 className="mgf-panel-title">Top Unterstützer (Total)</h2>
          <Link href="/admin/goenner" className="mgf-text-link">
            Alle
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="mgf-muted">Noch keine Daten — historische Zahlungen folgen oder jetzt erfassen.</p>
        ) : (
          <ul className="mgf-rank-list">
            {top.map((m, index) => (
              <li key={m.id}>
                <span className="mgf-rank-index">{index + 1}</span>
                <Link href={`/admin/goenner/${m.id}`} className="mgf-rank-name">
                  {m.name}
                </Link>
                <span className="mgf-rank-meta">
                  {year}: {chfFmt(m.year_chf)} · Total {chfFmt(m.total_chf)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
