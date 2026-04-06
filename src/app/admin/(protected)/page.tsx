import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="admin-card-stack">
      <h1 className="admin-h1">Übersicht</h1>
      <p className="admin-muted">Blog-Beiträge und Partner-Logos verwalten.</p>
      <div className="admin-tiles">
        <Link href="/admin/posts/new" className="admin-tile">
          Neuer Beitrag
        </Link>
        <Link href="/admin/posts" className="admin-tile">
          Alle Beiträge
        </Link>
        <Link href="/admin/sponsors" className="admin-tile">
          Partner
        </Link>
        <Link href="/admin/goenner" className="admin-tile">
          Gönner-Anfragen
        </Link>
      </div>
      <Link href="/" className="admin-muted-link">
        Zur Website
      </Link>
    </div>
  );
}
