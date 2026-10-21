# Estratégia de testes

## Camadas
- E2E Playwright (`tests/e2e/*.spec.ts`) contra `npm run build:demo` + `vite preview` na porta 4173 (`playwright.config.ts`, `reuseExistingServer: true`). Reporter HTML, trace `on-first-retry`.
- Projetos: `chromium-desktop` (1440x900, todos os specs), `chromium-tablet` (768x1024) e `chromium-mobile` (390x844, touch); estes dois só rodam os specs responsivos `catalog`, `states` e `quantity-limit`. Um único comando: `npx playwright test`.
- Unitário (`tests/unit/eth.test.mjs`): precisão decimal ETH. Não há script npm para executá-lo.
- Tipos: `npm run typecheck` (`tsc -b`).
- Lighthouse: `npm run audit:lighthouse` (auditoria, não teste de regressão; ver `reports/lighthouse/README.md`).

## Arquivos
- `catalog.spec.ts`: 6 itens por página e paginação pela URL; filtros combinados (preço mín/máx, disponíveis, ordenação, busca) com reload e histórico; reinício da paginação; resposta fora de ordem (`variable-latency`); resultado vazio; preço inválido; `network-error` com "Tentar novamente"; sem overflow horizontal em 390 px (`/` e `/nfts/nft-1`).
- `states.spec.ts`: skeletons do catálogo e do detalhe sob `slow`; erro HTTP 500 com retry.
- `account.spec.ts`: cadastro (conflito), login/logout, expiração, favoritos (rollback, isolamento), perfil/carteiras.
- `purchase.spec.ts`: cupom, quantidades, rollback otimista, persistência, compra completa, validação, recusa, duplo clique, timeout/idempotência, cotação alterada, pendente, conflito de chave, wallet-rejected.
- `quantity-limit.spec.ts`, `quantity-extra.spec.ts`: limite de quantidade, indisponível, NFT inexistente.
- `realtime.spec.ts`: `nft.updated` com live region, duplicata/antigo, desconexão e reconciliação (via `socket.io-client` real e mock `/api/__mock/*`).

## Isolamento e determinismo
Cada teste chama `POST /api/__mock/reset` e seleciona cenários via `/api/__mock/scenario` (`default`, `empty`, `http-500`, `slow`, `variable-latency`, `network-error`, cenários de pagamento). Eventos são disparados por endpoints de mock que passam pelo servidor Socket.IO simulado. Sem controle de relógio.

## Não coberto
Regressão visual (sem baselines), testes de teclado/foco (só Esc no diálogo), axe, zoom, `order.updated` e2e, merge de carrinho do visitante no login, responsivo de perfil/carteiras/confirmação, rota 404, política de retry do QueryClient isolada. Ver `docs/qa/known-gaps.md`. Resultados de execução não são registrados aqui; ver `reports/qa-report.md`.
