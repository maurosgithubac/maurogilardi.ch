-- Budget: Ausgaben getrennt nach Golf (Geschäft) und Privat.
-- Run in Supabase SQL Editor. Assumes 003_admin_auth_rls.sql (public.admin_users).
-- 027_budget.sql

create table if not exists public.budget_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  amount_chf numeric(12,2) not null check (amount_chf >= 0),
  scope text not null check (scope in ('golf', 'privat')),
  category text not null check (char_length(category) between 2 and 60),
  label text not null default '' check (char_length(label) <= 200),
  frequency text not null default 'einmalig' check (frequency in ('einmalig', 'monatlich', 'jaehrlich')),
  ends_on date,
  created_at timestamptz not null default now()
);

create index if not exists budget_entries_date_idx on public.budget_entries (entry_date);

alter table public.budget_entries enable row level security;

drop policy if exists "Admins manage budget entries" on public.budget_entries;
create policy "Admins manage budget entries"
  on public.budget_entries for all
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));
