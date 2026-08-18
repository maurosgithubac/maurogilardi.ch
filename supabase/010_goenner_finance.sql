-- Gönner Finance Platform: members + payment ledger (from 2022).
-- Run in Supabase SQL Editor (service role / dashboard).
-- 010_goenner_finance.sql
-- Requires admin_users from 003_admin_auth_rls.sql.

create table if not exists public.goenner_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  street text,
  postal_code text,
  city text,
  membership_id text not null default 'birdie'
    check (membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring')),
  notes text,
  active boolean not null default true,
  inquiry_id uuid references public.goenner_inquiries (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goenner_members_name_idx on public.goenner_members (name);
create index if not exists goenner_members_email_idx on public.goenner_members (email);
create index if not exists goenner_members_active_idx on public.goenner_members (active);

create table if not exists public.goenner_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.goenner_members (id) on delete cascade,
  amount_chf numeric(10, 2) not null check (amount_chf >= 0 and amount_chf <= 1000000),
  paid_on date not null,
  year int generated always as (extract(year from paid_on)::int) stored,
  membership_id text
    check (membership_id is null or membership_id in ('hundert', 'birdie', 'eagle', 'albatros', 'sponsoring')),
  method text default 'other' check (method in ('twint', 'bank', 'cash', 'other')),
  note text,
  inquiry_id uuid references public.goenner_inquiries (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists goenner_payments_member_idx on public.goenner_payments (member_id);
create index if not exists goenner_payments_paid_on_idx on public.goenner_payments (paid_on desc);
create index if not exists goenner_payments_year_idx on public.goenner_payments (year);

alter table public.goenner_members enable row level security;
alter table public.goenner_payments enable row level security;

drop policy if exists "Admins read goenner members" on public.goenner_members;
create policy "Admins read goenner members"
  on public.goenner_members for select
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins insert goenner members" on public.goenner_members;
create policy "Admins insert goenner members"
  on public.goenner_members for insert
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins update goenner members" on public.goenner_members;
create policy "Admins update goenner members"
  on public.goenner_members for update
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins delete goenner members" on public.goenner_members;
create policy "Admins delete goenner members"
  on public.goenner_members for delete
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins read goenner payments" on public.goenner_payments;
create policy "Admins read goenner payments"
  on public.goenner_payments for select
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins insert goenner payments" on public.goenner_payments;
create policy "Admins insert goenner payments"
  on public.goenner_payments for insert
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins update goenner payments" on public.goenner_payments;
create policy "Admins update goenner payments"
  on public.goenner_payments for update
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));

drop policy if exists "Admins delete goenner payments" on public.goenner_payments;
create policy "Admins delete goenner payments"
  on public.goenner_payments for delete
  using (exists (select 1 from public.admin_users u where u.user_id = auth.uid()));
