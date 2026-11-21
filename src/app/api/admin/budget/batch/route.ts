import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { categoriesFor, type BudgetScope } from "@/lib/budget";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

/** Mehrere Buchungen aus dem Bank-Import auf einmal speichern. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { rows?: Record<string, unknown>[] };
  try {
    body = (await request.json()) as { rows?: Record<string, unknown>[] };
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const rows = (body.rows ?? []).slice(0, 500).flatMap((r) => {
    const scope = r.scope === "privat" ? "privat" : "golf";
    const category = String(r.category ?? "");
    const amount = Number(r.amount_chf);
    const date = String(r.entry_date ?? "");
    if (!categoriesFor(scope as BudgetScope).some((c) => c.id === category)) return [];
    if (!Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
    const frequency = r.frequency === "monatlich" || r.frequency === "jaehrlich" ? r.frequency : "einmalig";
    return [{ scope, category, amount_chf: amount, entry_date: date, label: String(r.label ?? "").slice(0, 200), frequency }];
  });
  if (rows.length === 0) return NextResponse.json({ error: "Keine gültigen Zeilen." }, { status: 400 });
  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("budget_entries").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: rows.length });
}
