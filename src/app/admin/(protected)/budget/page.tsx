import { AdminBudgetClient } from "@/components/admin-budget-client";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import type { BudgetEntryRow } from "@/lib/budget";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export const dynamic = "force-dynamic";

const BASE_COLUMNS = "id,entry_date,amount_chf,scope,category,label,frequency,ends_on";

export default async function AdminBudgetPage() {
  const supabase = await createSupabaseUserServerClient();
  const currentYear = new Date().getFullYear();

  // Mit Unterkategorie (Migration 029). Fehlt die Spalte noch, ohne sie laden, damit die Seite weiter läuft.
  type EntriesRes = { data: Record<string, unknown>[] | null; error: { message: string } | null };
  let entriesRes: EntriesRes = await supabase.from("budget_entries").select(`${BASE_COLUMNS},subcategory`).order("entry_date", { ascending: false });
  const subMissing = Boolean(entriesRes.error) && /subcategory/i.test(entriesRes.error?.message ?? "");
  if (subMissing) {
    entriesRes = await supabase.from("budget_entries").select(BASE_COLUMNS).order("entry_date", { ascending: false });
  }

  const [paymentsRes, prizesRes] = await Promise.all([
    supabase.from("goenner_payments").select("year,amount_chf"),
    supabase.from("prize_money").select("year,amount_chf"),
  ]);

  const entries = (entriesRes.data ?? []).map((e) => ({ ...e, amount_chf: Number(e.amount_chf) })) as unknown as BudgetEntryRow[];
  const incomeByYear: Record<string, number> = {};
  for (const p of paymentsRes.data ?? []) incomeByYear[String(p.year)] = (incomeByYear[String(p.year)] ?? 0) + Number(p.amount_chf || 0);
  for (const r of prizesRes.data ?? []) incomeByYear[String(r.year)] = (incomeByYear[String(r.year)] ?? 0) + Number(r.amount_chf || 0);

  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="ap-page ap-page--wide">
      <AdminPageHeader
        eyebrow="Finanzen"
        title="Budget"
        description="Alle Kategorien auf einen Blick. Je mehr Ausgaben, desto grösser die Kachel. Kachel antippen, Unterkategorie wählen, Betrag eintragen."
      />
      {entriesRes.error ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Die Budget-Tabelle fehlt noch. In Supabase ausführen: <code>supabase/027_budget.sql</code>
        </p>
      ) : null}
      {subMissing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Für Unterkategorien bitte in Supabase ausführen: <code>supabase/029_budget_subcategories.sql</code>
        </p>
      ) : null}
      <AdminBudgetClient entries={entries} incomeByYear={incomeByYear} years={years} defaultYear={currentYear} />
    </div>
  );
}
