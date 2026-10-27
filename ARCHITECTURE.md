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
`/` (search `q,min,max,available,sort,page`, validados por `validateCatalogSearch`), `/nfts/$id`, `/cart`, `/checkout` (privada), `/orders/$id` (privada), `/login` (search `redirect`, `expired`), `/register`, `/profile` (privada), `/wallets` (privada). Rota 404 implementada via `notFoundComponent` no `rootRoute` (`src/app.tsx`). O layout raiz usa o landmark `<main id="main">`; `index.html` tem `<meta name="description">` e `public/robots.txt` existe. Rotas privadas usam `beforeLoad: requireAuth`.

## Política de sessão
- Token = id do usuário (mock), guardado em `localStorage['nft:token']`; interceptor Axios envia `Authorization: Bearer`.
- Sessão recuperada por `GET /session` (`['session']`, `retry:false`), habilitado só com token.
- `requireAuth`: sem token ou sessão inválida -> `/login?redirect=<href>`. `safeRedirect` impede redirect externo.
- Interceptor de resposta: 401 fora de `/auth/*` com token -> limpa token, `queryClient.clear()`, `window.location.assign('/login?redirect=...&expired=true')`.
- Login/cadastro: `startSession` faz `queryClient.clear()` antes de gravar o novo usuário. Logout: `POST /auth/logout`, limpa token e cache, vai a `/login`.
- Senhas no mock: SHA-256 com salt (nunca em claro). Credenciais fictícias: `ana@example.test` / `kurio-demo`, `bruno@example.test` / `bruno-demo`.
- Expiração durante o checkout: o redirect preserva o destino; os dados digitados do formulário são preservados em rascunho via hook de expiração de sessão (`sessionExpiryHooks` em `src/api.ts`) e o rascunho é restaurado após novo login.

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
- Timeout de requisição: `src/api.ts` cria o Axios com `timeout = API_TIMEOUT_MS` (`VITE_API_TIMEOUT_MS`, padrão 15000 ms se ausente ou inválido); ao estourar, o Axios rejeita com `ECONNABORTED`. Não há teste dedicado do timeout.
- Retry e chave de idempotência do pedido (`purchase/CheckoutPage.tsx`): `idemKey` (`useRef`, `crypto.randomUUID()`) é enviada em `Idempotency-Key`. Em 504 ou erro de rede há até 3 tentativas (300 ms) com a MESMA chave; após esgotá-las a chave é mantida para o próximo clique. Após sucesso, ou erro não transitório diferente de 401 (409 de conflito, validação etc.), a chave é regenerada. A chave também é guardada no rascunho de checkout (`sessionStorage['checkout-draft:<userId>']`) e reaproveitada quando o rascunho é restaurado após expiração de sessão. A trava `busy` evita duplo clique. O servidor (mock) deduplica por chave: mesma chave e mesmo corpo devolve o mesmo pedido; corpo diferente gera 409 `IDEMPOTENCY_CONFLICT`.
- Sem teste automatizado da política em si (apenas efeitos observáveis nos e2e).

## Reconciliação REST <-> Socket.IO
`realtime/client.ts` usa `socket.io-client` (transporte websocket, path `/socket.io`). Eventos só invalidam queries; REST é a fonte da verdade.
- `nft.updated` -> invalida `nfts`, `nft/:id`, `cart`, `quote` e incrementa o aviso (live region).
- `order.updated` -> só se `e.userId === token atual`; invalida `orders`, `order`.
- Deduplicação: `seenIds` (eventId) e `versions` (`resource:id` -> maior versão); duplicatas e versões <= à aplicada são descartadas.
- Reconexão (`connect` após a primeira): invalida `nfts, nft, cart, quote, order, orders`.
- Troca de token (evento `storage` / `nft:token-changed`): limpa dedupe e avisos, reenvia `subscribe`/`unsubscribe`, invalida tudo. Cleanup: remove listeners, `socket.off()`, `unsubscribe`, `disconnect`.
- Troca de usuário na mesma aba: `setToken` (`api.ts`) dispara o evento customizado `TOKEN_CHANGED` além de atualizar o storage, e `client.ts` escuta `storage` e `TOKEN_CHANGED` para reenviar `subscribe`/`unsubscribe` e invalidar caches. O cenário é exercitado em `tests/e2e/socket-user-switch.spec.ts`.

## MSW: transporte e limitações
`ws.link('*')` + `@mswjs/socket.io-binding` (`toSocketIo`), no Service Worker do navegador. Limitações (comentário em `mocks/socket.ts`): só transporte websocket, namespace `/`, sem rooms/broadcast nativos (lista de clientes mantida manualmente; filtro por usuário no `subscribe`), sem ack, sem recuperação de sessão, sid fixo; ping manual a cada 20 s. Endpoints `/api/__mock/*` controlam cenários/eventos e não existem fora do mock (lista em `docs/CONTRACTS.md`; inclui `POST /api/__mock/orders/:id/event`, que reemite `order.updated` para testar duplicata e evento antigo). Estado persiste em `localStorage` (`nft-marketplace:account-db`, `mock:purchase`); `/api/__mock/reset` restaura.
Cenários (`POST /api/__mock/scenario`): default, empty, http-500, slow (+3 s), variable-latency (página ímpar 900 ms, par 100 ms: provoca respostas fora de ordem), network-error (`HttpResponse.error()`), payment-declined, payment-pending, payment-held, payment-timeout, stale-quote, wallet-rejected. Os cenários de rede afetam `/nfts` e `/nfts/:id`.

## Desvio do Figma
Não houve acesso ao Figma. A UI utiliza Tailwind v4 com classes utilitárias, sem tokens do layout nem fidelidade visual estrita (NÃO IMPLEMENTADO). Componentes baseados em shadcn/ui (Radix UI + CVA + tailwind-merge) são utilizados em `src/components/ui/` (badge, button, dialog, input, label, skeleton) nas principais telas. Imagens dos NFTs são SVGs data-URI gerados (substituição de assets; ver seção Design). Há grid responsivo no catálogo e projetos Playwright tablet (768) e mobile (390) para os specs responsivos; há regressão visual automatizada (`npm run test:visual` via `tests/e2e/visual-regression.spec.ts`, baselines só `*-win32.png`; 2 deles estão desatualizados, ver `docs/qa/known-gaps.md`), mas não há layout mobile dedicado para perfil/carteiras/confirmação.

## Design
Redesign visual (direção própria; **sem acesso ao Figma, não há fidelidade ao Figma** — ver "Desvio do Figma"). Nenhuma lógica, rota, contrato, mock (exceto as imagens), `data-testid`, papel ARIA ou texto em português foi alterado; só classes/markup de layout, `src/index.css`, `src/components/ui/*`, ícones e wrappers.

**Tokens** (`src/index.css`, variáveis CSS + Tailwind v4 `@theme inline`):
- Cores: fundo `#f5f6fb`, superfície branca, texto `#0f172a` (17,8:1), texto secundário `#53607a` (5,3:1 sobre o fundo), acento índigo→violeta (`#4338ca`→`#6d28d9`, 8,0:1 com texto branco), sucesso `#15803d`, alerta `#b45309`, erro `#b91c1c`. Borda de controles `#7a869c` (≥ 3:1 sobre branco e sobre o fundo, WCAG 1.4.11); divisórias decorativas `#e3e6f0`.
- Raio: cards 20px (`rounded-card`), controles 12px (`rounded-control`). Sombras em 3 níveis (`shadow-card/pop/lift`). Foco: anel de 3px `#4f46e5` (+ offset), ≥ 3:1.
- Tipografia: pilha do sistema (`ui-sans-serif, system-ui, "Segoe UI", Inter…`); nenhuma fonte externa. Valores em ETH usam `tabular-nums` (`.num`).
- Movimento: transições de 150–350 ms; `prefers-reduced-motion` desliga transições, hover-zoom e o shimmer.

**Componentes** (`src/components/`): `ui/button` (primário em gradiente, outline, ghost, destrutivo, link; foco forte; desabilitado), `ui/input`, `ui/label`, `ui/badge` (+ success/warning/destructive), `ui/dialog` (overlay com blur, `max-h-[90dvh]` com rolagem), `ui/skeleton`, `icons.tsx` (SVG inline, sempre `aria-hidden`), `Avatar.tsx` (iniciais; decorativo).

**Decisões de UX**
- Header `sticky` com blur: marca (logotipo SVG), `nav aria-label="Principal"` com estado ativo (`aria-current`), contador de itens do carrinho (`cart-count`), avatar com iniciais + nome (`nav-user`) + Sair. Em 390 px os rótulos viram só ícone (continuam no nome acessível via `sr-only`), em duas linhas compactas, sem overflow; skip link preservado.
- Início: hero com o `h1` "Catálogo de NFTs", Destaques em cards grandes, filtros em painel, grade com hover (elevação + zoom da imagem), selo "Indisponível" (texto + cor), paginação centralizada.
- Detalhe em duas colunas (galeria grande + miniaturas com seleção clara; preço em destaque, selo de edição, stepper de quantidade). Carrinho e Checkout com resumo em painel lateral `sticky` no desktop. Erros sempre com ícone + texto. Pedido com cabeçalho de status colorido + ícone + texto (recibo). Login/Cadastro em cartão centrado; Perfil em duas colunas; 404 com chamada para voltar.
- Skeletons mantêm as dimensões do conteúdo real (6 cards = `pageSize`, imagem quadrada, resumo de 105 px) para não gerar layout shift.

**Substituição de assets (imagens dos NFTs)**: `src/mocks/fixtures.ts` gera arte SVG determinística por NFT (`art(n, v)`: paleta por NFT, 4 composições — círculos, ondas, anéis, losangos — e 3 variações para a galeria), como data-URI de poucos KB, proporção 1:1 e o mesmo `alt`. Para usar arte real, troque `image`/`images` em `fixtures.ts` (ou o endpoint real) por URLs locais; o markup só depende de `src` e `alt`.

**Revisão visual (capturas 390/768/1440 px de Início, Detalhe, Carrinho, Checkout, diálogo de revisão, Pedido, Login, Cadastro, Perfil, Carteiras e 404)**: ajustes feitos: divisor do "Total" em `QuoteSummary` passou a ser um separador de largura total (antes ficava interrompido entre as colunas) e o cartão de foto do perfil usa o mesmo preenchimento do cartão de perfil. Baselines `@visual` regenerados após o redesign.

**Desvios / limitações**: sem Figma (sem fidelidade verificável); tema escuro não implementado; labels flutuantes não usados (labels acima dos campos, mais robusto para os testes e leitores de tela); o texto do seletor de arquivo do navegador ("Choose File") segue o idioma do navegador.

## Decisões de UX
- Quantidade limitada por `min(disponível, limite por carteira)`, botão + desabilitado com mensagem; "Adicionar" desabilitado quando indisponível.
- Revisão em diálogo modal (`role=dialog`, `aria-modal`, foco preso, Esc fecha, foco volta ao botão de origem).
- Cotação revalidada na revisão; mudança (`QUOTE_STALE`) exige nova confirmação.
- Pedido pendente mostra status e barra novo pedido (`ORDER_PENDING`); confirmação só para `confirmed`.
- Erros de campo via `role=alert`; avisos de sucesso via `role=status`.
- Loading: skeleton com shimmer (`.skeleton`, desativado em `prefers-reduced-motion`) no catálogo, detalhe e resumo do carrinho; demais telas usam texto simples. Erros de consulta no catálogo/detalhe têm botão "Tentar novamente".

## Entrega e auditoria
`public/robots.txt`, `<meta name="description">` e landmark `<main>` existem. `scripts/lighthouse.mjs` (`npm run audit:lighthouse`, preview na porta 4180) grava em `reports/lighthouse/`; resultados e causas em `reports/lighthouse/README.md` (medianas de 3 execuções por combinação; precisam ser refeitas se a UI mudar, e a UI mudou depois da última rodada). Deploy público NÃO IMPLEMENTADO (script `lint` e rota 404 implementados).

## Limitações conhecidas
Lista viva em `docs/qa/known-gaps.md`. Principais: sem deploy público nem URL; sem acesso ao Figma; sem auditoria axe; o carrinho inteiro vira o pedido (não existe pagamento parcial); CI em `.github/workflows/ci.yml` ainda não rodou no GitHub; baselines visuais só win32.
