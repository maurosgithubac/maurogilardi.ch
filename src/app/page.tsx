import { HomeShell } from "@/components/home-shell";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { demoPosts } from "@/content/demoPosts";
import { getUpcomingPgtSeasonEvents } from "@/content/pgtSeasonEvents";
import { homeMarqueeSponsorCards } from "@/content/sponsorsSite";
import { blogImageUrl } from "@/lib/storage-public-url";
import { HOME_PAGE_DESCRIPTION, homePageMetadata } from "@/lib/seo/page-metadata";
import { homeWebPageJsonLd } from "@/lib/seo/webpage-jsonld";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { PostRow } from "@/types/content";

/** Homepage inkl. „nächste 4 Termine“ — öfter neu gegen PGT-Kalender */
export const revalidate = 3600;

export const metadata = homePageMetadata;

export default async function Home() {
  type PostCard = Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">;
  type HomePostCard = Omit<PostCard, "image_path"> & { image_url: string | null };
  type HomeSponsorCard = { id: string; name: string; website_url: string | null; logo_url: string };

  let posts: PostCard[] = [];

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, description, image_path, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(9);
    posts = (data as PostCard[]) ?? [];
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

  const homePosts: HomePostCard[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    created_at: post.created_at,
    image_url: blogImageUrl(post.image_path),
  }));

  const homeSponsors: HomeSponsorCard[] = homeMarqueeSponsorCards();

  const upcomingPgtEvents = getUpcomingPgtSeasonEvents(new Date());

  return (
    <>
      <SeoPageJsonLd schema={homeWebPageJsonLd(HOME_PAGE_DESCRIPTION)} />
      <HomeShell posts={homePosts} sponsors={homeSponsors} upcomingPgtEvents={upcomingPgtEvents} />
    </>
  );
}
