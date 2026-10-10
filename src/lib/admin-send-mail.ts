export type StandardMailType = "rechnung" | "twint";

export const STANDARD_MAIL_LABEL: Record<StandardMailType, string> = {
  rechnung: "Rechnungs-Mail (Bank + QR-Code)",
  twint: "TWINT-Mail (Paylink + Bank-Alternative)",
};

/** Fragt nach und sendet die Standard-Mail. Gibt eine Erfolgsmeldung zurück oder wirft mit der Fehlermeldung. */
export async function sendStandardMail(input: {
  source: "inquiry" | "member";
  id: string;
  type: StandardMailType;
  name: string;
  email: string | null;
}): Promise<string | null> {
  const ok = window.confirm(
    `${STANDARD_MAIL_LABEL[input.type]} an «${input.name}» senden?\n\nEmpfänger: ${input.email || "—"}`,
  );
  if (!ok) return null;
  const res = await fetch("/api/admin/goenner-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: input.source, id: input.id, type: input.type }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
  if (!res.ok) throw new Error(data.error || "Mail konnte nicht gesendet werden.");
  return `${input.type === "rechnung" ? "Rechnungs-Mail" : "TWINT-Mail"} an ${data.email ?? input.email} gesendet.`;
}
