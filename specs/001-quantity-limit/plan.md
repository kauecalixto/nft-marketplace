# Implementation Plan: Limite de quantidade por edição

**Branch**: `001-quantity-limit` (nome lógico, sem branch git) | **Date**: 2026-10-21 | **Spec**: [spec.md](spec.md)

**Input**: specs/001-quantity-limit/spec.md. Feature já implementada; o plano é retroativo e descreve o que existe conforme ADR 0001.

## Summary

Limitar a quantidade no detalhe do NFT a min(edition.available, walletLimit), com mensagem em texto, estado de edição indisponível e NFT inexistente. A API mock (MSW) fornece os dados; a UI só aplica o limite.

## Technical Context

**Language/Version**: TypeScript (React, Vite)
**Primary Dependencies**: TanStack Router/Query, Axios, Tailwind, shadcn/ui, MSW (constituição II; versões não conferidas neste plano)
**Storage**: N/A (estado em MSW em memória)
**Testing**: Playwright (tests/e2e/quantity-limit.spec.ts, quantity-extra.spec.ts)
**Target Platform**: navegador (390, 768, 1440 px)
**Project Type**: web-app (frontend com mocks na rede)
**Performance Goals**: não especificado na feature
**Constraints**: sem caminhos de negócio fora do MSW; quantidade inteira
**Scale/Scope**: uma tela (detalhe do NFT), contexto Catálogo (src/catalog/)

## Constitution Check

| Princípio | Resultado |
|---|---|
| I Enunciado é a fonte | Passa com ressalva: `walletLimit` não está no enunciado; registrado como decisão do ADR 0001 e dúvida do Research |
| II Stack usada de verdade | Passa para o escopo (Query, Axios, MSW, Playwright no detalhe) |
| III Mocks só na rede | Passa: limite vem de GET /nfts/:id e POST /cart rejeita com 409 |
| IV Teste primeiro, evidência real | Não verificado neste plano (testes não foram executados aqui) |
| V Integridade de dados | Passa: quantidade inteira >= 1 |

Pós-design: sem novas violações.

## Project Structure

### Documentation (this feature)

```text
specs/001-quantity-limit/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/nft-detail-and-cart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/catalog/   (NftDetailPage.tsx, quantity.ts, types.ts)
src/mocks/     (fixtures.ts, purchase.ts)
tests/e2e/     (quantity-limit.spec.ts, quantity-extra.spec.ts)
```

**Structure Decision**: estrutura existente, sem novos diretórios de código.

## Complexity Tracking

Sem violações a justificar.
