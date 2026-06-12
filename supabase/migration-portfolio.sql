-- جدول معرض الأعمال (Portfolio)
create table if not exists portfolio (
  id        text primary key,
  src       text not null,
  alt_ar    text not null default '',
  alt_en    text not null default '',
  "order"   integer not null default 0,
  created_at timestamptz not null default now()
);

alter table portfolio enable row level security;

drop policy if exists "Allow all select" on portfolio;
drop policy if exists "Allow all insert" on portfolio;
drop policy if exists "Allow all update" on portfolio;
drop policy if exists "Allow all delete" on portfolio;

create policy "Allow all select" on portfolio for select using (true);
create policy "Allow all insert" on portfolio for insert with check (true);
create policy "Allow all update" on portfolio for update using (true);
create policy "Allow all delete" on portfolio for delete using (true);
