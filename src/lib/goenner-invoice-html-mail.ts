import { variantTexts, type RechnungsArt, type RechnungsStatus } from "@/lib/goenner-mail-variants";
import { readFileSync } from "fs";
import path from "path";
import { inquiryTierShort } from "@/content/goennerMemberships";
import { invoicePurpose, mailAmountChf } from "@/lib/goenner-mails";
import { readInvoiceBankConfig } from "@/lib/invoice-config";

/**
 * Gestaltete Rechnungs-Mail als HTML (mit Text-Alternative) und PDF im Anhang.
 * Entsteht als .eml-Entwurf: Ein Doppelklick öffnet sie in Outlook, Thunderbird oder Apple Mail.
 * Versendet wird nichts. Schlicht, linksbündig, mit feinen Linien statt Boxen.
 */

const C = {
  ink: "#111111",
  ink2: "#3d3d3d",
  muted: "#8a8a85",
  hair: "#ebeae6",
  red: "#d71920",
  white: "#ffffff",
};

const SERIF = `Georgia, 'Times New Roman', serif`;
const SANS = `Helvetica, Arial, 'Liberation Sans', sans-serif`;
const MONO = `Consolas, 'Courier New', monospace`;

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

type MailData = {
  first: string;
  season: number;
  membership: string;
  amount: string;
  invoiceNumber: string;
  purpose: string;
  bank: { creditorName: string; street: string; cityLine: string; iban: string };
  intro: string;
  body: string;
};

function line(label: string, value: string): string {
  return `<tr>
  <td valign="top" width="128" style="padding:11px 16px 11px 0;border-top:1px solid ${C.hair};font-family:${SANS};font-size:13px;color:${C.muted};">${label}</td>
  <td valign="top" style="padding:11px 0;border-top:1px solid ${C.hair};font-family:${SANS};font-size:14px;line-height:1.55;color:${C.ink};">${value}</td>
</tr>`;
}

function renderHtml(d: MailData): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Danke für deine Unterstützung, ${esc(d.first)}</title>
</head>
<body style="margin:0;padding:0;background:${C.white};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">Die Rechnung als PDF ist angehängt.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.white};">
<tr><td style="padding:36px 28px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

<tr><td style="padding:0 0 22px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td valign="middle" align="left"><img src="cid:mg-logo" alt="Mauro Gilardi Golf" height="40" style="display:block;height:40px;width:auto;border:0;"></td>
    <td valign="middle" align="right" style="font-family:${SANS};font-size:12px;color:${C.muted};">Rechnung ${esc(d.invoiceNumber)}</td>
  </tr></table>
  <div style="height:2px;width:48px;background:${C.red};margin-top:24px;"></div>
</td></tr>

<tr><td align="left" style="padding:0 0 12px 0;">
  <h1 style="margin:0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:700;color:${C.ink};">Danke, ${esc(d.first)}.</h1>
</td></tr>

<tr><td align="left" style="padding:0 0 30px 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink2};">
  ${esc(d.intro)}
</td></tr>

<tr><td align="left" style="padding:0;">
  <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.muted};margin-bottom:6px;">Zahlung · Saison ${d.season}</div>
  <div style="font-family:${SERIF};font-size:34px;font-weight:700;letter-spacing:-0.01em;color:${C.ink};">${esc(d.amount)}</div>
  <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin-top:4px;">${esc(d.membership)} · Banküberweisung</div>
</td></tr>

<tr><td style="padding:22px 0 0 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid ${C.hair};">
    ${line("Zahlbar an", `${esc(d.bank.creditorName)}<br>${esc(d.bank.street)}<br>${esc(d.bank.cityLine)}`)}
    ${line("IBAN", `<span style="font-family:${MONO};font-size:14px;font-weight:700;letter-spacing:0.02em;">${esc(d.bank.iban)}</span>`)}
    ${line("Zahlungszweck", `<span style="color:${C.red};font-weight:700;">${esc(d.purpose)}</span>`)}
  </table>
</td></tr>

<tr><td align="left" style="padding:28px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink2};">
  ${esc(d.body)}
</td></tr>

<tr><td align="left" style="padding:22px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink2};">
  Herzlichen Dank für deinen Support.<br>
  <span style="color:${C.ink};">Mauro</span>
</td></tr>

<tr><td style="padding:40px 0 0 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.hair};"><tr>
    <td valign="top" style="padding:18px 0 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">
      <span style="font-size:13px;font-weight:700;color:${C.ink};">Mauro Gilardi</span> · SwissPGA Professional<br>
      Bleikenstrasse 6d · 9630 Wattwil<br>
      <a href="tel:+41766751199" style="color:${C.muted};text-decoration:none;">+41 76 675 11 99</a> ·
      <a href="mailto:mauro.gilardi@hotmail.com" style="color:${C.muted};text-decoration:none;">mauro.gilardi@hotmail.com</a> ·
      <a href="https://www.maurogilardi.ch" style="color:${C.red};text-decoration:none;">maurogilardi.ch</a>
    </td>
  </tr></table>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function renderText(d: MailData): string {
  return [
    `Danke, ${d.first}.`,
    "",
    d.intro,
    "",
    `Zahlung · Saison ${d.season}`,
    `Betrag: ${d.amount}`,
    `Zahlbar an: ${d.bank.creditorName}, ${d.bank.street}, ${d.bank.cityLine}`,
    `IBAN: ${d.bank.iban}`,
    `Zahlungszweck: ${d.purpose}`,
    "",
    d.body,
    "",
    "Herzlichen Dank für deinen Support.",
    "Mauro",
    "",
    "Mauro Gilardi · SwissPGA Professional",
    "Bleikenstrasse 6d · 9630 Wattwil",
    "+41 76 675 11 99 · mauro.gilardi@hotmail.com",
    "maurogilardi.ch",
  ].join("\n");
}

const wrap76 = (b64: string) => b64.match(/.{1,76}/g)?.join("\r\n") ?? "";
const encodeHeader = (v: string) =>
  /^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${Buffer.from(v, "utf8").toString("base64")}?=`;

/** .eml mit HTML + Text-Alternative, eingebettetem Logo und PDF-Anhang für die gewählte Saison. */
export async function buildGoennerInvoiceHtmlEml(
  row: {
    id: string;
    name: string;
    email: string;
    membership_id: string;
    invoice_number: string | null;
    amount_chf?: number | null;
    street?: string | null;
    postal_code?: string | null;
    city?: string | null;
  },
  season: number,
  variant: { art: RechnungsArt; status: RechnungsStatus } = { art: "goenner", status: "neu" },
): Promise<{ buffer: Buffer; filename: string }> {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");

  // Chromium nur laden, wenn die PDF wirklich gebraucht wird
  const { buildGoennerInvoicePdf } = await import("@/lib/goenner-invoice-pdf");
  const { buffer: pdf } = await buildGoennerInvoicePdf(
    {
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
    },
    season,
    variant,
  );

  const invoiceNumber = row.invoice_number ?? row.id;
  const texts = variantTexts({
    art: variant.art,
    status: variant.status,
    season,
    first: firstName(row.name),
    tier: inquiryTierShort(row.membership_id),
  });
  const data: MailData = {
    first: firstName(row.name),
    season,
    membership: texts.itemTitle,
    amount: chfAmount(mailAmountChf(row)),
    invoiceNumber,
    purpose: invoicePurpose({ ...row, invoice_number: row.invoice_number }),
    bank: {
      creditorName: bank.creditorName,
      street: bank.creditorStreet,
      cityLine: `${bank.creditorPostalCode} ${bank.creditorCity}`,
      iban: formatIban(bank.iban),
    },
    intro: texts.intro,
    body: texts.body,
  };

  const html = renderHtml(data).replace(/\r?\n/g, "\r\n");
  const text = renderText(data).replace(/\r?\n/g, "\r\n");
  const logo = readFileSync(path.join(process.cwd(), "public", "brand-assets", "logos", "mg-mail-logo.png"));
  const pdfName = `Rechnung-${invoiceNumber}-${season}.pdf`;
  const subject = texts.subject;

  const stamp = Date.now().toString(36);
  const m = `mg-${stamp}`;
  const alt = `mg-alt-${stamp}`;
  const rel = `mg-rel-${stamp}`;
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
    'Content-Type: image/png; name="mg-logo.png"',
    "Content-Transfer-Encoding: base64",
    "Content-ID: <mg-logo>",
    'Content-Disposition: inline; filename="mg-logo.png"',
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
    filename: `Entwurf-${invoiceNumber}-${season}.eml`,
  };
}
