"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Club100JoinModal } from "@/components/club100-join-modal";
import { MG_EASE } from "@/components/motion/motion-provider";
import {
  goennerMembershipTiers,
  isMemberTierId,
  tierPriceLine,
  type MemberTierId,
  type MembershipTier,
} from "@/content/goennerMemberships";

const MEMBER_TIERS = goennerMembershipTiers.filter((t): t is MembershipTier & { id: MemberTierId } => isMemberTierId(t.id));

/**
 * Anfrage für Birdie/Eagle/Albatros. 100er Club läuft über das TWINT-Modal,
 * Firmen-Sponsoring über /partner — so bekommt jede Gruppe nur die Felder, die sie braucht.
 */
export function GoennerInquiryForm() {
  // Vorauswahl aus ?modell=… (Links der Modell-Karten); im Client gelesen, damit die Seite statisch bleibt
  const modell = useSearchParams().get("modell") ?? undefined;
  const preselect: MemberTierId | "" = isMemberTierId(modell) ? modell : "";
  const [tier, setTier] = useState<MemberTierId | "">(preselect);
  const [lastPreselect, setLastPreselect] = useState(preselect);
  if (preselect !== lastPreselect) {
    setLastPreselect(preselect);
    if (preselect) setTier(preselect);
  }
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; text: string }>({ kind: "idle", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [club100Open, setClub100Open] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tier) {
      setStatus({ kind: "error", text: "Bitte wähle eine Mitgliedschaft." });
      return;
    }
    const form = event.currentTarget;
    const fd = new FormData(form);
    const value = (key: string) => String(fd.get(key) || "").trim();

    setIsSubmitting(true);
    setStatus({ kind: "idle", text: "" });
    try {
      const response = await fetch("/api/goenner-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: tier,
          name: value("name"),
          email: value("email"),
          phone: value("phone") || null,
          street: value("street"),
          postal_code: value("postal_code"),
          city: value("city"),
          message: value("message") || null,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setStatus({ kind: "error", text: data.error || "Etwas ist schiefgelaufen." });
        return;
      }
      setStatus({ kind: "ok", text: data.message || "Vielen Dank — ich melde mich bei dir." });
      form.reset();
      setTier("");
    } catch {
      setStatus({ kind: "error", text: "Verbindung fehlgeschlagen. Bitte versuch es nochmals." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="mg-inquiry" onSubmit={onSubmit} noValidate={false}>
        <fieldset className="mg-inquiry__tiers">
          <legend className="mg-inquiry__legend">Mitgliedschaft wählen</legend>
          <div className="mg-inquiry__options">
            {MEMBER_TIERS.map((t) => (
              <label key={t.id} className="mg-option" data-checked={tier === t.id ? "true" : undefined}>
                <input type="radio" name="membership_pick" value={t.id} checked={tier === t.id} onChange={() => setTier(t.id)} />
                <span className="mg-option__title">{t.title}</span>
                <span className="mg-option__price">{tierPriceLine(t)}</span>
              </label>
            ))}
          </div>
          <p className="mg-inquiry__alt">
            Lieber den <button type="button" className="mg-inline-btn" onClick={() => setClub100Open(true)}>100er Club für 100 CHF</button>{" "}
            direkt mit TWINT? Oder als Firma: <Link href="/partner#anfrage">Sponsoring anfragen</Link>.
          </p>
        </fieldset>

        <div className="mg-inquiry__grid">
          <label className="mg-field">
            Name
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
              Strasse &amp; Nr. <span className="mg-optional">— für Rechnung und Einladungen</span>
            </span>
            <input name="street" type="text" required autoComplete="street-address" maxLength={300} placeholder="Musterweg 12" />
          </label>
          <label className="mg-field">
            PLZ
            <input name="postal_code" type="text" required autoComplete="postal-code" maxLength={16} inputMode="numeric" />
          </label>
          <label className="mg-field">
            Ort
            <input name="city" type="text" required autoComplete="address-level2" maxLength={120} />
          </label>
          <label className="mg-field mg-inquiry__span">
            <span>
              Nachricht <span className="mg-optional">(optional)</span>
            </span>
            <textarea name="message" rows={4} maxLength={4000} />
          </label>
        </div>

        <div className="mg-inquiry__submit">
          <button type="submit" className="mg-btn mg-btn--primary mg-btn--lg" disabled={isSubmitting}>
            {isSubmitting ? "Wird gesendet…" : "Anfrage senden"}
            <span className="mg-btn__arrow" aria-hidden="true">
              →
            </span>
          </button>
          <p className="mg-modal__hint">* Golfklinik und Golfrunde: Details und Termine stimme ich persönlich mit dir ab.</p>
        </div>

        <div aria-live="polite" role="status">
          <AnimatePresence>
            {status.text ? (
              <motion.p
                key={status.text}
                className={`mg-inquiry__status${status.kind === "error" ? " is-error" : ""}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: MG_EASE }}
              >
                {status.text}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </form>
      <Club100JoinModal open={club100Open} onClose={() => setClub100Open(false)} />
    </>
  );
}
