"use client";

import { useState, type FormEvent } from "react";

export function FooterContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setStatus("error");
        setFeedback(data.error || "Senden fehlgeschlagen.");
        return;
      }

      setStatus("success");
      setFeedback(data.message || "Vielen Dank! Ich melde mich bei dir.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback("Senden fehlgeschlagen. Bitte versuch es später nochmals.");
    }
  }

  return (
    <section id="kontakt" className="footer-contact" aria-labelledby="footer-contact-title">
      <div className="footer-contact-intro">
        <p className="footer-contact-kicker">Kontakt</p>
        <h2 id="footer-contact-title" className="footer-contact-title">
          Schreib mir
        </h2>
        <p className="footer-contact-lead">Kurze Frage oder Anliegen? Ich melde mich bei dir.</p>
      </div>

      <form className="footer-contact-form" onSubmit={onSubmit} noValidate>
        <div className="footer-contact-row">
          <label className="footer-contact-label" htmlFor="footer-contact-name">
            Name
            <input
              id="footer-contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={200}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dein Name"
            />
          </label>
          <label className="footer-contact-label" htmlFor="footer-contact-email">
            E-Mail
            <input
              id="footer-contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@email.ch"
            />
          </label>
        </div>

        <label className="footer-contact-label" htmlFor="footer-contact-message">
          Nachricht
          <textarea
            id="footer-contact-message"
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Worum geht’s?"
          />
        </label>

        <div className="footer-contact-actions">
          <button type="submit" className="footer-contact-submit" disabled={status === "loading"}>
            {status === "loading" ? "Wird gesendet…" : "Nachricht senden"}
          </button>
          {feedback ? (
            <p
              className={`form-message${status === "error" ? " form-message--error" : ""}`}
              role={status === "error" ? "alert" : "status"}
            >
              {feedback}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
