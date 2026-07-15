# Local dev database

```
supabase start        # first time / after a reboot
supabase db reset     # applies migrations + supabase/seed.sql
```

## Seeded logins

Password for all seeded users: `password123`

| Email | Role | Business | Plan | Status |
|---|---|---|---|---|
| owner-standard@seed.hapag.ph | owner | Kubo Kitchen (`kubo-kitchen`) | standard | active |
| owner-pro@seed.hapag.ph | owner | Manila Meze (`manila-meze`) | pro | active |
| owner-pending@seed.hapag.ph | owner | Isla Grill (`isla-grill`) | standard | pending — has a pending subscription in the Payment Queue |
| owner-suspended@seed.hapag.ph | owner | Barrio Bites (`barrio-bites`) | standard | suspended — expired subscription, for the S-03 flow |
| admin@seed.hapag.ph | admin | — | — | — |

All IDs and slugs in `seed.sql` are fixed literals, not generated — safe to hardcode in test code or links (e.g. `/menu/kubo-kitchen`).

Also seeded: sold-out + best-seller items on Kubo Kitchen, bilingual EN/TL items on Manila Meze (pro), and 3 support tickets (open / in_progress / resolved-with-reply) across businesses.

Re-run `supabase db reset` any time the seed data gets stale or a migration changes the schema — don't hand-edit seeded rows in the running DB, since a reset will wipe them.
