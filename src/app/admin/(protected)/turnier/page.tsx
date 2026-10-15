import { AdminTournamentClient } from "@/components/admin-tournament-client";
import { isMissingTableError } from "@/lib/prize-money";
import type { GoennerMemberRow } from "@/lib/goenner-finance";
import { isHundertMember, type TournamentInviteRow, type TournamentRow } from "@/lib/tournament";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export default async function AdminTournamentPage() {
  const supabase = await createSupabaseUserServerClient();
  const [tournamentsRes, membersRes, invitesRes] = await Promise.all([
    supabase.from("tournaments").select("*").order("event_date", { ascending: false }),
    supabase
      .from("goenner_members")
      .select("id,name,email,membership_id,category,active")
      .eq("active", true)
      .order("name", { ascending: true }),
    supabase.from("tournament_invites").select("*").order("name", { ascending: true }),
  ]);

  const missing = isMissingTableError(tournamentsRes.error?.message) || isMissingTableError(invitesRes.error?.message);
  const members = ((membersRes.data ?? []) as Pick<
    GoennerMemberRow,
    "id" | "name" | "email" | "membership_id" | "category" | "active"
  >[]).filter((member) => !isHundertMember(member));

  return (
    <AdminTournamentClient
      missing={missing}
      tournaments={(tournamentsRes.data ?? []) as TournamentRow[]}
      members={members}
      invites={(invitesRes.data ?? []) as TournamentInviteRow[]}
    />
  );
}
