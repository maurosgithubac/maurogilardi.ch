import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateEmailOptions } from "resend";
import { goennerMembershipTiers, membershipPriceChf } from "@/content/goennerMemberships";
import { readEnv } from "@/lib/env";
import { createResendClient } from "@/lib/resend";
import { buildSwissQrPayload, readInvoiceBankConfig } from "@/lib/invoice-config";

/** Saison, für die Gönnerbeiträge gelten. Rechnungsnummern: GG-2027-0001, GG-2027-0002, … */
export const GOENNER_INVOICE_YEAR = 2027;

export type GoennerMailRow = {
  id: string;
  membership_id: string;
  name: string;
  email: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  payment_method: "rechnung" | "twint" | null;
  invoice_number: string | null;
};

const QR_CID = "goenner-zahlteil-qr";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function tierTitle(membershipId: string): string {
  return goennerMembershipTiers.find((t) => t.id === membershipId)?.title ?? membershipId;
}

export function invoicePurpose(row: Pick<GoennerMailRow, "invoice_number" | "membership_id">): string {
  return `${row.invoice_number ?? ""} · ${tierTitle(row.membership_id)}`.trim();
}

/** Nächste freie Rechnungsnummer, z. B. GG-2027-0007. */
export async function nextInvoiceNumber(supabase: SupabaseClient): Promise<string> {
  const prefix = `GG-${GOENNER_INVOICE_YEAR}-`;
  const { data } = await supabase
    .from("goenner_inquiries")
    .select("invoice_number")
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const last = data?.invoice_number ? Number(String(data.invoice_number).slice(prefix.length)) : 0;
  const next = (Number.isFinite(last) ? last : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

/** Swiss-QR-Code als PNG, mit Betrag und Zahlungszweck vorausgefüllt. */
export async function buildInvoiceQrPng(row: GoennerMailRow): Promise<Buffer> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");
  const payload = buildSwissQrPayload({
    bank,
    amountChf: membershipPriceChf(row.membership_id),
    debtorName: row.name,
    debtorStreet: row.street ?? "",
    debtorPostalCode: row.postal_code ?? "",
    debtorCity: row.city ?? "",
    message: invoicePurpose(row),
  });
  return QRCode.toBuffer(payload, { type: "png", errorCorrectionLevel: "M", margin: 1, width: 300 });
}

type MailContent = { subject: string; html: string; text: string };

const P_THANKS = `DANKE für deine Unterstützung. Du unterstützt mich mit deinem Beitrag und begleitest mich auf meinen Weg auf die DP World Tour, und das schätze ich sehr. In den kommenden Tagen werde ich dich zum E-Mail-Newsletter (monatlich +-) und zum WhatsApp-Chat hinzufügen, damit du schon mal auf dem Laufenden bleibst und keine News verpasst ;)`;
const P_WELCOME = `Ich freue mich, dich in meinem Gönnerverein willkommen zu heissen, und hoffe, wir sehen uns bald mal auf dem Golfplatz oder spätestens nächsten Sommer an meinem Gönnerturnier in Domat/Ems.`;
const P_INVOICE_HINT = `Die Zahlungsdaten findest du unten.`;
const P_PAID = `Zahlung eingegangen. Danke, für deinen Support`;
const P_CLOSING = `Freundliche Grüsse und danke für den Support.`;
const SIGNATURE = ["Mauro Gilardi", "SwissPGA Professional", "maurogilardi.ch", "Bleikenstrasse 6d, 9630 Wattwil"];

/** Dank-Mail bei Rechnung (sofort, mit Zahlungsblock und QR-Code). */
export function invoiceMailContent(row: GoennerMailRow): MailContent {
  const first = firstName(row.name);
  const amount = membershipPriceChf(row.membership_id).toFixed(2);
  const purpose = invoicePurpose(row);
  const bank = readInvoiceBankConfig();
  const iban = bank?.iban ?? "";
  const creditor = `${bank?.creditorName ?? "Mauro Gilardi"}, ${bank?.creditorStreet ?? ""}, ${bank?.creditorPostalCode ?? ""} ${bank?.creditorCity ?? ""}`.replace(/\s+,/g, ",").trim();

  const rows: [string, string][] = [
    ["Modell", tierTitle(row.membership_id)],
    ["Betrag", `CHF ${amount}`],
    ["Rechnung", row.invoice_number ?? ""],
    ["Empfänger", creditor],
    ["IBAN", iban],
    ["Zahlungszweck", purpose],
  ];

  const html = `
<div style="background:#f1efea;padding:24px 12px;font-family:Georgia,'Playfair Display','Times New Roman',serif;color:#0b0b0b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e4e1da;">
    <tr><td style="padding:28px 40px 22px;border-bottom:1px solid #e4e1da;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:46px;height:46px;background:#0b0b0b;color:#faf9f6;text-align:center;font-weight:700;font-size:17px;">MG</td>
        <td style="padding-left:14px;font-size:16px;font-weight:700;">Mauro Gilardi<br><span style="font-size:12px;font-weight:400;color:#66625b;">SwissPGA Professional</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:30px 40px 34px;font-size:16px;line-height:1.55;">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#d71920;margin-bottom:14px;">Danke</div>
      <p style="margin:0 0 14px;">Hallo ${escapeHtml(first)}</p>
      <p style="margin:0 0 14px;">${escapeHtml(P_THANKS)}</p>
      <p style="margin:0 0 14px;">${escapeHtml(P_WELCOME)}</p>
      <p style="margin:0 0 14px;">${escapeHtml(P_INVOICE_HINT)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;border:1px solid #e4e1da;border-top:3px solid #0b0b0b;">
        <tr>
          <td style="padding:18px 20px;vertical-align:top;font-size:14px;line-height:1.7;">
            ${rows
              .map(
                ([k, v]) =>
                  `<div><span style="color:#66625b;display:inline-block;width:120px;">${escapeHtml(k)}</span><span style="${k === "Betrag" ? "font-weight:700;color:#d71920;font-size:18px;" : ""}">${escapeHtml(v)}</span></div>`,
              )
              .join("")}
          </td>
          <td style="padding:18px 20px 18px 0;width:150px;vertical-align:top;text-align:center;font-size:11px;color:#66625b;">
            <img src="cid:${QR_CID}" width="140" height="140" alt="Swiss QR-Code zum Bezahlen" style="display:block;width:140px;height:140px;margin:0 auto;">
            Mit dem E-Banking scannen. Betrag und Empfänger sind vorausgefüllt.
          </td>
        </tr>
      </table>
      <p style="margin:22px 0 0;">${escapeHtml(P_CLOSING)}</p>
      <p style="margin:14px 0 0;font-weight:700;">${escapeHtml(SIGNATURE[0])}</p>
      <p style="margin:0;font-size:13px;color:#66625b;line-height:1.5;">${SIGNATURE.slice(1).map(escapeHtml).join("<br>")}</p>
    </td></tr>
  </table>
</div>`;

  const text = [
    `Hallo ${first}`,
    "",
    P_THANKS,
    "",
    P_WELCOME,
    "",
    P_INVOICE_HINT,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    P_CLOSING,
    "",
    ...SIGNATURE,
  ].join("\n");

  return { subject: `Danke für deine Unterstützung, ${first}`, html, text };
}

/** Dank-Mail bei Bezahlt (ohne Anhang, ohne Zahlungsdaten). */
export function paidMailContent(row: GoennerMailRow): MailContent {
  const first = firstName(row.name);
  const html = `
<div style="background:#f1efea;padding:24px 12px;font-family:Georgia,'Playfair Display','Times New Roman',serif;color:#0b0b0b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e4e1da;">
    <tr><td style="padding:28px 40px 22px;border-bottom:1px solid #e4e1da;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:46px;height:46px;background:#0b0b0b;color:#faf9f6;text-align:center;font-weight:700;font-size:17px;">MG</td>
        <td style="padding-left:14px;font-size:16px;font-weight:700;">Mauro Gilardi<br><span style="font-size:12px;font-weight:400;color:#66625b;">SwissPGA Professional</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:30px 40px 34px;font-size:16px;line-height:1.55;">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#d71920;margin-bottom:14px;">Danke</div>
      <p style="margin:0 0 14px;">Hallo ${escapeHtml(first)}</p>
      <p style="margin:0 0 14px;">${escapeHtml(P_THANKS)}</p>
      <p style="margin:0 0 14px;">${escapeHtml(P_WELCOME)}</p>
      <div style="border:1px solid #e4e1da;background:#faf9f6;padding:16px 20px;margin:22px 0 6px;font-size:14px;">${escapeHtml(P_PAID)}</div>
      <p style="margin:22px 0 0;">${escapeHtml(P_CLOSING)}</p>
      <p style="margin:14px 0 0;font-weight:700;">${escapeHtml(SIGNATURE[0])}</p>
      <p style="margin:0;font-size:13px;color:#66625b;line-height:1.5;">${SIGNATURE.slice(1).map(escapeHtml).join("<br>")}</p>
    </td></tr>
  </table>
</div>`;

  const text = [
    `Hallo ${first}`,
    "",
    P_THANKS,
    "",
    P_WELCOME,
    "",
    P_PAID,
    "",
    P_CLOSING,
    "",
    ...SIGNATURE,
  ].join("\n");

  return { subject: `Danke für deine Unterstützung, ${first}`, html, text };
}

async function sendMail(input: CreateEmailOptions): Promise<void> {
  const resend = createResendClient();
  const { error } = await resend.emails.send(input);
  if (error) throw new Error(error.message);
}

/** Rechnungs-Mail mit QR-Code (Inline-Bild). */
export async function sendInvoiceMail(row: GoennerMailRow): Promise<void> {
  const content = invoiceMailContent(row);
  const qr = await buildInvoiceQrPng(row);
  await sendMail({
    from: readEnv("RESEND_FROM_EMAIL"),
    to: [row.email],
    replyTo: process.env.GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL?.trim() || undefined,
    subject: content.subject,
    html: content.html,
    text: content.text,
    attachments: [{ filename: "zahlteil-qr.png", content: qr, contentType: "image/png", contentId: QR_CID }],
  });
}

/** Dank-Mail bei Bezahlt (ohne Zahlungsdaten). */
export async function sendPaidMail(row: GoennerMailRow): Promise<void> {
  const content = paidMailContent(row);
  await sendMail({
    from: readEnv("RESEND_FROM_EMAIL"),
    to: [row.email],
    replyTo: process.env.GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL?.trim() || undefined,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/** Erinnerung an dich, wenn eine Rechnung nach 30 Tagen noch offen ist. */
export async function sendAdminReminder(row: GoennerMailRow & { invoice_mail_sent_at: string | null }): Promise<void> {
  const to = process.env.GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL?.trim();
  if (!to) throw new Error("GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL ist nicht gesetzt.");
  const sent = row.invoice_mail_sent_at ? new Date(row.invoice_mail_sent_at).toLocaleDateString("de-CH") : "-";
  await sendMail({
    from: readEnv("RESEND_FROM_EMAIL"),
    to: [to],
    subject: `Erinnerung: Rechnung ${row.invoice_number} noch offen`,
    text: [
      `Die Rechnung ${row.invoice_number} ist seit 30 Tagen offen.`,
      "",
      `Gönner: ${row.name}`,
      `E-Mail: ${row.email}`,
      `Modell: ${tierTitle(row.membership_id)} (CHF ${membershipPriceChf(row.membership_id).toFixed(2)})`,
      `Rechnung versendet am: ${sent}`,
      "",
      "Admin: https://www.maurogilardi.ch/admin/goenner/inbox",
    ].join("\n"),
  });
}
