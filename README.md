# NFT Marketplace — Desafio Frontend (semanas 5 e 6)

Projeto novo, construído a partir de `docs/ENUNCIADO.md`. API, autenticação, carteiras, pagamentos e tempo real são **simulados por MSW no navegador** (REST e Socket.IO), inclusive no build de demonstração.

Stack: React 19, TypeScript, Vite, TanStack Router e Query, Axios, `socket.io-client` + `@mswjs/socket.io-binding`, Tailwind v4, MSW 2, Playwright, Lighthouse.

## Setup
```sh
npm install
npx playwright install chromium
npm run dev          # http://localhost:5173 com mocks (.env.demo)
```
Variáveis públicas (sem segredos): `VITE_ENABLE_MOCKS`, `VITE_API_URL=/api`.

## Comandos
| Comando | Efeito |
| --- | --- |
| `npm run dev` | Desenvolvimento com MSW |
| `npm run build:demo` | Build otimizado com mocks |
| `npm run preview` | Serve o build (4173) |
| `npm run typecheck` | `tsc -b` |
| `npx playwright test` | E2E em chromium 1440, 768 e 390 |
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

## Limitações — o desafio completo NÃO está entregue
Faltam: shadcn/ui, fidelidade ao Figma (sem acesso ao arquivo), regressão visual, testes de teclado/foco e de `order.updated`, rota 404, script de lint e **deploy** (obrigatório no enunciado). Veja `docs/qa/known-gaps.md` e `reports/implementation-status.md`.
