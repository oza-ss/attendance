-- 工时记录应用 数据库结构（在 Supabase SQL Editor 中执行）
create extension if not exists "pgcrypto";

create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  start_time time not null,
  end_time time,
  created_at timestamptz not null default now()
);

create table if not exists public.summary_records (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  total_hours numeric(6,2) not null check (total_hours >= 0),
  work_days integer not null check (work_days >= 0),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_overrides (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  is_workday boolean not null,
  created_at timestamptz not null default now()
);

-- 单用户：允许匿名 key 访问（安全由前端访问密码把关；如担心可自行收紧）
alter table public.daily_records enable row level security;
alter table public.summary_records enable row level security;
alter table public.calendar_overrides enable row level security;

create policy "allow all daily" on public.daily_records for all using (true) with check (true);
create policy "allow all summary" on public.summary_records for all using (true) with check (true);
create policy "allow all override" on public.calendar_overrides for all using (true) with check (true);
