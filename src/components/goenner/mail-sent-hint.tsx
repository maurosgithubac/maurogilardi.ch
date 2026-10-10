export const MAIL_SENDER = "no-reply@maurogilardi.ch";

export function MailSentHint({ className = "mg-modal__hint" }: { className?: string }) {
  return (
    <p className={className}>
      Keine E-Mail erhalten? Schau bitte auch im Spam- oder Werbe-Ordner nach — die Nachricht kommt von{" "}
      <strong>{MAIL_SENDER}</strong>, einer Adresse, die dein Postfach vermutlich noch nicht kennt.
    </p>
  );
}
