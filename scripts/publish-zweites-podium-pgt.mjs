/**
 * Holt den Post «zweites-podium-pgt» in Supabase published (UPSERT slug).
 * Voraussetzung: .env.local mit NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Bild: bereits unter /brand-assets/images/blog/... (öffentlich ausgeliefert).
 */
import { createClient } from "@supabase/supabase-js";

const slug = "zweites-podium-pgt";

const row = {
  slug,
  title: "Zweites Podium PGT — Podium Haugschlag Golf Resort",
  description:
    "Dritter Rang am Haugschlag — zweites Podium der Saison auf der Pro Golf Tour. Über ProAm, drei Runden unter Par und was Putting, Mindset und Heinz Müller dazu beitragen.",
  body:
    "Nach den zwei erfolgreichen Turnieren in Ägypten war ich froh, etwas Zeit zuhause mit Grundlagentraining und ein paar Rennradfahrten zu verbringen. Dazu Planungsgespräche mit Swiss Golf — und weiter die Suche nach Sponsoren (leider weiterhin ohne Treffer). Zuhause geniesse ich auch die Zeit in den eigenen vier Wänden — unterwegs bin ich ja mehr als genug.\n\nHaugschlag PGT\n\nEnde April ging es ins erste Turnier in Österreich, wieder ins Haugschlag Golf Resort nahe der tschechischen Grenze. Eigentlich ziemlich „im Nirgendwo“. Der Platz ist anspruchsvoll, meist aber in hervorragendem Zustand — gerade zu dieser Jahreszeit.\n\nIch reise mit Jeremy Freiburghaus im Auto an und wir teilen uns ein Airbnb. Wir kommen gut zurecht, beide unkompliziert. Den ersten Tag vor Ort nehme ich etwas lockerer: 18 Loch, etwas Training. Vom Turnierorganisator bekomme ich dank der guten Resultate das Aufgebot fürs ProAm — noch eine Proberunde vor dem Ernstfall.\n\nIm ProAm fühle ich mich sehr wohl. Mit der Gruppe läuft es super, wir gewinnen sogar die Brutto-Wertung. Alle gehen mit einem guten Gefühl nach Hause. Ich bin bereit für Tag eins.\n\nTurnierstart\n\nIch starte solide ins Turnier und spiele die erste Runde drei unter Par. Gefühlt ist es nicht perfekt: vom Tee bin ich gut, bekomme den Ball aber nicht richtig ans Green und hole die Birdies auf Par 5 oder mit einem sehr starken Abschlag neben das Green auf Par 4. Mit diesem Score liege ich auf Rang 5 — und gehe zuversichtlich in Runde zwei. Ich weiss, dass mein Potenzial noch nicht ausgeschöpft ist.\n\nIn Runde zwei geht es nicht gut los: ungenügende Annäherungen, früh ein Bogey. Ich bleibe geduldig; zwar Fehler, aber mit Kurzspiel und Putting halte ich sie klein. Unter schwierigen Bedingungen — nachts minus drei Grad, Bodenfrost bis 8 Uhr — spiele ich solide zwei unter Par und bleibe auf Rang 5.\n\nDie Finalrunde beginnt wieder suboptimal; auf den ersten sechs Löchern muss ich mich oft aus schlechten Lagen retten. Das klappt gut und gibt Sicherheit. Dann läuft es besser: Chancen, Putting trägt — plötzlich führe ich. Auf den Löchern 14 und 15 folgen schlechte Drives, seitlich aus der misslichen Lage chippen, Par nicht mehr möglich. Auf dem 17. rettet ein 18-Meter-Putt noch einmal das Glück. Auf dem Schlussloch Lip-Out — und die wilde Runde endet vier unter Par, Tagesbestleistung am Finaltag.\n\nDritter Platz, mein zweites Podium dieser Saison — zwei Schläge fehlen am Ende zum Sieger. Ich bin zufrieden.\n\nFazit\n\nWas mich besonders stolz macht: Die Arbeit am Putting zahlt sich aus, und mein Mindset bleibt stabil — egal wie der Start läuft. Die Tools, die ich im letzten Jahr mit Heinz Müller angegangen bin, tragen langsam Früchte. Ich spiele mich Woche für Woche solide in die Top 10.\n\nIch interpretiere das sehr positiv: Stolz, und noch in keinem Turnier das Gefühl gehabt, mein bestes Golf gespielt zu haben. Ich arbeite jede Woche weiter — dem Sieg steht nichts mehr im Weg. Also: LET’S GO!",
  image_path: "/brand-assets/images/blog/podium-haugschlag-pgt-2026.png",
  published: true,
  created_at: "2026-05-04T07:30:00.000Z",
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Fehlendes NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY (z.B. aus .env.local).");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { error } = await sb.from("posts").upsert(row, { onConflict: "slug" });

if (error) {
  console.error("Supabase Upsert failed:", error.message);
  process.exit(1);
}

console.log(`OK — Post live: https://www.maurogilardi.ch/blog/${slug}`);
