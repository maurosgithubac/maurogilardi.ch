import Link from "next/link";
import { createSupabaseUserServerClient } from "@/lib/supabase/user-server";
import type { PostRow } from "@/types/content";

export default async function AdminPostsListPage() {
  const supabase = await createSupabaseUserServerClient();
  const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });

  const list = (posts as PostRow[]) ?? [];

  return (
    <div className="admin-card-stack">
      <header className="admin-page-head">
        <p className="admin-page-kicker">Blog</p>
        <h1 className="admin-h1">Beiträge</h1>
        <p className="admin-muted admin-page-lead">Alle Blogbeiträge verwalten, bearbeiten und veröffentlichen.</p>
      </header>
      <div className="admin-inline-kpis">
        <div className="admin-inline-kpi">
          <span className="admin-inline-kpi-label">Gesamt</span>
          <strong>{list.length}</strong>
        </div>
        <div className="admin-inline-kpi">
          <span className="admin-inline-kpi-label">Live</span>
          <strong>{list.filter((post) => post.published).length}</strong>
        </div>
      </div>
      <div className="admin-list-head">
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
