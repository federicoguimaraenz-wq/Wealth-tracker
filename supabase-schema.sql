-- Run this in Supabase SQL Editor

create table assets (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  cls text not null,
  name text not null,
  cur text not null default 'EUR',
  val numeric not null default 0,
  cost numeric not null default 0,
  inc numeric not null default 0,
  inc_monthly numeric not null default 0,
  risk integer not null default 3,
  tgt numeric not null default 0,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz default now()
);

create table liabilities (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  tipo text not null default 'hipoteca',
  bal numeric not null default 0,
  rate numeric not null default 0,
  linked text default '',
  monthly numeric not null default 0,
  created_at timestamptz default now()
);

-- Row Level Security: each user only sees their own rows
alter table assets enable row level security;
alter table liabilities enable row level security;

create policy "Users see own assets" on assets
  for all using (auth.uid() = user_id);

create policy "Users see own liabilities" on liabilities
  for all using (auth.uid() = user_id);
