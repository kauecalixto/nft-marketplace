# NFT Marketplace — Desafio Frontend (semanas 5 e 6)

Projeto novo, construído a partir de `docs/ENUNCIADO.md`. API, autenticação, carteiras, pagamentos e tempo real são **simulados por MSW no navegador** (REST e Socket.IO), inclusive no build de demonstração.

Stack: React 19, TypeScript, Vite, TanStack Router e Query, Axios, `socket.io-client` + `@mswjs/socket.io-binding`, Tailwind v4, MSW 2, Playwright, Lighthouse.

## Setup
```sh
npm install
npx playwright install chromium
npm run dev          # http://localhost:5173 com mocks (.env.demo)
```
Variáveis públicas (sem segredos), em `.env.demo`: `VITE_ENABLE_MOCKS=true`, `VITE_API_URL=/api`. Não há chaves, carteiras ou pagamentos reais.

## Comandos
| Comando | Efeito |
| --- | --- |
| `npm run dev` | Desenvolvimento com MSW |
| `npm run build:demo` | Build otimizado com mocks |
| `npm run preview` | Serve o build (4173) |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint com `--max-warnings 0` |
| `npm run test:unit` | Teste unitário de ETH (`node --test`) |
| `npm run test:visual` | Só regressão visual (`@visual`) |
| `npx playwright test` | Todos os E2E: desktop (1440) roda tudo; tablet (768) e mobile (390) rodam os specs de fluxo; relatório HTML em `playwright-report/`, traces em falha |
| `npm run audit:lighthouse` | Requer `npx vite preview --port 4180 --strictPort`; relatórios em `reports/lighthouse/` |

## Credenciais fictícias
`ana@example.test` / `kurio-demo` e `bruno@example.test` / `bruno-demo`. Cupons: `KURIO10` (válido), `KURIO5` (expirado).

## Mocks, cenários e reset
Estado no navegador. No console da aplicação:
```js
await fetch('/api/__mock/reset', { method: 'POST' })
await fetch('/api/__mock/scenario', { method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ scenario: 'payment-timeout' }) })
```
Cenários: `default`, `empty`, `http-500`, `slow`, `variable-latency`, `network-error`, `payment-declined`, `payment-pending`, `payment-held`, `payment-timeout`, `stale-quote`, `wallet-rejected`. Endpoints de apoio (`nfts/:id/update`, `orders/:id/confirm|decline`, `socket/disconnect`, `session/expire`): ver `docs/CONTRACTS.md`.

## Documentos
`ARCHITECTURE.md`, `docs/CONTRACTS.md`, `docs/requirements/requirements-matrix.md`, `docs/qa/known-gaps.md`, `docs/testing/test-strategy.md`, `GLOSSARIO.md`, `RESEARCH.md`, `DIFERENCAS.md`, `docs/adr/0001-limite-quantidade-edicao.md`, `docs/quantity-limit-spec.md`, `REVIEW.md`, `reports/` (QA, Lighthouse, status, validação).

## Como reproduzir falhas
Com a app aberta (`npm run dev`), execute no console o `scenario` desejado e repita a ação: `payment-declined` (pedido recusado), `payment-timeout` (504 com retry e mesma `Idempotency-Key`), `stale-quote` (cotação muda; exige reconfirmar), `wallet-rejected`, `http-500`, `network-error`, `slow`. Tempo real: `POST /api/__mock/nfts/nft-1/update`, `POST /api/__mock/socket/disconnect`, `POST /api/__mock/orders/:id/confirm` (com `payment-held`). Use `reset` entre experimentos.

## Deploy
`vercel.json` existe (build `npm run build:demo`, saída `dist`, fallback SPA para `/index.html`). **Nenhum deploy foi feito** e não há URL pública. O fallback foi verificado localmente com `vite preview` (`tests/e2e/deep-route.spec.ts`), não na Vercel.

## Limitações — o desafio completo NÃO está entregue
- Deploy público não realizado (apenas configuração). PR no fork não aberto.
- Fidelidade ao Figma não verificada (sem acesso ao arquivo).
- shadcn/ui usado nas telas de autenticação, perfil/carteiras, catálogo, detalhe, carrinho, checkout e pedido; cobertura total não auditada.
- Comparação OpenSpec/TLC pendente. Auditoria axe e teste de zoom ausentes.
- Mocks: Socket.IO só websocket, namespace `/`; estado em memória/navegador.
Veja `docs/qa/known-gaps.md` e `reports/implementation-status.md`.
