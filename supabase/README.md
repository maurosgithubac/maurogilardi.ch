# Supabase SQL prompts

Numbered scripts for the Supabase SQL Editor. **Higher number = newer. Newest file is always at the bottom.**

## Convention

- Filename: `NNN_short_snake_name.sql` (3-digit zero-padded)
- Next new prompt: take the highest existing number + 1 (currently next = `015_…`)
- Prefer additive migrations (`alter` / `create if not exists`) over rewriting older files when the DB may already be live
- Keep a short header comment: what it does + which earlier number it assumes

## Order (run top → bottom on a fresh project)

| # | File |
|---|------|
| 001 | newsletter_subscribers |
| 002 | blog_and_sponsors |
| 003 | admin_auth_rls |
| 004 | goenner_inquiries |
| 005 | goenner_inquiries_add_address |
| 006 | goenner_inquiries_membership_sponsoring |
| 007 | goenner_inquiries_status_amount |
| 008 | post_zweites_podium_pgt |
| 009 | goenner_inquiries_membership_hundert |
| 010 | goenner_finance |
| 011 | goenner_inquiries_inbox_fields |
| 012 | goenner_inquiries_delete_policy |
| 013 | post_sieg_in_den_niederlanden |
| 014 | post_juli_2026 |
