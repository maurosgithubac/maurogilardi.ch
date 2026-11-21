import { inquiryTierShort } from "@/content/goennerMemberships";
import { invoicePurpose, mailAmountChf } from "@/lib/goenner-mails";
import { readInvoiceBankConfig } from "@/lib/invoice-config";

/** Betrag im Schweizer Format, z. B. CHF 1’000.00 */
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

/**
 * Text für den Mail-Entwurf zur Rechnung: Dank, Zahlungsdaten als Übersicht, Verabschiedung.
 * Die PDF wird separat heruntergeladen und vom Admin an die Mail angehängt.
 */
export function buildGoennerInvoiceMailText(season: number, row: {
  membership_id: string;
  name: string;
  email: string;
  invoice_number: string | null;
  amount_chf?: number | null;
}): { to: string; subject: string; body: string } {
  const bank = readInvoiceBankConfig();
  if (!bank) throw new Error("INVOICE_QR_IBAN ist nicht gesetzt.");

  const first = firstName(row.name);
  const amount = chfAmount(mailAmountChf(row));
  const purpose = invoicePurpose({ ...row, invoice_number: row.invoice_number });
  const membership = `MG-${inquiryTierShort(row.membership_id)}`;

  const body = [
    `Hallo ${first},`,
    "",
    "herzlichen Dank für deine Unterstützung! Es bedeutet mir wirklich sehr viel, dass du mich als Gönner auf meinem Weg auf die DP World Tour begleitest. Menschen wie dich machen diesen Weg möglich, und dafür bin ich sehr dankbar.",
    "",
    "Die Rechnung als PDF hängt dieser Mail an. Hier die Zahlungsdaten im Überblick:",
    "",
    `Gönner-Mitgliedschaft: ${membership}, Saison ${season}`,
    `Betrag: ${amount}`,
    `Zahlbar an: ${bank.creditorName}, ${bank.creditorStreet}, ${bank.creditorPostalCode} ${bank.creditorCity}`,
    `IBAN: ${formatIban(bank.iban)}`,
    `Zahlungszweck: ${purpose}`,
    "",
    "Ich freue mich sehr, dich bald mal auf dem Golfplatz oder an meinem Gönnerturnier in Domat/Ems wiederzusehen.",
    "",
    "Nochmals ganz herzlichen Dank für deinen Support.",
    "",
    "Liebe Grüsse",
    "Mauro",
    "",
    "Mauro Gilardi | SwissPGA Professional",
    "maurogilardi.ch",
  ].join("\n");

  return {
    to: row.email,
    subject: `Danke für deine Unterstützung, ${first}`,
    body,
  };
}

/** Saison aus ?year=… lesen. Erlaubt: vorjähriges, laufendes und kommendes Jahr. Standard: laufendes Jahr. */
export function parseSeason(url: string): number {
  const current = new Date().getFullYear();
  const raw = Number(new URL(url).searchParams.get("year"));
  return raw >= current - 1 && raw <= current + 1 ? raw : current;
}

/** Jahre für die Auswahl: vorjähriges, laufendes und kommendes Jahr. */
export function seasonOptions(): number[] {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
}
