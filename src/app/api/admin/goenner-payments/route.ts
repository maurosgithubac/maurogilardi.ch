import { NextResponse } from "next/server";
import { isKnownMembershipId } from "@/content/goennerMemberships";
import { GOENNER_FINANCE_START_YEAR } from "@/lib/goenner-finance";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

const METHODS = new Set(["twint", "bank", "cash", "other"]);

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const member_id = String(body.member_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(member_id)) {
    return NextResponse.json({ error: "member_id ungültig." }, { status: 400 });
  }

  const raw = body.amount_chf;
  const amount = typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
    return NextResponse.json({ error: "Ungültiger Betrag." }, { status: 400 });
  }

  const paid_on = String(body.paid_on || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paid_on)) {
    return NextResponse.json({ error: "Datum (YYYY-MM-DD) erforderlich." }, { status: 400 });
  }
  const year = Number(paid_on.slice(0, 4));
  if (year < GOENNER_FINANCE_START_YEAR) {
    return NextResponse.json(
      { error: `Zahlungen erst ab ${GOENNER_FINANCE_START_YEAR} erfassen.` },
      { status: 400 },
    );
  }

  const method = String(body.method || "other");
  if (!METHODS.has(method)) {
    return NextResponse.json({ error: "Ungültige Zahlungsmethode." }, { status: 400 });
  }

  let membership_id: string | null = null;
  if (body.membership_id != null && String(body.membership_id).trim()) {
    membership_id = String(body.membership_id).trim();
    if (!isKnownMembershipId(membership_id)) {
      return NextResponse.json({ error: "Ungültige Stufe." }, { status: 400 });
    }
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_payments")
    .insert({
      member_id,
      amount_chf: Math.round(amount * 100) / 100,
      paid_on,
      membership_id,
      method,
      note: String(body.note || "").trim() || null,
      inquiry_id: typeof body.inquiry_id === "string" ? body.inquiry_id : null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payment: data }, { status: 201 });
}
