# Relatório de QA independente (rodada 3)

Data: 2026-10-21. QA não alterou src, tests nem outros docs.

## Rodadas anteriores
- Rodada 1: aprovado com ressalvas.
- Rodada 2: aprovado com ressalvas. Lacunas então: filtros/paginação, AbortSignal, política de cache, skeletons, 12 grupos incompletos.

## Comandos e resultados reais
| Comando | Resultado |
|---|---|
| `npm run typecheck` | OK, sem erros |
| `npm run lint` (`--max-warnings 0`) | OK, sem avisos |
| `npm run build:demo` | OK (aviso de chunk >500 kB, não bloqueante) |
| `npx playwright test --reporter=line` execução 1 | 94 passed, 1 failed (95 testes) |
| `npx playwright test --reporter=line` execução 2 | 95 passed |

Falha da execução 1: `[chromium-desktop] tests/e2e/featured-gallery.spec.ts:18 destaques exibem skeleton enquanto carregam`.

### Investigação do flake (featured-gallery.spec.ts:18)
- Handler `/api/nfts/featured` em `src/mocks/handlers.ts:69` atrasa 3000 ms no cenário `slow`. O skeleton (`src/catalog/HomePage.tsx:58`) fica visível por 3 s, bem mais que o timeout do `expect`. Portanto o skeleton em si não é o problema.
- Causa provável (race de teste): o `beforeEach` (linhas 3-6) faz `goto('/')` e logo em seguida `fetch('/api/__mock/reset')` e `fetch('/api/__mock/scenario')` via `page.evaluate`. `src/main.tsx` só monta o app depois de `await worker.start()`, e o `load` do navegador não espera esse bootstrap assíncrono. Se o `fetch` rodar antes do Service Worker do MSW assumir a página, ele vai ao servidor de preview e não ao handler. O cenário `slow` então nunca é definido, o destaque carrega na hora e o skeleton nunca aparece.
- Veredito: flake de projeto de teste (falta de espera por prontidão do MSW), não defeito do produto. A execução 2 passou. Não foi possível provar a causa com instrumentação, porque o QA não pode editar testes. Correção sugerida: esperar `navigator.serviceWorker.controller` (ou um sinal "mocks prontos") antes do `fetch`. Os outros specs que usam o mesmo padrão têm a mesma exposição.

## Cobertura dos 12 grupos do §9
| # | Grupo | Specs | Observação |
|---|---|---|---|
| 1 | Busca, filtros, ordenação, paginação, histórico | catalog.spec | reload, goBack, fora de ordem, vazio |
| 2 | Detalhe direto e inexistente | quantity-limit.spec, quantity-extra.spec, not-found.spec | OK |
| 3 | Cadastro, login, expiração, logout, troca de usuário | account.spec | OK |
| 4 | Favoritos com falha | account.spec | OK |
| 5 | Carrinho, cupom, persistência refresh/login | purchase.spec, cart-merge.spec | OK |
| 6 | Compra completa | purchase.spec | OK |
| 7 | Falha, clique repetido, timeout | purchase.spec | OK |
| 8 | Perfil, avatar, senha, carteiras, erros | account.spec, wallet-edit.spec | um teste conjunto no perfil; avatar só por URL |
| 9 | Preço/disponibilidade via Socket.IO no checkout | realtime.spec | só no detalhe; **não no checkout** |
| 10 | Duplicados/antigos, desconexão, pedido pendente | realtime.spec, realtime-orders.spec | pendente + desconexão sem teste explícito |
| 11 | Teclado, foco de diálogo, validação | a11y-keyboard.spec, purchase.spec | OK |
| 12 | Skeletons, falha, retry | states.spec, catalog.spec, featured-gallery.spec | OK |

Grupos plenos: 1-8, 11, 12. Parciais: 9 e 10.

## Itens abertos anteriormente
| Item | Situação |
|---|---|
| Foco volta após Esc no diálogo de revisão | Corrigido. `a11y-keyboard.spec.ts:71-88` usa `toBeFocused` e passou nas duas execuções |
| Overflow em 390 de `/wallets` e `/orders/:id` | Corrigido. `responsive.spec.ts` cobre 390/768/1440 (carrinho, checkout, pedido, perfil, carteiras) e passou |
| Marcadores `test.fail` | Removidos (grep em `tests` sem ocorrências) |
| shadcn/ui real | Parcial. Telas: login/cadastro (`AuthPages.tsx` Button; `Field.tsx` Input/Label), carrinho (Button, Input, Skeleton), checkout (Button, Input, Label, Dialog). Catálogo, detalhe, perfil, carteiras e pedido não usam. `ui/badge.tsx` não é usado |
| 404 | `not-found.spec.ts` passa |
| Lint | Passa |
| Destaques, galeria | `featured-gallery.spec.ts` (galeria e destaques passaram; skeleton é o teste flaky) |
| Edição de carteira | `wallet-edit.spec.ts` passa |

## Defeitos
1. Esperado: relatório HTML e traces das falhas (§9, `Entregue relatório HTML e traces das falhas`). Real: `playwright.config.ts:8` usa `trace: 'on-first-retry'`, mas não há `retries` configurado (padrão 0), então nenhum trace é gerado quando um teste falha. Na execução 1 a falha não deixou trace. Severidade média.
2. Esperado: testes de §9 isolados e determinísticos. Real: race de prontidão do MSW em `featured-gallery.spec.ts:3-6` e `:18-24` (ver investigação). Severidade baixa a média.
3. Esperado: imagens relevantes com alternativa textual (§8). Real: `src/purchase/CartPage.tsx:67` usa `alt=""` nas imagens dos itens do carrinho. Severidade baixa (o nome do item aparece ao lado).
4. Esperado: o enunciado exige o runner `playwright test` e todos os comandos de entrega. Real: `tests/unit/eth.test.mjs` não tem script npm (`package.json` scripts). Severidade baixa.

## Lacunas vs enunciado
- Deploy público (§12, obrigatório): inexistente. Não há `vercel.json`, `netlify.json` nem fallback SPA. Item crítico de entrega.
- Fidelidade ao Figma (§8, 20 pontos): sem verificação nem tokens. Não verificada.
- shadcn/ui só em parte das telas (§2, §8).
- Skeleton com shimmer só em catálogo, detalhe, destaques e resumo do carrinho. Demais telas só com texto.
- §3: avatar só por URL, sem upload. Sem simulação de conexão/desconexão de carteira (só recusa).
- §3: expiração de sessão durante o checkout não preserva o formulário.
- §7/§9: sem teste ponta a ponta do cenário "preço muda via socket, UI informa, checkout bloqueia". Sem teste de pedido pendente com desconexão. Sem teste de isolamento de subscriptions na troca de usuário na mesma aba.
- §9: sem controle de relógio nos cenários sensíveis a tempo.
- §8: sem auditoria axe nem teste de zoom.
- §6: sem cenários 4xx genéricos nos mocks.
- OpenSpec/TLC na ferramenta alternativa: execução e comparação pendentes. PR no fork não aberto.
- Eliminatórios (§11): nenhum configurado como violado (stack em uso, MSW + socket.io-client, E2E executáveis). Ressalva: o requisito de deploy do §12 não é atendido.

## Divergências de documentação (verificadas em 12+ linhas)
Conferidas e corretas: REQ-44 (`src/queryClient.ts`: staleTime 30 s, gcTime 5 min, retry 1x só rede/5xx, mutations sem retry), REQ-42/36 (not-found.spec existe), REQ-64 (a11y-keyboard.spec), REQ-09 (wallet-edit.spec), REQ-62 (shimmer em HomePage, CartPage), REQ-84 (sem deploy), REQ-01/02 (featured-gallery), REQ-10/67 (responsive.spec), REQ-14/40 (signal repassado no HomePage), REQ-82 (README Lighthouse), REQ-80 (visual-regression.spec + snapshots), REQ-83 (lint existe, sem script unit).
Lighthouse: `reports/lighthouse/README.md` bate com as medianas de `summary.json` nas quatro combinações (inicio mobile 98/100/100/100, LCP 2,12 s, TBT 116 ms; detalhe mobile 96, LCP 2,41 s, TBT 127 ms; desktop 100 e LCP 0,57 s). Todas as metas atingidas.
Divergências:
- `docs/requirements/requirements-matrix.md` REQ-63 e `docs/qa/known-gaps.md` dizem que shadcn/ui está "só em checkout/carrinho". O código também usa em login/cadastro (`AuthPages.tsx`, `Field.tsx`, que serve também a perfil/carteiras se importado por eles). Documentação subestima o uso.
- `reports/implementation-status.md` (linhas de "Código por contexto" e "Comandos") lista testes e specs desatualizados: omite a11y-keyboard, cart-merge, catalog, featured-gallery, not-found, purchase, realtime-orders, responsive, visual-regression e wallet-edit na linha "Testes", e não cita `npm run lint` nos comandos.
- A matriz diz "trace on-first-retry" em REQ-81 como se entregasse traces; sem retries isso não produz trace (defeito 1).
- `ui/badge.tsx` existe sem uso.

## Estados
- IMPLEMENTADO: sim, com parciais acima.
- TESTADO: sim. Typecheck, lint e build OK; Playwright 94/95 e 95/95 em duas execuções (um flake de teste).
- VALIDADO: typecheck e build; especificação OpenSpec/TLC alternativa pendente.
- VERIFICADO: parcial, por esta rodada, sujeito às lacunas.

## Veredito
**APROVADO COM RESSALVAS.** Typecheck, lint, build e E2E passam (uma falha intermitente atribuída ao desenho do teste). Pendências principais: deploy público ausente (obrigatório no §12), fidelidade ao Figma não verificada, traces de falha não gerados, cobertura parcial dos grupos 9 e 10, shadcn/ui parcial.
