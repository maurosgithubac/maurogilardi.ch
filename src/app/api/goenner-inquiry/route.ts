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
import { nextInvoiceNumber, sendInvoiceMail, sendReceiptMail, type GoennerMailRow } from "@/lib/goenner-mails";

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
  payment_method?: string | null;
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
  payment_method: "rechnung" | "twint" | null;
};

async function sendResendEmail(input: CreateEmailOptions) {
  const resend = createResendClient();
  const { error } = await resend.emails.send(input);
  if (error) {
    throw new Error(error.message);
  }
}

async function sendAdminNotifyEmail(payload: InquiryPayload, extras: { beehiivNote: string }) {
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
      `Newsletter (beehiiv): ${extras?.beehiivNote || "Status unbekannt"}`,
      ...(isLite
        ? [
            "Hinweis: Beim 100er Club entfällt die Adresse. Die Eingangsbestätigung an den Member enthält den TWINT-Link.",
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

  // Adresse nur für Mitgliedschaften (Rechnungsversand); Sponsoring-Anfragen von Firmen bleiben schlank
  const needsAddress = !lite && membership_id !== "sponsoring";

  if (needsAddress) {
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

  // Zahlungsart: 100er Club immer TWINT, Sponsoring ohne Standardzahlung, Gönner-Modelle Rechnung oder TWINT.
  const paymentMethod: "rechnung" | "twint" | null =
    membership_id === "sponsoring"
      ? null
      : membership_id === "hundert"
        ? "twint"
        : body.payment_method === "twint"
          ? "twint"
          : "rechnung";

  const payload: InquiryPayload = {
    membership_id,
    name,
    email,
    phone: phone || null,
    street,
    postal_code,
    city,
    message: message || null,
    payment_method: paymentMethod,
  };

  try {
    const supabase = createSupabaseServerClient();
    const invoiceNumber =
      paymentMethod === "rechnung" ? await nextInvoiceNumber(supabase) : null;

    const { data: inserted, error } = await supabase
      .from("goenner_inquiries")
      .insert({
        membership_id,
        name,
        email,
        phone: phone || null,
        street: street || null,
        postal_code: postal_code || null,
        city: city || null,
        message: message || null,
        amount_chf: lite ? membershipPriceChf(membership_id) : null,
        payment_method: paymentMethod,
        invoice_number: invoiceNumber,
      })
      .select("id,membership_id,name,email,street,postal_code,city,payment_method,invoice_number")
      .single();

    if (error || !inserted) {
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
    }

    // Newsletter: jede Anfrage über das Gönner-/Sponsoring-Formular, bei allen Optionen
    const newsletter = await runNewsletterSubscribe(email, "https://www.maurogilardi.ch/sponsoring", {
      sendWelcomeEmail: false,
      utmCampaign: lite ? "hundert_club" : "goenner",
    });
    const beehiivNote = newsletter.ok
      ? newsletter.message.includes("schon dabei")
        ? "bereits abonniert"
        : "automatisch hinzugefügt (ohne Beehiiv-Welcome-Mail)"
      : `Fehler — ${newsletter.error}`;

    try {
      await sendAdminNotifyEmail(payload, { beehiivNote });
      // Eingangsbestätigung mit den ausgefüllten Angaben, bei jeder Anfrage
      // Bei Rechnung entfällt sie: die Dank-Mail mit Zahlungsdaten ist die Bestätigung.
      if (paymentMethod !== "rechnung") {
        await sendReceiptMail(payload);
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

    // Rechnung: Dank-Mail mit Zahlungsdaten und QR-Code, sofort nach Einreichung
    if (paymentMethod === "rechnung") {
      try {
        await sendInvoiceMail(inserted as GoennerMailRow);
        await supabase
          .from("goenner_inquiries")
          .update({ invoice_mail_sent_at: new Date().toISOString() })
          .eq("id", inserted.id);
      } catch (invoiceError) {
        console.error("goenner-inquiry invoice mail failed", invoiceError);
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
