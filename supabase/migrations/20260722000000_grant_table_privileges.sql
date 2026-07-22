-- Postgres denies access at the table-privilege layer before RLS policies
-- are ever evaluated. Supabase's hosted platform normally auto-provisions
-- these grants for a new project, so none of the migrations so far have
-- had to state them explicitly — but this repo's local dev stack applies a
-- more restrictive default (anon/authenticated only get TRUNCATE/REFERENCES/
-- TRIGGER/MAINTAIN on public tables), which silently blocked every anon/
-- authenticated query and insert regardless of how correct the RLS policies
-- were. Table grants stay broad here on purpose; RLS remains the actual
-- access gate.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
