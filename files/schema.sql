-- Run in Supabase SQL editor
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price integer not null check (price > 0),      -- in rupees
  description text,
  image_url text,
  sizes text[] default '{S,M,L,XL}',
  active boolean default true,
  created_at timestamptz default now()
);
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  items jsonb not null,
  amount integer not null,                        -- in paise
  address jsonb not null,
  status text not null default 'pending',         -- pending | paid
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz default now()
);
alter table products enable row level security;
alter table orders enable row level security;
create policy "Anyone can view active products" on products for select using (active);
create policy "Users view own orders" on orders for select using (auth.uid() = user_id);
-- No insert/update policies on orders: only edge functions (service role) write them.

insert into products (name, category, price, description) values
 ('Handloom Cotton Shirt','Shirts',1499,'Breathable handloom cotton with a relaxed fit.'),
 ('Block-Print Kurta','Kurtas',1999,'Hand block-printed cotton kurta.'),
 ('Straight Fit Denim','Denim',2199,'Mid-rise denim that softens with wear.'),
 ('Everyday Crew Tee','T-shirts',699,'Soft combed-cotton tee.');
