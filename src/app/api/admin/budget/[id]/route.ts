import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

/** Ausgabe löschen. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("budget_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Enddatum eines wiederkehrenden Eintrags setzen (z. B. 31.12. des Vorjahres, wenn ein neuer Betrag ab Januar gilt). */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
  let body: { ends_on?: unknown };
  try {
    body = (await request.json()) as { ends_on?: unknown };
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const ends = body.ends_on;
  if (ends !== null && !(typeof ends === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ends))) {
    return NextResponse.json({ error: "Enddatum ungültig." }, { status: 400 });
  }
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("budget_entries").update({ ends_on: ends }).eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Eintrag nicht gefunden." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
