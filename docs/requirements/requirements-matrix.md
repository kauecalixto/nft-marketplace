# Matriz de requisitos (enunciado §3-§9)

Estados: IMPLEMENTADO / PARCIAL / NÃO IMPLEMENTADO, avaliados por leitura de código e testes (`tests/e2e/*.spec.ts`, `tests/unit/eth.test.mjs`). "Testes executados" não é afirmado aqui; ver `reports/qa-report.md`.

| ID | requisito | seção | contexto | arquivo/módulo | teste | estado | evidência |
|---|---|---|---|---|---|---|---|
| REQ-01 | Tela Início: destaques, catálogo, busca, filtros, ordenação, navegação ao NFT | §3 | Catálogo | src/catalog/HomePage.tsx | catalog.spec, featured-gallery.spec | IMPLEMENTADO | destaques, catálogo, busca, filtros, ordenação, paginação; fidelidade ao Figma não verificada |
| REQ-02 | Detalhe: galeria, informações, edição, quantidade, favoritos, compra | §3 | Catálogo | src/catalog/NftDetailPage.tsx | featured-gallery.spec, quantity-limit.spec, quantity-extra.spec | IMPLEMENTADO | galeria, qtd, favorito, carrinho; edição indisponível coberta |
| REQ-03 | Carrinho: editar qtd, remover, cupom, resumo | §3 | Compra | src/purchase/CartPage.tsx | purchase.spec (cupom, quantidades) | IMPLEMENTADO | testes de cupom/quantidade/remoção |
| REQ-04 | Pagamento: dados, carteira+rede, revisão, envio | §3 | Compra | src/purchase/CheckoutPage.tsx | purchase.spec | IMPLEMENTADO | formulário, validação, diálogo de revisão |
| REQ-05 | Confirmação: resultado, transação, itens, taxas, total | §3 | Compra | src/purchase/OrderPage.tsx | purchase.spec (compra completa) | IMPLEMENTADO | tx-hash, itens, totais |
| REQ-06 | Login com validação e retorno ao fluxo anterior | §3 | Conta (apoio) | src/account/AuthPages.tsx, guard.ts | account.spec | IMPLEMENTADO | redirect + expired |
| REQ-07 | Cadastro com validação e conflito | §3 | Conta | AuthPages.tsx | account.spec (conflito) | IMPLEMENTADO | 409 EMAIL_CONFLICT |
| REQ-08 | Perfil: dados, avatar, senha | §3 | Conta | PrivatePages.tsx | account.spec | PARCIAL | avatar só por URL; sem upload |
| REQ-09 | Carteiras principal/secundária, edição | §3 | Conta | PrivatePages.tsx | account.spec, wallet-edit.spec | IMPLEMENTADO | limite 2, role, edição de carteira |
| REQ-10 | Mobile para perfil, carteiras, confirmação; desktop/mobile geral | §3, §8 | Todos | src/index.css, PrivatePages.tsx, OrderPage.tsx | responsive.spec (390/768/1440: carrinho, checkout, pedido, perfil, carteiras), catalog.spec | IMPLEMENTADO | overflow corrigido em /wallets e /orders/:id; fidelidade ao Figma não verificada |
| REQ-11 | Ações fora de escopo não aparentam sucesso | §3 | Todos | - | - | NÃO IMPLEMENTADO | não verificado/sem links auxiliares |
| REQ-12 | Busca/filtros/ordenação/paginação na URL, sobrevivem a refresh/histórico | §3 | Catálogo | app.tsx (`validateCatalogSearch`), HomePage.tsx | catalog.spec (reload e goBack) | IMPLEMENTADO | search params `q,min,max,available,sort,page` validados |
| REQ-13 | Filtros combináveis; reinício de paginação | §3 | Catálogo | HomePage.tsx `setFilters`, mocks/handlers.ts | catalog.spec | IMPLEMENTADO | preço em BigInt wei no mock; qualquer filtro zera `page` |
| REQ-14 | Consultas refletem params; vazio, falha, respostas fora de ordem | §3 | Catálogo | HomePage.tsx, queryClient.ts | catalog.spec (vazio, erro+retry, fora de ordem) | IMPLEMENTADO | `AbortSignal` + chave por params; cenários `empty`, `network-error`, `variable-latency` |
| REQ-15 | Detalhe: acesso direto, inexistente, edição indisponível, limite | §3 | Catálogo | NftDetailPage.tsx, quantity.ts | quantity-limit, quantity-extra | IMPLEMENTADO | testes de 404, indisponível, limite |
| REQ-16 | Favoritos persistem por usuário | §3 | Catálogo | FavoriteButton.tsx, mocks/account.ts | account.spec | IMPLEMENTADO | persistência, isolamento |
| REQ-17 | Carrinho: add/alterar/remover respeitando disponibilidade | §3 | Compra | mocks/purchase.ts, CartPage | purchase.spec | IMPLEMENTADO | `max` |
| REQ-18 | Carrinho persiste após refresh e mescla visitante ao autenticar | §3 | Compra | mocks/purchase.ts `owner()` | purchase.spec (refresh), cart-merge.spec | IMPLEMENTADO | refresh e merge de visitante no login testados |
| REQ-19 | Aplicar/remover cupom; inválido/expirado | §3 | Compra | CartPage, mocks/purchase.ts | purchase.spec | IMPLEMENTADO | KURIO10/KURIO5 |
| REQ-20 | Subtotal, desconto, taxa, total coerentes com API | §3 | Compra | QuoteSummary, buildQuote | purchase.spec, eth.test | IMPLEMENTADO | BigInt |
| REQ-21 | Refletir mudanças de preço/disponibilidade com carrinho aberto | §3, §7 | Compra | RealtimeBridge, CartPage | realtime.spec (só detalhe) | PARCIAL | invalida cart/quote; aviso no carrinho sem teste |
| REQ-22 | ETH como string decimal; qtd inteira; cotação como referência | §3 | Compra | purchase/eth.ts | tests/unit/eth.test.mjs | IMPLEMENTADO | teste unitário (sem script npm) |
| REQ-23 | Validar campos; revisar antes de enviar | §3 | Compra | CheckoutPage | purchase.spec | IMPLEMENTADO | validate() |
| REQ-24 | Carteiras cadastradas, rede, simulação de conexão/recusa/desconexão | §3 | Compra | CheckoutPage | purchase.spec (wallet-rejected) | PARCIAL | recusa sim; sem conexão/desconexão |
| REQ-25 | Revalidar cotação; mudança exige nova confirmação | §3 | Compra | CheckoutPage (QUOTE_STALE) | purchase.spec | IMPLEMENTADO | teste de cotação alterada |
| REQ-26 | Sem pedidos duplicados (clique/timeout) | §3 | Compra | CheckoutPage (busy, idemKey) | purchase.spec | IMPLEMENTADO | duplo clique, timeout |
| REQ-27 | Pedido pendente/confirmado/recusado; recuperação após refresh/reconexão | §3 | Compra | OrderPage, orderQuery | purchase.spec (pendente) | PARCIAL | polling 1 s; recuperação após refresh sem teste explícito |
| REQ-28 | Confirmação só para pedido confirmado | §3 | Compra | OrderPage | purchase.spec | IMPLEMENTADO | |
| REQ-29 | Preservar itens em falha; remover só comprados | §3 | Compra | settle() | purchase.spec (recusado) | IMPLEMENTADO | |
| REQ-30 | Recibo é snapshot imutável | §3 | Compra | Order.items copiados | - | PARCIAL | snapshot no mock; sem teste de alteração posterior |
| REQ-31 | Sessão: cadastro, login, logout; rotas privadas | §3 | Conta | session.tsx, guard.ts | account.spec | IMPLEMENTADO | |
| REQ-32 | Sessão após refresh; expiração na navegação e checkout | §3 | Conta | api.ts interceptor | account.spec (navegação) | PARCIAL | checkout: contexto do formulário não preservado |
| REQ-33 | Logout/troca de usuário limpam cache e subscriptions | §3 | Conta | startSession, logout, client.ts | account.spec (isolamento) | PARCIAL | cache limpo; socket na mesma aba sem teste |
| REQ-34 | Validar formulários (cadastro, perfil, senha, carteiras) incl. erros da API | §3 | Conta | Field.tsx, handlers | account.spec | IMPLEMENTADO | 422 |
| REQ-35 | Senha não armazenada em claro; credenciais fictícias | §3 | Conta | mocks/account.ts | - | IMPLEMENTADO | SHA-256 + salt; sem teste |
| REQ-36 | Router: rotas, search params, proteção | §4 | Todos | app.tsx | todos e2e, not-found.spec | IMPLEMENTADO | rota 404 (notFound) coberta |
| REQ-37 | Query para consultas/mutations; REST via Axios | §4 | Todos | queries.ts, api.ts | e2e | IMPLEMENTADO | |
| REQ-38 | Contratos tipados | §4 | Todos | types.ts | tsc | PARCIAL | ver CartPage/RealtimeBridge com `unknown` |
| REQ-39 | Loading, vazio, erro, sucesso, atualização em segundo plano | §4 | Todos | páginas | states.spec, catalog.spec | PARCIAL | skeletons (catálogo, detalhe, resumo do carrinho), vazio e erro+retry no catálogo/detalhe; segundo plano: `aria-busy`+opacidade na paginação; demais telas só texto |
| REQ-40 | Invalidação coerente; descarte de respostas obsoletas | §4 | Todos | invalidateQueries, client.ts, queries com `signal` | realtime.spec, catalog.spec (fora de ordem) | IMPLEMENTADO | `AbortSignal` repassado ao Axios em todas as queries; invalidação por evento |
| REQ-41 | Isolamento por usuário e parâmetros | §4 | Todos | queryKeys, clear() | account.spec | IMPLEMENTADO | |
| REQ-42 | Rotas inexistentes e acesso direto | §4 | Todos | app.tsx | not-found.spec | IMPLEMENTADO | notFound testado |
| REQ-43 | Otimista com rollback | §4 | Compra/Catálogo | useChangeQuantity, FavoriteButton | purchase.spec, account.spec | IMPLEMENTADO | |
| REQ-44 | Política de cache/retry documentada | §4 | Todos | src/queryClient.ts, ARCHITECTURE.md | - | IMPLEMENTADO | staleTime 30 s, gcTime 5 min, refetchOnWindowFocus, retry 1x só rede/5xx, mutations sem retry; sem teste automatizado da política |
| REQ-45 | Contratos REST mínimos | §5 | Todos | src/mocks/*, docs/CONTRACTS.md | e2e | PARCIAL | `/nfts` paginado `{items,total,page,pageSize}` com filtros/ordem; avatar sem upload |
| REQ-46 | Erros: validação, sessão, permissão, inexistente, conflito, transitório | §5 | Todos | handlers | e2e | IMPLEMENTADO | 422/401/403/404/409/503 |
| REQ-47 | Idempotência de pedidos (mesma chave recupera; conteúdo diferente = conflito) | §5 | Compra | POST /orders | purchase.spec | IMPLEMENTADO | |
| REQ-48 | MSW na camada de rede; sem mocks em componentes | §6 | Mocks | src/mocks | - | IMPLEMENTADO | `VITE_ENABLE_MOCKS` |
| REQ-49 | Estado consistente e reset | §6 | Mocks | /__mock/reset | e2e (beforeEach) | IMPLEMENTADO | |
| REQ-50 | Simulação de rede: lentidão, latência variável, timeouts, conexão, HTTP erro | §6 | Mocks | handlers.ts | catalog.spec, states.spec, purchase.spec, realtime.spec | IMPLEMENTADO | cenários `slow`, `variable-latency`, `network-error`, `http-500`, 504, desconexão do socket |
| REQ-51 | Fixtures variadas, 2 usuários, cenários determinísticos | §6 | Mocks | fixtures.ts, account.ts | catalog.spec | PARCIAL | 12 NFTs, 2 usuários, cenários determinísticos; sem cenários 4xx genéricos |
| REQ-52 | Socket.IO via MSW (socket.io-binding), transporte documentado | §6 | Mocks | mocks/socket.ts, ARCHITECTURE.md | realtime.spec | IMPLEMENTADO | |
| REQ-53 | Cenários exercitam socket.io-client | §6 | Realtime | realtime/client.ts | realtime.spec | IMPLEMENTADO | |
| REQ-54 | Mocks ativados por config e no build de demonstração | §6 | Mocks | main.tsx, .env.demo | playwright usa build:demo | IMPLEMENTADO | |
| REQ-55 | Evento `nft.updated` atualiza catálogo, detalhe, carrinho | §7 | Realtime | client.ts | realtime.spec (detalhe) | PARCIAL | invalida os três; só detalhe testado |
| REQ-56 | Evento `order.updated` atualiza pedido e mostra confirmação/recusa | §7 | Realtime | client.ts, OrderPage | realtime-orders.spec | IMPLEMENTADO | testes e2e de `order.updated` |
| REQ-57 | Eventos com id, recurso, versão; tolera duplicata/antigo | §7 | Realtime | client.ts `fresh()` | realtime.spec | IMPLEMENTADO | |
| REQ-58 | Reconexão reconcilia com REST | §7 | Realtime | client.ts | realtime.spec | IMPLEMENTADO | |
| REQ-59 | Eventos de sessão anterior não atualizam outro usuário; liberar listeners | §7 | Realtime | client.ts, mocks/socket.ts | - | PARCIAL | filtro por userId; sem teste |
| REQ-60 | Cenário: preço muda -> UI informa, atualiza resumo, checkout barra cotação antiga | §7 | Realtime | CartPage, CheckoutPage | purchase.spec (stale-quote); realtime.spec | PARCIAL | partes testadas separadamente; sem teste ponta a ponta via socket no checkout |
| REQ-61 | Interrupção com pedido pendente; retomada sem nova compra | §7 | Realtime | OrderPage, orderQuery | purchase.spec (pendente) | PARCIAL | sem teste com desconexão + pendente |
| REQ-62 | Skeletons com shimmer; prefers-reduced-motion | §8 | UI | HomePage, NftDetailPage, CartPage, index.css | states.spec | PARCIAL | skeleton+shimmer e `prefers-reduced-motion` em catálogo, detalhe e resumo do carrinho; outras telas sem skeleton |
| REQ-63 | shadcn/ui e fidelidade ao Figma; 390/768/1440 | §8 | UI | src/components/ui (button, input, label, dialog) | responsive.spec, visual-regression.spec | PARCIAL | shadcn/ui só em checkout/carrinho (parcial); perfil, carteiras e catálogo sem shadcn; Figma sem acesso (NÃO IMPLEMENTADO) |
| REQ-64 | Teclado, foco visível, foco em diálogos | §8 | UI | CheckoutPage dialog (onCloseAutoFocus) | a11y-keyboard.spec | IMPLEMENTADO | trap de foco, Esc e retorno ao botão `review-order` testados |
| REQ-65 | Semântica, labels, erros associados | §8 | UI | Field.tsx, app.tsx (`<main>`) | account.spec, a11y-keyboard.spec | PARCIAL | login, cadastro, perfil, senha e carteiras testados; demais telas sem auditoria axe |
| REQ-66 | Alt de imagens, contraste, não só cor, feedback acessível | §8 | UI | role=status/alert | - | PARCIAL | live regions; imagens do carrinho com alt vazio |
| REQ-67 | Sem overflow horizontal / zoom | §8 | UI | PrivatePages.tsx, OrderPage.tsx | responsive.spec, catalog.spec | PARCIAL | overflow testado em carrinho, checkout, pedido, perfil, carteiras, `/`, detalhe; zoom não verificado |
| REQ-68 | E2E 1: busca, filtros, ordenação, paginação, histórico | §9 | Catálogo | catalog.spec | catalog.spec | IMPLEMENTADO | filtros combinados, ordenação, paginação, reload, goBack, fora de ordem |
| REQ-69 | E2E 2: detalhe direto e inexistente | §9 | Catálogo | quantity-limit.spec | quantity-limit.spec | IMPLEMENTADO | |
| REQ-70 | E2E 3: cadastro, login, expiração, logout, troca de usuário | §9 | Conta | account.spec | account.spec | IMPLEMENTADO | |
| REQ-71 | E2E 4: favoritos com falha | §9 | Catálogo | account.spec | account.spec | IMPLEMENTADO | |
| REQ-72 | E2E 5: carrinho/cupom/persistência | §9 | Compra | purchase.spec | purchase.spec | IMPLEMENTADO | persistência no login sem teste |
| REQ-73 | E2E 6: compra completa | §9 | Compra | purchase.spec | purchase.spec | IMPLEMENTADO | |
| REQ-74 | E2E 7: falha, clique repetido, timeout | §9 | Compra | purchase.spec | purchase.spec | IMPLEMENTADO | |
| REQ-75 | E2E 8: perfil, avatar, senha, carteiras | §9 | Conta | account.spec | account.spec | PARCIAL | um teste conjunto; avatar/senha não confirmados individualmente |
| REQ-76 | E2E 9: preço via Socket.IO no checkout | §9 | Realtime | realtime.spec | realtime.spec (detalhe) | PARCIAL | não no checkout |
| REQ-77 | E2E 10: duplicados/antigos, desconexão, pedido pendente | §9 | Realtime | realtime.spec | realtime.spec | PARCIAL | duplicata/antigo e desconexão sim; pedido pendente com desconexão não |
| REQ-78 | E2E 11: teclado, foco de diálogos, validação | §9 | UI | CheckoutPage | a11y-keyboard.spec, purchase.spec | IMPLEMENTADO | Tab, foco visível, trap, Esc, retorno de foco |
| REQ-79 | E2E 12: skeletons, falha e nova tentativa | §9 | UI | states.spec, catalog.spec | states.spec, catalog.spec | IMPLEMENTADO | skeleton sob `slow`, 500 e `network-error` com "Tentar novamente" |
| REQ-80 | Chromium em desktop e mobile; regressão visual com baselines | §9 | Testes | playwright.config.ts | visual-regression.spec | IMPLEMENTADO | projetos desktop/tablet/mobile; `toHaveScreenshot` com baselines em `visual-regression.spec.ts-snapshots` |
| REQ-81 | Isolamento por teste; relógio/latência controlados; relatório HTML e traces | §9 | Testes | playwright.config.ts | - | PARCIAL | reporter html, trace on-first-retry; sem controle de relógio |

| REQ-82 | Lighthouse: 3 execuções por página/perfil, config versionada, relatórios (§10) | §10 | Entrega | scripts/lighthouse.mjs, reports/lighthouse/ | - | IMPLEMENTADO | rerodado em 2026-10-21; medianas em `reports/lighthouse/README.md` (Perf 96-100, A11y/BP/SEO 100) |
| REQ-83 | Script de lint e demais comandos de entrega (§12) | §12 | Entrega | package.json | - | PARCIAL | script `lint` (eslint) existe; ainda sem script npm para `tests/unit/eth.test.mjs` |
| REQ-84 | Deploy público (§12) | §12 | Entrega | - | - | NÃO IMPLEMENTADO | sem configuração de deploy |