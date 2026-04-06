import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, logo_path, website_url, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ sponsors: data ?? [] });
  } catch {
    return NextResponse.json({ sponsors: [] });
  }
}
