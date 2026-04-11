import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { findDemoPostBySlug } from "@/content/demoPosts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import type { PostRow } from "@/types/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const demoPost = findDemoPostBySlug(slug);
  if (demoPost) {
    return {
      title: `${demoPost.title} | Mauro Gilardi`,
      description: demoPost.description,
    };
  }
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("posts").select("title, description").eq("slug", slug).eq("published", true).maybeSingle();
    if (!data) return { title: "Post | Mauro Gilardi" };
    return {
      title: `${data.title} | Mauro Gilardi`,
      description: data.description ?? undefined,
    };
  } catch {
    return { title: "Post | Mauro Gilardi" };
  }
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

  return (
    <article className="blog-post site-page">
      <SiteHeader variant="document" />
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
          <Image src={img} alt="" fill className="blog-post-hero-img" priority sizes="100vw" />
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
        <div className="blog-post-body">{post.body}</div>
        <Link href="/blog" className="blog-post-back">
          ← Zurück zum Blog
        </Link>
      </div>
      <SiteFooter />
    </article>
  );
}
