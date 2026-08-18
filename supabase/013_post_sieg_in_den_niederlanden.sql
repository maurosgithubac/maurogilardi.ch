-- 013_post_sieg_in_den_niederlanden.sql
-- Insert/update blog post. Live at 19.08.2026 11:30 Europe/Zurich (created_at).
-- Also restrict public reads to posts whose created_at is not in the future.

drop policy if exists "Public read published posts" on public.posts;
create policy "Public read published posts"
  on public.posts for select
  using (published = true and created_at <= now());

insert into public.posts (slug, title, description, body, image_path, published, created_at)
values (
  'sieg-in-den-niederlanden',
  'Sieg in den Niederlanden',
  'Playoff-Sieg auf dem Westfriese Golfplatz: fünf unter Par, sieben unter Par, Finalrunde nach Gewitter und Extra-Loch gegen Dario — Rang 2 im Ranking.',
  $BODY$Anreise

Nach der Woche in Bonmont und ein paar Pausentagen mit einigen Rennradfahrten fahre ich gut erholt in die Niederlande. Ich fahre mit meinem Auto und vollem Kofferraum inklusive Yogamatte, Rennrad und allem, was ich so für drei Wochen brauche. Nach 10 Stunden Autofahrt, aufgeteilt auf zwei Tage, komme ich auf dem Westfriese Golfplatz an und spiele gemütlich neun Loch als Proberunde, um die Füsse etwas zu bewegen und schon mal ein paar Schläge zu machen.

Proberunden

Danach folgt die offizielle Proberunde, welche ich früh bestreite, damit ich am Nachmittag etwas Zeit habe, an dem einen oder anderen Projekt zu arbeiten und das eine oder andere Sponsoringdossier abzusenden. Der Platz ist nicht überraschend eher trocken, aber rund um die Greens wurde gut gewässert und somit war er sehr fair und gut spielbar. Die Greens waren etwas langsam, aber der Roll sehr gut.

Erste Runde

In die erste Runde starte ich okay. Ein früher Eagle hilft sehr, aber ein Doppelbogey später in der Runde schenkt leider etwas ein. Auf den zweiten neun Loch kann ich aber nochmals recht Gas geben und eine solide Runde von fünf unter Par ins Clubhaus bringen. Damit rangiere ich mich in den Top 20 mit Potenzial nach oben.

Zweite Runde

In die zweite Runde starte ich dann etwas verhalten. Ich erarbeite mir viele Chancen, kann bei Weitem aber nicht alle verwerten. Auf den zweiten neun Loch erarbeite ich mir die gleichen Chancen und kann wieder einige mehr verwerten und eine super Runde von sieben unter Par schreiben. Mit diesem Score spiele ich mich auf den geteilten dritten Zwischenrang, zwei Schläge hinter den Führenden.

Finalrunde

In der Finalrunde bin ich im zweitletzten Flight eingeteilt, kann somit also vorausspielen und habe nicht den direkten Vergleich mit dem Leader. Dies hat je nach Situation seine Vor- und Nachteile.

Leider startet die Finalrunde aufgrund von Gewittern am Morgen drei Stunden verspätet. In dieser Zeit konnte ich aber das Airbnb aufräumen und noch den einen oder anderen 30-Minuten-Nap machen, um ausgeruht auf den Abschlag zu kommen.

Die Runde startet verhalten und ich verpasse früh gute Birdiechancen. Ich bleibe geduldig, spiele mein Spiel und schaue erst nach neun Loch das erste Mal auf das Livescoring. Dort sehe ich, dass ich bereits gleichauf mit dem Leader bin.

Danach schaue ich das Scoring bis auf das zweitletzte Loch nicht mehr an, spiele mein Spiel und fokussiere mich rein auf meine Routine und meine Abläufe, ohne angespannt zu werden oder Dinge zu forcieren. Dies gelingt mir super und als ich dann auf das Livescoring schaue, sehe ich, dass ich einen Schlag vorne bin. Ich sehe aber auch, dass Dario, zwischenzeitlich Zweiter, auf dem Loch nebenan ein Birdie gemacht hat.

Ein Loch später stehe ich auf der Teebox und Dario schlägt seinen Schlag auf dem Loch hinter uns 1,3 Meter an die Fahne. Ich gehe davon aus, dass er das Birdie machen wird, spiele mein letztes Loch mit riesigem Nervenflattern, kann aber ein solides Par spielen, ohne zu verkrampfen, und sehe nach meinem eingelochten Putt, dass Dario seinen Putt verpasst hat.

Mit einem unglaublichen Bunkerschlag auf dem 18. Loch spielt sich Dario aber doch noch ins Playoff mit mir.

Playoff

Scorekarten checken, trinken, essen, Gesicht waschen, Wasserflasche füllen und das Bag samt Trolley auf das Buggy laden, welches mich nochmals auf die 18. Spielbahn, das Extraloch, fährt. Hier losen wir die Startreihenfolge aus. Mein Ruhepuls gefühlt bei 180, aber ich verspüre umso mehr Freude als Angst, da rund 50 Leute auf der Terrasse stehen und das Loch beobachten.

Dario und ich spielen den Abschlag beide in die Nähe des Greens. Ich setze meinen Chip 3,5 Meter an die Fahne, worauf er seinen Chip toppt und trotzdem zwei Meter an die Fahne spielt. Ich ziehe meine volle Routine durch, setze den Ball hin, mit Freude an der Atmosphäre und Puls 200 😉, und kann den Putt einlochen. Dario verschiebt anschliessend seinen Zwei-Meter-Putt und ich gewinne das Turnier auf dem Extraloch.

Fazit

Unglaublich stolz, aber komplett überwältigt von den Emotionen, begebe ich mich zu meinen Kollegen, die geblieben sind, um das Extraloch zu sehen, und werde kurz gefeiert.

Eine riesige Last fällt bei mir selber ab. Nach bereits zehn Top-10-Resultaten, bei welchen jeweils nur zwei bis vier Schläge gefehlt haben, gelingt es mir, mein Spiel bis zum Ende und sogar im Extraloch mit einem Birdie durchzuziehen. Damit kann ich wiederum meine mentale Stärke zum Ausdruck bringen.

Das Beste daran: Ich kann mich im Ranking auf den zweiten Platz verbessern und schon etwas vom Aufstieg in die HotelPlanner Tour träumen. Das bedeutet mir unglaublich viel, da ich für den Aufwand und diese strengen Wochen endlich ein klares Ziel vor Augen habe.

Mein Fokus ist nun ganz klar darauf gerichtet, die Saison mit 120 % Fokus abzuschliessen und möglichst weit oben im Ranking zu bleiben. Denn jeder Rang im Ranking ist es wert, dafür zu kämpfen, und bringt seine Vorteile mit sich. Deshalb jetzt nicht die Füsse hochlegen, sondern weiter den Fuss auf dem Gaspedal lassen und genau mein Ding, das bereits so gut funktioniert, weiter durchziehen.

In diesem Sinne möchte ich euch allen ganz herzlich für euren Support und euer Interesse an meinem sportlichen sowie auch persönlichen Werdegang danken.

Ganz speziell natürlich meiner Freundin, meiner Familie, meinen Freunden, Sponsoren, Partnern und meiner Gönnervereinigung, die mich auf meinem Weg zu 100 % unterstützen und mir zur Seite stehen, auch wenn es mal nicht so läuft.

**DANKE**`,
  image_path: "/brand-assets/images/blog/staan-open-sieg-2026.png",
  created_at: STAAN_OPEN_SIEG_CREATED_AT,
};
$BODY$,
  '/brand-assets/images/blog/staan-open-sieg-2026.png',
  true,
  '2026-08-19T09:30:00.000Z'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  image_path = excluded.image_path,
  published = excluded.published,
  created_at = excluded.created_at;
