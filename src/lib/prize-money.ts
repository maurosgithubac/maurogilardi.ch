import { parseAmountOrNull, parseDateOrNull } from "@/lib/goenner-finance";

/** Turnier-Preisgeld oder ProAm (Migration 021) */
export type PrizeKind = "prize" | "proam";

export const PRIZE_KINDS: { id: PrizeKind; label: string; plural: string }[] = [
  { id: "prize", label: "Preisgeld", plural: "Preisgelder" },
  { id: "proam", label: "ProAm", plural: "ProAms" },
];

/** Preisgelder aus Turnieren (Migration 020) — zählen zu den Saison-Einnahmen. */
export type PrizeMoneyRow = {
  id: string;
  /** Fehlt vor Migration 021 */
  kind?: PrizeKind | null;
  tournament: string;
  tour: string | null;
  event_date: string;
  year: number;
  placement: string | null;
  amount_chf: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

/** Touren für die Auswahl im Formular; freie Eingabe bleibt möglich. */
export const PRIZE_TOUR_SUGGESTIONS = ["ProGolf Tour", "HotelPlanner Tour", "Swiss PGA", "Alps Tour"];

/** Vor Migration 021 steht «ProAm» noch im Turniernamen */
export function prizeKindOf(row: Pick<PrizeMoneyRow, "kind" | "tournament">): PrizeKind {
  if (row.kind === "prize" || row.kind === "proam") return row.kind;
  return /pro-?am\s*$/i.test(row.tournament) ? "proam" : "prize";
}

export function isMissingTableError(message: string | undefined) {
  if (!message) return false;
  return message.includes("does not exist") || message.includes("schema cache") || message.includes("Could not find");
}

export function prizeMigrationHint(message: string | undefined) {
  return message?.includes("kind")
    ? "Spalte «Art» fehlt — in Supabase supabase/021_prize_money_kind.sql ausführen."
    : "Tabelle fehlt — in Supabase supabase/020_admin_inbox_seen_prize_money.sql ausführen.";
}

export type PrizeMoneyInput = Pick<
  PrizeMoneyRow,
  "tournament" | "tour" | "event_date" | "placement" | "amount_chf" | "note"
> & { kind: PrizeKind };

function text(raw: unknown, max: number): string | null {
  const t = String(raw ?? "").trim();
  return t ? t.slice(0, max) : null;
}

export function parsePrizeMoneyInput(body: Record<string, unknown>): PrizeMoneyInput | { error: string } {
  const tournament = text(body.tournament, 200);
  if (!tournament) return { error: "Turnier ist erforderlich." };

  const eventDate = parseDateOrNull(body.event_date);
  if (!eventDate || eventDate === "invalid") return { error: "Datum ist erforderlich." };

  const amount = parseAmountOrNull(body.amount_chf);
  if (amount === null || amount === "invalid") return { error: "Bitte einen gültigen Betrag in CHF angeben." };

  return {
    kind: body.kind === "proam" ? "proam" : "prize",
    tournament,
    tour: text(body.tour, 120),
    event_date: eventDate,
    placement: text(body.placement, 40),
    amount_chf: amount,
    note: text(body.note, 1000),
  };
}
