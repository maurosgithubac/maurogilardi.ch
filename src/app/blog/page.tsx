import Link from "next/link";
import Image from "next/image";
import { visibleDemoPosts } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import { blogIndexMetadata, blogIndexSchema } from "@/lib/seo/page-metadata";
import { seoImageAlts, seoImages } from "@/lib/seo/constants";
import type { PostRow } from "@/types/content";
import { AboutHeroMotionCopy } from "@/components/about-hero-motion-copy";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
    posts = visibleDemoPosts().map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      image_path: post.image_path,
      created_at: post.created_at,
    }));
  }

  return (
    <>
      <SeoPageJsonLd schema={blogIndexSchema} />
      <div className="blog-page site-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>
      <main className="subpage-shell subpage-shell--flush blog-index-shell">
        <section className="subpage-hero about-hero blog-index-hero-unified">
          <Image
            src={seoImages.tournamentAction}
            alt={seoImageAlts.tournamentAction}
            fill
            className="stage-bg about-hero-bg"
            priority
            sizes="100vw"
          />
          <div className="stage-overlay about-hero-overlay" />
          <AboutHeroMotionCopy
            label="Blog"
            title="Mein Blog"
            lead="Alles, was ich hier veröffentliche — damit du weisst, was bei mir läuft."
            actions={
              <>
                <Link href="/" className="about-btn about-btn-primary">
                  Home
                </Link>
                <a href="/#newsletter" className="about-btn about-btn-ghost">
                  Newsletter
                </a>
              </>
            }
          />
        </section>
        <section className="blog-index-content" aria-label="Blogbeiträge">
          {posts.length === 0 ? (
            <div className="blog-index-empty">
              <p className="blog-page-empty">Noch keine Beiträge — sobald etwas da ist, findest du es hier.</p>
            </div>
          ) : (
            <ul className="blog-feed">
              {posts.map((post) => {
                const img = blogImageUrl(post.image_path);
                return (
                  <li key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="blog-feed-card">
                      <div className="blog-feed-card-media">
                        {img ? (
                          <Image src={img} alt={`${post.title} – Mauro Gilardi`} fill className="blog-feed-card-img" sizes="(max-width: 720px) 100vw, 280px" />
                        ) : (
                          <div className="blog-feed-card-placeholder" />
                        )}
                      </div>
                      <div className="blog-feed-card-body">
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString("de-CH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                        <h2>{post.title}</h2>
                        {post.description ? <p>{post.description}</p> : null}
                        <span className="blog-feed-card-more">
                          Beitrag öffnen
                          <span aria-hidden>→</span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
    </>
  );
}
