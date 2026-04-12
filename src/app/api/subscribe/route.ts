/**
 * Newsletter signup (Beehiiv / Supabase fallback).
 * Path is `/api/subscribe` (not "newsletter") so browser ad blockers are less likely to block the request.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { subscribeEmailToBeehiiv } from "@/lib/beehiiv";

type SubscribePayload = {
  email?: string;
};

function isValidEmail(email: string): boolean {
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

export async function POST(request: Request) {
  let payload: SubscribePayload;

  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Bitte gib eine gültige E-Mail Adresse ein." },
      { status: 400 },
    );
  }

  const apiKey = process.env.BEEHIIV_API_KEY?.trim();
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID?.trim();

  if (apiKey && publicationId) {
    try {
      const referringSite = request.headers.get("referer");
      const result = await subscribeEmailToBeehiiv(email, {
        publicationId,
        apiKey,
        sendWelcomeEmail: process.env.BEEHIIV_SEND_WELCOME_EMAIL !== "false",
        reactivateExisting: process.env.BEEHIIV_REACTIVATE_EXISTING === "true",
        referringSite,
        newsletterListIds: beehiivListIdsFromEnv(),
      });

      if (result.ok) {
        const pending = result.status === "pending" || result.status === "validating";
        const message = pending
          ? "Fast geschafft — bitte bestätige deine E-Mail im Posteingang (Double Opt-in)."
          : "Vielen Dank — ich halte dich auf dem Laufenden.";
        return NextResponse.json({ message }, { status: 200 });
      }

      if (result.message.includes("schon dabei")) {
        return NextResponse.json({ message: result.message }, { status: 200 });
      }

      return NextResponse.json({ error: result.message }, { status: 502 });
    } catch {
      return NextResponse.json(
        {
          error:
            "Newsletter-Anmeldung ist gerade fehlgeschlagen. Bitte später erneut versuchen oder Support melden.",
        },
        { status: 502 },
      );
    }
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Du bist bei mir im Newsletter schon dabei." },
          { status: 200 },
        );
      }
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }

    return NextResponse.json({ message: "Vielen Dank — ich halte dich auf dem Laufenden." }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Newsletter: weder Beehiiv noch Supabase ist konfiguriert." },
      { status: 500 },
    );
  }
}
