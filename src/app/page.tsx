import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { HomeHero } from "@/components/home/home-hero";
import { ProofBand } from "@/components/home/proof-band";
import { StorySection } from "@/components/home/story-section";
import { MilestonesSection } from "@/components/home/milestones-section";
import { SeasonBento } from "@/components/home/season-bento";
import { SupportSection } from "@/components/home/support-section";
import { PartnerTeaser } from "@/components/home/partner-teaser";
import { LatestPosts } from "@/components/home/latest-posts";
import type { HomePost } from "@/components/home/types";
import { visibleDemoPosts } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { getUpcomingPgtSeasonEvents } from "@/content/pgtSeasonEvents";
import { blogImageUrl } from "@/lib/storage-public-url";
import { HOME_PAGE_DESCRIPTION, homePageMetadata } from "@/lib/seo/page-metadata";
import { homeWebPageJsonLd } from "@/lib/seo/webpage-jsonld";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { PostRow } from "@/types/content";

/** Homepage inkl. nächster Termine — kurz cachen, damit geplante Posts pünktlich live gehen */
export const revalidate = 60;

export const metadata = homePageMetadata;

type PostSource = Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">;

async function loadPosts(): Promise<HomePost[]> {
  let posts: PostSource[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, description, image_path, created_at")
      .eq("published", true)
      .lte("created_at", publishedAtOrBeforeIso())
      .order("created_at", { ascending: false })
      .limit(4);
    posts = (data as PostSource[]) ?? [];
  } catch {
    /* Supabase nicht konfiguriert oder Tabellen fehlen */
  }

  if (posts.length === 0) {
    posts = visibleDemoPosts().slice(0, 4);
  }

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    created_at: post.created_at,
    image_url: blogImageUrl(post.image_path),
  }));
}

export default async function Home() {
  const posts = await loadPosts();
  const upcomingPgtEvents = getUpcomingPgtSeasonEvents(new Date());
  const [latestPost, ...morePosts] = posts;

  return (
    <div className="mg-page">
      <SeoPageJsonLd schema={homeWebPageJsonLd(HOME_PAGE_DESCRIPTION)} />
      <SiteHeader variant="overlay" />
      <main id="inhalt">
        <HomeHero />
        <ProofBand />
        <StorySection />
        <MilestonesSection />
        <SeasonBento events={upcomingPgtEvents} latestPost={latestPost ?? null} />
        <SupportSection />
        <PartnerTeaser />
        <LatestPosts posts={morePosts.slice(0, 3)} />
      </main>
      <SiteFooter />
    </div>
  );
}
