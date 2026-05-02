import type { MetadataRoute } from "next";
import { demoPosts } from "@/content/demoPosts";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const base = "https://www.maurogilardi.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; created_at: string }[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("posts").select("slug, created_at").eq("published", true).order("created_at", {
      ascending: false,
    });
    posts = data ?? [];
  } catch {
    posts = demoPosts.map((p) => ({ slug: p.slug, created_at: p.created_at }));
  }

  if (posts.length === 0) {
    posts = demoPosts.map((p) => ({ slug: p.slug, created_at: p.created_at }));
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ueber-mich`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/ueber-mich/sponsoren`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ueber-mich/gallerie`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ueber-mich/media`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ueber-mich/equipment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/erfolge`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sponsoring`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
