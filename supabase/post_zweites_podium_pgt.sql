-- Fallback: Gleicher Inhalt wie scripts/publish-zweites-podium-pgt.mjs
-- Bild liegt im Next-Public-Verzeichnis: /brand-assets/images/blog/podium-haugschlag-pgt-2026.png
insert into public.posts (slug, title, description, body, image_path, published, created_at)
values (
  'zweites-podium-pgt',
  'Zweites Podium PGT — Podium Haugschlag Golf Resort',
  'Dritter Rang am Haugschlag — zweites Podium der Saison auf der Pro Golf Tour. Über ProAm, drei Runden unter Par und was Putting, Mindset und Heinz Müller dazu beitragen.',
  $BODY$
Nach den zwei erfolgreichen Turnieren in Ägypten war ich froh, etwas Zeit zuhause mit Grundlagentraining und ein paar Rennradfahrten zu verbringen. Dazu Planungsgespräche mit Swiss Golf — und weiter die Suche nach Sponsoren (leider weiterhin ohne Treffer). Zuhause geniesse ich auch die Zeit in den eigenen vier Wänden — unterwegs bin ich ja mehr als genug.

Haugschlag PGT

Ende April ging es ins erste Turnier in Österreich, wieder ins Haugschlag Golf Resort nahe der tschechischen Grenze. Eigentlich ziemlich „im Nirgendwo“. Der Platz ist anspruchsvoll, meist aber in hervorragendem Zustand — gerade zu dieser Jahreszeit.

Ich reise mit Jeremy Freiburghaus im Auto an und wir teilen uns ein Airbnb. Wir kommen gut zurecht, beide unkompliziert. Den ersten Tag vor Ort nehme ich etwas lockerer: 18 Loch, etwas Training. Vom Turnierorganisator bekomme ich dank der guten Resultate das Aufgebot fürs ProAm — noch eine Proberunde vor dem Ernstfall.

Im ProAm fühle ich mich sehr wohl. Mit der Gruppe läuft es super, wir gewinnen sogar die Brutto-Wertung. Alle gehen mit einem guten Gefühl nach Hause. Ich bin bereit für Tag eins.

Turnierstart

Ich starte solide ins Turnier und spiele die erste Runde drei unter Par. Gefühlt ist es nicht perfekt: vom Tee bin ich gut, bekomme den Ball aber nicht richtig ans Green und hole die Birdies auf Par 5 oder mit einem sehr starken Abschlag neben das Green auf Par 4. Mit diesem Score liege ich auf Rang 5 — und gehe zuversichtlich in Runde zwei. Ich weiss, dass mein Potenzial noch nicht ausgeschöpft ist.

In Runde zwei geht es nicht gut los: ungenügende Annäherungen, früh ein Bogey. Ich bleibe geduldig; zwar Fehler, aber mit Kurzspiel und Putting halte ich sie klein. Unter schwierigen Bedingungen — nachts minus drei Grad, Bodenfrost bis 8 Uhr — spiele ich solide zwei unter Par und bleibe auf Rang 5.

Die Finalrunde beginnt wieder suboptimal; auf den ersten sechs Löchern muss ich mich oft aus schlechten Lagen retten. Das klappt gut und gibt Sicherheit. Dann läuft es besser: Chancen, Putting trägt — plötzlich führe ich. Auf den Löchern 14 und 15 folgen schlechte Drives, seitlich aus der misslichen Lage chippen, Par nicht mehr möglich. Auf dem 17. rettet ein 18-Meter-Putt noch einmal das Glück. Auf dem Schlussloch Lip-Out — und die wilde Runde endet vier unter Par, Tagesbestleistung am Finaltag.

Dritter Platz, mein zweites Podium dieser Saison — zwei Schläge fehlen am Ende zum Sieger. Ich bin zufrieden.

Fazit

Was mich besonders stolz macht: Die Arbeit am Putting zahlt sich aus, und mein Mindset bleibt stabil — egal wie der Start läuft. Die Tools, die ich im letzten Jahr mit Heinz Müller angegangen bin, tragen langsam Früchte. Ich spiele mich Woche für Woche solide in die Top 10.

Ich interpretiere das sehr positiv: Stolz, und noch in keinem Turnier das Gefühl gehabt, mein bestes Golf gespielt zu haben. Ich arbeite jede Woche weiter — dem Sieg steht nichts mehr im Weg. Also: LET’S GO!
  $BODY$,
  '/brand-assets/images/blog/podium-haugschlag-pgt-2026.png',
  true,
  '2026-05-04T07:30:00.000Z'::timestamptz
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  image_path = excluded.image_path,
  published = excluded.published,
  created_at = excluded.created_at;
