import { membershipPriceChf } from "@/content/goennerMemberships";

/** Finance ledger starts in calendar year 2022. */
export const GOENNER_FINANCE_START_YEAR = 2022;

export type GoennerMemberRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  membership_id: string;
  /** Vereinbarter Jahresbeitrag (CHF); null = Listenpreis der Stufe (Migration 016) */
  annual_amount_chf?: number | null;
  notes: string | null;
  active: boolean;
  inquiry_id: string | null;
  created_at: string;
  updated_at: string;
};

export type GoennerPaymentMethod = "twint" | "bank" | "cash" | "other";

export type GoennerPaymentRow = {
  id: string;
  member_id: string;
  amount_chf: number;
  paid_on: string;
  year: number;
  membership_id: string | null;
  method: GoennerPaymentMethod;
  note: string | null;
  inquiry_id: string | null;
  created_at: string;
};

export type GoennerMemberWithTotals = GoennerMemberRow & {
  total_chf: number;
  year_chf: number;
  last_year_chf: number;
  payment_count: number;
  last_paid_on: string | null;
};

/** Betrag, der beim "Als bezahlt markieren" für ein Jahr verbucht wird */
export function expectedAnnualChf(member: Pick<GoennerMemberRow, "annual_amount_chf" | "membership_id">): number {
  const own = member.annual_amount_chf;
  if (own != null && Number.isFinite(Number(own))) return Number(own);
  return membershipPriceChf(member.membership_id);
}

/** Bezahlt = mindestens eine Zahlung mit Datum im betreffenden Kalenderjahr */
export function paymentsInYear(payments: GoennerPaymentRow[], memberId: string, year: number) {
  return payments.filter((p) => p.member_id === memberId && p.year === year);
}

/** Buchungsdatum für "bezahlt in Jahr X": heute im laufenden Jahr, sonst 31.12. des Jahres */
export function paidOnForYear(year: number, now = new Date()): string {
  if (year === now.getFullYear()) {
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }
  return `${year}-12-31`;
}

export function parseAmountOrNull(raw: unknown): number | null | "invalid" {
  if (raw == null || String(raw).trim() === "") return null;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace("'", "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return "invalid";
  return Math.round(n * 100) / 100;
}

export function chfFmt(n: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);
}

export function sumPaymentsForYear(payments: Pick<GoennerPaymentRow, "amount_chf" | "year">[], year: number) {
  return payments
    .filter((p) => p.year === year)
    .reduce((s, p) => s + Number(p.amount_chf || 0), 0);
}

export function sumPaymentsTotal(payments: Pick<GoennerPaymentRow, "amount_chf" | "year">[]) {
  return payments
    .filter((p) => p.year >= GOENNER_FINANCE_START_YEAR)
    .reduce((s, p) => s + Number(p.amount_chf || 0), 0);
}

export function withMemberTotals(
  member: GoennerMemberRow,
  payments: GoennerPaymentRow[],
  now = new Date(),
): GoennerMemberWithTotals {
  const year = now.getFullYear();
  const lastYear = year - 1;
  const mine = payments.filter((p) => p.member_id === member.id);
  const lastPaid = [...mine].sort((a, b) => b.paid_on.localeCompare(a.paid_on))[0]?.paid_on ?? null;
  return {
    ...member,
    total_chf: sumPaymentsTotal(mine),
    year_chf: sumPaymentsForYear(mine, year),
    last_year_chf: sumPaymentsForYear(mine, lastYear),
    payment_count: mine.length,
    last_paid_on: lastPaid,
  };
}
