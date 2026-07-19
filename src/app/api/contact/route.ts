import { NextResponse } from "next/server";
import { siteContent } from "@/content/siteContent";
import { createResendClient } from "@/lib/resend";
import { readEnv } from "@/lib/env";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  if (name.length < 2 || name.length > 200) {
    return NextResponse.json({ error: "Bitte gib einen gültigen Namen ein." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail ein." }, { status: 400 });
  }

  const message = String(body.message || "").trim();
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: "Bitte schreib eine kurze Nachricht (mind. 10 Zeichen)." },
      { status: 400 },
    );
  }

  try {
    const resend = createResendClient();
    const from = readEnv("RESEND_FROM_EMAIL");
    const adminNotify =
      process.env.CONTACT_ADMIN_NOTIFY_EMAIL?.trim() ||
      process.env.GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL?.trim() ||
      siteContent.contact.email;

    await resend.emails.send({
      from,
      to: [adminNotify],
      replyTo: email,
      subject: `Neue Kontaktanfrage: ${name}`,
      text: [
        "Neue Nachricht über das Kontaktformular:",
        "",
        `Name: ${name}`,
        `E-Mail: ${email}`,
        "",
        "Nachricht:",
        message,
      ].join("\n"),
    });

    return NextResponse.json(
      { message: "Vielen Dank! Ich melde mich bei dir." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Senden fehlgeschlagen. Bitte versuch es später nochmals." },
      { status: 500 },
    );
  }
}
