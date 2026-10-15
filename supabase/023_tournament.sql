-- Gönnerturnier: ein Anlass pro Jahr, persönliche Einladungslinks.
-- Run in Supabase SQL Editor. Assumes 010_goenner_finance.sql and 003_admin_auth_rls.sql.
-- 023_tournament.sql

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  event_date date not null,
  place text not null default 'Domat/Ems' check (char_length(place) between 2 and 120),
  clinic_time text not null default 'Vormittag' check (char_length(clinic_time) between 1 and 40),
  first_flight_time text not null default '12:00' check (char_length(first_flight_time) between 1 and 40),
  dinner_time text not null default '18:30' check (char_length(dinner_time) between 1 and 40),
  intro text check (intro is null or char_length(intro) <= 2000),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_invites (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  member_id uuid references public.goenner_members (id) on delete set null,
  kind text not null check (kind in ('clinic', 'round')),
  token text not null unique check (char_length(token) between 8 and 32),
  name text not null check (char_length(name) between 2 and 160),
  email text not null check (char_length(email) between 3 and 200),
  clinic boolean,
  golf_round boolean,
  dinner boolean,
  note text check (note is null or char_length(note) <= 500),
  invited_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, member_id),
  unique (tournament_id, email)
);

create index if not exists tournament_invites_tournament_idx
  on public.tournament_invites (tournament_id);

alter table public.tournaments enable row level security;
alter table public.tournament_invites enable row level security;

drop policy if exists "Admins read tournaments" on public.tournaments;
create policy "Admins read tournaments"
  on public.tournaments for select
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins insert tournaments" on public.tournaments;
create policy "Admins insert tournaments"
  on public.tournaments for insert
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins update tournaments" on public.tournaments;
create policy "Admins update tournaments"
  on public.tournaments for update
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins delete tournaments" on public.tournaments;
create policy "Admins delete tournaments"
  on public.tournaments for delete
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins read tournament invites" on public.tournament_invites;
create policy "Admins read tournament invites"
  on public.tournament_invites for select
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins insert tournament invites" on public.tournament_invites;
create policy "Admins insert tournament invites"
  on public.tournament_invites for insert
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins update tournament invites" on public.tournament_invites;
create policy "Admins update tournament invites"
  on public.tournament_invites for update
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins delete tournament invites" on public.tournament_invites;
create policy "Admins delete tournament invites"
  on public.tournament_invites for delete
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));
