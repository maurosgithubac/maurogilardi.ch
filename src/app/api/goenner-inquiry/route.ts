import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  isKnownMembershipId,
  isLiteContactMembership,
  membershipLabel,
  membershipPriceChf,
  type MembershipId,
} from "@/content/goennerMemberships";
import { siteContent } from "@/content/siteContent";
import { createResendClient } from "@/lib/resend";
import { readEnv } from "@/lib/env";
import { runNewsletterSubscribe } from "@/lib/newsletter-subscribe";
import type { CreateEmailOptions } from "resend";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Body = {
  membership_id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  street?: string;
  postal_code?: string;
  city?: string;
  message?: string | null;
};

type InquiryPayload = {
  membership_id: MembershipId;
  name: string;
  email: string;
  phone: string | null;
  street: string;
  postal_code: string;
  city: string;
  message: string | null;
};

async function sendResendEmail(input: CreateEmailOptions) {
  const resend = createResendClient();
  const { error } = await resend.emails.send(input);
  if (error) {
    throw new Error(error.message);
  }
}

async function sendMemberWelcomeEmail(payload: InquiryPayload) {
  const from = readEnv("RESEND_FROM_EMAIL");
  const templateIdOrAlias = process.env.RESEND_GOENNER_TEMPLATE_ID?.trim() || "welcome";
  const label = membershipLabel(payload.membership_id);
  const address =
    payload.street || payload.postal_code || payload.city
      ? `${payload.street || "-"}, ${payload.postal_code || "-"} ${payload.city || "-"}`.trim()
      : "-";

  await sendResendEmail({
    from,
    to: [payload.email],
    template: {
      id: templateIdOrAlias,
      variables: {
        NAME: payload.name,
        EMAIL_ADDRESS: payload.email,
        MEMBERSHIP_OPTION: label,
        PHONE: payload.phone || "",
        ADDRESS: address,
        MESSAGE: payload.message || "",
      },
    },
  });
}

async function sendClub100MemberEmail(payload: InquiryPayload) {
  const from = readEnv("RESEND_FROM_EMAIL");

  await sendResendEmail({
    from,
    to: [payload.email],
    replyTo: siteContent.contact.email,
    subject: "100er Club — Zahlung 100 CHF per TWINT",
    text: [
      `Hallo ${payload.name},`,
      "",
      "Danke für deinen Beitritt zum 100er Club.",
      "",
      "Bitte schliesse die Zahlung von 100 CHF im TWINT-Tab ab (falls das Fenster nicht aufgegangen ist: https://pay.raisenow.io/pjczf).",
      "",
      "Du bist für den monatlichen Newsletter vorgemerkt. Den WhatsApp-Supporterchat und die Erwähnung auf der Website folgen, sobald die Zahlung bei mir eingetroffen ist.",
      "",
      "Fragen? Einfach auf diese Mail antworten.",
      "",
      "Sportliche Grüsse",
      "Mauro Gilardi",
    ].join("\n"),
  });
}

async function sendAdminNotifyEmail(payload: InquiryPayload, extras?: { beehiivNote?: string }) {
  const from = readEnv("RESEND_FROM_EMAIL");
  const adminNotify = process.env.GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL?.trim() || siteContent.contact.email;
  const label = membershipLabel(payload.membership_id);
  const address =
    payload.street || payload.postal_code || payload.city
      ? `${payload.street || "-"}, ${payload.postal_code || "-"} ${payload.city || "-"}`.trim()
      : "-";
  const isLite = isLiteContactMembership(payload.membership_id);

  await sendResendEmail({
    from,
    to: [adminNotify],
    replyTo: payload.email,
    subject: isLite
      ? `Neuer 100er Club Beitritt: ${payload.name}`
      : `Neue Gönner/Sponsoring-Anfrage: ${payload.name}`,
    text: [
      isLite
        ? "Neuer 100er Club Beitritt (Kontaktdaten vor TWINT-Zahlung):"
        : "Neue Anfrage über das Gönner-/Sponsoring-Formular:",
      "",
      `Mitgliedschaft / Option: ${label}`,
      `Name: ${payload.name}`,
      `E-Mail: ${payload.email}`,
      `Telefon: ${payload.phone || "-"}`,
      ...(isLite
        ? [
            "Hinweis: Beim 100er Club entfällt die Adresse. Bestätigung geht an den Member (TWINT 100 CHF).",
            extras?.beehiivNote ? `Beehiiv: ${extras.beehiivNote}` : "Beehiiv: Status unbekannt",
            "TWINT-Zahlung (100 CHF) im Admin als bezahlt markieren.",
          ]
        : [
            `Strasse: ${payload.street || "-"}`,
            `PLZ: ${payload.postal_code || "-"}`,
            `Ort: ${payload.city || "-"}`,
            `Adresse komplett: ${address}`,
          ]),
      `Nachricht: ${payload.message || "-"}`,
      "",
      "Admin: https://www.maurogilardi.ch/admin/goenner/inbox",
    ].join("\n"),
  });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const membership_id = String(body.membership_id || "").trim();
  if (!isKnownMembershipId(membership_id)) {
    return NextResponse.json(
      { error: "Bitte wähle eine Option (Mitgliedschaft oder Sponsoring)." },
      { status: 400 },
    );
  }

  const lite = isLiteContactMembership(membership_id);

  const name = String(body.name || "").trim();
  if (name.length < 2 || name.length > 200) {
    return NextResponse.json({ error: "Bitte gib einen gültigen Namen ein." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail ein." }, { status: 400 });
  }

  const phone = body.phone != null ? String(body.phone).trim().slice(0, 80) : "";
  if (lite && phone.length < 6) {
    return NextResponse.json({ error: "Bitte gib eine Telefonnummer an." }, { status: 400 });
  }

  let street = String(body.street || "").trim();
  let postal_code = String(body.postal_code || "").trim();
  let city = String(body.city || "").trim();

  if (!lite) {
    if (street.length < 3 || street.length > 300) {
      return NextResponse.json({ error: "Bitte gib Strasse und Hausnummer an." }, { status: 400 });
    }
    if (postal_code.length < 3 || postal_code.length > 16) {
      return NextResponse.json({ error: "Bitte gib eine gültige PLZ ein." }, { status: 400 });
    }
    if (city.length < 2 || city.length > 120) {
      return NextResponse.json({ error: "Bitte gib den Ort an." }, { status: 400 });
    }
  } else {
    street = street.slice(0, 300);
    postal_code = postal_code.slice(0, 16);
    city = city.slice(0, 120);
  }

  const message = body.message != null ? String(body.message).trim().slice(0, 4000) : null;

  const payload: InquiryPayload = {
    membership_id,
    name,
    email,
    phone: phone || null,
    street,
    postal_code,
    city,
    message: message || null,
  };

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("goenner_inquiries").insert({
      membership_id,
      name,
      email,
      phone: phone || null,
      street: street || null,
      postal_code: postal_code || null,
      city: city || null,
      message: message || null,
      amount_chf: lite ? membershipPriceChf(membership_id) : null,
    });

    if (error) {
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }

    let beehiivNote = "";
    if (lite) {
      const newsletter = await runNewsletterSubscribe(email, "https://www.maurogilardi.ch/sponsoring", {
        sendWelcomeEmail: false,
        utmCampaign: "hundert_club",
      });
      beehiivNote = newsletter.ok
        ? newsletter.message.includes("schon dabei")
          ? "bereits abonniert"
          : "automatisch hinzugefügt (ohne Beehiiv-Welcome-Mail)"
        : `Fehler — ${newsletter.error}`;
    }

    try {
      await sendAdminNotifyEmail(payload, lite ? { beehiivNote } : undefined);
      if (lite) {
        await sendClub100MemberEmail(payload);
      } else {
        await sendMemberWelcomeEmail(payload);
      }
    } catch (mailError) {
      console.error("goenner-inquiry email failed", mailError);
      if (!lite) {
        return NextResponse.json(
          { error: "Anfrage gespeichert, aber E-Mail-Versand fehlgeschlagen." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        message: lite
          ? "Danke! Deine Daten sind gespeichert — bitte schliesse die Zahlung von 100 CHF im TWINT-Tab ab."
          : "Vielen Dank! Ich melde mich bei dir.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Server-Konfiguration für Supabase fehlt." },
      { status: 500 },
    );
  }
}
