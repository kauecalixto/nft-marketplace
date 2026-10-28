# Relatório de QA independente (rodada 4)

Data: 2026-10-21. Nenhum código-fonte ou teste foi alterado. Correção: o diretório é um repositório git (origin `kauecalixto/nft-marketplace`, branch `main`); a frase original do QA, de que não era, estava errada. Não há PR aberto.

## Rodadas anteriores
- r1: aprovado com ressalvas.
- r2: aprovado com ressalvas.
- r3: aprovado com ressalvas. Gaps: flake em featured-gallery, config de trace, alt do carrinho, docs defasadas, deploy.

## Comandos e resultados reais
| Comando | Resultado |
|---|---|
| `npm run typecheck` | OK, sem erros |
| `npm run lint` | OK, 0 warnings |
| `npm run build:demo` | OK; aviso de chunk > 500 kB (`app-*.js` 521 kB, `browser-*.js` 457 kB) |
| `npm run test:unit` | 3/3 passam |
| `npx playwright test --reporter=line` execução 1 | **150 passed** (1.1 min) |
| `npx playwright test --reporter=line` execução 2 | **149 passed, 1 failed**: `[chromium-desktop] purchase.spec.ts:144 duplo clique no envio cria um único pedido` |
| `purchase.spec.ts:144 --repeat-each=15` (desktop, isolado) | 15/15 passam |

Conclusão: o teste de duplo clique é intermitente sob carga da suíte completa (1 falha em 2 execuções). O featured-gallery, que flakava na r3, passou nas duas execuções.

## Cobertura dos 12 grupos do §9
| # | Grupo | Specs | Cobertura |
|---|---|---|---|
| 1 | Busca, filtros, ordenação, paginação, histórico | catalog.spec | Total |
| 2 | Detalhe direto e inexistente | deep-route, quantity-limit, not-found | Total |
| 3 | Cadastro, login, expiração, logout, troca de usuário | account, avatar-wallet-expiry | Total (troca de subscriptions sem teste) |
| 4 | Favoritos com falha | account | Total |
| 5 | Carrinho, cupom, persistência refresh/login | purchase, cart-merge, quantity-extra | Total |
| 6 | Compra completa até o recibo | purchase | Total |
| 7 | Falha de pagamento, clique repetido, timeout | purchase, realtime-checkout | Total, mas o duplo clique é flaky |
| 8 | Perfil, avatar, senha, carteiras, validação | account, wallet-edit, avatar-wallet-expiry | Total (avatar por upload existe em `AvatarUpload.tsx`) |
| 9 | Preço/disponibilidade via Socket.IO no checkout | realtime-checkout, realtime-orders, realtime | Total |
| 10 | Duplicados/antigos, desconexão, pedido pendente | realtime, realtime-orders, realtime-checkout | Total |
| 11 | Teclado, foco de diálogos, validação | a11y-keyboard, purchase, responsive | Parcial: sem axe e sem zoom |
| 12 | Skeletons, falha e retry | states, catalog | Total |

Extras do §9: regressão visual com baselines (visual-regression.spec, 4 telas), `page.clock` no timeout, reporter html, `trace: 'retain-on-failure'` (config presente, atende ao gap da r3). Viewports: desktop 1440, tablet 768 e mobile 390.

## Eliminatórios (§11)
- Stack obrigatória em uso efetivo (Router, Query, Axios, MSW, socket.io-client): atende. Existem `queryClient.ts`, `api.ts`, `mocks/socket.ts` e `realtime/client.ts`.
- Fluxos principais não são apenas visuais: atende, por causa dos 150 testes E2E.
- Compra confirmada sem resposta da simulação: não encontrada. Os testes verificam `/orders` na API mock.
- Exposição de dados entre usuários: há testes de isolamento em account.spec e filtro por userId no socket. O teste de troca de subscriptions na mesma aba não existe.
- Eventos simulados direto na UI: não encontrado. Os testes passam pelo socket.io-client e pelo MSW.
- E2E executáveis: atende.
- **Não eliminatório, mas obrigatório (§12): deploy ausente, sem URL pública.** Isso mantém o desafio incompleto.

## Entrega §12
- README tem setup, variáveis, credenciais, cenários e reset, comandos, reprodução de falhas e limitações. Seções "Documentos" aparecem duplicadas.
- ARCHITECTURE.md e docs/CONTRACTS.md existem.
- Há comandos para dev, build, preview, typecheck, lint, test, audit:lighthouse.
- `vercel.json` está correto: `framework: vite`, `buildCommand: npm run build:demo` (mocks ativos), `outputDirectory: dist`, rewrite SPA que exclui `assets/` e `mockServiceWorker.js`. Não foi testado em ambiente real.
- Lighthouse (`reports/lighthouse/README.md`): 12 execuções, medianas todas acima das metas (Perf 91-100, A11y/BP/SEO 100, LCP mobile 2.6-2.8 s; rodada de 2026-10-28 no build final). Ressalva: perfil do Chromium reaproveitado, com avisos de IndexedDB.

## Segredos
Grep por token, secret, api_key e password com atribuição literal em `src`, `scripts` e `*.md` achou só mensagens de validação e campos de formulário, sem segredo. `.env` tem `VITE_API_URL=/api` e `VITE_ENABLE_MOCKS=false`. `.env.demo` tem `VITE_API_URL=/api` e `VITE_ENABLE_MOCKS=true`. Só variáveis públicas.

## Defeitos
1. Teste intermitente. `tests/e2e/purchase.spec.ts:144` (`dblclick` em `confirm-order`).
   - Esperado: passar de forma estável.
   - Real: falhou 1 de 2 execuções completas e passou 15/15 isolado.
   - Causa provável: corrida do dblclick contra a carga da suíte. Não houve tempo para ver o trace.
2. Aviso de build: chunks maiores que 500 kB (`app`, `browser`). Não afeta as metas do Lighthouse.
3. `README.md` com a seção "Documentos" duplicada (linhas 40 e 49). Defeito cosmético.

## Lacunas vs. enunciado
- Deploy e URL pública (§12): ausentes.
- Fidelidade ao Figma: não verificável. Sem acesso ao arquivo.
- shadcn/ui só parcial: usado em login, cadastro, carrinho, checkout, perfil e catálogo. Não foi possível auditar a cobertura total.
- Sem auditoria axe e sem teste de zoom (§8).
- Skeleton só em catálogo, detalhe e resumo do carrinho.
- Mocks sem cenários 4xx genéricos. Socket.IO só com websocket no namespace `/`.
- Expiração durante o checkout não preserva o formulário.
- OpenSpec/TLC: comparação pendente segundo as docs. Existe `docs/comparacao-ferramentas.md` e `reports/speckit-validation.md`, não conferidos em detalhe.
- PR no fork não aberto.

## Divergências de documentação (conferidas no código)
Spot-check de 40 linhas da matriz (REQ-01 a REQ-84) contra código e specs. Em ordem de severidade:
- **REQ-08 e REQ-45** dizem "avatar só por URL, sem upload". Isso é falso: `src/account/AvatarUpload.tsx` usa `type="file"` e `FileReader`, e está montado em `PrivatePages.tsx:18`. O mesmo vale para README e known-gaps ("Perfil: avatar só por URL").
- **REQ-24** diz "sem conexão/desconexão de carteira". `CheckoutPage.tsx:54,215,216` implementa os botões `connect-wallet` e `disconnect-wallet`. known-gaps e implementation-status repetem o erro ("Sem simulação de conexão/desconexão"). A cobertura por teste desses botões não foi verificada.
- **REQ-66** e known-gaps dizem "imagens do carrinho com alt vazio". `CartPage.tsx:67` tem `alt={i.name}`, e `avatar-wallet-expiry.spec.ts:106` testa isso.
- **REQ-63**, known-gaps e README dizem que perfil, carteiras e catálogo ficam sem shadcn. `PrivatePages.tsx`, `HomePage.tsx` e `NftDetailPage.tsx` importam `components/ui`. Existem também `badge.tsx` e `skeleton.tsx`, que a matriz não lista (só button, input, label e dialog).
- **REQ-32** (expiração, `avatar-wallet-expiry.spec`) e **REQ-75** (avatar, senha) provavelmente estão defasados. Há spec novo para avatar, carteira e expiração.
- **REQ-21, REQ-55, REQ-27 e REQ-30** são marcados PARCIAL, mas `realtime-orders.spec` ("nft.updated com NFT no carrinho") e "refresh com pedido pendente recupera o mesmo pedido" cobrem os pontos citados como faltantes. Há subestimação.
- **REQ-22** diz "sem script npm" para o teste unitário. `npm run test:unit` existe (REQ-83 já confirma).
- **REQ-72** diz "persistência no login sem teste". `cart-merge.spec` cobre. Texto interno contraditório.
- **reports/challenge-validation.md** (linha 10): diz que o Lighthouse foi "medido ANTES da migração shadcn... não repetido". Está defasado: o Lighthouse foi rerodado em 2026-10-21. A linha 25 lista "foco após Esc" e "overflow 390 a confirmar" como pendentes, mas ambos já estão corrigidos e testados. Ela também diz que matriz e gaps podem estar desatualizados, o que é verdade apenas para os itens acima.
- **reports/implementation-status.md**: o comando `npx playwright test` só cita 3 projetos. A lista de testes omite avatar-wallet-expiry, responsive, visual-regression e outros. "shadcn em login, cadastro, carrinho e checkout" está defasado. A seção de "Código por contexto" omite `AvatarUpload.tsx`.
- Os itens REQ-01 a REQ-07, 09, 12 a 20, 25, 26, 28, 29, 31, 36 a 44, 46 a 54, 56 a 58, 60, 61, 64, 68 a 71, 73, 74, 76 a 82 e 84 coincidem com código e specs na leitura feita. Só verifiquei existência de arquivo e spec, não o comportamento linha a linha.
- Não foram contados os testes por projeto: 150 = desktop (todos os specs) + tablet e mobile (specs responsivos).

## Estados
- IMPLEMENTADO: sim para o escopo coberto pela matriz. Deploy e Figma não.
- TESTADO: typecheck, lint, build e unit passam. Playwright: 150/150 em uma execução e 149/150 na outra (flake).
- VALIDADO: build e tipos. Especificação OpenSpec/TLC não revalidada nesta rodada.
- VERIFICADO: esta revisão independente, sem acesso ao Figma nem a URL publicada.

## Veredito
**APROVADO COM RESSALVAS.** As verificações automatizadas passam e a cobertura dos 12 grupos é ampla. Os eliminatórios do §11 não foram ativados. As ressalvas são: deploy obrigatório ausente (§12), suíte E2E com um teste intermitente (`purchase.spec.ts:144`), fidelidade ao Figma não verificável, e documentação sobre avatar, carteira, alt e shadcn desatualizada em várias linhas da matriz, em known-gaps, no README e nos relatórios.
