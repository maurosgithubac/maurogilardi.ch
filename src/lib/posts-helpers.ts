import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/slug";

export async function ensureUniquePostSlug(supabase: SupabaseClient, title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 0;

  while (true) {
    const { data } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    if (excludeId && data.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}
