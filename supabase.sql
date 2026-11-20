-- EDY-K Barbershop — segurança com Supabase Auth + RLS
-- Execute este arquivo no SQL Editor do Supabase.
--
-- ATENÇÃO: este script RECRIA a tabela public.users (as contas de acesso passam
-- a viver em auth.users). As tabelas atuais do projeto estão vazias, mas se
-- você tiver dados importantes, exporte-os antes de executar.
--
-- Depois de executar o SQL:
--   1. Authentication → Users → Add user: crie admin@edyk.com e cliente@edyk.com.
--   2. Rode o SQL opcional no final deste arquivo para marcar o admin.
--   3. Faça login no app novamente para gerar os perfis em public.users.

-- ---------------------------------------------------------------------------
-- 1. Produtos (mantidos; apenas o RLS e os GRANTs mudam)
-- ---------------------------------------------------------------------------
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
-- 2. Perfis de usuário — senha NÃO fica mais aqui
-- ---------------------------------------------------------------------------
drop policy if exists "edyk_users_all" on public.users;
drop table if exists public.users;

create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  phone      text,
  role       text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Helper de administrador
-- Lê o papel do JWT assinado pelo Supabase, não do localStorage nem da tabela.
-- Assim, mudar "role" no perfil não concede privilégio administrativo.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    ''
  ) = 'admin';
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Privilégios mínimos
-- anon: só pode ler produtos ativos.
-- authenticated: lê/escreve o próprio perfil e, se for admin, faz CRUD completo.
-- ---------------------------------------------------------------------------
revoke all on public.users from public, anon, authenticated;
revoke all on public.products from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.users to authenticated;

alter table public.users    enable row level security;
alter table public.products enable row level security;

-- ---------------------------------------------------------------------------
-- 5. Políticas de usuários
-- ---------------------------------------------------------------------------
drop policy if exists "edyk_users_select" on public.users;
create policy "edyk_users_select"
  on public.users for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "edyk_users_insert" on public.users;
create policy "edyk_users_insert"
  on public.users for insert
  to authenticated
  with check (
    id = auth.uid()
    and role = case when public.is_admin() then 'admin' else 'client' end
  );

drop policy if exists "edyk_users_update" on public.users;
create policy "edyk_users_update"
  on public.users for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    case
      when public.is_admin() then true
      else id = auth.uid() and role = 'client'
    end
  );

drop policy if exists "edyk_users_delete" on public.users;
create policy "edyk_users_delete"
  on public.users for delete
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. Políticas de produtos
-- Visitantes veem apenas produtos ativos; somente admin escreve no banco.
-- ---------------------------------------------------------------------------
drop policy if exists "edyk_products_all" on public.products;
drop policy if exists "edyk_products_select" on public.products;
drop policy if exists "edyk_products_admin" on public.products;

create policy "edyk_products_select"
  on public.products for select
  to anon, authenticated
  using (active or public.is_admin());

create policy "edyk_products_admin"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Faz o PostgREST enxergar as alterações de schema imediatamente.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 7. Opcional — promover o usuário admin criado no Authentication
-- Execute DEPOIS de criar admin@edyk.com pelo painel do Supabase.
-- Depois disso, faça logout/login no app para o JWT receber a nova claim.
-- ---------------------------------------------------------------------------
-- update auth.users
-- set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@edyk.com';

-- ---------------------------------------------------------------------------
-- 8. Verificação rápida (opcional, já autenticado no SQL Editor)
-- ---------------------------------------------------------------------------
-- select id, email, role from public.users order by created_at desc limit 10;
-- select id, name, active from public.products order by name;
