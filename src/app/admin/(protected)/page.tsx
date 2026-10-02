import { AdminOverview } from "@/components/admin/admin-overview";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerMemberRow, GoennerPaymentRow } from "@/lib/goenner-finance";
import type { GoennerInquiryRow } from "@/types/content";

export default async function AdminFinanceHomePage() {
  const supabase = await createSupabaseUserServerClient();

  const [membersRes, paymentsRes, inquiriesRes] = await Promise.all([
    supabase.from("goenner_members").select("*"),
    supabase.from("goenner_payments").select("*"),
    supabase.from("goenner_inquiries").select("*").eq("status", "open").order("created_at", { ascending: false }),
  ]);

  const schemaMissing =
    Boolean(membersRes.error?.message?.includes("does not exist")) ||
    Boolean(paymentsRes.error?.message?.includes("schema cache"));

  const members = (membersRes.data as GoennerMemberRow[]) ?? [];
  const payments = (paymentsRes.data as GoennerPaymentRow[]) ?? [];
  const openInquiries = (inquiriesRes.data as GoennerInquiryRow[]) ?? [];

  return (
    <AdminOverview
      members={members}
      payments={payments}
      openInquiries={openInquiries}
      schemaMissing={schemaMissing}
    />
  );
}
