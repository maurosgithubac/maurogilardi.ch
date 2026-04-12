/**
 * Server-side Beehiiv subscription (v2 API).
 * @see https://developers.beehiiv.com/api-reference/subscriptions/create
 */

const BEEHIIV_API = "https://api.beehiiv.com/v2";

export type BeehiivSubscribeResult =
  | { ok: true; status?: string }
  | { ok: false; statusCode: number; message: string };

type BeehiivErrorBody = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

function extractSubscriptionStatus(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object") {
    const s = (inner as Record<string, unknown>).status;
    if (typeof s === "string") return s;
  }
  return undefined;
}

function parseBeehiivError(json: unknown, fallback: string): string {
  if (!json || typeof json !== "object") return fallback;
  const o = json as BeehiivErrorBody;
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  const first = o.errors?.find((e) => e.message?.trim());
  if (first?.message?.trim()) return first.message.trim();
  return fallback;
}

export async function subscribeEmailToBeehiiv(
  email: string,
  options: {
    publicationId: string;
    apiKey: string;
    sendWelcomeEmail: boolean;
    reactivateExisting: boolean;
    referringSite?: string | null;
    newsletterListIds?: string[];
  },
): Promise<BeehiivSubscribeResult> {
  const url = `${BEEHIIV_API}/publications/${encodeURIComponent(options.publicationId)}/subscriptions`;

  const body: Record<string, unknown> = {
    email,
    send_welcome_email: options.sendWelcomeEmail,
    reactivate_existing: options.reactivateExisting,
    utm_source: "maurogilardi.ch",
    utm_medium: "website",
    utm_campaign: "homepage_signup",
  };

  if (options.referringSite) {
    body.referring_site = options.referringSite.slice(0, 2048);
  }

  if (options.newsletterListIds?.length) {
    body.newsletter_list_ids = options.newsletterListIds;
  }

  const controller = new AbortController();
  const timeoutMs = 25_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    return {
      ok: false,
      statusCode: 0,
      message:
        "Der Newsletter-Dienst ist kurz nicht erreichbar. Bitte versuch es in ein paar Minuten noch einmal.",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.ok) {
    return { ok: true, status: extractSubscriptionStatus(data) };
  }

  const msg = parseBeehiivError(data, "Beehiiv hat die Anmeldung abgelehnt.");
  const lower = msg.toLowerCase();
  if (
    res.status === 400 ||
    res.status === 409 ||
    res.status === 422 ||
    lower.includes("already") ||
    lower.includes("exist") ||
    lower.includes("duplicate") ||
    lower.includes("subscribed")
  ) {
    return {
      ok: false,
      statusCode: res.status,
      message: "Du bist bei mir im Newsletter schon dabei.",
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      statusCode: 429,
      message: "Zu viele Versuche — bitte später noch einmal.",
    };
  }

  return { ok: false, statusCode: res.status, message: msg };
}
