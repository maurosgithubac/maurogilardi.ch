"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { newsletterSubscribeAction } from "@/app/actions/newsletter-subscribe";
import { initialNewsletterFormState } from "@/lib/newsletter-form-state";
import { trackEvent } from "@/components/analytics-events";

type Props = {
  /** "light" = Button hell (auf dunklem/rotem Grund) */
  tone?: "light" | "dark";
};

export function NewsletterForm({ tone = "light" }: Props) {
  const inputId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(newsletterSubscribeAction, initialNewsletterFormState);

  useEffect(() => {
    if (state.message && !state.error) {
      formRef.current?.reset();
      trackEvent("newsletter_subscribed");
    }
  }, [state.message, state.error]);

  return (
    <form ref={formRef} action={formAction} className="mg-newsletter-form">
      <label htmlFor={inputId} className="mg-sr-only">
        E-Mail-Adresse
      </label>
      <div className="mg-newsletter-form__row">
        <input
          id={inputId}
          name="email"
          type="email"
          placeholder="deine@email.ch"
          required
          autoComplete="email"
          className="mg-input"
        />
        <button type="submit" className={`mg-btn ${tone === "light" ? "mg-btn--light" : "mg-btn--dark"}`} disabled={pending}>
          {pending ? "…" : "Anmelden"}
        </button>
      </div>
      <p className={`mg-form-status${state.error ? " mg-form-status--error" : ""}`} role="status" aria-live="polite">
        {state.message || state.error}
      </p>
    </form>
  );
}
