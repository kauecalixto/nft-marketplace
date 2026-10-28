# Auditoria interativa (qa-independent)

Gerado em 2026-10-28 por `scratchpad/audit/audit.mjs` (Playwright, preview de `build:demo` em :4175, reducedMotion=reduce). Cada elemento visível foi acionado por mouse (clique/preenchimento) e por teclado (foco + Enter) numa página recarregada com o estado local restaurado. "Efeito" = mudança de URL, DOM, estado local, rolagem, foco, diálogo, request /api ou nova aba. `CHROME` = cabeçalho/rodapé, testado integralmente em `/`, `/cart` e `/login`.


## Conclusões (qa-independent)
- Nenhum controle decorativo confirmado, exceto o candidato abaixo; links sem `href="#"`; links externos com https e `rel="noopener noreferrer"`.
- **Falha aberta (dono: ui-designer):** Início, botão **Aplicar** do filtro de preço, habilitado com os dois campos vazios e sem nenhum efeito. Com valor em "Preço mín." ele funciona (`?min=`). Corrigir desabilitando quando vazio ou dando retorno (ex.: limpar o filtro). Reprova 3 testes de `tests/e2e/interativos.spec.ts` (início 1440/390 e início logado).
- "SEM EFEITO" restantes na tabela são idempotentes por estado ativo (`aria-pressed="true"`/`aria-current`: miniatura 1, ponto 1 do carrossel) ou limites desabilitados (Anterior na pág. 1, Diminuir no mínimo, Aplicar do cupom vazio).
- Checkboxes de filtro: "SEM EFEITO POR TECLADO" com Enter é do script (checkbox alterna com Espaço, padrão do navegador).
- Limite da auditoria: `input[file]` do avatar não foi acionado (coberto por spec próprio); os dados da tabela são anteriores às últimas edições em `src/`; nova rodada necessária após as correções dos donos.

## Resumo
- 1440px: CHROME=342, OK=258, CAMPO OK=31, SEM EFEITO=6, DESABILITADO=6, OCULTO=2, CAMPO (sem reação visível)=1
- 390px: CHROME=342, OK=258, CAMPO OK=31, SEM EFEITO=6, DESABILITADO=6, OCULTO=2, CAMPO (sem reação visível)=1

## Viewport 1440px

### /nfts/nft-1 (visitante) (chegou em `/nfts/nft-1`; 38 visíveis de 38)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### / (visitante) (chegou em `/`; 74 visíveis de 74)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### /nfts/nft-1 (ana) (chegou em `/nfts/nft-1`; 40 visíveis de 40)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### / (ana) (chegou em `/`; 76 visíveis de 76)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /nfts/nft-1#main; foco → MAIN|main||Início / Mercado← Voltar ao c |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /#main; foco → MAIN|main||Bem-vindo à KurioSeja dono do |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /nfts/nft-1#main; foco → MAIN|main||Início / Mercado← Voltar ao c |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /#main; foco → MAIN|main||Bem-vindo à KurioSeja dono do |
| 9 | button[button] "Ver imagem 1 de 3" #gallery-thumb | **SEM EFEITO** | — | — |
| 1 | a "Kurio" → / | OK (link para a própria rota) | — | — |
| 11 | button[button] "Ver imagem 1 de 3" #gallery-thumb | **SEM EFEITO** | — | — |
| 1 | a "Kurio" → / | OK (link para a própria rota) | — | — |
| 10 | button[button] "Ver imagem 2 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 2 | a "Início" → / | OK (link para a própria rota) | — | — |
| 12 | button[button] "Ver imagem 2 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 2 | a "Início" → / | OK (link para a própria rota) | — | — |
| 11 | button[button] "Ver imagem 3 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 13 | button[button] "Ver imagem 3 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 12 | a "← Voltar ao catálogo" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 13 | button[button] "Diminuir quantidade" #quantity-decrease | **DESABILITADO** | — | — |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 14 | a "← Voltar ao catálogo" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 15 | button[button] "Diminuir quantidade" #quantity-decrease | **DESABILITADO** | — | — |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 14 | input[number] "Quantidade" #quantity-input | CAMPO OK | DOM mudou; valor aceito | — |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 16 | input[number] "Quantidade" #quantity-input | CAMPO OK | DOM mudou; valor aceito | — |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 15 | button[button] "Aumentar quantidade" #quantity-increase | OK | DOM mudou | DOM mudou |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT |
| 17 | button[button] "Aumentar quantidade" #quantity-increase | OK | DOM mudou | DOM mudou |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT |
| 16 | button "Adicionar ao carrinho" #add-to-cart | OK | estado local mudou; DOM mudou; request /api/cart | estado local mudou; DOM mudou; request /api/cart |
| 7 | a "Carrinho" → /cart | OK | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot |
| 18 | button "Adicionar ao carrinho" #add-to-cart | OK | estado local mudou; DOM mudou; request /api/cart | estado local mudou; DOM mudou; request /api/cart |
| 7 | a "Carrinho1" → /cart | OK | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot |
| 17 | button "Favoritar" #favorite-toggle | OK | URL → /login?redirect=%2Fnfts%2Fnft-1; DOM mudou; foco → MAIN|main||KurioEntrarCriar conta | URL → /login?redirect=%2Fnfts%2Fnft-1; DOM mudou; foco → MAIN|main||KurioEntrarCriar conta |
| 8 | a "Entrar" → /login | OK | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 19 | button "Favoritar" #favorite-toggle | OK | estado local mudou; DOM mudou; foco → BUTTON||favorite-toggle|Remover dos favo; request /a | estado local mudou; DOM mudou; foco → BUTTON||favorite-toggle|Remover dos favo; request /a |
| 8 | a "Perfil" → /profile | OK | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 18 | a "creator-1" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api |
| 9 | a "Explorar" → #catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 20 | a "creator-1" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api |
| 9 | a "Carteiras" → /wallets | OK | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w |

### /cart (ana) (chegou em `/cart`; 37 visíveis de 37)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### /cart (visitante) (chegou em `/cart`; 29 visíveis de 29)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 10 | button[button] "Mostrar imagem 1 de 4" | **SEM EFEITO** | — | — |
| 10 | button "Sair" #logout | OK | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /cart#main; foco → MAIN|main||Início / Mercado / CarrinhoCa |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /cart#main; foco → MAIN|main||Início / Mercado / CarrinhoCa |
| 11 | button[button] "Mostrar imagem 2 de 4" | OK | DOM mudou | DOM mudou |
| 11 | a "Explorar" → #catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 1 | a "Kurio" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 9 | a "Explorar NFTs" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 12 | button[button] "Mostrar imagem 3 de 4" | OK | DOM mudou | DOM mudou |

### /checkout (ana) (chegou em `/checkout`; 36 visíveis de 36)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 12 | button[button] "Mostrar imagem 1 de 4" | **SEM EFEITO** | — | — |
| 2 | a "Início" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /checkout#main; foco → MAIN|main||Início / Mercado / PagamentoP |
| 13 | button[button] "Mostrar imagem 4 de 4" | OK | DOM mudou | DOM mudou |
| 13 | button[button] "Mostrar imagem 2 de 4" | OK | DOM mudou | DOM mudou |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req |
| 11 | input "" #field-name | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 14 | a "Em destaqueNeon Dunes0.45 ETH" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 14 | button[button] "Mostrar imagem 3 de 4" | OK | DOM mudou | DOM mudou |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api |
| 12 | input "" #field-email | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 15 | a "Em destaquePixel Pals0.02 ETH" → /nfts/nft-8 | OK | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 15 | button[button] "Mostrar imagem 4 de 4" | OK | DOM mudou | DOM mudou |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 13 | input "" #field-document | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 16 | a "Em destaqueGlass Garden2.10 ETH" → /nfts/nft-9 | OK | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 16 | a "Em destaqueNeon Dunes0.45 ETH" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu |
| 14 | select "SelecionePrincipal (0x111111...)" #field-wallet | CAMPO OK | DOM mudou; valor aceito | — |
| 17 | input "Buscar NFT" | CAMPO OK | URL → /?q=a; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 17 | a "Em destaquePixel Pals0.02 ETH" → /nfts/nft-8 | OK | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 7 | a "Carrinho1" → /cart | OK (link para a própria rota) | — | — |
| 15 | select "EthereumPolygonBase" #field-network | CAMPO OK | DOM mudou; request /api/quote; valor aceito | — |
| 18 | button[button] "Arte digital(2)" | OK | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts |
| 18 | a "Em destaqueGlass Garden2.10 ETH" → /nfts/nft-9 | OK | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 8 | a "Perfil" → /profile | OK | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 16 | button[submit] "Revisar pedido" #review-order | OK | DOM mudou | DOM mudou |
| 19 | button[button] "Fotografia(2)" | OK | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts |
| 19 | input "Buscar NFT" | CAMPO OK | URL → /?q=a; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 9 | a "Carteiras" → /wallets | OK | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w |

### /orders/:id (ana) (chegou em `/orders/ord-1`; 31 visíveis de 31)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /orders/ord-1#main; foco → MAIN|main||Pedido confirmado.THANKYOUPed |
| 20 | button[button] "Música(2)" | OK | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts |
| 20 | button[button] "Arte digital(2)" | OK | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts |
| 10 | button "Sair" #logout | OK | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre |
| 11 | button[button] "Diminuir Blue Orbit" #qty-dec-nft-2 | **DESABILITADO** | — | — |
| 11 | a "Continuar explorando" → / | OK | URL → /; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api | URL → /; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api |
| 21 | button[button] "Arte 3D(1)" | OK | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts |
| 12 | button[button] "Aumentar Blue Orbit" #qty-inc-nft-2 | OK | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote |
| 21 | button[button] "Fotografia(2)" | OK | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts |

### /login (visitante) (chegou em `/login`; 34 visíveis de 35)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 22 | button[button] "Colecionáveis(1)" | OK | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /login#main; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 13 | button[button] "Remover Blue Orbit" #remove-nft-2 | OK | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote |
| 22 | button[button] "Música(2)" | OK | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts |
| 23 | button[button] "Generativa(1)" | OK | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts |
| 1 | a "Kurio" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 14 | input "Digite o código promocional..." #coupon-input | CAMPO OK | DOM mudou; request /api/cart/coupon; valor aceito | — |
| 15 | button[submit] "Aplicar" #coupon-apply | **DESABILITADO** | — | — |
| 23 | button[button] "Arte 3D(1)" | OK | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts |
| 24 | button[button] "Jogos(1)" | OK | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts |
| 2 | a "Início" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 16 | a "Ir para o pagamento" → /checkout #go-checkout | OK | URL → /checkout; DOM mudou; foco → MAIN|main||Início / Mercado / PagamentoP; request /api/ | URL → /checkout; DOM mudou; foco → MAIN|main||Início / Mercado / PagamentoP; request /api/ |
| 24 | button[button] "Colecionáveis(1)" | OK | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts |
| 25 | button[button] "Assinaturas(1)" | OK | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req |
| 17 | a "Continuar explorando" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 25 | button[button] "Generativa(1)" | OK | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts |
| 26 | button[button] "Utilidade(1)" | OK | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api |
| 18 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 26 | button[button] "Jogos(1)" | OK | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts |
| 27 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 19 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 27 | button[button] "Assinaturas(1)" | OK | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts |
| 28 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu |
| 20 | a "Meu perfil" → /profile | OK | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 28 | button[button] "Utilidade(1)" | OK | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts |
| 7 | a "Carrinho" → /cart | OK | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot |
| 29 | button[button] "Aplicar" | **SEM EFEITO** | — | — |
| 21 | a "Carteiras" → /wallets | OK | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque |
| 29 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 8 | a "Entrar" → /login | OK (link para a própria rota) | — | — |
| 30 | input[checkbox] "" | **OK (mouse); SEM EFEITO POR TECLADO** | URL → /?available=true; rolagem; DOM mudou; request /api/nfts; alterna estado (checked) | — |
| 22 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req |
| 30 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 9 | a "Criar conta" → /register | OK | URL → /register; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaCrie se | URL → /register; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaCrie se |
| 31 | button[button] "Ethereum(4)" | OK | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts |
| 23 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 31 | button[button] "Aplicar" | **SEM EFEITO** | — | — |
| 10 | input[email] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 32 | button[button] "Polygon(4)" | OK | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts |
| 24 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 32 | input[checkbox] "" | **OK (mouse); SEM EFEITO POR TECLADO** | URL → /?available=true; rolagem; DOM mudou; request /api/nfts; alterna estado (checked) | — |
| 11 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 33 | button[button] "Solana(4)" | OK | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts |
| 25 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 33 | button[button] "Ethereum(4)" | OK | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts |
| 12 | button[submit] "Entrar" | OK | DOM mudou | DOM mudou |
| 34 | a "NFT em destaque: Neon Dunes" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 26 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 34 | button[button] "Polygon(4)" | OK | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts |
| 13 | button[button] "Continuar com Google" #social-google | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 35 | button[button] "Todos os NFTs" | OK | rolagem | rolagem |
| 27 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  |
| 35 | button[button] "Solana(4)" | OK | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts |
| 14 | button[button] "Continuar com Facebook" #social-facebook | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 36 | button[button] "Novos lançamentos" | OK | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts |
| 28 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  |
| 36 | a "NFT em destaque: Neon Dunes" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 16 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 37 | button[button] "Em alta" | OK | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts |
| 29 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à |
| 37 | button[button] "Todos os NFTs" | OK | rolagem | rolagem |
| 17 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 38 | select "Listados recentementePreço: menor primeiroPreço: m" | CAMPO OK | URL → /?sort=price-asc; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 30 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur |
| 38 | button[button] "Novos lançamentos" | OK | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts |
| 18 | a "Meu perfil" → /profile | OK | URL → /login?redirect=%2Fprofile; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login?redirect=%2Fprofile; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 39 | a "Aurora Genesis0.50 ETH" → /nfts/nft-1 | OK | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 31 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- |
| 39 | button[button] "Em alta" | OK | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts |
| 19 | a "Carteiras" → /wallets | OK | URL → /login?redirect=%2Fwallets; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login?redirect=%2Fwallets; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 40 | a "Blue Orbit1.25 ETH" → /nfts/nft-2 | OK | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 32 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 40 | select "Listados recentementePreço: menor primeiroPreço: m" | CAMPO OK | URL → /?sort=price-asc; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 20 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req |
| 41 | a "Cyber Koi0.08 ETH" → /nfts/nft-3 | OK | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 33 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 41 | a "Aurora Genesis0.50 ETH" → /nfts/nft-1 | OK | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 21 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 42 | a "One of One12.00 ETH" → /nfts/nft-4 | OK | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 34 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 42 | a "Blue Orbit1.25 ETH" → /nfts/nft-2 | OK | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 22 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 43 | a "Sold Out Sun0.90 ETH" → /nfts/nft-5 | OK | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 35 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 43 | a "Cyber Koi0.08 ETH" → /nfts/nft-3 | OK | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 23 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 44 | a "Solo Limit0.30 ETH" → /nfts/nft-6 | OK | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 45 | button[button] "Anterior" | **DESABILITADO** | — | — |
| 36 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 44 | a "One of One12.00 ETH" → /nfts/nft-4 | OK | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |

### /register (visitante) (chegou em `/register`; 35 visíveis de 36)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 24 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 46 | button[button] "Ir para a página 1" | OK | rolagem | rolagem |
| 45 | a "Sold Out Sun0.90 ETH" → /nfts/nft-5 | OK | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /register#main; foco → MAIN|main||KurioEntrarCriar contaCrie se |
| 25 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  |
| 47 | button[button] "Ir para a página 2" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 46 | a "Solo Limit0.30 ETH" → /nfts/nft-6 | OK | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 47 | button[button] "Anterior" | **DESABILITADO** | — | — |
| 9 | a "Entrar" → /login | OK | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 26 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  |
| 48 | button[button] "Próxima" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 48 | button[button] "Ir para a página 1" | OK | rolagem | rolagem |
| 10 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 27 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à |
| 49 | a "Explorar: Lançamentos gênesis de edição limitada" → /?tab=novos#catalogo | OK | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts |
| 49 | button[button] "Ir para a página 2" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 11 | input[email] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 28 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur |
| 50 | a "Explorar: Arte digital selecionada e muito mais" → /?collection=Arte+digital# | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 50 | button[button] "Próxima" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 12 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 29 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- |
| 51 | a "Ler artigo: Como funciona a propriedade de NFTs" → /aprenda/como-funciona-a-p | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 51 | a "Explorar: Lançamentos gênesis de edição limitada" → /?tab=novos#catalogo | OK | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts |
| 13 | button[submit] "Cadastrar" | OK | DOM mudou | DOM mudou |
| 30 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 52 | a "Ler artigo: 10 artistas digitais para acompanhar" → /aprenda/10-artistas-digi | OK | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| |
| 52 | a "Explorar: Arte digital selecionada e muito mais" → /?collection=Arte+digital# | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 14 | button[button] "Continuar com Google" #social-google | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 31 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 53 | a "Ler artigo: Raridade, atributos e procedência" → /aprenda/raridade-atributos- | OK | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V |
| 53 | a "Ler artigo: Como funciona a propriedade de NFTs" → /aprenda/como-funciona-a-p | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 15 | button[button] "Continuar com Facebook" #social-facebook | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 32 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 54 | a "Ler artigo: Como proteger sua carteira" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |

### /profile (ana) (chegou em `/profile`; 39 visíveis de 39)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 54 | a "Ler artigo: 10 artistas digitais para acompanhar" → /aprenda/10-artistas-digi | OK | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /profile#main; foco → MAIN|main||Meu perfilDados do perfilCart |
| 33 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 55 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 55 | a "Ler artigo: Raridade, atributos e procedência" → /aprenda/raridade-atributos- | OK | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V |
| 11 | a "Dados do perfil" → /profile | OK (link para a própria rota) | — | — |
| 34 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 56 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 56 | a "Ler artigo: Como proteger sua carteira" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 12 | a "Carteiras" → /wallets | OK | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w |

### /wallets (ana) (chegou em `/wallets`; 37 visíveis de 37)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 57 | a "Meu perfil" → /profile | OK | URL → /login?redirect=%2Fprofile; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c | URL → /login?redirect=%2Fprofile; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /wallets#main; foco → MAIN|main||Meu perfilDados do perfilCart |
| 57 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 13 | input "" | CAMPO OK | estado local mudou; DOM mudou; request /api/profile; valor aceito | DOM mudou; request /api/profile |
| 58 | a "Carteiras" → /wallets | OK | URL → /login?redirect=%2Fwallets; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c | URL → /login?redirect=%2Fwallets; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c |
| 11 | a "Dados do perfil" → /profile | OK | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 58 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 14 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou; request /api/profile |
| 59 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 12 | a "Carteiras" → /wallets | OK (link para a própria rota) | — | — |
| 59 | a "Meu perfil" → /profile | OK | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 15 | button[submit] "Salvar perfil" | OK | DOM mudou; request /api/profile | DOM mudou; request /api/profile |
| 60 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 13 | button[button] "Desconectar Principal" #wallet-toggle-connection | OK | estado local mudou; DOM mudou; foco → BUTTON||wallet-toggle-connection|Conecta; request /a | estado local mudou; DOM mudou; foco → BUTTON||wallet-toggle-connection|Conecta; request /a |
| 60 | a "Carteiras" → /wallets | OK | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque |
| 16 | input[file] "" #avatar-file | CAMPO (sem reação visível) | — | — |
| 61 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 14 | button[button] "Editar Principal" | OK | DOM mudou | DOM mudou |
| 61 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 17 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 62 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 15 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 62 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 18 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 63 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 16 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 63 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 19 | button[submit] "Alterar senha" | OK | DOM mudou | DOM mudou |
| 64 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 17 | button[submit] "Adicionar carteira" | OK | DOM mudou | DOM mudou |
| 64 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |

### /criadores (ana) (chegou em `/criadores`; 42 visíveis de 42)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /criadores#main; foco → MAIN|main||CriadoresConheça quem publico |

### /aprenda (ana) (chegou em `/aprenda`; 34 visíveis de 34)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 65 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts |
| 65 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /aprenda#main; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 11 | a "Ver obras de creator-1" → /nfts/nft-1 | OK | URL → /nfts/nft-1; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-1; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 66 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts |
| 66 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 11 | a "Ler artigo: Como funciona a propriedade de NFTs" → /aprenda/como-funciona-a-p | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-funciona-a-propriedade-de-nfts; DOM mudou; foco → MAIN|main||← Voltar  |
| 12 | a "Ver obras de creator-2" → /nfts/nft-2 | OK | URL → /nfts/nft-2; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-2; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 67 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts |
| 67 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts |
| 12 | a "Ler artigo: 10 artistas digitais para acompanhar" → /aprenda/10-artistas-digi | OK | URL → /aprenda/10-artistas-digitais-para-acompanhar; DOM mudou; foco → MAIN|main||← Voltar | URL → /aprenda/10-artistas-digitais-para-acompanhar; DOM mudou; foco → MAIN|main||← Voltar |
| 13 | a "Ver obras de creator-3" → /nfts/nft-3 | OK | URL → /nfts/nft-3; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-3; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 68 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts |
| 68 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts |
| 13 | a "Ler artigo: Raridade, atributos e procedência" → /aprenda/raridade-atributos- | OK | URL → /aprenda/raridade-atributos-e-procedencia; DOM mudou; foco → MAIN|main||← Voltar par | URL → /aprenda/raridade-atributos-e-procedencia; DOM mudou; foco → MAIN|main||← Voltar par |
| 14 | a "Ver obras de creator-4" → /nfts/nft-4 | OK | URL → /nfts/nft-4; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-4; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 69 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 69 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts |
| 14 | a "Ler artigo: Como proteger sua carteira" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; DOM mudou; foco → MAIN|main||← Voltar para Apre | URL → /aprenda/como-proteger-sua-carteira; DOM mudou; foco → MAIN|main||← Voltar para Apre |
| 15 | a "Ver obras de creator-5" → /nfts/nft-5 | OK | URL → /nfts/nft-5; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-5; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 70 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |

### /aprenda/:slug (ana) (chegou em `/aprenda/como-funciona-a-propriedade-de-nfts`; 31 visíveis de 31)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 70 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /aprenda/como-funciona-a-propriedade-de-nfts#main; foco → MAIN|main||← Voltar para A |
| 16 | a "Ver obras de creator-6" → /nfts/nft-6 | OK | URL → /nfts/nft-6; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-6; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 71 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 71 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 11 | a "← Voltar para Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 17 | a "Ver obras de creator-7" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 72 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 72 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |

### 404 (ana) (chegou em `/rota-inexistente`; 31 visíveis de 31)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 18 | a "Ver obras de creator-8" → /nfts/nft-8 | OK | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /rota-inexistente#main; foco → MAIN|main||404Página não encontradaO end |
| 73 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 73 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 19 | a "Ver obras de creator-9" → /nfts/nft-9 | OK | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 11 | a "Voltar ao início" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 74 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 20 | a "Ver obras de creator-10" → /nfts/nft-10 | OK | URL → /nfts/nft-10; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r | URL → /nfts/nft-10; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r |
| 75 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 21 | a "Ver obras de creator-11" → /nfts/nft-11 | OK | URL → /nfts/nft-11; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r | URL → /nfts/nft-11; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r |
| 22 | a "Ver obras de creator-12" → /nfts/nft-12 | OK | URL → /nfts/nft-12; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r | URL → /nfts/nft-12; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r |
## Viewport 390px

### / (visitante) (chegou em `/`; 73 visíveis de 74)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### /nfts/nft-1 (visitante) (chegou em `/nfts/nft-1`; 38 visíveis de 38)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### / (ana) (chegou em `/`; 75 visíveis de 76)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### /nfts/nft-1 (ana) (chegou em `/nfts/nft-1`; 40 visíveis de 40)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /#main; foco → MAIN|main||Bem-vindo à KurioSeja dono do |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /nfts/nft-1#main; foco → MAIN|main||Início / Mercado← Voltar ao c |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /nfts/nft-1#main; foco → MAIN|main||Início / Mercado← Voltar ao c |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /#main; foco → MAIN|main||Bem-vindo à KurioSeja dono do |
| 9 | button[button] "Ver imagem 1 de 3" #gallery-thumb | **SEM EFEITO** | — | — |
| 1 | a "Kurio" → / | OK (link para a própria rota) | — | — |
| 11 | button[button] "Ver imagem 1 de 3" #gallery-thumb | **SEM EFEITO** | — | — |
| 1 | a "Kurio" → / | OK (link para a própria rota) | — | — |
| 10 | button[button] "Ver imagem 2 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 2 | a "Início" → / | OK (link para a própria rota) | — | — |
| 12 | button[button] "Ver imagem 2 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 2 | a "Início" → / | OK (link para a própria rota) | — | — |
| 11 | button[button] "Ver imagem 3 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 13 | button[button] "Ver imagem 3 de 3" #gallery-thumb | OK | DOM mudou | DOM mudou |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 12 | a "← Voltar ao catálogo" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 13 | button[button] "Diminuir quantidade" #quantity-decrease | **DESABILITADO** | — | — |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 14 | a "← Voltar ao catálogo" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 15 | button[button] "Diminuir quantidade" #quantity-decrease | **DESABILITADO** | — | — |
| 14 | input[number] "Quantidade" #quantity-input | CAMPO OK | DOM mudou; valor aceito | — |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 16 | input[number] "Quantidade" #quantity-input | CAMPO OK | DOM mudou; valor aceito | — |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 15 | button[button] "Aumentar quantidade" #quantity-increase | OK | DOM mudou | DOM mudou |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT |
| 17 | button[button] "Aumentar quantidade" #quantity-increase | OK | DOM mudou | DOM mudou |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT | URL → /#busca; rolagem; foco → INPUT|busca||Buscar NFT |
| 16 | button "Adicionar ao carrinho" #add-to-cart | OK | estado local mudou; DOM mudou; request /api/cart | estado local mudou; DOM mudou; request /api/cart |
| 7 | a "Carrinho" → /cart | OK | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot |
| 18 | button "Adicionar ao carrinho" #add-to-cart | OK | estado local mudou; DOM mudou; request /api/cart | estado local mudou; DOM mudou; request /api/cart |
| 7 | a "Carrinho1" → /cart | OK | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot |
| 17 | button "Favoritar" #favorite-toggle | OK | URL → /login?redirect=%2Fnfts%2Fnft-1; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCr | URL → /login?redirect=%2Fnfts%2Fnft-1; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCr |
| 8 | a "Entrar" → /login | OK | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 19 | button "Favoritar" #favorite-toggle | OK | estado local mudou; DOM mudou; foco → BUTTON||favorite-toggle|Remover dos favo; request /a | estado local mudou; DOM mudou; foco → BUTTON||favorite-toggle|Remover dos favo; request /a |
| 8 | a "Perfil" → /profile | OK | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 18 | a "creator-1" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req |
| 9 | a "Explorar" → #catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 20 | a "creator-1" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req |
| 9 | a "Carteiras" → /wallets | OK | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w |

### /cart (visitante) (chegou em `/cart`; 29 visíveis de 29)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|

### /cart (ana) (chegou em `/cart`; 37 visíveis de 37)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 10 | button[button] "Mostrar imagem 1 de 4" | **SEM EFEITO** | — | — |
| 10 | button "Sair" #logout | OK | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /cart#main; foco → MAIN|main||Início / Mercado / CarrinhoCa |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /cart#main; foco → MAIN|main||Início / Mercado / CarrinhoCa |
| 11 | button[button] "Mostrar imagem 2 de 4" | OK | DOM mudou | DOM mudou |
| 11 | a "Explorar" → #catalogo | OK | URL → /#catalogo; rolagem | URL → /#catalogo; rolagem |
| 9 | a "Explorar NFTs" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 1 | a "Kurio" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |

### /checkout (ana) (chegou em `/checkout`; 36 visíveis de 36)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 12 | button[button] "Mostrar imagem 3 de 4" | OK | DOM mudou | DOM mudou |
| 12 | button[button] "Mostrar imagem 1 de 4" | **SEM EFEITO** | — | — |
| 2 | a "Início" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /checkout#main; foco → MAIN|main||Início / Mercado / PagamentoP |
| 13 | button[button] "Mostrar imagem 4 de 4" | OK | DOM mudou | DOM mudou |
| 13 | button[button] "Mostrar imagem 2 de 4" | OK | DOM mudou | DOM mudou |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req |
| 11 | input "" #field-name | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 14 | a "Em destaqueNeon Dunes0.45 ETH" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 14 | button[button] "Mostrar imagem 3 de 4" | OK | DOM mudou | DOM mudou |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api |
| 12 | input "" #field-email | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 15 | a "Em destaquePixel Pals0.02 ETH" → /nfts/nft-8 | OK | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 15 | button[button] "Mostrar imagem 4 de 4" | OK | DOM mudou | DOM mudou |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 13 | input "" #field-document | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 16 | a "Em destaqueGlass Garden2.10 ETH" → /nfts/nft-9 | OK | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 16 | a "Em destaqueNeon Dunes0.45 ETH" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu |
| 14 | select "SelecionePrincipal (0x111111...)" #field-wallet | CAMPO OK | DOM mudou; valor aceito | — |
| 17 | input "Buscar NFT" | CAMPO OK | URL → /?q=a; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 17 | a "Em destaquePixel Pals0.02 ETH" → /nfts/nft-8 | OK | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 7 | a "Carrinho1" → /cart | OK (link para a própria rota) | — | — |
| 15 | select "EthereumPolygonBase" #field-network | CAMPO OK | DOM mudou; request /api/quote; valor aceito | — |
| 18 | button[button] "Arte digital(2)" | OK | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts |
| 18 | a "Em destaqueGlass Garden2.10 ETH" → /nfts/nft-9 | OK | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 8 | a "Perfil" → /profile | OK | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 16 | button[submit] "Revisar pedido" #review-order | OK | rolagem; DOM mudou | rolagem; DOM mudou |
| 19 | button[button] "Fotografia(2)" | OK | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts |
| 19 | input "Buscar NFT" | CAMPO OK | URL → /?q=a; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 9 | a "Carteiras" → /wallets | OK | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w |

### /orders/:id (ana) (chegou em `/orders/ord-1`; 31 visíveis de 31)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /orders/ord-1#main; foco → MAIN|main||Pedido confirmado.THANKYOUPed |
| 20 | button[button] "Música(2)" | OK | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts |
| 20 | button[button] "Arte digital(2)" | OK | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital; rolagem; DOM mudou; request /api/nfts |
| 10 | button "Sair" #logout | OK | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre | URL → /login; estado local mudou; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre |
| 11 | button[button] "Diminuir Blue Orbit" #qty-dec-nft-2 | **DESABILITADO** | — | — |
| 11 | a "Continuar explorando" → / | OK | URL → /; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api | URL → /; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api |
| 21 | button[button] "Arte 3D(1)" | OK | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts |
| 21 | button[button] "Fotografia(2)" | OK | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia; rolagem; DOM mudou; request /api/nfts |
| 12 | button[button] "Aumentar Blue Orbit" #qty-inc-nft-2 | OK | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote |

### /login (visitante) (chegou em `/login`; 35 visíveis de 35)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 22 | button[button] "Colecionáveis(1)" | OK | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /login#main; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 22 | button[button] "Música(2)" | OK | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica; rolagem; DOM mudou; request /api/nfts |
| 13 | button[button] "Remover Blue Orbit" #remove-nft-2 | OK | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote | estado local mudou; DOM mudou; request /api/cart/nft-2,/api/cart,/api/quote |
| 23 | button[button] "Generativa(1)" | OK | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts |
| 1 | a "Kurio" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 23 | button[button] "Arte 3D(1)" | OK | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D; rolagem; DOM mudou; request /api/nfts |
| 14 | input "Digite o código promocional..." #coupon-input | CAMPO OK | DOM mudou; request /api/cart/coupon; valor aceito | — |
| 15 | button[submit] "Aplicar" #coupon-apply | **DESABILITADO** | — | — |
| 24 | button[button] "Jogos(1)" | OK | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts |
| 24 | button[button] "Colecionáveis(1)" | OK | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis; rolagem; DOM mudou; request /api/nfts |
| 2 | a "Início" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 16 | a "Ir para o pagamento" → /checkout #go-checkout | OK | URL → /checkout; DOM mudou; foco → MAIN|main||Início / Mercado / PagamentoP; request /api/ | URL → /checkout; DOM mudou; foco → MAIN|main||Início / Mercado / PagamentoP; request /api/ |
| 25 | button[button] "Assinaturas(1)" | OK | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts |
| 25 | button[button] "Generativa(1)" | OK | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Generativa; rolagem; DOM mudou; request /api/nfts |
| 3 | a "Mercado" → /#catalogo | OK | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req | URL → /#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; req |
| 17 | a "Continuar explorando" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 26 | button[button] "Utilidade(1)" | OK | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts |
| 26 | button[button] "Jogos(1)" | OK | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Jogos; rolagem; DOM mudou; request /api/nfts |
| 4 | a "Criadores" → /criadores | OK | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api | URL → /criadores; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; request /api |
| 18 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 27 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 5 | a "Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 27 | button[button] "Assinaturas(1)" | OK | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Assinaturas; rolagem; DOM mudou; request /api/nfts |
| 19 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 28 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 28 | button[button] "Utilidade(1)" | OK | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Utilidade; rolagem; DOM mudou; request /api/nfts |
| 6 | a "Ir para a busca" → /#busca | OK | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu | URL → /#busca; rolagem; DOM mudou; foco → INPUT|busca||Buscar NFT; request /api/nfts/featu |
| 20 | a "Meu perfil" → /profile | OK | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 29 | button[button] "Aplicar" | **SEM EFEITO** | — | — |
| 7 | a "Carrinho" → /cart | OK | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot | URL → /cart; DOM mudou; foco → MAIN|main||Início / Mercado / CarrinhoCa; request /api/quot |
| 29 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 21 | a "Carteiras" → /wallets | OK | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque |
| 30 | input[checkbox] "" | **OK (mouse); SEM EFEITO POR TECLADO** | URL → /?available=true; rolagem; DOM mudou; request /api/nfts; alterna estado (checked) | — |
| 8 | a "Entrar" → /login | OK (link para a própria rota) | — | — |
| 30 | input "" | CAMPO OK | DOM mudou; valor aceito | — |
| 22 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req |
| 31 | button[button] "Ethereum(4)" | OK | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts |
| 9 | a "Criar conta" → /register | OK | URL → /register; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaCrie se | URL → /register; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaCrie se |
| 31 | button[button] "Aplicar" | **SEM EFEITO** | — | — |
| 23 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 32 | button[button] "Polygon(4)" | OK | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts |
| 10 | input[email] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 32 | input[checkbox] "" | **OK (mouse); SEM EFEITO POR TECLADO** | URL → /?available=true; rolagem; DOM mudou; request /api/nfts; alterna estado (checked) | — |
| 24 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 33 | button[button] "Solana(4)" | OK | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts |
| 11 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 33 | button[button] "Ethereum(4)" | OK | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts | URL → /?network=Ethereum; rolagem; DOM mudou; request /api/nfts |
| 25 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 35 | button[button] "Todos os NFTs" | OK | rolagem | rolagem |
| 12 | button[submit] "Entrar" | OK | DOM mudou | DOM mudou |
| 34 | button[button] "Polygon(4)" | OK | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts | URL → /?network=Polygon; rolagem; DOM mudou; request /api/nfts |
| 26 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 13 | button[button] "Continuar com Google" #social-google | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 36 | button[button] "Novos lançamentos" | OK | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts |
| 35 | button[button] "Solana(4)" | OK | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts | URL → /?network=Solana; rolagem; DOM mudou; request /api/nfts |
| 27 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  |
| 37 | button[button] "Em alta" | OK | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts |
| 14 | button[button] "Continuar com Facebook" #social-facebook | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 37 | button[button] "Todos os NFTs" | OK | rolagem | rolagem |
| 28 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  |
| 15 | a "Crie uma conta" → /register | OK | URL → /register; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaCrie se | URL → /register; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaCrie se |
| 38 | select "Listados recentementePreço: menor primeiroPreço: m" | CAMPO OK | URL → /?sort=price-asc; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 38 | button[button] "Novos lançamentos" | OK | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos; rolagem; DOM mudou; request /api/nfts |
| 29 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à |
| 16 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 39 | a "Aurora Genesis0.50 ETH" → /nfts/nft-1 | OK | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 39 | button[button] "Em alta" | OK | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts | URL → /?tab=alta; rolagem; DOM mudou; request /api/nfts |
| 30 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur |
| 17 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 40 | a "Blue Orbit1.25 ETH" → /nfts/nft-2 | OK | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 40 | select "Listados recentementePreço: menor primeiroPreço: m" | CAMPO OK | URL → /?sort=price-asc; rolagem; DOM mudou; request /api/nfts; valor aceito | — |
| 31 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- |
| 18 | a "Meu perfil" → /profile | OK | URL → /login?redirect=%2Fprofile; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login?redirect=%2Fprofile; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 41 | a "Cyber Koi0.08 ETH" → /nfts/nft-3 | OK | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 41 | a "Aurora Genesis0.50 ETH" → /nfts/nft-1 | OK | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-1; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 32 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 19 | a "Carteiras" → /wallets | OK | URL → /login?redirect=%2Fwallets; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login?redirect=%2Fwallets; rolagem; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 42 | a "One of One12.00 ETH" → /nfts/nft-4 | OK | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 42 | a "Blue Orbit1.25 ETH" → /nfts/nft-2 | OK | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-2; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 33 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 20 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico; req |
| 43 | a "Sold Out Sun0.90 ETH" → /nfts/nft-5 | OK | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 43 | a "Cyber Koi0.08 ETH" → /nfts/nft-3 | OK | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 34 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 21 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 44 | a "Solo Limit0.30 ETH" → /nfts/nft-6 | OK | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 45 | button[button] "Anterior" | **DESABILITADO** | — | — |
| 44 | a "One of One12.00 ETH" → /nfts/nft-4 | OK | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 35 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 22 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 46 | button[button] "Ir para a página 1" | OK | rolagem | rolagem |
| 45 | a "Sold Out Sun0.90 ETH" → /nfts/nft-5 | OK | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 36 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |

### /register (visitante) (chegou em `/register`; 36 visíveis de 36)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 23 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 47 | button[button] "Ir para a página 2" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 46 | a "Solo Limit0.30 ETH" → /nfts/nft-6 | OK | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 47 | button[button] "Anterior" | **DESABILITADO** | — | — |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /register#main; foco → MAIN|main||KurioEntrarCriar contaCrie se |
| 24 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 48 | button[button] "Próxima" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 48 | button[button] "Ir para a página 1" | OK | rolagem | rolagem |
| 9 | a "Entrar" → /login | OK | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 25 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo  |
| 49 | a "Explorar: Lançamentos gênesis de edição limitada" → /?tab=novos#catalogo | OK | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts |
| 49 | button[button] "Ir para a página 2" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 10 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 26 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à  |
| 50 | a "Explorar: Arte digital selecionada e muito mais" → /?collection=Arte+digital# | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 50 | button[button] "Próxima" | OK | URL → /?page=2; rolagem; DOM mudou; request /api/nfts | URL → /?page=2; rolagem; DOM mudou; request /api/nfts |
| 11 | input[email] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 51 | a "Ler artigo: Como funciona a propriedade de NFTs" → /aprenda/como-funciona-a-p | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 27 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à |
| 51 | a "Explorar: Lançamentos gênesis de edição limitada" → /?tab=novos#catalogo | OK | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?tab=novos#catalogo; rolagem; DOM mudou; request /api/nfts |
| 12 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 52 | a "Ler artigo: 10 artistas digitais para acompanhar" → /aprenda/10-artistas-digi | OK | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| |
| 28 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem-vindo à Kur |
| 52 | a "Explorar: Arte digital selecionada e muito mais" → /?collection=Arte+digital# | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 13 | button[submit] "Cadastrar" | OK | DOM mudou | DOM mudou |
| 53 | a "Ler artigo: Raridade, atributos e procedência" → /aprenda/raridade-atributos- | OK | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V |
| 29 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; foco → MAIN|main||Bem- |
| 53 | a "Ler artigo: Como funciona a propriedade de NFTs" → /aprenda/como-funciona-a-p | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 14 | button[button] "Continuar com Google" #social-google | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 54 | a "Ler artigo: Como proteger sua carteira" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 30 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 54 | a "Ler artigo: 10 artistas digitais para acompanhar" → /aprenda/10-artistas-digi | OK | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| |
| 15 | button[button] "Continuar com Facebook" #social-facebook | OK | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r | URL → /; estado local mudou; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; r |
| 31 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 55 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 55 | a "Ler artigo: Raridade, atributos e procedência" → /aprenda/raridade-atributos- | OK | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V |
| 16 | a "Entre" → /login | OK | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p | URL → /login; DOM mudou; foco → MAIN|main||KurioEntrarCriar contaEntre p |
| 32 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 56 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |

### /profile (ana) (chegou em `/profile`; 39 visíveis de 39)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 56 | a "Ler artigo: Como proteger sua carteira" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /profile#main; foco → MAIN|main||Meu perfilDados do perfilCart |
| 57 | a "Meu perfil" → /profile | OK | URL → /login?redirect=%2Fprofile; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c | URL → /login?redirect=%2Fprofile; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c |
| 33 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 57 | input[email] "Assinar newsletter" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 11 | a "Dados do perfil" → /profile | OK (link para a própria rota) | — | — |
| 58 | a "Carteiras" → /wallets | OK | URL → /login?redirect=%2Fwallets; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c | URL → /login?redirect=%2Fwallets; rolagem; DOM mudou; foco → MAIN|main||KurioEntrarCriar c |
| 34 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 58 | button[submit] "Enviar" | OK | DOM mudou | DOM mudou |
| 12 | a "Carteiras" → /wallets | OK | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w | URL → /wallets; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; request /api/w |

### /wallets (ana) (chegou em `/wallets`; 37 visíveis de 37)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 59 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 59 | a "Meu perfil" → /profile | OK | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /wallets#main; foco → MAIN|main||Meu perfilDados do perfilCart |
| 13 | input "" | CAMPO OK | estado local mudou; DOM mudou; request /api/profile; valor aceito | DOM mudou; request /api/profile |
| 60 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 60 | a "Carteiras" → /wallets | OK | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque | URL → /wallets; rolagem; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart; reque |
| 11 | a "Dados do perfil" → /profile | OK | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart | URL → /profile; DOM mudou; foco → MAIN|main||Meu perfilDados do perfilCart |
| 14 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou; request /api/profile |
| 61 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 61 | a "Criadores" → /criadores | OK | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico | URL → /criadores; rolagem; DOM mudou; foco → MAIN|main||CriadoresConheça quem publico |
| 12 | a "Carteiras" → /wallets | OK (link para a própria rota) | — | — |
| 15 | button[submit] "Salvar perfil" | OK | DOM mudou; request /api/profile | DOM mudou; request /api/profile |
| 62 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 62 | a "Aprenda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 13 | button[button] "Desconectar Principal" #wallet-toggle-connection | OK | estado local mudou; DOM mudou; foco → BUTTON||wallet-toggle-connection|Conecta; request /a | estado local mudou; DOM mudou; foco → BUTTON||wallet-toggle-connection|Conecta; request /a |
| 16 | input[file] "" #avatar-file | CAMPO (sem reação visível) | — | — |
| 63 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 63 | a "Central de ajuda" → /aprenda | OK | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; rolagem; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 14 | button[button] "Editar Principal" | OK | DOM mudou | DOM mudou |
| 17 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 64 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |
| 64 | a "Como comprar NFTs" → /aprenda/como-funciona-a-propriedade-de-nfts | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| | URL → /aprenda/como-funciona-a-propriedade-de-nfts; rolagem; DOM mudou; foco → MAIN|main|| |
| 15 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 18 | input[password] "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 65 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts |
| 65 | a "Carteira e segurança" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 16 | input "" | CAMPO OK | DOM mudou; valor aceito | DOM mudou |
| 19 | button[submit] "Alterar senha" | OK | DOM mudou | DOM mudou |
| 66 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts |
| 66 | a "Arte digital" → /?collection=Arte+digital#catalogo | OK | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+digital#catalogo; rolagem; DOM mudou; request /api/nfts |

### /criadores (ana) (chegou em `/criadores`; 42 visíveis de 42)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 17 | button[submit] "Adicionar carteira" | OK | DOM mudou | DOM mudou |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /criadores#main; foco → MAIN|main||CriadoresConheça quem publico |

### /aprenda (ana) (chegou em `/aprenda`; 34 visíveis de 34)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 67 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts |
| 67 | a "Fotografia" → /?collection=Fotografia#catalogo | OK | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Fotografia#catalogo; rolagem; DOM mudou; request /api/nfts |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /aprenda#main; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 11 | a "Ver obras de creator-1" → /nfts/nft-1 | OK | URL → /nfts/nft-1; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-1; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 68 | a "Música" → /?collection=M%C3%BAsica#catalogo | OK | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=M%C3%BAsica#catalogo; rolagem; DOM mudou; request /api/nfts |
| 68 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts |
| 11 | a "Ler artigo: Como funciona a propriedade de NFTs" → /aprenda/como-funciona-a-p | OK | URL → /aprenda/como-funciona-a-propriedade-de-nfts; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-funciona-a-propriedade-de-nfts; DOM mudou; foco → MAIN|main||← Voltar  |
| 12 | a "Ver obras de creator-2" → /nfts/nft-2 | OK | URL → /nfts/nft-2; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap | URL → /nfts/nft-2; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; request /ap |
| 69 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 69 | a "Arte 3D" → /?collection=Arte+3D#catalogo | OK | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Arte+3D#catalogo; rolagem; DOM mudou; request /api/nfts |
| 12 | a "Ler artigo: 10 artistas digitais para acompanhar" → /aprenda/10-artistas-digi | OK | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| | URL → /aprenda/10-artistas-digitais-para-acompanhar; rolagem; DOM mudou; foco → MAIN|main| |
| 13 | a "Ver obras de creator-3" → /nfts/nft-3 | OK | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-3; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 70 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 70 | a "Colecionáveis" → /?collection=Colecion%C3%A1veis#catalogo | OK | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts | URL → /?collection=Colecion%C3%A1veis#catalogo; rolagem; DOM mudou; request /api/nfts |
| 13 | a "Ler artigo: Raridade, atributos e procedência" → /aprenda/raridade-atributos- | OK | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V | URL → /aprenda/raridade-atributos-e-procedencia; rolagem; DOM mudou; foco → MAIN|main||← V |
| 14 | a "Ver obras de creator-4" → /nfts/nft-4 | OK | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-4; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 71 | a "Facebook (abre em nova aba)" → https://www.facebook.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 71 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 14 | a "Ler artigo: Como proteger sua carteira" → /aprenda/como-proteger-sua-carteira | OK | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  | URL → /aprenda/como-proteger-sua-carteira; rolagem; DOM mudou; foco → MAIN|main||← Voltar  |
| 15 | a "Ver obras de creator-5" → /nfts/nft-5 | OK | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-5; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 72 | a "Instagram (abre em nova aba)" → https://www.instagram.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 72 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |

### /aprenda/:slug (ana) (chegou em `/aprenda/como-funciona-a-propriedade-de-nfts`; 31 visíveis de 31)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /aprenda/como-funciona-a-propriedade-de-nfts#main; foco → MAIN|main||← Voltar para A |
| 16 | a "Ver obras de creator-6" → /nfts/nft-6 | OK | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-6; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 73 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 73 | a "X (abre em nova aba)" → https://x.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 11 | a "← Voltar para Aprenda" → /aprenda | OK | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu | URL → /aprenda; DOM mudou; foco → MAIN|main||AprendaDiário da Cunhagem: gu |
| 17 | a "Ver obras de creator-7" → /nfts/nft-7 | OK | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-7; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |

### 404 (ana) (chegou em `/rota-inexistente`; 31 visíveis de 31)

| # | Elemento | Resultado | Efeito (mouse) | Efeito (teclado) |
|---|---|---|---|---|
| 74 | a "LinkedIn (abre em nova aba)" → https://www.linkedin.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 0 | a "Ir para o conteúdo" → #main | OK | — | URL → /rota-inexistente#main; foco → MAIN|main||404Página não encontradaO end |
| 18 | a "Ver obras de creator-8" → /nfts/nft-8 | OK | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-8; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 75 | a "YouTube (abre em nova aba)" → https://www.youtube.com/ | OK | abre nova aba chrome-error://chromewebdata/ | abre nova aba chrome-error://chromewebdata/ |
| 11 | a "Voltar ao início" → / | OK | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea | URL → /; DOM mudou; foco → MAIN|main||Bem-vindo à KurioSeja dono do; request /api/nfts/fea |
| 19 | a "Ver obras de creator-9" → /nfts/nft-9 | OK | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re | URL → /nfts/nft-9; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; re |
| 20 | a "Ver obras de creator-10" → /nfts/nft-10 | OK | URL → /nfts/nft-10; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r | URL → /nfts/nft-10; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r |
| 21 | a "Ver obras de creator-11" → /nfts/nft-11 | OK | URL → /nfts/nft-11; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r | URL → /nfts/nft-11; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r |
| 22 | a "Ver obras de creator-12" → /nfts/nft-12 | OK | URL → /nfts/nft-12; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r | URL → /nfts/nft-12; rolagem; DOM mudou; foco → MAIN|main||Início / Mercado← Voltar ao c; r |