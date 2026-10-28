# Relatório de QA independente (rodada 5, fechamento da entrega)

Data: 2026-10-28. Commit auditado: `51893e8` (`main`, `origin` = `kauecalixto/nft-marketplace`). Nenhum código de produção, teste ou configuração foi alterado por esta rodada; os artefatos do QA são este relatório e `reports/qa-interactive-audit.md`. Os scripts de auditoria ficaram fora do repositório. Este relatório substitui o da rodada 4 (2026-10-21), que estava desatualizado (ver "Afirmações antigas corrigidas").

Escopo e método: o commit `51893e8` foi extraído com `git archive` para uma pasta temporária e construído lá (`npm run build:demo`, `vite preview` em `localhost:4174`), para não depender da árvore de trabalho, que o ui-designer está alterando (mobile). `node_modules` é o do projeto. **Não rodei `npm ci` em cópia limpa**; a evidência de `npm ci` sem flags vem do orquestrador e não foi reexecutada por mim.

## Comandos e resultados reais (commit 51893e8)
| Comando | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run test:unit` | 3 testes, 3 passam, 0 falham (Node v24.14.1) |
| `npm run build:demo` | OK; aviso de chunk > 500 kB: `app-*.js` 587.710 B, `browser-*.js` 460.058 B |
| `npx playwright test` (config idêntica à do projeto, porta 4174) | **216 passed, 0 failed, 0 skipped** em 8,4 min (3 projetos: desktop 1440, tablet 768, mobile 390; inclui os 3 `@visual` e `interativos.spec.ts`) |
| CI do GitHub (API pública, não é execução minha) | run de `51893e8`: `completed / success`; `eb4f657` e `356009e` também `success`; `07f87ee` `cancelled` |

Observação sobre a execução: na rodada 4 o `purchase.spec.ts:144` falhou 1 de 2 vezes. Nesta rodada passou na execução completa (216/216). Uma única execução não prova que a intermitência acabou.

## Deploy público (https://nft-marketplace-sable.vercel.app)
- Acesso direto responde 200: `/`, `/nfts/nft-1`, `/cart`, `/criadores`, `/aprenda` e uma rota inexistente (fallback SPA, a página 404 é do app). `/mockServiceWorker.js` é servido como `application/javascript`, `/robots.txt` como `text/plain`.
- Headers de segurança presentes (CSP `default-src 'self'; script-src 'self'; ... worker-src 'self'; connect-src 'self' ws: wss:`). Com a CSP ativa, MSW e o socket simulado funcionam: 18/18 fluxos abaixo passam na URL.
- Correspondência com o código: o `src/` não muda entre `eb4f657` (commit declarado do deploy) e `51893e8` (só docs). O `index.html` publicado referencia `index-wrimhYNT.js` e o meu build `index-CdAyl3VH.js`; o tamanho do arquivo de entrada é igual (2.693 B), mas os hashes diferem (builds em SO e caminho distintos). **Não consegui provar byte a byte** que o publicado é o código do commit; a evidência é indireta (src idêntico, comportamento idêntico nos mesmos fluxos).

## Auditoria de interativos (`reports/qa-interactive-audit.md`)
- 14 rotas/estados × 2 larguras (1440 e 390) × 2 alvos (build local e URL pública): início (visitante e logado), detalhe, carrinho, pagamento, pedido, login, cadastro, perfil, carteiras, criadores, aprenda, artigo, 404.
- 972 controles acionáveis por alvo, cada um por **mouse e por teclado**: **0 "SEM EFEITO"**, 0 links com `href` vazio ou `#`, 0 erros JS não tratados. Percurso por Tab: todos os controles com indicador de foco visível, sem armadilha. 140 links externos por alvo (rodapé/redes) não são clicados; todos `https`, com `noopener` quando `target=_blank`.
- N/A: 2 `input[type=file]` do avatar por rota de perfil (o upload é exercitado de verdade no fluxo de perfil abaixo). 14 controles legitimamente desabilitados por alvo.
- **Verificação de mutação do auditor:** a 1ª versão deixava passar um botão morto (`OK (foco)`). Corrigi (foco não conta como efeito) e a versão final reprova o `BOTAO-MORTO` e o `LINK-VAZIO` injetados. Também corrigi falsos negativos/positivos de checkbox (Espaço) e `input[type=number]`. Detalhes no relatório da auditoria.
- Limite: mostra que há efeito observável, não que o efeito é correto; isso é papel dos fluxos abaixo e do E2E do projeto.

## Fluxos ponta a ponta pela UI (script próprio, URL pública e build local, 1440 e 390)
Resultado final, máquina ociosa: **público 18/18, local 18/18** (9 fluxos × 2 larguras):
1. Cadastro (com validação vazia), logout, login por e-mail/senha, refresh mantém sessão.
2. Login com senha errada ("E-mail ou senha inválidos") e conflito de cadastro (e-mail existente).
3. Login social: Google e Facebook entram como usuários distintos.
4. Compra completa pela UI (detalhe → carrinho → pagamento → revisão → recibo): recibo com `tx-hash`, pedido `confirmed` na API do mock, carrinho esvazia.
5. Pagamento recusado (`payment-declined`): mensagem "Pagamento recusado", carrinho preservado, nova tentativa confirma.
6. Timeout de pagamento com duplo clique: um único pedido.
7. Favoritos persistem após reload; perfil (validação e salvamento), avatar por arquivo, senha (erro com senha atual errada, sucesso, login com a nova), carteiras (endereço inválido, adicionar, editar).
8. Tempo real: `nft.updated` durante o checkout mostra aviso e novo subtotal; segunda mudança com o diálogo aberto bloqueia a cotação antiga (`quote-changed`), sem pedido criado.
9. Logout e troca de usuário (Ana → Bruno, mesma aba): carrinho, carteira e pedidos da Ana não aparecem para Bruno; sem sessão `/cart` não mostra o carrinho; nenhuma senha em claro no `localStorage`.

Histórico honesto das execuções: a 1ª rodada na URL pública deu 15/18 por falhas **do meu script** (condição de corrida: ler o `/api/__mock/socket/clients` antes do app montar e navegar ao carrinho antes do POST terminar), corrigidas. A rodada seguinte deu 17/18: o fluxo 8 (1440) falhou, e em 12 repetições na URL pública, **com a auditoria de interativos rodando em paralelo (carga)**, falhou 3/12; os critérios de falha eram "pedido criado em `/orders/ord-1` sem `quote-changed`". Com a máquina ociosa passou 15/15 na URL pública, 12/12 no local, 10/10 em outra variante que mede o subtotal do diálogo no clique, e 18/18 na rodada final. **Causa não determinada**: as falhas ocorreram antes de eu instrumentar o subtotal exibido no clique; a hipótese (não confirmada) é que, sob carga, o refetch da cotação chega antes do clique e o diálogo muda de valor sem exigir confirmação. Ver defeito D1.

## Defeitos e lacunas remanescentes, por severidade
**CRÍTICO / ALTO:** nenhum confirmado. Os eliminatórios do §11 não foram acionados (stack em uso real, fluxos não são só visuais, compra confirmada vem da simulação, sem vazamento entre usuários nos testes feitos, sem eventos simulados na UI, E2E executáveis).

**MÉDIO**
- M1 (§9 "fluxos principais em Chromium, desktop **e mobile**"): na configuração do projeto, `purchase`, `account`, `login-social`, `avatar-wallet-expiry`, `quantity-extra`, `realtime`, `pedido-unico` e `socket-user-switch` só rodam em 1440 (regex `RESPONSIVE` em `playwright.config.ts`). Os fluxos de compra, conta, perfil e tempo real **passaram em 390 no meu script**, mas esse script não está no repositório. Dono: qa-independent/orquestrador (ampliar a regex e reexecutar).
- M2 (§8/§11 acessibilidade): não há varredura automática por regras axe (sem `@axe-core/*` no `package.json`; só testes pontuais em `a11y-fixes`, `a11y-keyboard`, `order-live-region` e `review-dialog-zoom`). Também não há teste de zoom para as demais telas. Contraste não auditado por mim.
- M3 (§9 regressão visual): os baselines `@visual` são `*-win32.png` e o CI roda `--grep-invert @visual`; a regressão visual só é verificável no Windows. Passaram (3/3) nesta rodada, no Windows.
- M4 (fidelidade ao Figma, 20 pontos): **não verificada por mim** (não comparei frames). O próprio `ARCHITECTURE.md` e o `known-gaps.md` dizem que o mobile é parcial e que o ui-designer está trabalhando nele; o mobile atual é o da árvore de trabalho, **não está coberto por esta rodada** (ver "Pendente de reverificação").

**BAIXO**
- D1: intermitência no fluxo "preço muda no checkout" sob carga (3/12 na URL pública, não reproduzida ociosa). Dono provável: api-state-engineer (`src/realtime/*`, `src/purchase/CheckoutPage.tsx`). Reprodução: rodar o fluxo com a máquina carregada e conferir se o diálogo troca de valor sem `quote-changed`.
- D2: `reports/lighthouse/README.md` linha 24 ainda diz "sem URL publicada (não há deploy)"; contradiz o deploy existente. Também mantém o aviso de perfil do Chromium reaproveitado (IndexedDB). Não reexecutei o Lighthouse; as medianas citadas (Perf 91-100, A11y/BP/SEO 100, LCP mobile 2,65-2,84 s, CLS 0, TBT mobile 177-238 ms, medição de 2026-10-28) são as do README desse relatório, não minhas. Dono: perfil perf-a11y-auditor.
- D3: aviso de build de chunk > 500 kB (`app`, `browser`); não afeta as metas do Lighthouse segundo o README do relatório.
- D4: o `interativos.spec.ts` do projeto leva 8,2 min dos 8,4 min da suíte (serial); só afeta tempo de CI/local.

## Afirmações antigas corrigidas (rodada 4 → esta)
- "Deploy ausente, sem URL pública": **falso hoje**; há deploy (seção acima). Persiste a ressalva de correspondência byte a byte.
- "Sem teste de zoom": existe `review-dialog-zoom.spec.ts` (diálogo de revisão a 390 px/200%); axe continua ausente.
- "Skeleton só em catálogo, detalhe e resumo do carrinho": `Skeleton` também é usado em `PrivatePages.tsx` (perfil e carteiras), `OrderPage.tsx` e `CheckoutPage.tsx` (conferido por leitura do código; não reexecutei os testes de skeleton por tela além da suíte completa).
- "Mocks sem cenários 4xx genéricos": existe `/api/__mock/status/:code` (`src/mocks/handlers.ts:60`); o timeout do Axios existe em `src/api.ts:9`.
- "Expiração durante o checkout não preserva o formulário": `CheckoutPage.tsx` salva e restaura o rascunho em `sessionStorage` (linhas 63-81).
- "README com seção Documentos duplicada": hoje há uma só (`## Documentos`).
- "OpenSpec/TLC pendente": existem `openspec/changes/limite-quantidade-edicao/` e o `known-gaps.md` registra a validação; **não revalidei** o OpenSpec nesta rodada.
- "PR no fork não aberto": continua verdadeiro segundo o `known-gaps.md` (o remote não é fork); não verifiquei no GitHub.
- A lista de divergências da matriz da rodada 4 (REQ-08, 24, 45, 63, 66 etc.) não foi reauditada linha a linha; ver `docs/requirements/requirements-matrix.md` e `docs/qa/known-gaps.md` já atualizados pelo integrator-docs.

## Pendente de reverificação (itens 4 e 6 do fechamento)
- Não encontrei defeito confirmado para devolver a ui-designer, react-engineer ou api-state-engineer: a auditoria deu 0 falhas e os fluxos 18/18. O canvas só lista o orquestrador (`Claude Code`) como agente conectado, então não houve como acionar os donos por `opencanvas ask`. D1 deve ir ao api-state-engineer e D2 ao perf-a11y-auditor, pelo orquestrador.
- O ui-designer alterou `src/` (AuthPages, HomePage, NftDetailPage, CartPage, CheckoutPage, SiteFooter, icons, app.tsx, `BackButton`, `useMediaQuery`) depois do commit auditado. **Essas mudanças não foram testadas por mim.** Quando ele terminar: reconstruir, rodar `npx playwright test`, `--grep @visual` com baselines regenerados e reexecutar a auditoria de interativos (login/cadastro mobile sem header, barra de abas inferior, filtros) e os 18 fluxos. Se o login/cadastro mobile ficarem sem `<main>`/`<h1>`/`nav`, o auditor atual falharia ao carregar a rota (ele espera um deles).

## Estados
- IMPLEMENTADO: sim para o escopo do enunciado coberto pelos testes; deploy existe; Figma parcial (mobile em andamento).
- TESTADO: typecheck, lint, unit 3/3 e Playwright 216/216 no commit `51893e8` (execução minha); auditoria de interativos e 18 fluxos E2E pela UI, local e público.
- VALIDADO: build e tipos; CI verde no GitHub para `51893e8` (informado pela API, não reexecutado). OpenSpec não revalidado por mim.
- VERIFICADO: esta revisão independente do commit `51893e8` e da URL pública. Não verificados: fidelidade ao Figma, correspondência byte a byte do deploy, `npm ci` em cópia limpa (evidência do orquestrador), Lighthouse (números do relatório do perf-a11y-auditor), árvore de trabalho do ui-designer.

## Veredito
**APROVADO COM RESSALVAS** para o commit `51893e8` e a URL pública. Sem defeito crítico ou alto confirmado; suíte 216/216, auditoria de interativos sem falhas e fluxos principais funcionando em desktop e mobile. Ressalvas: M1 (mobile não está no E2E do repositório), M2 (sem axe), M3 (visual só em Windows), M4 (Figma não verificado e mobile em obra), D1 (intermitência sob carga sem causa determinada).
