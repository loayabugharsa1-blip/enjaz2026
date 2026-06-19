-- ============================================================
-- Migration: إنشاء قاعدة بيانات إنجاز للدعاية والإعلان
-- Injaz Advertising Database Schema
-- Version: 1.0.1 (IF NOT EXISTS)
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. ENUMS
do $$ begin
  create type user_role as enum ('admin', 'employee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum ('pending', 'processing', 'ready', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_source as enum ('pos', 'online');
exception when duplicate_object then null;
end $$;

-- 2. USERS (لوحة التحكم)
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  role          user_role not null default 'employee',
  name          text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- 3. CLIENTS (العملاء)
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_clients_phone on clients (phone);

-- 4. INVENTORY ITEMS (المخزون)
create table if not exists inventory_items (
  id          uuid primary key default gen_random_uuid(),
  name_ar     text not null,
  name_en     text not null default '',
  category    text not null,
  quantity    integer not null default 0 check (quantity >= 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  cost_price  numeric(10,2) not null default 0 check (cost_price >= 0),
  description text not null default '',
  image_url   text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Add new columns if table already exists
do $$ begin
  alter table inventory_items add column if not exists description text not null default '';
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table inventory_items add column if not exists image_url text not null default '';
exception when duplicate_column then null;
end $$;

-- 5. ORDERS (الطلبات)
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text,
  whatsapp_number text,
  service_type    text,
  price           numeric(10,2),
  items           jsonb not null default '[]'::jsonb,
  total           numeric(10,2) not null default 0 check (total >= 0),
  deposit         numeric(10,2) not null default 0 check (deposit >= 0),
  remaining       numeric(10,2) not null default 0 check (remaining >= 0),
  status          order_status not null default 'pending',
  source          order_source not null default 'pos',
  client_id       uuid references clients(id) on delete set null,
  customer_phone  text not null default '',
  notes           text,
  created_by      text not null,
  created_by_role user_role not null default 'employee',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_phone on orders (customer_phone);
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_orders_source on orders (source);

-- 6. ORDER ITEMS (بنود الطلب)
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  item_id     uuid references inventory_items(id) on delete set null,
  name_ar     text not null,
  name_en     text not null default '',
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  total       numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_order_items_order on order_items (order_id);

-- 7. ORDER TRACKING (سجل تتبع الحالات)
create table if not exists order_tracking (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status   order_status not null,
  changed_by  text not null,
  changed_by_role user_role not null default 'employee',
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_tracking_order on order_tracking (order_id);
create index if not exists idx_tracking_created on order_tracking (created_at desc);

-- 8. INVOICES (الفواتير)
create table if not exists invoices (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  invoice_number  text not null,
  subtotal        numeric(10,2) not null,
  tax_rate        numeric(5,2) not null default 0,
  tax_amount      numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  grand_total     numeric(10,2) not null,
  amount_paid     numeric(10,2) not null default 0,
  amount_due      numeric(10,2) not null,
  notes           text,
  print_count     integer not null default 0,
  last_printed_at timestamptz,
  created_by      text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists idx_invoice_number on invoices (invoice_number);
create index if not exists idx_invoices_order on invoices (order_id);
create index if not exists idx_invoices_created on invoices (created_at desc);

-- 9. INVOICE ITEMS (بنود الفاتورة)
create table if not exists invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  item_id     uuid references inventory_items(id) on delete set null,
  name_ar     text not null,
  name_en     text not null default '',
  description text,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  total       numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_invoice_items_invoice on invoice_items (invoice_id);

-- 10. ACTIVITY LOG (سجل النشاطات)
create table if not exists activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  username    text not null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  details     jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_created on activity_log (created_at desc);
create index if not exists idx_activity_entity on activity_log (entity_type, entity_id);
create index if not exists idx_activity_user on activity_log (user_id);

-- 11. SYNC LOG (سجل المزامنة للأجهزة)
create table if not exists sync_log (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null,
  entity_type text not null,
  last_sync   timestamptz not null,
  status      text not null check (status in ('success', 'partial', 'failed')),
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists set_updated_at_clients on clients;
create trigger set_updated_at_clients before update on clients
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at_inventory on inventory_items;
create trigger set_updated_at_inventory before update on inventory_items
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at_orders on orders;
create trigger set_updated_at_orders before update on orders
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at_invoices on invoices;
create trigger set_updated_at_invoices before update on invoices
  for each row execute function trigger_set_updated_at();

create or replace function calculate_invoice_totals()
returns trigger as $$
begin
  new.grand_total = new.subtotal + new.tax_amount - new.discount;
  new.amount_due = new.grand_total - new.amount_paid;
  if new.amount_due < 0 then new.amount_due = 0; end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_calc_invoice_totals on invoices;
create trigger trg_calc_invoice_totals before insert or update on invoices
  for each row execute function calculate_invoice_totals();

create or replace function log_order_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into order_tracking (order_id, from_status, to_status, changed_by, changed_by_role, note)
    values (new.id, old.status, new.status, new.created_by, new.created_by_role, 'تحديث تلقائي');
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_log_status_change on orders;
create trigger trg_log_status_change after update of status on orders
  for each row when (old.status is distinct from new.status)
  execute function log_order_status_change();

create or replace function log_activity(
  p_user_id uuid, p_username text, p_action text,
  p_entity_type text, p_entity_id uuid, p_details jsonb default null
) returns void as $$
begin
  insert into activity_log (user_id, username, action, entity_type, entity_id, details)
  values (p_user_id, p_username, p_action, p_entity_type, p_entity_id, p_details);
end;
$$ language plpgsql set search_path = public;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table if exists users enable row level security;
alter table if exists clients enable row level security;
alter table if exists inventory_items enable row level security;
alter table if exists orders enable row level security;
alter table if exists order_items enable row level security;
alter table if exists order_tracking enable row level security;
alter table if exists invoices enable row level security;
alter table if exists invoice_items enable row level security;
alter table if exists activity_log enable row level security;

drop policy if exists "Allow all select" on users;
drop policy if exists "Allow all select" on clients;
drop policy if exists "Allow all select" on inventory_items;
drop policy if exists "Allow all select" on orders;
drop policy if exists "Allow all select" on order_items;
drop policy if exists "Allow all select" on order_tracking;
drop policy if exists "Allow all select" on invoices;
drop policy if exists "Allow all select" on invoice_items;
drop policy if exists "Allow all select" on activity_log;

drop policy if exists "Allow all insert" on users;
drop policy if exists "Allow all insert" on clients;
drop policy if exists "Allow all insert" on inventory_items;
drop policy if exists "Allow all insert" on orders;
drop policy if exists "Allow all insert" on order_items;
drop policy if exists "Allow all insert" on order_tracking;
drop policy if exists "Allow all insert" on invoices;
drop policy if exists "Allow all insert" on invoice_items;
drop policy if exists "Allow all insert" on activity_log;

drop policy if exists "Allow all update" on users;
drop policy if exists "Allow all update" on clients;
drop policy if exists "Allow all update" on inventory_items;
drop policy if exists "Allow all update" on orders;
drop policy if exists "Allow all update" on order_items;
drop policy if exists "Allow all update" on order_tracking;
drop policy if exists "Allow all update" on invoices;
drop policy if exists "Allow all update" on invoice_items;
drop policy if exists "Allow all update" on activity_log;

drop policy if exists "Allow all delete" on users;
drop policy if exists "Allow all delete" on clients;
drop policy if exists "Allow all delete" on inventory_items;
drop policy if exists "Allow all delete" on orders;
drop policy if exists "Allow all delete" on order_items;
drop policy if exists "Allow all delete" on order_tracking;
drop policy if exists "Allow all delete" on invoices;
drop policy if exists "Allow all delete" on invoice_items;
drop policy if exists "Allow all delete" on activity_log;

create policy "Allow all select" on users for select using (true);
create policy "Allow all select" on clients for select using (true);
create policy "Allow all select" on inventory_items for select using (true);
create policy "Allow all select" on orders for select using (true);
create policy "Allow all select" on order_items for select using (true);
create policy "Allow all select" on order_tracking for select using (true);
create policy "Allow all select" on invoices for select using (true);
create policy "Allow all select" on invoice_items for select using (true);
create policy "Allow all select" on activity_log for select using (true);

create policy "Allow all insert" on users for insert with check (true);
create policy "Allow all insert" on clients for insert with check (true);
create policy "Allow all insert" on inventory_items for insert with check (true);
create policy "Allow all insert" on orders for insert with check (true);
create policy "Allow all insert" on order_items for insert with check (true);
create policy "Allow all insert" on order_tracking for insert with check (true);
create policy "Allow all insert" on invoices for insert with check (true);
create policy "Allow all insert" on invoice_items for insert with check (true);
create policy "Allow all insert" on activity_log for insert with check (true);

create policy "Allow all update" on users for update using (true);
create policy "Allow all update" on clients for update using (true);
create policy "Allow all update" on inventory_items for update using (true);
create policy "Allow all update" on orders for update using (true);
create policy "Allow all update" on order_items for update using (true);
create policy "Allow all update" on order_tracking for update using (true);
create policy "Allow all update" on invoices for update using (true);
create policy "Allow all update" on invoice_items for update using (true);
create policy "Allow all update" on activity_log for update using (true);

create policy "Allow all delete" on users for delete using (true);
create policy "Allow all delete" on clients for delete using (true);
create policy "Allow all delete" on inventory_items for delete using (true);
create policy "Allow all delete" on orders for delete using (true);
create policy "Allow all delete" on order_items for delete using (true);
create policy "Allow all delete" on order_tracking for delete using (true);
create policy "Allow all delete" on invoices for delete using (true);
create policy "Allow all delete" on invoice_items for delete using (true);
create policy "Allow all delete" on activity_log for delete using (true);

-- ============================================================
-- SEED DATA
-- ============================================================

insert into users (id, username, password_hash, role, name)
values (
  gen_random_uuid(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'مدير النظام'
) on conflict (username) do nothing;

insert into users (id, username, password_hash, role, name)
values (
  gen_random_uuid(),
  'employee',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'employee',
  'موظف'
) on conflict (username) do nothing;

-- 12. PRICING RULES (أسعار الخدمات للحاسبة الذكية)
create table if not exists pricing_rules (
  id            text primary key,
  service_id    text not null,
  name_ar       text not null,
  name_en       text not null,
  price_per_unit numeric(10,2) not null check (price_per_unit >= 0),
  unit_type     text not null,
  updated_at    timestamptz not null default now()
);

insert into pricing_rules (id, service_id, name_ar, name_en, price_per_unit, unit_type) values
  ('shld-wd-pc', 'shields-wood-crystal-leather', 'سعر القطعة - دروع', 'Per piece - Shields', 200, 'piece'),
  ('shld-sv-pc', 'souvenirs-medals', 'سعر القطعة - هدايا', 'Per piece - Souvenirs', 100, 'piece'),
  ('shld-gl-pc', 'glass-acrylic-stand-a4', 'سعر القطعة - ستاند', 'Per piece - Stand', 150, 'piece'),
  ('nam-cr-pc', 'nameplates-crystal-wood', 'سعر القطعة - مسميات كريستال', 'Per piece - Crystal nameplate', 120, 'piece'),
  ('nam-sg-pc', 'nameplates-single-double', 'سعر القطعة - مسميات مكتب', 'Per piece - Desk nameplate', 80, 'piece'),
  ('cert-fb-pc', 'certificates-fabric', 'سعر القطعة - شهادات', 'Per piece - Certificate', 60, 'piece'),
  ('ppr-crd-pc', 'business-cards', 'سعر الكرت - 100 بطاقة', 'Per pack - 100 cards', 50, 'piece'),
  ('ppr-bro-pc', 'brochures-flyers', 'سعر القطعة - بروشور', 'Per piece - Brochure', 5, 'piece'),
  ('vin-cut-cm2', 'vinyl-cutting', 'سعر السم المربع - قص فينيل', 'Per cm² - Vinyl cutting', 0.02, 'cm2'),
  ('vin-bnr-cm2', 'banner-vinyl-printing', 'سعر السم المربع - بنر', 'Per cm² - Banner printing', 0.01, 'cm2'),
  ('vin-fab-cm2', 'fabric-printing', 'سعر السم المربع - طباعة قماش', 'Per cm² - Fabric printing', 0.015, 'cm2'),
  ('vin-snd-cm2', 'sandblasted-vinyl', 'سعر السم المربع - فينيل مرمل', 'Per cm² - Sandblasted vinyl', 0.03, 'cm2'),
  ('stk-prd-cm2', 'product-stickers', 'سعر السم المربع - ملصقات', 'Per cm² - Product labels', 0.015, 'cm2'),
  ('stk-wtr-cm2', 'waterproof-stickers', 'سعر السم المربع - استيكرات مقاومة', 'Per cm² - Waterproof stickers', 0.025, 'cm2'),
  ('soc-pst-pc', 'social-posts', 'سعر البوست الواحد', 'Per post design', 200, 'piece'),
  ('soc-lgo-pc', 'logo-branding', 'سعر الهوية البصرية المتكاملة', 'Complete branding package', 800, 'piece'),
  ('food-sgr-pc', 'food-sugar-sheet', 'سعر الورقة - ورق سكر A4', 'Per sheet - Sugar sheet A4', 50, 'piece'),
  ('food-cho-pc', 'food-choco-transfer', 'سعر الورقة - ورق ترانسفير A4', 'Per sheet - Choco transfer A4', 60, 'piece'),
  ('food-waf-pc', 'food-wafer-paper', 'سعر الورقة - ورق ويفر A4', 'Per sheet - Wafer paper A4', 70, 'piece')
on conflict (id) do nothing;

-- 13. REVIEWS (تعليقات الزوار)
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  text_ar     text not null,
  text_en     text not null,
  rating      integer not null check (rating >= 1 and rating <= 5),
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table if exists reviews enable row level security;
drop policy if exists "Allow all select" on reviews;
drop policy if exists "Allow all insert" on reviews;
drop policy if exists "Allow all update" on reviews;
drop policy if exists "Allow all delete" on reviews;
create policy "Allow all select" on reviews for select using (true);
create policy "Allow all insert" on reviews for insert with check (true);
create policy "Allow all update" on reviews for update using (true);
create policy "Allow all delete" on reviews for delete using (true);