import Link from "next/link";
import { siteContent } from "@/content/siteContent";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>
          © {year} {siteContent.brand.name}
        </p>
        <p className="site-footer-links">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/sponsoring">Sponsoring</Link>
          <Link href="/ueber-mich">Über mich</Link>
        </p>
      </div>
    </footer>
  );
}
