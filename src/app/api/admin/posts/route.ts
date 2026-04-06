import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { ensureUniquePostSlug } from "@/lib/posts-helpers";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createSupabaseUserServerClient();
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    body?: string;
    image_path?: string | null;
    published?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ungültige JSON" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const textBody = String(body.body ?? "").trim();
  if (!title || !textBody) {
    return NextResponse.json({ error: "Titel und Text erforderlich." }, { status: 400 });
  }

  const supabase = await createSupabaseUserServerClient();
  const slug = await ensureUniquePostSlug(supabase, title);
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title,
      description: body.description?.trim() || null,
      body: textBody,
      image_path: body.image_path || null,
      published: body.published !== false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ post: data });
}
