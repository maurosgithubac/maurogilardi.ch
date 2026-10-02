import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/seo/constants";
import { buildSeoTitle } from "@/lib/seo/build-seo-title";
import { seoPageTitles } from "@/lib/seo/titles";
import { findDemoPostBySlug } from "@/content/demoPosts";
import { publishedAtOrBeforeIso } from "@/lib/blog/visible-posts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import type { PostRow } from "@/types/content";
import { SiteFooter } from "@/components/site-footer";
import { SupportStickyBar } from "@/components/support-sticky-bar";
import { SiteHeader } from "@/components/site-header";
import { BlogPostBody } from "@/components/blog-post-body";
import { BlogToc } from "@/components/blog-toc";
import { MgLogo } from "@/components/brand/mg-logo";
import { FundingAsideCard } from "@/components/funding-strip";
import { PostCard } from "@/components/post-card";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { visibleDemoPosts } from "@/content/demoPosts";
import { extractBlogHeadings, readingMinutes } from "@/lib/blog/parse-blog-blocks";
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

  if (!post) return { title: { absolute: seoPageTitles.blogFallback } };

  const seoTitle = buildSeoTitle(post.title);
  const title = { absolute: seoTitle };
  const desc =
    post.description?.trim() ||
    `${post.title} – Tour-Update von Mauro Gilardi (Gilardi Golf), Schweizer Golf Professional auf der Pro Golf Tour.`;
  const canonical = `${SITE_URL}/blog/${slug}`;
  const img = blogImageUrl(post.image_path);

  return {
    title,
    description: desc,
    keywords: [
      post.title,
      "Mauro Gilardi",
      "Schweizer Golf Professional",
      "Pro Golf Tour",
      "SwissPGA",
      "Gilardi Golf",
      "Golf Graubünden",
    ],
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: seoTitle,
      description: desc,
      url: canonical,
      publishedTime: post.created_at,
      authors: [`${SITE_URL}/#mauro-gilardi`],
      images: img ? [{ url: img, alt: `${post.title} – Mauro Gilardi Gilardi Golf` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: desc,
      images: img ? [img] : undefined,
    },
  };
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
  const headings = extractBlogHeadings(post.body);
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

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || undefined,
    datePublished: post.created_at,
    dateModified: post.created_at,
    url: `https://www.maurogilardi.ch/blog/${post.slug}`,
    ...(img ? { image: img } : {}),
    author: { "@id": "https://www.maurogilardi.ch/#mauro-gilardi" },
    publisher: { "@id": "https://www.maurogilardi.ch/#mauro-gilardi" },
    inLanguage: "de-CH",
    about: { "@type": "Sport", name: "Golf" },
    keywords: "Schweizer Golf Professional, Golf Schweiz, SwissPGA, Pro Golf Tour",
  };

  return (
    <div className="mg-page site-page">
      <SeoPageJsonLd schema={blogPostingSchema} />
      <ReadingProgress />
      <SiteHeader variant="document" />
      <main id="inhalt">
        <article className="mg-article">
          <header className="mg-article__head mg-container">
            <nav className="mg-article__crumbs" aria-label="Brotkrumen">
              <Link href="/blog">Blog</Link>
              <span aria-hidden="true">/</span>
              <time dateTime={post.created_at}>{dateLabel}</time>
            </nav>
            <SplitText as="h1" text={post.title} className="mg-article__title" onMount stagger={0.04} />
            <div className="mg-article__intro">
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

          {img ? (
            <Reveal className="mg-article__hero mg-container" y={40} delay={0.2}>
              <ParallaxMedia className="mg-article__hero-frame" shift={8} zoom={1.06}>
                <Image
                  src={img}
                  alt={`${post.title} – Beitragsbild`}
                  fill
                  className="mg-cover"
                  priority
                  sizes="(max-width: 1280px) calc(100vw - 2rem), 80rem"
                />
              </ParallaxMedia>
            </Reveal>
          ) : null}

          <div className="mg-article__layout mg-container">
            <div className="mg-article__body blog-post-article">
              <BlogPostBody body={post.body} />
            </div>
            <aside className="mg-article__aside" aria-label="Zum Beitrag">
              <div className="mg-article__aside-sticky">
                <BlogToc items={headings} />
                <div className="mg-author">
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
                <FundingAsideCard />
              </div>
            </aside>
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
