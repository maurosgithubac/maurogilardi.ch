"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import {
  IconCalendar,
  IconCopy,
  IconDownload,
  IconFlag,
  IconInbox,
  IconPlus,
  IconTrophy,
  IconUsers,
} from "@/components/admin/admin-icons";
import { AreaChart, Bars, Gauge, Ring } from "@/components/admin/dash-charts";
import { categoriesFor, monthlyAmounts, type BudgetEntryRow } from "@/lib/budget";
import { chf, chfCompact, dateCh, categoryOf, type CategoryFilter } from "@/components/admin/admin-ui";
import type { UpcomingEvent } from "@/lib/kalender-upcoming";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  /** Offene und neue (ungelesene) Anfragen */
  inquiries: GoennerInquiryRow[];
  prizes: PrizeMoneyRow[];
  /** Kommende Turniere */
  events?: UpcomingEvent[];
  /** Golf-Ausgaben aus dem Budget (für Verlauf und Ergebnis) */
  budget?: BudgetEntryRow[];
  /** Anzahl Newsletter-Abonnenten */
  newsletter?: number | null;
  /** Zusammenfassung des neuesten Gönnerturniers */
  tournament?: TournamentSummary | null;
  ledgerMissing?: boolean;
  migration020Missing?: boolean;
  initialYear: number;
  initialStatus?: StatusFilter;
  initialCategory?: CategoryFilter;
};

export type TournamentSummary = {
  id: string;
  title: string;
  event_date: string;
  status: string;
  invited: number;
  responded: number;
  clinic: number;
  round: number;
  dinner: number;
};

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

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
  budget = [],
  newsletter = null,
  tournament = null,
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

  // Verläufe: kumulierte Einnahmen, Vorjahr und Ausgaben (Budget)
  const series = useMemo(() => {
    const cum = (arr: number[]) => {
      let s = 0;
      return arr.map((v) => (s += v));
    };
    const prevM = Array.from({ length: 12 }, () => 0);
    for (const p of payments) {
      if (p.year !== year - 1) continue;
      const i = Number(p.paid_on.slice(5, 7)) - 1;
      if (i >= 0 && i < 12) prevM[i] += Number(p.amount_chf || 0);
    }
    for (const r of prizes) {
      if (r.year !== year - 1) continue;
      const i = Number(String(r.event_date).slice(5, 7)) - 1;
      if (i >= 0 && i < 12) prevM[i] += Number(r.amount_chf || 0);
    }
    const expanded = monthlyAmounts(budget, year);
    const expM = Array.from({ length: 12 }, (_, m) => expanded.reduce((s, x) => s + x.months[m], 0));
    const byCat: Record<string, number> = {};
    for (const x of expanded) {
      const t = x.months.reduce((s, v) => s + v, 0);
      if (t > 0) byCat[x.entry.category] = (byCat[x.entry.category] ?? 0) + t;
    }
    const goCats = categoriesFor("golf");
    const topCats = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, v]) => ({ id, v, label: goCats.find((c) => c.id === id)?.label ?? id, icon: goCats.find((c) => c.id === id)?.icon ?? "📦" }));
    return {
      income: cum(months.map((m) => m.pay + m.prize)),
      prev: cum(prevM),
      exp: cum(expM),
      expM,
      expTotal: expM.reduce((s, v) => s + v, 0),
      topCats,
    };
  }, [months, payments, prizes, budget, year]);

  const result = income.total - series.expTotal;

  const memberMix = useMemo(() => {
    const active = members.filter((m) => m.active);
    const count = { goenner: 0, sponsor: 0, partner: 0 };
    for (const m of active) count[categoryOf(m)] += 1;
    return { ...count, total: active.length };
  }, [members]);

  const latestPrizes = useMemo(
    () => [...prizes].sort((a, b) => String(b.event_date).localeCompare(String(a.event_date))).slice(0, 4),
    [prizes],
  );

  const respondPct = tournament && tournament.invited > 0 ? Math.round((tournament.responded / tournament.invited) * 100) : 0;
  const todayCount = inbox.list.length + dues.unpaid.length;
  const alert = inbox.list[0] ?? null;

  const shortcuts = [
    { href: "/admin/rechnungen", label: "Neue Rechnung", hint: "Mail-Entwurf mit PDF", icon: <IconCopy size={20} /> },
    { href: "/admin/budget", label: "Ausgabe erfassen", hint: "Golf oder Privat", icon: <IconFlag size={20} /> },
    { href: "/admin/kalender", label: "Termin hinzufügen", hint: "Saison-Kalender", icon: <IconCalendar size={20} /> },
    { href: "/admin/preisgelder", label: "Preisgeld erfassen", hint: "Turniere und ProAms", icon: <IconTrophy size={20} /> },
    { href: "/admin/goenner/inbox", label: "Eingänge", hint: `${inbox.list.length} offen`, icon: <IconInbox size={20} /> },
    { href: "/admin/turnier", label: "Gönnerturnier", hint: tournament ? tournament.title : "Anlass anlegen", icon: <IconUsers size={20} /> },
  ];

  return (
    <div className="ov dash ap-page">
      <header className="dash-head">
        <div className="dash-head-text">
          <p className="ov-eyebrow">Dashboard</p>
          <h1 className="ov-title">Saison {year}</h1>
          <p className="dash-sub">Einnahmen, Beiträge, Turniere und Termine auf einen Blick.</p>
        </div>
        <div className="dash-head-actions">
          <div className="dash-chips" role="group" aria-label="Saison wählen">
            {years.map((y) => (
              <button key={y} type="button" className={y === year ? "is-on" : ""} aria-pressed={y === year} onClick={() => setYear(y)}>
                {y}
              </button>
            ))}
          </div>
          <Link href="/admin/rechnungen" className="dash-btn is-fill">
            <IconPlus size={16} /> Rechnung
          </Link>
          <Link href="/admin/budget" className="dash-btn">
            <IconPlus size={16} /> Ausgabe
          </Link>
          <a className="dash-btn dash-btn--icon" href={`/api/admin/goenner-report?year=${reportYear}`} title={`Stand 31.12.${reportYear} als CSV (Excel)`}>
            <IconDownload size={16} />
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

      {/* Verlauf */}
      <section className="dash-card dash-hero" aria-labelledby="dash-hero-h">
        <div className="dash-card-head">
          <div>
            <h2 id="dash-hero-h" className="dash-h2">Einnahmen und Ausgaben</h2>
            <p className="dash-card-sub">Kumuliert über die Saison {year}</p>
          </div>
          <ul className="dash-legend">
            <li><span className="dot is-red" />Einnahmen</li>
            <li><span className="dot is-dash" />{year - 1}</li>
            <li><span className="dot is-ink" />Ausgaben</li>
          </ul>
        </div>
        <AreaChart values={series.income} compare={series.prev} ghost={series.exp} labels={MONTH_LABELS} through={through} format={(n) => chfCompact(n)} />
      </section>

      {/* Heute zu tun */}
      <section className="dash-card dash-todo" aria-labelledby="today-heading">
        <div className="dash-card-head">
          <h2 id="today-heading" className="dash-h2">Heute zu tun</h2>
          <span className="dash-badge">{todayCount}</span>
        </div>
        {todayCount === 0 ? (
          <p className="dash-empty">Alles erledigt.</p>
        ) : (
          <ul className="dash-rows">
            {inbox.list.slice(0, 3).map((q) => {
              const fresh = isNewInquiry(q);
              return (
                <li key={`q-${q.id}`}>
                  <Link href={`/admin/goenner/inbox?filter=${fresh ? "new" : "open"}`} className="dash-row">
                    <span className={`dash-tag${fresh ? " is-new" : ""}`}>{fresh ? "Neu" : "Anfrage"}</span>
                    <span className="dash-row-main">
                      <strong>{q.name}</strong>
                      <span>{inquiryTierShort(q.membership_id)} · {dateCh(q.created_at)}</span>
                    </span>
                    <span className="dash-chevron" aria-hidden="true">›</span>
                  </Link>
                </li>
              );
            })}
            {dues.unpaid.slice(0, 3).map((m) => (
              <li key={`d-${m.id}`}>
                <Link href={`/admin/goenner/${m.id}`} className="dash-row">
                  <span className="dash-tag">Beitrag</span>
                  <span className="dash-row-main">
                    <strong>{m.name}</strong>
                    <span>
                      {inquiryTierShort(m.membership_id)} · {chf(m.expected)}
                      {m.contribution_type && m.contribution_type !== "geld" ? ` · ${contributionTypeLabel(m.contribution_type)}` : ""}
                    </span>
                  </span>
                  <span className="dash-chevron" aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {todayCount > 6 ? (
          <Link href="/admin/goenner/inbox" className="dash-more">Alle anzeigen</Link>
        ) : null}
        {alert ? null : <Link href="/admin/goenner/inbox" className="dash-more">Eingänge öffnen</Link>}
      </section>

      {/* Zahlungsquote */}
      <section className="dash-card dash-ringcard" aria-labelledby="dash-pay-h">
        <h2 id="dash-pay-h" className="dash-h2">Beiträge bezahlt</h2>
        <Ring
          segments={[
            { value: dues.paid, className: "is-red" },
            { value: Math.max(0, dues.billable - dues.paid), className: "is-soft" },
          ]}
        >
          <strong>{dues.billable > 0 ? Math.round((dues.paid / dues.billable) * 100) : 0}%</strong>
          <span>{dues.paid} von {dues.billable}</span>
        </Ring>
        <p className="dash-card-sub">Offen: {chfCompact(dues.openSum)}</p>
      </section>

      {/* Drei grosse Kennzahlen */}
      <section className="dash-card dash-kpis" aria-label="Kennzahlen">
        <div className="dash-kpi">
          <span className="dash-kpi-label">Einnahmen {year}</span>
          <strong className="dash-kpi-value">{chfCompact(income.total)}</strong>
          <span className={`dash-delta ${diff >= 0 ? "is-up" : "is-down"}`}>
            {income.prev > 0
              ? `${diff >= 0 ? "+" : "−"}${chfCompact(Math.abs(diff))}${diffPct !== null ? ` (${Math.abs(diffPct)} %)` : ""} zu ${year - 1}`
              : `Kein Vergleich ${year - 1}`}
          </span>
        </div>
        <div className="dash-kpi">
          <span className="dash-kpi-label">Ausgaben {year}</span>
          <strong className="dash-kpi-value">{chfCompact(series.expTotal)}</strong>
          <span className="dash-delta">{series.topCats[0] ? `Grösster Posten: ${series.topCats[0].label}` : "Noch nichts erfasst"}</span>
        </div>
        <div className="dash-kpi">
          <span className="dash-kpi-label">Ergebnis</span>
          <strong className={`dash-kpi-value ${result >= 0 ? "is-good" : "is-bad"}`}>{chfCompact(result)}</strong>
          <span className="dash-delta">Einnahmen minus Golf-Ausgaben</span>
        </div>
      </section>

      {/* Einnahmen nach Quelle */}
      <section className="dash-card dash-third" aria-labelledby="dash-src-h">
        <div className="dash-card-head">
          <h2 id="dash-src-h" className="dash-h2">Einnahmen nach Quelle</h2>
          <span className="dash-card-sub">{year}</span>
        </div>
        <ul className="dash-bars-list">
          {SOURCES.map((s) => {
            const v = income.bySource[s.id];
            const max = Math.max(1, ...Object.values(income.bySource));
            return (
              <li key={s.id}>
                <span className="dash-bars-row">
                  <span className="dash-bars-name"><span className={`ap-mix-dot ap-mix--${s.id}`} aria-hidden="true" />{s.label}</span>
                  <strong>{v > 0 ? chfCompact(v) : "—"}</strong>
                </span>
                <span className="dash-meter"><span style={{ width: `${(v / max) * 100}%` }} /></span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Nächste Turniere */}
      <section className="dash-card dash-third" aria-labelledby="dash-ev-h">
        <div className="dash-card-head">
          <h2 id="dash-ev-h" className="dash-h2">Nächste Turniere</h2>
          <Link href="/admin/kalender" className="dash-link">Kalender ›</Link>
        </div>
        {events.length === 0 ? (
          <p className="dash-empty">Keine kommenden Termine.</p>
        ) : (
          <ul className="dash-rows">
            {events.slice(0, 4).map((e) => (
              <li key={e.id}>
                <Link href="/admin/kalender" className="dash-row">
                  <span className="dash-date">
                    <strong>{Number(e.start_date.slice(8, 10))}</strong>
                    <span>{MONTH_LABELS[Number(e.start_date.slice(5, 7)) - 1]}</span>
                  </span>
                  <span className="dash-row-main">
                    <strong>{e.name}</strong>
                    <span>{e.location}{e.country ? `, ${e.country}` : ""}</span>
                  </span>
                  <span className="dash-pill">{e.days === 0 ? "jetzt" : `in ${e.days} T.`}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Letzte Preisgelder */}
      <section className="dash-card dash-third" aria-labelledby="dash-pr-h">
        <div className="dash-card-head">
          <h2 id="dash-pr-h" className="dash-h2">Letzte Preisgelder</h2>
          <Link href="/admin/preisgelder" className="dash-link">Alle ›</Link>
        </div>
        {latestPrizes.length === 0 ? (
          <p className="dash-empty">Noch keine Preisgelder erfasst.</p>
        ) : (
          <ul className="dash-rows">
            {latestPrizes.map((r) => (
              <li key={r.id}>
                <Link href="/admin/preisgelder" className="dash-row">
                  <span className="dash-tag">{r.placement || "–"}</span>
                  <span className="dash-row-main">
                    <strong>{r.tournament}</strong>
                    <span>{dateCh(r.event_date)}{r.tour ? ` · ${r.tour}` : ""}</span>
                  </span>
                  <span className="dash-amount">{chfCompact(Number(r.amount_chf))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Gönnerturnier */}
      <section className="dash-card dash-turnier" aria-labelledby="dash-tn-h">
        <div className="dash-card-head">
          <h2 id="dash-tn-h" className="dash-h2">Gönnerturnier</h2>
          <Link href="/admin/turnier" className="dash-link">Öffnen ›</Link>
        </div>
        {tournament ? (
          <div className="dash-turnier-body">
            <Gauge value={respondPct}>
              <strong>{respondPct}%</strong>
              <span>haben geantwortet</span>
            </Gauge>
            <dl className="dash-stats">
              <div><dt>Anlass</dt><dd>{tournament.title}</dd></div>
              <div><dt>Datum</dt><dd>{dateCh(tournament.event_date)}</dd></div>
              <div><dt>Eingeladen</dt><dd>{tournament.invited}</dd></div>
              <div><dt>Clinic</dt><dd>{tournament.clinic}</dd></div>
              <div><dt>Runde</dt><dd>{tournament.round}</dd></div>
              <div><dt>Dinner</dt><dd>{tournament.dinner}</dd></div>
            </dl>
          </div>
        ) : (
          <p className="dash-empty">Noch kein Turnier angelegt. Unter «Gönnerturnier» ein Jahr starten.</p>
        )}
      </section>

      {/* Mitglieder */}
      <section className="dash-card dash-ringcard" aria-labelledby="dash-mem-h">
        <div className="dash-card-head">
          <h2 id="dash-mem-h" className="dash-h2">Mitglieder</h2>
        </div>
        <Ring
          size={130}
          stroke={15}
          segments={[
            { value: memberMix.goenner, className: "is-red" },
            { value: memberMix.sponsor, className: "is-ink" },
            { value: memberMix.partner, className: "is-grey" },
          ]}
        >
          <strong>{memberMix.total}</strong>
          <span>aktiv</span>
        </Ring>
        <ul className="dash-ringlegend">
          <li><span className="dot is-red" />Gönner {memberMix.goenner}</li>
          <li><span className="dot is-ink" />Sponsoren {memberMix.sponsor}</li>
          <li><span className="dot is-grey" />Partner {memberMix.partner}</li>
        </ul>
      </section>

      {/* Newsletter und offener Betrag */}
      <div className="dash-stack">
        <section className="dash-card dash-mini" aria-labelledby="dash-nl-h">
          <h2 id="dash-nl-h" className="dash-h2">Newsletter</h2>
          <strong className="dash-mini-value">{newsletter ?? "–"}</strong>
          <span className="dash-card-sub">Abonnenten auf der Website</span>
        </section>
        <section className="dash-card dash-dark" aria-labelledby="dash-open-h">
          <h2 id="dash-open-h" className="dash-h2">Noch offen</h2>
          <strong className="dash-mini-value">{chfCompact(dues.openSum)}</strong>
          <span className="dash-dark-sub">{dues.unpaid.length} Beiträge ausstehend</span>
          <Link href="/admin/rechnungen" className="dash-btn is-light">Rechnung erstellen</Link>
        </section>
      </div>

      {/* Ausgaben pro Monat */}
      <section className="dash-card dash-bars" aria-labelledby="dash-exp-h">
        <div className="dash-card-head">
          <div>
            <h2 id="dash-exp-h" className="dash-h2">Ausgaben pro Monat</h2>
            <p className="dash-card-sub">Golf, inklusive auf 12 Monate verteilte Jahreskosten</p>
          </div>
          <Link href="/admin/budget" className="dash-link">Budget ›</Link>
        </div>
        <div className="dash-bars-wrap">
          <Bars values={series.expM} labels={MONTH_LABELS} highlight={year === currentYear ? new Date().getMonth() : undefined} format={(n) => chfCompact(n)} />
          <ul className="dash-topcats">
            {series.topCats.length === 0 ? <li className="dash-empty">Noch keine Ausgaben.</li> : null}
            {series.topCats.map((c) => (
              <li key={c.id}>
                <span aria-hidden="true">{c.icon}</span>
                <span className="dash-topcats-name">{c.label}</span>
                <strong>{chfCompact(c.v)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kurzbefehle */}
      <section className="dash-card dash-shortcuts" aria-labelledby="dash-sc-h">
        <h2 id="dash-sc-h" className="dash-h2">Kurzbefehle</h2>
        <ul className="dash-sc-grid">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="dash-sc">
                <span className="dash-sc-icon">{s.icon}</span>
                <span className="dash-sc-text">
                  <strong>{s.label}</strong>
                  <span>{s.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="ov-full" id="mitglieder">
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
    </div>
  );
}
