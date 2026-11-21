import { AdminBudgetClient } from "@/components/admin-budget-client";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import type { BudgetEntryRow } from "@/lib/budget";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export const dynamic = "force-dynamic";

export default async function AdminBudgetPage() {
  const supabase = await createSupabaseUserServerClient();
  const currentYear = new Date().getFullYear();
  const [entriesRes, paymentsRes, prizesRes] = await Promise.all([
    supabase.from("budget_entries").select("id,entry_date,amount_chf,scope,category,label").order("entry_date", { ascending: false }),
    supabase.from("goenner_payments").select("year,amount_chf"),
    supabase.from("prize_money").select("year,amount_chf"),
  ]);

  const entries = (entriesRes.data ?? []).map((e) => ({ ...e, amount_chf: Number(e.amount_chf) })) as BudgetEntryRow[];
  const incomeByYear: Record<string, number> = {};
  for (const p of paymentsRes.data ?? []) incomeByYear[String(p.year)] = (incomeByYear[String(p.year)] ?? 0) + Number(p.amount_chf || 0);
  for (const r of prizesRes.data ?? []) incomeByYear[String(r.year)] = (incomeByYear[String(r.year)] ?? 0) + Number(r.amount_chf || 0);

  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="ap-page ap-page--wide">
      <AdminPageHeader
        eyebrow="Budget"
        title="Ausgaben und Einnahmen"
        description="Golf und Privat getrennt. Ausgabe antippen, Kategorie wählen, Betrag eingeben. Oder einen Bank-Export hochladen."
      />
      {entriesRes.error ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Die Budget-Tabelle fehlt noch. In Supabase ausführen: <code>supabase/027_budget.sql</code>
        </p>
      ) : null}
      <AdminBudgetClient entries={entries} incomeByYear={incomeByYear} years={years} defaultYear={currentYear} />
    </div>
  );
}
