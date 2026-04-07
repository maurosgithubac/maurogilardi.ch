const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function readLocalEnv(path) {
  const text = fs.readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

async function main() {
  const env = readLocalEnv(".env.local");
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Chronologisch: aeltestes Ereignis zuerst.
  const posts = [
    {
      slug: "saisonstart-geglueckt-vorbereitung-und-inspiration",
      title: "Saisonstart geglueckt: Letzte Vorbereitung und Inspiration",
      description: "Feinschliff in Mallorca, starke Trainingsbedingungen und neue Motivation vor dem Saisonstart in der Tuerkei.",
      body: "Nach dem Camp in Al Ain blieb vor dem ersten Turnier noch wertvolle Vorbereitungszeit. Fuenf Tage in Mallorca mit Jeremy Freiburghaus und Nicola Gerhardsen halfen mir, mein Spiel auf dem Platz gezielt zu schaerfen und die letzten Details sauber zu setzen.\n\nDie guten Bedingungen vor Ort waren wichtig, um mit Klarheit in die ersten Wochen der Saison zu gehen. Gleichzeitig konnte ich durch diese Vorbereitung auch mental aufladen und neue Inspiration sammeln.\n\nMit diesem Mix aus konzentriertem Training und klarem Kopf war die Basis gelegt, um den Saisonstart strukturiert und mit Selbstvertrauen anzugehen.",
      image_path: "/brand-assets/images/1L9A9440.JPG",
      created_at: "2026-03-10T09:00:00.000Z",
      published: true,
    },
    {
      slug: "saisonstart-geglueckt-tuerkei-turniere",
      title: "Saisonstart geglueckt: Die ersten Turniere in der Tuerkei",
      description: "Verhaltener Start mit Fehlern, starke Reaktion in Runde zwei und drei, danach Rang 7 dank mentaler Staerke.",
      body: "Der Start in der Tuerkei war sportlich anspruchsvoll. Im ersten Turnier passierten einige groessere Fehler, die fuer den Saisonbeginn nicht unueblich sind, aber dennoch teuer werden. Mit einer soliden Reaktion in Runde zwei und drei konnte ich mir trotzdem ein Top-20-Ergebnis sichern.\n\nIm zweiten Turnier lief spielerisch weiterhin nicht alles rund, doch mein mentales Spiel war diese Woche auf hohem Niveau. Genau das machte den Unterschied in schwierigen Konditionen und brachte mich Schritt fuer Schritt nach vorne.\n\nMit Rang 7 war das Resultat stark und vor allem ein wichtiges Signal: Auch wenn das A-Game noch nicht voll da ist, kann ich ueber Prozesse und Haltung sehr konkurrenzfaehig sein.",
      image_path: "/brand-assets/images/1L9A8795.JPG",
      created_at: "2026-03-14T10:00:00.000Z",
      published: true,
    },
    {
      slug: "saisonstart-geglueckt-zwangserholung",
      title: "Saisonstart geglueckt: Zwangserholung im Maerz",
      description: "Krankheit und Magenprobleme stoppten den Rhythmus fuer zwei Wochen - mit voller Prioritaet auf Regeneration.",
      body: "Der Maerz war leider gepraegt von Krankheit und Magenproblemen. Fuer rund 14 Tage war klar, dass nur eine Prioritaet zaehlt: vollstaendige Erholung.\n\nSolche Phasen gehoeren im Leistungssport dazu, auch wenn sie zum falschen Zeitpunkt kommen. Rueckblickend war es wichtig, die Situation zu akzeptieren und den Koerper nicht zu frueh zu belasten.\n\nDass erste Turniere in Aegypten abgesagt wurden, passte in diesem Moment sogar in den Gesamtplan, weil ich koerperlich noch nicht bei 100 Prozent war.",
      image_path: "/brand-assets/images/1L9A9646.JPG",
      created_at: "2026-03-20T11:00:00.000Z",
      published: true,
    },
    {
      slug: "saisonstart-geglueckt-swisspga-ausbildung",
      title: "Saisonstart geglueckt: Start der SwissPGA Ausbildung",
      description: "Die freie Zeit sinnvoll genutzt: modularer Einstieg in die SwissPGA Ausbildung parallel zur aktiven Karriere.",
      body: "Die unerwarteten Wochen habe ich produktiv genutzt und den Start in die SwissPGA Ausbildung gemacht. Durch den modularen Aufbau kann ich die Inhalte ueber mehrere Jahre parallel zur aktiven Karriere bearbeiten.\n\nFuer mich ist das ein strategischer Schritt: sportlich weiterhin volle Attacke, gleichzeitig den Grundstein fuer die Zeit nach der aktiven Laufbahn legen.\n\nSo entsteht schon heute eine klare Perspektive in Richtung Teaching Pro und Coaching - ohne den Fokus auf aktuelle sportliche Ziele zu verlieren.",
      image_path: "/brand-assets/images/183.jpg",
      created_at: "2026-03-24T12:00:00.000Z",
      published: true,
    },
    {
      slug: "saisonstart-geglueckt-vorbereitung-2-und-ausblick",
      title: "Saisonstart geglueckt: Vorbereitung 2.0 und Ausblick",
      description: "Trainingsblock in Barcelona, Putting-Check in Manchester und klare Ausrichtung fuer den naechsten Aegypten-Swing.",
      body: "In der zweiten Vorbereitungsphase ging es mit dem Swiss Golf Team nach Barcelona. In Infinitum konnten wir bei sehr guten Bedingungen mehrere Tage intensiv und wettkampfnah trainieren.\n\nErgaenzt wurde der Block durch einen kurzen Trip nach Manchester zu Putting-Experte Lee Sullivan, um den Fortschritt im Putting einzuordnen und naechste Schritte festzulegen.\n\nNach ein paar Tagen zuhause mit Familie und Training in Zuerichsee sowie Domat-Ems folgt die Weiterreise nach Aegypten. Ziel bleibt klar: Saison fortsetzen, Rhythmus aufbauen und den positiven Trend bestaetigen.",
      image_path: "/brand-assets/images/mauro&friends-9.jpg",
      created_at: "2026-03-30T13:00:00.000Z",
      published: true,
    },
  ];

  const { data, error } = await supabase
    .from("posts")
    .upsert(posts, { onConflict: "slug" })
    .select("slug,title,published,created_at");

  if (error) throw error;

  console.log("Upserted posts:");
  for (const row of data || []) {
    console.log(`- ${row.slug} | ${row.published ? "published" : "draft"} | ${row.created_at}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
