"use client";

import { FormEvent, useState } from "react";
import {
  goennerMembershipTiers,
  type MembershipId,
} from "@/content/goennerMemberships";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
      <SiteHeader variant="document" />

      <section className="goenner-intro">
        <p className="goenner-eyebrow">Unterstützung</p>
        <h1 className="goenner-h1">Gönner</h1>
        <p className="goenner-lead">
          Wähle deine Mitgliedschaft und sende mir eine Anfrage. Ich melde mich mit den nächsten Schritten.
        </p>
        <p className="goenner-lead">
          Interesse an einer Zusammenarbeit? Ich freue mich über den Austausch mit Partnern, die den Weg im
          Leistungssport aktiv mitgestalten möchten - sei es durch gemeinsame Projekte, Events oder langfristige
          Partnerschaften.
        </p>
      </section>

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
            <p className="goenner-tier-cta">
              Beitreten für {tier.priceChf}.- / Jahr
            </p>
          </article>
        ))}
      </div>

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

          <label className="goenner-label">
            Name
            <input name="name" type="text" required autoComplete="name" maxLength={200} />
          </label>
          <label className="goenner-label">
            E-Mail
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="goenner-label">
            Telefon <span className="goenner-optional">(optional)</span>
            <input name="phone" type="tel" autoComplete="tel" maxLength={80} />
          </label>
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

      <SiteFooter />
    </div>
  );
}
