import { AdminKalenderClient } from "@/components/admin-kalender-client";
import { AdminPageHeader } from "@/components/admin/admin-ui";
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

  return (
    <div className="ap-page">
      <AdminPageHeader
        eyebrow="Kalender"
        title="Turniere und Termine"
        description="Hier pflegst du die Turniere der Saison. Die Seite /kalender und die Karte aktualisieren sich automatisch."
      />
      {missing ? (
        <p className="ap-banner ap-banner--warn" role="status">
          Die Tabelle fehlt noch. In Supabase ausführen: <code>supabase/025_kalender_events.sql</code>
        </p>
      ) : null}
      <AdminKalenderClient initial={missing ? fallbackRows() : rows} />
    </div>
  );
}
