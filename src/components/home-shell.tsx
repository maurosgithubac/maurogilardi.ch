"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { PostRow, SponsorRow } from "@/types/content";
import { newsletterSubscribeAction } from "@/app/actions/newsletter-subscribe";
import { initialNewsletterFormState } from "@/lib/newsletter-form-state";
import { siteContent } from "@/content/siteContent";
import { SiteHeader } from "@/components/site-header";
import { SwipeStripHint } from "@/components/swipe-strip-hint";
import { PgtLiveScoringTicker } from "@/components/pgt-live-scoring-ticker";
import {
  formatPgtEventDateRange,
  livescoringLinkForEvent,
  type PgtSeasonEvent,
  PRO_GOLF_TOUR_LIVESCORING_URL,
  PRO_GOLF_TOUR_TURNIERE_URL,
} from "@/content/pgtSeasonEvents";

type PostCard = Pick<PostRow, "id" | "slug" | "title" | "description" | "created_at"> & { image_url: string | null };
type SponsorCard = Pick<SponsorRow, "id" | "name" | "website_url"> & { logo_url: string };

type Props = {
  posts: PostCard[];
  sponsors: SponsorCard[];
  upcomingPgtEvents: PgtSeasonEvent[];
};

const postDateFormatter = new Intl.DateTimeFormat("de-CH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function HomeShell({ posts, sponsors, upcomingPgtEvents }: Props) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const newsletterFormRef = useRef<HTMLFormElement>(null);
  const [newsletterState, newsletterFormAction, newsletterPending] = useActionState(
    newsletterSubscribeAction,
    initialNewsletterFormState,
  );

  const marqueeSponsors = useMemo(() => {
    if (sponsors.length === 0) return [];
    return [...sponsors, ...sponsors];
  }, [sponsors]);

  useEffect(() => {
    if (newsletterState.message && !newsletterState.error && newsletterFormRef.current) {
      newsletterFormRef.current.reset();
    }
  }, [newsletterState.message, newsletterState.error]);

  return (
    <div className="blog-home">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
        <PgtLiveScoringTicker />
      </div>

      <main className="blog-home-main subpage-shell subpage-shell--flush blog-index-shell">
        <section className="subpage-hero about-hero blog-index-hero-unified home-landing-hero" aria-label="Start">
          <Image
            src="/brand-assets/images/1L9A8795.JPG"
            alt="Mauro Gilardi auf dem Golfplatz"
            fill
            priority
            className="stage-bg about-hero-bg"
            sizes="100vw"
          />
          <div className="stage-overlay about-hero-overlay" aria-hidden="true" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">{siteContent.brand.role}</p>
            <h1>{siteContent.brand.name}</h1>
            <p className="about-hero-lead about-hero-lead--welcome">Willkommen — hier folgst du mir auf der Tour.</p>
            <p className="about-hero-lead">{siteContent.brand.intro}</p>
            <div className="about-hero-actions">
              <Link href="/blog" className="about-btn about-btn-primary">
                Zu meinen Beiträgen
              </Link>
              <a href="#newsletter" className="about-btn about-btn-ghost">
                Newsletter
              </a>
            </div>
          </div>
        </section>

        {marqueeSponsors.length > 0 && (
          <section className="blog-sponsors" aria-label="Sponsoren">
            <p className="blog-sponsors-label">
              <span>Meine Sponsoren</span>
            </p>
            <ClientMarquee sponsors={marqueeSponsors} />
          </section>
        )}

        <section className="blog-latest">
          <div className="blog-latest-head">
            <div className="blog-latest-head-text">
              <h2>Beiträge</h2>
              <p className="blog-latest-sub">Das schreib ich gerade — vom Platz und aus der Vorbereitung.</p>
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
            <>
              <div className="swipe-strip-wrap swipe-strip-wrap--blog">
                <ul
                  className="blog-grid blog-grid--one-row"
                  aria-label="Neueste Beiträge, seitlich wischbar"
                >
                  {posts.map((post) => {
                    const img = post.image_url;
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
                            <time dateTime={post.created_at}>{postDateFormatter.format(new Date(post.created_at))}</time>
                            <h3>{post.title}</h3>
                            {post.description ? <p>{post.description}</p> : null}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {posts.length > 1 ? <SwipeStripHint /> : null}
              </div>
              {posts.length > 1 ? (
                <div className="pgt-events-toggle-wrap">
                  <Link href="/blog" className="pgt-events-toggle">
                    Mehr anzeigen
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section id="pgt-events" className="pgt-events" aria-labelledby="pgt-events-heading">
          <div className="pgt-events-head">
            <div>
              <h2 id="pgt-events-heading">Meine nächsten Termine</h2>
              <p className="pgt-events-sub">
                Wo ich als Nächstes starte — kompletter Kalender bei der{" "}
                <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer">
                  Pro Golf Tour
                </a>
                . Kann sich noch ändern.
              </p>
            </div>
          </div>
          <ul className="pgt-events-list">
            {upcomingPgtEvents.length === 0 ? (
              <li className="pgt-events-empty">
                Gerade steht nichts in meiner Liste — schau bei der{" "}
                <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer">
                  Pro Golf Tour
                </a>{" "}
                nach, falls du alle Termine sehen willst.
              </li>
            ) : (
              (showAllEvents ? upcomingPgtEvents : upcomingPgtEvents.slice(0, 3)).map((ev) => (
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
          {upcomingPgtEvents.length > 3 ? (
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
            Live dabei?{" "}
            <a href={PRO_GOLF_TOUR_LIVESCORING_URL} target="_blank" rel="noopener noreferrer">
              progolftour.de/livescoring
            </a>
            . Wenn sich ein Termin verschiebt, gilt für mich die{" "}
            <a href={PRO_GOLF_TOUR_TURNIERE_URL} target="_blank" rel="noopener noreferrer">
              offizielle Ausschreibung
            </a>
            .
          </p>
        </section>

        <section id="newsletter" className="blog-newsletter">
          <div className="blog-newsletter-inner">
            <p className="blog-newsletter-kicker">Für dich</p>
            <h2>Newsletter</h2>
            <p className="blog-newsletter-dek">Trag dich ein — ich schicke dir ab und zu Updates von der Tour.</p>
            <form ref={newsletterFormRef} action={newsletterFormAction} className="blog-newsletter-form">
              <label htmlFor="email" className="sr-only">
                E-Mail
              </label>
              <input id="email" name="email" type="email" placeholder="deine@email.ch" required autoComplete="email" />
              <button type="submit" className="blog-btn blog-btn-primary" disabled={newsletterPending}>
                {newsletterPending ? "…" : "Anmelden"}
              </button>
            </form>
            {(newsletterState.message || newsletterState.error) && (
              <p className={`form-message${newsletterState.error ? " form-message--error" : ""}`}>
                {newsletterState.message || newsletterState.error}
              </p>
            )}
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
            <Link href="/sponsoring">Sponsoring</Link>
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
          const href = s.logo_url;
          const inner = (
            <span className="blog-marquee-item">{href ? <Image src={href} alt={s.name} width={168} height={64} className="blog-marquee-logo" /> : s.name}</span>
          );
          const url = s.website_url;
          if (!url) {
            return <span key={`${s.id}-${index}`}>{inner}</span>;
          }
          if (url.startsWith("/")) {
            return (
              <Link key={`${s.id}-${index}`} href={url}>
                {inner}
              </Link>
            );
          }
          return (
            <a key={`${s.id}-${index}`} href={url} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          );
        })}
      </div>
    </div>
  );
}
