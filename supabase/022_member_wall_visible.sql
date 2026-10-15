-- Name auf der öffentlichen Gönner-Wand ein- oder ausblenden.
-- Run in Supabase SQL Editor. Assumes 010_goenner_finance.sql.
-- 022_member_wall_visible.sql

alter table public.goenner_members
  add column if not exists wall_visible boolean not null default false;

comment on column public.goenner_members.wall_visible is
  'true = Name erscheint im Laufband auf der Website. Unabhängig von active.';

-- Bestehende öffentliche Liste auf die Personen im Admin abbilden.
-- Schreibweisen im Portal weichen teils von der alten festen Liste ab.
update public.goenner_members
set wall_visible = true
where name in (
  'Gisi / Patrick Falk',
  'Marc Gilardi',
  'Denise&Patrick Spescha',
  'Claudio Casutt',
  'Gabriela Hürzeler',
  'Luzi Willi',
  'Ines Danuser',
  'Philippe Freiburghaus',
  'Marc Flückiger',
  'Roman Fümberger',
  'Hans Peter Uster',
  'Klemens Binswanger',
  'Patrik Stöckli',
  'Giovanna Meyrat',
  'Serge Mauser',
  'Alexander Grupp',
  'Reto Hartmann',
  'Claudio Blaesi',
  'FOSGT Gilbert Vollmer',
  'Emanuele Giulini',
  'Marco Hürzeler',
  'Franz Allenspach',
  'Nino Ziegler',
  'Marco Membrini',
  'Mario & Ruth Padrun',
  'Karin Fischer Olgiati',
  'Reto Lendenmann',
  'Marco De-Steffani',
  'Golf Club Domat/Ems',
  'Elvira Knecht',
  'Micke Fernström',
  'Peter Brunner',
  'Werner Steinauer',
  'Franco Cavegn',
  'Marco Walser',
  'Leandro Degani',
  'Barbara Wehrle',
  'Markus Theus',
  'Thomas Pool',
  'Alfons Livers',
  'Rolf Schönbächler',
  'Roland & Corinne Anderegg',
  'Brigitte Koller',
  'Petra Hartmann'
);
