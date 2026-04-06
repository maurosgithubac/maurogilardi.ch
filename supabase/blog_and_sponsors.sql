-- Run in Supabase SQL Editor.
-- After this file, run admin_auth_rls.sql for Supabase Auth–based admin + RLS on posts/sponsors/storage.
-- Storage: create two PUBLIC buckets in Dashboard → Storage:
--   blog-images
--   sponsor-logos
-- For each bucket: Public bucket = ON (or add policy for public read).

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  body text not null default '',
  image_path text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text not null,
  website_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_published_idx on public.posts (published);
create index if not exists sponsors_sort_idx on public.sponsors (sort_order);

alter table public.posts enable row level security;
alter table public.sponsors enable row level security;

drop policy if exists "Public read published posts" on public.posts;
create policy "Public read published posts"
  on public.posts for select
  using (published = true);

drop policy if exists "Public read active sponsors" on public.sponsors;
create policy "Public read active sponsors"
  on public.sponsors for select
  using (active = true);

-- Inserts/updates use service role (server API) and bypass RLS.
