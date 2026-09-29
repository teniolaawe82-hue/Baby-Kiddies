-- ============================================================
-- Nice Up Kiddies E-Commerce — Supabase Schema
-- Run this in your Supabase SQL Editor (Settings > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  category_id uuid references categories(id) on delete set null,
  images text[] default '{}',
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ADMIN USERS
-- ─────────────────────────────────────────
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  status order_status default 'pending',
  total_amount numeric(10, 2) not null,
  shipping_address jsonb not null,
  notes text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- Categories: public read
alter table categories enable row level security;
create policy "Public read categories" on categories for select using (true);
create policy "Admin full access categories" on categories for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Products: public read active, admin full access
alter table products enable row level security;
create policy "Public read active products" on products for select using (is_active = true);
create policy "Admin full access products" on products for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Admin users: only admins can see
alter table admin_users enable row level security;
create policy "Admin users read self" on admin_users for select using (user_id = auth.uid());

-- Customers: own row only, or admin
alter table customers enable row level security;
create policy "Customers read own" on customers for select using (user_id = auth.uid());
create policy "Insert customer" on customers for insert with check (true);
create policy "Admin full access customers" on customers for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Orders: own orders only, or admin
alter table orders enable row level security;
create policy "Customer view own orders" on orders for select
  using (exists (select 1 from customers where id = customer_id and user_id = auth.uid()));
create policy "Insert order" on orders for insert with check (true);
create policy "Admin full access orders" on orders for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Order Items
alter table order_items enable row level security;
create policy "View own order items" on order_items for select
  using (exists (
    select 1 from orders o
    join customers c on c.id = o.customer_id
    where o.id = order_id and c.user_id = auth.uid()
  ));
create policy "Insert order items" on order_items for insert with check (true);
create policy "Admin full access order_items" on order_items for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- ─────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────
-- Run this separately in the Supabase dashboard under Storage > New bucket:
-- Bucket name: product-images
-- Public bucket: YES
--
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admin upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and
    exists (select 1 from admin_users where user_id = auth.uid())
  );

create policy "Admin delete product images" on storage.objects
  for delete using (
    bucket_id = 'product-images' and
    exists (select 1 from admin_users where user_id = auth.uid())
  );

-- ─────────────────────────────────────────
-- SEED: Sample categories
-- ─────────────────────────────────────────
insert into categories (name, slug) values
  ('Clothing', 'clothing'),
  ('Toys', 'toys'),
  ('Nursery', 'nursery'),
  ('Feeding', 'feeding'),
  ('Bath & Skincare', 'bath-skincare')
on conflict do nothing;

-- ─────────────────────────────────────────
-- HOW TO ADD YOURSELF AS ADMIN:
-- After signing up in the app, run this SQL with your user ID:
--
--   insert into admin_users (user_id) values ('<your-auth-user-id>');
--
-- Find your user ID in: Supabase Dashboard > Authentication > Users
-- ─────────────────────────────────────────
