import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type NewsletterPayload = {
  email?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: NewsletterPayload;

  try {
    payload = (await request.json()) as NewsletterPayload;
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

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });

    if (error) {
      // Postgres unique violation: email already exists.
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Du bist bereits im Newsletter eingetragen." },
          { status: 200 },
        );
      }
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }

    return NextResponse.json({ message: "Vielen Dank für das Abonnieren!" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Server-Konfiguration für Supabase fehlt." },
      { status: 500 },
    );
  }
}
