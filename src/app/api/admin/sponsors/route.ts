import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("sponsors").select("*").order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sponsors: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; logo_path?: string; website_url?: string | null; sort_order?: number; active?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const logo_path = String(body.logo_path || "").trim();
  if (!name || !logo_path) {
    return NextResponse.json({ error: "Name und Logo-Pfad erforderlich." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase
    .from("sponsors")
    .insert({
      name,
      logo_path,
      website_url: body.website_url?.trim() || null,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
      active: body.active !== false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sponsor: data });
}
