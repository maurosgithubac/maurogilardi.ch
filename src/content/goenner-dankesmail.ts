/**
 * Persönliche Dankesnachricht zur Gönner-Rechnung (Entwurf in Outlook).
 * Wird im Admin als .eml-Entwurf mit der Rechnung im Anhang erzeugt.
 */
export function goennerDankesmail(params: { name: string; membershipLabel: string }): {
  subject: string;
  body: string;
} {
  const first = params.name.trim().split(/\s+/)[0] || "";
  const subject = `Danke für deine Unterstützung, ${first}`;
  const body = [
    `Hallo ${first},`,
    "",
    "herzlichen Dank für deine Unterstützung! Es bedeutet mir wirklich sehr viel, dass du mich als Gönner auf meinem Weg auf die DP World Tour begleitest. Menschen wie dich machen diesen Weg möglich, und dafür bin ich sehr dankbar.",
    "",
    `Im Anhang findest du die Rechnung für deine Gönner-Mitgliedschaft ${params.membershipLabel} (Saison 2027). Die Zahlungsdaten und der QR-Code sind bereits eingetragen.`,
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
  return { subject, body };
}
