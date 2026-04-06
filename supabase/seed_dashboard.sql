-- Dashboard seed data — run in Supabase SQL Editor
-- Inserts ~30 days of revenue + confirmed invoices for the logged-in user.
-- Safe to re-run: uses ON CONFLICT DO NOTHING for revenue entries.

do $$
declare
  v_user_id        uuid;
  v_supplier_id    uuid;
  v_invoice_id     uuid;

  -- ingredient UUIDs (looked up by name, nulls ok — cost drivers just won't appear for missing ones)
  ing_beef         uuid;
  ing_pork         uuid;
  ing_noodles      uuid;
  ing_veg          uuid;
  ing_herb         uuid;
  ing_shrimp       uuid;

  -- today's date for relative offsets
  today            date := current_date;

begin
  -- ── 1. Get first user ──────────────────────────────────────────────
  select id into v_user_id from auth.users order by created_at limit 1;
  if v_user_id is null then
    raise exception 'No users found. Log in to the app first, then re-run this script.';
  end if;

  -- ── 2. Get or create a dummy supplier ──────────────────────────────
  select id into v_supplier_id from suppliers where user_id = v_user_id limit 1;
  if v_supplier_id is null then
    insert into suppliers (user_id, name, contact_name, phone)
    values (v_user_id, 'Chợ Bến Thành', 'Chị Lan', '0901234567')
    returning id into v_supplier_id;
  end if;

  -- ── 3. Look up existing ingredients by rough name match ────────────
  select id into ing_beef   from ingredients where user_id = v_user_id and lower(name) like '%bò%'   limit 1;
  select id into ing_pork   from ingredients where user_id = v_user_id and lower(name) like '%heo%'  limit 1;
  select id into ing_noodles from ingredients where user_id = v_user_id and (lower(name) like '%bún%' or lower(name) like '%phở%' or lower(name) like '%mì%') limit 1;
  select id into ing_veg    from ingredients where user_id = v_user_id and (lower(name) like '%rau%' or lower(name) like '%cải%') limit 1;
  select id into ing_herb   from ingredients where user_id = v_user_id and (lower(name) like '%hành%' or lower(name) like '%ngò%' or lower(name) like '%húng%') limit 1;
  select id into ing_shrimp from ingredients where user_id = v_user_id and lower(name) like '%tôm%'  limit 1;

  -- ── 4. Revenue entries — past 30 days ──────────────────────────────
  -- Weekends earn ~20% more. Values in VND (integers).
  for i in 0..29 loop
    declare
      v_date  date := today - i;
      dow     int  := extract(dow from (today - i)); -- 0=Sun, 6=Sat
      base    int  := 2200000 + (random() * 1400000)::int;
      amount  int  := case when dow in (0,6) then (base * 1.2)::int else base end;
    begin
      insert into revenue_entries (user_id, entry_date, lump_sum_amount)
      values (v_user_id, v_date, amount)
      on conflict (user_id, entry_date) do nothing;
    end;
  end loop;

  -- ── 5. Confirmed invoices — ~3 per week for 4 weeks ────────────────
  -- Invoice 1 — beef & noodles, 5 days ago
  insert into invoices (user_id, supplier_id, invoice_date, status, storage_key, total_amount)
  values (v_user_id, v_supplier_id, today - 5, 'confirmed', 'seed/invoice-01.jpg', 1450000)
  returning id into v_invoice_id;

  insert into invoice_lines (invoice_id, user_id, extracted_name, ingredient_id, quantity, unit, unit_price, line_total) values
    (v_invoice_id, v_user_id, 'Thịt bò',    ing_beef,    5,   'kg',  180000, 900000),
    (v_invoice_id, v_user_id, 'Bún/Phở',    ing_noodles, 10,  'kg',   28000, 280000),
    (v_invoice_id, v_user_id, 'Rau sống',   ing_veg,     3,   'kg',   22000,  66000),
    (v_invoice_id, v_user_id, 'Hành ngò',   ing_herb,    2,   'bó',   17000,  34000),
    (v_invoice_id, v_user_id, 'Gia vị tổng',null,        1,   'gói', 170000, 170000);

  -- Invoice 2 — pork & veg, 9 days ago
  insert into invoices (user_id, supplier_id, invoice_date, status, storage_key, total_amount)
  values (v_user_id, v_supplier_id, today - 9, 'confirmed', 'seed/invoice-02.jpg', 1120000)
  returning id into v_invoice_id;

  insert into invoice_lines (invoice_id, user_id, extracted_name, ingredient_id, quantity, unit, unit_price, line_total) values
    (v_invoice_id, v_user_id, 'Xương heo',  ing_pork,    4,   'kg',  110000, 440000),
    (v_invoice_id, v_user_id, 'Thịt bò',    ing_beef,    2,   'kg',  180000, 360000),
    (v_invoice_id, v_user_id, 'Rau cải',    ing_veg,     5,   'kg',   18000,  90000),
    (v_invoice_id, v_user_id, 'Bún/Phở',    ing_noodles, 5,   'kg',   28000, 140000),
    (v_invoice_id, v_user_id, 'Túi đá',     null,        2,   'túi',  45000,  90000);

  -- Invoice 3 — shrimp & herbs, 13 days ago
  insert into invoices (user_id, supplier_id, invoice_date, status, storage_key, total_amount)
  values (v_user_id, v_supplier_id, today - 13, 'confirmed', 'seed/invoice-03.jpg', 980000)
  returning id into v_invoice_id;

  insert into invoice_lines (invoice_id, user_id, extracted_name, ingredient_id, quantity, unit, unit_price, line_total) values
    (v_invoice_id, v_user_id, 'Tôm tươi',   ing_shrimp,  3,   'kg',  220000, 660000),
    (v_invoice_id, v_user_id, 'Hành lá',    ing_herb,    3,   'bó',   16000,  48000),
    (v_invoice_id, v_user_id, 'Rau sống',   ing_veg,     4,   'kg',   22000,  88000),
    (v_invoice_id, v_user_id, 'Bún/Phở',    ing_noodles, 4,   'kg',   28000, 112000),
    (v_invoice_id, v_user_id, 'Dầu ăn',     null,        2,   'lít',  35000,  70000);

  -- Invoice 4 — large beef order, 18 days ago
  insert into invoices (user_id, supplier_id, invoice_date, status, storage_key, total_amount)
  values (v_user_id, v_supplier_id, today - 18, 'confirmed', 'seed/invoice-04.jpg', 1780000)
  returning id into v_invoice_id;

  insert into invoice_lines (invoice_id, user_id, extracted_name, ingredient_id, quantity, unit, unit_price, line_total) values
    (v_invoice_id, v_user_id, 'Thịt bò',    ing_beef,    7,   'kg',  180000, 1260000),
    (v_invoice_id, v_user_id, 'Xương heo',  ing_pork,    2,   'kg',  110000,  220000),
    (v_invoice_id, v_user_id, 'Hành ngò',   ing_herb,    3,   'bó',   17000,   51000),
    (v_invoice_id, v_user_id, 'Gia vị tổng',null,        1,   'gói', 249000,  249000);

  -- Invoice 5 — mixed, 23 days ago
  insert into invoices (user_id, supplier_id, invoice_date, status, storage_key, total_amount)
  values (v_user_id, v_supplier_id, today - 23, 'confirmed', 'seed/invoice-05.jpg', 1340000)
  returning id into v_invoice_id;

  insert into invoice_lines (invoice_id, user_id, extracted_name, ingredient_id, quantity, unit, unit_price, line_total) values
    (v_invoice_id, v_user_id, 'Thịt bò',    ing_beef,    4,   'kg',  180000,  720000),
    (v_invoice_id, v_user_id, 'Tôm tươi',   ing_shrimp,  2,   'kg',  220000,  440000),
    (v_invoice_id, v_user_id, 'Rau sống',   ing_veg,     3,   'kg',   22000,   66000),
    (v_invoice_id, v_user_id, 'Hành lá',    ing_herb,    2,   'bó',   16000,   32000),
    (v_invoice_id, v_user_id, 'Đá viên',    null,        1,   'túi',  82000,   82000);

  raise notice 'Seed complete for user %', v_user_id;
  raise notice 'Revenue entries: 30 days inserted (conflicts skipped)';
  raise notice 'Invoices: 5 confirmed invoices with % ingredient lines', 23;
  raise notice '';
  raise notice 'Ingredient matches:';
  raise notice '  Beef (bò):    %', coalesce(ing_beef::text,    'NOT FOUND — lines use null');
  raise notice '  Pork (heo):   %', coalesce(ing_pork::text,    'NOT FOUND — lines use null');
  raise notice '  Noodles:      %', coalesce(ing_noodles::text, 'NOT FOUND — lines use null');
  raise notice '  Veg (rau):    %', coalesce(ing_veg::text,     'NOT FOUND — lines use null');
  raise notice '  Herb (hành):  %', coalesce(ing_herb::text,    'NOT FOUND — lines use null');
  raise notice '  Shrimp (tôm): %', coalesce(ing_shrimp::text,  'NOT FOUND — lines use null');
end $$;
