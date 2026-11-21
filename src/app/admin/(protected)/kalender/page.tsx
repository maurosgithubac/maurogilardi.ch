import { AdminKalenderClient } from "@/components/admin-kalender-client";
import { fallbackRows, type KalenderEventRow } from "@/lib/kalender-events";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export const dynamic = "force-dynamic";

export default async function AdminKalenderPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("kalender_events")
    .select("id,name,start_date,end_date,location,country,lat,lon,kind,info_url")
    .order("start_date", { ascending: true });

  const rows = (data ?? []) as KalenderEventRow[];
  const missing = Boolean(error);

  return <AdminKalenderClient initial={missing ? fallbackRows() : rows} missing={missing} />;
}
