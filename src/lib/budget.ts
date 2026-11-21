/**
 * Budget im Admin: Golf (Geschäft) und Privat getrennt.
 * Reine Daten und Hilfsfunktionen, ohne Server-Abhängigkeiten.
 *
 * Häufigkeit:
 * - einmalig: nur im Monat der Buchung
 * - monatlich: jeden Monat ab dem Startmonat (bis zum Ende, falls gesetzt)
 * - jährlich: der Jahresbetrag wird auf alle 12 Monate verteilt (Betrag / 12)
 */

export type BudgetScope = "golf" | "privat";
export type BudgetFrequency = "einmalig" | "monatlich" | "jaehrlich";

export type BudgetCategory = { id: string; label: string; icon: string; keywords: string[] };

export const FREQUENCY_LABEL: Record<BudgetFrequency, string> = {
  einmalig: "Einmalig",
  monatlich: "Monatlich",
  jaehrlich: "Jährlich (auf 12 Monate verteilt)",
};

export const GOLF_CATEGORIES: BudgetCategory[] = [
  { id: "turniere", label: "Turniere & Startgelder", icon: "🏌️", keywords: ["entry", "tour", "membership", "challenge", "golfsolutions", "epdt", "open", "startgeld", "greenfee", "range fee", "tournament", "parkos"] },
  { id: "flug", label: "Flüge", icon: "✈️", keywords: ["flug", "flight", "air", "easyjet", "pegasus", "sunexpress", "turkish", "swiss air", "swissintern", "lufthansa", "ryanair"] },
  { id: "unterkunft", label: "Unterkunft", icon: "🏨", keywords: ["hotel", "airbnb", "booking", "agoda", "accor", "best western", "pension", "leicester", "fletcher", "bkg", "unterkunft", "ibis"] },
  { id: "transport", label: "Transport & Parken", icon: "🚆", keywords: ["sbb", "taxi", "rentalcars", "parking", "parkingpay", "oebb", "shuttle", "bahn", "transfer", "mietauto", "tanken"] },
  { id: "training", label: "Training & Coaching", icon: "🎯", keywords: ["coach", "mental", "putting", "trainingstag", "harryshome", "physio", "schweisstest", "sportmedizin", "physis", "trainer", "lektion", "training", "ausdauer"] },
  { id: "ausruestung", label: "Ausrüstung & Schuhe", icon: "👟", keywords: ["on schuh", "schuhe", "golftees", "handschuh", "joggingschuh", "polar", "sportuhr", "yardage", "schläger", "golfball", "golbälle", "golfbälle", "titleist", "callaway", "ping", "bag"] },
  { id: "ernaehrung", label: "Sportnahrung", icon: "🥤", keywords: ["sponser", "sport food", "sportnahrung", "nahrung", "nutrition"] },
  { id: "verbaende", label: "Verbände & Mitgliedschaften", icon: "🏛️", keywords: ["swisspga", "swiss pga", "swissgolf", "verband", "mitgliedschaft", "membership"] },
  { id: "events", label: "Gönnerturnier & Events", icon: "🎉", keywords: ["gönnerturnier", "goenner", "fotograf", "event", "apero"] },
  { id: "spesen", label: "Verpflegung unterwegs", icon: "🍽️", keywords: ["verpflegung", "spesen", "essen", "restaurant", "kaffee"] },
  { id: "fahrzeug", label: "Auto & Versicherung", icon: "🚗", keywords: ["auto", "skoda", "axa", "garage", "kilometer", "fahrtenbuch", "fahrzeug", "versicherung"] },
  { id: "buero", label: "Büro & Technik", icon: "💻", keywords: ["büro", "buero", "kabel", "dockingstation", "steckleiste", "hdmi", "pixel", "laptop", "drucker", "ordner"] },
  { id: "abos", label: "Abos & Software", icon: "🔁", keywords: ["abo", "subscri", "chatgpt", "openai", "anthropic", "google", "domain", "webseite", "vpn", "sim", "salt", "phone", "fiver", "cloud", "notion", "canva", "adobe", "apple", "hosting", "vercel", "supabase", "resend"] },
  { id: "sonst_golf", label: "Sonstiges Golf", icon: "📦", keywords: [] },
];

export const PRIVAT_CATEGORIES: BudgetCategory[] = [
  { id: "miete", label: "Miete", icon: "🏠", keywords: ["miete", "mietzins", "wohnung", "immobilien", "verwaltung"] },
  { id: "verpflegung", label: "Verpflegung zuhause", icon: "🍽️", keywords: ["migros", "coop", "denner", "aldi", "lidl", "volg", "lebensmittel", "pizza", "bäcker"] },
  { id: "strom", label: "Strom", icon: "⚡", keywords: ["strom", "ew ", "elektri", "energie"] },
  { id: "heizung", label: "Heizung", icon: "🔥", keywords: ["heizung", "heizöl", "gas", "wärme"] },
  { id: "internet", label: "Internet & Handy", icon: "📱", keywords: ["swisscom", "internet", "handy", "mobile"] },
  { id: "kreditkarte", label: "Gemeinsame Kreditkarte", icon: "💳", keywords: ["kreditkarte", "visa", "mastercard", "cembra", "amex"] },
  { id: "moebel", label: "Möbel & Haushalt", icon: "🛋️", keywords: ["ikea", "möbel", "moebel", "brocki", "haushalt"] },
  { id: "versicherung_privat", label: "Krankenkasse & Versicherung", icon: "🛡️", keywords: ["krankenkasse", "helsana", "css", "sanitas", "versicherung"] },
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

/** Häufigkeit aus der Beschreibung vorschlagen (Abos monatlich, Domain und Versicherungen jährlich). */
export function suggestFrequency(description: string): BudgetFrequency {
  const text = description.toLowerCase();
  if (/(abo|subscri|salt|phone|chatgpt|google cloud)/.test(text)) return "monatlich";
  if (/(domain|webseite|axa|versicherung|auto versicherung)/.test(text)) return "jaehrlich";
  return "einmalig";
}

export type BudgetEntryRow = {
  id: string;
  entry_date: string; // YYYY-MM-DD (Startdatum)
  amount_chf: number;
  scope: BudgetScope;
  category: string;
  label: string;
  /** Unterkategorie, z. B. EPDT oder Salt. Leer = ohne Unterkategorie (vor Migration 029 immer leer). */
  subcategory?: string;
  frequency: BudgetFrequency;
  ends_on: string | null; // YYYY-MM-DD, nur bei wiederkehrenden Kosten
};

/** Betrag im Schweizer Format ohne Währungszeichen. */
export function fmt(amount: number): string {
  const [int, dec] = (Number.isFinite(amount) ? amount : 0).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, "’")}.${dec}`;
}

/** Ist ein wiederkehrender Eintrag in diesem Monat aktiv? */
function activeIn(e: BudgetEntryRow, year: number, month: number): boolean {
  const start = e.entry_date.slice(0, 7);
  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
  if (ym < start) return false;
  if (e.ends_on && ym > e.ends_on.slice(0, 7)) return false;
  return true;
}

/**
 * Verteilt alle Einträge auf die 12 Monate eines Jahres.
 * Gibt je Monat den Betrag pro Eintrag zurück (Summe je Kategorie wird im UI gebildet).
 */
export function monthlyAmounts(entries: BudgetEntryRow[], year: number): { entry: BudgetEntryRow; months: number[] }[] {
  return entries.map((e) => {
    const months = Array.from({ length: 12 }, (_, m) => {
      const amount = Number(e.amount_chf) || 0;
      if (e.frequency === "einmalig") {
        return e.entry_date.startsWith(`${year}-`) && Number(e.entry_date.slice(5, 7)) - 1 === m ? amount : 0;
      }
      if (e.frequency === "monatlich") return activeIn(e, year, m) ? amount : 0;
      // jährlich: Jahresbetrag gleichmässig auf alle 12 Monate der Laufzeitjahre (egal in welchem Monat er anfällt)
      const startYear = Number(e.entry_date.slice(0, 4));
      const endYear = e.ends_on ? Number(e.ends_on.slice(0, 4)) : Infinity;
      return year >= startYear && year <= endYear ? amount / 12 : 0;
    });
    return { entry: e, months };
  });
}

/**
 * Bank-CSV lesen. Erkennt Trennzeichen ; oder , und Datum, Text und Betrag.
 * Beträge werden positiv gespeichert (Ausgaben).
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

/** Farbe je Hauptkategorie (weisse Schrift darauf gut lesbar). */
export const CATEGORY_COLORS: Record<string, string> = {
  turniere: "#d71920",
  flug: "#2f6fe4",
  unterkunft: "#128a76",
  transport: "#5a8f0c",
  training: "#b8740a",
  ausruestung: "#a21fb8",
  ernaehrung: "#e0561a",
  verbaende: "#5b4fcf",
  events: "#d0437a",
  spesen: "#8a6d3b",
  fahrzeug: "#475569",
  buero: "#0b7fb5",
  abos: "#1b1d21",
  sonst_golf: "#6b7077",
  miete: "#2f6fe4",
  verpflegung: "#128a76",
  strom: "#b8740a",
  heizung: "#e0561a",
  internet: "#5b4fcf",
  kreditkarte: "#d0437a",
  moebel: "#5a8f0c",
  versicherung_privat: "#a21fb8",
  sonst_privat: "#6b7077",
};

export function categoryColor(id: string): string {
  return CATEGORY_COLORS[id] ?? "#6b7077";
}

/** Vorschläge für Unterkategorien, damit meist ein Klick genügt. Eigene Namen sind jederzeit möglich. */
export const SUBCATEGORY_SUGGESTIONS: Record<string, string[]> = {
  turniere: ["ProGolf Tour", "EPDT", "Challenge Tour", "Range & Greenfee", "Tour-Pakete"],
  flug: ["Swiss", "easyJet", "Turkish", "Pegasus und SunExpress"],
  unterkunft: ["Airbnb", "Booking", "Agoda", "Hotel"],
  transport: ["SBB", "Taxi", "Mietauto", "Parken"],
  training: ["Putting Coach", "Mentalcoaching", "Physio und Kraft", "Sportmedizin"],
  ausruestung: ["Schuhe", "Bälle und Tees", "Handschuhe", "Yardage Books", "Uhr und Tech"],
  ernaehrung: ["Sponser", "Riegel und Drinks"],
  verbaende: ["SwissPGA", "SwissGolf"],
  events: ["Gönnerturnier", "Fotograf", "Apéro"],
  spesen: ["Verpflegung unterwegs", "Trinkgeld"],
  fahrzeug: ["Versicherung", "Kilometer", "Garage", "Benzin"],
  buero: ["Handy", "Laptop", "Büromaterial"],
  abos: ["Salt", "ChatGPT", "Domain", "Cloud", "VPN und E-Sim", "Fiverr"],
  sonst_golf: ["Ausgleichskasse", "Steuern"],
  miete: ["Miete", "Nebenkosten", "Parkplatz"],
  verpflegung: ["Migros", "Coop", "Restaurant", "Take-away"],
  strom: ["Strom"],
  heizung: ["Heizung"],
  internet: ["Internet", "Handy"],
  kreditkarte: ["Gemeinsame Kreditkarte"],
  moebel: ["Möbel", "Haushalt", "Garten"],
  versicherung_privat: ["Krankenkasse", "Hausrat", "Haftpflicht"],
  sonst_privat: ["Freizeit", "Geschenke", "Kleider"],
};
