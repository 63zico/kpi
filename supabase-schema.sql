create table if not exists public.doya_app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.doya_app_state enable row level security;

drop policy if exists "doya_app_state_read" on public.doya_app_state;
drop policy if exists "doya_app_state_insert" on public.doya_app_state;
drop policy if exists "doya_app_state_update" on public.doya_app_state;

create policy "doya_app_state_read"
on public.doya_app_state
for select
to anon
using (true);

create policy "doya_app_state_insert"
on public.doya_app_state
for insert
to anon
with check (true);

create policy "doya_app_state_update"
on public.doya_app_state
for update
to anon
using (true)
with check (true);

-- Launch-ready multi-store auth structure.
-- The current static app includes a client-side gate for immediate testing.
-- Apply and tighten these tables/policies before selling to outside stores.

create table if not exists public.levelove_stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.levelove_memberships (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.levelove_stores(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'admin', 'manager', 'employee')),
  staff_id text,
  staff_role text,
  display_name text,
  created_at timestamptz not null default now(),
  unique(store_id, user_id)
);

create table if not exists public.levelove_invites (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.levelove_stores(id) on delete cascade,
  code text not null unique,
  access_role text not null check (access_role in ('admin', 'manager', 'employee')),
  staff_role text,
  staff_name text,
  staff_id text,
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_by uuid,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.levelove_stores enable row level security;
alter table public.levelove_memberships enable row level security;
alter table public.levelove_invites enable row level security;

-- TODO before public launch:
-- 1. Replace anon doya_app_state policies with authenticated membership checks.
-- 2. Store app state by store_id instead of the shared "main" row.
-- 3. Allow only owners/admins/managers to create invites.
-- 4. Allow employees to read/write only their own staff records.
