import Link from "next/link";
import { visibleDemoPosts } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import { blogIndexMetadata, blogIndexSchema } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import type { PostRow } from "@/types/content";
import { PageHero } from "@/components/page-hero";
import { PostCard } from "@/components/post-card";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;

export const metadata = blogIndexMetadata;

export default async function BlogPage() {
  let posts: Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, description, image_path, created_at")
      .eq("published", true)
      .lte("created_at", publishedAtOrBeforeIso())
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } catch {
    /* ignore */
  }

  if (posts.length === 0) {
    posts = visibleDemoPosts();
  }

  const [feature, ...rest] = posts;

  return (
    <div className="mg-page site-page blog-page">
      <SeoPageJsonLd schema={blogIndexSchema} />
      <SiteHeader variant="overlay" />
      <main id="inhalt">
        <PageHero
          eyebrow="Blog"
          title="Tour-Tagebuch."
          lead="Alles, was ich unterwegs erlebe — Turniere, Training, Entscheidungen. Ehrlich und aus erster Hand."
          image={seoImages.tournamentAction}
          imageAlt={seoImageAlts.tournamentAction}
          actions={
            <Link href="/#newsletter" className="mg-btn mg-btn--light">
              Newsletter abonnieren
            </Link>
          }
        />

        <section className="mg-section" aria-label="Blogbeiträge">
          <div className="mg-container">
            {!feature ? (
              <p className="mg-lead">Noch keine Beiträge — sobald etwas da ist, findest du es hier.</p>
            ) : (
              <>
                <Reveal className="mg-blog-feature">
                  <PostCard
                    slug={feature.slug}
                    title={feature.title}
                    description={feature.description}
                    createdAt={feature.created_at}
                    imageUrl={blogImageUrl(feature.image_path)}
                    headingLevel="h2"
                    feature
                  />
                </Reveal>
                {rest.length > 0 ? (
                  <Stagger as="ul" className="mg-post-grid" stagger={0.06} amount={0.05}>
                    {rest.map((post) => (
                      <StaggerItem as="li" key={post.id}>
                        <PostCard
                          slug={post.slug}
                          title={post.title}
                          description={post.description}
                          createdAt={post.created_at}
                          imageUrl={blogImageUrl(post.image_path)}
                          headingLevel="h2"
                        />
                      </StaggerItem>
                    ))}
                  </Stagger>
                ) : null}
              </>
            )}
            <Reveal className="mg-blog-cta">
              <p className="mg-h3">Keinen Beitrag verpassen?</p>
              <Link href="/#newsletter" className="mg-btn mg-btn--primary">
                Zum Newsletter <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
