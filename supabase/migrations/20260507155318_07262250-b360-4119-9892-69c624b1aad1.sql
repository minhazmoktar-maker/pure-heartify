
create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  token text not null,
  platform text not null check (platform in ('ios','android','web')),
  created_at timestamptz not null default now(),
  unique (user_id, token)
);
alter table public.device_tokens enable row level security;
create policy "Users manage own device tokens" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.favorite_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  section_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, section_id)
);
alter table public.favorite_categories enable row level security;
create policy "Users manage own favorite categories" on public.favorite_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
