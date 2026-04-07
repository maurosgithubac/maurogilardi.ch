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
      {error ? <p className="admin-error">{error}</p> : null}
      {posts.length === 0 ? (
        <p className="admin-muted">Noch keine Beiträge.</p>
      ) : (
        <ul className="admin-list">
          {posts.map((post) => (
            <li key={post.id} className="admin-list-item">
              <div>
                <strong>{post.title}</strong>
                <span className={`admin-badge${post.published ? " admin-badge--live" : " admin-badge--draft"}`}>
                  {post.published ? "Live" : "Entwurf"}
                </span>
              </div>
              <div className="admin-list-actions">
                <Link href={`/admin/posts/${post.id}`} className="admin-link">
                  Bearbeiten
                </Link>
                <button
                  type="button"
                  className="admin-danger"
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
