import type { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { GoennerInquiryRow } from "@/types/content";

type Supabase = Awaited<ReturnType<typeof createSupabaseUserServerClient>>;

export type InboxCounts = {
  /** Noch nie im Admin geöffnet */
  unseen: number;
  /** Status «offen» (unabhängig vom Gelesen-Status) */
  open: number;
};

/** Neu = seen_at ist explizit null. Fehlt die Spalte (Migration 020 nicht ausgeführt), gilt nichts als neu. */
export function isNewInquiry(row: Pick<GoennerInquiryRow, "seen_at">) {
  return row.seen_at === null;
}

export async function loadInboxCounts(supabase: Supabase): Promise<InboxCounts> {
  const [unseenRes, openRes] = await Promise.all([
    supabase.from("goenner_inquiries").select("id", { count: "exact", head: true }).is("seen_at", null),
    supabase.from("goenner_inquiries").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);
  return {
    unseen: unseenRes.error ? 0 : (unseenRes.count ?? 0),
    open: openRes.error ? 0 : (openRes.count ?? 0),
  };
}
