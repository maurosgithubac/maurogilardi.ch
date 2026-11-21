-- Gönnerturnier: abgeschlossene Turniere ins Archiv legen (ein Turnier pro Jahr).
-- Run in Supabase SQL Editor. Assumes 023_tournament.sql.
-- 030_tournament_archive.sql

alter table public.tournaments
  add column if not exists archived_at timestamptz;

create index if not exists tournaments_archived_idx on public.tournaments (archived_at);
