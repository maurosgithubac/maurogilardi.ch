-- Admin-Portal: Gelesen-Status für Eingänge und Preisgelder pro Saison.
-- Ausführen in Supabase (SQL Editor). Idempotent. Setzt 003 (admin_users) und 019 voraus.

-- 1) Eingänge: seen_at = wann die Anfrage im Admin geöffnet wurde (null = neu/ungelesen).
--    Beim ersten Ausführen gelten alle bestehenden Anfragen als gelesen.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'goenner_inquiries' and column_name = 'seen_at'
  ) then
    alter table public.goenner_inquiries add column seen_at timestamptz;
    update public.goenner_inquiries set seen_at = now();
  end if;
end $$;

create index if not exists goenner_inquiries_unseen_idx
  on public.goenner_inquiries (created_at desc)
  where seen_at is null;

-- 2) Preisgelder: Einnahmen aus Turnieren, zählen zu den Saison-Einnahmen.
create table if not exists public.prize_money (
  id uuid primary key default gen_random_uuid(),
  tournament text not null check (char_length(tournament) between 1 and 200),
  tour text check (tour is null or char_length(tour) <= 120),
  event_date date not null,
  year int generated always as (extract(year from event_date)::int) stored,
  placement text check (placement is null or char_length(placement) <= 40),
  amount_chf numeric(10, 2) not null check (amount_chf >= 0 and amount_chf <= 1000000),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prize_money_year_idx on public.prize_money (year);
create index if not exists prize_money_event_date_idx on public.prize_money (event_date desc);

alter table public.prize_money enable row level security;

drop policy if exists "Admins read prize money" on public.prize_money;
create policy "Admins read prize money"
  on public.prize_money for select
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins insert prize money" on public.prize_money;
create policy "Admins insert prize money"
  on public.prize_money for insert
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins update prize money" on public.prize_money;
create policy "Admins update prize money"
  on public.prize_money for update
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins delete prize money" on public.prize_money;
create policy "Admins delete prize money"
  on public.prize_money for delete
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));
