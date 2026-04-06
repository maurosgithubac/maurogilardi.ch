import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug, title, description, body, image_path, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ posts: data ?? [] });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
