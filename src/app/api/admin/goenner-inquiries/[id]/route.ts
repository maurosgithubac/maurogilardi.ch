import { NextResponse } from "next/server";
import { GOENNER_SPONSORING_MIN_CHF } from "@/content/goennerMemberships";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  }

  let body: { status?: string; amount_chf?: number | string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const status = body.status === "open" || body.status === "completed" ? body.status : null;
  if (!status) {
    return NextResponse.json({ error: "status muss «open» oder «completed» sein." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();

  if (status === "completed") {
    const raw = body.amount_chf;
    const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? "").replace(",", "."));
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
      return NextResponse.json({ error: "Bitte einen gültigen Betrag in CHF angeben." }, { status: 400 });
    }
    const amount = Math.round(n * 100) / 100;

    const { data: existing, error: loadError } = await supabase
      .from("goenner_inquiries")
      .select("membership_id")
      .eq("id", id)
      .maybeSingle();

    if (loadError) {
      return NextResponse.json({ error: loadError.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }
    if (existing.membership_id === "sponsoring" && amount < GOENNER_SPONSORING_MIN_CHF) {
      return NextResponse.json(
        {
          error: `Sponsoring: Betrag muss ≥ ${GOENNER_SPONSORING_MIN_CHF} CHF sein.`,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("goenner_inquiries")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        amount_chf: amount,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message.includes("column") ? "Datenbank: Migration ausführen (goenner_inquiries_status_amount.sql)." : error.message },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json({ inquiry: data });
  }

  const { data, error } = await supabase
    .from("goenner_inquiries")
    .update({
      status: "open",
      completed_at: null,
      amount_chf: null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message.includes("column") ? "Datenbank: Migration ausführen (goenner_inquiries_status_amount.sql)." : error.message },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }
  return NextResponse.json({ inquiry: data });
}
