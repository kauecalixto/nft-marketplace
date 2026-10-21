# Bounded contexts

Consistente com `GLOSSARIO.md` (fonte: `docs/ENUNCIADO.md`).

## Catálogo: `src/catalog/`
Termos: NFT, Edição, Favorito. Responsável por listagem/busca, detalhe, disponibilidade e limite de quantidade (`quantity.ts`). Favoritos são apresentados aqui (`src/account/FavoriteButton.tsx`) mas a persistência por usuário vive na conta/mock.

## Compra: `src/purchase/`
Termos: Carrinho, Cotação, Pedido. Responsável por carrinho, cupom, cotação (ETH como string decimal, `eth.ts`), checkout, idempotência e recibo.

## Termo com sentidos diferentes: Edição
- Catálogo: atributo do NFT (tiragem, `edition.total/available`) que pode mudar via `nft.updated`.
- Compra: unidade reservada pelo carrinho, revalidada na cotação e congelada no snapshot do pedido.

## Apoio (fora dos dois contextos do glossário)
`src/account/` (sessão, perfil, carteiras), `src/realtime/` (Socket.IO e reconciliação), `src/mocks/` (camada MSW). Dependência: Compra consome dados de Catálogo via REST (`currentNft` apenas no mock), nunca importando UI do Catálogo.
