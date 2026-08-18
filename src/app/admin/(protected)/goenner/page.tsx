import { AdminGoennerMembersClient } from "@/components/admin-goenner-members-client";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerMemberRow, GoennerPaymentRow } from "@/lib/goenner-finance";

export default async function AdminGoennerMembersPage() {
  const supabase = await createSupabaseUserServerClient();
  const membersRes = await supabase.from("goenner_members").select("*").order("name", { ascending: true });
  const paymentsRes = await supabase.from("goenner_payments").select("*").order("paid_on", { ascending: false });

  const schemaMissing =
    Boolean(membersRes.error?.message?.includes("does not exist")) ||
    Boolean(paymentsRes.error?.message?.includes("does not exist")) ||
    Boolean(membersRes.error?.message?.includes("schema cache"));

  const members = (membersRes.data as GoennerMemberRow[]) ?? [];
  const payments = (paymentsRes.data as GoennerPaymentRow[]) ?? [];

  return (
    <div className="mgf-page">
      <header className="mgf-page-head">
        <p className="mgf-kicker">Ledger</p>
        <h1 className="mgf-h1">Gönner</h1>
        <p className="mgf-lead">
          Verwalte Personen, Kontakte und Zahlungen. Pro Gönner siehst du das laufende Jahr, das Vorjahr und das Total
          seit 2022.
        </p>
      </header>
      <AdminGoennerMembersClient members={members} payments={payments} schemaMissing={schemaMissing} />
    </div>
  );
}
