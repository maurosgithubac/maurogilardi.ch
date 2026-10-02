"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  adminMembershipOptions,
  contributionTypeLabel,
  inquiryTierLabel,
  inquiryTierShort,
} from "@/content/goennerMemberships";
import {
  GOENNER_FINANCE_START_YEAR,
  expectedAnnualChf,
  sumPaymentsTotal,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";
import type { GoennerInquiryRow } from "@/types/content";
import {
  IconArrowRight,
  IconDownload,
  IconInbox,
  IconUsers,
} from "@/components/admin/admin-icons";
import {
  AdminPageHeader,
  CATEGORY_TABS,
  CategoryTabs,
  ProgressBar,
  TierTag,
  categoryOf,
  chf,
  chfCompact,
  dateCh,
  type CategoryFilter,
  type CategoryId,
} from "@/components/admin/admin-ui";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  openInquiries: GoennerInquiryRow[];
  schemaMissing?: boolean;
};

const TODO_LIMIT = 6;

export function AdminOverview({
  members,
  payments,
  openInquiries,
  schemaMissing,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [category, setCategory] = useState<CategoryFilter>("all");

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= GOENNER_FINANCE_START_YEAR; y--)
      list.push(y);
    return list;
  }, [currentYear]);

  // Pro Eintrag: Soll und bezahlt im gewählten Jahr
  const rowsAll = useMemo(() => {
    const paidByMember = new Map<string, number>();
    for (const p of payments) {
      if (p.year !== year) continue;
      paidByMember.set(
        p.member_id,
        (paidByMember.get(p.member_id) || 0) + Number(p.amount_chf || 0),
      );
    }
    return members.map((m) => {
      const expected = expectedAnnualChf(m);
      return {
        ...m,
        cat: categoryOf(m),
        expected,
        billable: expected > 0,
        paid: paidByMember.get(m.id) || 0,
        isPaid: paidByMember.has(m.id),
      };
    });
  }, [members, payments, year]);

  // Aufteilung nach Bereich (immer alle Bereiche, unabhängig vom Tab)
  const byCategory = useMemo(() => {
    return (["goenner", "sponsor", "partner"] as CategoryId[]).map((id) => {
      const inCat = rowsAll.filter((m) => m.cat === id);
      const active = inCat.filter((m) => m.active);
      const billable = active.filter((m) => m.billable);
      return {
        id,
        label: CATEGORY_TABS.find((t) => t.id === id)?.label ?? id,
        active: active.length,
        billable: billable.length,
        paid: billable.filter((m) => m.isPaid).length,
        inKind: active.length - billable.length,
        soll: billable.reduce((s, m) => s + m.expected, 0),
        ist: inCat.reduce((s, m) => s + m.paid, 0),
      };
    });
  }, [rowsAll]);

  const categoryCounts: Record<CategoryFilter, number> = {
    all: rowsAll.filter((m) => m.active).length,
    goenner: byCategory[0].active,
    sponsor: byCategory[1].active,
    partner: byCategory[2].active,
  };

  const stats = useMemo(() => {
    const scope =
      category === "all" ? rowsAll : rowsAll.filter((m) => m.cat === category);
    const ist = scope.reduce((s, m) => s + m.paid, 0);
    const rows = scope.filter((m) => m.active);
    const billable = rows.filter((m) => m.billable);
    const soll = billable.reduce((s, m) => s + m.expected, 0);
    const unpaid = billable
      .filter((m) => !m.isPaid)
      .sort(
        (a, b) =>
          b.expected - a.expected || a.name.localeCompare(b.name, "de-CH"),
      );
    const offen = unpaid.reduce((s, m) => s + m.expected, 0);

    const tiers = adminMembershipOptions
      .map((t) => {
        const inTier = rows.filter((m) => m.membership_id === t.id);
        return {
          id: t.id,
          label: inquiryTierLabel(t.id).replace(/\s*\(.*\)$/, ""),
          count: inTier.length,
          paid: inTier.filter((m) => m.isPaid).length,
          soll: inTier.reduce((s, m) => s + m.expected, 0),
        };
      })
      .filter((t) => t.count > 0);
    const known = new Set(adminMembershipOptions.map((t) => t.id));
    const other = rows.filter((m) => !known.has(m.membership_id));
    if (other.length) {
      tiers.push({
        id: "other",
        label: "Andere",
        count: other.length,
        paid: other.filter((m) => m.isPaid).length,
        soll: other.reduce((s, m) => s + m.expected, 0),
      });
    }
    const maxTierSoll = Math.max(1, ...tiers.map((t) => t.soll));

    return {
      active: rows,
      billable,
      soll,
      ist,
      unpaid,
      offen,
      paidCount: billable.length - unpaid.length,
      tiers,
      maxTierSoll,
    };
  }, [rowsAll, category]);

  const totalSince = useMemo(() => sumPaymentsTotal(payments), [payments]);

  const reportYear = currentYear - 1;
  const openHref = `/admin/goenner?status=open${year !== currentYear ? `&year=${year}` : ""}${
    category !== "all" ? `&bereich=${category}` : ""
  }`;

  return (
    <div className="ap-page">
      <AdminPageHeader
        eyebrow="Cockpit"
        title="Übersicht"
        description={`Stand Beiträge ${year} · Total seit ${GOENNER_FINANCE_START_YEAR}: ${chfCompact(totalSince)}`}
        actions={
          <>
            <label className="ap-field-inline">
              <span>Jahr</span>
              <select
                className="ap-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
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

      {schemaMissing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Bitte in Supabase ausführen:{" "}
          <code>supabase/010_goenner_finance.sql</code> (und bei Bedarf{" "}
          <code>009_goenner_inquiries_membership_hundert.sql</code>).
        </p>
      ) : null}

      <CategoryTabs
        value={category}
        counts={categoryCounts}
        onChange={setCategory}
      />

      <section className="ap-kpis" aria-label={`Kennzahlen ${year}`}>
        <div className="ap-kpi ap-kpi--wide">
          <div className="ap-kpi-top">
            <span className="ap-kpi-label">Bezahlt {year}</span>
            <span className="ap-kpi-hint">
              {stats.billable.length > 0
                ? Math.round((stats.paidCount / stats.billable.length) * 100)
                : 0}{" "}
              %
            </span>
          </div>
          <strong className="ap-kpi-value">
            {stats.paidCount}
            <span className="ap-kpi-of"> / {stats.billable.length}</span>
          </strong>
          <ProgressBar
            value={stats.paidCount}
            max={stats.billable.length}
            label={`Bezahlt ${year}`}
          />
        </div>
        <div className="ap-kpi">
          <span className="ap-kpi-label">Aktive Einträge</span>
          <strong className="ap-kpi-value">{stats.active.length}</strong>
          {stats.active.length > stats.billable.length ? (
            <span className="ap-kpi-foot">
              davon {stats.active.length - stats.billable.length} ohne CHF
            </span>
          ) : null}
        </div>
        <div className="ap-kpi">
          <span className="ap-kpi-label">Soll {year}</span>
          <strong className="ap-kpi-value">{chfCompact(stats.soll)}</strong>
        </div>
        <div className="ap-kpi">
          <span className="ap-kpi-label">Eingegangen</span>
          <strong className="ap-kpi-value">{chfCompact(stats.ist)}</strong>
        </div>
        <div className={`ap-kpi${stats.offen > 0 ? " ap-kpi--alert" : ""}`}>
          <span className="ap-kpi-label">Offen</span>
          <strong className="ap-kpi-value">{chfCompact(stats.offen)}</strong>
        </div>
      </section>

      <div className="ap-grid-2">
        <section className="ap-card" aria-labelledby="todo-heading">
          <div className="ap-card-head">
            <h2 id="todo-heading" className="ap-h2">
              Zu erledigen
            </h2>
            <span className="ap-count">
              {stats.unpaid.length + openInquiries.length}
            </span>
          </div>

          <div className="ap-todo-group">
            <div className="ap-todo-group-head">
              <IconUsers />
              <h3 className="ap-h3">Offene Beiträge {year}</h3>
              <span className="ap-todo-sum">{chfCompact(stats.offen)}</span>
            </div>
            {stats.unpaid.length === 0 ? (
              <p className="ap-empty-inline">
                Alle Beiträge mit Betrag sind für {year} bezahlt.
              </p>
            ) : (
              <ul className="ap-todo-list">
                {stats.unpaid.slice(0, TODO_LIMIT).map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/admin/goenner/${m.id}`}
                      className="ap-todo-row"
                    >
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
            {stats.unpaid.length > 0 ? (
              <Link href={openHref} className="ap-link-more">
                {stats.unpaid.length > TODO_LIMIT
                  ? `Alle ${stats.unpaid.length} offenen Beiträge erfassen`
                  : "In der Gönner-Liste erfassen"}
                <IconArrowRight size={14} />
              </Link>
            ) : null}
          </div>

          <div className="ap-todo-group">
            <div className="ap-todo-group-head">
              <IconInbox />
              <h3 className="ap-h3">Offene Eingänge</h3>
              <span className="ap-todo-sum">{openInquiries.length}</span>
            </div>
            {openInquiries.length === 0 ? (
              <p className="ap-empty-inline">
                Keine offenen Formular-Anfragen.
              </p>
            ) : (
              <ul className="ap-todo-list">
                {openInquiries.slice(0, TODO_LIMIT).map((q) => (
                  <li key={q.id}>
                    <Link href="/admin/goenner/inbox" className="ap-todo-row">
                      <span className="ap-todo-main">
                        <span className="ap-todo-name">{q.name}</span>
                        <span className="ap-todo-meta">
                          Eingang {dateCh(q.created_at)}
                        </span>
                      </span>
                      <TierTag id={q.membership_id}>
                        {inquiryTierShort(q.membership_id)}
                      </TierTag>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {openInquiries.length > 0 ? (
              <Link href="/admin/goenner/inbox" className="ap-link-more">
                Eingänge bearbeiten
                <IconArrowRight size={14} />
              </Link>
            ) : null}
          </div>
        </section>

        <div className="ap-stack">
          <section className="ap-card" aria-labelledby="cat-heading">
            <div className="ap-card-head">
              <h2 id="cat-heading" className="ap-h2">
                Nach Bereich
              </h2>
              <span className="ap-card-sub">{year}</span>
            </div>
            <table className="ap-tier-table ap-cat-table">
              <thead>
                <tr>
                  <th scope="col">Bereich</th>
                  <th scope="col" className="ap-num">
                    Aktiv
                  </th>
                  <th scope="col" className="ap-num">
                    Bezahlt
                  </th>
                  <th scope="col" className="ap-num">
                    Soll
                  </th>
                  <th scope="col" className="ap-num">
                    Eingegangen
                  </th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((c) => (
                  <tr key={c.id}>
                    <th scope="row">
                      <span className="ap-tier-label">{c.label}</span>
                      {c.inKind > 0 ? (
                        <span className="ap-todo-meta">
                          {c.inKind}{" "}
                          {c.id === "partner"
                            ? "mit Sachleistung"
                            : "ohne CHF-Betrag"}
                        </span>
                      ) : null}
                    </th>
                    <td className="ap-num">{c.active}</td>
                    <td className="ap-num">
                      {c.billable > 0 ? (
                        `${c.paid}/${c.billable}`
                      ) : (
                        <span className="ap-dim">—</span>
                      )}
                    </td>
                    <td className="ap-num">
                      {c.soll > 0 ? (
                        chfCompact(c.soll)
                      ) : (
                        <span className="ap-dim">—</span>
                      )}
                    </td>
                    <td className="ap-num">
                      {c.ist > 0 ? (
                        chfCompact(c.ist)
                      ) : (
                        <span className="ap-dim">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="ap-card" aria-labelledby="tier-heading">
            <div className="ap-card-head">
              <h2 id="tier-heading" className="ap-h2">
                Verteilung nach Stufe
              </h2>
              <span className="ap-card-sub">
                {category === "all"
                  ? "alle Bereiche"
                  : CATEGORY_TABS.find((t) => t.id === category)?.label}{" "}
                · aktiv
              </span>
            </div>
            {stats.tiers.length === 0 ? (
              <p className="ap-empty-inline">
                Keine aktiven Einträge in diesem Bereich.
              </p>
            ) : (
              <table className="ap-tier-table">
                <thead>
                  <tr>
                    <th scope="col">Stufe</th>
                    <th scope="col" className="ap-num">
                      Anzahl
                    </th>
                    <th scope="col" className="ap-num">
                      Bezahlt
                    </th>
                    <th scope="col" className="ap-num">
                      Soll
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.tiers.map((t) => (
                    <tr key={t.id}>
                      <th scope="row">
                        <span className="ap-tier-label">{t.label}</span>
                        <span className="ap-bar" aria-hidden="true">
                          <span
                            style={{
                              width: `${Math.max(2, (t.soll / stats.maxTierSoll) * 100)}%`,
                            }}
                          />
                        </span>
                      </th>
                      <td className="ap-num">{t.count}</td>
                      <td className="ap-num">
                        {t.paid}/{t.count}
                      </td>
                      <td className="ap-num">{chfCompact(t.soll)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Total</th>
                    <td className="ap-num">{stats.active.length}</td>
                    <td className="ap-num">
                      {stats.paidCount}/{stats.billable.length}
                    </td>
                    <td className="ap-num">{chfCompact(stats.soll)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            <div className="ap-card-foot">
              <div>
                <p className="ap-h3">Reports</p>
                <p className="ap-muted-sm">CSV für Excel, Stand Jahresende.</p>
              </div>
              <div className="ap-btn-row">
                <a
                  className="ap-btn ap-btn--secondary ap-btn--sm"
                  href={`/api/admin/goenner-report?year=${reportYear}`}
                >
                  <IconDownload size={14} />
                  {reportYear}
                </a>
                {year !== reportYear ? (
                  <a
                    className="ap-btn ap-btn--secondary ap-btn--sm"
                    href={`/api/admin/goenner-report?year=${year}`}
                  >
                    <IconDownload size={14} />
                    {year}
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
