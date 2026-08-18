import { NextResponse } from "next/server";
import { isKnownMembershipId } from "@/content/goennerMemberships";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

function validId(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { data: member, error } = await supabase.from("goenner_members").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const { data: payments, error: payError } = await supabase
    .from("goenner_payments")
    .select("*")
    .eq("member_id", id)
    .order("paid_on", { ascending: false });

  if (payError) return NextResponse.json({ error: payError.message }, { status: 500 });

  return NextResponse.json({ member, payments: payments ?? [] });
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

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2) return NextResponse.json({ error: "Name erforderlich." }, { status: 400 });
    patch.name = name;
  }
  if ("email" in body) patch.email = String(body.email || "").trim().toLowerCase() || null;
  if ("phone" in body) patch.phone = String(body.phone || "").trim() || null;
  if ("street" in body) patch.street = String(body.street || "").trim() || null;
  if ("postal_code" in body) patch.postal_code = String(body.postal_code || "").trim() || null;
  if ("city" in body) patch.city = String(body.city || "").trim() || null;
  if ("notes" in body) patch.notes = String(body.notes || "").trim() || null;
  if ("active" in body) patch.active = Boolean(body.active);
  if (typeof body.membership_id === "string") {
    if (!isKnownMembershipId(body.membership_id)) {
      return NextResponse.json({ error: "Ungültige Stufe." }, { status: 400 });
    }
    patch.membership_id = body.membership_id;
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("goenner_members").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json({ member: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!validId(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("goenner_members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
