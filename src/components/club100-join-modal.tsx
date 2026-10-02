"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MG_EASE } from "@/components/motion/motion-provider";
import { Portal } from "@/components/portal";
import { TWINT_PAYLINK_URL } from "@/lib/twint";
import { trackEvent } from "@/components/analytics-events";
import { useFocusTrap, useOverlayLock } from "@/lib/ui/use-overlay";

type Step = "contact" | "done";

type Props = {
  open: boolean;
  onClose: () => void;
};

function openTwintInNewTab() {
  window.open(TWINT_PAYLINK_URL, "_blank", "noopener,noreferrer");
}

export function Club100JoinModal({ open, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("contact");
    setName("");
    setEmail("");
    setPhone("");
    setStatus("");
    setIsSubmitting(false);
  }, [open]);

  useOverlayLock(open);
  useFocusTrap(dialogRef, open, onClose);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/goenner-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: "hundert",
          name,
          email,
          phone,
          message:
            "100er Club — Kontaktdaten vor TWINT-Zahlung (100 CHF / Jahr).",
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        setStatus(data.error || "Etwas ist schiefgelaufen.");
        return;
      }

      trackEvent("club100_joined");
      openTwintInNewTab();
      setStatus(
        data.message ||
          "Danke! Deine Daten sind gespeichert — bitte schliesse die Zahlung von 100 CHF im TWINT-Tab ab.",
      );
      setStep("done");
    } catch {
      setStatus("Verbindung fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="club100"
            className="mg-modal"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="mg-modal__backdrop"
              aria-label="Schliessen"
              tabIndex={-1}
              onClick={onClose}
            />
            <motion.div
              ref={dialogRef}
              className="mg-modal__dialog mg-page"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.5, ease: MG_EASE }}
            >
              <header className="mg-modal__head">
                <div>
                  <p className="mg-eyebrow">100er Club · 100 CHF / Jahr</p>
                  <h2 id={titleId} className="mg-h3">
                    {step === "contact"
                      ? "Willkommen im Team"
                      : "Weiter zu TWINT"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="mg-modal__close"
                  onClick={onClose}
                  aria-label="Schliessen"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M3 3l10 10M13 3L3 13"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </header>

              {step === "contact" ? (
                <form className="mg-modal__body" onSubmit={onSubmit}>
                  <p className="mg-body">
                    Zuerst deine Kontaktdaten — danach öffnet sich TWINT in
                    einem neuen Tab. Betrag: <strong>100 CHF</strong>.
                  </p>
                  <label className="mg-field">
                    Name
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      maxLength={200}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label className="mg-field">
                    E-Mail
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                  <label className="mg-field">
                    <span>
                      Telefon{" "}
                      <span className="mg-optional">
                        — für den WhatsApp-Supporterchat
                      </span>
                    </span>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      maxLength={80}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    className="mg-btn mg-btn--primary mg-btn--lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Wird gesendet…"
                      : "Zahlungspflichtig beitreten"}
                  </button>
                  <p className="mg-modal__hint">
                    Mit dem Klick speicherst du deine Daten und wirst zu TWINT
                    weitergeleitet (neuer Tab). Du erhältst eine Bestätigung per
                    E-Mail.
                  </p>
                  <p
                    className="mg-form-status mg-form-status--error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {status}
                  </p>
                </form>
              ) : (
                <div className="mg-modal__body">
                  <p className="mg-body" role="status">
                    {status}
                  </p>
                  <p className="mg-modal__hint">
                    Falls kein Tab geöffnet wurde, starte TWINT hier. Betrag:{" "}
                    <strong>100 CHF</strong>.
                  </p>
                  <a
                    href={TWINT_PAYLINK_URL}
                    className="mg-btn mg-btn--primary mg-btn--lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TWINT öffnen <span aria-hidden="true">↗</span>
                  </a>
                  <button
                    type="button"
                    className="mg-btn mg-btn--ghost"
                    onClick={onClose}
                  >
                    Schliessen
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
