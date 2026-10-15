import type { CreateEmailOptions } from "resend";
import { readEnv } from "@/lib/env";
import { createResendClient } from "@/lib/resend";
import { eventDateLabel, inviteLink, type InviteKind, type TournamentInviteRow, type TournamentRow } from "@/lib/tournament";

const SIGNATURE = ["Mauro Gilardi", "SwissPGA Professional", "maurogilardi.ch", "Bleikenstrasse 6d, 9630 Wattwil"];

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function inviteUrl(token: string) {
  return inviteLink(token);
}

function shell(kicker: string, bodyHtml: string) {
  return `
<div style="background:#f3f4f5;padding:24px 12px;font-family:Georgia,'Times New Roman',serif;color:#121314;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3e5e8;">
    <tr><td style="padding:28px 40px 22px;border-bottom:1px solid #e3e5e8;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:46px;height:46px;background:#121314;color:#f7f6f3;text-align:center;font-weight:700;font-size:17px;">MG</td>
        <td style="padding-left:14px;font-size:16px;font-weight:700;">Mauro Gilardi<br><span style="font-size:12px;font-weight:400;color:#5c6168;">SwissPGA Professional</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:30px 40px 34px;font-size:16px;line-height:1.55;">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#d71920;margin-bottom:14px;">${escapeHtml(kicker)}</div>
      ${bodyHtml}
      <p style="margin:22px 0 0;font-weight:700;">${escapeHtml(SIGNATURE[0])}</p>
      <p style="margin:0;font-size:13px;color:#5c6168;line-height:1.5;">${SIGNATURE.slice(1).map(escapeHtml).join("<br>")}</p>
    </td></tr>
  </table>
</div>`;
}

function dayLines(tournament: TournamentRow, kind: InviteKind) {
  const lines = [
    ...(kind === "clinic" ? [`Golfklinik, ${tournament.clinic_time}`] : []),
    `Golfrunde (Scramble), erstes Flight ca. ${tournament.first_flight_time}. Ich spiele mit jedem Flight ein bis zwei Löcher mit.`,
    `Abendessen im Clubhaus ab ${tournament.dinner_time}, mit einer kurzen Saisonrückschau, dem Ausblick und einer Fragerunde.`,
  ];
  return lines;
}

export function invitationMail(tournament: TournamentRow, invite: Pick<TournamentInviteRow, "name" | "token" | "kind">) {
  const first = firstName(invite.name);
  const when = `${eventDateLabel(tournament.event_date)}, ${tournament.place}`;
  const url = inviteUrl(invite.token);
  const lines = dayLines(tournament, invite.kind);
  const list = lines.map((line) => `<li style="margin:0 0 8px;">${escapeHtml(line)}</li>`).join("");
  const html = shell(
    "Gönnerturnier",
    `
      <p style="margin:0 0 14px;">Hallo ${escapeHtml(first)}</p>
      <p style="margin:0 0 14px;">ich lade dich ein zum ${escapeHtml(tournament.title)} am ${escapeHtml(when)}.</p>
      <ul style="margin:0 0 14px;padding-left:18px;">${list}</ul>
      <p style="margin:0 0 18px;">Über deinen persönlichen Link wählst du, bei welchen Teilen du dabei bist. Name und E-Mail sind schon ausgefüllt.</p>
      <a href="${url}" style="display:inline-block;background:#121314;color:#f7f6f3;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">Anmeldung öffnen</a>
      <p style="margin:14px 0 0;font-size:13px;color:#5c6168;">Der Link gilt nur für dich. Bitte leite ihn nicht weiter.</p>
    `,
  );
  const text = [
    `Hallo ${first}`,
    "",
    `ich lade dich ein zum ${tournament.title} am ${when}.`,
    "",
    ...lines.map((line) => `- ${line}`),
    "",
    "Über deinen persönlichen Link wählst du, bei welchen Teilen du dabei bist. Name und E-Mail sind schon ausgefüllt.",
    url,
    "",
    "Der Link gilt nur für dich. Bitte leite ihn nicht weiter.",
    "",
    ...SIGNATURE,
  ].join("\n");
  return { subject: `Einladung ${tournament.title}`, html, text };
}

export function confirmationMail(
  tournament: TournamentRow,
  invite: Pick<TournamentInviteRow, "name" | "token" | "kind" | "clinic" | "golf_round" | "dinner">,
) {
  const first = firstName(invite.name);
  const when = `${eventDateLabel(tournament.event_date)}, ${tournament.place}`;
  const url = inviteUrl(invite.token);
  const parts = [
    invite.kind === "clinic" && invite.clinic ? `Golfklinik, ${tournament.clinic_time}` : null,
    invite.golf_round ? `Golfrunde, erstes Flight ca. ${tournament.first_flight_time}` : null,
    invite.dinner ? `Abendessen ab ${tournament.dinner_time}` : null,
  ].filter((line): line is string => Boolean(line));
  const coming = parts.length > 0;
  const list = parts.map((line) => `<li style="margin:0 0 8px;">${escapeHtml(line)}</li>`).join("");
  const html = shell(
    coming ? "Du bist angemeldet" : "Anmeldung",
    `
      <p style="margin:0 0 14px;">Hallo ${escapeHtml(first)}</p>
      ${
        coming
          ? `<p style="margin:0 0 14px;">danke, ich habe deine Anmeldung für den ${escapeHtml(when)}.</p>
             <ul style="margin:0 0 14px;padding-left:18px;">${list}</ul>`
          : `<p style="margin:0 0 14px;">schade, dass es dieses Jahr nicht klappt. Danke, dass du mir Bescheid gibst.</p>`
      }
      <p style="margin:0 0 18px;">Wenn sich etwas ändert, öffnest du denselben Link noch einmal und speicherst neu.</p>
      <a href="${url}" style="display:inline-block;background:#121314;color:#f7f6f3;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">Anmeldung ansehen</a>
    `,
  );
  const text = [
    `Hallo ${first}`,
    "",
    coming
      ? `danke, ich habe deine Anmeldung für den ${when}.`
      : "schade, dass es dieses Jahr nicht klappt. Danke, dass du mir Bescheid gibst.",
    "",
    ...parts.map((line) => `- ${line}`),
    "",
    "Wenn sich etwas ändert, öffnest du denselben Link noch einmal und speicherst neu.",
    url,
    "",
    ...SIGNATURE,
  ].join("\n");
  return { subject: coming ? `Anmeldung ${tournament.title}` : `Absage ${tournament.title}`, html, text };
}

async function send(input: CreateEmailOptions) {
  const resend = createResendClient();
  const { error } = await resend.emails.send(input);
  if (error) throw new Error(error.message);
}

function envelope(to: string, subject: string, html: string, text: string): CreateEmailOptions {
  return {
    from: readEnv("RESEND_FROM_EMAIL"),
    to: [to],
    replyTo: process.env.GOENNER_INQUIRY_ADMIN_NOTIFY_EMAIL?.trim() || undefined,
    subject,
    html,
    text,
  };
}

export function reminderMail(
  tournament: TournamentRow,
  invite: Pick<TournamentInviteRow, "name" | "token" | "kind" | "responded_at">,
) {
  const first = firstName(invite.name);
  const when = `${eventDateLabel(tournament.event_date)}, ${tournament.place}`;
  const url = inviteUrl(invite.token);
  const waiting = !invite.responded_at;
  const html = shell(
    "Erinnerung",
    `
      <p style="margin:0 0 14px;">Hallo ${escapeHtml(first)}</p>
      <p style="margin:0 0 14px;">kurzer Reminder zum ${escapeHtml(tournament.title)} am ${escapeHtml(when)}.</p>
      <p style="margin:0 0 18px;">${
        waiting
          ? "Ich habe noch keine Rückmeldung. Über denselben Link sagst du mir, wobei du dabei bist. Name und E-Mail sind schon ausgefüllt."
          : "Wenn sich bei dir noch etwas ändert, öffnest du denselben Link und speicherst neu."
      }</p>
      <a href="${url}" style="display:inline-block;background:#121314;color:#f7f6f3;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">Anmeldung öffnen</a>
    `,
  );
  const text = [
    `Hallo ${first}`,
    "",
    `kurzer Reminder zum ${tournament.title} am ${when}.`,
    "",
    waiting
      ? "Ich habe noch keine Rückmeldung. Über denselben Link sagst du mir, wobei du dabei bist. Name und E-Mail sind schon ausgefüllt."
      : "Wenn sich bei dir noch etwas ändert, öffnest du denselben Link und speicherst neu.",
    url,
    "",
    ...SIGNATURE,
  ].join("\n");
  return { subject: `Erinnerung ${tournament.title}`, html, text };
}

export async function sendInvitationMail(tournament: TournamentRow, invite: TournamentInviteRow) {
  const content = invitationMail(tournament, invite);
  await send(envelope(invite.email, content.subject, content.html, content.text));
}

export async function sendConfirmationMail(tournament: TournamentRow, invite: TournamentInviteRow) {
  const content = confirmationMail(tournament, invite);
  await send(envelope(invite.email, content.subject, content.html, content.text));
}

export async function sendReminderMail(tournament: TournamentRow, invite: TournamentInviteRow) {
  const content = reminderMail(tournament, invite);
  await send(envelope(invite.email, content.subject, content.html, content.text));
}
