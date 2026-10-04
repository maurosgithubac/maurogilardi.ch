import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPostNotFoundMetadata, buildBlogPostMetadata } from "@/lib/seo/page-metadata";
import { findDemoPostBySlug } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import { blogPostingGraph } from "@/lib/seo/webpage-jsonld";
import type { PostRow } from "@/types/content";
import { SiteFooter } from "@/components/site-footer";
import { SupportStickyBar } from "@/components/support-sticky-bar";
import { SiteHeader } from "@/components/site-header";
import { BlogPostBody } from "@/components/blog-post-body";
import { MgLogo } from "@/components/brand/mg-logo";
import { PostCard } from "@/components/post-card";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { visibleDemoPosts } from "@/content/demoPosts";
import { readingMinutes } from "@/lib/blog/parse-blog-blocks";
import { ReadingProgress } from "@/components/motion/reading-progress";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const demoPost = findDemoPostBySlug(slug);
  let post: Pick<PostRow, "title" | "description" | "created_at" | "image_path"> | null = demoPost
    ? {
        title: demoPost.title,
        description: demoPost.description,
        created_at: demoPost.created_at,
        image_path: demoPost.image_path,
      }
    : null;

  if (!post) {
    try {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase
        .from("posts")
        .select("title, description, created_at, image_path")
        .eq("slug", slug)
        .eq("published", true)
        .lte("created_at", publishedAtOrBeforeIso())
        .maybeSingle();
      post = data as typeof post;
    } catch {
      /* ignore */
    }
  }

  if (!post) return blogPostNotFoundMetadata;

  return buildBlogPostMetadata({
    slug,
    title: post.title,
    description: post.description,
    created_at: post.created_at,
    imageUrl: blogImageUrl(post.image_path),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: Pick<PostRow, "slug" | "title" | "description" | "body" | "image_path" | "created_at"> | null =
    findDemoPostBySlug(slug);
  try {
    if (!post) {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase
        .from("posts")
        .select("slug, title, description, body, image_path, created_at")
        .eq("slug", slug)
        .eq("published", true)
        .lte("created_at", publishedAtOrBeforeIso())
        .maybeSingle();
      post = data as Pick<PostRow, "slug" | "title" | "description" | "body" | "image_path" | "created_at"> | null;
    }
  } catch {
    notFound();
  }
  if (!post) notFound();

  const img = blogImageUrl(post.image_path);
  const minutes = readingMinutes(post.body);
  const dateLabel = new Date(post.created_at).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentSlug = post.slug;

  // Weitere Beiträge (neueste zuerst, ohne den aktuellen)
  type RelatedPost = Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">;
  let related: RelatedPost[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, description, image_path, created_at")
      .eq("published", true)
      .lte("created_at", publishedAtOrBeforeIso())
      .neq("slug", currentSlug)
      .order("created_at", { ascending: false })
      .limit(3);
    related = (data as RelatedPost[]) ?? [];
  } catch {
    /* ignore */
  }
  if (related.length === 0) {
    related = visibleDemoPosts()
      .filter((p) => p.slug !== currentSlug)
      .slice(0, 3);
  }

  const blogPostingSchema = blogPostingGraph({
    slug: post.slug,
    title: post.title,
    description: post.description,
    created_at: post.created_at,
    image: img,
    wordCount: post.body.replace(/\{\{(?:IMAGE|VIDEO):[^}]*\}\}/g, " ").split(/\s+/).filter(Boolean).length,
  });

  return (
    <div className="mg-page site-page">
      <SeoPageJsonLd schema={blogPostingSchema} />
      <ReadingProgress />
      <SiteHeader variant="overlay" />
      <main id="inhalt">
        <article className="mg-article">
          <header className="mg-page-hero mg-article-hero mg-grain" data-theme="dark">
            {img ? (
              <ParallaxMedia className="mg-hero__media" shift={10} zoom={1.08}>
                <Image
                  src={img}
                  alt={`${post.title} – Beitragsbild`}
                  fill
                  priority
                  sizes="100vw"
                  className="mg-hero__img mg-article-hero__img"
                />
              </ParallaxMedia>
            ) : null}
            <div className="mg-hero__scrim mg-article-hero__scrim" aria-hidden="true" />
            <div className="mg-page-hero__content mg-article-hero__content mg-container">
              <nav className="mg-article__crumbs" aria-label="Brotkrumen">
                <Link href="/blog">Blog</Link>
                <span aria-hidden="true">/</span>
                <time dateTime={post.created_at}>{dateLabel}</time>
              </nav>
              <SplitText as="h1" text={post.title} className="mg-article__title" onMount stagger={0.04} />
              {post.description ? (
                <Reveal y={16} delay={0.25}>
                  <p className="mg-article__dek">{post.description}</p>
                </Reveal>
              ) : null}
              <Reveal y={16} delay={0.32} className="mg-article__meta">
                <span>{minutes} Min. Lesezeit</span>
                <span aria-hidden="true">·</span>
                <span>Mauro Gilardi</span>
              </Reveal>
            </div>
          </header>

          <div className="mg-article__column">
            <div className="mg-article__body blog-post-article">
              <BlogPostBody body={post.body} />
            </div>
            <div className="mg-author mg-article__author">
              <span className="mg-author__mark" aria-hidden="true">
                <MgLogo withName={false} />
              </span>
              <span className="mg-author__text">
                <strong>Mauro Gilardi</strong>
                <span>SwissPGA Golf Professional</span>
              </span>
              <Link href="/ueber-mich" className="mg-author__link">
                Über mich <span className="mg-btn__arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <aside className="mg-article__end mg-container" aria-label="Unterstützen">
            <div className="mg-article__end-card mg-grain" data-theme="dark">
              <p className="mg-eyebrow">Gefällt dir, was du liest?</p>
              <p className="mg-h3">Werde Teil meines Teams und begleite mich auf die HotelPlanner Tour.</p>
              <div className="mg-hero__actions">
                <Link href="/2027" className="mg-btn mg-btn--primary" data-track="blog_end_cta">
                  Gönner werden <span className="mg-btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link href="/#newsletter" className="mg-btn mg-btn--glass">
                  Newsletter
                </Link>
              </div>
            </div>
          </aside>
        </article>

        {related.length > 0 ? (
          <section className="mg-section mg-article__related" aria-labelledby="related-title">
            <div className="mg-container">
              <header className="mg-latest__head">
                <div>
                  <p className="mg-eyebrow">Weiterlesen</p>
                  <h2 id="related-title" className="mg-h2">
                    Weitere Beiträge.
                  </h2>
                </div>
                <Link href="/blog" className="mg-btn mg-btn--ghost">
                  Alle Beiträge <span className="mg-btn__arrow" aria-hidden="true">→</span>
                </Link>
              </header>
              <Stagger as="ul" className="mg-post-grid" stagger={0.08}>
                {related.map((r) => (
                  <StaggerItem as="li" key={r.id}>
                    <PostCard
                      slug={r.slug}
                      title={r.title}
                      description={r.description}
                      createdAt={r.created_at}
                      imageUrl={blogImageUrl(r.image_path)}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
      <SupportStickyBar />
    </div>
  );
}
