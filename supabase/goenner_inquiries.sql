-- Run in Supabase SQL Editor after blog_and_sponsors.sql (and admin_users from admin_auth_rls.sql).
-- Inserts come from the Next.js API via service role (bypasses RLS).
-- Admins read rows in the portal with their JWT (policy below).

create table if not exists public.goenner_inquiries (
  id uuid primary key default gen_random_uuid(),
  membership_id text not null check (membership_id in ('birdie', 'eagle', 'albatros')),
  name text not null,
  email text not null,
  phone text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists goenner_inquiries_created_at_idx on public.goenner_inquiries (created_at desc);

alter table public.goenner_inquiries enable row level security;

drop policy if exists "Admins read goenner inquiries" on public.goenner_inquiries;
create policy "Admins read goenner inquiries"
  on public.goenner_inquiries for select
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );
