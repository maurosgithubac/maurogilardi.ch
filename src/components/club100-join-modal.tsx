"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { TWINT_PAYLINK_URL } from "@/components/twint-paylink-button";

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

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

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
          message: "100er Club — Kontaktdaten vor TWINT-Zahlung (100 CHF / Jahr).",
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setStatus(data.error || "Etwas ist schiefgelaufen.");
        return;
      }

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

  if (!open) return null;

  return (
    <div className="club100-modal-root" role="presentation">
      <button type="button" className="club100-modal-backdrop" aria-label="Schliessen" onClick={onClose} />
      <div
        ref={dialogRef}
        className="club100-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="club100-modal-header">
          <div>
            <p className="club100-modal-kicker">100er Club · 100 CHF / Jahr</p>
            <h2 id={titleId} className="club100-modal-title">
              {step === "contact" ? "Beitritt" : "Weiter zu TWINT"}
            </h2>
          </div>
          <button type="button" className="club100-modal-close" onClick={onClose} aria-label="Schliessen">
            ×
          </button>
        </header>

        {step === "contact" ? (
          <form className="club100-modal-body club100-modal-form" onSubmit={onSubmit}>
            <p className="club100-modal-lead">
              Zuerst deine Kontaktdaten — danach öffnet sich TWINT in einem neuen Tab. Betrag:{" "}
              <strong>100 CHF</strong>.
            </p>
            <label className="club100-modal-label">
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
            <label className="club100-modal-label">
              E-Mail
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="club100-modal-label">
              Telefon
              <input
                type="tel"
                required
                autoComplete="tel"
                maxLength={80}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <button type="submit" className="club100-modal-primary" disabled={isSubmitting}>
              {isSubmitting ? "Wird gesendet…" : "Zahlungspflichtig beitreten"}
            </button>
            <p className="club100-modal-hint">
              Mit dem Klick speicherst du deine Daten und wirst zu TWINT weitergeleitet (neuer Tab). Du erhältst eine
              Bestätigung per E-Mail.
            </p>
            {status ? <p className="club100-modal-status club100-modal-status--warn">{status}</p> : null}
          </form>
        ) : null}

        {step === "done" ? (
          <div className="club100-modal-body">
            <p className="club100-modal-lead">{status}</p>
            <p className="club100-modal-hint">
              Falls kein Tab geöffnet wurde, starte TWINT hier. Betrag: <strong>100 CHF</strong>.
            </p>
            <a
              href={TWINT_PAYLINK_URL}
              className="club100-modal-primary club100-modal-primary--link"
              target="_blank"
              rel="noopener noreferrer"
            >
              TWINT öffnen
            </a>
            <button type="button" className="club100-modal-secondary" onClick={onClose}>
              Schliessen
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
