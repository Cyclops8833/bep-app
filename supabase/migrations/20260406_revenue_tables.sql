-- Revenue tables for Phase 6: Revenue Entry
-- Run via supabase db push or in Supabase dashboard SQL editor

-- Main revenue entry (one row per day per user)
create table if not exists revenue_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  entry_date       date not null,
  lump_sum_amount  integer not null,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, entry_date)
);

-- Per-dish breakdown (optional enrichment, does NOT feed P&L — per D-03)
create table if not exists revenue_entry_dishes (
  id               uuid primary key default gen_random_uuid(),
  revenue_entry_id uuid not null references revenue_entries(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  recipe_id        uuid not null references menu_items(id) on delete cascade,
  quantity         integer not null check (quantity > 0),
  created_at       timestamptz not null default now()
);

-- RLS: revenue_entries
alter table revenue_entries enable row level security;

create policy "Users can read own revenue entries"
  on revenue_entries for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own revenue entries"
  on revenue_entries for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own revenue entries"
  on revenue_entries for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own revenue entries"
  on revenue_entries for delete
  to authenticated
  using (user_id = auth.uid());

-- RLS: revenue_entry_dishes
alter table revenue_entry_dishes enable row level security;

create policy "Users can read own revenue entry dishes"
  on revenue_entry_dishes for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own revenue entry dishes"
  on revenue_entry_dishes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own revenue entry dishes"
  on revenue_entry_dishes for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own revenue entry dishes"
  on revenue_entry_dishes for delete
  to authenticated
  using (user_id = auth.uid());
