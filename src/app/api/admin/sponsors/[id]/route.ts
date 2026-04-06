import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: Partial<{
    name: string;
    logo_path: string;
    website_url: string | null;
    sort_order: number;
    active: boolean;
  }>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.logo_path !== undefined) patch.logo_path = String(body.logo_path).trim();
  if (body.website_url !== undefined) patch.website_url = body.website_url?.trim() || null;
  if (body.sort_order !== undefined) patch.sort_order = body.sort_order;
  if (body.active !== undefined) patch.active = body.active;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Keine Felder." }, { status: 400 });
  }

  const { data, error } = await supabase.from("sponsors").update(patch).eq("id", id).select("*").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sponsor: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
