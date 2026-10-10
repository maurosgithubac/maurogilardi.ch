-- Preisgelder: Art unterscheiden — Turnier-Preisgeld oder ProAm.
-- Ausführen in Supabase (SQL Editor). Idempotent. Setzt 020 voraus.

alter table public.prize_money
  add column if not exists kind text not null default 'prize'
    check (kind in ('prize', 'proam'));

-- Importierte Einträge «ProGolf Tour ProAm» → Art ProAm, Turnier ohne Zusatz
update public.prize_money
   set kind = 'proam',
       tournament = trim(regexp_replace(tournament, '\s*pro-?am\s*$', '', 'i')),
       updated_at = now()
 where tournament ~* '\mpro-?am\s*$';

create index if not exists prize_money_kind_idx on public.prize_money (kind);
