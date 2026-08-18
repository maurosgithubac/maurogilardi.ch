import { NextResponse } from "next/server";
import { GOENNER_SPONSORING_MIN_CHF, membershipPriceChf } from "@/content/goennerMemberships";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryStatus } from "@/types/content";

const STATUSES: GoennerInquiryStatus[] = ["open", "completed", "exited"];

function parseAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return NaN;
  return Math.round(n * 100) / 100;
}

function parseCreatedAt(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  const s = String(raw).trim();
  // date-only YYYY-MM-DD → noon UTC+2-ish local noon via T12:00:00
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function ensureMemberAndPayment(
  supabase: Awaited<ReturnType<typeof createSupabaseUserServerClient>>,
  inquiry: {
    id: string;
    membership_id: string;
    name: string;
    email: string;
    phone: string | null;
    street: string | null;
    postal_code: string | null;
    city: string | null;
  },
  amount: number,
  paidOnIso?: string | null,
) {
  const email = inquiry.email?.trim().toLowerCase() || null;
  let memberId: string | null = null;

  if (email) {
    const { data: existing } = await supabase.from("goenner_members").select("id").eq("email", email).maybeSingle();
    memberId = existing?.id ?? null;
  }

  if (!memberId) {
    const { data: byInquiry } = await supabase
      .from("goenner_members")
      .select("id")
      .eq("inquiry_id", inquiry.id)
      .maybeSingle();
    memberId = byInquiry?.id ?? null;
  }

  if (!memberId) {
    const { data: created, error } = await supabase
      .from("goenner_members")
      .insert({
        name: inquiry.name,
        email,
        phone: inquiry.phone,
        street: inquiry.street,
        postal_code: inquiry.postal_code,
        city: inquiry.city,
        membership_id: inquiry.membership_id,
        inquiry_id: inquiry.id,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    memberId = created.id;
  } else {
    await supabase
      .from("goenner_members")
      .update({
        membership_id: inquiry.membership_id,
        name: inquiry.name,
        email,
        phone: inquiry.phone || undefined,
        street: inquiry.street || undefined,
        postal_code: inquiry.postal_code || undefined,
        city: inquiry.city || undefined,
        inquiry_id: inquiry.id,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);
  }

  const { data: existingPay } = await supabase
    .from("goenner_payments")
    .select("id")
    .eq("inquiry_id", inquiry.id)
    .maybeSingle();

  const paidOn =
    paidOnIso && /^\d{4}-\d{2}-\d{2}/.test(paidOnIso)
      ? paidOnIso.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  if (!existingPay) {
    const { error: payError } = await supabase.from("goenner_payments").insert({
      member_id: memberId,
      amount_chf: amount,
      paid_on: paidOn,
      membership_id: inquiry.membership_id,
      method: inquiry.membership_id === "hundert" ? "twint" : "other",
      note: `Aus Formular-Eingang (${inquiry.membership_id})`,
      inquiry_id: inquiry.id,
    });
    if (payError) throw payError;
  } else {
    await supabase
      .from("goenner_payments")
      .update({ amount_chf: amount, paid_on: paidOn })
      .eq("id", existingPay.id);
  }
}

async function setMemberActiveByInquiry(
  supabase: Awaited<ReturnType<typeof createSupabaseUserServerClient>>,
  inquiryId: string,
  active: boolean,
) {
  await supabase
    .from("goenner_members")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("inquiry_id", inquiryId);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data: existing, error: loadError } = await supabase
    .from("goenner_inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Gültige E-Mail erforderlich." }, { status: 400 });
    }
    patch.email = email;
  }

  if (body.phone !== undefined) {
    const phone = body.phone === null ? null : String(body.phone).trim();
    patch.phone = phone || null;
  }

  if (body.admin_note !== undefined) {
    const note = body.admin_note === null ? null : String(body.admin_note).trim();
    patch.admin_note = note || null;
  }

  if (body.amount_chf !== undefined) {
    const amount = parseAmount(body.amount_chf);
    if (amount !== null && Number.isNaN(amount)) {
      return NextResponse.json({ error: "Bitte einen gültigen Betrag in CHF angeben." }, { status: 400 });
    }
    const membershipId = existing.membership_id as string;
    if (
      amount != null &&
      membershipId === "sponsoring" &&
      amount < GOENNER_SPONSORING_MIN_CHF &&
      (body.status === "completed" || existing.status === "completed")
    ) {
      return NextResponse.json(
        { error: `Sponsoring: Betrag muss ≥ ${GOENNER_SPONSORING_MIN_CHF} CHF sein.` },
        { status: 400 },
      );
    }
    patch.amount_chf = amount;
  }

  if (body.created_at !== undefined) {
    const created = parseCreatedAt(body.created_at);
    if (created === null) {
      return NextResponse.json({ error: "Ungültiges Eingangsdatum." }, { status: 400 });
    }
    if (created) patch.created_at = created;
  }

  let nextStatus: GoennerInquiryStatus | undefined;
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !STATUSES.includes(body.status as GoennerInquiryStatus)) {
      return NextResponse.json(
        { error: "status muss «open», «completed» oder «exited» sein." },
        { status: 400 },
      );
    }
    nextStatus = body.status as GoennerInquiryStatus;
    patch.status = nextStatus;
    if (nextStatus === "completed") {
      patch.completed_at = new Date().toISOString();
    } else if (nextStatus === "open") {
      patch.completed_at = null;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 });
  }

  // Completing requires an amount
  const willComplete = nextStatus === "completed" || (nextStatus === undefined && existing.status === "completed");
  if (nextStatus === "completed") {
    const amount =
      patch.amount_chf !== undefined
        ? (patch.amount_chf as number | null)
        : existing.amount_chf != null
          ? Number(existing.amount_chf)
          : membershipPriceChf(existing.membership_id);
    if (amount == null || Number.isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: "Bitte einen gültigen Betrag in CHF angeben." }, { status: 400 });
    }
    if (existing.membership_id === "sponsoring" && amount < GOENNER_SPONSORING_MIN_CHF) {
      return NextResponse.json(
        { error: `Sponsoring: Betrag muss ≥ ${GOENNER_SPONSORING_MIN_CHF} CHF sein.` },
        { status: 400 },
      );
    }
    patch.amount_chf = amount;
  }

  if (nextStatus === "open" && body.clear_amount === true) {
    patch.amount_chf = null;
  }

  const { data, error } = await supabase
    .from("goenner_inquiries")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    const needsMigration =
      error.message.includes("column") ||
      error.message.includes("admin_note") ||
      error.message.includes("exited") ||
      error.message.includes("check");
    return NextResponse.json(
      {
        error: needsMigration
          ? "Datenbank: Migration ausführen (supabase/011_goenner_inquiries_inbox_fields.sql)."
          : error.message,
      },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  let warning: string | undefined;

  try {
    if (nextStatus === "completed" || (willComplete && patch.amount_chf !== undefined && existing.status === "completed")) {
      const amount = Number(data.amount_chf) || membershipPriceChf(data.membership_id);
      await ensureMemberAndPayment(supabase, data, amount, data.created_at);
    }
    if (nextStatus === "exited") {
      await setMemberActiveByInquiry(supabase, id, false);
    }
    if (nextStatus === "open" || nextStatus === "completed") {
      // re-activate if previously exited
      if (existing.status === "exited" || nextStatus === "completed") {
        await setMemberActiveByInquiry(supabase, id, true);
      }
    }
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : "Sync fehlgeschlagen";
    warning =
      message.includes("does not exist") || message.includes("schema cache")
        ? "Gespeichert, aber Gönner-Ledger fehlt — supabase/010_goenner_finance.sql ausführen."
        : `Gespeichert, Ledger-Sync: ${message}`;
  }

  return NextResponse.json(warning ? { inquiry: data, warning } : { inquiry: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_inquiries")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    const needsMigration =
      error.message.includes("policy") ||
      error.message.includes("permission") ||
      error.message.includes("row-level security");
    return NextResponse.json(
      {
        error: needsMigration
          ? "Datenbank: Migration ausführen (supabase/012_goenner_inquiries_delete_policy.sql)."
          : error.message,
      },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
