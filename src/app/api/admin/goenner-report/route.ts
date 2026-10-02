import { NextResponse } from "next/server";
import { inquiryTierLabel } from "@/content/goennerMemberships";
import { isAdminSession } from "@/lib/admin-auth";
import {
  GOENNER_FINANCE_START_YEAR,
  expectedAnnualChf,
  paymentsInYear,
  type GoennerMemberRow,
  type GoennerPaymentRow,
} from "@/lib/goenner-finance";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

/** Zelle für Excel-CSV (Semikolon, Anführungszeichen escapen) */
function cell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function chf(n: number): string {
  return n.toFixed(2);
}

/**
 * Jahresreport: Stand per 31.12. des gewählten Jahres.
 * Löst nichts aus (keine Mails) — reiner Download für die Buchhaltung.
 */
export async function GET(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const year = Number(new URL(request.url).searchParams.get("year"));
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < GOENNER_FINANCE_START_YEAR || year > currentYear) {
    return NextResponse.json({ error: "Ungültiges Jahr." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const [{ data: members, error: mErr }, { data: payments, error: pErr }] = await Promise.all([
    supabase.from("goenner_members").select("*").order("name", { ascending: true }),
    supabase.from("goenner_payments").select("*").eq("year", year).order("paid_on", { ascending: true }),
  ]);
  if (mErr || pErr) {
    return NextResponse.json({ error: (mErr || pErr)!.message }, { status: 500 });
  }

  const allMembers = (members ?? []) as GoennerMemberRow[];
  const yearPayments = (payments ?? []) as GoennerPaymentRow[];

  // Aktive Gönner + alle, die in diesem Jahr gezahlt haben
  const rows = allMembers.filter((m) => m.active || yearPayments.some((p) => p.member_id === m.id));

  const header = [
    "Name",
    "Stufe",
    "Jahresbetrag CHF",
    `Bezahlt ${year} CHF`,
    `Status ${year}`,
    "Zahlungsdatum",
    "E-Mail",
    "Telefon",
    "Strasse",
    "PLZ",
    "Ort",
    "Aktiv",
    "Notizen",
  ];

  let soll = 0;
  let ist = 0;
  let paidCount = 0;
  const lines = rows.map((m) => {
    const mine = paymentsInYear(yearPayments, m.id, year);
    const paid = mine.reduce((s, p) => s + Number(p.amount_chf || 0), 0);
    const expected = m.active ? expectedAnnualChf(m) : 0;
    soll += expected;
    ist += paid;
    if (mine.length > 0) paidCount += 1;
    return [
      m.name,
      inquiryTierLabel(m.membership_id),
      chf(expectedAnnualChf(m)),
      chf(paid),
      mine.length > 0 ? "bezahlt" : "offen",
      mine.map((p) => p.paid_on).join(", "),
      m.email,
      m.phone,
      m.street,
      m.postal_code,
      m.city,
      m.active ? "ja" : "nein",
      m.notes,
    ]
      .map(cell)
      .join(";");
  });

  const summary = [
    "",
    `Jahresreport ${year};Stand 31.12.${year}`,
    `Gönner;${rows.length}`,
    `Bezahlt;${paidCount}`,
    `Offen;${rows.length - paidCount}`,
    `Soll CHF;${chf(soll)}`,
    `Eingegangen CHF;${chf(ist)}`,
    `Differenz CHF;${chf(ist - soll)}`,
  ];

  // BOM, damit Excel Umlaute korrekt erkennt
  const csv = "﻿" + [header.map(cell).join(";"), ...lines, ...summary].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="goenner-jahresreport-${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
