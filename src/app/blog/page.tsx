import Link from "next/link";
import Image from "next/image";
import { demoPosts } from "@/content/demoPosts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { blogImageUrl } from "@/lib/storage-public-url";
import type { PostRow } from "@/types/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Blog | Mauro Gilardi",
  description: "Meine Texte von der Tour — Training, Turniere und was mich bewegt.",
};

export default async function BlogPage() {
  let posts: Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, description, image_path, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } catch {
    /* ignore */
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

  return (
    <div className="blog-page site-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>
      <main className="subpage-shell subpage-shell--flush blog-index-shell">
        <section className="subpage-hero about-hero blog-index-hero-unified">
          <Image
            src="/brand-assets/images/195.png"
            alt="Mauro Gilardi im Turnier"
            fill
            className="stage-bg about-hero-bg"
            priority
          />
          <div className="stage-overlay about-hero-overlay" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">Blog</p>
            <h1>Mein Blog</h1>
            <p className="about-hero-lead">Alles, was ich hier veröffentliche — damit du weißt, was bei mir läuft.</p>
            <div className="about-hero-actions">
              <Link href="/" className="about-btn about-btn-primary">
                Home
              </Link>
              <a href="/#newsletter" className="about-btn about-btn-ghost">
                Newsletter
              </a>
            </div>
          </div>
        </section>
        <section className="blog-index-content" aria-label="Blogbeiträge">
          {posts.length === 0 ? (
            <div className="blog-index-empty">
              <p className="blog-page-empty">Noch keine Posts — sobald etwas da ist, findest du es hier.</p>
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
                          <Image src={img} alt="" fill className="blog-feed-card-img" sizes="(max-width: 720px) 100vw, 280px" />
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
                          Post öffnen
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
  );
}
