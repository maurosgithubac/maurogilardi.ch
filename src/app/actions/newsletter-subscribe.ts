"use server";

import { headers } from "next/headers";
import type { NewsletterFormState } from "@/lib/newsletter-form-state";
import { runNewsletterSubscribe } from "@/lib/newsletter-subscribe";

/**
 * Form action for the homepage newsletter — no client fetch, so ad blockers cannot block /api/* XHR.
 */
export async function newsletterSubscribeAction(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const email = String(formData.get("email") || "");
  const h = await headers();
  const referer = h.get("referer");

  const outcome = await runNewsletterSubscribe(email, referer);
  if (outcome.ok) {
    return { message: outcome.message, error: "" };
  }
  return { message: "", error: outcome.error };
}
