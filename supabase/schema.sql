-- ============================================================================
-- BuurtBieb.nl - Supabase Production Database Schema (Idempotent & Gehard)
-- 8 Tabellen + Indexen + Strikte RLS + Veilige Status-RPC's + Realtime
-- Klaar om in één keer uit te voeren in de Supabase SQL Editor.
-- ============================================================================

create table if not exists public.profiles (
  id text primary key,
  email text not null default '',
  bieb_name text not null,
  has_physical_box boolean not null default false,
  postal_code_4 text not null default '',
  postal_code_full text not null default '',
  street_address text not null default '',
  city text not null default '',
  lat double precision,
  lng double precision,
  theme text not null default 'groen_tuinhuis',
  contact_methods jsonb not null default '["in_app_chat"]'::jsonb,
  whatsapp_number text not null default '',
  books_shared_count integer not null default 0,
  needs_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_private (
  user_id text primary key references public.profiles(id) on delete cascade,
  email text not null default '',
  whatsapp_number text not null default '',
  updated_at timestamptz not null default now()
);

-- Bestaande gevoelige velden veilig migreren naar profile_private en opruimen op profiles
insert into public.profile_private (user_id, email, whatsapp_number, updated_at)
select id, coalesce(email, ''), coalesce(whatsapp_number, ''), now()
from public.profiles
where coalesce(email, '') <> '' or coalesce(whatsapp_number, '') <> ''
on conflict (user_id) do update
  set email = case when excluded.email <> '' then excluded.email else public.profile_private.email end,
      whatsapp_number = case when excluded.whatsapp_number <> '' then excluded.whatsapp_number else public.profile_private.whatsapp_number end,
      updated_at = now();

drop index if exists public.profiles_email_lower_idx;
update public.profiles set email = '' where email <> '';
alter table public.profiles drop column if exists password_hash;

create unique index if not exists profiles_bieb_name_lower_idx on public.profiles (lower(btrim(bieb_name)));

create table if not exists public.books (
  id text primary key,
  owner_id text not null,
  owner_bieb_name text not null default '',
  owner_whatsapp text not null default '',
  isbn text not null default '',
  title text not null,
  author text not null,
  cover_url text not null default '',
  description text not null default '',
  sticker_type text not null default 'zwerfboek',
  genre text not null default 'Literatuur & Roman',
  market_category text not null default 'Literatuur & Roman',
  book_language text not null default 'nl',
  price_eur numeric(8,2) not null default 0,
  book_condition text not null default 'goed',
  allow_bidding boolean not null default false,
  pickup_possible boolean not null default true,
  self_service_box boolean not null default false,
  shipping_possible boolean not null default false,
  deposit_type text not null default 'geen',
  deposit_amount_eur numeric(8,2) not null default 0,
  status text not null default 'beschikbaar',
  reserved_by_id text,
  reserved_by_name text,
  reserved_handover text,
  handover_confirmed boolean not null default false,
  handover_completed_count integer not null default 0,
  taken_at timestamptz,
  postal_code_4 text not null default '',
  city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stamps (
  id text primary key,
  book_id text not null,
  reader_name text not null,
  city text not null default '',
  postal_code_4 text not null default '',
  stamp_style text not null default 'poststempel_groen',
  comment text not null default '',
  stamped_at text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.wanted_books (
  id text primary key,
  seeker_id text not null,
  seeker_name text not null,
  postal_code_4 text not null default '',
  city text not null default '',
  title text not null,
  author text not null default '',
  genre text not null default 'Literatuur & Roman',
  prefer_mode text not null default 'lenen_of_ruilen',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id text primary key,
  book_id text not null,
  book_title text not null default '',
  sticker_type text not null default 'zwerfboek',
  requester_id text not null,
  owner_id text not null,
  handover_mode text not null default 'aan_de_deur_1op1',
  handover_confirmed boolean not null default false,
  is_paid boolean not null default false,
  status text not null default 'klaargelegd',
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id text primary key,
  book_id text not null,
  book_title text not null default '',
  book_author text not null default '',
  book_cover text not null default '',
  sticker_type text not null default 'zwerfboek',
  owner_id text not null,
  owner_bieb_name text not null default '',
  owner_postal text not null default '',
  owner_city text not null default '',
  requester_id text not null,
  requester_bieb_name text not null default '',
  handover_mode text not null default 'aan_de_deur_1op1',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  conversation_id text not null,
  sender_id text not null,
  sender_name text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXEN VOOR RLS & QUERY PERFORMANCE
-- ============================================================================
create index if not exists idx_books_owner_id on public.books (owner_id);
create index if not exists idx_books_status on public.books (status);
create index if not exists idx_stamps_book_id on public.stamps (book_id);
create index if not exists idx_wanted_books_seeker_id on public.wanted_books (seeker_id);
create index if not exists idx_requests_requester_id on public.requests (requester_id);
create index if not exists idx_requests_owner_id on public.requests (owner_id);
create index if not exists idx_conversations_owner_id on public.conversations (owner_id);
create index if not exists idx_conversations_requester_id on public.conversations (requester_id);
create index if not exists idx_messages_conversation_id on public.messages (conversation_id);

-- ============================================================================
-- STRIKTE ROW LEVEL SECURITY (RLS) & GRANTS
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.books enable row level security;
alter table public.stamps enable row level security;
alter table public.wanted_books enable row level security;
alter table public.requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Verwijder oude open policies indien nog aanwezig
drop policy if exists "buurtbieb_profiles_all" on public.profiles;
drop policy if exists "buurtbieb_books_all" on public.books;
drop policy if exists "buurtbieb_stamps_all" on public.stamps;
drop policy if exists "buurtbieb_wanted_books_all" on public.wanted_books;
drop policy if exists "buurtbieb_requests_all" on public.requests;
drop policy if exists "buurtbieb_conversations_all" on public.conversations;
drop policy if exists "buurtbieb_messages_all" on public.messages;
drop policy if exists "books_update_owner_or_borrower" on public.books;

-- Beperk anon tot alleen lezen van publieke catalogus-tabellen
revoke all on public.profiles, public.profile_private, public.books, public.stamps, public.wanted_books, public.requests, public.conversations, public.messages from anon;
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.books, public.stamps, public.wanted_books to anon;
grant select, insert, update, delete on public.profiles, public.profile_private, public.books, public.stamps, public.wanted_books, public.requests, public.conversations, public.messages to authenticated;

-- profiles (publieke catalogusgegevens; schrijven alleen door eigenaar via Supabase Auth)
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid())::text = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid())::text = id)
  with check ((select auth.uid())::text = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using ((select auth.uid())::text = id);

-- profile_private (strikt eigenaar-only)
drop policy if exists "profile_private_select_own" on public.profile_private;
create policy "profile_private_select_own" on public.profile_private
  for select to authenticated using ((select auth.uid())::text = user_id);

drop policy if exists "profile_private_insert_own" on public.profile_private;
create policy "profile_private_insert_own" on public.profile_private
  for insert to authenticated with check ((select auth.uid())::text = user_id);

drop policy if exists "profile_private_update_own" on public.profile_private;
create policy "profile_private_update_own" on public.profile_private
  for update to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

drop policy if exists "profile_private_delete_own" on public.profile_private;
create policy "profile_private_delete_own" on public.profile_private
  for delete to authenticated using ((select auth.uid())::text = user_id);

-- books (alleen eigenaar mag direct updaten/verwijderen; reserveren/overdracht gaat via veilige RPC)
drop policy if exists "books_select_public" on public.books;
create policy "books_select_public" on public.books
  for select to anon, authenticated using (true);

drop policy if exists "books_insert_own" on public.books;
create policy "books_insert_own" on public.books
  for insert to authenticated with check ((select auth.uid())::text = owner_id);

drop policy if exists "books_update_own" on public.books;
create policy "books_update_own" on public.books
  for update to authenticated
  using ((select auth.uid())::text = owner_id)
  with check ((select auth.uid())::text = owner_id);

drop policy if exists "books_delete_own" on public.books;
create policy "books_delete_own" on public.books
  for delete to authenticated using ((select auth.uid())::text = owner_id);

-- stamps
drop policy if exists "stamps_select_public" on public.stamps;
create policy "stamps_select_public" on public.stamps
  for select to anon, authenticated using (true);

drop policy if exists "stamps_insert_authenticated" on public.stamps;
create policy "stamps_insert_authenticated" on public.stamps
  for insert to authenticated with check ((select auth.uid()) is not null);

-- wanted_books
drop policy if exists "wanted_books_select_public" on public.wanted_books;
create policy "wanted_books_select_public" on public.wanted_books
  for select to anon, authenticated using (true);

drop policy if exists "wanted_books_insert_own" on public.wanted_books;
create policy "wanted_books_insert_own" on public.wanted_books
  for insert to authenticated with check ((select auth.uid())::text = seeker_id);

drop policy if exists "wanted_books_update_own" on public.wanted_books;
create policy "wanted_books_update_own" on public.wanted_books
  for update to authenticated
  using ((select auth.uid())::text = seeker_id)
  with check ((select auth.uid())::text = seeker_id);

drop policy if exists "wanted_books_delete_own" on public.wanted_books;
create policy "wanted_books_delete_own" on public.wanted_books
  for delete to authenticated using ((select auth.uid())::text = seeker_id);

-- requests (deelnemers-only)
drop policy if exists "requests_select_participant" on public.requests;
create policy "requests_select_participant" on public.requests
  for select to authenticated
  using ((select auth.uid())::text = requester_id or (select auth.uid())::text = owner_id);

drop policy if exists "requests_insert_requester" on public.requests;
create policy "requests_insert_requester" on public.requests
  for insert to authenticated with check ((select auth.uid())::text = requester_id);

drop policy if exists "requests_update_participant" on public.requests;
create policy "requests_update_participant" on public.requests
  for update to authenticated
  using ((select auth.uid())::text = requester_id or (select auth.uid())::text = owner_id)
  with check ((select auth.uid())::text = requester_id or (select auth.uid())::text = owner_id);

drop policy if exists "requests_delete_participant" on public.requests;
create policy "requests_delete_participant" on public.requests
  for delete to authenticated
  using ((select auth.uid())::text = requester_id or (select auth.uid())::text = owner_id);

-- conversations (deelnemers-only, geen zelf-chat)
drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations
  for select to authenticated
  using ((select auth.uid())::text = owner_id or (select auth.uid())::text = requester_id);

drop policy if exists "conversations_insert_requester" on public.conversations;
create policy "conversations_insert_requester" on public.conversations
  for insert to authenticated
  with check ((select auth.uid())::text = requester_id and owner_id <> requester_id);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant" on public.conversations
  for update to authenticated
  using ((select auth.uid())::text = owner_id or (select auth.uid())::text = requester_id)
  with check ((select auth.uid())::text = owner_id or (select auth.uid())::text = requester_id);

drop policy if exists "conversations_delete_participant" on public.conversations;
create policy "conversations_delete_participant" on public.conversations
  for delete to authenticated
  using ((select auth.uid())::text = owner_id or (select auth.uid())::text = requester_id);

-- messages (deelnemers-only)
drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and ((select auth.uid())::text = c.owner_id or (select auth.uid())::text = c.requester_id)
    )
  );

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages
  for insert to authenticated
  with check (
    (select auth.uid())::text = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and ((select auth.uid())::text = c.owner_id or (select auth.uid())::text = c.requester_id)
    )
  );

drop policy if exists "messages_update_read_recipient" on public.messages;
create policy "messages_update_read_recipient" on public.messages
  for update to authenticated
  using (
    sender_id <> (select auth.uid())::text
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and ((select auth.uid())::text = c.owner_id or (select auth.uid())::text = c.requester_id)
    )
  )
  with check (sender_id <> (select auth.uid())::text);

drop policy if exists "messages_delete_participant" on public.messages;
create policy "messages_delete_participant" on public.messages
  for delete to authenticated
  using (
    (select auth.uid())::text = sender_id
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and ((select auth.uid())::text = c.owner_id or (select auth.uid())::text = c.requester_id)
    )
  );

-- ============================================================================
-- VEILIGE RPC-FUNCTIES VOOR BOEKSTATUS (ALLEEN STATUS/RESERVERING, NOOIT TITEL/PRIJS)
-- ============================================================================

create or replace function public.reserve_book_rpc(
  p_book_id text,
  p_handover_mode text,
  p_reserver_name text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := auth.uid()::text;
begin
  if v_uid is null then
    raise exception 'Niet ingelogd';
  end if;

  update public.books
  set status = 'gereserveerd',
      reserved_by_id = v_uid,
      reserved_by_name = left(coalesce(nullif(btrim(p_reserver_name), ''), 'Buurtgenoot'), 120),
      reserved_handover = coalesce(nullif(btrim(p_handover_mode), ''), 'aan_de_deur_1op1'),
      handover_confirmed = false,
      updated_at = now()
  where id = p_book_id
    and owner_id <> v_uid
    and status = 'beschikbaar';

  if not found then
    raise exception 'Boek is niet beschikbaar of van jezelf';
  end if;
end;
$$;

create or replace function public.confirm_book_handover_rpc(
  p_book_id text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := auth.uid()::text;
begin
  if v_uid is null then
    raise exception 'Niet ingelogd';
  end if;

  update public.books
  set status = case when sticker_type = 'leenboek' then 'uitgeleend' else 'overgedragen' end,
      handover_confirmed = true,
      handover_completed_count = coalesce(handover_completed_count, 0) + 1,
      updated_at = now()
  where id = p_book_id
    and (owner_id = v_uid or reserved_by_id = v_uid);

  if not found then
    raise exception 'Geen rechten om overdracht te bevestigen';
  end if;
end;
$$;

create or replace function public.return_borrowed_book_rpc(
  p_book_id text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := auth.uid()::text;
begin
  if v_uid is null then
    raise exception 'Niet ingelogd';
  end if;

  update public.books
  set status = 'beschikbaar',
      reserved_by_id = null,
      reserved_by_name = null,
      reserved_handover = null,
      handover_confirmed = false,
      updated_at = now()
  where id = p_book_id
    and (owner_id = v_uid or reserved_by_id = v_uid);

  if not found then
    raise exception 'Geen rechten om boek terug te zetten';
  end if;
end;
$$;

create or replace function public.mark_minibieb_book_taken_rpc(
  p_book_id text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := auth.uid()::text;
begin
  if v_uid is null then
    raise exception 'Niet ingelogd';
  end if;

  update public.books
  set status = 'meegenomen',
      taken_at = now(),
      updated_at = now()
  where id = p_book_id
    and self_service_box = true
    and status = 'beschikbaar';

  if not found then
    raise exception 'Boek is niet beschikbaar in een fysieke MiniBieb';
  end if;
end;
$$;

revoke all on function public.reserve_book_rpc(text, text, text) from public, anon;
revoke all on function public.confirm_book_handover_rpc(text) from public, anon;
revoke all on function public.return_borrowed_book_rpc(text) from public, anon;
revoke all on function public.mark_minibieb_book_taken_rpc(text) from public, anon;

grant execute on function public.reserve_book_rpc(text, text, text) to authenticated;
grant execute on function public.confirm_book_handover_rpc(text) to authenticated;
grant execute on function public.return_borrowed_book_rpc(text) to authenticated;
grant execute on function public.mark_minibieb_book_taken_rpc(text) to authenticated;

-- ============================================================================
-- REALTIME PUBLICATIE
-- ============================================================================
do $$ begin alter publication supabase_realtime add table public.profiles; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.books; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.stamps; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.wanted_books; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.requests; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.conversations; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;
