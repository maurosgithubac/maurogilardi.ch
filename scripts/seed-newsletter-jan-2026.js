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
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
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

  const posts = [
    {
      slug: "newsletter-januar-2026-golfers-zusammenarbeit",
      title: "Newsletter Januar 2026: The Golfer's Zusammenarbeit",
      description:
        "Warum ich 2026 bei Eisen und Wedges auf Titleist setze, welche Tests dahinterstehen und wie mich The Golfer's Malans im Alltag begleitet.",
      body:
        "Im neuen Jahr vertraue ich noch stärker auf meinen Ausruester The Golfer's Malans. Nach intensiven Tests verschiedener Marken habe ich fuer mein Spiel das Setup gefunden, das sich am besten anfuehlt und unter Druck am konstantesten performt.\n\nDer Fokus liegt auf gleichem Outcome wie im letzten Jahr, kombiniert mit besserem Landing Angle auf die Gruens. Genau hier liefern mir die Titleist T100 Eisen die passenden Werte bei Spin und Ballflug, ohne mein Schlaggefuehl komplett zu veraendern.\n\nBei den Hoelzern bleibe ich weiterhin bei Callaway, weil das Gesamtbild fuer mich stimmt. Mit dem ProV1 als Ball und dem direkten Austausch vor Ort in Malans habe ich fuer 2026 ein Setup, das Leistung und Vertrauen zusammenbringt.",
      image_path: "/brand-assets/images/mauro&friends-9.jpg",
      created_at: "2026-01-08T09:00:00.000Z",
      published: true,
    },
    {
      slug: "newsletter-januar-2026-swiss-golf-camp-al-ain",
      title: "Newsletter Januar 2026: Swiss Golf Camp in Al Ain",
      description: "14 Tage Intensivtraining in den UAE: Technik, Routinen und Performance unter realen Platzbedingungen.",
      body:
        "Das Swiss Golf Camp in Al Ain ist fuer mich jedes Jahr ein wichtiger Baustein vor dem Saisonstart. Mit Coaches, Spezialisten im Kurzspiel und Putting sowie dem National Team entstehen taeglich wertvolle Inputs fuer mein Spiel.\n\nIn Woche eins lag der Schwerpunkt auf meinem eigenen Schwunggefuehl und darauf, wieder in stabile Routinen zu kommen. Morgens und abends habe ich zusaetzlich Performance-Training eingebaut, um trotz hoher Belastung fokussiert und spielnah zu bleiben.\n\nIn Woche zwei ging es staerker Richtung Wettkampfmodus: mehr Locherunden, verschiedene Spielsituationen und klares Entscheidungsverhalten auf dem Platz. Genau diese Kombination aus Struktur und Praxis hat mir geholfen, wieder mit Selbstvertrauen unter Druck zu performen.",
      image_path: "/brand-assets/images/1L9A8795.JPG",
      created_at: "2026-01-20T10:00:00.000Z",
      published: true,
    },
    {
      slug: "newsletter-januar-2026-trainingslearnings-und-ausblick",
      title: "Newsletter Januar 2026: Learnings und Ausblick",
      description:
        "Was ich aus dem Januar-Block mitnehme und wie ich die Erkenntnisse in Turnierwahl, Planung und Saisonvorbereitung ueberfuehre.",
      body:
        "Nach dem intensiven Januar-Block war fuer mich klar: Die Richtung stimmt. Ich fuehle mich auf dem Platz wieder wohl, kann auch bei unsicherem Schwunggefuehl solide performen und weiss, welche Routinen im Turniermodus funktionieren.\n\nGleichzeitig braucht es nach 14 Tagen mit taeglich vielen Trainingsstunden bewusste Regeneration. Physische und mentale Pausen sind entscheidend, um Erkenntnisse sauber einzuordnen und Prioritaeten fuer die naechsten Wochen zu setzen.\n\nMit diesem Fundament gehe ich in die weitere Saisonvorbereitung: strukturierter Plan, passende Turnierauswahl und ein klarer Fokus auf Umsetzung. Genau so will ich 2026 Schritt fuer Schritt auf das naechste Level bringen.",
      image_path: "/brand-assets/images/1L9A8968.JPG",
      created_at: "2026-02-02T11:00:00.000Z",
      published: true,
    },
  ];

  const { data, error } = await supabase
    .from("posts")
    .upsert(posts, { onConflict: "slug" })
    .select("slug,title,published");

  if (error) {
    throw error;
  }

  console.log("Upserted posts:");
  for (const row of data || []) {
    console.log(`- ${row.slug} | ${row.published ? "published" : "draft"}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
