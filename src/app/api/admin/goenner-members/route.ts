import { NextResponse } from "next/server";
import { isKnownMembershipId } from "@/content/goennerMemberships";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data: members, error: membersError } = await supabase
    .from("goenner_members")
    .select("*")
    .order("name", { ascending: true });

  if (membersError) {
    return NextResponse.json(
      {
        error: membersError.message.includes("does not exist")
          ? "Tabelle fehlt — supabase/010_goenner_finance.sql in Supabase ausführen."
          : membersError.message,
      },
      { status: 500 },
    );
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("goenner_payments")
    .select("*")
    .order("paid_on", { ascending: false });

  if (paymentsError) {
    return NextResponse.json({ error: paymentsError.message }, { status: 500 });
  }

  return NextResponse.json({ members: members ?? [], payments: payments ?? [] });
}

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

  const name = String(body.name || "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Name erforderlich." }, { status: 400 });
  }

  const membership_id = String(body.membership_id || "birdie").trim();
  if (!isKnownMembershipId(membership_id)) {
    return NextResponse.json({ error: "Ungültige Stufe." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_members")
    .insert({
      name,
      email: String(body.email || "").trim().toLowerCase() || null,
      phone: String(body.phone || "").trim() || null,
      street: String(body.street || "").trim() || null,
      postal_code: String(body.postal_code || "").trim() || null,
      city: String(body.city || "").trim() || null,
      membership_id,
      notes: String(body.notes || "").trim() || null,
      active: body.active === false ? false : true,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: data }, { status: 201 });
}
