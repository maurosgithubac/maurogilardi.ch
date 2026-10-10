import { AdminPrizeMoneyClient } from "@/components/admin-prize-money-client";
import { isMissingTableError, type PrizeMoneyRow } from "@/lib/prize-money";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export default async function AdminPrizeMoneyPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("prize_money")
    .select("*")
    .order("event_date", { ascending: false });

  return (
    <AdminPrizeMoneyClient
      rows={(data as PrizeMoneyRow[]) ?? []}
      tableMissing={isMissingTableError(error?.message)}
      loadError={error && !isMissingTableError(error.message) ? error.message : undefined}
    />
  );
}
