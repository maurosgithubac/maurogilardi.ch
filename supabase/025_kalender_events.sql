-- Kalender: Turniere und Trainingscamps, verwaltet im Admin, angezeigt auf /kalender.
-- Run in Supabase SQL Editor. Assumes 003_admin_auth_rls.sql (public.admin_users).
-- 025_kalender_events.sql

create table if not exists public.kalender_events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  start_date date not null,
  end_date date not null,
  location text not null check (char_length(location) between 2 and 200),
  country text not null default '' check (char_length(country) <= 80),
  lat double precision,
  lon double precision,
  kind text not null default 'turnier' check (kind in ('turnier', 'camp')),
  info_url text check (info_url is null or char_length(info_url) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists kalender_events_start_idx on public.kalender_events (start_date);

alter table public.kalender_events enable row level security;

drop policy if exists "Admins read kalender events" on public.kalender_events;
create policy "Admins read kalender events"
  on public.kalender_events for select
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins insert kalender events" on public.kalender_events;
create policy "Admins insert kalender events"
  on public.kalender_events for insert
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins update kalender events" on public.kalender_events;
create policy "Admins update kalender events"
  on public.kalender_events for update
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins delete kalender events" on public.kalender_events;
create policy "Admins delete kalender events"
  on public.kalender_events for delete
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

-- Startdaten: HotelPlanner Tour 2027 (bisheriger Stand aus dem Code)
insert into public.kalender_events (name, start_date, end_date, location, country, lat, lon, kind, info_url)
select * from (values
  ('Practice Camp Marrakesch', date '2027-01-08', date '2027-01-15', 'Marrakesch', 'Marokko', 31.63, -7.98, 'camp', null),
  ('SDC Open', date '2027-01-21', date '2027-01-24', 'Highland Gate, Dullstroom', 'Südafrika', -25.42, 30.12, 'turnier', 'https://www.europeantour.com/hotelplanner-tour/schedule/2027/'),
  ('Jonsson Workwear Durban Open', date '2027-01-28', date '2027-01-31', 'The Woods, Mount Edgecombe', 'Südafrika', -29.70, 31.07, 'turnier', 'https://www.europeantour.com/hotelplanner-tour/schedule/2027/'),
  ('CIRCA Cape Town Open', date '2027-02-04', date '2027-02-07', 'Royal Cape Golf Club, Kapstadt', 'Südafrika', -34.00, 18.46, 'turnier', 'https://www.europeantour.com/hotelplanner-tour/schedule/2027/'),
  ('NTT DATA Pro-Am in Partnership with Standard Bank', date '2027-02-11', date '2027-02-14', 'Fancourt, George', 'Südafrika', -33.96, 22.45, 'turnier', 'https://www.europeantour.com/hotelplanner-tour/schedule/2027/')
) as v (name, start_date, end_date, location, country, lat, lon, kind, info_url)
where not exists (select 1 from public.kalender_events);
