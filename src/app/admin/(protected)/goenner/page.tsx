import { AdminGoennerInquiriesClient } from "@/components/admin-goenner-inquiries-client";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";

export default async function AdminGoennerPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data as GoennerInquiryRow[]) ?? [];

  return (
    <div className="admin-card-stack">
      <header className="admin-page-head">
        <p className="admin-page-kicker">Sponsoring</p>
        <h1 className="admin-h1">Anfragen</h1>
        <p className="admin-muted admin-page-lead">
          Offene Anfragen abarbeiten (Mitgliedschaft oder Sponsoring ab 2&apos;000 CHF), als erledigt markieren und den
          Betrag erfassen — erledigte Einträge bleiben im Archiv mit Summe oben.
        </p>
      </header>

      {error ? (
        <p className="admin-muted">
          Tabelle fehlt, Spalten fehlen oder keine Berechtigung. In Supabase nacheinander ausführen:{" "}
          <code className="admin-code">supabase/goenner_inquiries.sql</code>, bei bestehender Tabelle{" "}
          <code className="admin-code">supabase/goenner_inquiries_add_address.sql</code> und für Status/Beträge{" "}
          <code className="admin-code">supabase/goenner_inquiries_status_amount.sql</code>, für Sponsoring-Option{" "}
          <code className="admin-code">supabase/goenner_inquiries_membership_sponsoring.sql</code>.
        </p>
      ) : null}

      {!error && rows.length === 0 ? <p className="admin-muted">Noch keine Anfragen.</p> : null}

      {!error && rows.length > 0 ? <AdminGoennerInquiriesClient rows={rows} /> : null}
    </div>
  );
}
