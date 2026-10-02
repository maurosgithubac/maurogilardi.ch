"use client";

import { useState, type FormEvent } from "react";

/** Sponsoring-Anfrage für Firmen: keine Postadresse, dafür Firma und Ziele. */
export function PartnerInquiryForm() {
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; text: string }>({ kind: "idle", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const value = (key: string) => String(fd.get(key) || "").trim();
    const company = value("company");
    const message = [company ? `Firma: ${company}` : "", value("message")].filter(Boolean).join("\n\n");

    setIsSubmitting(true);
    setStatus({ kind: "idle", text: "" });
    try {
      const response = await fetch("/api/goenner-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: "sponsoring",
          name: value("name"),
          email: value("email"),
          phone: value("phone") || null,
          message: message || null,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setStatus({ kind: "error", text: data.error || "Etwas ist schiefgelaufen." });
        return;
      }
      setStatus({ kind: "ok", text: data.message || "Danke für die Anfrage — ich melde mich innert weniger Tage." });
      form.reset();
    } catch {
      setStatus({ kind: "error", text: "Verbindung fehlgeschlagen. Bitte versuch es nochmals." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mg-inquiry" onSubmit={onSubmit}>
      <div className="mg-inquiry__grid">
        <label className="mg-field mg-inquiry__span">
          Firma
          <input name="company" type="text" required autoComplete="organization" maxLength={200} />
        </label>
        <label className="mg-field">
          Ansprechperson
          <input name="name" type="text" required autoComplete="name" maxLength={200} />
        </label>
        <label className="mg-field">
          E-Mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="mg-field mg-inquiry__span">
          <span>
            Telefon <span className="mg-optional">(optional)</span>
          </span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={80} />
        </label>
        <label className="mg-field mg-inquiry__span">
          <span>
            Was möchtet ihr erreichen? <span className="mg-optional">(optional)</span>
          </span>
          <textarea
            name="message"
            rows={4}
            maxLength={3800}
            placeholder="z. B. Sichtbarkeit in der Region, Kundenanlass, Teamevent …"
          />
        </label>
      </div>
      <div className="mg-inquiry__submit">
        <button type="submit" className="mg-btn mg-btn--primary mg-btn--lg" disabled={isSubmitting}>
          {isSubmitting ? "Wird gesendet…" : "Gespräch vereinbaren"}
          <span className="mg-btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className="mg-modal__hint">Pakete ab 2&apos;000 CHF pro Jahr — Umfang und Leistungen stimmen wir gemeinsam ab.</p>
      </div>
      <p
        className={`mg-inquiry__status${status.kind === "error" ? " is-error" : ""}`}
        role="status"
        aria-live="polite"
        hidden={!status.text}
      >
        {status.text}
      </p>
    </form>
  );
}
