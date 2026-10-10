import { AdminGoennerInquiriesClient, type InboxFilter } from "@/components/admin-goenner-inquiries-client";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";

const FILTERS: InboxFilter[] = ["new", "open", "paid", "exited", "hundert", "all"];

type SearchParams = Promise<{ filter?: string }>;

export default async function AdminGoennerInboxPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const initialFilter = FILTERS.find((f) => f === sp.filter);

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
        description="Neue Anfragen sind rot markiert, bis du sie öffnest oder bearbeitest. E-Mail, Telefon, Betrag, Status und Datum direkt in der Zeile ändern und speichern. Status «Bezahlt» legt Gönner und Zahlung an."
      />
      {error ? (
        <p className="ap-banner ap-banner--warn">Anfragen konnten nicht geladen werden.</p>
      ) : rows.length === 0 ? (
        <div className="ap-card ap-empty">
          <p className="ap-empty-title">Noch keine Eingänge</p>
          <p className="ap-muted-sm">Neue Anfragen aus dem Gönner-Formular erscheinen hier.</p>
        </div>
      ) : (
        <AdminGoennerInquiriesClient key={initialFilter ?? "default"} rows={rows} initialFilter={initialFilter} />
      )}
    </div>
  );
}
