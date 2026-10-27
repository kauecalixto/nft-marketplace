# Proposal

## Why

No detalhe do NFT (contexto Catálogo, `src/catalog/`), o colecionador precisa ser impedido de escolher mais unidades do que a Edição permite, com explicação em texto. O detalhe deve suportar "NFT inexistente, edição indisponível e limite de quantidade" (README/ENUNCIADO §3 "Catálogo e detalhe"). Sem isso, o erro só apareceria no carrinho, tarde demais (§3 "Carrinho": respeitar a disponibilidade por NFT e edição).

## What Changes

- Seletor de quantidade no detalhe do NFT aceita apenas inteiros maiores ou iguais a 1 (§3 Carrinho).
- O aumento de quantidade para no limite da Edição, o botão de aumentar fica desabilitado e a mensagem "Limite de quantidade atingido" aparece (§3 Catálogo e detalhe).
- Edição sem disponibilidade exibe "Edição indisponível" e desabilita "Adicionar ao carrinho" (§3 Catálogo e detalhe; §3 Carrinho).
- Identificador de NFT inexistente exibe "NFT não encontrado" no lugar do seletor (§3 Catálogo e detalhe).

Fora de escopo: pagamento, cupom, eventos `nft.updated` e quantidade já presente no carrinho (contexto Compra).

## Capabilities

### New Capabilities
- `catalogo-limite-quantidade-edicao`: limite de quantidade por Edição no detalhe do NFT, incluindo Edição indisponível e NFT inexistente.

### Modified Capabilities

## Impact

- Código: contexto Catálogo, `src/catalog/` (detalhe do NFT). Nenhum arquivo é alterado por esta change de especificação.
- API: depende de `GET /api/nfts/:id` expor disponibilidade da Edição (§5 "NFTs: listagem... e detalhe por identificador"). Os nomes de campo `edition.available` e `walletLimit` vêm do ADR 0001 da spec manual, não do enunciado.
