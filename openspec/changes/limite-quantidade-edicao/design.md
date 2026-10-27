# Design

## Context

Contexto Catálogo, `src/catalog/`, detalhe do NFT. Motivação em proposal.md. A decisão técnica já registrada é o ADR 0001 (`docs/semana-5-quantity-limit/ADR-0001-limite-quantidade-edicao.md`); esta change a referencia, não a substitui.

## Goals / Non-Goals

**Goals:**
- Apresentar e aplicar no detalhe o limite informado pela API, com mensagem em texto.

**Non-Goals:**
- Reconciliação via `nft.updated` e quantidade já no carrinho (contexto Compra).

## Decisions

- Limite efetivo `min(edition.available, walletLimit)`, vindo de `GET /api/nfts/:id` (mock MSW). Alternativa rejeitada: limite fixo no front, por violar a regra de não ter caminho alternativo de negócio fora da camada de rede (§6).
- Quantidade é inteiro em estado local do componente, mínimo 1. Estado do detalhe em TanStack Query (§4).

## Risks / Trade-offs

- [Nome `walletLimit` não está no enunciado] -> registrado como decisão do ADR 0001 e dúvida do Research.
- [Disponibilidade pode mudar durante a navegação] -> fora do escopo; coberto por `nft.updated` em outra feature.
