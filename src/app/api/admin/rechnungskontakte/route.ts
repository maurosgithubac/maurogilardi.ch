import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

function clean(v: unknown, max: number) {
  return String(v ?? "").trim().slice(0, max);
}

/** Neuen Rechnungskontakt speichern. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const value = {
    name: clean(body.name, 160),
    organization: clean(body.organization, 160),
    street: clean(body.street, 200),
    postal_code: clean(body.postal_code, 16),
    city: clean(body.city, 120),
    email: clean(body.email, 200),
  };
  if (value.name.length < 2) return NextResponse.json({ error: "Name fehlt." }, { status: 400 });
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("rechnungskontakte").insert(value).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
