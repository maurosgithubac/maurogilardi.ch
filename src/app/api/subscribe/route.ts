/**
 * Newsletter signup (JSON) — optional; homepage uses Server Action instead.
 * Path `/api/subscribe` avoids some ad blockers that match "newsletter".
 */
import { NextResponse } from "next/server";
import { runNewsletterSubscribe } from "@/lib/newsletter-subscribe";

type SubscribePayload = {
  email?: string;
};

export async function POST(request: Request) {
  let payload: SubscribePayload;

  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const referringSite = request.headers.get("referer");
  const outcome = await runNewsletterSubscribe(email, referringSite);

  if (outcome.ok) {
    return NextResponse.json({ message: outcome.message }, { status: 200 });
  }

  const status =
    outcome.error.includes("konfiguriert") || outcome.error.includes("Speichern fehlgeschlagen")
      ? 500
      : 502;
  return NextResponse.json({ error: outcome.error }, { status });
}
