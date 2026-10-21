# ARCHITECTURE

Fonte de requisitos: `docs/ENUNCIADO.md` (seções 1-12). Este documento descreve o que o código faz hoje; lacunas estão em `docs/qa/known-gaps.md`.

## Estrutura (src/)
- `catalog/`: HomePage (busca `q`, filtros de preço mín/máx, somente disponíveis, ordenação e paginação de 6 itens, tudo em search params), NftDetailPage, `quantity.ts` (`max = min(available, walletLimit)`), types.
- `purchase/`: CartPage, CheckoutPage (formulário + diálogo de revisão), OrderPage, `queries.ts` (hooks Query), `eth.ts` (BigInt, strings decimais), QuoteSummary.
- `account/`: session, guard (`requireAuth`), AuthPages, PrivatePages (perfil, carteiras), FavoriteButton.
- `realtime/`: client (socket.io-client), store (contador de avisos), Notice (live region), RealtimeBridge.
- `mocks/`: handlers MSW (account, purchase, nfts, socket, fixtures, shared). Ativados por `VITE_ENABLE_MOCKS=true` (`.env.demo`; scripts `dev` e `build:demo` usam `--mode demo`).
- `api.ts` (Axios + token), `queryClient.ts`, `app.tsx` (rotas), `main.tsx`.

## Bounded contexts -> pastas
Ver `docs/architecture/bounded-contexts.md`. Catálogo -> `src/catalog/`; Compra -> `src/purchase/`. Fora do glossário (apoio): `src/account/`, `src/realtime/`, `src/mocks/`.

## Rotas (TanStack Router, code-based)
`/` (search `q,min,max,available,sort,page`, validados por `validateCatalogSearch`), `/nfts/$id`, `/cart`, `/checkout` (privada), `/orders/$id` (privada), `/login` (search `redirect`, `expired`), `/register`, `/profile` (privada), `/wallets` (privada). Não há rota catch-all/404 definida (NÃO IMPLEMENTADO; ver known-gaps). O layout raiz usa o landmark `<main id="main">`; `index.html` tem `<meta name="description">` e `public/robots.txt` existe. Rotas privadas usam `beforeLoad: requireAuth`.

## Política de sessão
- Token = id do usuário (mock), guardado em `localStorage['nft:token']`; interceptor Axios envia `Authorization: Bearer`.
- Sessão recuperada por `GET /session` (`['session']`, `retry:false`), habilitado só com token.
- `requireAuth`: sem token ou sessão inválida -> `/login?redirect=<href>`. `safeRedirect` impede redirect externo.
- Interceptor de resposta: 401 fora de `/auth/*` com token -> limpa token, `queryClient.clear()`, `window.location.assign('/login?redirect=...&expired=true')`.
- Login/cadastro: `startSession` faz `queryClient.clear()` antes de gravar o novo usuário. Logout: `POST /auth/logout`, limpa token e cache, vai a `/login`.
- Senhas no mock: SHA-256 com salt (nunca em claro). Credenciais fictícias: `ana@example.test` / `kurio-demo`, `bruno@example.test` / `bruno-demo`.
- Expiração durante o checkout: o redirect preserva o destino; o formulário digitado NÃO é preservado (limitação).

## Estado do carrinho
O servidor (mock) é a fonte: `S.carts[userId|'guest']` em `localStorage['mock:purchase']`. O cliente lê `['cart']` e `['quote', network]`. O carrinho do visitante é mesclado ao do usuário na primeira requisição autenticada (`owner()` em `mocks/purchase.ts`), respeitando `max`. Após pedido confirmado, só itens/quantidades comprados saem. Cupom `KURIO10` (10%) válido, `KURIO5` expirado. Taxa por rede: ethereum 0.005, polygon 0.001, base 0.0005 ETH. Atualização otimista com rollback: quantidade e remoção (carrinho) e favoritos.

## Catálogo: filtros, ordenação e paginação (IMPLEMENTADO)
- Estado na URL: `q`, `min`, `max` (decimais ETH, até 18 casas), `available=true`, `sort` (`price-asc|price-desc|name`), `page` (>1). Valores inválidos são descartados em `validateCatalogSearch`.
- Qualquer mudança de busca/filtro/ordenação zera `page`. Preço inválido mostra `role=alert` e não consulta; min > max também alerta.
- Query `['nfts', {q,min,max,available,sort,page}]` com `placeholderData: keepPreviousData` (lista anterior com `aria-busy` e opacidade durante a troca) e `AbortSignal` no Axios; respostas obsoletas não sobrescrevem a última página pedida (teste "fora de ordem" com `variable-latency`).
- Estados: skeleton com shimmer (carga inicial), vazio (`catalog-empty`), erro com "Tentar novamente" (`refetch`).
- O mock filtra/ordena por preço em BigInt (wei) e pagina com `PAGE_SIZE = 6`.

## Cache / retry (`src/queryClient.ts`)
- Queries: `staleTime` 30 s, `gcTime` 5 min, `refetchOnWindowFocus: true`, `retry` 1 vez somente em erro de rede (sem resposta) ou HTTP 5xx (nunca 4xx nem cancelamento), `retryDelay` 400 ms. Mutations: `retry: 0`.
- `AbortSignal` do TanStack Query é repassado ao Axios em todas as queries (catálogo, detalhe, sessão, favoritos, carteiras, carrinho, cotação, pedidos, `RealtimeBridge`).
- Overrides pontuais: `session` e `nft/:id` com `retry:false`; `orders/:id` com `refetchInterval: 1000` enquanto `pending`; o checkout busca cotação nova com `staleTime: 0` antes da revisão.
- Chaves: `['nfts', {filtros}]`, `['nft', id]`, `['cart']`, `['quote', network]`, `['orders', ...]`, `['favorites', userId]`, `['wallets']`, `['session']`.
- Invalidação: mutations de carrinho invalidam `cart`+`quote`; eventos socket invalidam por recurso (abaixo). Isolamento por usuário: `queryClient.clear()` em login/logout/401; favoritos têm userId na chave.
- Retry de pedido: loop manual (até 3 tentativas, 300 ms) em 504/erro de rede, reutilizando a mesma `Idempotency-Key` (`useRef`); a trava `busy` evita duplo clique.
- Sem teste automatizado da política em si (apenas efeitos observáveis nos e2e).

## Reconciliação REST <-> Socket.IO
`realtime/client.ts` usa `socket.io-client` (transporte websocket, path `/socket.io`). Eventos só invalidam queries; REST é a fonte da verdade.
- `nft.updated` -> invalida `nfts`, `nft/:id`, `cart`, `quote` e incrementa o aviso (live region).
- `order.updated` -> só se `e.userId === token atual`; invalida `orders`, `order`.
- Deduplicação: `seenIds` (eventId) e `versions` (`resource:id` -> maior versão); duplicatas e versões <= à aplicada são descartadas.
- Reconexão (`connect` após a primeira): invalida `nfts, nft, cart, quote, order, orders`.
- Troca de token (evento `storage` / `nft:token-changed`): limpa dedupe e avisos, reenvia `subscribe`/`unsubscribe`, invalida tudo. Cleanup: remove listeners, `socket.off()`, `unsubscribe`, `disconnect`.
- Observação: `setToken` (`api.ts`) apenas notifica `subscribeToken` e não dispara `TOKEN_CHANGED`/`storage` na mesma aba; a troca de usuário na mesma aba depende do reconnect/`queryClient.clear()`. Não há teste cobrindo troca de usuário com socket ativo.

## MSW: transporte e limitações
`ws.link('*')` + `@mswjs/socket.io-binding` (`toSocketIo`), no Service Worker do navegador. Limitações (comentário em `mocks/socket.ts`): só transporte websocket, namespace `/`, sem rooms/broadcast nativos (lista de clientes mantida manualmente; filtro por usuário no `subscribe`), sem ack, sem recuperação de sessão, sid fixo; ping manual a cada 20 s. Endpoints `/api/__mock/*` controlam cenários/eventos e não existem fora do mock. Estado persiste em `localStorage` (`nft-marketplace:account-db`, `mock:purchase`); `/api/__mock/reset` restaura.
Cenários (`POST /api/__mock/scenario`): default, empty, http-500, slow (+3 s), variable-latency (página ímpar 900 ms, par 100 ms: provoca respostas fora de ordem), network-error (`HttpResponse.error()`), payment-declined, payment-pending, payment-held, payment-timeout, stale-quote, wallet-rejected. Os cenários de rede afetam `/nfts` e `/nfts/:id`.

## Desvio do Figma
Não houve acesso ao Figma. A UI é Tailwind v4 simples (classes utilitárias, sem tokens do layout), sem fidelidade visual (NÃO IMPLEMENTADO). shadcn/ui NÃO é usado (NÃO IMPLEMENTADO). Imagens dos NFTs são SVGs data-URI gerados (substituição de assets). Há grid responsivo no catálogo e projetos Playwright tablet (768) e mobile (390) para os specs responsivos; não há regressão visual nem layout mobile dedicado para perfil/carteiras/confirmação.

## Decisões de UX
- Quantidade limitada por `min(disponível, limite por carteira)`, botão + desabilitado com mensagem; "Adicionar" desabilitado quando indisponível.
- Revisão em diálogo modal (`role=dialog`, `aria-modal`, foco preso, Esc fecha, foco volta ao botão de origem).
- Cotação revalidada na revisão; mudança (`QUOTE_STALE`) exige nova confirmação.
- Pedido pendente mostra status e barra novo pedido (`ORDER_PENDING`); confirmação só para `confirmed`.
- Erros de campo via `role=alert`; avisos de sucesso via `role=status`.
- Loading: skeleton com shimmer (`.skeleton`, desativado em `prefers-reduced-motion`) no catálogo, detalhe e resumo do carrinho; demais telas usam texto simples. Erros de consulta no catálogo/detalhe têm botão "Tentar novamente".

## Entrega e auditoria
`public/robots.txt`, `<meta name="description">` e landmark `<main>` existem. `scripts/lighthouse.mjs` (`npm run audit:lighthouse`, preview na porta 4180) grava em `reports/lighthouse/`; resultados e causas em `reports/lighthouse/README.md` (nova execução em andamento). Deploy, script `lint` e rota 404 NÃO IMPLEMENTADOS.
