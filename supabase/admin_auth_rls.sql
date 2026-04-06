-- Run in Supabase SQL Editor AFTER blog_and_sponsors.sql (and newsletter_subscribers.sql if used).
-- Optional: run goenner_inquiries.sql for Gönner membership form → admin inbox.
-- Prereqs:
--   1. Buckets: blog-images, sponsor-logos (public read in Dashboard if you prefer UI).
--   2. Create an auth user: Authentication → Users → Add user (email + password).
--   3. Promote to admin (replace UUID):
--        insert into public.admin_users (user_id)
--        values ('00000000-0000-0000-0000-000000000000')
--        on conflict (user_id) do nothing;
--   4. Optional: disable "Confirm email" for admin-only emails (Auth → Providers → Email).

-- ---------------------------------------------------------------------------
-- Admin allowlist (linked to auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists admin_users_user_id_idx on public.admin_users (user_id);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read own membership" on public.admin_users;
create policy "Admins can read own membership"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- No insert/update/delete for authenticated: add rows only via SQL or service role.

-- ---------------------------------------------------------------------------
-- posts: keep public SELECT for published; admins get full CRUD via JWT
-- ---------------------------------------------------------------------------
drop policy if exists "Public read published posts" on public.posts;
drop policy if exists "Admins read all posts" on public.posts;
drop policy if exists "Admins insert posts" on public.posts;
drop policy if exists "Admins update posts" on public.posts;
drop policy if exists "Admins delete posts" on public.posts;

create policy "Public read published posts"
  on public.posts for select
  using (published = true);

create policy "Admins read all posts"
  on public.posts for select
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

create policy "Admins insert posts"
  on public.posts for insert
  with check (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

create policy "Admins update posts"
  on public.posts for update
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

create policy "Admins delete posts"
  on public.posts for delete
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- sponsors: public SELECT active; admins full CRUD
-- ---------------------------------------------------------------------------
drop policy if exists "Public read active sponsors" on public.sponsors;
drop policy if exists "Admins read all sponsors" on public.sponsors;
drop policy if exists "Admins insert sponsors" on public.sponsors;
drop policy if exists "Admins update sponsors" on public.sponsors;
drop policy if exists "Admins delete sponsors" on public.sponsors;

create policy "Public read active sponsors"
  on public.sponsors for select
  using (active = true);

create policy "Admins read all sponsors"
  on public.sponsors for select
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

create policy "Admins insert sponsors"
  on public.sponsors for insert
  with check (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

create policy "Admins update sponsors"
  on public.sponsors for update
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

create policy "Admins delete sponsors"
  on public.sponsors for delete
  using (
    exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Storage: public read + admin upload (JWT must be present on upload request)
-- ---------------------------------------------------------------------------
drop policy if exists "Public read blog images" on storage.objects;
create policy "Public read blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "Public read sponsor logos" on storage.objects;
create policy "Public read sponsor logos"
  on storage.objects for select
  using (bucket_id = 'sponsor-logos');

drop policy if exists "Admins upload blog images" on storage.objects;
create policy "Admins upload blog images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );

drop policy if exists "Admins upload sponsor logos" on storage.objects;
create policy "Admins upload sponsor logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'sponsor-logos'
    and exists (select 1 from public.admin_users u where u.user_id = auth.uid())
  );
