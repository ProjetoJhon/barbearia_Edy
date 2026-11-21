/*
 * Configuração do Supabase — preencha com os dados do seu projeto.
 * Onde encontrar: Supabase Dashboard → Project Settings → API
 *   - Project URL  → url
 *   - anon / public → anonKey
 *
 * A anon key é destinada ao cliente (pública). A service_role NUNCA deve
 * aparecer aqui. O RLS das tabelas define o que essa chave pode fazer.
 *
 * Também é possível sobrescrever estes valores no painel Admin → Supabase,
 * sem precisar alterar este arquivo ou refazer o deploy. O valor salvo no
 * painel tem prioridade sobre este arquivo — inclusive quando está vazio.
 *
 * O script de teste (test-supabase.mjs) lê estes mesmos placeholders se as
 * variáveis SUPABASE_URL / SUPABASE_ANON_KEY não forem informadas.
 */
window.EDYK_SUPABASE = {
  url: 'https://fmiyckfvfhnysqtaoemm.supabase.co',
  anonKey: 'sb_publishable_PMjtwxK7XAw4k-RU39CWlA_BrrWGRQc',

  /* Opcional: token da API local (server.py). Use apenas se o servidor foi
   * iniciado com EDYK_API_TOKEN definido. Nunca é uma credencial do Supabase. */
  localApiToken: ''
};
