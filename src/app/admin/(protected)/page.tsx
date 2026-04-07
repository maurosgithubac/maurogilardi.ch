import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="admin-card-stack">
      <header className="admin-page-head">
        <p className="admin-page-kicker">Backend</p>
        <h1 className="admin-h1">Inhalte verwalten</h1>
        <p className="admin-muted admin-page-lead">
          Hier pflegst du alles, was auf maurogilardi.ch sichtbar ist: Blog-Updates, Partner-Logos auf der Startseite
          und eingehende Gönner-Anfragen aus dem Formular.
        </p>
      </header>
      <div className="admin-tiles">
        <Link href="/admin/posts/new" className="admin-tile">
          <span className="admin-tile-label">Blog</span>
          <span className="admin-tile-title">Neuer Beitrag</span>
        </Link>
        <Link href="/admin/posts" className="admin-tile">
          <span className="admin-tile-label">Blog</span>
          <span className="admin-tile-title">Alle Beiträge</span>
        </Link>
        <Link href="/admin/sponsors" className="admin-tile">
          <span className="admin-tile-label">Startseite</span>
          <span className="admin-tile-title">Partner & Logos</span>
        </Link>
        <Link href="/admin/goenner" className="admin-tile">
          <span className="admin-tile-label">Gönner</span>
          <span className="admin-tile-title">Anfragen</span>
        </Link>
      </div>
      <nav className="admin-quick-links" aria-label="Zur öffentlichen Website">
        <Link href="/" className="admin-quick-link">
          Startseite
        </Link>
        <Link href="/blog" className="admin-quick-link">
          Blog
        </Link>
        <Link href="/goenner" className="admin-quick-link">
          Gönner
        </Link>
        <Link href="/ueber-mich" className="admin-quick-link">
          Über mich
        </Link>
      </nav>
    </div>
  );
}
