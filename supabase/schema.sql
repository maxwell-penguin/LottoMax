-- Run in the Supabase SQL editor.
create table if not exists guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  ip_hash text not null
);

alter table guestbook_entries enable row level security;
create policy "anon read" on guestbook_entries for select to anon using (true);
create policy "anon insert" on guestbook_entries for insert to anon with check (true);

-- No update/delete for anon; ip_hash is never readable from the client.
revoke all on guestbook_entries from anon;
grant select (id, name, created_at) on guestbook_entries to anon;
grant insert (name, ip_hash) on guestbook_entries to anon;

-- 1 entry per ip_hash per 24h, enforced server-side.
create or replace function guestbook_rate_limit() returns trigger
language plpgsql as $$
begin
  if exists (
    select 1 from guestbook_entries
    where ip_hash = new.ip_hash and created_at > now() - interval '24 hours'
  ) then
    raise exception 'rate_limited';
  end if;
  return new;
end $$;

drop trigger if exists guestbook_rate_limit_trg on guestbook_entries;
create trigger guestbook_rate_limit_trg before insert on guestbook_entries
  for each row execute function guestbook_rate_limit();

-- Lets the client ask "did this visitor already sign?" without reading ip_hash.
create or replace function guestbook_has_signed(p_ip_hash text) returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1 from guestbook_entries
    where ip_hash = p_ip_hash and created_at > now() - interval '24 hours'
  );
$$;
grant execute on function guestbook_has_signed(text) to anon;
