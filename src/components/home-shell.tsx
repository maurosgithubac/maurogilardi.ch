"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import type { PostRow, SponsorRow } from "@/types/content";
import { siteContent } from "@/content/siteContent";
import { blogImageUrl, sponsorLogoUrl } from "@/lib/storage-public-url";
import { SiteHeader } from "@/components/site-header";
import { PgtLiveScoringTicker } from "@/components/pgt-live-scoring-ticker";
import {
  formatPgtEventDateRange,
  livescoringLinkForEvent,
  type PgtSeasonEvent,
  PRO_GOLF_TOUR_LIVESCORING_URL,
  PRO_GOLF_TOUR_TURNIERE_URL,
} from "@/content/pgtSeasonEvents";

type PostCard = Pick<PostRow, "id" | "slug" | "title" | "description" | "image_path" | "created_at">;
type SponsorCard = Pick<SponsorRow, "id" | "name" | "logo_path" | "website_url">;

type Props = {
  posts: PostCard[];
  sponsors: SponsorCard[];
  upcomingPgtEvents: PgtSeasonEvent[];
};

export function HomeShell({ posts, sponsors, upcomingPgtEvents }: Props) {
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const marqueeSponsors = useMemo(() => {
    if (sponsors.length === 0) return [];
    return [...sponsors, ...sponsors];
  }, [sponsors]);

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    if (!email.includes("@")) {
      setNewsletterMessage("Bitte gib eine gültige E-Mail ein.");
      return;
    }
    setIsSubmitting(true);
    setNewsletterMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setNewsletterMessage(data.error || "Etwas ist schiefgelaufen.");
        return;
      }
      setNewsletterMessage(data.message || "Danke — ich halte dich auf dem Laufenden.");
      event.currentTarget.reset();
    } catch {
      setNewsletterMessage("Verbindung fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="blog-home">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
        <PgtLiveScoringTicker />
      </div>

      <main className="blog-home-main">
        <section className="blog-hero blog-hero--landing">
          <div className="blog-hero-bg" aria-hidden="true">
            <Image
              src="/brand-assets/images/1L9A8795.JPG"
              alt="Mauro Gilardi auf dem Golfplatz"
              fill
              priority
              className="blog-hero-bg-img"
              sizes="100vw"
            />
          </div>
          <div className="blog-hero-veil" aria-hidden="true" />
          <div className="blog-hero-inner">
            <p className="blog-eyebrow">
              <span className="blog-eyebrow-pill">{siteContent.brand.role}</span>
            </p>
            <h1 className="blog-hero-title">{siteContent.brand.name}</h1>
            <p className="blog-hero-sub">Meine Karriere, Turniere, Gedanken vom Platz.</p>
            <p className="blog-hero-lead">{siteContent.brand.intro}</p>
            <div className="blog-hero-cta">
              <Link href="/blog" className="blog-btn blog-btn-primary">
                Zum Blog
              </Link>
              <a href="#newsletter" className="blog-btn blog-btn-ghost">
                Newsletter
              </a>
            </div>
          </div>
        </section>

        {marqueeSponsors.length > 0 && (
          <section className="blog-sponsors" aria-label="Partner">
            <p className="blog-sponsors-label">
              <span>Partner</span>
            </p>
            <ClientMarquee sponsors={marqueeSponsors} />
          </section>
        )}

        <section className="blog-latest">
          <div className="blog-latest-head">
            <div className="blog-latest-head-text">
              <h2>Neueste Updates</h2>
              <p className="blog-latest-sub">Aus meinem Blog — kurz und auf den Punkt.</p>
            </div>
            <Link href="/blog" className="blog-latest-cta">
              Alle anzeigen
              <span aria-hidden className="blog-latest-cta-arrow">
                →
              </span>
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="blog-empty">Noch keine Beiträge — bald gibt es hier mehr von mir.</p>
          ) : (
            <ul className="blog-grid">
              {posts.map((post) => {
                const img = blogImageUrl(post.image_path);
                return (
                  <li key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="blog-card">
                      <div className="blog-card-media">
                        {img ? (
                          <Image src={img} alt="" fill className="blog-card-img" sizes="(max-width: 768px) 100vw, 33vw" />
                        ) : (
                          <div className="blog-card-placeholder" />
                        )}
                      </div>
                      <div className="blog-card-body">
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString("de-CH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                        <h3>{post.title}</h3>
                        {post.description ? <p>{post.description}</p> : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="pgt-events" aria-labelledby="pgt-events-heading">
          <div className="pgt-events-head">
            <div>
              <h2 id="pgt-events-heading">Saison & Termine</h2>
              <p className="pgt-events-sub">
                Die nächsten vier Termine — vollständiger Kalender auf der{" "}
                <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer">
                  Pro Golf Tour
                </a>
                . Änderungen vorbehalten.
              </p>
            </div>
          </div>
          <ul className="pgt-events-list">
            {upcomingPgtEvents.length === 0 ? (
              <li className="pgt-events-empty">
                Aktuell sind keine kommenden Turniere in der Liste — später in der Saison oder im{" "}
                <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer">
                  offiziellen Kalender
                </a>
                .
              </li>
            ) : (
              (showAllEvents ? upcomingPgtEvents : upcomingPgtEvents.slice(0, 2)).map((ev) => (
                <li key={ev.id} className="pgt-events-card">
                  <h3 className="pgt-events-card-title">{ev.name}</h3>
                  <p className="pgt-events-card-meta">
                    <time dateTime={ev.start}>{formatPgtEventDateRange(ev)}</time>
                    <span className="pgt-events-card-sep" aria-hidden>
                      ·
                    </span>
                    <span>{ev.where}</span>
                  </p>
                  <p className="pgt-events-card-links">
                    <a href={livescoringLinkForEvent(ev)} target="_blank" rel="noopener noreferrer">
                      Livescoring
                    </a>
                    {ev.tourPageUrl ? (
                      <>
                        {" · "}
                        <a href={ev.tourPageUrl} target="_blank" rel="noopener noreferrer">
                          Turnierinfos
                        </a>
                      </>
                    ) : null}
                  </p>
                </li>
              ))
            )}
          </ul>
          {upcomingPgtEvents.length > 2 ? (
            <div className="pgt-events-toggle-wrap">
              <button
                type="button"
                className="pgt-events-toggle"
                onClick={() => setShowAllEvents((open) => !open)}
                aria-expanded={showAllEvents}
                aria-controls="pgt-events-heading"
              >
                {showAllEvents ? "Weniger anzeigen" : "Alle anzeigen"}
              </button>
            </div>
          ) : null}
          <p className="pgt-events-footnote">
            Livescoring der Tour:{" "}
            <a href={PRO_GOLF_TOUR_LIVESCORING_URL} target="_blank" rel="noopener noreferrer">
              progolftour.de/livescoring
            </a>
            . Termine bitte bei Abweichungen immer auf der{" "}
            <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer">
              offiziellen Turnierseite
            </a>{" "}
            prüfen.
          </p>
        </section>

        <section id="newsletter" className="blog-newsletter">
          <div className="blog-newsletter-inner">
            <p className="blog-newsletter-kicker">Bleib dran</p>
            <h2>Newsletter</h2>
            <p className="blog-newsletter-dek">E-Mail für Updates zu meinen Posts und meiner Karriere.</p>
            <form onSubmit={handleNewsletterSubmit} className="blog-newsletter-form">
              <label htmlFor="email" className="sr-only">
                E-Mail
              </label>
              <input id="email" name="email" type="email" placeholder="deine@email.ch" required autoComplete="email" />
              <button type="submit" className="blog-btn blog-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "…" : "Anmelden"}
              </button>
            </form>
            <p className="form-message">{newsletterMessage}</p>
          </div>
        </section>
      </main>

      <footer className="site-footer site-footer--on-dark">
        <div className="site-footer-inner">
          <p>
            © {new Date().getFullYear()} {siteContent.brand.name}
          </p>
          <p className="site-footer-links">
            <Link href="/blog">Blog</Link>
            <Link href="/goenner">Gönner</Link>
            <Link href="/ueber-mich">Über mich</Link>
            <a href="#newsletter">Newsletter</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function ClientMarquee({
  sponsors,
}: {
  sponsors: SponsorCard[];
}) {
  return (
    <div className="blog-marquee-wrap">
      <div className="blog-marquee">
        {sponsors.map((s, index) => {
          const href = sponsorLogoUrl(s.logo_path);
          const inner = (
            <span className="blog-marquee-item">{href ? <Image src={href} alt={s.name} width={140} height={56} className="blog-marquee-logo" /> : s.name}</span>
          );
          return s.website_url ? (
            <a key={`${s.id}-${index}`} href={s.website_url} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : (
            <span key={`${s.id}-${index}`}>{inner}</span>
          );
        })}
      </div>
    </div>
  );
}
