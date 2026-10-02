import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { HomePost } from "@/components/home/types";

export function LatestPosts({ posts }: { posts: HomePost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mg-section mg-latest" aria-labelledby="latest-title">
      <div className="mg-container">
        <header className="mg-latest__head">
          <div>
            <Reveal>
              <p className="mg-eyebrow">Blog</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="latest-title" className="mg-h2">
                Aus dem Tour-Tagebuch.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link href="/blog" className="mg-btn mg-btn--ghost">
              Alle Beiträge <span className="mg-btn__arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </header>

        <Stagger as="ul" className="mg-post-grid" stagger={0.1}>
          {posts.map((post) => (
            <StaggerItem as="li" key={post.id}>
              <PostCard
                slug={post.slug}
                title={post.title}
                description={post.description}
                createdAt={post.created_at}
                imageUrl={post.image_url}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
