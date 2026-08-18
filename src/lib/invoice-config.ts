/**
 * Invoice / Rechnung config for Word export.
 * Fill bank fields when available — QR embeds automatically once IBAN is set.
 */
export type InvoiceBankConfig = {
  creditorName: string;
  creditorStreet: string;
  creditorPostalCode: string;
  creditorCity: string;
  creditorCountry: string;
  /** Swiss QR-IBAN preferred; classic IBAN also accepted for placeholder QR text */
  iban: string;
  additionalInfo?: string;
};

export function readInvoiceBankConfig(): InvoiceBankConfig | null {
  const creditorName = process.env.INVOICE_CREDITOR_NAME?.trim() || "Mauro Gilardi";
  const iban = process.env.INVOICE_QR_IBAN?.trim() || process.env.INVOICE_IBAN?.trim() || "";
  if (!iban) return null;

  return {
    creditorName,
    creditorStreet: process.env.INVOICE_CREDITOR_STREET?.trim() || "",
    creditorPostalCode: process.env.INVOICE_CREDITOR_ZIP?.trim() || "",
    creditorCity: process.env.INVOICE_CREDITOR_CITY?.trim() || "",
    creditorCountry: process.env.INVOICE_CREDITOR_COUNTRY?.trim() || "CH",
    iban: iban.replace(/\s+/g, "").toUpperCase(),
    additionalInfo: process.env.INVOICE_ADDITIONAL_INFO?.trim() || "Gönnerbeitrag Mauro Gilardi",
  };
}

/** Minimal Swiss QR-bill payload (SPC) for amount + creditor. */
export function buildSwissQrPayload(params: {
  bank: InvoiceBankConfig;
  amountChf: number;
  debtorName: string;
  debtorStreet?: string;
  debtorPostalCode?: string;
  debtorCity?: string;
  debtorCountry?: string;
  message?: string;
}): string {
  const amount = params.amountChf.toFixed(2);
  const lines = [
    "SPC",
    "0200",
    "1",
    params.bank.iban,
    "S",
    params.bank.creditorName.slice(0, 70),
    params.bank.creditorStreet.slice(0, 70),
    "",
    params.bank.creditorPostalCode.slice(0, 16),
    params.bank.creditorCity.slice(0, 35),
    params.bank.creditorCountry.slice(0, 2),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    amount,
    "CHF",
    "S",
    params.debtorName.slice(0, 70),
    (params.debtorStreet || "").slice(0, 70),
    "",
    (params.debtorPostalCode || "").slice(0, 16),
    (params.debtorCity || "").slice(0, 35),
    (params.debtorCountry || "CH").slice(0, 2),
    "NON",
    "",
    (params.message || params.bank.additionalInfo || "").slice(0, 140),
    "EPD",
  ];
  return lines.join("\n");
}
