import { AdminGoennerInquiriesClient } from "@/components/admin-goenner-inquiries-client";
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
    <div className="mgf-page">
      <header className="mgf-page-head">
        <p className="mgf-kicker">Inbox</p>
        <h1 className="mgf-h1">Eingänge</h1>
        <p className="mgf-lead">
          Formular-Anfragen bearbeiten: E-Mail, Telefon, Betrag, Status und Eingangsdatum inline. Name antippen für
          Formular-Kommentar / eigenen Vermerk. «Bezahlt» legt Gönner + Zahlung an.
        </p>
      </header>
      {error ? (
        <p className="mgf-banner mgf-banner--warn">Anfragen konnten nicht geladen werden.</p>
      ) : rows.length === 0 ? (
        <p className="mgf-muted">Noch keine Eingänge.</p>
      ) : (
        <AdminGoennerInquiriesClient rows={rows} />
      )}
    </div>
  );
}
