import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { ensureUniquePostSlug } from "@/lib/posts-helpers";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: {
    title?: string;
    description?: string | null;
    body?: string;
    image_path?: string | null;
    published?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const { data: existing, error: fetchErr } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const title = body.title !== undefined ? String(body.title).trim() : existing.title;
  const textBody = body.body !== undefined ? String(body.body).trim() : existing.body;
  if (!title || !textBody) {
    return NextResponse.json({ error: "Titel und Text erforderlich." }, { status: 400 });
  }

  let slug = existing.slug;
  if (body.title !== undefined && title !== existing.title) {
    slug = await ensureUniquePostSlug(supabase, title, id);
  }

  const { data, error } = await supabase
    .from("posts")
    .update({
      slug,
      title,
      description: body.description === undefined ? existing.description : body.description,
      body: textBody,
      image_path: body.image_path === undefined ? existing.image_path : body.image_path,
      published: body.published === undefined ? existing.published : body.published,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ post: data });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const supabase = await createSupabaseUserServerClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
