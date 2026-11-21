/**
 * Budget im Admin: Golf (Geschäft) und Privat getrennt.
 * Reine Daten und Hilfsfunktionen, ohne Server-Abhängigkeiten.
 */

export type BudgetScope = "golf" | "privat";

export type BudgetCategory = { id: string; label: string; icon: string; keywords: string[] };

export const GOLF_CATEGORIES: BudgetCategory[] = [
  { id: "turniere", label: "Turniere", icon: "🏌️", keywords: ["turnier", "tour", "open", "startgeld", "entry", "greenfee", "green fee"] },
  { id: "reisen", label: "Reisen", icon: "✈️", keywords: ["flug", "flight", "airline", "hotel", "booking", "reise", "bahn", "sbb", "mietwagen", "unterkunft"] },
  { id: "caddie", label: "Caddie", icon: "🎒", keywords: ["caddie", "caddy", "caddi"] },
  { id: "technik", label: "Technik & Material", icon: "🏷️", keywords: ["titleist", "callaway", "ping", "schläger", "ball", "bag", "equipment", "jlindeberg", "footjoy", "taylormade"] },
  { id: "abos", label: "Abos & Software", icon: "🔁", keywords: ["abo", "abonnement", "software", "google", "apple", "adobe", "canva", "notion", "hosting", "domain", "vercel", "supabase", "resend", "openai", "anthropic"] },
  { id: "coaching", label: "Coaching & Training", icon: "🎯", keywords: ["coach", "trainer", "training", "physio", "fitness", "lektion", "pro "] },
  { id: "club", label: "Club & Verband", icon: "⛳", keywords: ["club", "verband", "mitgliederbeitrag", "swiss golf", "swisspga", "lizenz"] },
  { id: "versicherung", label: "Versicherung", icon: "🛡️", keywords: ["versicherung", "axa", "helvetia", "mobiliar", "zurich", "allianz"] },
  { id: "sonst_golf", label: "Sonstiges Golf", icon: "📦", keywords: [] },
];

export const PRIVAT_CATEGORIES: BudgetCategory[] = [
  { id: "miete", label: "Miete", icon: "🏠", keywords: ["miete", "mietzins", "wohnung", "immobilien", "verwaltung"] },
  { id: "verpflegung", label: "Verpflegung", icon: "🍽️", keywords: ["migros", "coop", "denner", "aldi", "lidl", "restaurant", "bäcker", "volg", "lebensmittel", "pizza"] },
  { id: "strom", label: "Strom", icon: "⚡", keywords: ["strom", "ew ", "elektri", "energie"] },
  { id: "heizung", label: "Heizung", icon: "🔥", keywords: ["heizung", "heizöl", "gas", "wärme"] },
  { id: "internet", label: "Internet & Handy", icon: "📱", keywords: ["swisscom", "salt", "sunrise", "internet", "handy", "mobile"] },
  { id: "kreditkarte", label: "Kreditkarte", icon: "💳", keywords: ["kreditkarte", "visa", "mastercard", "cembra", "amex"] },
  { id: "moebel", label: "Möbel & Haushalt", icon: "🛋️", keywords: ["ikea", "möbel", "moebel", "brocki", "haushalt"] },
  { id: "versicherung_privat", label: "Versicherung", icon: "🛡️", keywords: ["krankenkasse", "helsana", "css", "sanitas", "versicherung"] },
  { id: "sonst_privat", label: "Sonstiges privat", icon: "📦", keywords: [] },
];

export function categoriesFor(scope: BudgetScope): BudgetCategory[] {
  return scope === "golf" ? GOLF_CATEGORIES : PRIVAT_CATEGORIES;
}

/** Kategorie aus der Buchungsbeschreibung vorschlagen. */
export function suggestCategory(description: string, scope: BudgetScope): string {
  const text = description.toLowerCase();
  const list = categoriesFor(scope);
  const hit = list.find((c) => c.keywords.some((k) => text.includes(k)));
  return hit ? hit.id : list[list.length - 1].id;
}

export type BudgetEntryRow = {
  id: string;
  entry_date: string; // YYYY-MM-DD
  amount_chf: number; // positiv = Ausgabe
  scope: BudgetScope;
  category: string;
  label: string;
};

/** Betrag im Schweizer Format ohne Währungszeichen. */
export function fmt(amount: number): string {
  const [int, dec] = (Number.isFinite(amount) ? amount : 0).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, "’")}.${dec}`;
}

/**
 * Bank-CSV lesen. Erkennt Trennzeichen ; oder , und Datum, Text und Betrag.
 * Negative Beträge sind Ausgaben und werden positiv gespeichert.
 */
export function parseBankCsv(text: string): { date: string; label: string; amount: number }[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const sep = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const out: { date: string; label: string; amount: number }[] = [];
  for (const line of lines) {
    const cells = line.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
    const dateCell = cells.find((c) => /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(c) || /^\d{4}-\d{2}-\d{2}$/.test(c));
    if (!dateCell) continue;
    const amountCell = [...cells].reverse().find((c) => /^-?[\d’' ]+[.,]\d{2}$/.test(c));
    if (!amountCell) continue;
    const amount = Number(amountCell.replace(/[’' ]/g, "").replace(",", "."));
    if (!Number.isFinite(amount) || amount === 0) continue;
    const label = cells.filter((c) => c !== dateCell && c !== amountCell && c.length > 1).join(" ").slice(0, 200);
    out.push({ date: toIso(dateCell), label, amount: Math.abs(amount) });
  }
  return out;
}

function toIso(d: string): string {
  if (/^\d{4}-/.test(d)) return d;
  const [dd, mm, yy] = d.split(".");
  const year = yy.length === 2 ? `20${yy}` : yy;
  return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}
