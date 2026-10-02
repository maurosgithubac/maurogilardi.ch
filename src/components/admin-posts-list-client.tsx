"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostRow } from "@/types/content";

type Props = {
  initialPosts: PostRow[];
};

export function AdminPostsListClient({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function onDelete(post: PostRow) {
    if (!confirm(`Beitrag wirklich löschen?\n\n${post.title}`)) return;
    setBusyId(post.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Löschen fehlgeschlagen.");
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      router.refresh();
    } catch {
      setError("Netzwerkfehler beim Löschen.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error ? <p className="ap-banner ap-banner--error">{error}</p> : null}
      {posts.length === 0 ? (
        <p className="ap-muted-sm">Noch keine Beiträge.</p>
      ) : (
        <ul className="ap-list">
          {posts.map((post) => (
            <li key={post.id} className="ap-list-item">
              <div>
                <strong>{post.title}</strong>
                <span className={`ap-status ${post.published ? "ap-status--paid" : "ap-status--none"}`}>
                  {post.published ? "Live" : "Entwurf"}
                </span>
              </div>
              <div className="ap-row-actions">
                <Link href={`/admin/posts/${post.id}`} className="ap-btn ap-btn--ghost ap-btn--sm">
                  Bearbeiten
                </Link>
                <button
                  type="button"
                  className="ap-btn ap-btn--danger-ghost ap-btn--sm"
                  onClick={() => onDelete(post)}
                  disabled={busyId === post.id}
                >
                  {busyId === post.id ? "..." : "Löschen"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
