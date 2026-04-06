-- P&L Dashboard: period persistence + alert dismissals
alter table profiles
  add column if not exists dashboard_period text default 'today'
  check (dashboard_period in ('today','this_week','this_month','last_month','custom'));

create table if not exists price_alert_dismissals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  dismissed_at  timestamptz not null default now(),
  unique (user_id, ingredient_id)
);

alter table price_alert_dismissals enable row level security;

create policy "Users can manage own dismissals"
  on price_alert_dismissals for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
