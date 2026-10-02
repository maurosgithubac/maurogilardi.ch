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
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString("de-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </nav>
            <SplitText as="h1" text={post.title} className="mg-article__title" onMount stagger={0.04} />
            {post.description ? (
              <Reveal y={16} delay={0.25}>
                <p className="mg-article__dek">{post.description}</p>
              </Reveal>
            ) : null}
          </header>

          {img ? (
            <Reveal className="mg-article__hero mg-container" y={40} delay={0.2}>
              <div className="mg-article__hero-frame">
                <Image
                  src={img}
                  alt={`${post.title} – Beitragsbild`}
                  fill
                  className="mg-cover"
                  priority
                  sizes="(max-width: 1280px) calc(100vw - 2rem), 80rem"
                />
              </div>
            </Reveal>
          ) : null}

          <div className="mg-article__body blog-post-article">
            <BlogPostBody body={post.body} />
          </div>

          <aside className="mg-article__end mg-container" aria-label="Unterstützen">
            <div className="mg-article__end-card mg-grain" data-theme="dark">
              <p className="mg-eyebrow">Gefällt dir, was du liest?</p>
              <p className="mg-h3">Werde Teil meines Teams und begleite mich auf die HotelPlanner Tour.</p>
              <div className="mg-hero__actions">
                <Link href="/sponsoring" className="mg-btn mg-btn--primary">
                  Gönner werden <span className="mg-btn__arrow" aria-hidden="true">→</span>
                </Link>
                <Link href="/#newsletter" className="mg-btn mg-btn--glass">
                  Newsletter
                </Link>
              </div>
            </div>
            <Link href="/blog" className="mg-link-arrow">
              ← Alle Beiträge
            </Link>
          </aside>
        </article>
      </main>
      <SiteFooter />
      <SupportStickyBar />
    </div>
  );
}
