import Link from "next/link";
import { siteContent } from "@/content/siteContent";
import { socialProfiles } from "@/content/socialProfiles";

export function SiteFooterCredit() {
  return (
    <p className="site-footer-credit">
      Webseite umgesetzt von{" "}
      <a
        href="https://sibatusig.ch"
        target="_blank"
        rel="noopener noreferrer"
        className="site-footer-credit-brand"
      >
        sibatusig.ch
      </a>
    </p>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>
          © {year}{" "}
          <Link href="/ueber-mich" className="site-footer-brand-link">
            {siteContent.brand.name}
          </Link>
        </p>
        <p className="site-footer-links">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/sponsoring">Sponsoring</Link>
          <Link href="/ueber-mich">Über mich</Link>
          <a href={socialProfiles.instagram.url} target="_blank" rel="noopener noreferrer">
            {socialProfiles.instagram.label}
          </a>
          <a href={socialProfiles.linkedin.url} target="_blank" rel="noopener noreferrer">
            {socialProfiles.linkedin.label}
          </a>
        </p>
        <SiteFooterCredit />
      </div>
    </footer>
  );
}
