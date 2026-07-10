/**
 * Veröffentlicht «zurueck-in-europa» in Supabase (UPSERT slug).
 * node --env-file=.env.local scripts/publish-zurueck-in-europa.mjs
 */
import { createClient } from "@supabase/supabase-js";

const slug = "zurueck-in-europa";

const row = {
  slug,
  title: "Zurück in Europa",
  description:
    "Pro Golf Tour in der Slowakei, St. Pölten und Owingen-Überlingen: drei Events, ein 3. Rang, Regen, Blitz und der Weg zurück zum Podium.",
  body: `Nach den beiden Turnieren in Marokko geht es endlich in Europa weiter. Ich kann nun die meisten Turniere mit dem Auto erreichen und so Kosten sparen sowie flexibler an- und abreisen.

Sedin Golf Resort

Als Erstes geht es in die Slowakei, wo auf dem Golfplatz Sedin das nächste ProGolf Tour Event stattfindet. Der Platz ist sehr tough, mit schwierigen Greens und komplett anderem Graswuchs als sonst. Ich fühle mich gut, mein Spiel geht in die richtige Richtung und ich freue mich auf die neue Challenge auf einem neuen Platz.

Ich starte solide und spiele konstant über 18 Loch, mache aber hier und da kleine Fehler und muss ein paar Strafschläge in Kauf nehmen. So starte ich die Runde nicht ganz optimal mit 1 über Par und bin in der Nähe der Cutline aufzufinden.

Am zweiten Tag spiele ich super Golf bei extrem windigen Bedingungen, bekomme aber auf den Greens den Speed nicht in den Griff und lasse die Putts oft zu kurz. Trotzdem beende ich die Runde mit Par und mache einige Plätze gut.

Die letzte Runde ist noch etwas langweiliger. Ich erarbeite mir wieder sehr viele Chancen, kann aber wirklich fast keine verwerten und muss eine weitere Par-Runde in Kauf nehmen. Solide, aber nicht genug, um einen Schritt nach vorne zu machen. Ich beende das Turnier auf dem 25. Rang und bin etwas enttäuscht. Vor allem mit meinem Verhalten auf dem Platz. Aufgrund der letzten super Wochen waren meine Ansprüche etwas zu hoch gesetzt und ich habe versucht, den Score zu sehr zu forcieren. Dadurch habe ich die Lockerheit der vergangenen Wochen etwas unterdrückt.

St. Pölten

Nach der Slowakei geht es direkt nach St. Pölten. Ich geniesse einen schönen Tag mit Selina in Wien und bereite mich am Tag darauf auf dem Platz vor. Das Wetter ist wechselhaft und viel Regen angesagt. Bereits auf der Proberunde war der Platz teilweise unter Wasser und ich konnte nur 9 Loch spielen. Am Tag darauf hält das Wetter aber besser und ich kann im Pro-Am eine saubere Proberunde absolvieren.

Die erste Runde starte ich sehr schlecht mit einem Triple Bogey auf einem eher einfachen Par 3. Ich brauche danach ein bis zwei Löcher, um mich zu sammeln, und kann mich dank einem Eagle nach 9 Loch unter Par kämpfen. Leider werde ich danach etwas defensiv und kann meinen Score nicht mehr verbessern. So bleibe ich bei 1 unter Par.

Die zweite Runde wird kurz vor Beginn um 08:00 Uhr aufgrund von Überschwemmungen auf den Greens abgesagt. Danach hiess es abwarten. Nach jeder vergangenen Stunde bekamen wir ein Mail mit einem Update, aber es stand immer nur «next announcement in 1 hour». Schlussendlich habe ich versucht, im Airbnb ready für die Runde zu sein, konnte aber immer wieder nur eine weitere Stunde warten, bis schliesslich um 17:00 Uhr die zweite Runde komplett abgesagt wurde und wir diese erst am dritten Tag spielen konnten.

Ich fühlte mich wohl, spielte konstant, war aber auch heute etwas zu defensiv aufgrund des konservativen Mindsets und der etwas zu hohen Ansprüche. Zudem liess ich erneut einige wichtige Putts zu kurz.

Das Turnier beende ich auf dem 32. Rang. Natürlich bin ich enttäuscht, weiss aber auch, dass solche Wochen dazugehören. Wenn ich selber ein schlechtes Gefühl habe und trotzdem den Cut mache, konnte ich trotzdem etwas Positives und ein paar Punkte mitnehmen.

Owingen Überlingen

Nach drei Tagen Pause, einer Putting-Session mit meinem Puttingcoach und ein paar weiteren freien Tagen konnte ich die Gedanken und Ansprüche etwas sortieren und freue mich nun auf die Deutschland-Events, welche endlich etwas näher sind.

Das erste der vier Turniere in Deutschland findet in Owingen-Überlingen statt. Ich spiele auch hier wieder das Pro-Am als Proberunde, bekomme einen tollen Flight und lerne die Konditionen sowie die Tücken des Platzes kennen.

Ich starte solide in die erste Runde. Das Spiel fühlt sich etwas verhalten an, aber auf den Greens läuft es wie am Schnürchen. Ich loche viele Putts zwischen 4 und 8 Metern, was etwas Neues ist. Ich nehme es einfach, wie es kommt, und erarbeite mir laufend viele Chancen. Die Runde kann ich mit 7 unter Par beenden und übernehme nach Tag 1 die Führung.

Der zweite Tag am Nachmittag fängt schwierig an. Ich mache meinen Abschlag, laufe aufs Fairway und plötzlich schlägt ein Blitz rund 2 Kilometer vom Platz entfernt ein. Also steht alles still. Für eine Stunde zurück ins Clubhaus, warten, wieder einspielen und dann geht es weiter.

Der ganze Tag ist von toughen Bedingungen geprägt. Während die Morgengruppe bei praktisch keinem Wind und trockenem Wetter spielen konnte, kämpfen wir uns in der Nachmittagsgruppe durch Regen, Regen und nochmals Regen. Ich spiele richtig geiles Golf. Mein langes Spiel ist so gut wie noch nie. Ich gebe jedem Putt die Chance reinzufallen, aber alles läuft über die Lochkante oder lippt aus.

Schlussendlich setzt der Regen nach 14 Loch nochmals eine Schippe drauf und wir spielen zwei Löcher bereits halb in der Dunkelheit bei grösstmöglichem Niederschlag. Mein Driver fliegt statt 255 Metern nur noch knapp 220 Meter. Unter diesen Bedingungen konnte ich immerhin noch ein Birdie machen. Auf dem 17. Green wird die Runde dann abgebrochen und wir spielen die letzten beiden Löcher erst am nächsten Morgen fertig.

Am Morgen kann ich noch einen 10-Meter-Putt einlochen und mich somit in die besten Drei für den Finaltag spielen.

In die Finalrunde starte ich wieder solide. Ich kann mir erneut viele Birdiechancen erarbeiten, aber mir fehlt die letzte Konsequenz auf den Greens. Ich verpasse einige Chancen, mache aber wirklich coole Schläge, auch wenn ich mal im «Seich» bin.

Ich kann den Druck gut handeln und bin mega stolz auf mein Mindset und mein Verhalten in dieser Finalrunde. Leider fallen aber auch heute die Putts nicht und ich spiele bei viel Wind «nur» -1. Trotzdem beende ich das Turnier auf einem super 3. Rang.

Mega happy mit einem weiteren Podium – vor allem im Wissen, bei extremen Konditionen performen zu können und ein weiteres super Resultat eingefahren zu haben. Trotzdem bin ich etwas genervt, da ich wirklich bis auf das Green so gut gespielt habe, dass es mit einer soliden Puttingleistung für noch mehr gereicht hätte.

Aber ich bin nah dran. Mit einer soliden Leistung und dem Wissen, dass wenn einmal alles zusammenpasst, es klappen wird. Mein Mindset nach den beiden schwierigen Wochen konnte ich verbessern und den Fokus wieder mehr auf den Prozess setzen und weniger auf das Resultat selbst.

Let's keep fighting for that WIN!`,
  image_path: "/brand-assets/images/blog/zurueck-in-europa-pgt-2026.png",
  published: true,
  created_at: "2026-06-15T08:00:00.000Z",
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
