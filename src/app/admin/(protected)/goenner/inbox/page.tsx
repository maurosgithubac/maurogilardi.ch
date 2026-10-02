import { AdminGoennerInquiriesClient } from "@/components/admin-goenner-inquiries-client";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";

export default async function AdminGoennerInboxPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("goenner_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data as GoennerInquiryRow[]) ?? [];

  return (
    <div className="ap-page">
      <AdminPageHeader
        eyebrow="Formular-Anfragen"
        title="Eingänge"
        description="E-Mail, Telefon, Betrag, Status und Eingangsdatum direkt in der Zeile bearbeiten und speichern. Name anklicken für Formular-Kommentar und eigenen Vermerk. Status «Bezahlt» legt Gönner und Zahlung an."
      />
      {error ? (
        <p className="ap-banner ap-banner--warn">Anfragen konnten nicht geladen werden.</p>
      ) : rows.length === 0 ? (
        <div className="ap-card ap-empty">
          <p className="ap-empty-title">Noch keine Eingänge</p>
          <p className="ap-muted-sm">Neue Anfragen aus dem Gönner-Formular erscheinen hier.</p>
        </div>
      ) : (
        <AdminGoennerInquiriesClient rows={rows} />
      )}
    </div>
  );
}
