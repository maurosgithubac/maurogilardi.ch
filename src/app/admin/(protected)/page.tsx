import { AdminOverview } from "@/components/admin/admin-overview";
import type { StatusFilter } from "@/components/admin-goenner-members-client";
import type { CategoryFilter } from "@/components/admin/admin-ui";
import { GOENNER_FINANCE_START_YEAR, type GoennerMemberRow, type GoennerPaymentRow } from "@/lib/goenner-finance";
import { isMissingTableError, type PrizeMoneyRow } from "@/lib/prize-money";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";

type SearchParams = Promise<{ status?: string; year?: string; bereich?: string }>;

export default async function AdminOverviewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const yearParam = sp.year && /^\d{4}$/.test(sp.year) ? Number(sp.year) : NaN;
  const initialYear =
    yearParam >= GOENNER_FINANCE_START_YEAR && yearParam <= currentYear ? yearParam : currentYear;
  const initialStatus: StatusFilter | undefined =
    sp.status === "open" || sp.status === "paid" ? sp.status : undefined;
  const initialCategory: CategoryFilter | undefined =
    sp.bereich === "goenner" || sp.bereich === "sponsor" || sp.bereich === "partner" ? sp.bereich : undefined;

  const supabase = await createSupabaseUserServerClient();
  const [membersRes, paymentsRes, inquiriesRes, prizeRes] = await Promise.all([
    supabase.from("goenner_members").select("*").order("name", { ascending: true }),
    supabase.from("goenner_payments").select("*"),
    supabase
      .from("goenner_inquiries")
      .select("*")
      .or("status.eq.open,status.is.null,seen_at.is.null")
      .order("created_at", { ascending: false }),
    supabase.from("prize_money").select("*").order("event_date", { ascending: false }),
  ]);

  // Fehlt seen_at (Migration 020), schlägt der Filter fehl → nur offene laden
  const inquiries = inquiriesRes.error
    ? ((await supabase.from("goenner_inquiries").select("*").eq("status", "open").order("created_at", { ascending: false }))
        .data as GoennerInquiryRow[] | null)
    : (inquiriesRes.data as GoennerInquiryRow[] | null);

  return (
    <AdminOverview
      members={(membersRes.data as GoennerMemberRow[]) ?? []}
      payments={(paymentsRes.data as GoennerPaymentRow[]) ?? []}
      inquiries={inquiries ?? []}
      prizes={(prizeRes.data as PrizeMoneyRow[]) ?? []}
      ledgerMissing={isMissingTableError(membersRes.error?.message) || isMissingTableError(paymentsRes.error?.message)}
      migration020Missing={isMissingTableError(prizeRes.error?.message) || Boolean(inquiriesRes.error)}
      initialYear={initialYear}
      initialStatus={initialStatus}
      initialCategory={initialCategory}
    />
  );
}
