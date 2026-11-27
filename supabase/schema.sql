-- Run in the Supabase SQL editor.
create extension if not exists pgcrypto;

-- ── Visitor log ─────────────────────────────────────────────────────────────
create table if not exists site_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now(),
  ip_hash text not null check (char_length(ip_hash) = 64), -- SHA-256 hex; the raw IP is never stored
  city text check (char_length(city) <= 120),
  region text check (char_length(region) <= 120),
  country text check (char_length(country) <= 8),
  org text check (char_length(org) <= 200),
  page text check (char_length(page) <= 120),
  user_agent text check (char_length(user_agent) <= 400)
);

alter table site_visits enable row level security;

-- Visitors may INSERT only. There is deliberately NO select/update/delete policy,
-- so the anon key can never read the table; only the service role / SQL editor can.
drop policy if exists "anon can insert visits" on site_visits;
create policy "anon can insert visits" on site_visits for insert to anon with check (true);
revoke all on site_visits from anon, authenticated;
grant insert (ip_hash, city, region, country, org, page, user_agent) on site_visits to anon;

-- ── Admin read access (password checked server-side) ───────────────────────
create table if not exists admin_secrets (
  id int primary key default 1 check (id = 1),
  password_hash text not null
);
alter table admin_secrets enable row level security; -- no policies: unreadable from the client
revoke all on admin_secrets from anon, authenticated;

-- Set / change your admin password (run this yourself, with your real password):
--   insert into admin_secrets (password_hash) values (crypt('YOUR-PASSWORD', gen_salt('bf')))
--   on conflict (id) do update set password_hash = excluded.password_hash;

create or replace function site_visits_admin(p_password text, p_limit int default 100)
returns setof site_visits
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (select 1 from admin_secrets where password_hash = crypt(p_password, password_hash)) then
    perform pg_sleep(1); -- slow down guessing
    raise exception 'unauthorized';
  end if;
  return query select * from site_visits order by visited_at desc limit least(greatest(p_limit, 1), 500);
end;
$$;

revoke all on function site_visits_admin(text, int) from public;
grant execute on function site_visits_admin(text, int) to anon;
