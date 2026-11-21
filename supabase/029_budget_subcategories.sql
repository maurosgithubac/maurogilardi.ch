-- Budget: Unterkategorien (z. B. Turniere > EPDT, Flüge > Swiss, Abos > Salt).
-- Run in Supabase SQL Editor. Assumes 027_budget.sql.
-- 029_budget_subcategories.sql

alter table public.budget_entries
  add column if not exists subcategory text not null default '' check (char_length(subcategory) <= 80);

-- Bestehende Einträge anhand der Beschreibung einer Unterkategorie zuordnen (nur wo noch leer).
update public.budget_entries set subcategory = case
  -- Turniere & Startgelder
  when category = 'turniere' and label ilike '%epdt%' then 'EPDT'
  when category = 'turniere' and (label ilike '%progolf%' or label ilike '%enty fee%' or label ilike '%madgolf%') then 'ProGolf Tour'
  when category = 'turniere' and (label ilike '%range fee%' or label ilike '%ballkarte%') then 'Range & Greenfee'
  when category = 'turniere' and label ilike '%tpc%' then 'Tour-Pakete'
  -- Flüge
  when category = 'flug' and label ilike '%swiss%' then 'Swiss'
  when category = 'flug' and label ilike '%easyjet%' then 'easyJet'
  when category = 'flug' and label ilike '%turkish%' then 'Turkish'
  when category = 'flug' and (label ilike '%pegasus%' or label ilike '%sunexpress%') then 'Pegasus und SunExpress'
  -- Unterkunft
  when category = 'unterkunft' and (label ilike '%airbnb%' or label ilike '%airbmb%' or label ilike '%klarna%') then 'Airbnb'
  when category = 'unterkunft' and (label ilike '%booking%' or label ilike '%bkg%') then 'Booking'
  when category = 'unterkunft' and label ilike '%agoda%' then 'Agoda'
  when category = 'unterkunft' and (label ilike '%hotel%' or label ilike '%accor%') then 'Hotel'
  -- Transport & Parken
  when category = 'transport' and label ilike '%sbb%' then 'SBB'
  when category = 'transport' and label ilike '%taxi%' then 'Taxi'
  when category = 'transport' and label ilike '%parking%' then 'Parken'
  when category = 'transport' and (label ilike '%miet%' or label ilike '%saga%' or label ilike '%reiese%') then 'Mietauto'
  -- Training & Coaching
  when category = 'training' and label ilike '%mental%' then 'Mentalcoaching'
  when category = 'training' and label ilike '%putting%' then 'Putting Coach'
  when category = 'training' and (label ilike '%physi%' or label ilike '%80%20%') then 'Physio und Kraft'
  when category = 'training' and (label ilike '%sportmedizin%' or label ilike '%schweisstest%') then 'Sportmedizin'
  -- Ausrüstung
  when category = 'ausruestung' and (label ilike '%schuh%' or label ilike '% on %') then 'Schuhe'
  when category = 'ausruestung' and (label ilike '%golbälle%' or label ilike '%tees%') then 'Bälle und Tees'
  when category = 'ausruestung' and label ilike '%yardage%' then 'Yardage Books'
  when category = 'ausruestung' and label ilike '%handschuh%' then 'Handschuhe'
  -- Verbände, Events, Fahrzeug
  when category = 'verbaende' and label ilike '%swisspga%' then 'SwissPGA'
  when category = 'verbaende' and label ilike '%swissgolf%' then 'SwissGolf'
  when category = 'events' and label ilike '%fotograf%' then 'Fotograf'
  when category = 'events' and label ilike '%gönnerturnier%' then 'Gönnerturnier'
  when category = 'fahrzeug' and label ilike '%versicherung%' then 'Versicherung'
  when category = 'fahrzeug' and label ilike '%kilometer%' then 'Kilometer'
  -- Abos & Software
  when category = 'abos' and label ilike '%salt%' then 'Salt'
  when category = 'abos' and label ilike '%chatgpt%' then 'ChatGPT'
  when category = 'abos' and label ilike '%domain%' then 'Domain'
  when category = 'abos' and label ilike '%cloud%' then 'Cloud'
  when category = 'abos' and (label ilike '%vpn%' or label ilike '%e-sim%') then 'VPN und E-Sim'
  -- Büro, Sonstiges
  when category = 'buero' and label ilike '%pixel%' then 'Handy'
  when category = 'sonst_golf' and label ilike '%ausgleichskasse%' then 'Ausgleichskasse'
  else subcategory
end
where subcategory = '';
