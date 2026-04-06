import { NextResponse } from "next/server";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function POST() {
  const supabase = await createSupabaseUserServerClient();
  await supabase.auth.signOut({ scope: "global" });
  return NextResponse.json({ ok: true });
}
