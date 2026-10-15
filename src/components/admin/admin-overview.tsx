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
import { IconArrowRight, IconDownload, IconInbox, IconTrophy, IconUsers } from "@/components/admin/admin-icons";
import {
  AdminPageHeader,
  ProgressBar,
  TierTag,
  categoryOf,
  chf,
  chfCompact,
  dateCh,
  type CategoryFilter,
} from "@/components/admin/admin-ui";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  /** Offene und neue (ungelesene) Anfragen */
  inquiries: GoennerInquiryRow[];
  prizes: PrizeMoneyRow[];
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
    <div className="ap-page">
      <AdminPageHeader
        eyebrow="Übersicht"
        title={`Saison ${year}`}
        description="Einnahmen, neue Anfragen und alle Gönner, Sponsoren und Partner auf einen Blick."
        actions={
          <>
            <label className="ap-field-inline">
              <span>Saison</span>
              <select className="ap-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <a
              className="ap-btn ap-btn--secondary"
              href={`/api/admin/goenner-report?year=${reportYear}`}
              title={`Stand 31.12.${reportYear} als CSV (Excel)`}
            >
              <IconDownload />
              Jahresreport {reportYear}
            </a>
          </>
        }
      />

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

      {inbox.fresh.length > 0 ? (
        <Link href="/admin/goenner/inbox?filter=new" className="ap-alert-new">
          <span className="ap-alert-new-count" aria-hidden="true">
            {inbox.fresh.length}
          </span>
          <span className="ap-alert-new-text">
            <strong>
              {inbox.fresh.length === 1 ? "1 neue Anfrage" : `${inbox.fresh.length} neue Anfragen`}
            </strong>
            <span>
              {inbox.fresh
                .slice(0, 3)
                .map((q) => `${q.name} (${inquiryTierShort(q.membership_id)})`)
                .join(" · ")}
              {inbox.fresh.length > 3 ? " …" : ""}
            </span>
          </span>
          <span className="ap-alert-new-cta">
            Ansehen <IconArrowRight size={14} />
          </span>
        </Link>
      ) : null}

      <section className="ap-income" aria-labelledby="income-heading">
        <div className="ap-income-main">
          <p id="income-heading" className="ap-kpi-label">
            Einnahmen Saison {year}
          </p>
          <strong className="ap-income-value">{chfCompact(income.total)}</strong>
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
                <span
                  key={s.id}
                  className={`ap-mix-seg ap-mix--${s.id}`}
                  style={{ flexGrow: income.bySource[s.id] }}
                />
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
        </div>

        <div className="ap-income-side">
          <div className="ap-income-stat">
            <span className="ap-kpi-label">Beiträge bezahlt</span>
            <strong className="ap-kpi-value">
              {dues.paid}
              <span className="ap-kpi-of"> / {dues.billable}</span>
            </strong>
            <ProgressBar value={dues.paid} max={dues.billable} label={`Beiträge bezahlt ${year}`} />
          </div>
          <div className={`ap-income-stat${dues.openSum > 0 ? " is-alert" : ""}`}>
            <span className="ap-kpi-label">Noch offen</span>
            <strong className="ap-kpi-value">{chfCompact(dues.openSum)}</strong>
            <span className="ap-kpi-foot">
              {dues.unpaid.length === 1 ? "1 Beitrag" : `${dues.unpaid.length} Beiträge`}
            </span>
          </div>
          <Link href="/admin/preisgelder" className="ap-income-stat ap-income-stat--link">
            <span className="ap-kpi-label">
              <IconTrophy size={14} /> Preisgelder
            </span>
            <strong className="ap-kpi-value">{chfCompact(income.bySource.prize + income.bySource.proam)}</strong>
            <span className="ap-kpi-foot">
              {income.prizeCount + income.proamCount === 0
                ? "Noch keine erfasst — jetzt erfassen"
                : `${income.prizeCount} ${income.prizeCount === 1 ? "Turnier" : "Turniere"} · ${income.proamCount} ${
                    income.proamCount === 1 ? "ProAm" : "ProAms"
                  } (${chfCompact(income.bySource.proam)})`}
            </span>
          </Link>
        </div>
      </section>

      <div className="ap-grid-2">
        <section className="ap-card" aria-labelledby="inbox-heading">
          <div className="ap-card-head">
            <IconInbox />
            <h2 id="inbox-heading" className="ap-h2">
              Offene Anfragen
            </h2>
            {inbox.fresh.length > 0 ? <span className="ap-pill-new">{inbox.fresh.length} neu</span> : null}
            <span className="ap-count">{inbox.list.length}</span>
          </div>
          {inbox.list.length === 0 ? (
            <p className="ap-empty-inline">Keine offenen Anfragen — alles erledigt.</p>
          ) : (
            <ul className="ap-todo-list">
              {inbox.list.slice(0, LIST_LIMIT).map((q) => {
                const fresh = isNewInquiry(q);
                return (
                  <li key={q.id}>
                    <Link
                      href={`/admin/goenner/inbox?filter=${fresh ? "new" : "open"}`}
                      className={`ap-todo-row${fresh ? " is-new" : ""}`}
                    >
                      <span className="ap-todo-main">
                        <span className="ap-todo-name">
                          {fresh ? <span className="ap-new-dot" aria-label="Neu" /> : null}
                          {q.name}
                        </span>
                        <span className="ap-todo-meta">
                          Eingang {dateCh(q.created_at)}
                          {q.payment_method ? ` · ${q.payment_method === "twint" ? "TWINT" : "Rechnung"}` : ""}
                        </span>
                      </span>
                      <TierTag id={q.membership_id}>{inquiryTierShort(q.membership_id)}</TierTag>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/admin/goenner/inbox" className="ap-link-more">
            {inbox.list.length > LIST_LIMIT ? `Alle ${inbox.list.length} Anfragen bearbeiten` : "Zu den Eingängen"}
            <IconArrowRight size={14} />
          </Link>
        </section>

        <section className="ap-card" aria-labelledby="dues-heading">
          <div className="ap-card-head">
            <IconUsers />
            <h2 id="dues-heading" className="ap-h2">
              Offene Beiträge {year}
            </h2>
            <span className="ap-count">{dues.unpaid.length}</span>
          </div>
          {dues.unpaid.length === 0 ? (
            <p className="ap-empty-inline">Alle Beiträge mit Betrag sind für {year} bezahlt.</p>
          ) : (
            <ul className="ap-todo-list">
              {dues.unpaid.slice(0, LIST_LIMIT).map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/goenner/${m.id}`} className="ap-todo-row">
                    <span className="ap-todo-main">
                      <span className="ap-todo-name">{m.name}</span>
                      <span className="ap-todo-meta">
                        {m.organization ? `${m.organization} · ` : ""}
                        {inquiryTierShort(m.membership_id)}
                        {m.contribution_type && m.contribution_type !== "geld"
                          ? ` · ${contributionTypeLabel(m.contribution_type)}`
                          : ""}
                      </span>
                    </span>
                    <span className="ap-num">{chf(m.expected)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {dues.unpaid.length > 0 ? (
            <Link href={`/admin?status=open${year !== currentYear ? `&year=${year}` : ""}#liste`} className="ap-link-more">
              {dues.unpaid.length > LIST_LIMIT ? `Alle ${dues.unpaid.length} in der Liste zeigen` : "In der Liste zeigen"}
              <IconArrowRight size={14} />
            </Link>
          ) : null}
        </section>
      </div>

      {ledgerMissing ? null : (
        <AdminGoennerMembersClient
          key={`${initialStatus ?? "all"}-${initialCategory ?? "all"}`}
          members={members}
          payments={payments}
          year={year}
          initialStatus={initialStatus}
          initialCategory={initialCategory}
        />
      )}
    </div>
  );
}
