#!/usr/bin/env node
/**
 * Teste de inserção e exclusão de usuários e produtos no Supabase (EDY-K).
 *
 * Uso:
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=ey... node test-supabase.mjs
 *   # ou (Windows PowerShell)
 *   $env:SUPABASE_URL="https://xxxx.supabase.co"; $env:SUPABASE_ANON_KEY="ey..."; node test-supabase.mjs
 *
 * Se as variáveis de ambiente não estiverem definidas, o script tenta ler
 * url/anonKey de config.js. Antes de rodar, execute supabase.sql no projeto.
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

if (!url || !anonKey) {
  console.error('ERRO: informe SUPABASE_URL e SUPABASE_ANON_KEY (ou preencha config.js).');
  process.exit(1);
}

async function req(table, method, query = '', body) {
  const r = await fetch(`${url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates'
    },
    body: body == null ? undefined : JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 300)}`);
  }
  return r.status === 204 ? null : r.json();
}

const stamp = Date.now().toString().slice(-7) + Math.floor(Math.random() * 90 + 10);
const testUser = {
  id: `test-user-${stamp}`,
  name: 'Teste EDY-K',
  email: `teste.${stamp}@edyk.test`,
  phone: '(11) 90000-0000',
  password: '123456',
  role: 'client',
  created_at: new Date().toISOString().slice(0, 10)
};
const testProduct = {
  id: `test-prod-${stamp}`,
  name: 'Produto Teste EDY-K',
  description: 'Registro temporário criado pelo teste',
  category: 'Kits',
  price: 10,
  promo_price: null,
  stock: 1,
  image: 'assets/images/product-kit.jpg',
  active: true,
  featured: false
};

let ok = true;
const steps = [];
function log(label, pass, detail) {
  steps.push({ label, pass });
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!pass) ok = false;
}

async function run() {
  try {
    await req('users', 'POST', '?on_conflict=id', testUser);
    log('Inserir usuário', true);
  } catch (e) {
    log('Inserir usuário', false, e.message);
  }

  try {
    await req('products', 'POST', '?on_conflict=id', testProduct);
    log('Inserir produto', true);
  } catch (e) {
    log('Inserir produto', false, e.message);
  }

  try {
    const r = await req('users', 'GET', `?select=id&id=eq.${encodeURIComponent(testUser.id)}`);
    log('Consultar usuário inserido', Array.isArray(r) && r.length === 1);
  } catch (e) {
    log('Consultar usuário inserido', false, e.message);
  }

  try {
    const r = await req('products', 'GET', `?select=id&id=eq.${encodeURIComponent(testProduct.id)}`);
    log('Consultar produto inserido', Array.isArray(r) && r.length === 1);
  } catch (e) {
    log('Consultar produto inserido', false, e.message);
  }

  // Exclusão (sempre tenta limpar, mesmo se inserção/consulta falhar)
  try {
    await req('users', 'DELETE', `?id=eq.${encodeURIComponent(testUser.id)}`);
    const r = await req('users', 'GET', `?select=id&id=eq.${encodeURIComponent(testUser.id)}`);
    log('Excluir usuário', Array.isArray(r) && r.length === 0);
  } catch (e) {
    log('Excluir usuário', false, e.message);
  }

  try {
    await req('products', 'DELETE', `?id=eq.${encodeURIComponent(testProduct.id)}`);
    const r = await req('products', 'GET', `?select=id&id=eq.${encodeURIComponent(testProduct.id)}`);
    log('Excluir produto', Array.isArray(r) && r.length === 0);
  } catch (e) {
    log('Excluir produto', false, e.message);
  }

  console.log(`\nResultado: ${ok ? 'SUCESSO' : 'FALHA'} (${steps.filter(s => s.pass).length}/${steps.length} etapas)`);
  process.exit(ok ? 0 : 1);
}

run().catch((e) => {
  console.error('Falha inesperada:', e.message);
  process.exit(1);
});
