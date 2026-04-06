import { HomeShell } from "@/components/home-shell";
import { demoPosts } from "@/content/demoPosts";
import { getUpcomingPgtSeasonEvents } from "@/content/pgtSeasonEvents";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { PostRow, SponsorRow } from "@/types/content";

/** Homepage inkl. „nächste 4 Termine“ — öfter neu gegen PGT-Kalender */
export const revalidate = 3600;

export default async function Home() {
  type PostCard = Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">;
  type SponsorCard = Pick<SponsorRow, "id" | "name" | "logo_path" | "website_url">;

  let posts: PostCard[] = [];
  let sponsors: SponsorCard[] = [];

  try {
    const supabase = createSupabaseServerClient();
    const [postsRes, sponsorsRes] = await Promise.all([
      supabase
        .from("posts")
        .select("id, slug, title, description, image_path, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(9),
      supabase
        .from("sponsors")
        .select("id, name, logo_path, website_url")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ]);
    posts = (postsRes.data as PostCard[]) ?? [];
    sponsors = (sponsorsRes.data as SponsorCard[]) ?? [];
  } catch {
    /* Supabase nicht konfiguriert oder Tabellen fehlen */
  }

  if (posts.length === 0) {
    posts = demoPosts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      image_path: post.image_path,
      created_at: post.created_at,
    }));
  }

  const upcomingPgtEvents = getUpcomingPgtSeasonEvents(new Date());

  return <HomeShell posts={posts} sponsors={sponsors} upcomingPgtEvents={upcomingPgtEvents} />;
}
