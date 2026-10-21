# Glossário de domínio

Fonte: `docs/ENUNCIADO.md` (seções 1–12 do enunciado do desafio). Projeto novo, ainda sem código: as pastas abaixo são **previstas**, não existentes.

## Bounded Context 1: Catálogo
- Pasta prevista: `src/catalog/`
- `NFT` — item colecionável listado e detalhado, identificado de forma estável. Origem: §3 "Detalhes do NFT"; §5 "NFTs: listagem... e detalhe por identificador".
- `Edição` — tiragem do NFT; define a disponibilidade e o limite de quantidade que se pode escolher no detalhe. Origem: §3 Catálogo e detalhe ("edição indisponível e limite de quantidade").
- `Favorito` — marca de interesse do usuário autenticado em um NFT, persistida por usuário. Origem: §3 Catálogo e detalhe ("Favoritos devem persistir para o usuário autenticado").

## Bounded Context 2: Compra
- Pasta prevista: `src/purchase/`
- `Carrinho` — conjunto de itens e quantidades que o colecionador pretende comprar, mantido após refresh. Origem: §3 Carrinho.
- `Cotação` — resposta da API com disponibilidade, desconto, taxa de rede e total; é a referência para finalizar o pedido. Origem: §3 Carrinho ("A cotação da API é a referência"); §5 Cotação.
- `Pedido` — compra enviada com chave de idempotência, nos estados pendente, confirmado ou recusado; confirmado e recusado são terminais. Origem: §3 Pagamento e confirmação; §5 Pedidos; §7.

## Termo com sentidos diferentes: `Edição`
- Catálogo: tiragem do NFT, com disponibilidade e limite máximo de quantidade por NFT. Origem: §3 Catálogo e detalhe.
- Compra: unidade que o carrinho reserva e a cotação revalida; só o que foi comprado (itens e quantidades) sai do carrinho, e o recibo guarda um snapshot imutável. Origem: §3 Carrinho e Pagamento ("disponibilidade por NFT e edição"; "O recibo deve reproduzir o snapshot do pedido").
- Diferença: no Catálogo a edição é um atributo do NFT que pode mudar (preço e disponibilidade via `nft.updated`); na Compra ela vira um valor congelado no pedido, que alterações posteriores do catálogo não modificam.

## Pendências
- O enunciado não define "Edição" como entidade com campos. A modelagem (ex.: `tirada/limite`) é decisão de design e será registrada no ADR, não aqui.
