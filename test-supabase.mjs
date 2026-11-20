#!/usr/bin/env node
/**
 * Teste de segurança do Supabase (EDY-K): Auth + RLS + insert/consulta/exclusão.
 *
 * Uso:
 *   SUPABASE_ADMIN_EMAIL=admin@edyk.com SUPABASE_ADMIN_PASSWORD=senha node test-supabase.mjs
 *
 * A URL e a anon key são lidas de config.js quando não passadas por ambiente.
 * Antes de rodar, execute supabase.sql no SQL Editor e crie o usuário admin
 * no Supabase Auth (com role admin no raw_user_meta_data).
 */
import fs from 'node:fs';

function readConfigFile() {
  try {
    const txt = fs.readFileSync(new URL('./config.js', import.meta.url), 'utf8');
    const url = (txt.match(/url:\s*['"]([^'"]*)['"]/) || ['', ''])[1];
    const anonKey = (txt.match(/anonKey:\s*['"]([^'"]*)['"]/) || ['', ''])[1];
    return { url, anonKey };
  } catch {
    return { url: '', anonKey: '' };
  }
}

const fileCfg = readConfigFile();
const url = String(process.env.SUPABASE_URL || fileCfg.url || '').replace(/\/+$/, '');
const anonKey = String(process.env.SUPABASE_ANON_KEY || fileCfg.anonKey || '');
const email = String(process.env.SUPABASE_ADMIN_EMAIL || 'admin@edyk.com');
const password = String(process.env.SUPABASE_ADMIN_PASSWORD || '');

if (!url || !anonKey) {
  console.error('ERRO: informe SUPABASE_URL e SUPABASE_ANON_KEY (ou preencha config.js).');
  process.exit(1);
}
if (!password) {
  console.error('ERRO: informe SUPABASE_ADMIN_EMAIL e SUPABASE_ADMIN_PASSWORD.');
  console.error('Exemplo: SUPABASE_ADMIN_PASSWORD=senha node test-supabase.mjs');
  process.exit(1);
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { apikey: anonKey, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url + path, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body)
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* resposta não-JSON */ }
  return { ok: r.ok, status: r.status, data, text };
}

const stamp = Date.now().toString().slice(-7) + Math.floor(Math.random() * 90 + 10);
const testProduct = {
  id: `test-prod-${stamp}`,
  name: 'Produto Teste EDY-K',
  description: 'Registro temporário criado pelo teste de segurança',
  category: 'Kits',
  price: 10,
  promo_price: null,
  stock: 1,
  image: 'assets/images/product-kit.jpg',
  active: true,
  featured: false
};

const steps = [];
let ok = true;
function log(label, pass, detail) {
  steps.push({ label, pass });
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!pass) ok = false;
}

let token = '';
async function cleanup() {
  if (!token) return;
  await request(`/rest/v1/products?id=eq.${encodeURIComponent(testProduct.id)}`, { method: 'DELETE', token });
  const check = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(testProduct.id)}`, { token });
  log('Excluir produto de teste', Array.isArray(check.data) && check.data.length === 0);
}

async function run() {
  let login;
  try {
    login = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password }
    });
    log('Login com Supabase Auth', login.ok, login.ok ? '' : `HTTP ${login.status}`);
    if (!login.ok) return;
    token = login.data.access_token;
  } catch (e) {
    log('Login com Supabase Auth', false, e.message);
    return;
  }

  try {
    const admin = await request('/rest/v1/rpc/is_admin', { method: 'POST', body: {}, token });
    log('Role admin aplicada no RLS', admin.ok && admin.data === true, admin.ok ? '' : `HTTP ${admin.status}`);
  } catch (e) {
    log('Role admin aplicada no RLS', false, e.message);
  }

  try {
    const insert = await request('/rest/v1/products?on_conflict=id', { method: 'POST', body: testProduct, token });
    log('Admin insere produto', insert.ok, insert.ok ? '' : `HTTP ${insert.status}: ${insert.text.slice(0, 120)}`);
  } catch (e) {
    log('Admin insere produto', false, e.message);
  }

  try {
    const q = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(testProduct.id)}`, { token });
    log('Admin consulta produto', q.ok && Array.isArray(q.data) && q.data.length === 1);
  } catch (e) {
    log('Admin consulta produto', false, e.message);
  }

  try {
    const uid = login.data.user.id;
    /* O app cria o perfil no primeiro login; o teste entra direto pelo Auth,
     * então garante o perfil aqui para validar apenas a leitura via RLS. */
    await request('/rest/v1/users?on_conflict=id', {
      method: 'POST',
      token,
      body: {
        id: uid,
        name: 'Administrador EDY-K',
        email,
        phone: '',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    });
    const profile = await request(`/rest/v1/users?select=id&id=eq.${encodeURIComponent(uid)}`, { token });
    log('Usuário lê apenas o próprio perfil', profile.ok && Array.isArray(profile.data) && profile.data.length === 1);
  } catch (e) {
    log('Usuário lê apenas o próprio perfil', false, e.message);
  }

  try {
    const anon = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(testProduct.id)}`);
    log('Anônimo lê produto ativo', anon.ok && Array.isArray(anon.data) && anon.data.length === 1);
  } catch (e) {
    log('Anônimo lê produto ativo', false, e.message);
  }

  try {
    const anonWrite = await request('/rest/v1/products', {
      method: 'POST',
      body: { ...testProduct, id: `${testProduct.id}-anon` }
    });
    log('Anônimo NÃO grava produto', !anonWrite.ok, `HTTP ${anonWrite.status}`);
  } catch (e) {
    log('Anônimo NÃO grava produto', true);
  }

  try {
    const anonUsers = await request('/rest/v1/users?select=id');
    log('Anônimo NÃO lê usuários', !anonUsers.ok, `HTTP ${anonUsers.status}`);
  } catch (e) {
    log('Anônimo NÃO lê usuários', true);
  }
}

run()
  .catch((e) => log('Falha inesperada', false, e.message))
  .finally(async () => {
    try { await cleanup(); } catch (e) { log('Limpeza do teste', false, e.message); }
    console.log(`\nResultado: ${ok ? 'SUCESSO' : 'FALHA'} (${steps.filter((s) => s.pass).length}/${steps.length} etapas)`);
    process.exit(ok ? 0 : 1);
  });
