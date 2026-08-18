import type { MetadataRoute } from "next";
import { visibleDemoPosts } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { SITE_URL } from "@/lib/seo/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Öffentliche Index-URLs — synchron mit page-metadata canonicals */
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/ueber-mich", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ueber-mich/faq", changeFrequency: "monthly", priority: 0.75 },
  { path: "/ueber-mich/sponsoren", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ueber-mich/gallerie", changeFrequency: "monthly", priority: 0.6 },
  { path: "/ueber-mich/media", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ueber-mich/equipment", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/erfolge", changeFrequency: "monthly", priority: 0.8 },
  { path: "/sponsoring", changeFrequency: "monthly", priority: 0.8 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.4 },
  { path: "/datenschutz", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; created_at: string }[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("slug, created_at")
      .eq("published", true)
      .lte("created_at", publishedAtOrBeforeIso())
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } catch {
    posts = visibleDemoPosts().map((p) => ({ slug: p.slug, created_at: p.created_at }));
  }

  if (posts.length === 0) {
    posts = visibleDemoPosts().map((p) => ({ slug: p.slug, created_at: p.created_at }));
  }

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
