import { AdminRechnungenClient, type RecipientOption } from "@/components/admin-rechnungen-client";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export const dynamic = "force-dynamic";

function groupOf(category: string | null, membership: string): string {
  if (membership === "sponsoring" || category === "sponsor") return "Sponsor";
  if (membership === "partner" || category === "partner") return "Partner";
  return "Gönner";
}

export default async function AdminRechnungenPage() {
  const supabase = await createSupabaseUserServerClient();
  const [membersRes, contactsRes] = await Promise.all([
    supabase
      .from("goenner_members")
      .select("id,name,organization,email,street,postal_code,city,category,membership_id")
      .order("name", { ascending: true }),
    supabase.from("rechnungskontakte").select("id,name,organization,email,street,postal_code,city").order("name", { ascending: true }),
  ]);

  const members: RecipientOption[] = (membersRes.data ?? []).map((m) => ({
    key: m.id,
    name: m.name,
    organization: m.organization ?? "",
    street: m.street ?? "",
    postalCode: m.postal_code ?? "",
    city: m.city ?? "",
    email: m.email ?? "",
    group: groupOf(m.category, m.membership_id),
  }));
  const contacts: RecipientOption[] = (contactsRes.data ?? []).map((c) => ({
    key: c.id,
    name: c.name,
    organization: c.organization ?? "",
    street: c.street ?? "",
    postalCode: c.postal_code ?? "",
    city: c.city ?? "",
    email: c.email ?? "",
    group: "Kontakt",
  }));

  return (
    <div className="ap-page ap-page--wide">
      <AdminPageHeader
        eyebrow="Rechnungen"
        title="Rechnung erstellen"
        description="Empfänger wählen, Positionen eintragen, Vorschau prüfen und als PDF herunterladen. Es wird nichts versendet."
      />
      <AdminRechnungenClient members={members} contacts={contacts} contactsMissing={Boolean(contactsRes.error)} />
    </div>
  );
}
