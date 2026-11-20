-- EDY-K Barbershop — tabelas para integração com Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase.
-- Usuários e produtos são gravados diretamente do navegador via REST.

-- ---------------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id         text primary key,
  name       text not null,
  email      text not null unique,
  phone      text,
  password   text not null,
  role       text not null default 'client' check (role in ('client', 'admin')),
  created_at text
);

create table if not exists public.products (
  id           text primary key,
  name         text not null,
  description  text,
  category     text,
  price        numeric not null default 0,
  promo_price  numeric,
  stock        integer not null default 0,
  image        text,
  active       boolean not null default true,
  featured     boolean not null default false
);

-- ---------------------------------------------------------------------------
-- 2. Permissões de tabela + Row Level Security
-- O RLS sozinho não basta: o papel anon também precisa de privilégios na tabela.
-- As políticas abaixo liberam leitura/escrita para a chave anon. Isso é
-- adequado para um protótipo/demo. Em produção, troque por políticas baseadas
-- em auth.uid() e nunca exponha dados sensíveis (como senhas) ao cliente.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users, public.products to anon, authenticated;

alter table public.users    enable row level security;
alter table public.products enable row level security;

drop policy if exists "edyk_users_all" on public.users;
create policy "edyk_users_all"
  on public.users for all
  to anon, authenticated
  using (true) with check (true);

drop policy if exists "edyk_products_all" on public.products;
create policy "edyk_products_all"
  on public.products for all
  to anon, authenticated
  using (true) with check (true);

-- Faz o PostgREST enxergar as tabelas novas imediatamente.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 3. Verificação rápida (opcional)
-- ---------------------------------------------------------------------------
-- select id, name, email from public.users order by created_at desc limit 10;
-- select id, name, price, stock from public.products order by name;
