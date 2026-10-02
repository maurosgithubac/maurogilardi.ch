import type { MetadataRoute } from "next";
import { visibleDemoPosts } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { SITE_URL } from "@/lib/seo/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Inhaltsstand der statischen Seiten (bei grösseren Inhaltsänderungen nachführen).
 * Bewusst fix statt `new Date()`: ein bei jedem Abruf neues lastmod entwertet das Signal.
 */
const STATIC_CONTENT_UPDATED = "2026-10-02";
const LEGAL_CONTENT_UPDATED = "2026-10-02";

/** Öffentliche Index-URLs — synchron mit den canonicals in page-metadata */
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  /** "posts" = Datum des neuesten Blog-Beitrags */
  lastModified: "posts" | string;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1, lastModified: "posts" },
  { path: "/2027", changeFrequency: "weekly", priority: 0.9, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/sponsoring", changeFrequency: "monthly", priority: 0.9, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/partner", changeFrequency: "monthly", priority: 0.8, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8, lastModified: "posts" },
  { path: "/erfolge", changeFrequency: "monthly", priority: 0.8, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/ueber-mich", changeFrequency: "monthly", priority: 0.8, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/ueber-mich/faq", changeFrequency: "monthly", priority: 0.6, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/ueber-mich/sponsoren", changeFrequency: "monthly", priority: 0.6, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/ueber-mich/media", changeFrequency: "monthly", priority: 0.5, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/ueber-mich/equipment", changeFrequency: "yearly", priority: 0.5, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/ueber-mich/gallerie", changeFrequency: "monthly", priority: 0.5, lastModified: STATIC_CONTENT_UPDATED },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.2, lastModified: LEGAL_CONTENT_UPDATED },
  { path: "/datenschutz", changeFrequency: "yearly", priority: 0.2, lastModified: LEGAL_CONTENT_UPDATED },
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
    posts = [];
  }

  if (posts.length === 0) {
    posts = visibleDemoPosts().map((p) => ({ slug: p.slug, created_at: p.created_at }));
  }

  // Doppelte Slugs (Supabase + Demo) nur einmal, neuestes Datum zuerst
  const bySlug = new Map<string, string>();
  for (const p of posts) {
    const prev = bySlug.get(p.slug);
    if (!prev || prev < p.created_at) bySlug.set(p.slug, p.created_at);
  }
  const uniquePosts = [...bySlug.entries()]
    .map(([slug, created_at]) => ({ slug, created_at }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const newestPost = uniquePosts[0]?.created_at ?? STATIC_CONTENT_UPDATED;

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority, lastModified }) => ({
      url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
      lastModified: new Date(lastModified === "posts" ? newestPost : lastModified),
      changeFrequency,
      priority,
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = uniquePosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
