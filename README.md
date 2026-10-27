# NFT Marketplace — Desafio Frontend (semanas 5 e 6)

Marketplace de NFTs construído a partir de `docs/ENUNCIADO.md`. API, autenticação, carteiras, pagamentos e tempo real são **simulados por MSW no navegador** (REST e Socket.IO), inclusive no build de demonstração. Nenhuma carteira, pagamento ou blockchain real é usado.

Stack: React 19, TypeScript, Vite, TanStack Router e Query, Axios, `socket.io-client` + `@mswjs/socket.io-binding`, Tailwind v4, shadcn/ui (Radix), MSW 2, Playwright, Lighthouse.

Índice de toda a documentação: [`docs/README.md`](docs/README.md).

## Setup
```sh
npm ci
npx playwright install chromium
npm run dev          # http://localhost:5173 com mocks (.env.demo)
```
Requer Node conforme `.nvmrc`. Variáveis públicas (sem segredos): `VITE_ENABLE_MOCKS=true` e `VITE_API_URL=/api` em `.env.demo` (modelo em `.env.example`). Opcional: `VITE_API_TIMEOUT_MS` (timeout do Axios em ms; padrão 15000, ver `src/api.ts`). Não há chaves, carteiras ou pagamentos reais.

## Comandos
| Comando | Efeito |
| --- | --- |
| `npm run dev` | Desenvolvimento com MSW |
| `npm run build:demo` | Build otimizado com mocks |
| `npm run preview` | Serve o build (4173) |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint com `--max-warnings 0` |
| `npm run test:unit` | Teste unitário de ETH (`node --test`) |
| `npm run verify` | `typecheck` + `lint` + `test:unit` + `build:demo` |
| `npm run test:e2e` / `npx playwright test` | Todos os E2E: desktop (1440) roda tudo; tablet (768) e mobile (390) rodam os specs listados em `playwright.config.ts`; relatório HTML em `playwright-report/`, traces em falha |
| `npx playwright test pedido-unico` | Só a feature da semana 6 |
| `npm run test:visual` | Só regressão visual (`@visual`), baselines `*-win32.png` |
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
Cenários: `default`, `empty`, `http-500`, `slow`, `variable-latency`, `network-error`, `payment-declined`, `payment-pending`, `payment-held`, `payment-timeout`, `stale-quote`, `wallet-rejected`. Endpoints de apoio (`nfts/:id/update|event`, `orders/:id/confirm|decline|event`, `socket/disconnect`, `session/expire`, `status/:code`): ver `docs/CONTRACTS.md`.

## Como reproduzir falhas
Com a app aberta (`npm run dev`), execute no console o `scenario` desejado e repita a ação: `payment-declined` (pedido recusado), `payment-timeout` (504 com retry e mesma `Idempotency-Key`), `stale-quote` (cotação muda; exige reconfirmar), `wallet-rejected`, `http-500`, `network-error`, `slow`. Tempo real: `POST /api/__mock/nfts/nft-1/update`, `POST /api/__mock/socket/disconnect`, `POST /api/__mock/orders/:id/confirm` (com `payment-held`). Use `reset` entre experimentos.

## Entrega do curso (semanas 5 e 6)
Contextos: **Catálogo** (`src/catalog/`) e **Compra** (`src/purchase/`), definidos em `GLOSSARIO.md`.

| Artefato | Arquivo | Como validar |
| --- | --- | --- |
| Glossário e bounded contexts | `GLOSSARIO.md`, `docs/architecture/bounded-contexts.md` | Leitura; termos com origem em `docs/ENUNCIADO.md` |
| Semana 5: Research, ADR, spec manual (5 EARS, 3 BDD) | `docs/semana-5-quantity-limit/` | Leitura; testes `tests/e2e/quantity-limit.spec.ts` e `quantity-extra.spec.ts` |
| Semana 5: OpenSpec (ferramenta principal) | `openspec/changes/limite-quantidade-edicao/` | `openspec validate limite-quantidade-edicao --strict` (CLI `@fission-ai/openspec` 1.15.0, instalado fora do `package.json`) |
| Semana 5: TLC (alternativa) | `.specs/features/quantity-limit/spec.md` | `python .claude/skills/tlc-spec-driven/scripts/validate_spec.py .specs/features/quantity-limit/spec.md` |
| Diferenças e comparação OpenSpec x TLC | `DIFERENCAS.md` | Leitura |
| Semana 6: Research | `RESEARCH.md` | Leitura |
| Semana 6: ADR | `docs/adr/0001-pedido-unico-sem-duplicidade.md` | Leitura |
| Semana 6: spec (5 EARS, 3 BDD CB-01 a CB-03) | `docs/pedido-unico-sem-duplicidade-spec.md` | Leitura; sem validador automático |
| Semana 6: testes dos 3 cenários | `tests/e2e/pedido-unico.spec.ts` | `npx playwright test pedido-unico` |
| Review da semana 6 (divergências spec x código) | `REVIEW.md` | Leitura |
| Review da semana 5 | `docs/semana-5-quantity-limit/REVIEW-semana5.md` | Leitura |

Divergência a conhecer antes de avaliar a semana 6: o app monta o pedido a partir do carrinho inteiro (não há pagamento parcial); os testes contornam isso e as demais diferenças estão em `REVIEW.md`.

## Qualidade e CI
- `npm run verify` roda typecheck, lint, teste unitário e `build:demo`.
- Última execução completa conhecida: `npx playwright test` com 169 passed e 0 failed (inclui `@visual`, com baselines regenerados após o redesign).
- A regressão visual é só local: os baselines versionados são `*-win32.png` e não valem em Linux.
- O workflow `.github/workflows/ci.yml` (typecheck, lint, unit, build:demo e `playwright test --grep-invert @visual`) existe, mas **ainda NÃO rodou no GitHub**: não houve push.
- Relatórios: `reports/qa-report.md`, `reports/implementation-status.md`, `reports/lighthouse/`.

## Estrutura de pastas
```text
src/
  catalog/    contexto Catálogo (home, detalhe, quantidade)
  purchase/   contexto Compra (carrinho, checkout, pedido, ETH em BigInt)
  account/    sessão, perfil, carteiras, favoritos (apoio)
  realtime/   cliente Socket.IO e avisos (apoio)
  mocks/      handlers MSW REST e Socket.IO (apoio)
  components/ui/  shadcn/ui
  api.ts, queryClient.ts, app.tsx, main.tsx
tests/e2e/    specs Playwright (+ baselines visuais); tests/unit/ teste de ETH
docs/         enunciado, contratos, arquitetura, QA, specs, ADR (índice em docs/README.md)
openspec/     change OpenSpec da semana 5
.specs/       spec TLC da semana 5
specs/        speckit (001-quantity-limit) e pendências (002-pending-work)
reports/      QA, status, validação, Lighthouse
.github/      workflow de CI
```

## Documentos
- Arquitetura e contratos: `ARCHITECTURE.md`, `docs/CONTRACTS.md`, `docs/architecture/bounded-contexts.md`.
- Requisitos e QA: `docs/requirements/requirements-matrix.md`, `docs/qa/known-gaps.md`, `docs/testing/test-strategy.md`.
- Curso: `GLOSSARIO.md`, `RESEARCH.md`, `DIFERENCAS.md`, `REVIEW.md`, `docs/semana-5-quantity-limit/`, `docs/adr/`, `docs/pedido-unico-sem-duplicidade-spec.md`.
- Tudo em um só lugar: `docs/README.md`.

## Deploy
`vercel.json` existe (build `npm run build:demo`, saída `dist`, fallback SPA para `/index.html`). **Nenhum deploy foi feito** e não há URL pública. O fallback foi verificado localmente com `vite preview` (`tests/e2e/deep-route.spec.ts`), não na Vercel.

## Limitações — o desafio completo NÃO está entregue
- Deploy público não realizado (apenas configuração). PR no fork não aberto. Nada foi commitado nem enviado.
- Fidelidade ao Figma não verificada (sem acesso ao arquivo).
- Auditoria axe ausente (há testes de teclado, foco, região viva e zoom/reflow do diálogo de revisão, mas não varredura axe).
- Pagamento parcial inexistente: o pedido é sempre do carrinho inteiro.
- Baselines `@visual` só valem em Windows; CI ainda não executado no GitHub; Lighthouse anterior ao redesign.
- shadcn/ui usado nas telas de autenticação, perfil/carteiras, catálogo, detalhe, carrinho, checkout e pedido; cobertura total não auditada.
- Mocks: Socket.IO só websocket, namespace `/`; estado em memória/navegador.
Veja `docs/qa/known-gaps.md` e `reports/implementation-status.md`.
