/**
 * Rechnung im Admin: lädt den gestalteten Mail-Entwurf (.eml) herunter.
 * Er enthält HTML-Mail, Zahlungsdaten und die PDF-Rechnung im Anhang.
 * Ein Doppelklick öffnet ihn als Entwurf im Mailprogramm. Versendet wird nichts.
 */
export async function openInvoiceMail(params: { mailUrl: string }): Promise<void> {
  const res = await fetch(params.mailUrl, { cache: "no-store" });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(typeof data.error === "string" ? data.error : "Mail-Entwurf konnte nicht erstellt werden.");
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : "Entwurf.eml";

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
