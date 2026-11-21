import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { categoriesFor, type BudgetScope } from "@/lib/budget";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

function parseEntry(b: Record<string, unknown>) {
  const scope = b.scope === "privat" ? "privat" : b.scope === "golf" ? "golf" : null;
  const amount = Number(String(b.amount_chf ?? "").replace(/[’'\s]/g, "").replace(",", "."));
  const date = String(b.entry_date ?? "");
  const category = String(b.category ?? "");
  if (!scope) return { error: "Bereich fehlt." } as const;
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Betrag fehlt." } as const;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Datum fehlt." } as const;
  if (!categoriesFor(scope as BudgetScope).some((c) => c.id === category)) return { error: "Kategorie unbekannt." } as const;
  return { value: { scope, amount_chf: amount, entry_date: date, category, label: String(b.label ?? "").trim().slice(0, 200) } } as const;
}

/** Eine Ausgabe anlegen. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const parsed = parseEntry(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("budget_entries").insert(parsed.value).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
