# EDY-K Barbershop — versão HTML / CSS / JavaScript / Python

O projeto foi convertido integralmente de React + TypeScript + Vite para **HTML, CSS, JavaScript puro e Python**. Não há mais etapa de build, `node_modules` nem dependências npm: a página abre direto no navegador.

## Como abrir

**Opção 1 — direto no navegador:** abra `index.html` com duplo clique.

**Opção 2 — servidor Python (recomendado, ativa a API de persistência):**

```bash
python server.py          # http://localhost:8000
python server.py 3000     # porta personalizada
```

A API opcional `GET/POST /api/state` grava o estado em `data/store.json`. Sem ela, o app usa `localStorage` normalmente.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `index.html` | Estrutura da aplicação e emblema SVG reutilizável |
| `styles.css` | Tema escuro, layout responsivo, componentes e animações |
| `app.js` | Toda a lógica: estado, rotas por hash, agendamentos, loja, fidelidade e painel admin |
| `server.py` | Servidor estático + API JSON de persistência |
| `assets/` | Imagens e ícone (paths relativos, funcionam via `file://`) |

## Funcionalidades

- Início com serviços, elenco, avaliações, loja e horários.
- Agendamento em 4 etapas (serviço → profissional → data/hora → dados e pagamento), com remarcacão e pontos de fidelidade.
- Loja com filtros, carrinho, checkout (Pix/cartão, retirada ou entrega, cupons) e baixa de estoque.
- Meus Horários (próximos/histórico), avaliações e Meus Pedidos.
- Meus Prêmios: saldo, resgate de cupons e extrato de pontos.
- Autenticação com cadastro e acesso rápido de demonstração.
- Painel admin: dashboard, agenda, CRUD de serviços/produtos/barbeiros/recompensas, moderação, fidelidade e CMS de configurações.

### Contas de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@edyk.com` | `admin123` |
| Cliente | `cliente@edyk.com` | `123456` |

## Problemas corrigidos na conversão

1. `npm install` falhava com `ERESOLVE`: `esbuild@0.25` do projeto conflitava com o peer `^0.27 || ^0.28` exigido pelo Vite 8 — removido junto com o build.
2. `index.html` carregava `/src/main.tsx`, que navegadores não executam sem o Vite — substituído por `app.js` clássico.
3. Imagem do barbeiro Edy apontava para `.jpg`, mas o arquivo era `.jpeg` — corrigido para `assets/images/barber-edy.jpg`.
4. Caminhos absolutos `/src/assets/...` quebravam fora do Vite — trocados por caminhos relativos.
