import { NextResponse } from "next/server";
import { isKnownMembershipId } from "@/content/goennerMemberships";
import { GOENNER_FINANCE_START_YEAR } from "@/lib/goenner-finance";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

const METHODS = new Set(["twint", "bank", "cash", "other"]);

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if ("amount_chf" in body) {
    const raw = body.amount_chf;
    const amount = typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(",", "."));
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
      return NextResponse.json({ error: "Ungültiger Betrag." }, { status: 400 });
    }
    patch.amount_chf = Math.round(amount * 100) / 100;
  }

  if (typeof body.paid_on === "string") {
    const paid_on = body.paid_on.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paid_on)) {
      return NextResponse.json({ error: "Datum (YYYY-MM-DD) erforderlich." }, { status: 400 });
    }
    if (Number(paid_on.slice(0, 4)) < GOENNER_FINANCE_START_YEAR) {
      return NextResponse.json(
        { error: `Zahlungen erst ab ${GOENNER_FINANCE_START_YEAR} erfassen.` },
        { status: 400 },
      );
    }
    patch.paid_on = paid_on;
  }

  if (typeof body.method === "string") {
    if (!METHODS.has(body.method)) {
      return NextResponse.json({ error: "Ungültige Zahlungsmethode." }, { status: 400 });
    }
    patch.method = body.method;
  }

  if ("note" in body) patch.note = String(body.note || "").trim() || null;

  if ("membership_id" in body) {
    const mid = body.membership_id == null || body.membership_id === "" ? null : String(body.membership_id);
    if (mid && !isKnownMembershipId(mid)) {
      return NextResponse.json({ error: "Ungültige Stufe." }, { status: 400 });
    }
    patch.membership_id = mid;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("goenner_payments").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json({ payment: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("goenner_payments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
