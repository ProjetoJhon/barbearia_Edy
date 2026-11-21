-- EDY-K Barbershop — segurança com Supabase Auth + RLS
-- Execute este arquivo no SQL Editor do Supabase.
--
-- ATENÇÃO: este script RECRIA a tabela public.users (as contas de acesso passam
-- a viver em auth.users). As tabelas atuais do projeto estão vazias, mas se
-- você tiver dados importantes, exporte-os antes de executar.
--
-- Perfis (distinção de usuários):
--   owner  → trabalhojonatha@gmail.com → acesso TOTAL, inclusive banco de dados
--   admin  → admin@edyk.com            → consultar/editar/excluir conteúdo,
--                                        SEM acesso ao banco de dados
--   client → demais contas              → somente o próprio perfil
--
-- Depois de executar o SQL:
--   1. Authentication → Users → Add user: crie os e-mails acima.
--   2. Rode o SQL opcional no final deste arquivo para definir cada perfil.
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
  role       text not null default 'client' check (role in ('client', 'admin', 'owner')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Helpers de perfil
-- Lêem o papel do JWT assinado pelo Supabase, não do localStorage nem da tabela.
--
-- SEGURANÇA: usam APENAS app_metadata. O campo user_metadata pode ser definido
-- por qualquer visitante no próprio cadastro (/auth/v1/signup com "data"),
-- por isso NUNCA deve ser usado como fonte de autorização.
-- app_metadata só pode ser alterado com privilégio de service_role ou pelo
-- SQL Editor do Supabase.
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'client');
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'owner';
$$;

-- Compatibilidade: is_admin() passa a sinônimo de is_owner().
-- O administrador parcial (app_metadata.role = 'admin') NÃO tem acesso a
-- nenhuma tabela; ele só usa o painel para conteúdo local. Portanto esta RPC
-- retorna false para ele e true somente para o proprietário.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.is_owner();
$$;

-- Espelho do perfil, usado apenas em testes/diagnóstico. A interface lê a
-- claim do JWT para esconder opções; a autorização real continua no RLS.
create or replace function public.my_role()
returns text
language sql
stable
as $$
  select public.current_role();
$$;

revoke all on function public.current_role() from public;
revoke all on function public.is_owner() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.my_role() from public;
grant execute on function public.current_role() to anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.my_role() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Privilégios mínimos
-- anon: só pode ler produtos ativos.
-- authenticated (client): lê/cria o próprio perfil.
-- authenticated (admin): NENHUM acesso a users/products (sem banco).
-- authenticated (owner): acesso total, inclusive gerenciar usuários.
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
-- 5. Políticas de usuários (banco de dados — somente o owner)
-- ---------------------------------------------------------------------------
drop policy if exists "edyk_users_select" on public.users;
create policy "edyk_users_select"
  on public.users for select
  to authenticated
  using (public.is_owner() or (public.current_role() = 'client' and id = auth.uid()));

drop policy if exists "edyk_users_insert" on public.users;
create policy "edyk_users_insert"
  on public.users for insert
  to authenticated
  with check (
    case
      when public.is_owner() then role = 'owner'
      when public.current_role() = 'client' and id = auth.uid() then role = 'client'
      else false
    end
  );

drop policy if exists "edyk_users_update" on public.users;
create policy "edyk_users_update"
  on public.users for update
  to authenticated
  using (public.is_owner() or (public.current_role() = 'client' and id = auth.uid()))
  with check (
    case
      when public.is_owner() then true
      when public.current_role() = 'client' and id = auth.uid() and role = 'client' then true
      else false
    end
  );

drop policy if exists "edyk_users_delete" on public.users;
create policy "edyk_users_delete"
  on public.users for delete
  to authenticated
  using (public.is_owner() or (public.current_role() = 'client' and id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 6. Políticas de produtos
-- Visitantes/clientes veem apenas produtos ativos; o proprietário vê todos e
-- pode criar/editar/excluir. O admin parcial é negado até na leitura.
-- ---------------------------------------------------------------------------
drop policy if exists "edyk_products_all" on public.products;
drop policy if exists "edyk_products_select" on public.products;
drop policy if exists "edyk_products_admin" on public.products;
drop policy if exists "edyk_products_insert" on public.products;
drop policy if exists "edyk_products_update" on public.products;
drop policy if exists "edyk_products_delete" on public.products;

create policy "edyk_products_select"
  on public.products for select
  to anon, authenticated
  using (public.is_owner() or (active and public.current_role() <> 'admin'));

create policy "edyk_products_insert"
  on public.products for insert
  to authenticated
  with check (public.is_owner());

create policy "edyk_products_update"
  on public.products for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy "edyk_products_delete"
  on public.products for delete
  to authenticated
  using (public.is_owner());

-- Faz o PostgREST enxergar as alterações de schema imediatamente.
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 7. Opcional — definir os perfis no Authentication
-- Execute DEPOIS de criar os usuários pelo painel do Supabase.
--
-- Use raw_app_meta_data (NÃO raw_user_meta_data: este último é público no
-- cadastro). Depois de promover, faça logout/login no app para o JWT ser
-- reemitido com a nova claim. O papel 'admin' libera só o painel local; o RLS
-- continua negando users/products para essa conta.
-- ---------------------------------------------------------------------------
-- Proprietário — acesso total, inclusive banco de dados:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'::jsonb,
--     raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'role'
-- where email = 'trabalhojonatha@gmail.com';
--
-- Administrador parcial — editar/consultar/excluir, sem banco de dados:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb,
--     raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'role'
-- where email = 'admin@edyk.com';
--
-- Revogar (voltar a cliente):
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data - 'role'
-- where email = 'admin@edyk.com';

-- ---------------------------------------------------------------------------
-- 8. Verificação rápida (opcional, já autenticado no SQL Editor)
-- ---------------------------------------------------------------------------
-- select id, email, role from public.users order by created_at desc limit 10;
-- select id, name, active from public.products order by name;
-- Como proprietário: owner / true / true / owner.
-- Como administrador parcial: admin / false / false / admin (sem acesso às tabelas).
-- select public.current_role(), public.is_owner(), public.is_admin(), public.my_role();
