import { AdminOverview, type TournamentSummary } from "@/components/admin/admin-overview";
import type { StatusFilter } from "@/components/admin-goenner-members-client";
import type { CategoryFilter } from "@/components/admin/admin-ui";
import type { BudgetEntryRow } from "@/lib/budget";
import { GOENNER_FINANCE_START_YEAR, type GoennerMemberRow, type GoennerPaymentRow } from "@/lib/goenner-finance";
import { loadBeehiivStats, type NewsletterStats } from "@/lib/beehiiv-stats";
import { loadUpcomingEvents } from "@/lib/kalender-upcoming";
import { isMissingTableError, type PrizeMoneyRow } from "@/lib/prize-money";
import type { TournamentInviteRow, TournamentRow } from "@/lib/tournament";
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
  const [events, membersRes, paymentsRes, inquiriesRes, prizeRes, budgetRes, newsletterRes, tournamentRes, beehiiv] = await Promise.all([
    loadUpcomingEvents(6),
    supabase.from("goenner_members").select("*").order("name", { ascending: true }),
    supabase.from("goenner_payments").select("*"),
    supabase
      .from("goenner_inquiries")
      .select("*")
      .or("status.eq.open,status.is.null,seen_at.is.null")
      .order("created_at", { ascending: false }),
    supabase.from("prize_money").select("*").order("event_date", { ascending: false }),
    supabase
      .from("budget_entries")
      .select("id,entry_date,amount_chf,scope,category,label,frequency,ends_on")
      .eq("scope", "golf"),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("*").is("archived_at", null).order("event_date", { ascending: false }).limit(1),
    loadBeehiivStats(),
  ]);

  // Fehlt seen_at (Migration 020), schlägt der Filter fehl → nur offene laden
  const inquiries = inquiriesRes.error
    ? ((await supabase.from("goenner_inquiries").select("*").eq("status", "open").order("created_at", { ascending: false }))
        .data as GoennerInquiryRow[] | null)
    : (inquiriesRes.data as GoennerInquiryRow[] | null);

  // Newsletter: Beehiiv ist die Quelle. Nur wenn Beehiiv nicht erreichbar ist, die Zahl der Website-Liste (Supabase) zeigen.
  const newsletter: NewsletterStats | null =
    beehiiv ?? (newsletterRes.error ? null : { subscribers: newsletterRes.count ?? 0, openRate: null, clickRate: null, sent: null, source: "supabase" });

  // Gönnerturnier: neuester Anlass mit Antworten
  let tournament: TournamentSummary | null = null;
  // Fehlt die Archiv-Spalte noch (Migration 030), das neueste Turnier ohne Filter laden
  const tournamentRows = tournamentRes.error
    ? (await supabase.from("tournaments").select("*").order("event_date", { ascending: false }).limit(1)).data
    : tournamentRes.data;
  const latest = (tournamentRows?.[0] ?? null) as TournamentRow | null;
  if (latest) {
    const invitesRes = await supabase.from("tournament_invites").select("*").eq("tournament_id", latest.id);
    const invites = ((invitesRes.data ?? []) as TournamentInviteRow[]).filter(Boolean);
    tournament = {
      id: latest.id,
      title: latest.title,
      event_date: latest.event_date,
      status: latest.status,
      invited: invites.length,
      responded: invites.filter((i) => i.responded_at).length,
      clinic: invites.filter((i) => i.clinic).length,
      round: invites.filter((i) => i.golf_round).length,
      dinner: invites.filter((i) => i.dinner).length,
    };
  }

  return (
    <AdminOverview
      members={(membersRes.data as GoennerMemberRow[]) ?? []}
      payments={(paymentsRes.data as GoennerPaymentRow[]) ?? []}
      inquiries={inquiries ?? []}
      prizes={(prizeRes.data as PrizeMoneyRow[]) ?? []}
      events={events}
      budget={(budgetRes.error ? [] : (budgetRes.data ?? [])) as BudgetEntryRow[]}
      newsletter={newsletter}
      tournament={tournament}
      ledgerMissing={isMissingTableError(membersRes.error?.message) || isMissingTableError(paymentsRes.error?.message)}
      migration020Missing={isMissingTableError(prizeRes.error?.message) || Boolean(inquiriesRes.error)}
      initialYear={initialYear}
      initialStatus={initialStatus}
      initialCategory={initialCategory}
    />
  );
}
