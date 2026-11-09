-- Baby-Tagebuch: Tabelle für den Server-Sync.
-- Einmal im Supabase-Dashboard unter "SQL Editor" einfügen und auf "Run" klicken.

create table if not exists public.baby_items (
  owner      uuid        not null default auth.uid() references auth.users on delete cascade,
  id         text        not null,
  kind       text        not null,
  data       jsonb,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner, id)
);
create index if not exists baby_items_sync on public.baby_items (owner, updated_at);

-- Jeder sieht und ändert nur die Daten seines eigenen Kontos.
alter table public.baby_items enable row level security;
drop policy if exists "baby_items_own" on public.baby_items;
create policy "baby_items_own" on public.baby_items
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- Zeitstempel setzt immer der Server (damit die Handys sich nicht verpassen).
create or replace function public.baby_items_touch() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists baby_items_touch on public.baby_items;
create trigger baby_items_touch before insert or update on public.baby_items
  for each row execute function public.baby_items_touch();
