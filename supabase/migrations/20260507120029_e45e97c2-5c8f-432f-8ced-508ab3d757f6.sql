
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users can view their own roles"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

create policy "admins can manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = user_id);
create policy "users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = user_id);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Menu items
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  category text not null default 'Mains',
  image_url text,
  video_url text,
  available boolean not null default true,
  in_stock boolean not null default true,
  trending boolean not null default false,
  combo text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create policy "menu items are public"
  on public.menu_items for select using (true);
create policy "admins manage menu items"
  on public.menu_items for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger update_menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.update_updated_at_column();

-- Banners
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;
create policy "banners are public" on public.banners for select using (true);
create policy "admins manage banners" on public.banners for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger update_banners_updated_at before update on public.banners
  for each row execute function public.update_updated_at_column();

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  notes text,
  total numeric(10,2) not null default 0,
  item_count int not null default 0,
  status text not null default 'received', -- received | preparing | out_for_delivery | completed | cancelled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy "anyone can place an order"
  on public.orders for insert to anon, authenticated with check (true);
create policy "admins view all orders"
  on public.orders for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "admins update orders"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete orders"
  on public.orders for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create trigger update_orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at_column();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  price numeric(10,2) not null,
  quantity int not null,
  image_url text
);

alter table public.order_items enable row level security;
create policy "anyone can insert order items"
  on public.order_items for insert to anon, authenticated with check (true);
create policy "admins view all order items"
  on public.order_items for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Realtime
alter publication supabase_realtime add table public.orders;

-- Storage bucket
insert into storage.buckets (id, name, public) values ('menu-media', 'menu-media', true)
on conflict (id) do nothing;

create policy "menu media public read"
  on storage.objects for select using (bucket_id = 'menu-media');
create policy "admins upload menu media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-media' and public.has_role(auth.uid(), 'admin'));
create policy "admins update menu media"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu-media' and public.has_role(auth.uid(), 'admin'));
create policy "admins delete menu media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu-media' and public.has_role(auth.uid(), 'admin'));
