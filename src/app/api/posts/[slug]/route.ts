import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json({ post: data });
  } catch {
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
