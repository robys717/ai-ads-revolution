-- Tabella eventi pubblicitari per AI Ads Revolution

create table if not exists public.ad_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_type text not null check (event_type in ('impression', 'click', 'conversion', 'view', 'other')),
  event_time timestamptz not null default now(),
  source text,            -- es: "meta", "google", "tiktok", "native", ecc.
  device text,            -- es: "desktop", "mobile", "tablet"
  country text,           -- es: "IT", "FR", "US"
  cost numeric(10,4) default 0,     -- costo associato all'evento (se applicabile)
  revenue numeric(10,4) default 0,  -- entrata associata all'evento (per conversioni)
  metadata jsonb default '{}'::jsonb -- dati extra (utm, id creatività, ecc.)
);

-- Abilita Row Level Security
alter table public.ad_events enable row level security;

-- Policy: ogni utente può vedere/creare solo i propri eventi
drop policy if exists "user can read own ad_events" on public.ad_events;
drop policy if exists "user can insert own ad_events" on public.ad_events;
drop policy if exists "user can manage own ad_events" on public.ad_events;

create policy "user can read own ad_events"
  on public.ad_events
  for select
  using (auth.uid() = user_id);

create policy "user can insert own ad_events"
  on public.ad_events
  for insert
  with check (auth.uid() = user_id);

create policy "user can manage own ad_events"
  on public.ad_events
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indici per performance AI/analytics
create index if not exists ad_events_campaign_id_idx
  on public.ad_events (campaign_id);

create index if not exists ad_events_user_id_idx
  on public.ad_events (user_id);

create index if not exists ad_events_type_time_idx
  on public.ad_events (event_type, event_time);
