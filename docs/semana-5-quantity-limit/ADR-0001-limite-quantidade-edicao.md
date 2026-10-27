# ADR 0001 — Limite de quantidade validado no cliente a partir da disponibilidade da API
- Status: Proposta
- Contexto: contexto Catálogo (`src/catalog/`), detalhe do NFT.
- Fontes: `RESEARCH.md` R-01 a R-05; `docs/ENUNCIADO.md` §3, §4, §6.

## Problema
O colecionador precisa ser impedido de pedir mais unidades do que a edição permite, com explicação acessível, sem duplicar regra de negócio fora da camada de rede.

## Decisão
- A API (mock MSW) devolve em `GET /api/nfts/:id` os campos `edition.available` e `walletLimit`. O limite efetivo é `min(edition.available, walletLimit)`.
- A interface só apresenta e aplica esse limite (controles desabilitados e mensagem em texto); a API continua sendo a referência e rejeita quantidade acima do limite com conflito de disponibilidade em `POST /api/cart`.
- O estado do detalhe fica em TanStack Query; nenhuma resposta fictícia fica no componente ou no Axios.
- Quantidade é inteiro em estado local do componente, com mínimo 1.

## Alternativas consideradas
- Validar só no servidor: rejeitada, pois o erro apareceria tarde (é a dor do Research).
- Limite fixo no front: rejeitada, pois viola "sem caminhos alternativos de negócio" (§6) e a disponibilidade é dado da API.

## Consequências positivas
- Regra única na API, UI previsível, testável por MSW e Playwright.

## Trade-offs e riscos
- O nome `walletLimit` é decisão deste ADR; o enunciado não o define (dúvida aberta do Research).
- Disponibilidade pode mudar durante a navegação; a reconciliação via `nft.updated` fica fora desta feature.

## Requisitos relacionados
EARS-01 a EARS-05 em `docs/semana-5-quantity-limit/quantity-limit-spec.md`.
