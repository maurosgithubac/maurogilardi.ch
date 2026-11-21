import { readFileSync } from "fs";
import path from "path";
import { inquiryTierShort } from "@/content/goennerMemberships";
import { invoicePurpose, mailAmountChf } from "@/lib/goenner-mails";
import { readInvoiceBankConfig } from "@/lib/invoice-config";

/**
 * Gestaltete Rechnungs-Mail als HTML (mit Text-Alternative) und PDF im Anhang.
 * Entsteht als .eml-Entwurf: Ein Doppelklick öffnet sie in Outlook, Thunderbird oder Apple Mail.
 * Versendet wird nichts.
 */

const COLOR = {
  ink: "#111111",
  ink2: "#3a3a3a",
  muted: "#6b6b6b",
  hair: "#e4e1da",
  paper: "#f6f5f2",
  red: "#d71920",
  white: "#ffffff",
};

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function chfAmount(amount: number): string {
  const [int, dec] = amount.toFixed(2).split(".");
  return `CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, "’")}.${dec}`;
}

function formatIban(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "";
}

const SERIF = `Georgia, 'Times New Roman', serif`;
const SANS = `Helvetica, Arial, 'Liberation Sans', sans-serif`;

function renderHtml(d: {
  first: string;
  membership: string;
  amount: string;
  invoiceNumber: string;
  purpose: string;
  bank: { creditorName: string; street: string; cityLine: string; iban: string };
  intro: string;
}): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Danke für deine Unterstützung, ${esc(d.first)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.paper};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">Deine Rechnung als PDF ist angehängt, die Zahlungsdaten stehen darin.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.paper};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${COLOR.white};border-radius:16px;">

<tr><td style="padding:28px 32px 0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td valign="middle"><img src="cid:mg-logo" alt="Mauro Gilardi Golf" height="44" style="display:block;height:44px;width:auto;border:0;"></td>
    <td align="right" valign="middle" style="font-family:${SANS};font-size:12px;color:${COLOR.muted};line-height:1.4;">
      Rechnung ${esc(d.invoiceNumber)}
    </td>
  </tr>
  </table>
  <div style="height:3px;background:${COLOR.red};border-radius:2px;margin-top:22px;"></div>
</td></tr>

<tr><td style="padding:28px 32px 0 32px;">
  <h1 style="margin:0 0 14px 0;font-family:${SERIF};font-size:26px;line-height:1.25;font-weight:700;color:${COLOR.ink};">
    Danke für deine Unterstützung, ${esc(d.first)}.
  </h1>
  <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.65;color:${COLOR.ink2};">${esc(d.intro)}</p>
</td></tr>

<tr><td style="padding:24px 32px 0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.paper};border-radius:14px;">
  <tr><td style="padding:22px 22px 6px 22px;">
    <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${COLOR.muted};">Gönner-Mitgliedschaft · ${esc(d.membership)}</div>
    <div style="margin-top:8px;font-family:${SERIF};font-size:32px;font-weight:700;color:${COLOR.ink};letter-spacing:-0.01em;">${esc(d.amount)}</div>
    <div style="font-family:${SANS};font-size:13px;color:${COLOR.muted};margin-top:2px;">Saison 2027 · zahlbar per Banküberweisung</div>
  </td></tr>
  <tr><td style="padding:14px 22px 22px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLOR.hair};">
      ${row("Zahlbar an", `${esc(d.bank.creditorName)}<br>${esc(d.bank.street)}<br>${esc(d.bank.cityLine)}`)}
      ${row("IBAN", `<span style="font-family:Consolas,'Courier New',monospace;font-size:15px;font-weight:700;color:${COLOR.ink};letter-spacing:0.02em;">${esc(d.bank.iban)}</span>`)}
      ${row("Zahlungszweck", `<span style="color:${COLOR.red};font-weight:700;">${esc(d.purpose)}</span>`)}
    </table>
  </td></tr>
  </table>
</td></tr>

<tr><td style="padding:24px 32px 0 32px;font-family:${SANS};font-size:15px;line-height:1.65;color:${COLOR.ink2};">
  Die Rechnung als PDF hängt dieser Mail an. Ich freue mich sehr, dich bald mal auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems wiederzusehen.
</td></tr>

<tr><td style="padding:22px 32px 0 32px;font-family:${SANS};font-size:15px;line-height:1.65;color:${COLOR.ink2};">
  Nochmals ganz herzlichen Dank für deinen Support.<br><br>
  Liebe Grüsse<br>
  <span style="color:${COLOR.ink};font-weight:700;">Mauro</span>
</td></tr>

<tr><td style="padding:26px 32px 0 32px;">
  <div style="height:1px;background:${COLOR.hair};"></div>
</td></tr>

<tr><td style="padding:18px 32px 30px 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td valign="top" style="padding-right:16px;"><img src="cid:mg-logo" alt="" width="54" style="display:block;width:54px;height:auto;border:0;"></td>
    <td valign="top" style="font-family:${SANS};font-size:13px;line-height:1.55;color:${COLOR.muted};">
      <div style="font-size:14px;font-weight:700;color:${COLOR.ink};">Mauro Gilardi</div>
      SwissPGA Professional<br>
      Bleikenstrasse 6d · 9630 Wattwil<br>
      <a href="tel:+41766751199" style="color:${COLOR.muted};text-decoration:none;">+41 76 675 11 99</a> ·
      <a href="mailto:mauro.gilardi@hotmail.com" style="color:${COLOR.muted};text-decoration:none;">mauro.gilardi@hotmail.com</a><br>
      <a href="https://www.maurogilardi.ch" style="color:${COLOR.red};text-decoration:none;font-weight:700;">maurogilardi.ch</a>
    </td>
  </tr></table>
</td></tr>

</table>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td align="center" style="padding:14px 12px 0 12px;font-family:${SANS};font-size:11px;line-height:1.5;color:${COLOR.muted};">
  Gönner-Bedingungen: <a href="https://www.maurogilardi.ch/goenner-bedingungen" style="color:${COLOR.muted};">maurogilardi.ch/goenner-bedingungen</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
  <td valign="top" width="130" style="padding:12px 12px 0 0;font-family:${SANS};font-size:13px;color:${COLOR.muted};">${label}</td>
  <td valign="top" style="padding:12px 0 0 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${COLOR.ink};">${value}</td>
</tr>`;
}

function renderText(d: {
  first: string;
  membership: string;
  amount: string;
  purpose: string;
  bank: { creditorName: string; street: string; cityLine: string; iban: string };
  intro: string;
}): string {
  return [
    `Danke für deine Unterstützung, ${d.first}.`,
    "",
    d.intro,
    "",
    `Gönner-Mitgliedschaft: ${d.membership}, Saison 2027`,
    `Betrag: ${d.amount}`,
    `Zahlbar an: ${d.bank.creditorName}, ${d.bank.street}, ${d.bank.cityLine}`,
    `IBAN: ${d.bank.iban}`,
    `Zahlungszweck: ${d.purpose}`,
    "",
    "Die Rechnung als PDF hängt dieser Mail an. Ich freue mich sehr, dich bald mal auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems wiederzusehen.",
    "",
    "Nochmals ganz herzlichen Dank für deinen Support.",
    "",
    "Liebe Grüsse",
    "Mauro",
    "",
    "Mauro Gilardi | SwissPGA Professional",
    "Bleikenstrasse 6d · 9630 Wattwil",
    "+41 76 675 11 99 · mauro.gilardi@hotmail.com",
    "maurogilardi.ch",
  ].join("\n");
}

const wrap76 = (b64: string) => b64.match(/.{1,76}/g)?.join("\r\n") ?? "";
const encodeHeader = (v: string) =>
  /^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${Buffer.from(v, "utf8").toString("base64")}?=`;

/** .eml mit HTML + Text-Alternative, eingebettetem Logo und PDF-Anhang. */
export async function buildGoennerInvoiceHtmlEml(row: {
  id: string;
  name: string;
  email: string;
  membership_id: string;
  invoice_number: string | null;
  amount_chf?: number | null;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
}): Promise<{ buffer: Buffer; filename: string }> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");

  // Chromium nur laden, wenn die PDF wirklich gebraucht wird
  const { buildGoennerInvoicePdf } = await import("@/lib/goenner-invoice-pdf");
  const { buffer: pdf } = await buildGoennerInvoicePdf({
    id: row.id,
    membership_id: row.membership_id,
    name: row.name,
    email: row.email,
    street: row.street ?? null,
    postal_code: row.postal_code ?? null,
    city: row.city ?? null,
    payment_method: "rechnung",
    invoice_number: row.invoice_number,
    amount_chf: row.amount_chf ?? null,
    created_at: new Date().toISOString(),
  });

  const invoiceNumber = row.invoice_number ?? row.id;
  const d = {
    first: firstName(row.name),
    membership: `MG-${inquiryTierShort(row.membership_id)}`,
    amount: chfAmount(mailAmountChf(row)),
    invoiceNumber,
    purpose: invoicePurpose({ ...row, invoice_number: row.invoice_number }),
    bank: {
      creditorName: bank.creditorName,
      street: bank.creditorStreet,
      cityLine: `${bank.creditorPostalCode} ${bank.creditorCity}`,
      iban: formatIban(bank.iban),
    },
    intro: "Es bedeutet mir wirklich sehr viel, dass du mich als Gönner auf meinem Weg auf die DP World Tour begleitest. Menschen wie dich machen diesen Weg möglich.",
  };

  const html = renderHtml(d).replace(/\r?\n/g, "\r\n");
  const text = renderText(d).replace(/\r?\n/g, "\r\n");
  const logo = readFileSync(path.join(process.cwd(), "public", "brand-assets", "logos", "mg-mail-logo.png"));
  const pdfName = `Rechnung-${invoiceNumber}.pdf`;
  const subject = `Danke für deine Unterstützung, ${d.first}`;

  const m = `mg-${Date.now().toString(36)}`;
  const alt = `mg-alt-${Date.now().toString(36)}`;
  const rel = `mg-rel-${Date.now().toString(36)}`;
  const lines = [
    "MIME-Version: 1.0",
    "X-Unsent: 1",
    `To: ${row.email}`,
    `Subject: ${encodeHeader(subject)}`,
    `Content-Type: multipart/mixed; boundary="${m}"`,
    "",
    `--${m}`,
    `Content-Type: multipart/alternative; boundary="${alt}"`,
    "",
    `--${alt}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(Buffer.from(text, "utf8").toString("base64")),
    `--${alt}`,
    `Content-Type: multipart/related; boundary="${rel}"`,
    "",
    `--${rel}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(Buffer.from(html, "utf8").toString("base64")),
    `--${rel}`,
    "Content-Type: image/png; name=\"mg-logo.png\"",
    "Content-Transfer-Encoding: base64",
    "Content-ID: <mg-logo>",
    "Content-Disposition: inline; filename=\"mg-logo.png\"",
    "",
    wrap76(logo.toString("base64")),
    `--${rel}--`,
    `--${alt}--`,
    `--${m}`,
    `Content-Type: application/pdf; name="${pdfName}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${pdfName}"`,
    "",
    wrap76(pdf.toString("base64")),
    `--${m}--`,
    "",
  ];
  return {
    buffer: Buffer.from(lines.join("\r\n"), "utf8"),
    filename: `Entwurf-${invoiceNumber}.eml`,
  };
}
