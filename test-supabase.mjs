#!/usr/bin/env node
/**
 * Teste de segurança do Supabase (EDY-K): Auth + RLS + insert/consulta/exclusão.
 *
 * Perfis testados:
 *   proprietário (trabalhojonatha@gmail.com) → acesso TOTAL ao banco;
 *   administrador (admin@edyk.com)           → NENHUM acesso a users/products.
 *
 * Uso:
 *   SUPABASE_OWNER_PASSWORD=senha-do-proprietário \
 *   SUPABASE_ADMIN_PASSWORD=senha-do-admin \
 *   node test-supabase.mjs
 *
 * A URL e a anon key são lidas de config.js quando não passadas por ambiente.
 * Antes de rodar, execute supabase.sql no SQL Editor e defina os papéis em
 * raw_app_meta_data (NUNCA em user_metadata: qualquer visitante pode definir
 * user_metadata no próprio cadastro).
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
const ownerEmail = String(process.env.SUPABASE_OWNER_EMAIL || 'trabalhojonatha@gmail.com');
const adminEmail = String(process.env.SUPABASE_ADMIN_EMAIL || 'admin@edyk.com');
const ownerPassword = String(process.env.SUPABASE_OWNER_PASSWORD || '');
const adminPassword = String(process.env.SUPABASE_ADMIN_PASSWORD || '');

if (!url || !anonKey) {
  console.error('ERRO: informe SUPABASE_URL e SUPABASE_ANON_KEY (ou preencha config.js).');
  process.exit(1);
}
if (!ownerPassword || !adminPassword) {
  console.error('ERRO: informe SUPABASE_OWNER_PASSWORD e SUPABASE_ADMIN_PASSWORD.');
  console.error('Exemplo: SUPABASE_OWNER_PASSWORD=senha1 SUPABASE_ADMIN_PASSWORD=senha2 node test-supabase.mjs');
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
const productId = `test-prod-${stamp}`;
const adminProductId = `${productId}-admin`;
const testProduct = {
  id: productId,
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
  steps.push({ label, pass: !!pass });
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!pass) ok = false;
}

let ownerToken = '';
async function cleanup() {
  if (!ownerToken) return;
  for (const id of [adminProductId, productId]) {
    await request(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token: ownerToken });
  }
  const check = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(productId)}`, { token: ownerToken });
  log('Excluir produtos de teste', Array.isArray(check.data) && check.data.length === 0);
}

async function login(email, password) {
  return request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password }
  });
}

async function run() {
  let ownerLogin;
  try {
    ownerLogin = await login(ownerEmail, ownerPassword);
    log('Login do proprietário', ownerLogin.ok, ownerLogin.ok ? '' : `HTTP ${ownerLogin.status}`);
    if (!ownerLogin.ok) return;
    ownerToken = ownerLogin.data.access_token;
  } catch (e) {
    log('Login do proprietário', false, e.message);
    return;
  }

  try {
    const r = await request('/rest/v1/rpc/is_owner', { method: 'POST', body: {}, token: ownerToken });
    log('Proprietário reconhecido pelo RLS', r.ok && r.data === true, r.ok ? '' : `HTTP ${r.status}`);
  } catch (e) {
    log('Proprietário reconhecido pelo RLS', false, e.message);
  }

  try {
    const r = await request('/rest/v1/rpc/is_admin', { method: 'POST', body: {}, token: ownerToken });
    log('Compatibilidade is_admin() = proprietário', r.ok && r.data === true, r.ok ? '' : `HTTP ${r.status}`);
  } catch (e) {
    log('Compatibilidade is_admin() = proprietário', false, e.message);
  }

  try {
    const r = await request('/rest/v1/rpc/my_role', { method: 'POST', body: {}, token: ownerToken });
    log('Perfil atual via RPC', r.ok && r.data === 'owner', r.ok ? String(r.data) : `HTTP ${r.status}`);
  } catch (e) {
    log('Perfil atual via RPC', false, e.message);
  }

  try {
    const r = await request('/rest/v1/products?on_conflict=id', { method: 'POST', body: testProduct, token: ownerToken });
    log('Proprietário insere produto', r.ok, r.ok ? '' : `HTTP ${r.status}: ${r.text.slice(0, 120)}`);
  } catch (e) {
    log('Proprietário insere produto', false, e.message);
  }

  try {
    const r = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(productId)}`, { token: ownerToken });
    log('Proprietário consulta produto', r.ok && Array.isArray(r.data) && r.data.length === 1);
  } catch (e) {
    log('Proprietário consulta produto', false, e.message);
  }

  try {
    await request('/rest/v1/users?on_conflict=id', {
      method: 'POST',
      token: ownerToken,
      body: {
        id: ownerLogin.data.user.id,
        name: 'Proprietário EDY-K',
        email: ownerEmail,
        phone: '',
        role: 'owner',
        created_at: new Date().toISOString()
      }
    });
    const r = await request(`/rest/v1/users?select=id&id=eq.${encodeURIComponent(ownerLogin.data.user.id)}`, { token: ownerToken });
    log('Proprietário lê próprio perfil', r.ok && Array.isArray(r.data) && r.data.length === 1);
  } catch (e) {
    log('Proprietário lê próprio perfil', false, e.message);
  }

  try {
    const r = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(productId)}`);
    log('Anônimo lê produto ativo', r.ok && Array.isArray(r.data) && r.data.length === 1);
  } catch (e) {
    log('Anônimo lê produto ativo', false, e.message);
  }

  try {
    const r = await request('/rest/v1/products', {
      method: 'POST',
      body: { ...testProduct, id: `${productId}-anon` }
    });
    log('Anônimo NÃO grava produto', !r.ok, `HTTP ${r.status}`);
  } catch (e) {
    log('Anônimo NÃO grava produto', true);
  }

  try {
    const r = await request('/rest/v1/users?select=id');
    log('Anônimo NÃO lê usuários', !r.ok, `HTTP ${r.status}`);
  } catch (e) {
    log('Anônimo NÃO lê usuários', true);
  }

  let adminToken = '';
  try {
    const adminLogin = await login(adminEmail, adminPassword);
    log('Login do administrador parcial', adminLogin.ok, adminLogin.ok ? '' : `HTTP ${adminLogin.status}`);
    if (!adminLogin.ok) return;
    adminToken = adminLogin.data.access_token;
  } catch (e) {
    log('Login do administrador parcial', false, e.message);
    return;
  }

  try {
    const owner = await request('/rest/v1/rpc/is_owner', { method: 'POST', body: {}, token: adminToken });
    const legacy = await request('/rest/v1/rpc/is_admin', { method: 'POST', body: {}, token: adminToken });
    log('Admin parcial NÃO é proprietário no RLS', owner.ok && owner.data === false && legacy.ok && legacy.data === false);
  } catch (e) {
    log('Admin parcial NÃO é proprietário no RLS', false, e.message);
  }

  try {
    const r = await request(`/rest/v1/products?select=id&id=eq.${encodeURIComponent(productId)}`, { token: adminToken });
    log('Admin parcial NÃO lê produtos', r.ok && Array.isArray(r.data) && r.data.length === 0);
  } catch (e) {
    log('Admin parcial NÃO lê produtos', true);
  }

  try {
    const r = await request('/rest/v1/products?on_conflict=id', {
      method: 'POST',
      body: { ...testProduct, id: adminProductId },
      token: adminToken
    });
    log('Admin parcial NÃO grava produto', !r.ok, `HTTP ${r.status}`);
  } catch (e) {
    log('Admin parcial NÃO grava produto', true);
  }

  try {
    await request(`/rest/v1/products?id=eq.${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: { name: 'Tentativa de alteração pelo admin' },
      token: adminToken
    });
    const check = await request(`/rest/v1/products?select=name&id=eq.${encodeURIComponent(productId)}`, { token: ownerToken });
    log('Admin parcial NÃO altera produto', Array.isArray(check.data) && check.data.length === 1 && check.data[0].name === testProduct.name);
  } catch (e) {
    log('Admin parcial NÃO altera produto', false, e.message);
  }

  try {
    const r = await request('/rest/v1/users?select=id', { token: adminToken });
    log('Admin parcial NÃO lê usuários', r.ok && Array.isArray(r.data) && r.data.length === 0);
  } catch (e) {
    log('Admin parcial NÃO lê usuários', true);
  }
}

run()
  .catch((e) => log('Falha inesperada', false, e.message))
  .finally(async () => {
    try { await cleanup(); } catch (e) { log('Limpeza do teste', false, e.message); }
    console.log(`\nResultado: ${ok ? 'SUCESSO' : 'FALHA'} (${steps.filter((s) => s.pass).length}/${steps.length} etapas)`);
    process.exit(ok ? 0 : 1);
  });
