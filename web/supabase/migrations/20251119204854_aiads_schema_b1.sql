-- ================================
-- TABELLA CAMPAIGNS
-- ================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in 
('draft','active','paused','ended')),
  daily_budget numeric(12,2) not null default 0,
  total_budget numeric(12,2),
  objective text not null default 'traffic',
  created_at timestamptz not null default now()
);

-- ================================
-- TABELLA ADS
-- ================================
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete 
cascade,
  title text not null,
  description text,
  image_url text,
  cta text,
  target_country text,
  target_device text default 'all', -- "mobile" | "desktop" | "all"
  created_at timestamptz not null default now()
);

create index if not exists idx_ads_campaign_id on public.ads 
(campaign_id);

-- ================================
-- TABELLA AD_EVENTS
-- ================================
create table if not exists public.ad_events (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads (id) on delete cascade,
  event_type text not null check (event_type in 
('impression','click','conversion')),
  user_country text,
  user_device text,
  revenue numeric(12,2),
  timestamp timestamptz not null default now()
);

create index if not exists idx_ad_events_ad_id on public.ad_events 
(ad_id);
create index if not exists idx_ad_events_event_type on public.ad_events 
(event_type);
create index if not exists idx_ad_events_timestamp on public.ad_events 
(timestamp);

-- ================================
-- RLS (ROW LEVEL SECURITY)
-- ================================
alter table public.campaigns enable row level security;
alter table public.ads enable row level security;
alter table public.ad_events enable row level security;

-- Politiche: ogni utente vede solo le proprie campagne e annunci
drop policy if exists "Users can manage own campaigns" on 
public.campaigns;
create policy "Users can manage own campaigns"
  on public.campaigns
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own ads" on public.ads;
create policy "Users can manage own ads"
  on public.ads
  for all
  using (
    exists (
      select 1
      from public.campaigns c
      where c.id = campaign_id
      and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.campaigns c
      where c.id = campaign_id
      and c.user_id = auth.uid()
    )
  );

-- Eventi: li registra il backend (service role) o l'utente auth
drop policy if exists "Insert ad events (auth users)" on public.ad_events;
create policy "Insert ad events (auth users)"
  on public.ad_events
  for insert
  to authenticated
  with check (true);

drop policy if exists "Select ad events (auth users)" on public.ad_events;
create policy "Select ad events (auth users)"
  on public.ad_events
  for select
  to authenticated
  using (true);

