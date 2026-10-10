import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { loadInboxCounts } from "@/lib/admin-inbox";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export const dynamic = "force-dynamic";

/** Zähler für das Badge in der Navigation */
export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createSupabaseUserServerClient();
  return NextResponse.json(await loadInboxCounts(supabase), { headers: { "Cache-Control": "no-store" } });
}

/** Alle neuen Eingänge als gelesen markieren */
export async function POST() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase
    .from("goenner_inquiries")
    .update({ seen_at: new Date().toISOString() })
    .is("seen_at", null);

  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("seen_at")
          ? "Datenbank: Migration ausführen (supabase/020_admin_inbox_seen_prize_money.sql)."
          : error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
