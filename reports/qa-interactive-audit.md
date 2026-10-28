# Auditoria de interativos (QA independente)

Gerada em 2026-10-28 por `qa-independent`. Nenhum código de produção ou teste foi alterado. "SEM EFEITO" = falha.

Este arquivo **substitui** a versão do commit `07f87ee` (auditoria anterior, que apontava o botão "Aplicar" do filtro de preço sem efeito com campos vazios). Nesta rodada ele aparece como desabilitado (sem falha). A versão antiga continua em `git show 07f87ee:reports/qa-interactive-audit.md`.

## Método

- Script próprio (Playwright/Chromium, fora do repositório), independente do `tests/e2e/interativos.spec.ts`. Para cada rota e largura (1440 e 390), a página é recarregada a cada controle (isolamento), o controle é acionado por **mouse** (click, `fill` em campos de texto/número, `selectOption` em selects) e depois por **teclado** (`focus()` + Enter, Espaço em checkbox/radio, digitação em campos, seta em selects).
- Controles cobertos: `button`, `a[href]`, `input`, `select`, `textarea`, `summary`, `[role=button|tab|link|checkbox|switch]` e `[tabindex]` visíveis. Ocultos (`display:none`, `aria-hidden`) não entram; `disabled` é só registrado.
- **Efeito** = mudança de URL, de DOM (`body.innerHTML`), de `localStorage`, de valores de campos, de rolagem, abertura/fechamento de diálogo, requisição `/api` (exceto `__mock`) ou nova aba. **Mudança de foco isolada NÃO conta** (ver "Verificação do próprio auditor").
- Links externos (`https://`) não são clicados (rede externa bloqueada); exige-se `https` e `rel="noopener"` em `target=_blank`. Links com `href` vazio ou `#` reprovam.
- Percurso por **Tab** (até 120 passos): cada controle focado precisa de indicador de foco (outline ou box-shadow) e a ordem não pode formar armadilha.
- Rotas autenticadas rodam como Ana (`u-ana`, uma carteira, um item no carrinho; `/orders/:id` com um pedido confirmado criado pela API do mock). `/login` e `/register` rodam sem sessão. `início (visitante)` sem sessão; `início (logado)` com sessão.
- Alvos: **local** = `vite preview` do build:demo do commit `51893e8` (extraído com `git archive`, em `localhost:4174`) e **pública** = https://nft-marketplace-sable.vercel.app.

## Verificação do próprio auditor (mutação)

Com `QA_MUTATE=1` o script injeta `<button>BOTAO-MORTO</button>` e `<a href="#">LINK-VAZIO</a>` em `/aprenda/:slug`. **1ª versão: reprovou o link, mas aprovou o botão morto** (`OK (foco)`, porque clicar move o foco). Correção: foco deixou de contar como efeito. **Versão final: reprova os dois** (`BOTAO-MORTO` por mouse e por teclado = `SEM EFEITO`; `LINK-VAZIO` = `SEM EFEITO (href vazio ou #)`, nas duas larguras). Segunda correção: Enter em checkbox não alterna (Espaço sim), então a v2 deu 4 falsos `SEM EFEITO` no filtro "Somente disponíveis" do Início; com Espaço, 0. Terceira: `input[type=number]` rejeita texto, então o campo "Quantidade" do detalhe dava falso `FALHA`; agora recebe número. Os números abaixo são da versão final.

## Resultado: build local (commit 51893e8)

| Rota | Largura | Controles acionáveis | Mouse OK | Teclado OK | Externos | Desabilitados | N/A | SEM EFEITO / FALHA | Tab (foco visível) |
|---|---|---|---|---|---|---|---|---|---|
| início (visitante) | 1440 | 66 | 66/66 | 66/66 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| início (visitante) | 390 | 65 | 65/65 | 65/65 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| início (logado) | 1440 | 68 | 68/68 | 68/68 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| início (logado) | 390 | 67 | 67/67 | 67/67 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| detalhe | 1440 | 33 | 33/33 | 33/33 | 5 | 1 | 0 | 0 | OK (todos com indicador de foco) |
| detalhe | 390 | 33 | 33/33 | 33/33 | 5 | 1 | 0 | 0 | OK (todos com indicador de foco) |
| carrinho | 1440 | 29 | 29/29 | 29/29 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| carrinho | 390 | 29 | 29/29 | 29/29 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| pagamento | 1440 | 30 | 30/30 | 30/30 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| pagamento | 390 | 30 | 30/30 | 30/30 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| pedido | 1440 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| pedido | 390 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| login | 1440 | 28 | 28/28 | 28/28 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| login | 390 | 29 | 29/29 | 29/29 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| cadastro | 1440 | 29 | 29/29 | 29/29 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| cadastro | 390 | 30 | 30/30 | 30/30 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| perfil | 1440 | 33 | 32/33 | 32/33 | 5 | 0 | 2 | 0 | OK (todos com indicador de foco) |
| perfil | 390 | 33 | 32/33 | 32/33 | 5 | 0 | 2 | 0 | OK (todos com indicador de foco) |
| carteiras | 1440 | 31 | 31/31 | 31/31 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| carteiras | 390 | 31 | 31/31 | 31/31 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| criadores | 1440 | 36 | 36/36 | 36/36 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| criadores | 390 | 36 | 36/36 | 36/36 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| aprenda | 1440 | 28 | 28/28 | 28/28 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| aprenda | 390 | 28 | 28/28 | 28/28 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| artigo | 1440 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| artigo | 390 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| 404 | 1440 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| 404 | 390 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| **Total** | | **972** | **970** | **970** | 140 | 14 | | **0** | |

## Resultado: URL pública (https://nft-marketplace-sable.vercel.app)

| Rota | Largura | Controles acionáveis | Mouse OK | Teclado OK | Externos | Desabilitados | N/A | SEM EFEITO / FALHA | Tab (foco visível) |
|---|---|---|---|---|---|---|---|---|---|
| início (visitante) | 1440 | 66 | 66/66 | 66/66 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| início (visitante) | 390 | 65 | 65/65 | 65/65 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| início (logado) | 1440 | 68 | 68/68 | 68/68 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| início (logado) | 390 | 67 | 67/67 | 67/67 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| detalhe | 1440 | 33 | 33/33 | 33/33 | 5 | 1 | 0 | 0 | OK (todos com indicador de foco) |
| detalhe | 390 | 33 | 33/33 | 33/33 | 5 | 1 | 0 | 0 | OK (todos com indicador de foco) |
| carrinho | 1440 | 29 | 29/29 | 29/29 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| carrinho | 390 | 29 | 29/29 | 29/29 | 5 | 2 | 0 | 0 | OK (todos com indicador de foco) |
| pagamento | 1440 | 30 | 30/30 | 30/30 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| pagamento | 390 | 30 | 30/30 | 30/30 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| pedido | 1440 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| pedido | 390 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| login | 1440 | 28 | 28/28 | 28/28 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| login | 390 | 29 | 29/29 | 29/29 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| cadastro | 1440 | 29 | 29/29 | 29/29 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| cadastro | 390 | 30 | 30/30 | 30/30 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| perfil | 1440 | 33 | 32/33 | 32/33 | 5 | 0 | 2 | 0 | OK (todos com indicador de foco) |
| perfil | 390 | 33 | 32/33 | 32/33 | 5 | 0 | 2 | 0 | OK (todos com indicador de foco) |
| carteiras | 1440 | 31 | 31/31 | 31/31 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| carteiras | 390 | 31 | 31/31 | 31/31 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| criadores | 1440 | 36 | 36/36 | 36/36 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| criadores | 390 | 36 | 36/36 | 36/36 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| aprenda | 1440 | 28 | 28/28 | 28/28 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| aprenda | 390 | 28 | 28/28 | 28/28 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| artigo | 1440 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| artigo | 390 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| 404 | 1440 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| 404 | 390 | 25 | 25/25 | 25/25 | 5 | 0 | 0 | 0 | OK (todos com indicador de foco) |
| **Total** | | **972** | **970** | **970** | 140 | 14 | | **0** | |

## Resumo

- Local: 972 controles acionáveis (somando rotas × larguras), 0 falhas. Pública: 972 controles, 0 falhas.
- **Nenhum controle SEM EFEITO** em nenhuma rota/largura, por mouse ou teclado, local ou público. Nenhum link com `href` vazio ou `#`. Nenhum erro JS não tratado (`pageerror`) durante as rodadas.
- Itens N/A: `input[type=file]` do avatar (testado de verdade no fluxo de perfil, ver `qa-report.md`). Desabilitados: botões legitimamente desabilitados.
- Limitações: a auditoria confirma que há efeito observável, **não que o efeito é o correto** (isso é papel dos fluxos E2E). Links externos não foram seguidos. Estados que exigem cenário específico (pedido pendente, falhas) são cobertos pelos fluxos, não por esta tabela.
- Intermitências do próprio auditor: numa rodada anterior (5 workers + outro processo Playwright em paralelo) 5 combinações deram timeout de carga (`FALHA GERAL`); reexecutadas com 4 workers e sem concorrência, passaram. Não são defeitos da aplicação.
- Esta auditoria cobre o commit `51893e8`. O ui-designer está alterando o mobile (árvore de trabalho); após essas mudanças a auditoria precisa ser reexecutada (ver `qa-report.md`).

## Tabela rota × elemento × resultado: build local

| Rota | Elemento | Largura | Mouse | Teclado | Efeito observado (mouse) |
|---|---|---|---|---|---|
| início (visitante) | / · Kurio | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | / · Kurio | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | / · Início | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | / · Início | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | /#catalogo · Mercado | 1440 | OK | OK | URL, rolagem |
| início (visitante) | /#catalogo · Mercado | 390 | OK | OK | URL, rolagem |
| início (visitante) | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /#busca · Ir para a busca | 1440 | OK | OK | URL, rolagem |
| início (visitante) | /#busca · Ir para a busca | 390 | OK | OK | URL, rolagem |
| início (visitante) | /cart · Carrinho | 1440 | OK | OK | URL, DOM, valor, API:1 |
| início (visitante) | /cart · Carrinho | 390 | OK | OK | URL, DOM, valor, API:1 |
| início (visitante) | /login · Entrar | 1440 | OK | OK | URL, DOM, valor |
| início (visitante) | /login · Entrar | 390 | OK | OK | URL, DOM, valor |
| início (visitante) | #catalogo · Explorar | 1440 | OK | OK | URL, rolagem |
| início (visitante) | #catalogo · Explorar | 390 | OK | OK | URL, rolagem |
| início (visitante) | Mostrar imagem 1 de 4 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | Mostrar imagem 1 de 4 | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | Mostrar imagem 2 de 4 | 1440 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 2 de 4 | 390 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 3 de 4 | 1440 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 3 de 4 | 390 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 4 de 4 | 1440 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 4 de 4 | 390 | OK | OK | DOM |
| início (visitante) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | busca · Buscar NFT | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | busca · Buscar NFT | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Arte digital(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Arte digital(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Fotografia(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Fotografia(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Música(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Música(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Arte 3D(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Arte 3D(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Colecionáveis(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Colecionáveis(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Generativa(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Generativa(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Jogos(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Jogos(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Assinaturas(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Assinaturas(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Utilidade(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Utilidade(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | (sem rótulo) | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | (sem rótulo) | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Ethereum(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Ethereum(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Polygon(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Polygon(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Solana(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Solana(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /nfts/nft-7 · NFT em destaque: Neon Dunes | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Todos os NFTs | 1440 | OK | OK | rolagem |
| início (visitante) | Todos os NFTs | 390 | OK | OK | rolagem |
| início (visitante) | Novos lançamentos | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Novos lançamentos | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Em alta | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Em alta | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Listados recentementePreço: menor primeiroPreço: m | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Listados recentementePreço: menor primeiroPreço: m | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-2 · Blue Orbit1.25 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-2 · Blue Orbit1.25 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-3 · Cyber Koi0.08 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-3 · Cyber Koi0.08 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-4 · One of One12.00 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-4 · One of One12.00 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-6 · Solo Limit0.30 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-6 · Solo Limit0.30 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Ir para a página 1 | 1440 | OK | OK | rolagem |
| início (visitante) | Ir para a página 1 | 390 | OK | OK | rolagem |
| início (visitante) | Ir para a página 2 | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | Ir para a página 2 | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | Próxima | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | Próxima | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| início (visitante) | Assinar newsletter | 390 | OK | OK | DOM, valor |
| início (visitante) | Enviar | 1440 | OK | OK | DOM |
| início (visitante) | Enviar | 390 | OK | OK | DOM |
| início (visitante) | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | / · Kurio | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | / · Kurio | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | / · Início | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | / · Início | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | /#catalogo · Mercado | 1440 | OK | OK | URL, rolagem |
| início (logado) | /#catalogo · Mercado | 390 | OK | OK | URL, rolagem |
| início (logado) | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /#busca · Ir para a busca | 1440 | OK | OK | URL, rolagem |
| início (logado) | /#busca · Ir para a busca | 390 | OK | OK | URL, rolagem |
| início (logado) | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| início (logado) | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| início (logado) | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| início (logado) | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| início (logado) | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| início (logado) | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| início (logado) | #catalogo · Explorar | 1440 | OK | OK | URL, rolagem |
| início (logado) | #catalogo · Explorar | 390 | OK | OK | URL, rolagem |
| início (logado) | Mostrar imagem 1 de 4 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | Mostrar imagem 1 de 4 | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | Mostrar imagem 2 de 4 | 1440 | OK | OK | DOM |
| início (logado) | Mostrar imagem 2 de 4 | 390 | OK | OK | DOM |
| início (logado) | Mostrar imagem 3 de 4 | 1440 | OK | OK | DOM |
| início (logado) | Mostrar imagem 3 de 4 | 390 | OK | OK | DOM |
| início (logado) | Mostrar imagem 4 de 4 | 1440 | OK | OK | DOM |
| início (logado) | Mostrar imagem 4 de 4 | 390 | OK | OK | DOM |
| início (logado) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | busca · Buscar NFT | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | busca · Buscar NFT | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | Arte digital(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Arte digital(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Fotografia(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Fotografia(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Música(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Música(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Arte 3D(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Arte 3D(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Colecionáveis(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Colecionáveis(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Generativa(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Generativa(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Jogos(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Jogos(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Assinaturas(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Assinaturas(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Utilidade(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Utilidade(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | (sem rótulo) | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | (sem rótulo) | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | Ethereum(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Ethereum(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Polygon(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Polygon(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Solana(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Solana(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /nfts/nft-7 · NFT em destaque: Neon Dunes | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | Todos os NFTs | 1440 | OK | OK | rolagem |
| início (logado) | Todos os NFTs | 390 | OK | OK | rolagem |
| início (logado) | Novos lançamentos | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Novos lançamentos | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Em alta | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Em alta | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Listados recentementePreço: menor primeiroPreço: m | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | Listados recentementePreço: menor primeiroPreço: m | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-2 · Blue Orbit1.25 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-2 · Blue Orbit1.25 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-3 · Cyber Koi0.08 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-3 · Cyber Koi0.08 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-4 · One of One12.00 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-4 · One of One12.00 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-6 · Solo Limit0.30 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-6 · Solo Limit0.30 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | Ir para a página 1 | 1440 | OK | OK | rolagem |
| início (logado) | Ir para a página 1 | 390 | OK | OK | rolagem |
| início (logado) | Ir para a página 2 | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | Ir para a página 2 | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | Próxima | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | Próxima | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| início (logado) | Assinar newsletter | 390 | OK | OK | DOM, valor |
| início (logado) | Enviar | 1440 | OK | OK | DOM |
| início (logado) | Enviar | 390 | OK | OK | DOM |
| início (logado) | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| detalhe | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| detalhe | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| detalhe | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| detalhe | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| detalhe | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| detalhe | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| detalhe | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| detalhe | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| detalhe | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| detalhe | gallery-thumb · Ver imagem 1 de 3 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| detalhe | gallery-thumb · Ver imagem 1 de 3 | 390 | OK | OK | idempotente: já ativo/própria rota |
| detalhe | gallery-thumb · Ver imagem 2 de 3 | 1440 | OK | OK | DOM |
| detalhe | gallery-thumb · Ver imagem 2 de 3 | 390 | OK | OK | DOM |
| detalhe | gallery-thumb · Ver imagem 3 de 3 | 1440 | OK | OK | DOM |
| detalhe | gallery-thumb · Ver imagem 3 de 3 | 390 | OK | OK | DOM |
| detalhe | / · ← Voltar ao catálogo | 1440 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · ← Voltar ao catálogo | 390 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | quantity-input · Quantidade | 1440 | OK | OK | DOM, valor |
| detalhe | quantity-input · Quantidade | 390 | OK | OK | DOM, valor |
| detalhe | quantity-increase · Aumentar quantidade | 1440 | OK | OK | DOM, valor |
| detalhe | quantity-increase · Aumentar quantidade | 390 | OK | OK | DOM, valor |
| detalhe | add-to-cart · Adicionar ao carrinho | 1440 | OK | OK | DOM, storage, API:1 |
| detalhe | add-to-cart · Adicionar ao carrinho | 390 | OK | OK | DOM, storage, API:1 |
| detalhe | favorite-toggle · Favoritar | 1440 | OK | OK | DOM, storage, API:2 |
| detalhe | favorite-toggle · Favoritar | 390 | OK | OK | DOM, storage, API:2 |
| detalhe | /criadores · creator-1 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| detalhe | /criadores · creator-1 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| detalhe | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| detalhe | Assinar newsletter | 390 | OK | OK | DOM, valor |
| detalhe | Enviar | 1440 | OK | OK | DOM |
| detalhe | Enviar | 390 | OK | OK | DOM |
| detalhe | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carrinho | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carrinho | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /cart · Carrinho1 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| carrinho | /cart · Carrinho1 | 390 | OK | OK | idempotente: já ativo/própria rota |
| carrinho | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| carrinho | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| carrinho | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| carrinho | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| carrinho | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| carrinho | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| carrinho | qty-inc-nft-2 · Aumentar Blue Orbit | 1440 | OK | OK | DOM, storage, API:3 |
| carrinho | qty-inc-nft-2 · Aumentar Blue Orbit | 390 | OK | OK | DOM, storage, API:3 |
| carrinho | remove-nft-2 · Remover Blue Orbit | 1440 | OK | OK | DOM, storage, valor, API:3 |
| carrinho | remove-nft-2 · Remover Blue Orbit | 390 | OK | OK | DOM, storage, valor, API:3 |
| carrinho | coupon-input · coupon-input · Digite o código promocional... | 1440 | OK | OK | DOM, valor |
| carrinho | coupon-input · coupon-input · Digite o código promocional... | 390 | OK | OK | DOM, valor |
| carrinho | /checkout · go-checkout · Ir para o pagamento | 1440 | OK | OK | URL, DOM, valor, API:2 |
| carrinho | /checkout · go-checkout · Ir para o pagamento | 390 | OK | OK | URL, DOM, valor, API:2 |
| carrinho | / · Continuar explorando | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Continuar explorando | 390 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| carrinho | Assinar newsletter | 390 | OK | OK | DOM, valor |
| carrinho | Enviar | 1440 | OK | OK | DOM |
| carrinho | Enviar | 390 | OK | OK | DOM |
| carrinho | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| pagamento | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| pagamento | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor |
| pagamento | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor |
| pagamento | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| pagamento | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| pagamento | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pagamento | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pagamento | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:5 |
| pagamento | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:5 |
| pagamento | field-name | 1440 | OK | OK | DOM, valor |
| pagamento | field-name | 390 | OK | OK | DOM, valor |
| pagamento | field-email | 1440 | OK | OK | DOM, valor |
| pagamento | field-email | 390 | OK | OK | DOM, valor |
| pagamento | field-document | 1440 | OK | OK | DOM, valor |
| pagamento | field-document | 390 | OK | OK | DOM, valor |
| pagamento | field-wallet · SelecionePrincipal (0x111111...) | 1440 | OK | OK | DOM, valor |
| pagamento | field-wallet · SelecionePrincipal (0x111111...) | 390 | OK | OK | DOM, valor |
| pagamento | field-network · EthereumPolygonBase | 1440 | OK | OK | DOM, valor, API:1 |
| pagamento | field-network · EthereumPolygonBase | 390 | OK | OK | DOM, valor, API:1 |
| pagamento | review-order · Revisar pedido | 1440 | OK | OK | DOM |
| pagamento | review-order · Revisar pedido | 390 | OK | OK | DOM, rolagem |
| pagamento | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| pagamento | Assinar newsletter | 390 | OK | OK | DOM, valor |
| pagamento | Enviar | 1440 | OK | OK | DOM |
| pagamento | Enviar | 390 | OK | OK | DOM |
| pagamento | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pedido | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| pedido | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pedido | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| pedido | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| pedido | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| pedido | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /cart · Carrinho | 1440 | OK | OK | URL, DOM, API:1 |
| pedido | /cart · Carrinho | 390 | OK | OK | URL, DOM, API:1 |
| pedido | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| pedido | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| pedido | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pedido | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pedido | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| pedido | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| pedido | / · Continuar explorando | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | / · Continuar explorando | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| pedido | Assinar newsletter | 390 | OK | OK | DOM, valor |
| pedido | Enviar | 1440 | OK | OK | DOM |
| pedido | Enviar | 390 | OK | OK | DOM |
| pedido | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pedido | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| pedido | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| login | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| login | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| login | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| login | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| login | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| login | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /cart · Carrinho | 1440 | OK | OK | URL, DOM, valor, API:1 |
| login | /cart · Carrinho | 390 | OK | OK | URL, DOM, valor, API:1 |
| login | /login · Entrar | 1440 | OK | OK | idempotente: já ativo/própria rota |
| login | /login · Entrar | 390 | OK | OK | idempotente: já ativo/própria rota |
| login | /register · Criar conta | 1440 | OK | OK | URL, DOM, valor |
| login | /register · Criar conta | 390 | OK | OK | URL, DOM, valor |
| login | email · email | 1440 | OK | OK | valor |
| login | email · email | 390 | OK | OK | valor |
| login | password · password | 1440 | OK | OK | valor |
| login | password · password | 390 | OK | OK | valor |
| login | Entrar | 1440 | OK | OK | DOM |
| login | Entrar | 390 | OK | OK | DOM |
| login | social-google · Continuar com Google | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | social-google · Continuar com Google | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | social-facebook · Continuar com Facebook | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | social-facebook · Continuar com Facebook | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| login | Assinar newsletter | 390 | OK | OK | DOM, valor |
| login | Enviar | 1440 | OK | OK | DOM |
| login | Enviar | 390 | OK | OK | DOM |
| login | /profile · Meu perfil | 1440 | OK | OK | URL, rolagem |
| login | /profile · Meu perfil | 390 | OK | OK | URL, rolagem |
| login | /wallets · Carteiras | 1440 | OK | OK | URL, rolagem |
| login | /wallets · Carteiras | 390 | OK | OK | URL, rolagem |
| login | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | /register · Crie uma conta | 390 | OK | OK | URL, DOM, valor |
| cadastro | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| cadastro | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| cadastro | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /cart · Carrinho | 1440 | OK | OK | URL, DOM, valor, API:1 |
| cadastro | /cart · Carrinho | 390 | OK | OK | URL, DOM, valor, API:1 |
| cadastro | /login · Entrar | 1440 | OK | OK | URL, DOM, valor |
| cadastro | /login · Entrar | 390 | OK | OK | URL, DOM, valor |
| cadastro | name · name | 1440 | OK | OK | valor |
| cadastro | name · name | 390 | OK | OK | valor |
| cadastro | email · email | 1440 | OK | OK | valor |
| cadastro | email · email | 390 | OK | OK | valor |
| cadastro | password · password | 1440 | OK | OK | valor |
| cadastro | password · password | 390 | OK | OK | valor |
| cadastro | Cadastrar | 1440 | OK | OK | DOM |
| cadastro | Cadastrar | 390 | OK | OK | DOM |
| cadastro | social-google · Continuar com Google | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | social-google · Continuar com Google | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | social-facebook · Continuar com Facebook | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | social-facebook · Continuar com Facebook | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| cadastro | Assinar newsletter | 390 | OK | OK | DOM, valor |
| cadastro | Enviar | 1440 | OK | OK | DOM |
| cadastro | Enviar | 390 | OK | OK | DOM |
| cadastro | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | /login · Entre | 390 | OK | OK | URL, DOM, valor |
| perfil | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| perfil | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| perfil | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| perfil | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| perfil | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| perfil | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| perfil | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| perfil | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| perfil | /profile · Perfil | 1440 | OK | OK | idempotente: já ativo/própria rota |
| perfil | /profile · Perfil | 390 | OK | OK | idempotente: já ativo/própria rota |
| perfil | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| perfil | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| perfil | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| perfil | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| perfil | /profile · Dados do perfil | 1440 | OK | OK | idempotente: já ativo/própria rota |
| perfil | /profile · Dados do perfil | 390 | OK | OK | idempotente: já ativo/própria rota |
| perfil | name · name | 1440 | OK | OK | valor |
| perfil | name · name | 390 | OK | OK | valor |
| perfil | avatar · avatar | 1440 | OK | OK | valor |
| perfil | avatar · avatar | 390 | OK | OK | valor |
| perfil | Salvar perfil | 1440 | OK | OK | DOM, API:1 |
| perfil | Salvar perfil | 390 | OK | OK | DOM, API:1 |
| perfil | avatar-file · avatar-file | 1440 | N/A (input file (testado em avatar-wallet-expiry)) | N/A (input file) | input file (testado em avatar-wallet-expiry) |
| perfil | avatar-file · avatar-file | 390 | N/A (input file (testado em avatar-wallet-expiry)) | N/A (input file) | input file (testado em avatar-wallet-expiry) |
| perfil | currentPassword · currentPassword | 1440 | OK | OK | valor |
| perfil | currentPassword · currentPassword | 390 | OK | OK | valor |
| perfil | newPassword · newPassword | 1440 | OK | OK | valor |
| perfil | newPassword · newPassword | 390 | OK | OK | valor |
| perfil | Alterar senha | 1440 | OK | OK | DOM |
| perfil | Alterar senha | 390 | OK | OK | DOM |
| perfil | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| perfil | Assinar newsletter | 390 | OK | OK | DOM, valor |
| perfil | Enviar | 1440 | OK | OK | DOM |
| perfil | Enviar | 390 | OK | OK | DOM |
| perfil | /profile · Meu perfil | 1440 | OK | OK | rolagem |
| perfil | /profile · Meu perfil | 390 | OK | OK | rolagem |
| perfil | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carteiras | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carteiras | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| carteiras | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| carteiras | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| carteiras | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| carteiras | /wallets · Carteiras | 1440 | OK | OK | rolagem |
| carteiras | /wallets · Carteiras | 390 | OK | OK | rolagem |
| carteiras | logout · Sair | 1440 | OK | OK | URL, DOM, storage, API:2 |
| carteiras | logout · Sair | 390 | OK | OK | URL, DOM, storage, API:2 |
| carteiras | /profile · Dados do perfil | 1440 | OK | OK | URL, DOM, valor |
| carteiras | /profile · Dados do perfil | 390 | OK | OK | URL, DOM, valor |
| carteiras | wallet-toggle-connection · Desconectar Principal | 1440 | OK | OK | DOM, storage, API:2 |
| carteiras | wallet-toggle-connection · Desconectar Principal | 390 | OK | OK | DOM, storage, API:2 |
| carteiras | Editar Principal | 1440 | OK | OK | DOM, valor |
| carteiras | Editar Principal | 390 | OK | OK | DOM, valor |
| carteiras | label · label | 1440 | OK | OK | valor |
| carteiras | label · label | 390 | OK | OK | valor |
| carteiras | address · address | 1440 | OK | OK | valor |
| carteiras | address · address | 390 | OK | OK | valor |
| carteiras | Adicionar carteira | 1440 | OK | OK | DOM |
| carteiras | Adicionar carteira | 390 | OK | OK | DOM |
| carteiras | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| carteiras | Assinar newsletter | 390 | OK | OK | DOM, valor |
| carteiras | Enviar | 1440 | OK | OK | DOM |
| carteiras | Enviar | 390 | OK | OK | DOM |
| carteiras | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | / · Início | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | / · Início | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /criadores · Criadores | 1440 | OK | OK | rolagem |
| criadores | /criadores · Criadores | 390 | OK | OK | rolagem |
| criadores | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| criadores | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| criadores | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| criadores | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| criadores | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| criadores | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| criadores | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| criadores | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| criadores | /nfts/nft-1 · Ver obras de creator-1 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-1 · Ver obras de creator-1 | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-2 · Ver obras de creator-2 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-2 · Ver obras de creator-2 | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-3 · Ver obras de creator-3 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-3 · Ver obras de creator-3 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-4 · Ver obras de creator-4 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-4 · Ver obras de creator-4 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-5 · Ver obras de creator-5 | 1440 | OK | OK | URL, DOM, API:2 |
| criadores | /nfts/nft-5 · Ver obras de creator-5 | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| criadores | /nfts/nft-6 · Ver obras de creator-6 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-6 · Ver obras de creator-6 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-7 · Ver obras de creator-7 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-7 · Ver obras de creator-7 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-8 · Ver obras de creator-8 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-8 · Ver obras de creator-8 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-9 · Ver obras de creator-9 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-9 · Ver obras de creator-9 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-10 · Ver obras de creator-10 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-10 · Ver obras de creator-10 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-11 · Ver obras de creator-11 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-11 · Ver obras de creator-11 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-12 · Ver obras de creator-12 | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| criadores | /nfts/nft-12 · Ver obras de creator-12 | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| criadores | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| criadores | Assinar newsletter | 390 | OK | OK | DOM, valor |
| criadores | Enviar | 1440 | OK | OK | DOM |
| criadores | Enviar | 390 | OK | OK | DOM |
| criadores | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| criadores | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| criadores | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| aprenda | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| aprenda | /aprenda · Aprenda | 1440 | OK | OK | rolagem |
| aprenda | /aprenda · Aprenda | 390 | OK | OK | rolagem |
| aprenda | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| aprenda | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| aprenda | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| aprenda | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| aprenda | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| aprenda | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| aprenda | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| aprenda | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 390 | OK | OK | URL, DOM |
| aprenda | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| aprenda | Assinar newsletter | 390 | OK | OK | DOM, valor |
| aprenda | Enviar | 1440 | OK | OK | DOM |
| aprenda | Enviar | 390 | OK | OK | DOM |
| aprenda | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| aprenda | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| aprenda | /aprenda · Central de ajuda | 1440 | OK | OK | rolagem |
| aprenda | /aprenda · Central de ajuda | 390 | OK | OK | rolagem |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| artigo | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| artigo | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| artigo | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| artigo | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| artigo | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| artigo | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| artigo | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| artigo | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| artigo | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| artigo | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| artigo | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| artigo | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| artigo | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| artigo | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| artigo | /aprenda · ← Voltar para Aprenda | 1440 | OK | OK | URL, DOM |
| artigo | /aprenda · ← Voltar para Aprenda | 390 | OK | OK | URL, DOM |
| artigo | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| artigo | Assinar newsletter | 390 | OK | OK | DOM, valor |
| artigo | Enviar | 1440 | OK | OK | DOM |
| artigo | Enviar | 390 | OK | OK | DOM |
| artigo | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| artigo | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| artigo | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | rolagem |
| artigo | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | rolagem |
| artigo | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| artigo | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| 404 | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| 404 | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| 404 | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| 404 | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| 404 | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| 404 | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| 404 | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| 404 | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| 404 | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| 404 | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| 404 | / · Voltar ao início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Voltar ao início | 390 | OK | OK | URL, DOM, valor, API:4 |
| 404 | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| 404 | Assinar newsletter | 390 | OK | OK | DOM, valor |
| 404 | Enviar | 1440 | OK | OK | DOM |
| 404 | Enviar | 390 | OK | OK | DOM |
| 404 | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor |
| 404 | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| 404 | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM |
| 404 | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |

## Tabela rota × elemento × resultado: URL pública

| Rota | Elemento | Largura | Mouse | Teclado | Efeito observado (mouse) |
|---|---|---|---|---|---|
| início (visitante) | / · Kurio | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | / · Kurio | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | / · Início | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | / · Início | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | /#catalogo · Mercado | 1440 | OK | OK | URL, rolagem |
| início (visitante) | /#catalogo · Mercado | 390 | OK | OK | URL, rolagem |
| início (visitante) | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /#busca · Ir para a busca | 1440 | OK | OK | URL, rolagem |
| início (visitante) | /#busca · Ir para a busca | 390 | OK | OK | URL, rolagem |
| início (visitante) | /cart · Carrinho | 1440 | OK | OK | URL, DOM, valor, API:1 |
| início (visitante) | /cart · Carrinho | 390 | OK | OK | URL, DOM, valor, API:1 |
| início (visitante) | /login · Entrar | 1440 | OK | OK | URL, DOM, valor |
| início (visitante) | /login · Entrar | 390 | OK | OK | URL, DOM, valor |
| início (visitante) | #catalogo · Explorar | 1440 | OK | OK | URL, rolagem |
| início (visitante) | #catalogo · Explorar | 390 | OK | OK | URL, rolagem |
| início (visitante) | Mostrar imagem 1 de 4 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | Mostrar imagem 1 de 4 | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (visitante) | Mostrar imagem 2 de 4 | 1440 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 2 de 4 | 390 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 3 de 4 | 1440 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 3 de 4 | 390 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 4 de 4 | 1440 | OK | OK | DOM |
| início (visitante) | Mostrar imagem 4 de 4 | 390 | OK | OK | DOM |
| início (visitante) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | busca · Buscar NFT | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | busca · Buscar NFT | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Arte digital(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Arte digital(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Fotografia(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Fotografia(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Música(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Música(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Arte 3D(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Arte 3D(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Colecionáveis(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Colecionáveis(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Generativa(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Generativa(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Jogos(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Jogos(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Assinaturas(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Assinaturas(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Utilidade(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Utilidade(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | (sem rótulo) | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | (sem rótulo) | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Ethereum(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Ethereum(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Polygon(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Polygon(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Solana(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Solana(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /nfts/nft-7 · NFT em destaque: Neon Dunes | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Todos os NFTs | 1440 | OK | OK | rolagem |
| início (visitante) | Todos os NFTs | 390 | OK | OK | rolagem |
| início (visitante) | Novos lançamentos | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Novos lançamentos | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Em alta | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Em alta | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | Listados recentementePreço: menor primeiroPreço: m | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Listados recentementePreço: menor primeiroPreço: m | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-2 · Blue Orbit1.25 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-2 · Blue Orbit1.25 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-3 · Cyber Koi0.08 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-3 · Cyber Koi0.08 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-4 · One of One12.00 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-4 · One of One12.00 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-6 · Solo Limit0.30 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | /nfts/nft-6 · Solo Limit0.30 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (visitante) | Ir para a página 1 | 1440 | OK | OK | rolagem |
| início (visitante) | Ir para a página 1 | 390 | OK | OK | rolagem |
| início (visitante) | Ir para a página 2 | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | Ir para a página 2 | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | Próxima | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | Próxima | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (visitante) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| início (visitante) | Assinar newsletter | 390 | OK | OK | DOM, valor |
| início (visitante) | Enviar | 1440 | OK | OK | DOM |
| início (visitante) | Enviar | 390 | OK | OK | DOM |
| início (visitante) | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (visitante) | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (visitante) | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (visitante) | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | / · Kurio | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | / · Kurio | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | / · Início | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | / · Início | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | /#catalogo · Mercado | 1440 | OK | OK | URL, rolagem |
| início (logado) | /#catalogo · Mercado | 390 | OK | OK | URL, rolagem |
| início (logado) | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /#busca · Ir para a busca | 1440 | OK | OK | URL, rolagem |
| início (logado) | /#busca · Ir para a busca | 390 | OK | OK | URL, rolagem |
| início (logado) | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| início (logado) | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| início (logado) | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| início (logado) | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| início (logado) | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| início (logado) | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| início (logado) | #catalogo · Explorar | 1440 | OK | OK | URL, rolagem |
| início (logado) | #catalogo · Explorar | 390 | OK | OK | URL, rolagem |
| início (logado) | Mostrar imagem 1 de 4 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | Mostrar imagem 1 de 4 | 390 | OK | OK | idempotente: já ativo/própria rota |
| início (logado) | Mostrar imagem 2 de 4 | 1440 | OK | OK | DOM |
| início (logado) | Mostrar imagem 2 de 4 | 390 | OK | OK | DOM |
| início (logado) | Mostrar imagem 3 de 4 | 1440 | OK | OK | DOM |
| início (logado) | Mostrar imagem 3 de 4 | 390 | OK | OK | DOM |
| início (logado) | Mostrar imagem 4 de 4 | 1440 | OK | OK | DOM |
| início (logado) | Mostrar imagem 4 de 4 | 390 | OK | OK | DOM |
| início (logado) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-7 · Em destaqueNeon Dunes0.45 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-8 · Em destaquePixel Pals0.02 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-9 · Em destaqueGlass Garden2.10 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | busca · Buscar NFT | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | busca · Buscar NFT | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | Arte digital(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Arte digital(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Fotografia(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Fotografia(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Música(2) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Música(2) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Arte 3D(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Arte 3D(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Colecionáveis(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Colecionáveis(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Generativa(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Generativa(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Jogos(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Jogos(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Assinaturas(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Assinaturas(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Utilidade(1) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Utilidade(1) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | (sem rótulo) | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | (sem rótulo) | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | Ethereum(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Ethereum(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Polygon(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Polygon(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Solana(4) | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Solana(4) | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /nfts/nft-7 · NFT em destaque: Neon Dunes | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | Todos os NFTs | 1440 | OK | OK | rolagem |
| início (logado) | Todos os NFTs | 390 | OK | OK | rolagem |
| início (logado) | Novos lançamentos | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Novos lançamentos | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Em alta | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Em alta | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | Listados recentementePreço: menor primeiroPreço: m | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | Listados recentementePreço: menor primeiroPreço: m | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| início (logado) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-1 · Aurora Genesis0.50 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-2 · Blue Orbit1.25 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-2 · Blue Orbit1.25 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-3 · Cyber Koi0.08 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-3 · Cyber Koi0.08 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-4 · One of One12.00 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-4 · One of One12.00 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-5 · Sold Out Sun0.90 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-6 · Solo Limit0.30 ETH | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | /nfts/nft-6 · Solo Limit0.30 ETH | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| início (logado) | Ir para a página 1 | 1440 | OK | OK | rolagem |
| início (logado) | Ir para a página 1 | 390 | OK | OK | rolagem |
| início (logado) | Ir para a página 2 | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | Ir para a página 2 | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | Próxima | 1440 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | Próxima | 390 | OK | OK | URL, DOM, rolagem, API:1 |
| início (logado) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?tab=novos#catalogo · Explorar: Lançamentos gênesis de edição limitada | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+digital#catalogo · Explorar: Arte digital selecionada e muito mais | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| início (logado) | Assinar newsletter | 390 | OK | OK | DOM, valor |
| início (logado) | Enviar | 1440 | OK | OK | DOM |
| início (logado) | Enviar | 390 | OK | OK | DOM |
| início (logado) | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| início (logado) | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| início (logado) | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| início (logado) | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| detalhe | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| detalhe | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| detalhe | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| detalhe | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| detalhe | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| detalhe | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| detalhe | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| detalhe | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| detalhe | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| detalhe | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| detalhe | gallery-thumb · Ver imagem 1 de 3 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| detalhe | gallery-thumb · Ver imagem 1 de 3 | 390 | OK | OK | idempotente: já ativo/própria rota |
| detalhe | gallery-thumb · Ver imagem 2 de 3 | 1440 | OK | OK | DOM |
| detalhe | gallery-thumb · Ver imagem 2 de 3 | 390 | OK | OK | DOM |
| detalhe | gallery-thumb · Ver imagem 3 de 3 | 1440 | OK | OK | DOM |
| detalhe | gallery-thumb · Ver imagem 3 de 3 | 390 | OK | OK | DOM |
| detalhe | / · ← Voltar ao catálogo | 1440 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | / · ← Voltar ao catálogo | 390 | OK | OK | URL, DOM, valor, API:4 |
| detalhe | quantity-input · Quantidade | 1440 | OK | OK | DOM, valor |
| detalhe | quantity-input · Quantidade | 390 | OK | OK | DOM, valor |
| detalhe | quantity-increase · Aumentar quantidade | 1440 | OK | OK | DOM, valor |
| detalhe | quantity-increase · Aumentar quantidade | 390 | OK | OK | DOM, valor |
| detalhe | add-to-cart · Adicionar ao carrinho | 1440 | OK | OK | DOM, storage, API:1 |
| detalhe | add-to-cart · Adicionar ao carrinho | 390 | OK | OK | DOM, storage, API:1 |
| detalhe | favorite-toggle · Favoritar | 1440 | OK | OK | DOM, storage, API:2 |
| detalhe | favorite-toggle · Favoritar | 390 | OK | OK | DOM, storage, API:2 |
| detalhe | /criadores · creator-1 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| detalhe | /criadores · creator-1 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| detalhe | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| detalhe | Assinar newsletter | 390 | OK | OK | DOM, valor |
| detalhe | Enviar | 1440 | OK | OK | DOM |
| detalhe | Enviar | 390 | OK | OK | DOM |
| detalhe | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| detalhe | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| detalhe | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| detalhe | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carrinho | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carrinho | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carrinho | /cart · Carrinho1 | 1440 | OK | OK | idempotente: já ativo/própria rota |
| carrinho | /cart · Carrinho1 | 390 | OK | OK | idempotente: já ativo/própria rota |
| carrinho | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| carrinho | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| carrinho | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| carrinho | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| carrinho | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| carrinho | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| carrinho | qty-inc-nft-2 · Aumentar Blue Orbit | 1440 | OK | OK | DOM, storage, API:3 |
| carrinho | qty-inc-nft-2 · Aumentar Blue Orbit | 390 | OK | OK | DOM, storage, API:3 |
| carrinho | remove-nft-2 · Remover Blue Orbit | 1440 | OK | OK | DOM, storage, valor, API:3 |
| carrinho | remove-nft-2 · Remover Blue Orbit | 390 | OK | OK | DOM, storage, valor, API:3 |
| carrinho | coupon-input · coupon-input · Digite o código promocional... | 1440 | OK | OK | DOM, valor |
| carrinho | coupon-input · coupon-input · Digite o código promocional... | 390 | OK | OK | DOM, valor |
| carrinho | /checkout · go-checkout · Ir para o pagamento | 1440 | OK | OK | URL, DOM, valor, API:2 |
| carrinho | /checkout · go-checkout · Ir para o pagamento | 390 | OK | OK | URL, DOM, valor, API:2 |
| carrinho | / · Continuar explorando | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | / · Continuar explorando | 390 | OK | OK | URL, DOM, valor, API:4 |
| carrinho | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| carrinho | Assinar newsletter | 390 | OK | OK | DOM, valor |
| carrinho | Enviar | 1440 | OK | OK | DOM |
| carrinho | Enviar | 390 | OK | OK | DOM |
| carrinho | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| carrinho | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carrinho | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carrinho | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| pagamento | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| pagamento | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| pagamento | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pagamento | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor |
| pagamento | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor |
| pagamento | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| pagamento | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| pagamento | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pagamento | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pagamento | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:5 |
| pagamento | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:5 |
| pagamento | field-name | 1440 | OK | OK | DOM, valor |
| pagamento | field-name | 390 | OK | OK | DOM, valor |
| pagamento | field-email | 1440 | OK | OK | DOM, valor |
| pagamento | field-email | 390 | OK | OK | DOM, valor |
| pagamento | field-document | 1440 | OK | OK | DOM, valor |
| pagamento | field-document | 390 | OK | OK | DOM, valor |
| pagamento | field-wallet · SelecionePrincipal (0x111111...) | 1440 | OK | OK | DOM, valor |
| pagamento | field-wallet · SelecionePrincipal (0x111111...) | 390 | OK | OK | DOM, valor |
| pagamento | field-network · EthereumPolygonBase | 1440 | OK | OK | DOM, valor, API:1 |
| pagamento | field-network · EthereumPolygonBase | 390 | OK | OK | DOM, valor, API:1 |
| pagamento | review-order · Revisar pedido | 1440 | OK | OK | DOM |
| pagamento | review-order · Revisar pedido | 390 | OK | OK | DOM, rolagem |
| pagamento | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| pagamento | Assinar newsletter | 390 | OK | OK | DOM, valor |
| pagamento | Enviar | 1440 | OK | OK | DOM |
| pagamento | Enviar | 390 | OK | OK | DOM |
| pagamento | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| pagamento | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pagamento | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pagamento | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pedido | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| pedido | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| pedido | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| pedido | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| pedido | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| pedido | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | /cart · Carrinho | 1440 | OK | OK | URL, DOM, API:1 |
| pedido | /cart · Carrinho | 390 | OK | OK | URL, DOM, API:1 |
| pedido | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| pedido | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| pedido | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pedido | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| pedido | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| pedido | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| pedido | / · Continuar explorando | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | / · Continuar explorando | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| pedido | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| pedido | Assinar newsletter | 390 | OK | OK | DOM, valor |
| pedido | Enviar | 1440 | OK | OK | DOM |
| pedido | Enviar | 390 | OK | OK | DOM |
| pedido | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| pedido | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| pedido | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| pedido | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| pedido | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| pedido | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| pedido | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| login | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| login | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| login | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| login | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| login | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| login | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| login | /cart · Carrinho | 1440 | OK | OK | URL, DOM, valor, API:1 |
| login | /cart · Carrinho | 390 | OK | OK | URL, DOM, valor, API:1 |
| login | /login · Entrar | 1440 | OK | OK | idempotente: já ativo/própria rota |
| login | /login · Entrar | 390 | OK | OK | idempotente: já ativo/própria rota |
| login | /register · Criar conta | 1440 | OK | OK | URL, DOM, valor |
| login | /register · Criar conta | 390 | OK | OK | URL, DOM, valor |
| login | email · email | 1440 | OK | OK | valor |
| login | email · email | 390 | OK | OK | valor |
| login | password · password | 1440 | OK | OK | valor |
| login | password · password | 390 | OK | OK | valor |
| login | Entrar | 1440 | OK | OK | DOM |
| login | Entrar | 390 | OK | OK | DOM |
| login | social-google · Continuar com Google | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | social-google · Continuar com Google | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | social-facebook · Continuar com Facebook | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | social-facebook · Continuar com Facebook | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| login | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| login | Assinar newsletter | 390 | OK | OK | DOM, valor |
| login | Enviar | 1440 | OK | OK | DOM |
| login | Enviar | 390 | OK | OK | DOM |
| login | /profile · Meu perfil | 1440 | OK | OK | URL, rolagem |
| login | /profile · Meu perfil | 390 | OK | OK | URL, rolagem |
| login | /wallets · Carteiras | 1440 | OK | OK | URL, rolagem |
| login | /wallets · Carteiras | 390 | OK | OK | URL, rolagem |
| login | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| login | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| login | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| login | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| login | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| login | /register · Crie uma conta | 390 | OK | OK | URL, DOM, valor |
| cadastro | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| cadastro | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| cadastro | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| cadastro | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| cadastro | /cart · Carrinho | 1440 | OK | OK | URL, DOM, valor, API:1 |
| cadastro | /cart · Carrinho | 390 | OK | OK | URL, DOM, valor, API:1 |
| cadastro | /login · Entrar | 1440 | OK | OK | URL, DOM, valor |
| cadastro | /login · Entrar | 390 | OK | OK | URL, DOM, valor |
| cadastro | name · name | 1440 | OK | OK | valor |
| cadastro | name · name | 390 | OK | OK | valor |
| cadastro | email · email | 1440 | OK | OK | valor |
| cadastro | email · email | 390 | OK | OK | valor |
| cadastro | password · password | 1440 | OK | OK | valor |
| cadastro | password · password | 390 | OK | OK | valor |
| cadastro | Cadastrar | 1440 | OK | OK | DOM |
| cadastro | Cadastrar | 390 | OK | OK | DOM |
| cadastro | social-google · Continuar com Google | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | social-google · Continuar com Google | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | social-facebook · Continuar com Facebook | 1440 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | social-facebook · Continuar com Facebook | 390 | OK | OK | URL, DOM, storage, valor, API:6 |
| cadastro | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| cadastro | Assinar newsletter | 390 | OK | OK | DOM, valor |
| cadastro | Enviar | 1440 | OK | OK | DOM |
| cadastro | Enviar | 390 | OK | OK | DOM |
| cadastro | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| cadastro | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| cadastro | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| cadastro | /login · Entre | 390 | OK | OK | URL, DOM, valor |
| perfil | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| perfil | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| perfil | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| perfil | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| perfil | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| perfil | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| perfil | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| perfil | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| perfil | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| perfil | /profile · Perfil | 1440 | OK | OK | idempotente: já ativo/própria rota |
| perfil | /profile · Perfil | 390 | OK | OK | idempotente: já ativo/própria rota |
| perfil | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| perfil | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| perfil | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| perfil | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| perfil | /profile · Dados do perfil | 1440 | OK | OK | idempotente: já ativo/própria rota |
| perfil | /profile · Dados do perfil | 390 | OK | OK | idempotente: já ativo/própria rota |
| perfil | name · name | 1440 | OK | OK | valor |
| perfil | name · name | 390 | OK | OK | valor |
| perfil | avatar · avatar | 1440 | OK | OK | valor |
| perfil | avatar · avatar | 390 | OK | OK | valor |
| perfil | Salvar perfil | 1440 | OK | OK | DOM, API:1 |
| perfil | Salvar perfil | 390 | OK | OK | DOM, API:1 |
| perfil | avatar-file · avatar-file | 1440 | N/A (input file (testado em avatar-wallet-expiry)) | N/A (input file) | input file (testado em avatar-wallet-expiry) |
| perfil | avatar-file · avatar-file | 390 | N/A (input file (testado em avatar-wallet-expiry)) | N/A (input file) | input file (testado em avatar-wallet-expiry) |
| perfil | currentPassword · currentPassword | 1440 | OK | OK | valor |
| perfil | currentPassword · currentPassword | 390 | OK | OK | valor |
| perfil | newPassword · newPassword | 1440 | OK | OK | valor |
| perfil | newPassword · newPassword | 390 | OK | OK | valor |
| perfil | Alterar senha | 1440 | OK | OK | DOM |
| perfil | Alterar senha | 390 | OK | OK | DOM |
| perfil | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| perfil | Assinar newsletter | 390 | OK | OK | DOM, valor |
| perfil | Enviar | 1440 | OK | OK | DOM |
| perfil | Enviar | 390 | OK | OK | DOM |
| perfil | /profile · Meu perfil | 1440 | OK | OK | rolagem |
| perfil | /profile · Meu perfil | 390 | OK | OK | rolagem |
| perfil | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| perfil | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| perfil | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| perfil | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| carteiras | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /criadores · Criadores | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carteiras | /criadores · Criadores | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| carteiras | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| carteiras | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| carteiras | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| carteiras | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| carteiras | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| carteiras | /wallets · Carteiras | 1440 | OK | OK | rolagem |
| carteiras | /wallets · Carteiras | 390 | OK | OK | rolagem |
| carteiras | logout · Sair | 1440 | OK | OK | URL, DOM, storage, API:2 |
| carteiras | logout · Sair | 390 | OK | OK | URL, DOM, storage, API:2 |
| carteiras | /profile · Dados do perfil | 1440 | OK | OK | URL, DOM, valor |
| carteiras | /profile · Dados do perfil | 390 | OK | OK | URL, DOM, valor |
| carteiras | wallet-toggle-connection · Desconectar Principal | 1440 | OK | OK | DOM, storage, API:2 |
| carteiras | wallet-toggle-connection · Desconectar Principal | 390 | OK | OK | DOM, storage, API:2 |
| carteiras | Editar Principal | 1440 | OK | OK | DOM, valor |
| carteiras | Editar Principal | 390 | OK | OK | DOM, valor |
| carteiras | label · label | 1440 | OK | OK | valor |
| carteiras | label · label | 390 | OK | OK | valor |
| carteiras | address · address | 1440 | OK | OK | valor |
| carteiras | address · address | 390 | OK | OK | valor |
| carteiras | Adicionar carteira | 1440 | OK | OK | DOM |
| carteiras | Adicionar carteira | 390 | OK | OK | DOM |
| carteiras | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| carteiras | Assinar newsletter | 390 | OK | OK | DOM, valor |
| carteiras | Enviar | 1440 | OK | OK | DOM |
| carteiras | Enviar | 390 | OK | OK | DOM |
| carteiras | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, valor, rolagem |
| carteiras | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| carteiras | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| carteiras | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | / · Início | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | / · Início | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /criadores · Criadores | 1440 | OK | OK | rolagem |
| criadores | /criadores · Criadores | 390 | OK | OK | rolagem |
| criadores | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| criadores | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| criadores | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| criadores | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| criadores | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| criadores | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| criadores | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| criadores | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| criadores | /nfts/nft-1 · Ver obras de creator-1 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-1 · Ver obras de creator-1 | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-2 · Ver obras de creator-2 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-2 · Ver obras de creator-2 | 390 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-3 · Ver obras de creator-3 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-3 · Ver obras de creator-3 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-4 · Ver obras de creator-4 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-4 · Ver obras de creator-4 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-5 · Ver obras de creator-5 | 1440 | OK | OK | URL, DOM, API:2 |
| criadores | /nfts/nft-5 · Ver obras de creator-5 | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| criadores | /nfts/nft-6 · Ver obras de creator-6 | 1440 | OK | OK | URL, DOM, valor, API:2 |
| criadores | /nfts/nft-6 · Ver obras de creator-6 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-7 · Ver obras de creator-7 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-7 · Ver obras de creator-7 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-8 · Ver obras de creator-8 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-8 · Ver obras de creator-8 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-9 · Ver obras de creator-9 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-9 · Ver obras de creator-9 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-10 · Ver obras de creator-10 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-10 · Ver obras de creator-10 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-11 · Ver obras de creator-11 | 1440 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-11 · Ver obras de creator-11 | 390 | OK | OK | URL, DOM, valor, rolagem, API:2 |
| criadores | /nfts/nft-12 · Ver obras de creator-12 | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| criadores | /nfts/nft-12 · Ver obras de creator-12 | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| criadores | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| criadores | Assinar newsletter | 390 | OK | OK | DOM, valor |
| criadores | Enviar | 1440 | OK | OK | DOM |
| criadores | Enviar | 390 | OK | OK | DOM |
| criadores | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| criadores | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| criadores | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| criadores | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| criadores | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:3 |
| criadores | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| criadores | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| aprenda | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| aprenda | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| aprenda | /aprenda · Aprenda | 1440 | OK | OK | rolagem |
| aprenda | /aprenda · Aprenda | 390 | OK | OK | rolagem |
| aprenda | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| aprenda | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| aprenda | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| aprenda | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| aprenda | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| aprenda | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| aprenda | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| aprenda | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| aprenda | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Ler artigo: Como funciona a propriedade de  | 390 | OK | OK | URL, DOM |
| aprenda | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/10-artistas-digitais-para-acompanhar · Ler artigo: 10 artistas digitais para acom | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/raridade-atributos-e-procedencia · Ler artigo: Raridade, atributos e procedência | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 1440 | OK | OK | URL, DOM |
| aprenda | /aprenda/como-proteger-sua-carteira · Ler artigo: Como proteger sua carteira | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| aprenda | Assinar newsletter | 390 | OK | OK | DOM, valor |
| aprenda | Enviar | 1440 | OK | OK | DOM |
| aprenda | Enviar | 390 | OK | OK | DOM |
| aprenda | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| aprenda | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| aprenda | /aprenda · Central de ajuda | 1440 | OK | OK | rolagem |
| aprenda | /aprenda · Central de ajuda | 390 | OK | OK | rolagem |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| aprenda | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| aprenda | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| aprenda | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| aprenda | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| artigo | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| artigo | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| artigo | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| artigo | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| artigo | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| artigo | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| artigo | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| artigo | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| artigo | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| artigo | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| artigo | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| artigo | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| artigo | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| artigo | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| artigo | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| artigo | /aprenda · ← Voltar para Aprenda | 1440 | OK | OK | URL, DOM |
| artigo | /aprenda · ← Voltar para Aprenda | 390 | OK | OK | URL, DOM |
| artigo | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| artigo | Assinar newsletter | 390 | OK | OK | DOM, valor |
| artigo | Enviar | 1440 | OK | OK | DOM |
| artigo | Enviar | 390 | OK | OK | DOM |
| artigo | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor, rolagem |
| artigo | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| artigo | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | rolagem |
| artigo | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | rolagem |
| artigo | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| artigo | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| artigo | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| artigo | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| artigo | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | / · Kurio | 1440 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Kurio | 390 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Início | 390 | OK | OK | URL, DOM, valor, API:4 |
| 404 | /#catalogo · Mercado | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /#catalogo · Mercado | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /criadores · Criadores | 1440 | OK | OK | URL, DOM, rolagem, API:2 |
| 404 | /criadores · Criadores | 390 | OK | OK | URL, DOM, rolagem, API:2 |
| 404 | /aprenda · Aprenda | 1440 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda · Aprenda | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /#busca · Ir para a busca | 1440 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /#busca · Ir para a busca | 390 | OK | OK | URL, DOM, valor, rolagem, API:4 |
| 404 | /cart · Carrinho1 | 1440 | OK | OK | URL, DOM, valor, API:1 |
| 404 | /cart · Carrinho1 | 390 | OK | OK | URL, DOM, valor, API:1 |
| 404 | /profile · Perfil | 1440 | OK | OK | URL, DOM, valor |
| 404 | /profile · Perfil | 390 | OK | OK | URL, DOM, valor |
| 404 | /wallets · Carteiras | 1440 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| 404 | /wallets · Carteiras | 390 | OK | OK | URL, DOM, valor, rolagem, API:1 |
| 404 | logout · Sair | 1440 | OK | OK | URL, DOM, storage, valor, API:2 |
| 404 | logout · Sair | 390 | OK | OK | URL, DOM, storage, valor, API:2 |
| 404 | / · Voltar ao início | 1440 | OK | OK | URL, DOM, valor, API:4 |
| 404 | / · Voltar ao início | 390 | OK | OK | URL, DOM, valor, API:4 |
| 404 | Assinar newsletter | 1440 | OK | OK | DOM, valor |
| 404 | Assinar newsletter | 390 | OK | OK | DOM, valor |
| 404 | Enviar | 1440 | OK | OK | DOM |
| 404 | Enviar | 390 | OK | OK | DOM |
| 404 | /profile · Meu perfil | 1440 | OK | OK | URL, DOM, valor |
| 404 | /profile · Meu perfil | 390 | OK | OK | URL, DOM, valor, rolagem |
| 404 | /aprenda · Central de ajuda | 1440 | OK | OK | URL, DOM |
| 404 | /aprenda · Central de ajuda | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 1440 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-funciona-a-propriedade-de-nfts · Como comprar NFTs | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 1440 | OK | OK | URL, DOM, rolagem |
| 404 | /aprenda/como-proteger-sua-carteira · Carteira e segurança | 390 | OK | OK | URL, DOM, rolagem |
| 404 | /?collection=Arte+digital#catalogo · Arte digital | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Arte+digital#catalogo · Arte digital | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Fotografia#catalogo · Fotografia | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Fotografia#catalogo · Fotografia | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=M%C3%BAsica#catalogo · Música | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=M%C3%BAsica#catalogo · Música | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Arte+3D#catalogo · Arte 3D | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Arte+3D#catalogo · Arte 3D | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 1440 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | /?collection=Colecion%C3%A1veis#catalogo · Colecionáveis | 390 | OK | OK | URL, DOM, valor, rolagem, API:5 |
| 404 | https://www.facebook.com/ · Facebook (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.facebook.com/ · Facebook (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.instagram.com/ · Instagram (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.instagram.com/ · Instagram (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://x.com/ · X (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://x.com/ · X (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.linkedin.com/ · LinkedIn (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.youtube.com/ · YouTube (abre em nova aba) | 1440 | OK (link externo https, noopener; não clicado) | - | - |
| 404 | https://www.youtube.com/ · YouTube (abre em nova aba) | 390 | OK (link externo https, noopener; não clicado) | - | - |
