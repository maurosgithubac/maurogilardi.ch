import { inquiryTierShort } from "@/content/goennerMemberships";
import { goennerDankesmail } from "@/content/goenner-dankesmail";
import { buildGoennerInvoicePdf, type InvoicePdfRow } from "@/lib/goenner-invoice-pdf";

/** Header-Werte nur ASCII; Umlaute als RFC-2047 kodieren. */
function encodeHeader(value: string): string {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function wrap76(base64: string): string {
  return base64.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

/**
 * Erzeugt eine .eml-Datei mit X-Unsent-Header: Outlook öffnet sie als Entwurf
 * mit der Dankesnachricht und der Rechnung im Anhang. Versendet wird nichts.
 */
export async function buildGoennerInvoiceEml(row: InvoicePdfRow): Promise<{ buffer: Buffer; filename: string }> {
  const { buffer: pdf } = await buildGoennerInvoicePdf(row);
  const invoiceNumber = row.invoice_number ?? row.id;
  const pdfName = `Rechnung-${invoiceNumber}.pdf`;
  const mail = goennerDankesmail({
    name: row.name,
    membershipLabel: `MG-${inquiryTierShort(row.membership_id)}`,
  });

  const boundary = `mg-${Date.now().toString(36)}`;
  const text = mail.body.replace(/\r?\n/g, "\r\n");
  const lines = [
    "MIME-Version: 1.0",
    "X-Unsent: 1",
    `To: ${row.email}`,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(Buffer.from(text, "utf8").toString("base64")),
    `--${boundary}`,
    `Content-Type: application/pdf; name="${pdfName}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${pdfName}"`,
    "",
    wrap76(pdf.toString("base64")),
    `--${boundary}--`,
    "",
  ];
  return {
    buffer: Buffer.from(lines.join("\r\n"), "utf8"),
    filename: `Entwurf-${invoiceNumber}.eml`,
  };
}
