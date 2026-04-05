-- Invoice tables for Phase 5: AI Invoice Capture
-- Run this in the Supabase dashboard SQL editor (project is not using supabase CLI migrations yet)

-- Main invoice record (one per photographed invoice)
create table if not exists invoices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  invoice_date date,
  status      text not null default 'pending' check (status in ('pending', 'confirmed')),
  storage_key text not null,         -- path in Supabase Storage: {user_id}/{uuid}.{ext}
  total_amount integer,              -- sum of all confirmed line totals (VND integer)
  created_at  timestamptz not null default now()
);

-- Line items extracted from the invoice
create table if not exists invoice_lines (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references invoices(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  extracted_name  text not null,     -- raw name extracted by Claude
  ingredient_id   uuid references ingredients(id) on delete set null,
  quantity        numeric(10,3) not null,
  unit            text not null,
  unit_price      integer not null,  -- VND
  line_total      integer not null,  -- VND
  created_at      timestamptz not null default now()
);

-- RLS policies

alter table invoices enable row level security;

create policy "Users can read own invoices"
  on invoices for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own invoices"
  on invoices for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own invoices"
  on invoices for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own invoices"
  on invoices for delete
  to authenticated
  using (user_id = auth.uid());

alter table invoice_lines enable row level security;

create policy "Users can read own invoice lines"
  on invoice_lines for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own invoice lines"
  on invoice_lines for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own invoice lines"
  on invoice_lines for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own invoice lines"
  on invoice_lines for delete
  to authenticated
  using (user_id = auth.uid());

-- Supabase Storage: private bucket for invoice images
-- Run this separately if the bucket does not already exist:
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "User can upload own invoices"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'invoices'
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  );

create policy "User can read own invoices"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'invoices'
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  );
