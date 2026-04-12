import { createSupabaseServerClient } from "@/lib/supabase-server";
import { subscribeEmailToBeehiiv } from "@/lib/beehiiv";

export function isNewsletterEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function beehiivListIdsFromEnv(): string[] | undefined {
  const raw = process.env.BEEHIIV_NEWSLETTER_LIST_IDS?.trim();
  if (!raw) return undefined;
  const ids = raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? ids : undefined;
}

export type NewsletterSubscribeOutcome =
  | { ok: true; message: string }
  | { ok: false; error: string };

const NEWSLETTER_ADDED_MESSAGE =
  "Vielen Dank — deine E-Mail wurde zum Newsletter-Versand hinzugefügt.";

/**
 * Shared Beehiiv / Supabase signup (API route + Server Action).
 */
export async function runNewsletterSubscribe(
  emailRaw: string,
  referringSite: string | null,
): Promise<NewsletterSubscribeOutcome> {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!isNewsletterEmailValid(email)) {
    return { ok: false, error: "Bitte gib eine gültige E-Mail Adresse ein." };
  }

  const apiKey = process.env.BEEHIIV_API_KEY?.trim();
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID?.trim();

  if (apiKey && publicationId) {
    try {
      const result = await subscribeEmailToBeehiiv(email, {
        publicationId,
        apiKey,
        sendWelcomeEmail: process.env.BEEHIIV_SEND_WELCOME_EMAIL !== "false",
        reactivateExisting: process.env.BEEHIIV_REACTIVATE_EXISTING === "true",
        referringSite,
        newsletterListIds: beehiivListIdsFromEnv(),
      });

      if (result.ok) {
        return { ok: true, message: NEWSLETTER_ADDED_MESSAGE };
      }

      if (result.message.includes("schon dabei")) {
        return { ok: true, message: result.message };
      }

      return { ok: false, error: result.message };
    } catch {
      return {
        ok: false,
        error:
          "Newsletter-Anmeldung ist gerade fehlgeschlagen. Bitte später erneut versuchen oder Support melden.",
      };
    }
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });

    if (error) {
      if (error.code === "23505") {
        return { ok: true, message: "Du bist bei mir im Newsletter schon dabei." };
      }
      return { ok: false, error: "Speichern fehlgeschlagen." };
    }

    return { ok: true, message: NEWSLETTER_ADDED_MESSAGE };
  } catch {
    return {
      ok: false,
      error: "Newsletter: weder Beehiiv noch Supabase ist konfiguriert.",
    };
  }
}
