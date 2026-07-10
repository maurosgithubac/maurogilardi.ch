import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/seo/constants";
import { buildSeoTitle } from "@/lib/seo/build-seo-title";
import { seoPageTitles } from "@/lib/seo/titles";
import { findDemoPostBySlug } from "@/content/demoPosts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import { SeoPageJsonLd } from "@/components/seo-page-json-ld";
import type { PostRow } from "@/types/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BlogPostBody } from "@/components/blog-post-body";

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
    <article className="blog-post site-page">
      <SeoPageJsonLd schema={blogPostingSchema} />
      <SiteHeader variant="document" />
      <div className="blog-post-layout">
        <nav className="blog-post-breadcrumb" aria-label="Navigation">
          <Link href="/blog">Zum Blog</Link>
          <span aria-hidden className="blog-post-breadcrumb-sep">
            /
          </span>
          <span className="blog-post-breadcrumb-current" title={post.title}>
            {post.title}
          </span>
        </nav>
        {img ? (
          <div className="blog-post-hero">
            <Image
              src={img}
              alt={`${post.title} – Beitragsbild`}
              fill
              className="blog-post-hero-img"
              priority
              sizes="(max-width: 904px) calc(100vw - 2rem), 56rem"
            />
            <div className="blog-post-hero-scrim" />
          </div>
        ) : null}
        <div className="blog-post-inner blog-post-article">
          <time className="blog-post-date" dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("de-CH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <h1>{post.title}</h1>
          {post.description ? <p className="blog-post-dek">{post.description}</p> : null}
          <BlogPostBody body={post.body} />
          <Link href="/blog" className="blog-post-back">
            ← Zurück zum Blog
          </Link>
        </div>
      </div>
      <SiteFooter />
    </article>
  );
}
