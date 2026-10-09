-- Gönner-Mail-Ablauf: Zahlungsart, Rechnungsnummer und Versand-Zeitstempel
-- Ausführen in Supabase (SQL Editor). Idempotent.

alter table public.goenner_inquiries
  add column if not exists payment_method text
    check (payment_method in ('rechnung', 'twint')),
  add column if not exists invoice_number text unique,
  add column if not exists invoice_mail_sent_at timestamptz,
  add column if not exists thank_you_sent_at timestamptz,
  add column if not exists reminder_sent_at timestamptz;

-- Bestehende Anfragen: 100er Club ist immer TWINT
update public.goenner_inquiries
   set payment_method = 'twint'
 where payment_method is null and membership_id = 'hundert';

create index if not exists goenner_inquiries_invoice_pending_idx
  on public.goenner_inquiries (invoice_mail_sent_at)
  where payment_method = 'rechnung' and status = 'open';
