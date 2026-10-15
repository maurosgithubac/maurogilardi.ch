-- Reminder-Zeitpunkt an der Turnier-Einladung.
-- Run in Supabase SQL Editor. Assumes 023_tournament.sql.
-- 024_tournament_reminded_at.sql

alter table public.tournament_invites
  add column if not exists reminded_at timestamptz;
