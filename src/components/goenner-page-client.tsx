"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  goennerMembershipTiers,
  type MembershipId,
} from "@/content/goennerMemberships";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SwipeStripHint } from "@/components/swipe-strip-hint";

export function GoennerPageClient() {
  const [membershipId, setMembershipId] = useState<MembershipId | "">("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!membershipId) {
      setStatus("Bitte wähle eine Mitgliedschaft.");
      return;
    }
    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const street = String(fd.get("street") || "").trim();
    const postal_code = String(fd.get("postal_code") || "").trim();
    const city = String(fd.get("city") || "").trim();
    const message = String(fd.get("message") || "").trim();

    setIsSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/goenner-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: membershipId,
          name,
          email,
          phone: phone || null,
          street,
          postal_code,
          city,
          message: message || null,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setStatus(data.error || "Etwas ist schiefgelaufen.");
        return;
      }
      setStatus(data.message || "Vielen Dank — ich melde mich bei dir.");
      form.reset();
      setMembershipId("");
    } catch {
      setStatus("Verbindung fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="goenner-page site-page">
      <div className="site-header-fixed-stack">
        <SiteHeader variant="overlay" inOverlayStack />
      </div>

      <main className="subpage-shell subpage-shell--flush">
        <section className="subpage-hero about-hero goenner-hero">
          <Image
            src="/brand-assets/images/mauro&friends-9.jpg"
            alt="Mauro Gilardi auf dem Golfplatz"
            fill
            className="stage-bg about-hero-bg"
            priority
          />
          <div className="stage-overlay about-hero-overlay" />
          <div className="subpage-copy about-hero-copy">
            <p className="label about-hero-label">Unterstützung</p>
            <h1>Werde Teil meines Teams.</h1>
            <p className="about-hero-lead">
              Wenn du mich auf der Tour begleiten willst, gibt’s drei klare Modelle — unten siehst du, was drinsteht.
              Ich freue mich auf deine Anfrage.
            </p>
            <div className="about-hero-actions">
              <a href="#goenner-form-title" className="about-btn about-btn-primary">
                Mitgliedschaft anfragen
              </a>
              <Link href="/ueber-mich" className="about-btn about-btn-ghost">
                Über mich
              </Link>
            </div>
          </div>
        </section>

        <section className="goenner-memberships" aria-labelledby="goenner-memberships-title">
          <header className="goenner-memberships-head">
            <p className="goenner-memberships-kicker">Mitgliedschaften</p>
            <h2 id="goenner-memberships-title">Wähle das Modell, das zu dir passt</h2>
          </header>
          <div
            className="swipe-strip-wrap swipe-strip-wrap--goenner"
            role="region"
            aria-label="Mitgliedschaftsstufen, seitlich wischbar"
          >
            <div className="goenner-tiers">
              {goennerMembershipTiers.map((tier) => (
                <article
                  key={tier.id}
                  className={`goenner-tier${tier.id === "eagle" ? " goenner-tier--featured" : ""}`}
                >
                  {tier.id === "eagle" ? (
                    <p className="goenner-tier-badge">
                      <span>Empfohlen</span>
                    </p>
                  ) : null}
                  <h2 className="goenner-tier-title">{tier.title}</h2>
                  <ul className="goenner-tier-list">
                    {tier.benefits.map((b) => (
                      <li key={b.text} className={b.bold ? "goenner-tier-li goenner-tier-li--bold" : "goenner-tier-li"}>
                        <span className="goenner-tier-arrow" aria-hidden>
                          →
                        </span>
                        {b.text}
                      </li>
                    ))}
                  </ul>
                  <p className="goenner-tier-cta">Beitreten für {tier.priceChf}.- / Jahr</p>
                </article>
              ))}
            </div>
            {goennerMembershipTiers.length > 1 ? <SwipeStripHint /> : null}
          </div>
        </section>

        <section className="goenner-trust" aria-label="Zusätzliche Informationen">
          <ul className="goenner-trust-list">
            <li>Du schreibst mir direkt — ohne Umwege.</li>
            <li>Details und Termine klären wir persönlich.</li>
            <li>Ich halte dich ehrlich auf dem Laufenden.</li>
          </ul>
        </section>

        <section className="goenner-form-section" aria-labelledby="goenner-form-title">
          <div className="goenner-form-section-head">
            <p className="goenner-form-kicker">Kontakt</p>
            <h2 id="goenner-form-title" className="goenner-form-heading">
              Mitgliedschaft anfragen
            </h2>
            <p className="goenner-form-lead">Ich bestätige deine Anfrage per E-Mail.</p>
          </div>
          <form className="goenner-form" onSubmit={onSubmit}>
            <fieldset className="goenner-fieldset">
              <legend className="goenner-legend">Mitgliedschaft</legend>
              <div className="goenner-radio-grid">
                {goennerMembershipTiers.map((tier) => (
                  <label key={tier.id} className="goenner-radio-card">
                    <input
                      type="radio"
                      name="membership_pick"
                      value={tier.id}
                      checked={membershipId === tier.id}
                      onChange={() => setMembershipId(tier.id)}
                    />
                    <span className="goenner-radio-card-body">
                      <span className="goenner-radio-title">{tier.title}</span>
                      <span className="goenner-radio-price">{tier.priceChf}.- / Jahr</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="goenner-form-grid">
              <label className="goenner-label">
                Name
                <input name="name" type="text" required autoComplete="name" maxLength={200} />
              </label>
              <label className="goenner-label">
                E-Mail
                <input name="email" type="email" required autoComplete="email" />
              </label>
            </div>
            <label className="goenner-label">
              Telefon <span className="goenner-optional">(optional)</span>
              <input name="phone" type="tel" autoComplete="tel" maxLength={80} />
            </label>

            <fieldset className="goenner-fieldset goenner-fieldset--block">
              <legend className="goenner-legend">Adresse</legend>
              <p className="goenner-fieldset-hint">Damit ich dir Post und Infos direkt schicken kann.</p>
              <div className="goenner-form-grid">
                <label className="goenner-label goenner-label--span-2">
                  Strasse & Hausnummer
                  <input
                    name="street"
                    type="text"
                    required
                    autoComplete="street-address"
                    maxLength={300}
                    placeholder="z. B. Musterweg 12"
                  />
                </label>
                <label className="goenner-label">
                  PLZ
                  <input name="postal_code" type="text" required autoComplete="postal-code" maxLength={16} inputMode="numeric" />
                </label>
                <label className="goenner-label">
                  Ort
                  <input name="city" type="text" required autoComplete="address-level2" maxLength={120} />
                </label>
              </div>
            </fieldset>
            <label className="goenner-label">
              Nachricht <span className="goenner-optional">(optional)</span>
              <textarea name="message" rows={4} maxLength={4000} />
            </label>

            <p className="goenner-footnote">* Details und Termine stimme ich persönlich mit dir ab.</p>

            <button type="submit" className="goenner-submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird gesendet…" : "Anfrage senden"}
            </button>
            {status ? <p className={`goenner-status${status.startsWith("Bitte") || status.includes("fehl") ? " goenner-status--warn" : ""}`}>{status}</p> : null}
          </form>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
