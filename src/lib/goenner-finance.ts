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
