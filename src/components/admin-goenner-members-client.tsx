"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  adminMembershipOptions,
  contributionTypeLabel,
  contributionTypeOptions,
  inquiryTierLabel,
  inquiryTierShort,
  memberCategoryLabel,
  memberCategoryOptions,
} from "@/content/goennerMemberships";
import {
  GOENNER_FINANCE_START_YEAR,
  expectedAnnualChf,
  paidOnForYear,
  paymentsInYear,
  withMemberTotals,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";
import { IconArrowRight, IconCheck, IconDownload, IconPlus, IconSearch, IconSort, IconTrash } from "@/components/admin/admin-icons";
import { AdminRowMenu } from "@/components/admin/admin-row-menu";
import {
  AdminPageHeader,
  CategoryTabs,
  ContributionTag,
  ProgressBar,
  StatusBadge,
  TierTag,
  categoryOf,
  chf,
  chfCompact,
  type CategoryFilter,
} from "@/components/admin/admin-ui";

type Props = {
  members: GoennerMemberRow[];
  payments: GoennerPaymentRow[];
  schemaMissing?: boolean;
  initialYear?: number;
  initialStatus?: StatusFilter;
  initialCategory?: CategoryFilter;
};

type StatusFilter = "all" | "open" | "paid";
type SortKey = "name" | "tier" | "amount" | "status" | "total";
type SortState = { key: SortKey; dir: "asc" | "desc" };

const tierOrder = new Map(adminMembershipOptions.map((t, i) => [t.id, i]));

export function AdminGoennerMembersClient({
  members,
  payments,
  schemaMissing,
  initialYear,
  initialStatus,
  initialCategory,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(
    initialYear && initialYear >= GOENNER_FINANCE_START_YEAR && initialYear <= currentYear ? initialYear : currentYear,
  );
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [status, setStatus] = useState<StatusFilter>(initialStatus ?? "all");
  const [tier, setTier] = useState<string>("all");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory ?? "all");
  const [sort, setSort] = useState<SortState>({ key: "name", dir: "asc" });
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
          const expected = expectedAnnualChf(m);
          return {
            ...withMemberTotals(m, payments),
            cat: categoryOf(m),
            expected,
            // Nur Einträge mit Betrag haben ein Soll (Material-Partner / offene Vereinbarungen nicht)
            billable: expected > 0,
            paidInYear: inYear.reduce((s, p) => s + Number(p.amount_chf || 0), 0),
            isPaid: inYear.length > 0,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "de-CH")),
    [members, payments, year],
  );

  // Basis für Bereichs-Zähler: Suche, Stufe, Aktiv — aber noch ohne Bereich/Status
  const searchBase = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((m) => {
      if (onlyActive && !m.active) return false;
      if (tier !== "all" && m.membership_id !== tier) return false;
      if (!q) return true;
      return [
        m.name,
        m.organization || "",
        m.email || "",
        m.phone || "",
        m.city || "",
        inquiryTierLabel(m.membership_id),
        contributionTypeLabel(m.contribution_type),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [enriched, onlyActive, tier, query]);

  const categoryCounts: Record<CategoryFilter, number> = {
    all: searchBase.length,
    goenner: searchBase.filter((m) => m.cat === "goenner").length,
    sponsor: searchBase.filter((m) => m.cat === "sponsor").length,
    partner: searchBase.filter((m) => m.cat === "partner").length,
  };

  // Basis für Status-Zähler: zusätzlich Bereich
  const base = useMemo(
    () => (category === "all" ? searchBase : searchBase.filter((m) => m.cat === category)),
    [searchBase, category],
  );

  const counts = {
    all: base.length,
    open: base.filter((m) => m.billable && !m.isPaid).length,
    paid: base.filter((m) => m.isPaid).length,
  };

  const visible = useMemo(() => {
    const list = base.filter((m) => {
      if (status === "open" && (m.isPaid || !m.billable)) return false;
      if (status === "paid" && !m.isPaid) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const byName = (a: (typeof list)[number], b: (typeof list)[number]) => a.name.localeCompare(b.name, "de-CH");
    return [...list].sort((a, b) => {
      let diff = 0;
      if (sort.key === "tier") diff = (tierOrder.get(a.membership_id) ?? 99) - (tierOrder.get(b.membership_id) ?? 99);
      else if (sort.key === "amount") diff = a.expected - b.expected;
      else if (sort.key === "total") diff = a.total_chf - b.total_chf;
      else if (sort.key === "status") diff = Number(a.isPaid) - Number(b.isPaid);
      else diff = byName(a, b);
      return diff * dir || byName(a, b);
    });
  }, [base, status, sort]);

  // Kennzahlen im gewählten Bereich
  const scope = category === "all" ? enriched : enriched.filter((m) => m.cat === category);
  const activeRows = scope.filter((m) => m.active);
  const billableRows = activeRows.filter((m) => m.billable);
  const soll = billableRows.reduce((s, m) => s + m.expected, 0);
  const ist = scope.reduce((s, m) => s + m.paidInYear, 0);
  const paidCount = billableRows.filter((m) => m.isPaid).length;
  const offen = billableRows.filter((m) => !m.isPaid).reduce((s, m) => s + m.expected, 0);
  const inKindCount = activeRows.length - billableRows.length;
  const allActive = enriched.filter((m) => m.active).length;

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "amount" || key === "total" ? "desc" : "asc" },
    );
  }

  function sortHeader(key: SortKey, label: string, align?: "end") {
    const active = sort.key === key;
    return (
      <th
        scope="col"
        className={align === "end" ? "ap-num" : undefined}
        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      >
        <button type="button" className={`ap-sort${active ? " is-active" : ""}`} onClick={() => toggleSort(key)}>
          {label}
          <IconSort dir={active ? sort.dir : null} />
        </button>
      </th>
    );
  }

  async function markPaid(member: (typeof enriched)[number]) {
    if (
      !window.confirm(
        `«${member.name}» für ${year} als bezahlt erfassen (${chf(member.expected)})?\nEs wird keine E-Mail versendet.`,
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
          category: fd.get("category"),
          contribution_type: fd.get("contribution_type"),
          organization: fd.get("organization"),
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

  const header = (
    <AdminPageHeader
      eyebrow="Verwaltung"
      title="Gönner & Partner"
      description={`${allActive} aktive Einträge · Gönner, Sponsoren und Partner mit Beiträgen, Kontakten und Zahlungen seit ${GOENNER_FINANCE_START_YEAR}.`}
      actions={
        <>
          <a
            className="ap-btn ap-btn--secondary"
            href={`/api/admin/goenner-report?year=${currentYear - 1}`}
            title={`Stand 31.12.${currentYear - 1} als CSV (Excel)`}
          >
            <IconDownload />
            Jahresreport {currentYear - 1}
          </a>
          {year !== currentYear - 1 ? (
            <a className="ap-btn ap-btn--secondary" href={`/api/admin/goenner-report?year=${year}`}>
              <IconDownload />
              Report {year}
            </a>
          ) : null}
          <button
            type="button"
            className="ap-btn ap-btn--primary"
            aria-expanded={showAdd}
            aria-controls="ap-add-member"
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? null : <IconPlus />}
            {showAdd ? "Abbrechen" : "Eintrag hinzufügen"}
          </button>
        </>
      }
    />
  );

  if (schemaMissing) {
    return (
      <div className="ap-page">
        {header}
        <p className="ap-banner ap-banner--warn">
          Ledger-Tabellen fehlen. In Supabase ausführen: <code>supabase/010_goenner_finance.sql</code>
        </p>
      </div>
    );
  }

  return (
    <div className="ap-page">
      {header}

      {showAdd ? (
        <form id="ap-add-member" className="ap-card ap-form" onSubmit={onAdd}>
          <div className="ap-card-head">
            <h2 className="ap-h2">Neuer Eintrag</h2>
          </div>
          <div className="ap-form-grid ap-form-grid--3">
            <label className="ap-field">
              <span className="ap-label">Kategorie</span>
              <select
                className="ap-select"
                name="category"
                defaultValue={category === "all" ? "goenner" : category}
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
                name="contribution_type"
                defaultValue={category === "partner" ? "material" : "geld"}
              >
                {contributionTypeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ap-field">
              <span className="ap-label">Organisation</span>
              <input className="ap-input" name="organization" maxLength={200} placeholder="Firma, Verband (optional)" />
            </label>
            <label className="ap-field">
              <span className="ap-label">Name / Kontaktperson</span>
              <input className="ap-input" name="name" required maxLength={200} autoFocus />
            </label>
            <label className="ap-field">
              <span className="ap-label">E-Mail</span>
              <input className="ap-input" name="email" type="email" />
            </label>
            <label className="ap-field">
              <span className="ap-label">Telefon</span>
              <input className="ap-input" name="phone" type="tel" />
            </label>
            <label className="ap-field">
              <span className="ap-label">Stufe</span>
              <select
                className="ap-select"
                name="membership_id"
                defaultValue={category === "sponsor" ? "sponsoring" : category === "partner" ? "partner" : "birdie"}
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
              <input className="ap-input ap-input--num" name="annual_amount_chf" inputMode="decimal" placeholder="leer = Listenpreis / kein Betrag" />
            </label>
            <label className="ap-field">
              <span className="ap-label">Notiz</span>
              <input className="ap-input" name="notes" maxLength={500} />
            </label>
          </div>
          <div className="ap-form-actions">
            <button type="button" className="ap-btn ap-btn--ghost" onClick={() => setShowAdd(false)}>
              Abbrechen
            </button>
            <button type="submit" className="ap-btn ap-btn--primary" disabled={busy}>
              {busy ? "Speichern…" : "Anlegen & öffnen"}
            </button>
          </div>
        </form>
      ) : null}

      <CategoryTabs value={category} counts={categoryCounts} onChange={setCategory} />

      <section className="ap-summary" aria-label={`Stand ${year}`}>
        <div className="ap-summary-progress">
          <div className="ap-summary-row">
            <span className="ap-kpi-label">Bezahlt {year}</span>
            <strong className="ap-summary-value">
              {paidCount}
              <span className="ap-kpi-of"> / {billableRows.length}</span>
            </strong>
          </div>
          <ProgressBar value={paidCount} max={billableRows.length} label={`Bezahlt ${year}`} />
        </div>
        <dl className="ap-summary-figures">
          <div>
            <dt>Soll</dt>
            <dd>{chfCompact(soll)}</dd>
          </div>
          <div>
            <dt>Eingegangen</dt>
            <dd>{chfCompact(ist)}</dd>
          </div>
          <div className={offen > 0 ? "is-alert" : undefined}>
            <dt>Offen</dt>
            <dd>{chfCompact(offen)}</dd>
          </div>
          {inKindCount > 0 ? (
            <div>
              <dt>Ohne CHF-Soll</dt>
              <dd>{inKindCount}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {error ? (
        <p className="ap-banner ap-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="ap-toolbar" role="search">
        <div className="ap-segment" role="group" aria-label="Status filtern">
          {(
            [
              ["all", "Alle"],
              ["open", "Offen"],
              ["paid", "Bezahlt"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="ap-segment-btn"
              aria-pressed={status === id}
              onClick={() => setStatus(id)}
            >
              {label}
              <span className="ap-segment-count">{counts[id]}</span>
            </button>
          ))}
        </div>
        <label className="ap-search">
          <IconSearch />
          <span className="sr-only">Einträge suchen</span>
          <input
            type="search"
            className="ap-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, Organisation, E-Mail, Ort…"
          />
        </label>
        <div className="ap-toolbar-filters">
          <label className="ap-field-inline">
            <span>Jahr</span>
            <select className="ap-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="ap-field-inline">
            <span>Stufe</span>
            <select className="ap-select" value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="all">Alle</option>
              {adminMembershipOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {inquiryTierShort(t.id)}
                </option>
              ))}
            </select>
          </label>
          <label className="ap-switch">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            <span>Nur aktive</span>
          </label>
        </div>
      </div>

      <div className="ap-table-wrap">
        <table className="ap-table ap-table--members">
          <caption className="sr-only">
            Gönner, Sponsoren und Partner {year}, {visible.length} Einträge
          </caption>
          <thead>
            <tr>
              {sortHeader("name", "Name")}
              {sortHeader("tier", "Stufe")}
              <th scope="col">Leistung</th>
              {sortHeader("amount", "Jahresbetrag", "end")}
              {sortHeader("status", `Status ${year}`)}
              {sortHeader("total", `Total seit ${GOENNER_FINANCE_START_YEAR}`, "end")}
              <th scope="col" className="ap-col-actions">
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr className="ap-empty-row">
                <td colSpan={7}>
                  <div className="ap-empty">
                    <p className="ap-empty-title">Keine Einträge für diese Auswahl</p>
                    <p className="ap-muted-sm">Filter anpassen oder Suche leeren.</p>
                  </div>
                </td>
              </tr>
            ) : (
              visible.map((m) => (
                <tr key={m.id} className={m.active ? undefined : "is-inactive"}>
                  <td className="ap-cell-name">
                    <Link href={`/admin/goenner/${m.id}`} className="ap-row-title">
                      {m.name}
                    </Link>
                    {category === "all" && m.cat !== "goenner" ? (
                      <span className={`ap-cat ap-cat--${m.cat}`}>{memberCategoryLabel(m.cat)}</span>
                    ) : null}
                    {!m.active ? <span className="ap-tag-muted">inaktiv</span> : null}
                    {m.organization ? <span className="ap-row-org">{m.organization}</span> : null}
                    <span className="ap-row-sub">
                      {m.email ? <a href={`mailto:${m.email}`}>{m.email}</a> : null}
                      {m.email && m.phone ? <span aria-hidden="true"> · </span> : null}
                      {m.phone ? <a href={`tel:${m.phone.replace(/\s/g, "")}`}>{m.phone}</a> : null}
                      {!m.email && !m.phone ? <span>Kein Kontakt</span> : null}
                    </span>
                  </td>
                  <td data-label="Stufe">
                    <TierTag id={m.membership_id}>{inquiryTierShort(m.membership_id)}</TierTag>
                  </td>
                  <td data-label="Leistung">
                    <ContributionTag id={m.contribution_type}>{contributionTypeLabel(m.contribution_type)}</ContributionTag>
                  </td>
                  <td className="ap-num" data-label="Jahresbetrag">
                    {m.billable ? chf(m.expected) : <span className="ap-dim" title="Kein fixer Betrag">—</span>}
                  </td>
                  <td data-label={`Status ${year}`}>
                    {m.isPaid ? (
                      <StatusBadge state="paid">Bezahlt · {chf(m.paidInYear)}</StatusBadge>
                    ) : !m.billable ? (
                      <StatusBadge state="none">
                        {m.contribution_type === "material" ? "Sachleistung" : "Ohne Betrag"}
                      </StatusBadge>
                    ) : m.active ? (
                      <StatusBadge state="open">Offen</StatusBadge>
                    ) : (
                      <StatusBadge state="none">Keine Zahlung</StatusBadge>
                    )}
                  </td>
                  <td className="ap-num ap-num--strong" data-label={`Total seit ${GOENNER_FINANCE_START_YEAR}`}>
                    {m.total_chf > 0 || m.billable ? chf(m.total_chf) : <span className="ap-dim">—</span>}
                  </td>
                  <td className="ap-col-actions">
                    <div className="ap-row-actions">
                      {!m.isPaid && m.active && m.billable ? (
                        <button
                          type="button"
                          className="ap-btn ap-btn--secondary ap-btn--sm ap-btn--pay"
                          disabled={busyId === m.id}
                          onClick={() => void markPaid(m)}
                          aria-label={`${m.name}: Bezahlt ${year} erfassen`}
                        >
                          <IconCheck size={14} />
                          {busyId === m.id ? "…" : `Bezahlt ${year}`}
                        </button>
                      ) : null}
                      <AdminRowMenu
                        label={`Aktionen für ${m.name}`}
                        items={[
                          {
                            kind: "link",
                            label: "Öffnen",
                            href: `/admin/goenner/${m.id}`,
                            icon: <IconArrowRight size={14} />,
                          },
                          {
                            kind: "action",
                            label: "Löschen…",
                            danger: true,
                            disabled: busy,
                            icon: <IconTrash size={14} />,
                            onSelect: () => void onDelete(m.id, m.name),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="ap-footnote">
        Rechnungen und E-Mails löst du selbst aus — diese Liste versendet nichts. «Bezahlt {year}» verbucht den
        Jahresbetrag mit Datum {year === currentYear ? "heute" : `31.12.${year}`}.
      </p>
    </div>
  );
}
