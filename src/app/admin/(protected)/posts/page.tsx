import Link from "next/link";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { PostRow } from "@/types/content";

export default async function AdminPostsListPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });

  const list = (posts as PostRow[]) ?? [];

  return (
    <div className="admin-card-stack">
      <div className="admin-list-head">
        <h1 className="admin-h1">Beiträge</h1>
        <Link href="/admin/posts/new" className="admin-btn">
          Neu
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="admin-muted">Noch keine Beiträge.</p>
      ) : (
        <ul className="admin-list">
          {list.map((post) => (
            <li key={post.id} className="admin-list-item">
              <div>
                <strong>{post.title}</strong>
                <span className={`admin-badge${post.published ? " admin-badge--live" : " admin-badge--draft"}`}>
                  {post.published ? "Live" : "Entwurf"}
                </span>
              </div>
              <Link href={`/admin/posts/${post.id}`} className="admin-link">
                Bearbeiten
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
