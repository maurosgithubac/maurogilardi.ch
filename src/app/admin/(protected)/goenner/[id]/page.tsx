import { notFound } from "next/navigation";
import { AdminGoennerMemberDetailClient } from "@/components/admin-goenner-member-detail-client";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerMemberRow, GoennerPaymentRow } from "@/lib/goenner-finance";

export default async function AdminGoennerMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseUserServerClient();
  const { data: member } = await supabase.from("goenner_members").select("*").eq("id", id).maybeSingle();
  if (!member) notFound();

  const { data: payments } = await supabase
    .from("goenner_payments")
    .select("*")
    .eq("member_id", id)
    .order("paid_on", { ascending: false });

  return (
    <div className="mgf-page">
      <AdminGoennerMemberDetailClient
        member={member as GoennerMemberRow}
        payments={(payments as GoennerPaymentRow[]) ?? []}
      />
    </div>
  );
}
