
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  brand_name text not null default 'NOVA Kitchen',
  logo_url text,
  tagline text,
  footer_about text,
  address text,
  pincode text,
  phone text,
  email text,
  instagram_url text,
  facebook_url text,
  twitter_url text,
  theme_primary text not null default '#22d3ee',
  theme_accent text not null default '#ec4899',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "site_settings public read" on public.site_settings for select using (true);
create policy "admins manage site_settings" on public.site_settings for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role)) with check (has_role(auth.uid(), 'admin'::app_role));

create trigger update_site_settings_updated_at
before update on public.site_settings
for each row execute function public.update_updated_at_column();

insert into public.site_settings (singleton, brand_name) values (true, 'NOVA Kitchen')
on conflict (singleton) do nothing;
