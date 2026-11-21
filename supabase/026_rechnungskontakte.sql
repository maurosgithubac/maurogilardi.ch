-- Rechnungskontakte: frei angelegte Empfänger für den Rechnungs-Tab im Admin.
-- Run in Supabase SQL Editor. Assumes 003_admin_auth_rls.sql (public.admin_users).
-- 026_rechnungskontakte.sql

create table if not exists public.rechnungskontakte (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  organization text not null default '' check (char_length(organization) <= 160),
  street text not null default '' check (char_length(street) <= 200),
  postal_code text not null default '' check (char_length(postal_code) <= 16),
  city text not null default '' check (char_length(city) <= 120),
  email text not null default '' check (char_length(email) <= 200),
  created_at timestamptz not null default now()
);

alter table public.rechnungskontakte enable row level security;

drop policy if exists "Admins manage rechnungskontakte" on public.rechnungskontakte;
create policy "Admins manage rechnungskontakte"
  on public.rechnungskontakte for all
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));
