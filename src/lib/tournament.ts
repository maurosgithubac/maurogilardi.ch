import type { GoennerMemberRow } from "@/lib/goenner-finance";
import { SITE_URL } from "@/lib/seo/constants";

/** Ohne i, l, o — am Telefon vorlesbar. 10 Zeichen, damit der persönliche Link nicht erraten wird. */
const TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz";
const TOKEN_LENGTH = 10;

export type TournamentStatus = "open" | "closed";
export type InviteKind = "clinic" | "round";

export type TournamentRow = {
  id: string;
  title: string;
  event_date: string;
  place: string;
  clinic_time: string;
  first_flight_time: string;
  dinner_time: string;
  intro: string | null;
  status: TournamentStatus;
  created_at: string;
  updated_at: string;
};

export type TournamentInviteRow = {
  id: string;
  tournament_id: string;
  member_id: string | null;
  kind: InviteKind;
  token: string;
  name: string;
  email: string;
  clinic: boolean | null;
  golf_round: boolean | null;
  dinner: boolean | null;
  note: string | null;
  invited_at: string | null;
  responded_at: string | null;
  /** Gesetzt nach einem Reminder. Fehlt, solange Migration 024 nicht gelaufen ist. */
  reminded_at?: string | null;
  created_at: string;
  updated_at: string;
};

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function eventDateLabel(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day}. ${MONTHS[month - 1]} ${year}`;
}

export function newInviteToken() {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => TOKEN_ALPHABET[b % TOKEN_ALPHABET.length]).join("");
}

export function isInviteToken(value: string) {
  return new RegExp(`^[${TOKEN_ALPHABET}]{${TOKEN_LENGTH}}$`).test(value);
}

export function inviteLink(token: string) {
  return `${SITE_URL}/e/${token}`;
}

/** Datum und Uhrzeit in Europe/Zurich, ohne toLocaleString (Hydration). */
export function zurichStamp(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}, ${get("hour")}:${get("minute")}`;
}

/** 100er Club ist am Gönnerturnier nicht dabei. */
export function isHundertMember(member: Pick<GoennerMemberRow, "membership_id">) {
  return member.membership_id === "hundert";
}
