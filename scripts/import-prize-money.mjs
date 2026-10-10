/**
 * Einmaliger Import der Preisgelder 2023–2026 (CHF, effektiv ausbezahlt).
 * Aufruf: node --env-file=.env.local scripts/import-prize-money.mjs
 * Überspringt Einträge, die mit gleichem Datum, Turnier und Betrag schon existieren.
 */
import { createClient } from "@supabase/supabase-js";

const RAW = `
11.04.2023	ProGolf Tour	373.05
12.04.2023	ProGolf Tour	1078.65
21.07.2023	ProGolf Tour	322.25
22.08.2023	ProGolf Tour	375
06.10.2023	ProGolf Tour	284.35
28.02.2024	ProGolf Tour	317.45
29.04.2024	ProGolf Tour	424.8
07.06.2024	ProGolf Tour	340.45
19.06.2024	ProGolf Tour	652.6
28.06.2024	ProGolf Tour	251.4
08.07.2024	ProGolf Tour	345.95
30.07.2024	Hotelplanner Tour	1203.15
06.08.2024	Hotelplanner Tour	1360.9
21.08.2024	ProGolf Tour ProAm	93.45
27.08.2024	ProGolf Tour	352.95
08.10.2024	Hotelplanner Tour	628.5
03.03.2025	ProGolf Tour	426.4
14.03.2025	ProGolf Tour	290.15
21.03.2025	ProGolf Tour	591
28.03.2025	ProGolf Tour	335.85
14.04.2025	ProGolf Tour	456.5
09.05.2025	ProGolf Tour	296.3
17.06.2025	Hotelplanner Tour	3093.9
01.07.2025	Hotelplanner Tour	1334.9
02.07.2025	ProGolf Tour ProAm	91.75
08.07.2025	ProGolf Tour	498.05
28.07.2025	ProGolf Tour	3753.2
15.08.2025	ProGolf Tour ProAm	92.7
19.08.2025	ProGolf Tour	970.5
25.08.2025	ProGolf Tour	278.6
27.08.2025	ProGolf Tour ProAm	92
29.08.2025	ProGolf Tour	821.65
16.09.2025	ProGolf Tour	226.05
07.10.2025	ProGolf Tour ProAm	91.65
08.10.2025	ProGolf Tour	436.85
24.02.2026	ProGolf Tour	404.45
27.02.2026	ProGolf Tour	801.4
09.03.2026	ProGolf Tour	266.35
10.03.2026	ProGolf Tour	266.75
14.04.2026	ProGolf Tour	2565.2
15.04.2026	ProGolf Tour	804.4
05.05.2026	ProGolf Tour ProAm	72.2
05.05.2026	ProGolf Tour	1633.6
12.05.2026	ProGolf Tour ProAm	90.3
15.05.2026	ProGolf Tour	769.4
19.05.2026	ProGolf Tour	794.85
08.06.2026	ProGolf Tour ProAm	72.35
08.06.2026	ProGolf Tour	264.4
09.06.2026	ProGolf Tour ProAm	136.05
09.06.2026	ProGolf Tour	307.6
15.06.2026	ProGolf Tour	1726.95
16.06.2026	ProGolf Tour ProAm	136.15
23.06.2026	ProGolf Tour ProAm	136.45
26.06.2026	ProGolf Tour	955.5
01.07.2026	ProGolf Tour ProAm	90.9
10.07.2026	ProGolf Tour	943.2
27.07.2026	ProGolf Tour	330.05
18.08.2026	ProGolf Tour	5236.8
19.08.2026	ProGolf Tour ProAm	92.65
26.08.2026	ProGolf Tour ProAm	92.4
31.08.2026	ProGolf Tour	368.6
08.09.2026	ProGolf Tour ProAm	139.3
11.09.2026	ProGolf Tour	501.15
21.09.2026	ProGolf Tour	471.8
29.09.2026	ProGolf Tour ProAm	139.85
05.10.2026	ProGolf Tour	420.4
`;

const TOUR_NAMES = { "hotelplanner tour": "HotelPlanner Tour", "progolf tour": "ProGolf Tour" };

const rows = RAW.trim()
  .split("\n")
  .map((line) => {
    const [date, label, amount] = line.split("\t").map((s) => s.trim());
    const [d, m, y] = date.split(".");
    const tour = TOUR_NAMES[label.replace(/\s*proam$/i, "").toLowerCase()];
    if (!tour) throw new Error(`Unbekannte Tour: ${label}`);
    // «ProAm» im Namen bleibt bis Migration 021, die daraus kind = 'proam' macht
    const proam = /proam$/i.test(label);
    return {
      tournament: proam ? `${tour} ProAm` : tour,
      tour,
      event_date: `${y}-${m}-${d}`,
      amount_chf: Number(amount),
    };
  });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: existing, error: loadError } = await supabase.from("prize_money").select("event_date,tour,amount_chf");
if (loadError) throw loadError;
const key = (r) => `${r.event_date}|${r.tour}|${Number(r.amount_chf).toFixed(2)}`;
const have = new Set(existing.map(key));
const fresh = rows.filter((r) => !have.has(key(r)));

if (fresh.length) {
  const { error } = await supabase.from("prize_money").insert(fresh);
  if (error) throw error;
}
console.log(`${fresh.length} importiert, ${rows.length - fresh.length} schon vorhanden.`);
