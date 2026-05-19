/**
 * Veröffentlicht «marokko-swing» in Supabase (UPSERT slug).
 * node --env-file=.env.local scripts/publish-marokko-swing.mjs
 */
import { createClient } from "@supabase/supabase-js";

const slug = "marokko-swing";

const row = {
  slug,
  title: "Marokko Swing",
  description:
    "Zwei Pro Golf Tour-Turniere in Agadir: Taghazout und Ocean Golf — Top-10 in beiden Wochen, Wind, Strafschläge und ein positives Fazit vor der Europa-Saison.",
  body:
    "Nach einem guten Start in die Saison geht es nach Marokko, genauer nach Agadir, wo zwei Turniere auf zwei verschiedenen Plätzen anstehen: Taghazout und Ocean Golf. Die Anreise verläuft ohne Probleme — auch diese Wochen teile ich mit meinen beiden deutschen Kollegen das Airbnb, da sie ebenfalls von Zürich fliegen und wir so die Aufenthaltskosten teilen können.\n\nTaghazout\n\n{{IMAGE:/brand-assets/images/Taghazout_marokko.jpg|Taghazout Golf Club — Meerblick an der Pro Golf Tour, Marokko}}\n\nDer erste Platz ist wunderschön am Hang gebaut, jedes Loch bietet Meerblick. Die Szenerie ist unglaublich, die Konditionen super. Der Platz ist wie ein Linksplatz aufgebaut — hier wird man richtig auf die Probe gestellt, und es werden nur wenige Fehlschläge verziehen. Die Greens sind leider etwas langsam aufgrund eines Greenkeeping-Fehlers kurz vor dem Turnier: Es wurde zu viel Sand auf die Greens gebracht, was Schneiden und Walzen erschwerte.\n\nAuch diese Woche spiele ich das ProAm der Pro Golf Tour und nutze es als zweite Proberunde. Als Spieler im vorderen Bereich des Jahresrankings bekomme ich Einladungen fürs ProAm — verschiedene Schläge testen, und ich fühle mich ready fürs Turnier.\n\nIch starte solide, bleibe geduldig, mache meine Birdies, kämpfe um jedes Par und spiele fast fehlerfrei. Auf Loch 17 muss ich durch einen schlechten Schlag plus einen schlimmen Kick einen Outball und somit ein Doppelbogey in Kauf nehmen — Runde zwei unter Par, voll mit dabei. In Runde zwei starte ich wieder solide, kämpfe gut über 18 Loch, muss aber erneut zwei Strafschläge hinnehmen und beende mit soliden zwei unter Par. Dasselbe Schema in Runde drei: etwas schlechterer Start, zurückkämpfen — wieder zwei Strafschläge. Geteilter 8. Rang, mein fünftes Top-10-Resultat in Folge.\n\nOcean Golf\n\nDas zweite Turnier startet zwei Tage später am Ocean Golf Club — eine komplett andere Welt: kein Linksplatz mehr, eher ähnlich wie Bad Ragaz, aber enger und länger zwischen den Bäumen, viele Doglegs und verbrannte Fairway-Stellen. Auch hier sind die Greens wegen schlechter Maintenance eher langsam — schade, aber für alle gleich.\n\nRunde eins: solider Start, viele Chancen, trotz spätem Doppelbogey drei unter Par, gut rangiert. Runde zwei beginnt verhalten — bei 60 km/h Wind spielen wir drei Bahnen, ein krasser Kampf um jedes Par. Ich bin ein über Par auf diesen Löchern, besser als viele andere. Dann Abbruch wegen zu viel Wind: Bälle rollen von den Greens, der Sturm lässt kein faires Golf zu — eine gute Entscheid der Organisatoren.\n\nFür mich heisst das: 33 Loch am letzten Turniertag. Die zweite Runde am Morgen starte ich gut, kämpfe mich zurück, bald zwei unter Par — und beende mit zwei unter Par, gute Ausgangslage für die Finalrunde.\n\nIn Runde drei starte ich nicht optimal, hole danach Birdies. Gegen Ende stürmt es wieder — nicht ganz 60 km/h, aber um die 40, gerade so, dass der Ball auf dem Green zittert, aber nicht wegrollt. Die letzten sieben Löcher sind ein wilder Ritt; ein paar Fehler, Schaden mit Par-Runde in Grenzen halten — an diesem Tag ein solider Score.\n\nRückblickend: wieder 8. Platz, gute Ranking-Punkte, das sechste Top-10-Ergebnis im siebten Turnier.\n\nFazit\n\nPositiv — aber die grossen Fehler nerven. In diesen zwei Wochen zu viele Strafschläge; genau die halten mich von noch tieferen Scores ab. Die Analyse macht hungrig: Trotz Strafschlägen und einzelnen schlechten Löchern kann ich Woche für Woche vorne mitspielen. Ich bin zuversichtlich, dass die richtig guten Wochen kommen. Solange ich mit meinem «B-Game» immer wieder Top 10 spiele, bin ich auf dem richtigen Weg.\n\nAlso: Weitermachen, geduldig bleiben und mein Spiel spielen.\n\nDanke für euren Support — ich freue mich auf die weitere Saison, die nun ausschliesslich in Europa stattfindet. Endlich etwas mehr mit dem Auto an die Turniere, organisatorisch einfacher und flexibler.\n\nBis bald — euer Mauro",
  image_path: "/brand-assets/images/Taghazout_marokko.jpg",
  published: true,
  created_at: "2026-05-19T08:00:00.000Z",
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
