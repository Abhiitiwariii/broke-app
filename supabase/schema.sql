-- Broke? — cloud sync schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- One JSON blob per user; row-level security so each user only ever
-- touches their own row (the anon key in the browser can't bypass this).

create table if not exists public.profiles_data (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles_data enable row level security;

-- Each policy restricts access to the caller's own row (auth.uid() = user_id).
create policy "profiles_data_select_own"
  on public.profiles_data for select
  using (auth.uid() = user_id);

create policy "profiles_data_insert_own"
  on public.profiles_data for insert
  with check (auth.uid() = user_id);

create policy "profiles_data_update_own"
  on public.profiles_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_data_delete_own"
  on public.profiles_data for delete
  using (auth.uid() = user_id);


-- ============================================================
-- LOGIN DETAILS
-- NOTE: credentials/sessions already live in Supabase's managed
-- `auth.users` table — never store passwords or tokens yourself.
-- This `profiles` table just mirrors the readable bits (email,
-- name, avatar, provider) and is auto-filled on signup.
-- We drop any pre-existing `profiles` first so its old columns
-- don't clash (safe on a fresh project with no profile data).
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id              uuid        primary key references auth.users (id) on delete cascade,
  email           text,
  full_name       text,
  avatar_url      text,
  provider        text,
  created_at      timestamptz not null default now(),
  last_sign_in_at timestamptz
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create/refresh a profile row whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider, last_sign_in_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    new.last_sign_in_at
  )
  on conflict (id) do update set
    email           = excluded.email,
    full_name       = excluded.full_name,
    avatar_url      = excluded.avatar_url,
    last_sign_in_at = excluded.last_sign_in_at;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
