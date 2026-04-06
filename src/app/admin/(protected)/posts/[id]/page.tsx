import { notFound } from "next/navigation";
import { AdminPostForm } from "@/components/admin-post-form";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { PostRow } from "@/types/content";

export default async function AdminPostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseUserServerClient();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <AdminPostForm initial={data as PostRow} />;
}
