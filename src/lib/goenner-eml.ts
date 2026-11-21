import { inquiryTierShort } from "@/content/goennerMemberships";
import { goennerDankesmail } from "@/content/goenner-dankesmail";
import { receiptMailContent } from "@/lib/goenner-mails";
import type { InvoicePdfRow } from "@/lib/goenner-invoice-pdf";

/** Header-Werte nur ASCII; Umlaute als RFC-2047 kodieren. */
function encodeHeader(value: string): string {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function wrap76(base64: string): string {
  return base64.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

/**
 * Erzeugt eine .eml-Datei mit X-Unsent-Header: Outlook öffnet sie als Entwurf.
 * Versendet wird nichts. Optional mit Anhang.
 */
function buildEml(params: {
  to: string;
  subject: string;
  text: string;
  attachment?: { name: string; data: Buffer; type: string };
}): Buffer {
  const text = params.text.replace(/\r?\n/g, "\r\n");
  const head = [
    "MIME-Version: 1.0",
    "X-Unsent: 1",
    `To: ${params.to}`,
    `Subject: ${encodeHeader(params.subject)}`,
  ];

  if (!params.attachment) {
    const lines = [
      ...head,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      wrap76(Buffer.from(text, "utf8").toString("base64")),
      "",
    ];
    return Buffer.from(lines.join("\r\n"), "utf8");
  }

  const boundary = `mg-${Date.now().toString(36)}`;
  const { name, data, type } = params.attachment;
  const lines = [
    ...head,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(Buffer.from(text, "utf8").toString("base64")),
    `--${boundary}`,
    `Content-Type: ${type}; name="${name}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${name}"`,
    "",
    wrap76(data.toString("base64")),
    `--${boundary}--`,
    "",
  ];
  return Buffer.from(lines.join("\r\n"), "utf8");
}

/** Rechnung als Mail-Entwurf: Dankesnachricht und PDF im Anhang. */
export async function buildGoennerInvoiceEml(row: InvoicePdfRow): Promise<{ buffer: Buffer; filename: string }> {
  // Chromium nur laden, wenn wirklich eine PDF gebraucht wird
  const { buildGoennerInvoicePdf } = await import("@/lib/goenner-invoice-pdf");
  const { buffer: pdf } = await buildGoennerInvoicePdf(row);
  const invoiceNumber = row.invoice_number ?? row.id;
  const mail = goennerDankesmail({
    name: row.name,
    membershipLabel: `MG-${inquiryTierShort(row.membership_id)}`,
  });
  return {
    buffer: buildEml({
      to: row.email,
      subject: mail.subject,
      text: mail.body,
      attachment: { name: `Rechnung-${invoiceNumber}.pdf`, data: pdf, type: "application/pdf" },
    }),
    filename: `Entwurf-${invoiceNumber}.eml`,
  };
}

/** TWINT-Mail als Entwurf (ohne Anhang): Zahlungslink und Betrag, wie die bisherige TWINT-Mail. */
export function buildGoennerTwintEml(row: {
  membership_id: string;
  name: string;
  email: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  amount_chf?: number | null;
}): { buffer: Buffer; filename: string } {
  const mail = receiptMailContent({
    membership_id: row.membership_id,
    name: row.name,
    email: row.email,
    phone: null,
    street: row.street,
    postal_code: row.postal_code,
    city: row.city,
    payment_method: "twint",
    message: null,
    amount_chf: row.amount_chf ?? null,
  });
  return {
    buffer: buildEml({ to: row.email, subject: mail.subject, text: mail.text }),
    filename: `TWINT-Entwurf-${row.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")}.eml`,
  };
}
