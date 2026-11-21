"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contributionTypeLabel, inquiryTierShort } from "@/content/goennerMemberships";
import {
  GOENNER_FINANCE_START_YEAR,
  expectedAnnualChf,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";
import { isNewInquiry } from "@/lib/admin-inbox";
import { prizeKindOf, type PrizeMoneyRow } from "@/lib/prize-money";
import type { GoennerInquiryRow } from "@/types/content";
import { AdminGoennerMembersClient, type StatusFilter } from "@/components/admin-goenner-members-client";
import { IconDownload, IconTrophy } from "@/components/admin/admin-icons";
import { chf, chfCompact, dateCh, categoryOf, type CategoryFilter } from "@/components/admin/admin-ui";
import { AdminRoutePanel } from "@/components/admin/admin-route-panel";
import type { UpcomingEvent } from "@/lib/kalender-upcoming";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  /** Offene und neue (ungelesene) Anfragen */
  inquiries: GoennerInquiryRow[];
  prizes: PrizeMoneyRow[];
  /** Kommende Turniere für die Saison-Route */
  events?: UpcomingEvent[];
  ledgerMissing?: boolean;
  migration020Missing?: boolean;
  initialYear: number;
  initialStatus?: StatusFilter;
  initialCategory?: CategoryFilter;
};

const LIST_LIMIT = 5;
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function SeasonChart({
  months,
  year,
  through,
}: {
  months: { pay: number; prize: number }[];
  year: number;
  through: number;
}) {
  const w = 360;
  const h = 72;
  const gap = 8;
  const barW = (w - gap * 11) / 12;
  const max = Math.max(...months.map((m) => m.pay + m.prize), 1);
  // <title> im SVG wertet der Browser beim ersten HTML als Seitentitel und leert ihn.
  const [tips, setTips] = useState(false);
  useEffect(() => {
    setTips(true);
  }, []);
  return (
    <figure className="ap-chart">
      <figcaption className="ap-kpi-label">Monatsverlauf {year}</figcaption>
      <svg viewBox={`0 0 ${w} ${h + 18}`} role="img" aria-label={`Einnahmen pro Monat ${year}`}>
        {months.map((m, i) => {
          const total = m.pay + m.prize;
          const full = Math.max(total > 0 ? 3 : 0, (total / max) * h);
          const prizeH = total > 0 ? (m.prize / total) * full : 0;
          const x = i * (barW + gap);
          const future = i >= through;
          return (
            <g key={i}>
              {tips ? (
                <title>
                  {MONTHS[i]} {year}: {total > 0 ? `CHF ${Math.round(total).toLocaleString("de-CH")}` : "keine Einnahmen"}
                </title>
              ) : null}
              {future ? (
                <rect className="ap-chart-future" x={x} y={h - 2} width={barW} height={2} rx={1} />
              ) : (
                <>
                  <rect className="ap-chart-pay" x={x} y={h - full} width={barW} height={Math.max(full - prizeH, 0)} rx={1} />
                  {prizeH > 0 ? (
                    <rect className="ap-chart-prize" x={x} y={h - prizeH} width={barW} height={prizeH} rx={1} />
                  ) : null}
                  {total === 0 ? <rect className="ap-chart-empty" x={x} y={h - 2} width={barW} height={2} rx={1} /> : null}
                </>
              )}
              <text x={x + barW / 2} y={h + 14} textAnchor="middle">
                {MONTHS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

type SourceId = "goenner" | "sponsor" | "partner" | "prize" | "proam";

const SOURCES: { id: SourceId; label: string }[] = [
  { id: "goenner", label: "Gönner" },
  { id: "sponsor", label: "Sponsoren" },
  { id: "partner", label: "Partner" },
  { id: "prize", label: "Preisgelder" },
  { id: "proam", label: "ProAms" },
];

/** "MM-DD" eines ISO-Datums, für den Vergleich «Vorjahr bis heute» */
function monthDay(iso: string) {
  return iso.slice(5, 10);
}

function todayMonthDay() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AdminOverview({
  members,
  payments,
  inquiries,
  prizes,
  events = [],
  ledgerMissing,
  migration020Missing,
  initialYear,
  initialStatus,
  initialCategory,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= GOENNER_FINANCE_START_YEAR; y--) list.push(y);
    return list;
  }, [currentYear]);

  const income = useMemo(() => {
    const catByMember = new Map(members.map((m) => [m.id, categoryOf(m)]));
    const bySource: Record<SourceId, number> = { goenner: 0, sponsor: 0, partner: 0, prize: 0, proam: 0 };
    for (const p of payments) {
      if (p.year !== year) continue;
      bySource[catByMember.get(p.member_id) ?? "goenner"] += Number(p.amount_chf || 0);
    }
    for (const r of prizes) {
      if (r.year === year) bySource[prizeKindOf(r)] += Number(r.amount_chf || 0);
    }
    const total = Object.values(bySource).reduce((s, v) => s + v, 0);
    const prizeYear = prizes.filter((r) => r.year === year);

    // Vergleich: laufende Saison mit dem Vorjahr bis zum gleichen Tag, sonst ganzes Vorjahr
    const partial = year === currentYear;
    const cutoff = todayMonthDay();
    const inPrev = (iso: string, y: number) => y === year - 1 && (!partial || monthDay(iso) <= cutoff);
    const prev =
      payments.filter((p) => inPrev(p.paid_on, p.year)).reduce((s, p) => s + Number(p.amount_chf || 0), 0) +
      prizes.filter((r) => inPrev(r.event_date, r.year)).reduce((s, r) => s + Number(r.amount_chf || 0), 0);

    return {
      bySource,
      total,
      prev,
      partial,
      prizeCount: prizeYear.filter((r) => prizeKindOf(r) === "prize").length,
      proamCount: prizeYear.filter((r) => prizeKindOf(r) === "proam").length,
    };
  }, [members, payments, prizes, year, currentYear]);

  const dues = useMemo(() => {
    const paidIds = new Set(payments.filter((p) => p.year === year).map((p) => p.member_id));
    const billable = members
      .filter((m) => m.active)
      .map((m) => ({ ...m, expected: expectedAnnualChf(m) }))
      .filter((m) => m.expected > 0);
    const unpaid = billable
      .filter((m) => !paidIds.has(m.id))
      .sort((a, b) => b.expected - a.expected || a.name.localeCompare(b.name, "de-CH"));
    return {
      billable: billable.length,
      paid: billable.length - unpaid.length,
      unpaid,
      openSum: unpaid.reduce((s, m) => s + m.expected, 0),
    };
  }, [members, payments, year]);

  const inbox = useMemo(() => {
    const isOpen = (q: GoennerInquiryRow) => !q.status || q.status === "open";
    const fresh = inquiries.filter(isNewInquiry);
    const open = inquiries.filter(isOpen);
    // Neue zuerst, dann übrige offene — jeweils neueste oben
    const list = [...fresh, ...open.filter((q) => !isNewInquiry(q))];
    return { fresh, open, list };
  }, [inquiries]);

  const months = useMemo(() => {
    const rows = Array.from({ length: 12 }, () => ({ pay: 0, prize: 0 }));
    for (const p of payments) {
      if (p.year !== year) continue;
      const i = Number(p.paid_on.slice(5, 7)) - 1;
      if (i >= 0 && i < 12) rows[i].pay += Number(p.amount_chf || 0);
    }
    for (const r of prizes) {
      if (r.year !== year) continue;
      const i = Number(String(r.event_date).slice(5, 7)) - 1;
      if (i >= 0 && i < 12) rows[i].prize += Number(r.amount_chf || 0);
    }
    return rows;
  }, [payments, prizes, year]);
  const through = year === currentYear ? new Date().getMonth() + 1 : 12;

  const reportYear = currentYear - 1;
  const diff = income.total - income.prev;
  const diffPct = income.prev > 0 ? Math.round((diff / income.prev) * 100) : null;

  return (
    <div className="ov ap-page">
      <header className="ov-head">
        <div>
          <p className="ov-eyebrow">Übersicht</p>
          <h1 className="ov-title">Saison {year}</h1>
        </div>
        <div className="ov-head-actions">
          <label className="ov-season">
            <span className="sr-only">Saison wählen</span>
            <select className="ap-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <a
            className="ov-icon-btn"
            href={`/api/admin/goenner-report?year=${reportYear}`}
            title={`Stand 31.12.${reportYear} als CSV (Excel)`}
          >
            <IconDownload />
            <span className="sr-only">Jahresreport {reportYear} herunterladen</span>
          </a>
        </div>
      </header>

      {ledgerMissing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Ledger-Tabellen fehlen. In Supabase ausführen: <code>supabase/010_goenner_finance.sql</code>
        </p>
      ) : null}
      {migration020Missing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Für Preisgelder und die «Neu»-Markierung bei Anfragen bitte in Supabase ausführen:{" "}
          <code>supabase/020_admin_inbox_seen_prize_money.sql</code>
        </p>
      ) : null}

      <AdminRoutePanel
        year={year}
        events={events}
        paid={dues.paid}
        billable={dues.billable}
        openSum={dues.openSum}
        alert={
          inbox.list[0]
            ? {
                title: inbox.list[0].name,
                meta: `${inquiryTierShort(inbox.list[0].membership_id)} · ${dateCh(inbox.list[0].created_at)}`,
                href: `/admin/goenner/inbox?filter=${isNewInquiry(inbox.list[0]) ? "new" : "open"}`,
                fresh: isNewInquiry(inbox.list[0]),
              }
            : null
        }
      />

      {/* Heute: alles, was Aufmerksamkeit braucht, mit einem Tipp erreichbar */}
      <section className="ov-card ov-today" aria-labelledby="today-heading">
        <div className="ov-card-head">
          <h2 id="today-heading" className="ov-h2">
            Heute zu tun
          </h2>
          <span className="ov-badge">{inbox.list.length + dues.unpaid.length}</span>
        </div>

        {inbox.list.length + dues.unpaid.length === 0 ? (
          <p className="ov-done">Alles erledigt.</p>
        ) : (
          <ul className="ov-actions">
            {inbox.list.slice(0, 3).map((q) => {
              const fresh = isNewInquiry(q);
              return (
                <li key={`q-${q.id}`}>
                  <Link href={`/admin/goenner/inbox?filter=${fresh ? "new" : "open"}`} className="ov-action">
                    <span className={`ov-kind${fresh ? " is-new" : ""}`}>{fresh ? "Neu" : "Anfrage"}</span>
                    <span className="ov-action-main">
                      <span className="ov-action-name">{q.name}</span>
                      <span className="ov-action-meta">
                        {inquiryTierShort(q.membership_id)} · {dateCh(q.created_at)}
                      </span>
                    </span>
                    <span className="ov-action-cta">Öffnen</span>
                  </Link>
                </li>
              );
            })}
            {dues.unpaid.slice(0, 3).map((m) => (
              <li key={`d-${m.id}`}>
                <Link href={`/admin/goenner/${m.id}`} className="ov-action">
                  <span className="ov-kind">Beitrag</span>
                  <span className="ov-action-main">
                    <span className="ov-action-name">{m.name}</span>
                    <span className="ov-action-meta">
                      {inquiryTierShort(m.membership_id)} · {chf(m.expected)}
                      {m.contribution_type && m.contribution_type !== "geld"
                        ? ` · ${contributionTypeLabel(m.contribution_type)}`
                        : ""}
                    </span>
                  </span>
                  <span className="ov-action-cta">Rechnung</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {inbox.list.length + dues.unpaid.length > 6 ? (
          <Link href="/admin/goenner/inbox" className="ov-more">
            Alle anzeigen
          </Link>
        ) : null}
      </section>

      {/* Einnahmen */}
      <section className="ov-card ov-revenue" aria-labelledby="income-heading">
        <p id="income-heading" className="ov-kicker">
          Einnahmen {year}
        </p>
        <p className="ov-amount">{chfCompact(income.total)}</p>
        <p className="ap-income-compare">
          {income.prev > 0 ? (
            <>
              <span className={diff >= 0 ? "is-up" : "is-down"}>
                {diff >= 0 ? "+" : "−"}
                {chfCompact(Math.abs(diff))}
                {diffPct !== null ? ` (${diff >= 0 ? "+" : "−"}${Math.abs(diffPct)} %)` : ""}
              </span>{" "}
              gegenüber {year - 1}
              {income.partial ? " zum gleichen Zeitpunkt" : ""}
            </>
          ) : (
            <>Keine Vergleichswerte aus {year - 1}</>
          )}
        </p>
        <SeasonChart months={months} year={year} through={through} />
        <div className="ap-mix" role="img" aria-label="Aufteilung der Einnahmen nach Quelle">
          {SOURCES.map((s) =>
            income.bySource[s.id] > 0 ? (
              <span key={s.id} className={`ap-mix-seg ap-mix--${s.id}`} style={{ flexGrow: income.bySource[s.id] }} />
            ) : null,
          )}
        </div>
        <dl className="ap-mix-legend">
          {SOURCES.map((s) => (
            <div key={s.id}>
              <dt>
                <span className={`ap-mix-dot ap-mix--${s.id}`} aria-hidden="true" />
                {s.label}
              </dt>
              <dd>{income.bySource[s.id] > 0 ? chfCompact(income.bySource[s.id]) : "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Kennzahlen: drei Kacheln, ein Blick */}
      <section className="ov-kpis" aria-label="Kennzahlen">
        <div className="ov-kpi">
          <span className="ov-kpi-label">Bezahlt</span>
          <strong className="ov-kpi-value">
            {dues.paid}
            <span className="ov-kpi-of"> / {dues.billable}</span>
          </strong>
        </div>
        <div className={`ov-kpi${dues.openSum > 0 ? " is-alert" : ""}`}>
          <span className="ov-kpi-label">Noch offen</span>
          <strong className="ov-kpi-value">{chfCompact(dues.openSum)}</strong>
        </div>
        <Link href="/admin/preisgelder" className="ov-kpi ov-kpi--link">
          <span className="ov-kpi-label">
            <IconTrophy size={14} /> Preisgelder
          </span>
          <strong className="ov-kpi-value">{chfCompact(income.bySource.prize + income.bySource.proam)}</strong>
        </Link>
      </section>

      <div className="ov-full">{ledgerMissing ? null : (
        <AdminGoennerMembersClient
          key={`${initialStatus ?? "all"}-${initialCategory ?? "all"}`}
          members={members}
          payments={payments}
          year={year}
          initialStatus={initialStatus}
          initialCategory={initialCategory}
        />
      )}</div>
    </div>
  );
}
