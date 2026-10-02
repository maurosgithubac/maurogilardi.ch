-- 015_post_aufstieg_hotelplanner.sql
-- Post vom 02.10.2026 (created_at = 12:00 Europe/Zurich): Aufstieg in die HotelPlanner Tour.
-- Assumes 002_blog_and_sponsors.sql.

insert into public.posts (slug, title, description, body, image_path, published, created_at)
values (
  'aufstieg-hotelplanner-tour',
  'Endspurt zum Aufstieg in die HotelPlanner Tour',
  'Schwierige Wochen in Holland, Top 15 in Belgien und ein nervenaufreibendes Finale: Rang 4 im Ranking und der Aufstieg in die HotelPlanner Tour ist geschafft.',
  $BODY$Die beiden Wochen in Holland nach dem Sieg verlaufen eher schwierig. Ich spiele weiterhin gutes Golf, es schleichen sich aber immer wieder grössere Fehler ein. Den Grund dafür kann ich nicht richtig finden. Ich verliere etwas das Vertrauen in mein aggressives Spiel, hinterfrage viele Entscheidungen und mache mir generell zu viele Gedanken. Ein verpasster Cut und ein 29. Rang sind für mich enttäuschend, aber ich nehme es so hin und versuche, meine Lehren daraus zu ziehen. Ein grosser Punkt war sicherlich das Energielevel, das nach einer langen Saison bereits eher tief war. Die Woche mit dem Sieg hat umso mehr Energie gekostet und die eigenen Ansprüche natürlich etwas erhöht.

Nach den drei Holland-Turnieren mache ich eine Woche Pause und erhole mich. Ich verbringe Zeit mit Familie und Freunden und habe den einen oder anderen Sponsorentag. Danach geht es direkt weiter nach Belgien, wo ich mein Spiel wieder nicht finde und an beiden Turnieren viele Fehler mache. Mental habe ich aber wieder die Energie, bis zum Schluss voll dranzubleiben. Das gute Mindset hat die dummen Fehler auskorrigiert, und ich konnte mit einem 11. und einem 14. Platz zwei weitere wichtige Top-15-Rangierungen erreichen und wichtige Punkte ins Finalturnier mitnehmen.

Eine neue Herausforderung in diesen letzten Wochen ist aber das erweiterte Umfeld. Ich selber weiss, dass im Finale alles passieren kann, da es sehr viele Punkte gibt. Ich weiss aber auch, dass ich mit meinem Golfspiel das Turnier gewinnen kann und einiges passieren müsste, damit ich aus den Top 5 herausfallen würde.

Jedoch war es für mich sehr neu, von aussen oft zu hören zu bekommen: «Gratuliere bereits», «Du schaffst das schon» und «Da kann ja nichts mehr schiefgehen». Das ist alles sehr nett und motivierend gemeint, aber eine komplett neue Situation, denn im Sport ist nichts selbstverständlich. Genau das hat mir aber auch noch etwas Energie gegeben. Zu wissen, dass der Support im Umfeld und im erweiterten Umfeld so gross ist, war super schön.

Ich reise zum Finale an, und natürlich weiss jeder, was passieren muss, damit es reicht. Alle haben die Zahlen im Kopf. Ich versuche, mich auf mein Spiel zu fokussieren, mir über 54 Loch Chancen zu erarbeiten und erst am Ende anzufangen zu rechnen. Das gelingt mir recht gut: Ich kann mir viele Chancen erarbeiten, aber praktisch keine nutzen. Nach den ersten beiden Runden bin ich etwas frustriert, denn die Chancenverwertung war sehr schlecht. In der Finalrunde spiele ich super, kann aber wieder keine Chancen verwerten und spiele trotz super Golfspiel «nur» 1 unter Par.

Da ich im zweiten Flight gestartet bin, heisst es nun abwarten und hoffen, dass Tim Tilmanns nicht gewinnt, da er mich sonst überholen würde. Und auch hoffen, dass Max Schmitt nicht in die Top 8 spielt und mich ebenfalls überholt. Lange, lange ist es knapp. Schlussendlich stehe ich auf der 18, schaue zu, was passiert, und aktualisiere ständig das Livescoring. Max wird schlussendlich 9., und ich weiss: Den 5. Rang habe ich auf sicher, und wenn Tim nicht gewinnt, sogar den 4. Rang. Jaka Babnik gewinnt schlussendlich, und Tim belegt den 3. Rang.

Ultra happy und überwältigt von dem stressigen Nachmittag darf ich endlich offiziell sagen: Ich habe den Aufstieg in die HotelPlanner Tour geschafft. Let's go!

Ein riesiger Stein fällt mir vom Herzen. Ich bin unglaublich stolz auf meine Saison und kann es kaum erwarten, auf der HotelPlanner Tour aufzuteen. Die ganzen Entscheidungen, die ich über das Jahr getroffen habe, wie das Auslassen der Swiss Challenge und des Omega European Masters, werden nun belohnt. Ebenfalls bin ich extrem stolz, dass ich in der Schweiz meinem Weg treu geblieben bin, mit der Armee als Unterstützung. In dieser Zeit konnte ich ein unglaublich cooles Team aus Coaches, Sponsoren und Gönnern aufbauen, das mich auf meinem Weg begleitet und mir den Weg ebnet, meine Karriere als Sportler und als Persönlichkeit voranzutreiben.

Ein ganz besonderer Dank geht an meine Familie, die mir immer die Freiheit gegeben hat, meinen eigenen Weg zu gehen, und mich unterstützt, egal was ich mache. Und an Selina, die an meiner Seite steht und mich jeden Tag inspiriert, im Golf auf das Niveau zu kommen, auf dem sie im Curling bereits ist.

Ich danke euch von ganzem Herzen und freue mich riesig auf diese neue Challenge im kommenden Jahr.

**DANKE und Let's fucking go!**$BODY$,
  '/brand-assets/images/blog/aufstieg-hotelplanner-tour-2026.png',
  true,
  '2026-10-02T10:00:00.000Z'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  image_path = excluded.image_path,
  published = excluded.published,
  created_at = excluded.created_at;
