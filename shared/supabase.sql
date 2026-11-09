-- Online-Datenbank für alle Apps (Essen, Baby, …).
-- Einmal im Supabase-Dashboard unter "SQL Editor" einfügen und auf "Run" klicken.

create table if not exists public.app_items (
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  app text not null,
  id text not null,
  kind text not null,
  data jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner, app, id)
);
create index if not exists app_items_sync on public.app_items (owner, app, updated_at);
alter table public.app_items enable row level security;
drop policy if exists "app_items_own" on public.app_items;
create policy "app_items_own" on public.app_items
  for all using (owner = auth.uid()) with check (owner = auth.uid());
create or replace function public.app_items_touch() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists app_items_touch on public.app_items;
create trigger app_items_touch before insert or update on public.app_items
  for each row execute function public.app_items_touch();
