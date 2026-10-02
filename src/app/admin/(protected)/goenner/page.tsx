import { AdminGoennerMembersClient } from "@/components/admin-goenner-members-client";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerMemberRow, GoennerPaymentRow } from "@/lib/goenner-finance";

type SearchParams = Promise<{ status?: string; year?: string; bereich?: string }>;

export default async function AdminGoennerMembersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const initialStatus = sp.status === "open" || sp.status === "paid" ? sp.status : undefined;
  const initialCategory =
    sp.bereich === "goenner" || sp.bereich === "sponsor" || sp.bereich === "partner" ? sp.bereich : undefined;
  const initialYear = sp.year && /^\d{4}$/.test(sp.year) ? Number(sp.year) : undefined;

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
    <AdminGoennerMembersClient
      members={members}
      payments={payments}
      schemaMissing={schemaMissing}
      initialStatus={initialStatus}
      initialYear={initialYear}
      initialCategory={initialCategory}
    />
  );
}
